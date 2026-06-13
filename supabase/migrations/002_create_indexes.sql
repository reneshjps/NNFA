-- ============================================================
-- NNFA Database Migration: 002 - Create Indexes
-- Performance indexes for 50,000+ member scalability
-- ============================================================

-- Members table indexes
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_mobile ON public.members(mobile);
CREATE INDEX IF NOT EXISTS idx_members_district ON public.members(district);
CREATE INDEX IF NOT EXISTS idx_members_village ON public.members(village);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_designation ON public.members(designation);
CREATE INDEX IF NOT EXISTS idx_members_valid_until ON public.members(valid_until);
CREATE INDEX IF NOT EXISTS idx_members_joining_date ON public.members(joining_date);

-- Trigram index for fuzzy name search (requires pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_members_name_trgm ON public.members USING GIN (name gin_trgm_ops);

-- Composite index for member login (mobile + dob)
CREATE INDEX IF NOT EXISTS idx_members_mobile_dob ON public.members(mobile, dob);

-- Renewals table indexes
CREATE INDEX IF NOT EXISTS idx_renewals_member_id ON public.renewals(member_id);
CREATE INDEX IF NOT EXISTS idx_renewals_renewed_on ON public.renewals(renewed_on);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- Notifications index
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
