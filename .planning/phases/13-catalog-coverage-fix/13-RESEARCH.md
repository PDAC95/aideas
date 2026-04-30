# Phase 13: Catalog Coverage Fix - Research

**Researched:** 2026-04-30
**Domain:** next-intl static key registration + React filter state arrays (no library research needed)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**i18n Labels**
- `dashboard.catalog.categories.operations` -> EN: **"Operations"**, ES: **"Operaciones"**
- `dashboard.catalog.industries.agencias` -> EN: **"Agencies"**, ES: **"Agencias"**
- Rationale: direct translations, consistent in tone with existing catalog labels (sales/Ventas, marketing/Marketing, retail/Retail)

**Tab position for `operations`**
- Insert **after `productivity`** in `CATEGORY_ORDER`
- New order: `all, mas_populares, sales, marketing, customer_service, documents, productivity, **operations**, reports, ai_agents`
- Rationale: groups operational/internal-process categories (productivity -> operations -> reports) before AI Agents
- Treat the new tab with the same styling and behavior as existing tabs - no badges, no "New" markers, no special highlighting
- URL handling: existing `?category=operations` query params will start working naturally once the key is registered. No redirect or fallback needed.

**Chip position for `agencias`**
- Insert **at the end, after `restaurantes`** in the industry chips array
- New order: `all, retail, salud, legal, inmobiliaria, restaurantes, **agencias**`
- Rationale: minimal visual disruption; future industries follow the same append-only convention
- Treat as any other industry chip - same styling, no "primary" marker even though ~48/66 templates carry this tag
- Convention for future industries: **append at the end of the array** (do not alphabetize, do not reorder)

**Mobile overflow check**
- Catalog already supports 8 category tabs in mobile layout. Adding a 9th tab should reuse the existing horizontal-scroll pattern.
- During implementation: verify the `TabsList` renders without layout regression on mobile widths (375px). If a regression exists, fix it minimally; do not redesign the tab strip.

**Verification (UAT scope)**
- Manual UI smoke test in dev:
  1. Open `/dashboard/catalog` in ES locale -> click **Operaciones** tab -> confirm exactly **8 template cards** render
  2. Click **Agencias** chip -> confirm ~**48 template cards** render
  3. Combined filter: select **Agencias** chip + **Operations** tab -> confirm result is consistent (non-empty if seed has the intersection; otherwise empty state shows)
  4. Switch locale to EN -> confirm tab label reads **Operations** and chip label reads **Agencies**
- Counts must be visible (eyeballed against the rendered grid). No need for SQL queries unless the UI count looks wrong.
- Empty state: trust the existing Phase 10 empty-state implementation. Do not re-verify it explicitly.
- No automated tests required (no Playwright, no unit tests). This is a copy/registration fix.

### Claude's Discretion

- Exact JSON key insertion position within the existing `categories` / `industries` blocks of `en.json` / `es.json` (alphabetical vs. matching `CATEGORY_ORDER` order - pick whatever keeps the file readable)
- Mobile overflow handling: if the 9th tab causes a layout regression, decide between letting it scroll, shrinking padding, or another minimal fix
- Whether to commit i18n changes and UI changes as one commit or split per file (atomic, but readable)

### Deferred Ideas (OUT OF SCOPE)

- **Renaming `all` chip to "Cross-industry"** - out of scope; phase 13 closes audit gaps only. If revisited, file as a separate v1.2+ proposal.
- **Marking `agencias` as primary industry** - UX hierarchy decision, not a coverage fix. Out of scope.
- **Tracking analytics on catalog filter usage** - separate observability phase, not raised by audit.
- **Empty-state copy improvements** - already implemented in Phase 10.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CATL-01 | User can browse catalog grid with industry chip filters (Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes) | Industry chips list is derived from `Object.keys(translations.industries)` in `catalog-client.tsx:128-130`. Adding `agencias` to both `en.json` and `es.json` `dashboard.catalog.industries` blocks (insert order = render order due to `Object.keys`) makes the chip appear with no other code change. |
| CATL-02 | User can filter by category tabs | Tabs are rendered from `CATEGORY_ORDER` constant in `catalog-client.tsx:32-42`. Tab is rendered only if `translations.categories[key]` resolves (label-presence guard at line 188-189). Need both: insert `"operations"` into `CATEGORY_ORDER` AND register key in i18n + translation map. |
| CATL-03 | User can view template detail page with description, connected apps, impact text, setup time, pricing | Detail page (`catalog/[slug]/page.tsx:91-97`) does dynamic lookup `t(\`categories.${template.category}\`)` with try/catch fallback. Once `categories.operations` exists in i18n, all 8 operations templates auto-render with the localized label - **no code change needed in [slug]/page.tsx**. |
| I18N-01 | All new dashboard UI text available in both EN and ES | This phase adds the missing keys (`categories.operations`, `industries.agencias`) to both `web/messages/en.json` and `web/messages/es.json`. Already-passing requirement; this closes the orphan-key gap flagged by audit. |
</phase_requirements>

