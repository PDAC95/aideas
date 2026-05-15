# Phase 26: Catalog Data Model - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Introduce the scenario-first catalog schema (`functional_areas`, `scenarios`, `scenario_templates`) so the database can power both the public funnel (Phases 28-31) and admin tooling without breaking the existing `automation_templates` rows that current customer + admin catalog UIs depend on.

Phase 26 is **schema + RLS only**. It does NOT change the existing catalog UI, does NOT seed scenarios (Phase 27), and does NOT touch public surfaces (Phases 28-29).

</domain>

<decisions>
## Implementation Decisions

### Bilingual storage (i18n)
- **Claude's discretion** on storage strategy (separate `*_en` / `*_es` columns vs JSONB vs translations table).
- **Default assumption to validate during research:** separate columns for two fixed locales (EN/ES) — simplest queries, indexable, matches the existing app pattern of next-intl with two locales.
- All human-readable copy on `functional_areas` and `scenarios` must support EN + ES (labels, pain headlines, pain body, impact descriptions). Neutral fields (slug, ordering, is_active, impact numbers, timestamps) stay single-column.
- Claude decides exact per-field split during planning based on how Phase 29 (Public Catalog) and Phase 30 (ROI calculator) will consume them.

### scenarios ↔ templates mapping
- **Claude's discretion** on huérfanos, cardinality, pivot ordering, and delete behavior.
- **Default assumption to validate during research:**
  - Templates CAN be huérfanos (unmapped to any scenario) — required by CAT-05 (back-compat with 66+ existing templates). They keep rendering in the authenticated dashboard via `industry`/`category`; the public catalog only sees mapped templates.
  - Many-to-many via `scenario_templates` pivot — a template can appear in multiple scenarios (e.g. an HubSpot↔Slack sync under both Ventas and Atención al Cliente).
  - Pivot carries a `display_order` (or similar) column so editors control which template appears first within a scenario.
  - ON DELETE CASCADE from both parents (`scenarios` and `automation_templates`) into the pivot — standard, no orphan rows.
- No FK directa from `automation_templates` to `functional_areas`. The link exists ONLY through `scenario_templates → scenarios → functional_areas`. Keeps the schema normalized; Phase 29 navigation joins through scenarios.

### Public RLS + drafts
- **Claude's discretion** on the exact filtered policies.
- **Default assumption to validate during research:**
  - Anonymous SELECT on `functional_areas`, `scenarios`, `scenario_templates` is restricted to `is_active = true` rows. Drafts never leak to the public funnel or SEO crawlers.
  - The pivot `scenario_templates` is filtered so anon only sees rows where BOTH the parent scenario AND the parent template are active. Implementation: RLS policy with `EXISTS` clauses or equivalent denormalized flag — Claude picks based on performance.
  - Writes (INSERT/UPDATE/DELETE) on all three new tables are restricted to `service_role` only. Admin UI for catalog editing (future phase) goes through server actions using the service-role client — same pattern as existing `automation_requests` admin flow.
  - `automation_templates` SELECT must become readable by anonymous clients for the public SSR to work — new policy adds anon SELECT filtered to active templates. Existing authenticated policies remain untouched.

### Back-compat with existing `automation_templates`
- `industry` and `category` columns are **kept intact**. No migration drops or renames them.
- The existing customer dashboard (`/dashboard/catalog`) and admin (`/admin/catalog`) UIs render **without changes** after Phase 26 lands — Phase 26 ships schema + RLS, period. Filter UI changes belong to Phases 29 / 32 / 33.
- `supabase/seed.sql` is **not modified** by Phase 26. The migration must be additive enough that `supabase db reset` against the current seed still produces a working schema (new tables empty, existing dashboards green). Scenario + pivot seed data lives entirely in Phase 27.
- Schema changes are aditivos: new tables, new policies, new anon SELECT policy on `automation_templates`. No destructive ALTERs.

### Claude's Discretion
- Exact column naming convention (`title_en` vs `name_en` vs `label_en`).
- Whether to add a `slug` uniqueness scope per-area or globally — pick what fits Phase 29's URL plan.
- Index design (FKs, slug lookups, ordering).
- Whether RLS uses `EXISTS` subqueries or a denormalized `is_publicly_visible` flag on the pivot.
- Trigger choice for `updated_at` columns (reuse `update_updated_at_column()` from existing migrations).
- Migration file naming/sequence (must follow `YYYYMMDDHHMMSS_*.sql` convention).

</decisions>

<specifics>
## Specific Ideas

- 8 functional areas are fixed and known: Ventas, Marketing, Atención al Cliente, Documentos, Productividad, Reportes, Agentes IA, Integraciones & Seguridad (per CAT-01).
- The schema must support Phase 27 seeding 50 scenarios × 7 functional areas × ~135 template mappings (per ROADMAP Phase 27).
- Re-running `supabase db reset` (Phase 27 success criterion #4) requires idempotent seeds and no duplicate-key errors — Phase 26 must set up unique constraints that survive re-seed.
- Pattern reuse: existing `automation_templates` already has the per-org access pattern, RLS with service-role writes, and `update_updated_at_column()` trigger. New tables should mirror these conventions.

</specifics>

<deferred>
## Deferred Ideas

- **Deprecating `industry` / `category` columns on `automation_templates`** — captured for the roadmap backlog. Once Phase 27 ships scenarios and the dashboards migrate to the new taxonomy, a future cleanup phase can drop those columns. Out of scope for v1.3 (and explicitly out of scope for Phase 26).
- **Admin CRUD UI for catalog content** (creating/editing scenarios, mapping templates) — not in Phase 26. Phase 26 only enables the data; admin editing surface is a separate future phase.
- **Slug history / 301 redirects on rename** — captured for the SEO polish backlog. Phase 26 only needs slugs to exist and be unique; redirect mechanics belong to Phase 34 or later.
- **Adding more locales beyond EN/ES** — out of scope. Two-column strategy is acceptable for v1.3; revisit if/when a third locale is requested.

</deferred>

---

*Phase: 26-catalog-data-model*
*Context gathered: 2026-05-15*
