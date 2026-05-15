# Phase 27: Scenario Content Seed - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate the scenario-first catalog schema (created in Phase 26) with content: seed the 8 fixed `functional_areas`, 50 client-language `scenarios` with EN/ES pain copy + impact estimates, and ~135 `scenario_templates` mappings against the existing 66+ `automation_templates`. Output is data only — no UI, no schema changes. Downstream phases (28 landing, 29 catalog, 30 ROI) consume this data.

Phase 27 is **content + seed mechanics only**. It does NOT modify `automation_templates` schema, does NOT import new templates from external sources, and does NOT touch any UI surface.

</domain>

<decisions>
## Implementation Decisions

### Authorship & language flow
- Claude drafts all 50 scenarios end-to-end (slug + `pain_headline_en/es` + `pain_body_en/es` + `impact_label_en/es` + `typical_hours_per_week`). Patrick reviews/edits the full batch before the seed is committed.
- Bilingual simultaneous: EN and ES are drafted side-by-side per scenario (same tone in both), not translated post-hoc.
- Tone: conversational / problem-direct (first-person customer voice). Example: "Paso 2 horas al día copiando datos de Shopify a mi hoja de cálculo." Avoid consultant-speak or benefit-first marketing language — lead with the pain.
- `pain_body` length: a paragraph of 3-5 sentences (context + concrete task example + who it affects). Enough substance for Phase 29 detail pages without becoming SEO bloat.

### Functional areas — count and identity
- **8 areas, not 7.** ROADMAP Phase 27 ("7 functional areas") is outdated and must be corrected during planning. The authoritative list is the 8 fixed areas from CAT-01 / Phase 26: **Ventas, Marketing, Atención al Cliente, Documentos, Productividad, Reportes, Agentes IA, Integraciones & Seguridad.**
- Phase 27 plan must include a small ROADMAP edit so success criteria #1 reads "8 functional areas" (still 50 scenarios total).
- All 8 areas are seeded as `is_active = true` with EN/ES labels + descriptions + `sort_order`.

### Scenario distribution across areas
- Weighted toward high-pain SMB verticals, not even split. Target distribution (planner can adjust ±1 per area while honoring constraints):
  - Ventas: ~10
  - Marketing: ~10
  - Atención al Cliente: ~8
  - Documentos: ~6
  - Productividad: ~6
  - Reportes: ~4
  - Agentes IA: ~3
  - Integraciones & Seguridad: ~3
- **Floor: minimum 3 scenarios per area.** No area can be seeded with fewer than 3 — otherwise Phase 29 area landing pages look empty.
- Selection criterion: only scenarios where (a) the pain is common in Ontario SMBs and (b) at least 1 existing `automation_templates` row can be mapped to it. No "aspirational" scenarios without a backing template.

### Scenario → template mapping
- **Template source: existing 66+ templates only.** Phase 27 does NOT insert new rows in `automation_templates` or import from `awesome-n8n-templates`. Mapping uses the current seed as-is.
- Strategy: manual curation per scenario. For each scenario, Claude reviews the 66+ template catalog and selects the 2-4 most relevant matches based on template name / description / industry / category. Patrick reviews the mapping batch before commit.
- **Cardinality target: 2-4 templates per scenario** (mean ~2.7). Total mappings ≈ 135, matching ROADMAP success criterion #2. Templates can appear in multiple scenarios (many-to-many — already supported by Phase 26 pivot).
- Orphan templates allowed: templates that don't fit any scenario stay unmapped. They remain visible in `/dashboard/catalog` (authenticated users see all active templates via `industry`/`category` filters) but do NOT appear in the public `/catalog` (which only joins through `scenario_templates`). This matches the Phase 26 CONTEXT decision and CAT-05 back-compat requirement.
- `display_order` on the pivot: Claude assigns a sensible order during seeding (most-relevant template first per scenario). Planner picks the exact numeric convention (0-indexed, 10-step, etc.).

