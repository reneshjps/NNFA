-- ============================================================
-- NNFA Database Migration: 004 - Row Level Security (RLS)
-- Comprehensive security policies for all tables
-- ============================================================

-- ============================================================
-- Helper function: Check if current user is an admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Helper function: Check if current user is a super admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ADMINS TABLE RLS
-- ============================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Super admins can see all admin records
CREATE POLICY "super_admin_select_all_admins"
  ON public.admins FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR id = auth.uid()  -- Admins can see their own record
  );

-- Only super admins can create admin accounts
CREATE POLICY "super_admin_insert_admins"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

-- Super admins can update any admin; admins can update their own
CREATE POLICY "admin_update_admins"
  ON public.admins FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR id = auth.uid()
  );

-- Only super admins can delete admin accounts
CREATE POLICY "super_admin_delete_admins"
  ON public.admins FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================
-- MEMBERS TABLE RLS
-- ============================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Admins can see all members
CREATE POLICY "admin_select_all_members"
  ON public.members FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "anon_select_member_for_verification" ON public.members;

-- Admins can add members
CREATE POLICY "admin_insert_members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can edit members
CREATE POLICY "admin_update_members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only super admins can delete members
CREATE POLICY "super_admin_delete_members"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================
-- RENEWALS TABLE RLS
-- ============================================================
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

-- Admins can see all renewals
CREATE POLICY "admin_select_all_renewals"
  ON public.renewals FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can create renewals
CREATE POLICY "admin_insert_renewals"
  ON public.renewals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update renewals
CREATE POLICY "admin_update_renewals"
  ON public.renewals FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- EVENTS TABLE RLS
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view events
CREATE POLICY "authenticated_select_events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anonymous read for public event display
CREATE POLICY "anon_select_events"
  ON public.events FOR SELECT
  TO anon
  USING (true);

-- Only admins can create/update/delete events
CREATE POLICY "admin_insert_events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- NOTIFICATIONS TABLE RLS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view notifications
CREATE POLICY "authenticated_select_notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous can also read notifications
CREATE POLICY "anon_select_notifications"
  ON public.notifications FOR SELECT
  TO anon
  USING (true);

-- Only admins can manage notifications
CREATE POLICY "admin_insert_notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_delete_notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ACTIVITY LOGS TABLE RLS
-- ============================================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view activity logs
CREATE POLICY "super_admin_select_activity_logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- All admins can insert activity logs (auto-logging)
CREATE POLICY "admin_insert_activity_logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());
