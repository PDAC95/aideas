-- =============================================================================
-- Phase 26: Catalog Data Model
-- NEW TABLE: functional_areas
-- Purpose: Top-level taxonomy for the scenario-first catalog. 8 fixed areas
--          (Ventas, Marketing, Atencion al Cliente, Documentos, Productividad,
--          Reportes, Agentes IA, Integraciones & Seguridad) seeded by Phase 27.
--          Powers the public funnel (Phase 29 area landing pages) and groups
--          scenarios in the admin tooling.
--
-- Strategy: Additive — no changes to automation_templates. Bilingual via
--           separate label_en/label_es + description_en/description_es columns
--           (CONTEXT.md default; matches existing app's next-intl two-locale
--           pattern, indexable, simplest queries). Slug is globally unique to
--           power /catalog/<area-slug> routes in Phase 29.
--
-- RLS: Anonymous + authenticated SELECT on is_active = true rows so public
--      SSR (Phase 29) and authenticated admin reads both work. Writes are
--      service_role only — admin CRUD UI is a future phase, NOT Phase 26.
--
-- Idempotency: Fully re-applicable. CREATE TABLE IF NOT EXISTS, DROP POLICY
--              IF EXISTS before each CREATE POLICY, CREATE INDEX IF NOT EXISTS,
--              DROP TRIGGER IF EXISTS before CREATE TRIGGER. No seed rows —
--              Phase 27 will seed the 8 areas.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.functional_areas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(60)  UNIQUE NOT NULL,
    label_en        VARCHAR(120) NOT NULL,
    label_es        VARCHAR(120) NOT NULL,
    description_en  TEXT,
    description_es  TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.functional_areas IS
    'Top-level scenario-catalog taxonomy. 8 fixed areas seeded by Phase 27; consumed by Phase 29 public catalog navigation.';

-- ---------------------------------------------------------------------------
-- Section 2: RLS — anon + authenticated read active rows; writes service_role only
-- ---------------------------------------------------------------------------
ALTER TABLE public.functional_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "functional_areas_select_active_anon" ON public.functional_areas;
CREATE POLICY "functional_areas_select_active_anon"
    ON public.functional_areas
    FOR SELECT
    TO anon
    USING (is_active = true);

DROP POLICY IF EXISTS "functional_areas_select_active_authenticated" ON public.functional_areas;
CREATE POLICY "functional_areas_select_active_authenticated"
    ON public.functional_areas
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- INTENTIONAL: no INSERT/UPDATE/DELETE policies. service_role bypasses RLS.
-- Admin CRUD UI is a future phase; for now writes happen via service_role only.

-- ---------------------------------------------------------------------------
-- Section 3: Indexes
-- ---------------------------------------------------------------------------
-- Supports the default public-funnel listing order (sort_order asc, slug as
-- deterministic tiebreaker) — Phase 29 consumes this exact ordering.
CREATE INDEX IF NOT EXISTS idx_functional_areas_sort
    ON public.functional_areas (sort_order, slug);

-- Partial index for active-only reads (the only read path exposed via RLS).
CREATE INDEX IF NOT EXISTS idx_functional_areas_active
    ON public.functional_areas (is_active)
    WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- Section 4: updated_at trigger
-- ---------------------------------------------------------------------------
-- Reuses the public.update_updated_at_column() function defined in
-- 20260305000001_core_identity.sql. Drop-then-create for idempotent re-runs.
DROP TRIGGER IF EXISTS functional_areas_updated_at ON public.functional_areas;
CREATE TRIGGER functional_areas_updated_at
    BEFORE UPDATE ON public.functional_areas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- End of functional_areas migration
-- =============================================================================
