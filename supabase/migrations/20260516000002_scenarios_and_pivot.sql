-- =============================================================================
-- Phase 26: Catalog Data Model
-- NEW TABLES: scenarios, scenario_templates
-- Purpose: Scenarios are the pain-language entry points the public funnel
--          surfaces (Phase 29 detail pages, Phase 30 ROI calculator). Each
--          scenario belongs to a functional_area and maps to 0..N existing
--          automation_templates via the scenario_templates pivot.
--
-- Strategy: Additive. Bilingual via separate _en/_es columns (CONTEXT.md
--           default). Templates can be huerfanos (unmapped) — the public
--           catalog only sees mapped+active templates via the pivot; the
--           authenticated dashboard keeps rendering ALL active templates via
--           industry/category as today.
--
-- RLS posture:
--   - scenarios: anon + authenticated SELECT gated by is_active = true AND
--     EXISTS (active parent functional_area). Writes service_role only.
--   - scenario_templates: anon + authenticated SELECT gated by EXISTS
--     (active parent scenario) AND EXISTS (active parent template). Writes
--     service_role only.
--
-- Idempotency: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS before each
--              CREATE POLICY, CREATE INDEX IF NOT EXISTS, DROP TRIGGER IF
--              EXISTS before CREATE TRIGGER. No seed rows — Phase 27 owns
--              content.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: scenarios table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenarios (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    functional_area_id       UUID NOT NULL REFERENCES public.functional_areas(id) ON DELETE RESTRICT,
    slug                     VARCHAR(80)  UNIQUE NOT NULL,
    pain_headline_en         VARCHAR(200) NOT NULL,
    pain_headline_es         VARCHAR(200) NOT NULL,
    pain_body_en             TEXT,
    pain_body_es             TEXT,
    typical_hours_per_week   DOUBLE PRECISION,
    impact_label_en          TEXT,
    impact_label_es          TEXT,
    sort_order               INTEGER NOT NULL DEFAULT 0,
    is_active                BOOLEAN NOT NULL DEFAULT true,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT scenarios_typical_hours_nonnegative
        CHECK (typical_hours_per_week IS NULL OR typical_hours_per_week >= 0)
);

COMMENT ON TABLE public.scenarios IS
    'Pain-language catalog entries. Belongs to a functional_area, maps to 0..N automation_templates via scenario_templates. Phase 27 seeds 50 rows; Phase 29 renders detail pages; Phase 30 aggregates typical_hours_per_week for ROI.';

-- ---------------------------------------------------------------------------
-- Section 2: scenarios RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Anon SELECT: row must be active AND its parent area must be active
DROP POLICY IF EXISTS "scenarios_select_active_anon" ON public.scenarios;
CREATE POLICY "scenarios_select_active_anon"
    ON public.scenarios
    FOR SELECT
    TO anon
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.functional_areas fa
            WHERE fa.id = scenarios.functional_area_id
              AND fa.is_active = true
        )
    );

-- Authenticated SELECT: identical predicate so public + admin reads stay consistent
DROP POLICY IF EXISTS "scenarios_select_active_authenticated" ON public.scenarios;
CREATE POLICY "scenarios_select_active_authenticated"
    ON public.scenarios
    FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.functional_areas fa
            WHERE fa.id = scenarios.functional_area_id
              AND fa.is_active = true
        )
    );

-- INTENTIONAL: no INSERT/UPDATE/DELETE policies — service_role bypasses RLS.

-- ---------------------------------------------------------------------------
-- Section 3: scenarios indexes
-- ---------------------------------------------------------------------------
-- Per-area ordered listing (Phase 29 area landing page)
CREATE INDEX IF NOT EXISTS idx_scenarios_area_sort
    ON public.scenarios (functional_area_id, sort_order, slug);

-- Partial index for active-only reads (matches RLS predicate)
CREATE INDEX IF NOT EXISTS idx_scenarios_active
    ON public.scenarios (is_active)
    WHERE is_active = true;