## Summary

Phase 13 is a **pure registration fix**: two seed values (`operations` category, `agencias` industry) exist in DB seed data and are reachable via URL query params, but they're absent from three registration points - i18n JSON, the `CATEGORY_ORDER` array, and the static translation map in `catalog/page.tsx`. The DB CHECK constraint already permits `operations` (added in `20260409000001_v1_1_schema_expansion.sql:46-49`), the detail page (`[slug]/page.tsx`) already does dynamic `t(\`categories.${template.category}\`)` lookup with try/catch fallback, and the `industryKeys` array is derived from `Object.keys(translations.industries)` - so the only changes needed are JSON keys + one array constant + one translation-map block.

**Verified counts in `supabase/seed.sql`:** exactly **8 rows** with `category = 'operations'` (lines 717-827, all in the OPERATIONS section block) and exactly **48 rows** containing `'agencias'` in the `industry_tags` ARRAY literal. CONTEXT.md said "~48" - confirmed exact via grep.

There is **no test infrastructure** to update (no Playwright config, no `*.test.*` files in `web/src/` or `web/__tests__/`, no test scripts in `web/package.json` beyond `lint`). Smoke testing is manual only.

**Primary recommendation:** Treat this as a 4-file mechanical edit (`en.json`, `es.json`, `catalog-client.tsx`, `catalog/page.tsx`). No new dependencies, no design decisions, no schema or query changes. Verification is a 4-step manual smoke test described in CONTEXT.md.

## Standard Stack

No new libraries. Existing stack handles everything:

### Core (already present)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^4.8.3 | i18n key registration via static JSON files | Already the project's i18n layer; cookie-based locale; no codegen step (keys are read at runtime from `web/messages/*.json`) |
| Next.js | 16.1.6 | App Router, search params via Promise | URL `?category=` / `?industry=` already plumbed through `searchParams` in `catalog/page.tsx:8` |
| React | 19.2.3 | Client component state for filter UI | `catalog-client.tsx` is "use client" with `useState` - no change needed |

### Alternatives Considered
None — locked decisions in CONTEXT.md preclude exploring alternatives.

**Installation:** None. No `npm install` needed.

## Architecture Patterns

### Existing Project Structure (reference only — not changed)
```
web/
├── messages/
│   ├── en.json                                    # EDIT: add categories.operations + industries.agencias
│   └── es.json                                    # EDIT: same two keys
└── src/
    ├── components/dashboard/
    │   └── catalog-client.tsx                     # EDIT: CATEGORY_ORDER constant (line 32-42)
    └── app/(dashboard)/dashboard/catalog/
        ├── page.tsx                               # EDIT: translations.categories + translations.industries (lines 62-80)
        └── [slug]/page.tsx                        # NO EDIT — dynamic t() with try/catch handles new key automatically
```

### Pattern 1: next-intl static JSON registration
**What:** next-intl resolves `t("categories.operations")` by reading `web/messages/{locale}.json` at request time. No codegen or build step.
**When to use:** Adding a new translatable label that already has a key path used by code.
**Example (from existing en.json:324-334):**
```json
"categories": {
  "all": "All",
  "mas_populares": "Most popular",
  "sales": "Sales",
  "marketing": "Marketing",
  "customer_service": "Customer service",
  "documents": "Documents",
  "productivity": "Productivity",
  "operations": "Operations",   // <-- INSERT HERE (after productivity, matches CATEGORY_ORDER)
  "reports": "Reports",
  "ai_agents": "AI Agents"
}
```

