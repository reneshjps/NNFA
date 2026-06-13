-- ============================================================
-- NNFA Database Migration: 003 - Helper Functions
-- Auto member ID generation, timestamp triggers, status updates
-- ============================================================

-- ============================================================
-- 1. Auto-generate member_id (NNFA-0001, NNFA-0002, etc.)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS TEXT AS $$
DECLARE
  last_num INTEGER;
  new_id TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('nnfa_member_id_sequence'));

  -- Get the highest numeric portion of existing member_ids
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(member_id FROM 'NNFA-(\d+)') AS INTEGER)),
    0
  ) INTO last_num
  FROM public.members;

  -- Generate next ID with zero-padding
  new_id := 'NNFA-' || LPAD((last_num + 1)::TEXT, 4, '0');

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_member_id IS 'Auto-generates the next NNFA-XXXX member ID';

-- Set member_id automatically when imports/forms leave it blank.
CREATE OR REPLACE FUNCTION public.set_member_id_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id IS NULL OR btrim(NEW.member_id) = '' THEN
    NEW.member_id := public.generate_member_id();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_members_member_id ON public.members;
CREATE TRIGGER trg_members_member_id
  BEFORE INSERT ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_id_before_insert();

-- ============================================================
-- 2. Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to members table
DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. Auto-expire members whose valid_until has passed
-- Call this via a Supabase Edge Function or pg_cron
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_memberships()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.members
  SET status = 'expired'
  WHERE valid_until < CURRENT_DATE
    AND status = 'active';

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.expire_memberships IS 'Marks members as expired when valid_until date has passed';

-- ============================================================
-- 4. Get dashboard statistics
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  SELECT json_build_object(
    'total_members', (SELECT COUNT(*) FROM public.members),
    'active_members', (SELECT COUNT(*) FROM public.members WHERE status = 'active'),
    'expired_members', (SELECT COUNT(*) FROM public.members WHERE status = 'expired'),
    'new_this_month', (SELECT COUNT(*) FROM public.members WHERE joining_date >= date_trunc('month', CURRENT_DATE)),
    'district_stats', (
      SELECT json_agg(row_to_json(d))
      FROM (
        SELECT district, COUNT(*) as count
        FROM public.members
        WHERE district IS NOT NULL
        GROUP BY district
        ORDER BY count DESC
        LIMIT 10
      ) d
    ),
    'monthly_growth', (
      SELECT json_agg(row_to_json(m))
      FROM (
        SELECT
          to_char(joining_date, 'Mon') as month,
          EXTRACT(MONTH FROM joining_date) as month_num,
          COUNT(*) as count
        FROM public.members
        WHERE joining_date >= date_trunc('year', CURRENT_DATE)
        GROUP BY to_char(joining_date, 'Mon'), EXTRACT(MONTH FROM joining_date)
        ORDER BY month_num
      ) m
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_dashboard_stats IS 'Returns aggregated dashboard statistics';

-- ============================================================
-- 5. Search members with pagination
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_members(
  search_query TEXT DEFAULT '',
  filter_district TEXT DEFAULT '',
  filter_status TEXT DEFAULT '',
  filter_designation TEXT DEFAULT '',
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  sort_by TEXT DEFAULT 'created_at',
  sort_dir TEXT DEFAULT 'desc'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  offset_val INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  offset_val := (page_num - 1) * page_size;

  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM public.members m
  WHERE
    (search_query = '' OR
      m.name ILIKE '%' || search_query || '%' OR
      m.member_id ILIKE '%' || search_query || '%' OR
      m.village ILIKE '%' || search_query || '%' OR
      m.mobile ILIKE '%' || search_query || '%' OR
      m.district ILIKE '%' || search_query || '%'
    )
    AND (filter_district = '' OR m.district = filter_district)
    AND (filter_status = '' OR m.status = filter_status)
    AND (filter_designation = '' OR m.designation = filter_designation);

  -- Get paginated results
  SELECT json_build_object(
    'data', COALESCE((
      SELECT json_agg(row_to_json(r))
      FROM (
        SELECT m.*
        FROM public.members m
        WHERE
          (search_query = '' OR
            m.name ILIKE '%' || search_query || '%' OR
            m.member_id ILIKE '%' || search_query || '%' OR
            m.village ILIKE '%' || search_query || '%' OR
            m.mobile ILIKE '%' || search_query || '%' OR
            m.district ILIKE '%' || search_query || '%'
          )
          AND (filter_district = '' OR m.district = filter_district)
          AND (filter_status = '' OR m.status = filter_status)
          AND (filter_designation = '' OR m.designation = filter_designation)
        ORDER BY
          CASE WHEN sort_by = 'name' AND sort_dir = 'asc' THEN m.name END ASC,
          CASE WHEN sort_by = 'name' AND sort_dir = 'desc' THEN m.name END DESC,
          CASE WHEN sort_by = 'member_id' AND sort_dir = 'asc' THEN m.member_id END ASC,
          CASE WHEN sort_by = 'member_id' AND sort_dir = 'desc' THEN m.member_id END DESC,
          CASE WHEN sort_by = 'created_at' AND sort_dir = 'asc' THEN m.created_at END ASC,
          CASE WHEN sort_by = 'created_at' AND sort_dir = 'desc' THEN m.created_at END DESC,
          CASE WHEN sort_by = 'joining_date' AND sort_dir = 'asc' THEN m.joining_date END ASC,
          CASE WHEN sort_by = 'joining_date' AND sort_dir = 'desc' THEN m.joining_date END DESC,
          m.created_at DESC
        LIMIT page_size
        OFFSET offset_val
      ) r
    ), '[]'::json),
    'total', total_count,
    'page', page_num,
    'page_size', page_size,
    'total_pages', CEIL(total_count::FLOAT / page_size)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.search_members IS 'Server-side search with pagination, filters, and sorting';

-- ============================================================
-- 6. Public QR verification payload
-- Returns only the fields needed on the public verification page.
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_member_public(p_member_id TEXT)
RETURNS TABLE (
  member_id TEXT,
  name TEXT,
  district TEXT,
  village TEXT,
  designation TEXT,
  status TEXT,
  valid_until DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.member_id,
    m.name,
    m.district,
    m.village,
    m.designation,
    m.status,
    m.valid_until
  FROM public.members m
  WHERE m.member_id = p_member_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.verify_member_public(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.verify_member_public IS 'Returns limited public fields for QR membership verification';

-- ============================================================
-- 7. Member portal login
-- Lets members authenticate with mobile + DOB without exposing the members table.
-- ============================================================
CREATE OR REPLACE FUNCTION public.member_login_public(
  p_mobile TEXT,
  p_dob DATE
)
RETURNS public.members AS $$
DECLARE
  member_record public.members;
BEGIN
  SELECT *
  INTO member_record
  FROM public.members
  WHERE mobile = p_mobile
    AND dob = p_dob
  LIMIT 1;

  RETURN member_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.member_login_public(TEXT, DATE) TO anon, authenticated;

COMMENT ON FUNCTION public.member_login_public IS 'Returns a member record only when mobile and date of birth match';
