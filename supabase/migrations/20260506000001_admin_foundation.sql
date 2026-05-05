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
