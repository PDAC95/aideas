# Phase 13: Catalog Coverage Fix - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Register two orphaned seed values into the catalog UI so 100% of seeded `automation_templates` are reachable via filters:

1. `operations` category (8 templates) — currently has no UI tab and no i18n key
2. `agencias` industry (~48 templates) — currently has no UI chip and no i18n key

This is a **gap-closure fix** that wires existing seed data to the existing catalog UI. It closes audit gaps HIGH-1 and HIGH-2 from `.planning/v1.1-MILESTONE-AUDIT.md`.

**In scope:**
- Add i18n keys to `web/messages/en.json` and `web/messages/es.json`
- Update `CATEGORY_ORDER` array in `web/src/components/dashboard/catalog-client.tsx`
- Update translation map in `web/src/app/(dashboard)/dashboard/catalog/page.tsx`
- Smoke test the result in dev (EN + ES, filters combined)

**Out of scope:**
- Adding new templates, categories, or industries
- Reordering existing categories or industries
- Changing catalog UI behavior, styling, or layout
- Empty-state changes (already shipped in Phase 10)
- Any Stripe / billing wiring

</domain>

<decisions>
## Implementation Decisions

### i18n Labels
- `dashboard.catalog.categories.operations` → EN: **"Operations"**, ES: **"Operaciones"**
- `dashboard.catalog.industries.agencias` → EN: **"Agencies"**, ES: **"Agencias"**
- Rationale: direct translations, consistent in tone with existing catalog labels (sales/Ventas, marketing/Marketing, retail/Retail)

### Tab position for `operations`
- Insert **after `productivity`** in `CATEGORY_ORDER`
- New order: `all, mas_populares, sales, marketing, customer_service, documents, productivity, **operations**, reports, ai_agents`
- Rationale: groups operational/internal-process categories (productivity → operations → reports) before AI Agents
- Treat the new tab with the same styling and behavior as existing tabs — no badges, no "New" markers, no special highlighting
- URL handling: existing `?category=operations` query params will start working naturally once the key is registered. No redirect or fallback needed.

### Chip position for `agencias`
- Insert **at the end, after `restaurantes`** in the industry chips array
- New order: `all, retail, salud, legal, inmobiliaria, restaurantes, **agencias**`
- Rationale: minimal visual disruption; future industries follow the same append-only convention
- Treat as any other industry chip — same styling, no "primary" marker even though ~48/66 templates carry this tag
- Convention for future industries: **append at the end of the array** (do not alphabetize, do not reorder)

### Mobile overflow check
- Catalog already supports 8 category tabs in mobile layout. Adding a 9th tab should reuse the existing horizontal-scroll pattern.
- During implementation: verify the `TabsList` renders without layout regression on mobile widths (375px). If a regression exists, fix it minimally; do not redesign the tab strip.

### Verification (UAT scope)
- Manual UI smoke test in dev:
  1. Open `/dashboard/catalog` in ES locale → click **Operaciones** tab → confirm exactly **8 template cards** render
  2. Click **Agencias** chip → confirm ~**48 template cards** render
  3. Combined filter: select **Agencias** chip + **Operations** tab → confirm result is consistent (non-empty if seed has the intersection; otherwise empty state shows)
  4. Switch locale to EN → confirm tab label reads **Operations** and chip label reads **Agencies**
- Counts must be visible (eyeballed against the rendered grid). No need for SQL queries unless the UI count looks wrong.
- Empty state: trust the existing Phase 10 empty-state implementation. Do not re-verify it explicitly.
- No automated tests required (no Playwright, no unit tests). This is a copy/registration fix.

### Claude's Discretion
- Exact JSON key insertion position within the existing `categories` / `industries` blocks of `en.json` / `es.json` (alphabetical vs. matching `CATEGORY_ORDER` order — pick whatever keeps the file readable)
- Mobile overflow handling: if the 9th tab causes a layout regression, decide between letting it scroll, shrinking padding, or another minimal fix
- Whether to commit i18n changes and UI changes as one commit or split per file (atomic, but readable)

</decisions>

<specifics>
## Specific Ideas

- Match the tone of existing labels: "Sales / Ventas", "Marketing / Marketing", "Retail / Retail" — short, direct, no marketing copy
- The fix should feel invisible: no user-visible "we just added this" signal. The catalog should look like operations and agencias were always there.
- Files known to need changes (from audit + roadmap):
  - `web/messages/en.json` — `dashboard.catalog.categories` + `dashboard.catalog.industries`
  - `web/messages/es.json` — same two blocks
  - `web/src/components/dashboard/catalog-client.tsx` — `CATEGORY_ORDER` constant
  - `web/src/app/(dashboard)/dashboard/catalog/page.tsx` — translation map for category + industry labels passed to client

</specifics>

<deferred>
## Deferred Ideas

- **Renaming `all` chip to "Cross-industry"** — out of scope; phase 13 closes audit gaps only. If revisited, file as a separate v1.2+ proposal.
- **Marking `agencias` as primary industry** — UX hierarchy decision, not a coverage fix. Out of scope.
- **Tracking analytics on catalog filter usage** — separate observability phase, not raised by audit.
- **Empty-state copy improvements** — already implemented in Phase 10.

</deferred>

---

*Phase: 13-catalog-coverage-fix*
*Context gathered: 2026-04-30*