### Pattern 2: Translation map in server page passed to client component
**What:** The catalog page (`catalog/page.tsx:62-80`) builds an explicit `translations` object with one key per category/industry, then passes it as a prop to `CatalogClient`. This is **mandatory** because the client component cannot call `t()` for keys it doesn't know statically.
**When to use:** Server -> client translation handoff (project convention; see also Phase 11-02 decision and Phase 09 patterns).
**Example (insert at line 70 in `catalog/page.tsx`, between `productivity` and `reports`):**
```typescript
categories: {
  all: t("categories.all"),
  mas_populares: t("categories.mas_populares"),
  sales: t("categories.sales"),
  marketing: t("categories.marketing"),
  customer_service: t("categories.customer_service"),
  documents: t("categories.documents"),
  productivity: t("categories.productivity"),
  operations: t("categories.operations"),  // <-- INSERT HERE
  reports: t("categories.reports"),
  ai_agents: t("categories.ai_agents"),
},
industries: {
  all: t("industries.all"),
  retail: t("industries.retail"),
  salud: t("industries.salud"),
  legal: t("industries.legal"),
  inmobiliaria: t("industries.inmobiliaria"),
  restaurantes: t("industries.restaurantes"),
  agencias: t("industries.agencias"),  // <-- APPEND AT END
},
```

### Pattern 3: CATEGORY_ORDER constant drives tab visibility AND order
**What:** `catalog-client.tsx:32-42` defines `CATEGORY_ORDER` as a string array. Line 187-189 maps over it; the tab renders only if `translations.categories[key]` exists (`if (!label) return null`). So **adding to JSON without adding to the array does nothing** for tabs.
**When to use:** Always when adding a new category tab. Both registrations are required.
**Example:**
```typescript
const CATEGORY_ORDER = [
  "all",
  "mas_populares",
  "sales",
  "marketing",
  "customer_service",
  "documents",
  "productivity",
  "operations",  // <-- INSERT HERE (after productivity per CONTEXT.md decision)
  "reports",
  "ai_agents",
];
```

### Pattern 4: Industry chips derived from translations object key order
**What:** `catalog-client.tsx:128-130` does `Object.keys(translations.industries)`. Render order = JSON insertion order. **There is no separate INDUSTRY_ORDER constant.**
**When to use:** When adding a new industry chip. Just insert into both `en.json` and `es.json` `industries` blocks at the desired position. CONTEXT.md says append at end (after `restaurantes`).
**Critical:** The order must match between `en.json` and `es.json` (ES users see same chip layout as EN). Insert in the same position in both files.

### Anti-Patterns to Avoid
- **Adding a key to `en.json` only and forgetting `es.json`** — silent fallback to "categories.operations" raw key in ES locale, or worse, a runtime warning.
- **Adding to `CATEGORY_ORDER` but skipping the `translations.categories` map in `page.tsx`** — `translations.categories[key]` returns `undefined`, label-guard fires, tab silently absent. Same outcome as if `CATEGORY_ORDER` wasn't updated.
- **Reordering existing categories or industries** — out of scope per CONTEXT.md "Out of scope" list. Insert-only.
- **Trying to alphabetize JSON keys** — CONTEXT.md says use whatever keeps the file readable. The existing convention matches `CATEGORY_ORDER`. Match it.
- **Touching `[slug]/page.tsx`** — its dynamic `t(\`categories.${template.category}\`)` call (line 93) with try/catch fallback (line 94-97) auto-handles the new key. Editing it would be churn with no behavior change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Localized label for a new category | Inline string in component, locale switch in component | Add key to both `en.json` and `es.json`, look up via `t("categories.operations")` | Project convention (I18N-01); falls back via next-intl's mechanism; consistent with all other catalog labels |
| Default selected category fallback | `category === undefined ? "all" : category` re-implementation | Existing `category ?? "all"` at `catalog/page.tsx:86` and `useState(initialCategory \|\| "all")` at `catalog-client.tsx:64` | Already handles unknown values - if URL says `?category=operations` and key isn't registered, the tab simply isn't visible but URL is preserved (currently the case; this phase fixes it) |