-- Slug lookups for /catalog/<area>/<scenario> routing
CREATE INDEX IF NOT EXISTS idx_scenarios_slug
    ON public.scenarios (slug);

-- ---------------------------------------------------------------------------
-- Section 4: scenarios updated_at trigger
-- ---------------------------------------------------------------------------
-- Reuses public.update_updated_at_column() defined in 20260305000001_core_identity.sql
DROP TRIGGER IF EXISTS scenarios_updated_at ON public.scenarios;
CREATE TRIGGER scenarios_updated_at
    BEFORE UPDATE ON public.scenarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Section 5: scenario_templates pivot table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenario_templates (
    scenario_id    UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    template_id    UUID NOT NULL REFERENCES public.automation_templates(id) ON DELETE CASCADE,
    display_order  INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (scenario_id, template_id)
);

COMMENT ON TABLE public.scenario_templates IS
    'Many-to-many pivot linking scenarios to existing automation_templates. display_order controls per-scenario template ordering. ON DELETE CASCADE from both parents so the pivot stays clean.';

-- ---------------------------------------------------------------------------
-- Section 6: scenario_templates RLS (gated by BOTH parents being active)
-- ---------------------------------------------------------------------------
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scenario_templates_select_active_anon" ON public.scenario_templates;
CREATE POLICY "scenario_templates_select_active_anon"
    ON public.scenario_templates
    FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM public.scenarios s
            JOIN public.functional_areas fa ON fa.id = s.functional_area_id
            WHERE s.id = scenario_templates.scenario_id
              AND s.is_active = true
              AND fa.is_active = true
        )
        AND EXISTS (
            SELECT 1 FROM public.automation_templates t
            WHERE t.id = scenario_templates.template_id
              AND t.is_active = true
        )
    );

DROP POLICY IF EXISTS "scenario_templates_select_active_authenticated" ON public.scenario_templates;
CREATE POLICY "scenario_templates_select_active_authenticated"
    ON public.scenario_templates
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.scenarios s
            JOIN public.functional_areas fa ON fa.id = s.functional_area_id
            WHERE s.id = scenario_templates.scenario_id
              AND s.is_active = true
              AND fa.is_active = true
        )
        AND EXISTS (
            SELECT 1 FROM public.automation_templates t
            WHERE t.id = scenario_templates.template_id
              AND t.is_active = true
        )
    );

-- INTENTIONAL: no INSERT/UPDATE/DELETE policies — service_role bypasses RLS.

-- ---------------------------------------------------------------------------
-- Section 7: scenario_templates indexes
-- ---------------------------------------------------------------------------
-- Per-scenario lookups in display order (Phase 29 scenario detail page)
CREATE INDEX IF NOT EXISTS idx_scenario_templates_scenario
    ON public.scenario_templates (scenario_id, display_order, template_id);

-- Reverse lookup: which scenarios reference this template (admin tooling)
CREATE INDEX IF NOT EXISTS idx_scenario_templates_template
    ON public.scenario_templates (template_id);

-- ---------------------------------------------------------------------------
-- Section 8: anon SELECT policy on automation_templates (additive)
-- ---------------------------------------------------------------------------
-- REQUIRED by CONTEXT.md (line 39): the pivot's RLS predicate runs
--   EXISTS (SELECT 1 FROM automation_templates t WHERE t.id = ... AND t.is_active)
-- as the calling role. Without an anon SELECT policy on automation_templates,
-- anonymous clients get 0 pivot rows even when all parents are active —
-- breaks Phase 29's public catalog SSR.
--
-- This policy is intentionally additive: existing authenticated policies on
-- automation_templates (automation_templates_select_active,
-- automation_templates_admin_*) are NOT modified. Only adds anon read access
-- to active templates. Service_role still bypasses RLS for writes.
DROP POLICY IF EXISTS "automation_templates_select_active_anon" ON public.automation_templates;
CREATE POLICY "automation_templates_select_active_anon"
    ON public.automation_templates
    FOR SELECT
    TO anon
    USING (is_active = true);

-- =============================================================================
-- End of scenarios + scenario_templates migration
-- =============================================================================
