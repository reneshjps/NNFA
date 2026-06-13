-- ============================================================
-- NNFA Database Migration: 008 - Create Admin RPC
-- Allows Super Admins to create new admins without Edge Functions.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_admin_account(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_role TEXT
) RETURNS public.admins AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
  v_admin_record public.admins;
BEGIN
  -- 1. Ensure caller is an active super_admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can create new admin accounts.';
  END IF;

  -- 2. Validate input
  IF p_email IS NULL OR trim(p_email) = '' OR p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Valid email and password (min 6 chars) are required.';
  END IF;

  -- 3. Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'An account with this email already exists.';
  END IF;

  -- 4. Generate UUID and Hash password
  v_user_id := gen_random_uuid();
  v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- 5. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 
    'authenticated', 
    'authenticated', 
    p_email, 
    v_encrypted_pw,
    now(), 
    '{"provider":"email","providers":["email"]}', 
    json_build_object('name', p_name, 'role', p_role),
    now(), 
    now()
  );

  -- 6. Insert into auth.identities
  INSERT INTO auth.identities (
    id, 
    user_id, 
    provider_id,
    identity_data, 
    provider, 
    last_sign_in_at, 
    created_at, 
    updated_at
  ) VALUES (
    gen_random_uuid(), 
    v_user_id, 
    v_user_id::text,
    format('{"sub":"%s","email":"%s"}', v_user_id::text, p_email)::jsonb, 
    'email', 
    now(), 
    now(), 
    now()
  );

  -- 7. Insert into public.admins
  INSERT INTO public.admins (id, name, email, phone, role, status)
  VALUES (v_user_id, p_name, p_email, p_phone, p_role, 'active')
  RETURNING * INTO v_admin_record;

  RETURN v_admin_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_account(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