### Impact estimates (`typical_hours_per_week` + `impact_label_*`)
- Origin: Claude estimates per scenario based on task type and complexity (e.g. data entry, communication, reporting). Patrick validates the full set in the same review pass as the copy.
- Granularity: **whole hours only** (1, 2, 5, 10). No decimals or half-hours — avoids false precision and makes the Phase 30 ROI calculator math clean.
- Valid range: **1 to 20 hrs/week.** Anything below 1 doesn't justify automating; anything above 20 strains credibility for a single automation. Scenarios that would exceed 20 hrs/week must be split or capped.
- `impact_label_en/es` pattern: `"~X hrs/week saved"` / `"~X hrs/semana ahorradas"`. Consistent format across all 50 scenarios so Phase 29 detail cards render uniformly. Phase 30 reads `typical_hours_per_week` directly for the ROI calculation — the label is presentational only.

### Claude's Discretion
- Exact slug naming convention (EN slugs, ES slugs, or locale-aware routing) — pick during planning based on Phase 29's URL plan. Default leaning: EN slugs for stable URLs (e.g. `/catalog/marketing/email-followup-sequence`).
- Seed mechanics: where the SQL lives (`supabase/seed.sql` extension vs separate seed file vs idempotent INSERT migration), and exactly how idempotency is enforced (ON CONFLICT DO NOTHING / UPDATE on stable natural keys like slug). Must satisfy success criterion #4 (`supabase db reset` re-runnable without duplicate-key errors).
- Stable identifiers: scenarios and functional_areas use `uuid_generate_v4()` defaults in the schema, but seed rows need deterministic identity for re-runs. Planner decides whether to use fixed UUIDs (hardcoded in seed) or rely solely on unique slug constraints for idempotency.
- `display_order` numeric scheme on `scenario_templates` (0/1/2/3 vs 10/20/30).
- Per-area `sort_order` values on scenarios (controls Phase 29 ordering within an area).

</decisions>

<specifics>
## Specific Ideas

- Tone reference for pain copy: customer speaks first-person. "Paso 2 horas al día copiando datos…" / "I spend 2 hours a day copying data…". Avoid AIDEAS-the-vendor voice in the copy itself.
- Existing seed: `supabase/seed.sql` already inserts 66+ automation_templates plus 2 demo orgs and 500+ executions. Phase 27 seed must coexist with this file without duplicate-key errors on re-reset.
- Phase 30 (ROI calculator) consumes `typical_hours_per_week` to aggregate hours-saved across user-selected scenarios; whole-integer hours keep the math obvious to the customer.
- Phase 29 (public catalog) renders `pain_headline_*` on area landing pages and `pain_body_*` on scenario detail pages. Length decision (3-5 sentence paragraph) is sized for that detail-page layout.
- ROADMAP success criterion #1 currently says "7 functional areas" — Phase 27 must update it to "8" as part of the same plan (small docs edit alongside the seed).

</specifics>

<deferred>
## Deferred Ideas

- **Importing templates from `awesome-n8n-templates`** — out of scope for Phase 27. The current 66+ templates are sufficient to cover the 50 scenarios. A future phase can expand the template catalog if Phase 29/30 UX reveals gaps.
- **Admin CRUD UI for scenarios** (create/edit/map in-app) — deferred to a later phase. Phase 27 seeds the data; future admin tooling can edit it via service-role server actions.
- **Marketing-aspirational scenarios without a backing template** — out of scope. Phase 27 enforces the rule that every seeded scenario maps to ≥1 existing template.
- **Per-locale slug routing** (`/catalog/marketing/...` vs `/catalogo/marketing/...`) — Phase 27 picks one slug language; locale-aware URL paths are a Phase 29 / SEO decision.
- **Hours-saved benchmarks from real customer telemetry** — out of scope. Phase 27 uses Claude's estimates validated by Patrick. A future iteration can re-baseline `typical_hours_per_week` against actual `automation_executions` data once enough customer signal exists.
- **Deprecating `industry` / `category` columns on `automation_templates`** — already deferred in Phase 26 CONTEXT; reaffirmed here. Orphan templates rely on those columns for the authenticated dashboard.

</deferred>

---

*Phase: 27-scenario-content-seed*
*Context gathered: 2026-05-15*
