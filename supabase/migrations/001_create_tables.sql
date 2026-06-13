-- ============================================================
-- NNFA Database Migration: 001 - Create Tables
-- Narayanasamy Naidu Farmers Association Management System
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search on names

-- ============================================================
-- 1. ADMINS TABLE
-- Stores admin/super_admin profiles linked to auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admins IS 'Admin and Super Admin profiles for the NNFA management system';

-- ============================================================
-- 2. MEMBERS TABLE
-- Core member data — designed for 50,000+ records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  occupation TEXT,
  village TEXT,
  district TEXT,
  taluk TEXT,
  address TEXT,
  mobile TEXT UNIQUE NOT NULL,
  dob DATE,
  aadhar_number TEXT,
  vehicle_number TEXT,
  designation TEXT DEFAULT 'Member',
  registration_number TEXT,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  blood_group TEXT,
  photo_url TEXT,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.members IS 'Association members — 7000+ current, scalable to 50000+';

-- ============================================================
-- 3. RENEWALS TABLE
-- Membership renewal history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  renewed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  renewal_type TEXT NOT NULL CHECK (renewal_type IN ('1_year', '3_years', 'lifetime')),
  amount NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.renewals IS 'Tracks membership renewal history';

-- ============================================================
-- 4. EVENTS TABLE
-- Association events and meetings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.events IS 'Association events, meetings, and gatherings';

-- ============================================================
-- 5. NOTIFICATIONS TABLE
-- Announcements, reminders, meeting notices
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'expiry_reminder', 'meeting')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'System-wide announcements and notifications';

-- ============================================================
-- 6. ACTIVITY LOGS TABLE
-- Audit trail of admin actions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.activity_logs IS 'Audit trail of all admin actions';
