-- ============================================================
-- NNFA Database Migration: 006 - Seed Super Admin
-- Creates the first super admin account
-- 
-- IMPORTANT: Run this AFTER creating a user in Supabase Auth
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" > Create a user with your email & password
-- 3. Copy the UUID of the created user
-- 4. Replace 'YOUR_AUTH_USER_UUID' below with that UUID
-- 5. Run this SQL
-- ============================================================

-- Replace the UUID and details below with your actual data
INSERT INTO public.admins (id, name, email, phone, role, status)
VALUES (
  'YOUR_AUTH_USER_UUID'::uuid,  -- Replace with actual auth.users UUID
  'Super Admin',                 -- Replace with your name
  'YOUR_EMAIL@example.com',      -- Replace with your email
  'YOUR_PHONE_NUMBER',           -- Replace with your phone
  'super_admin',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  status = 'active';