**Key insight:** Every "feature" of this phase already exists. Operations templates are seeded, the schema permits the value, the detail page handles the label dynamically, the URL plumbing accepts the param, and the empty state already renders if the filter returns 0. The only thing missing is **two i18n keys and one array entry**. Don't add any new logic, abstractions, or helpers.

## Common Pitfalls

### Pitfall 1: JSON syntax error from missing comma
**What goes wrong:** Inserting a new key in the middle of `categories` block requires adding a comma to the prior line. Forgetting it breaks the entire i18n bundle and all dashboard pages 500.
**Why it happens:** Mechanical edits in deeply nested JSON.
**How to avoid:** After editing, run `node -e "JSON.parse(require('fs').readFileSync('web/messages/en.json','utf8'))"` (and same for `es.json`) before committing. Or run `npm run build` from `web/` — TypeScript type-check on i18n keys will fail with a parse error.
**Warning signs:** Dev server logs `SyntaxError: Unexpected string in JSON at position N`.

### Pitfall 2: Mismatched insertion order between EN and ES industry chips
**What goes wrong:** Industry chip order on screen differs between locales because `Object.keys(translations.industries)` reflects JSON file order, and EN/ES were edited inconsistently.
**Why it happens:** Two files edited separately, easy to put `agencias` before `restaurantes` in one and after in the other.
**How to avoid:** Append `"agencias"` as the **last** key in the `industries` block of **both** `en.json` and `es.json`. Visually diff the two files' industries blocks before committing.
**Warning signs:** Industry chip strip looks different when switching locale via the language switcher.

### Pitfall 3: Forgetting the `catalog/page.tsx` translation map
**What goes wrong:** Operations key registered in JSON, `CATEGORY_ORDER` updated, but tab still doesn't render because the explicit `translations.categories` map in `page.tsx:62-72` doesn't include `operations: t("categories.operations")`.
**Why it happens:** The map looks redundant ("why isn't this just `t.raw('categories')`?"), so a refactor instinct may skip it.
**How to avoid:** Three edits, three files, three commits-or-one-commit. Use a checklist. Don't refactor the map shape - the project's pattern is explicit per-key calls (intentional for type safety with next-intl).
**Warning signs:** Tab label is missing or shows raw key `categories.operations` in dev console; `categoryCounts.operations` shows correct count but no visible tab.

### Pitfall 4: Mobile horizontal scroll is already in place — don't redesign
**What goes wrong:** Adding a 9th tab triggers an instinct to "fix" the tab strip with breakpoints or wrapping.
**Why it happens:** Designers see overflow as a problem.
**How to avoid:** The existing tab strip uses `overflow-x-auto pb-2 scrollbar-hide` (line 186). It already scrolls horizontally on mobile. CONTEXT.md says: "Adding a 9th tab should reuse the existing horizontal-scroll pattern. ... If a regression exists, fix it minimally; do not redesign the tab strip."
**Warning signs:** PR diff touches CSS classes on the `<div className="flex gap-1 overflow-x-auto...">` wrapper. That's a redesign, not a fix.

### Pitfall 5: Stale dev server cache for next-intl
**What goes wrong:** Edited JSON, refreshed browser, still shows old keys. Conclude something is wrong with the code.
**Why it happens:** next-intl messages are imported via the `i18n/request.ts` config and cached by Next.js dev server in some scenarios.
**How to avoid:** After editing JSON, hard-refresh (Ctrl+Shift+R) or restart `npm run dev`. If still stale, delete `web/.next/cache` directory.
**Warning signs:** Verified the JSON change with `cat`, but UI shows old behavior.

## Code Examples

All from existing repo (verified). No external sources needed for this phase.

### Adding `operations` to `web/messages/en.json` (insert after `productivity`)
```json
// File: web/messages/en.json (lines 324-334 currently)
"categories": {
  "all": "All",
  "mas_populares": "Most popular",
  "sales": "Sales",
  "marketing": "Marketing",
  "customer_service": "Customer service",
  "documents": "Documents",
  "productivity": "Productivity",
  "operations": "Operations",
  "reports": "Reports",
  "ai_agents": "AI Agents"
}
```

