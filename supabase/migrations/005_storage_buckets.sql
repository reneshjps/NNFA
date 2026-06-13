-- ============================================================
-- NNFA Database Migration: 005 - Storage Buckets
-- Supabase Storage for photos, signatures, and documents
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('member-photos', 'member-photos', true, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('member-signatures', 'member-signatures', true, 2097152, -- 2MB
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, -- 10MB
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- Member Photos: Public read, admin upload
CREATE POLICY "public_read_member_photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'member-photos');

CREATE POLICY "admin_upload_member_photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'member-photos'
    AND public.is_admin()
  );

CREATE POLICY "admin_update_member_photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'member-photos'
    AND public.is_admin()
  );

CREATE POLICY "admin_delete_member_photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'member-photos'
    AND public.is_admin()
  );

-- Member Signatures: Public read, admin upload
CREATE POLICY "public_read_member_signatures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'member-signatures');

CREATE POLICY "admin_upload_member_signatures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'member-signatures'
    AND public.is_admin()
  );

CREATE POLICY "admin_update_member_signatures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'member-signatures'
    AND public.is_admin()
  );

CREATE POLICY "admin_delete_member_signatures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'member-signatures'
    AND public.is_admin()
  );

-- Documents: Admin-only access
CREATE POLICY "admin_read_documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );

CREATE POLICY "admin_upload_documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.is_admin()
  );

CREATE POLICY "admin_delete_documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );
