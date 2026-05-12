-- =============================================================================
-- Phase 21: Clients Admin
-- NEW TABLE: organization_notes
-- Purpose: Internal staff-only notes attached to a customer organization. Backs
--          the Notes tab on /admin/clients/[id] (Plans 21-02 reads, 21-03 writes).
--          Notes are NEVER visible to customer users — RLS enforces this by
--          gating ALL verbs (SELECT/INSERT/UPDATE/DELETE) on
--          public.is_platform_staff((SELECT auth.uid())). No customer-facing
--          policy exists on this table at all.
--
-- Strategy: Mirror the admin RLS posture established by
--           20260506000001_admin_foundation.sql for `organizations` (one policy
--           per verb, USING + WITH CHECK gated by is_platform_staff). Two
--           supporting indexes — one for the per-org listing in date order
--           (21-02 detail page Notes tab), and one for any future author-scoped
--           views. updated_at is kept fresh by the existing
--           public.update_updated_at_column() trigger function from
--           20260305000001_core_identity.sql.
--
-- Idempotency: Fully re-applicable. CREATE TABLE IF NOT EXISTS, CREATE INDEX
--              IF NOT EXISTS, DROP POLICY IF EXISTS before each CREATE POLICY,
--              and DROP TRIGGER IF EXISTS before the CREATE TRIGGER. No seed
--              rows — production starts empty.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_notes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    body            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.organization_notes IS
    'Internal staff-only notes attached to a customer organization. Visible only to platform_staff via RLS; never to organization members.';

-- ---------------------------------------------------------------------------
-- Section 2: RLS — platform_staff only
-- ---------------------------------------------------------------------------
ALTER TABLE public.organization_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_notes_admin_select" ON public.organization_notes;
CREATE POLICY "organization_notes_admin_select"
    ON public.organization_notes
    FOR SELECT
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_notes_admin_insert" ON public.organization_notes;
CREATE POLICY "organization_notes_admin_insert"
    ON public.organization_notes
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_notes_admin_update" ON public.organization_notes;
CREATE POLICY "organization_notes_admin_update"
    ON public.organization_notes
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "organization_notes_admin_delete" ON public.organization_notes;
CREATE POLICY "organization_notes_admin_delete"
    ON public.organization_notes
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- Section 3: Indexes
-- ---------------------------------------------------------------------------
-- Per-org listing in reverse-chronological order (21-02 Notes tab default sort).
CREATE INDEX IF NOT EXISTS idx_organization_notes_org_id
    ON public.organization_notes (organization_id, created_at DESC);

-- Supports any future author-scoped views (e.g. "all notes by this staff member").
CREATE INDEX IF NOT EXISTS idx_organization_notes_author
    ON public.organization_notes (author_id);

-- ---------------------------------------------------------------------------
-- Section 4: updated_at trigger
-- ---------------------------------------------------------------------------
-- Reuses the public.update_updated_at_column() function defined in
-- 20260305000001_core_identity.sql. Drop-then-create for idempotent re-runs.
DROP TRIGGER IF EXISTS organization_notes_updated_at ON public.organization_notes;
CREATE TRIGGER organization_notes_updated_at
    BEFORE UPDATE ON public.organization_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- End of organization_notes migration
-- =============================================================================