### Adding `agencias` to `web/messages/es.json` (append at end of industries)
```json
// File: web/messages/es.json (lines 335-342 currently)
"industries": {
  "all": "Todas",
  "retail": "Retail",
  "salud": "Salud",
  "legal": "Legal",
  "inmobiliaria": "Inmobiliaria",
  "restaurantes": "Restaurantes",
  "agencias": "Agencias"
}
```
(Same structure for `en.json`: `"agencias": "Agencies"`.)

### Updating `CATEGORY_ORDER` in `web/src/components/dashboard/catalog-client.tsx` (lines 32-42)
```typescript
const CATEGORY_ORDER = [
  "all",
  "mas_populares",
  "sales",
  "marketing",
  "customer_service",
  "documents",
  "productivity",
  "operations",
  "reports",
  "ai_agents",
];
```

### Updating translation map in `web/src/app/(dashboard)/dashboard/catalog/page.tsx` (lines 62-80)
```typescript
categories: {
  all: t("categories.all"),
  mas_populares: t("categories.mas_populares"),
  sales: t("categories.sales"),
  marketing: t("categories.marketing"),
  customer_service: t("categories.customer_service"),
  documents: t("categories.documents"),
  productivity: t("categories.productivity"),
  operations: t("categories.operations"),
  reports: t("categories.reports"),
  ai_agents: t("categories.ai_agents"),
},
industries: {
  all: t("industries.all"),
  retail: t("industries.retail"),
  salud: t("industries.salud"),
  legal: t("industries.legal"),
  inmobiliaria: t("industries.inmobiliaria"),
  restaurantes: t("industries.restaurantes"),
  agencias: t("industries.agencias"),
},
```

## Hidden Coupling and File Inventory

### Files needing edits (4 total)
| File | Lines | Change | Why |
|------|-------|--------|-----|
| `web/messages/en.json` | 324-342 (categories + industries blocks) | Add 2 keys | i18n registration |
| `web/messages/es.json` | 324-342 (mirror) | Add 2 keys | i18n registration (locale parity) |
| `web/src/components/dashboard/catalog-client.tsx` | 32-42 (CATEGORY_ORDER) | Add 1 string | Tab visibility + order |
| `web/src/app/(dashboard)/dashboard/catalog/page.tsx` | 62-80 (translations map) | Add 2 entries | Server -> client translation handoff |

### Files NOT needing edits (verified)
| File | Why no change |
|------|---------------|
| `web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx` | Line 93: `t(\`categories.${template.category}\`)` is dynamic with try/catch fallback. New key auto-resolves. |
| `web/src/lib/dashboard/queries.ts` | `fetchCatalogTemplates` already returns ALL active templates regardless of category (line 330-345). Operations templates already in result set; just not filterable by tab. |
| `web/src/lib/dashboard/types.ts` | `category: string` and `industry_tags: string[]` are loosely typed (no enum). New value is string-compatible. |
| `web/src/components/dashboard/catalog-card.tsx` | Renders `category.replace(/_/g, " ")` (line 73-75) for the small label below the title — operations becomes "operations" (no underscore so no change). Industry tags rendered as raw strings (line 81-86) — `agencias` shows as "agencias" already. |
| `supabase/migrations/20260409000001_v1_1_schema_expansion.sql:46-49` | CHECK constraint already permits `'operations'` (verified). |
| Any test file | None exist in this repo. |

### URL routing for `?category=operations` and `?industry=agencias`
- `catalog/page.tsx:8` declares `searchParams: Promise<{ category?: string; industry?: string; search?: string }>` — accepts any string, no allowlist.
- `catalog/page.tsx:86`: `initialCategory={category ?? "all"}` passes through verbatim.
- `catalog-client.tsx:64`: `useState(initialCategory \|\| "all")` accepts any string.
- `catalog-client.tsx:140`: `if (t.category !== category) return false;` — filters templates by exact match. Already works for `operations` (8 templates have that string as category).
- **Conclusion:** URLs already function. Adding the i18n key + CATEGORY_ORDER entry just makes the **tab visible** so users can reach it via clicks instead of typing the URL.

### Default-selected category logic
- No special-case for "operations" needed. `initialCategory \|\| "all"` defaults to "all" if URL has no category param. If URL says `?category=operations`, that becomes initial state directly. Standard flow.

## State of the Art

Not applicable — this is a fix to existing infrastructure, not new technology.

