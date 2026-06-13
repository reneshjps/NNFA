-- ============================================================
-- NNFA Database Migration: 007 - Membership Renewal RPC
-- Keeps renewal insert and member validity update transactional.
-- ============================================================

CREATE OR REPLACE FUNCTION public.renew_member(
  p_member_uuid UUID,
  p_renewal_type TEXT,
  p_amount NUMERIC DEFAULT NULL
)
RETURNS public.renewals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record public.members;
  renewal_record public.renewals;
  base_date DATE;
  new_valid_until DATE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only active administrators can renew memberships';
  END IF;

  IF p_renewal_type NOT IN ('1_year', '3_years', 'lifetime') THEN
    RAISE EXCEPTION 'Invalid renewal type: %', p_renewal_type;
  END IF;

  SELECT *
  INTO member_record
  FROM public.members
  WHERE id = p_member_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  base_date := GREATEST(COALESCE(member_record.valid_until, CURRENT_DATE), CURRENT_DATE);

  new_valid_until := CASE p_renewal_type
    WHEN '1_year' THEN (base_date + INTERVAL '1 year')::DATE
    WHEN '3_years' THEN (base_date + INTERVAL '3 years')::DATE
    WHEN 'lifetime' THEN DATE '9999-12-31'
  END;

  INSERT INTO public.renewals (
    member_id,
    renewed_on,
    valid_until,
    renewal_type,
    amount
  )
  VALUES (
    p_member_uuid,
    CURRENT_DATE,
    new_valid_until,
    p_renewal_type,
    p_amount
  )
  RETURNING * INTO renewal_record;

  UPDATE public.members
  SET
    valid_until = new_valid_until,
    status = 'active',
    updated_at = now()
  WHERE id = p_member_uuid;

  RETURN renewal_record;
END;
$$;

GRANT EXECUTE ON FUNCTION public.renew_member(UUID, TEXT, NUMERIC) TO authenticated;
