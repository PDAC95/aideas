-- =============================================================================
-- Admin Foundation Migration
-- Phase 17: Admin Foundation (v1.2)
-- Purpose: Establish the platform-staff identity layer + RLS bypass that every
--          admin capability (Phases 18-22) builds on. Without this migration,
--          no admin server action or page can read or mutate cross-org data
--          because RLS scopes everything to the caller's organization.
--
-- Strategy: Install the cross-org bypass via `is_platform_staff(auth.uid())`
--           rather than a separate "service-role-as-admin" pattern, so admin
--           code can use the normal authenticated Supabase client and still
--           see / mutate everything across all tenants.
--
-- Idempotency: This migration is fully re-applicable. CREATE TABLE IF NOT
--              EXISTS, CREATE OR REPLACE FUNCTION, DROP POLICY IF EXISTS
--              before each CREATE POLICY, and INSERT ... ON CONFLICT
--              DO NOTHING for the seed.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: platform_staff table
-- ---------------------------------------------------------------------------
-- Two roles seeded for future use; both behave identically in v1.2 except
-- that staff-management (writes to platform_staff itself) is reserved for
-- super_admin. There is no UI for staff management in v1.2 — that is a
-- deferred capability (see 17-CONTEXT.md "Deferred Ideas").

CREATE TABLE IF NOT EXISTS public.platform_staff (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_staff ENABLE ROW LEVEL SECURITY;

-- SELECT for staff themselves so client code can detect "am I staff?" without
-- needing the service role. Writes (INSERT/UPDATE/DELETE) are deliberately
-- service_role only — staff invitation UI is deferred.
DROP POLICY IF EXISTS "platform_staff_select_self" ON public.platform_staff;
CREATE POLICY "platform_staff_select_self"
    ON public.platform_staff
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_platform_staff_role ON public.platform_staff (role);

-- ---------------------------------------------------------------------------
-- Section 2: Helper functions (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER so callers without RLS access to platform_staff can still
-- check membership. SET search_path = '' to prevent schema-hijack attacks.
-- STABLE so the planner can hoist these out of per-row evaluation.

CREATE OR REPLACE FUNCTION public.is_platform_staff(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.platform_staff WHERE user_id = uid
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.platform_staff
        WHERE user_id = uid AND role = 'super_admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Section 3: Seed first super_admin (idempotent + safe-no-op)
-- ---------------------------------------------------------------------------
-- If pdmckinster@gmail.com exists in auth.users, promote them to super_admin.
-- If not, emit a NOTICE and continue — the migration must succeed even on
-- a fresh database where the user has not signed up yet.

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'pdmckinster@gmail.com' LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'platform_staff seed: pdmckinster@gmail.com not found in auth.users — skipping. Re-run this migration after the user signs up, or insert manually.';
    ELSE
        INSERT INTO public.platform_staff (user_id, role)
        VALUES (v_user_id, 'super_admin')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- Section 4: Admin RLS extensions on business tables
-- =============================================================================
-- This is ADDITIVE. PostgreSQL RLS combines policies for the same command with
-- OR — any matching policy permits access. The existing org-scoped policies
-- on these tables are NOT touched; clients keep their access exactly as before.
-- Admin staff get an additional path through `is_platform_staff(auth.uid())`.
--
-- Mutable tables (9): full SELECT/INSERT/UPDATE/DELETE for staff.
-- Immutable tables (2): SELECT only — `automation_executions` and
-- `chat_messages` retain their no-INSERT/UPDATE/DELETE-for-authenticated-users
-- posture for everyone. If admin needs to send "AIDEAS-side" chat messages
-- in the future, that's a service_role write (consistent with current arch).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- organizations (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "organizations_admin_select" ON public.organizations;
CREATE POLICY "organizations_admin_select"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organizations_admin_insert" ON public.organizations;
CREATE POLICY "organizations_admin_insert"
    ON public.organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organizations_admin_update" ON public.organizations;
CREATE POLICY "organizations_admin_update"
    ON public.organizations
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organizations_admin_delete" ON public.organizations;
CREATE POLICY "organizations_admin_delete"
    ON public.organizations
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- profiles (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "profiles_admin_select"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
CREATE POLICY "profiles_admin_delete"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- organization_members (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "organization_members_admin_select" ON public.organization_members;
CREATE POLICY "organization_members_admin_select"
    ON public.organization_members
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_members_admin_insert" ON public.organization_members;
CREATE POLICY "organization_members_admin_insert"
    ON public.organization_members
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_members_admin_update" ON public.organization_members;
CREATE POLICY "organization_members_admin_update"
    ON public.organization_members
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_members_admin_delete" ON public.organization_members;
CREATE POLICY "organization_members_admin_delete"
    ON public.organization_members
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- automation_templates (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "automation_templates_admin_select" ON public.automation_templates;
CREATE POLICY "automation_templates_admin_select"
    ON public.automation_templates
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_templates_admin_insert" ON public.automation_templates;
CREATE POLICY "automation_templates_admin_insert"
    ON public.automation_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_templates_admin_update" ON public.automation_templates;
CREATE POLICY "automation_templates_admin_update"
    ON public.automation_templates
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_templates_admin_delete" ON public.automation_templates;
CREATE POLICY "automation_templates_admin_delete"
    ON public.automation_templates
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- automations (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "automations_admin_select" ON public.automations;
CREATE POLICY "automations_admin_select"
    ON public.automations
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automations_admin_insert" ON public.automations;
CREATE POLICY "automations_admin_insert"
    ON public.automations
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automations_admin_update" ON public.automations;
CREATE POLICY "automations_admin_update"
    ON public.automations
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automations_admin_delete" ON public.automations;
CREATE POLICY "automations_admin_delete"
    ON public.automations
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- automation_requests (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "automation_requests_admin_select" ON public.automation_requests;
CREATE POLICY "automation_requests_admin_select"
    ON public.automation_requests
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_requests_admin_insert" ON public.automation_requests;
CREATE POLICY "automation_requests_admin_insert"
    ON public.automation_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_requests_admin_update" ON public.automation_requests;
CREATE POLICY "automation_requests_admin_update"
    ON public.automation_requests
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "automation_requests_admin_delete" ON public.automation_requests;
CREATE POLICY "automation_requests_admin_delete"
    ON public.automation_requests
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- subscriptions (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "subscriptions_admin_select" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_select"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "subscriptions_admin_insert" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_insert"
    ON public.subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "subscriptions_admin_update" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_update"
    ON public.subscriptions
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "subscriptions_admin_delete" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_delete"
    ON public.subscriptions
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- notifications (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
CREATE POLICY "notifications_admin_select"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
CREATE POLICY "notifications_admin_update"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "notifications_admin_delete" ON public.notifications;
CREATE POLICY "notifications_admin_delete"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- invitations (mutable)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "invitations_admin_select" ON public.invitations;
CREATE POLICY "invitations_admin_select"
    ON public.invitations
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "invitations_admin_insert" ON public.invitations;
CREATE POLICY "invitations_admin_insert"
    ON public.invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "invitations_admin_update" ON public.invitations;
CREATE POLICY "invitations_admin_update"
    ON public.invitations
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "invitations_admin_delete" ON public.invitations;
CREATE POLICY "invitations_admin_delete"
    ON public.invitations
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- automation_executions (immutable — SELECT only)
-- ---------------------------------------------------------------------------
-- Execution log is append-only by design. Admins can read across orgs but
-- cannot insert, update, or delete execution rows. Soft-delete is a deferred
-- option if the need ever arises.
DROP POLICY IF EXISTS "automation_executions_admin_select" ON public.automation_executions;
CREATE POLICY "automation_executions_admin_select"
    ON public.automation_executions
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- chat_messages (immutable — SELECT only)
-- ---------------------------------------------------------------------------
-- The existing `chat_messages_insert_clients` policy constrains writes to
-- sender_type = 'client'. We deliberately do NOT add an admin INSERT policy:
-- if AIDEAS staff ever need to post "AIDEAS-side" messages, that would be a
-- service_role write, consistent with current architecture.
DROP POLICY IF EXISTS "chat_messages_admin_select" ON public.chat_messages;
CREATE POLICY "chat_messages_admin_select"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- =============================================================================
-- End of admin foundation migration
-- =============================================================================