## Open Questions

None blocking. CONTEXT.md locks all design decisions. Implementation is mechanical.

One micro-question Claude can resolve at edit time:

1. **JSON key insertion ordering within `categories` block (en.json/es.json)**
   - What we know: CONTEXT.md grants discretion. CATEGORY_ORDER puts `operations` after `productivity`.
   - What's unclear: Whether to match CATEGORY_ORDER in JSON or alphabetize.
   - Recommendation: **Match CATEGORY_ORDER** — easier for human reviewers to scan, consistent with the existing JSON which already follows that order. Insert `"operations": "Operations"` after `"productivity": "Productivity"` in both `en.json` and `es.json`.

## Validation Architecture

> Skipped per `.planning/config.json` — `workflow.nyquist_validation` field not present (workflow only has `research`, `plan_check`, `verifier`). Phase verification follows the GSD project's standard manual UAT pattern as specified in CONTEXT.md.

**Manual smoke test** (from CONTEXT.md, restated for planner):

1. `cd web && npm run dev`
2. Open `http://localhost:3000/dashboard/catalog` in ES locale
3. Click **Operaciones** tab — confirm exactly **8 cards** render
4. Click **Agencias** chip — confirm **48 cards** render (or check via the "Mostrando X de 66" subtitle text)
5. Combined: select **Agencias** chip + **Operations** tab — confirm result is non-empty (seed has the intersection: at least `data_reconciliation`, `workflow_orchestrator`, `system_health_monitor`, `backup_verification` — verified in seed.sql:723, 793, 807, 821)
6. Switch locale to EN via header LanguageSwitcher — confirm tab reads **Operations** and chip reads **Agencies**
7. Mobile width (375px) — confirm tab strip horizontal-scrolls without overlapping content

**Build verification:**
- `cd web && npm run build` — confirms no JSON parse errors and no TypeScript errors from i18n key changes
- `cd web && npm run lint` — confirms no linting issues introduced

**No automated tests exist or are required.**

## Sources

### Primary (HIGH confidence)
- `c:/dev/12ai/.planning/phases/13-catalog-coverage-fix/13-CONTEXT.md` — All locked decisions
- `c:/dev/12ai/.planning/v1.1-MILESTONE-AUDIT.md` — Audit gap evidence (HIGH-1, HIGH-2)
- `c:/dev/12ai/web/messages/en.json` (lines 324-342) — Confirmed current category/industry keys
- `c:/dev/12ai/web/messages/es.json` (lines 324-342) — Confirmed mirror structure with same keys
- `c:/dev/12ai/web/src/components/dashboard/catalog-client.tsx` (lines 32-42, 128-130, 187-189) — CATEGORY_ORDER + Object.keys industry derivation + label-presence guard
- `c:/dev/12ai/web/src/app/(dashboard)/dashboard/catalog/page.tsx` (lines 62-80) — Translation map structure
- `c:/dev/12ai/web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx` (lines 91-97) — Dynamic category lookup with fallback (auto-handles new keys)
- `c:/dev/12ai/supabase/seed.sql` — Verified `operations` count = **8** rows (lines 717-827) and `agencias` count = **48** rows in industry_tags arrays
- `c:/dev/12ai/supabase/migrations/20260409000001_v1_1_schema_expansion.sql` (lines 46-49) — CHECK constraint already permits `operations`
- `c:/dev/12ai/web/package.json` — Confirmed no test script, no Playwright/Jest dependencies

### Secondary (MEDIUM confidence)
None. All facts verified from source code/files in the repo.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all patterns verified in existing codebase
- Architecture: HIGH — every file inspected, hidden-coupling search exhaustive (Grep on `categories.|industries.`, `CATEGORY_ORDER`, `operations|agencias`)
- Pitfalls: HIGH — derived from concrete code mechanics in `catalog-client.tsx` and `catalog/page.tsx`, not generic advice
- Counts: HIGH — exact verification via grep (`8` operations rows, `48` agencias array references — matches CONTEXT.md's "8" and "~48")

**Research date:** 2026-04-30
**Valid until:** 2026-05-30 (30 days — Phase 10 catalog code is stable; only churn would be Phase 14/15 unrelated changes or v1.2 milestone start)
