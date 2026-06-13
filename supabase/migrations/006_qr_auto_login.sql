-- ============================================================
-- NNFA Database Migration: 006 - QR Auto Login
-- Lets members auto-login with just their member_id
-- ============================================================

CREATE OR REPLACE FUNCTION public.member_login_qr_public(
  p_member_id TEXT
)
RETURNS public.members AS $$
DECLARE
  member_record public.members;
BEGIN
  SELECT *
  INTO member_record
  FROM public.members
  WHERE member_id = p_member_id
  LIMIT 1;

  RETURN member_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.member_login_qr_public(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.member_login_qr_public IS 'Returns a full member record for QR auto-login using only member_id';
