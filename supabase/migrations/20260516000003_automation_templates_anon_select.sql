-- =============================================================================
-- Phase 26: Catalog Data Model
-- POLICY ADDITION: anon SELECT on automation_templates (filtered to active rows)
-- Purpose: Phase 28/29 SSR (public landing + public catalog) needs to read
--          automation_templates without an authenticated session so server
--          components can render template details on anonymous catalog detail
--          pages. The existing authenticated + admin policies remain untouched.
--
-- Strategy: Additive. ONE new CREATE POLICY only. No ALTER TABLE, no column
--           changes, no touch to industry_tags/category. PostgreSQL OR-combines
--           policies, so authenticated reads continue to flow through the
--           existing "automation_templates_select_active" policy unchanged.
--
-- Idempotency: DROP POLICY IF EXISTS before CREATE POLICY — safe to re-apply.
--              This migration is intentionally a no-op when re-applied on a DB
--              where the identical policy was already created by an earlier
--              migration in the same phase (see history note below).
--
-- History: Plan 26-02 (commit 11d5ddc) shipped this exact policy as an in-scope
--          deviation fix in 20260516000002_scenarios_and_pivot.sql Section 8,
--          authorized by 26-CONTEXT.md line 39. This 26-03 migration is the
--          additive artifact that Plan 26-03 contractually requires
--          (see 26-03-PLAN.md must_haves.artifacts). The DROP IF EXISTS makes
--          it safe to apply on top of the policy already in place; on a fresh
--          `supabase db reset --local` the policy is created twice (identical
--          DDL, second create is a true no-op after the DROP). See
--          26-03-SUMMARY.md for the full deviation lineage.
-- =============================================================================

DROP POLICY IF EXISTS "automation_templates_select_active_anon" ON public.automation_templates;
CREATE POLICY "automation_templates_select_active_anon"
    ON public.automation_templates
    FOR SELECT
    TO anon
    USING (is_active = true);

-- =============================================================================
-- End of automation_templates anon SELECT migration
-- =============================================================================
