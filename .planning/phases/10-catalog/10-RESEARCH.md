# Phase 10: Catalog - Research

**Researched:** 2026-04-14
**Domain:** Next.js 15 App Router — client-side filter state, URL query params, RSC data fetching from `automation_templates`
**Confidence:** HIGH

## Summary

Phase 10 builds a catalog page at `/dashboard/catalog` and a detail page at `/dashboard/catalog/[slug]`. All 66+ templates live in `automation_templates` — a global table (not org-scoped), readable by any authenticated user. Because filtering is instant client-side (all templates loaded at once per CONTEXT.md), the catalog page fetches all templates in one Supabase query from a Server Component, then hands the full array to a `"use client"` filter component that manages category tab + industry chip + text search state, keeps that state in URL query params, and renders the filtered grid.

The detail page at `/dashboard/catalog/[slug]` is a pure RSC that fetches a single template by slug and renders its hero + content sections. No org-scoped data is needed — template data is universal. The "Solicitar esta automatizacion" button is UI-only (no server action, no Stripe) per the locked decision and CATL-04.

The existing Phase 9 codebase provides all needed patterns: URL-driven filter state (`AutomationsFilterTabs` using `useRouter` + `useSearchParams`), connected-app badge rendering (`AutomationCard`), RSC data fetching + parallel translation loading, `next-intl` with `getTranslations`/`getLocale` server-side, and integer-cents price formatting. Phase 10 extends these patterns without introducing new libraries.

**Primary recommendation:** Load all templates in one RSC query, pass to a single `"use client"` `CatalogFilters` component that owns all filter state and renders both the filter controls AND the filtered grid. URL params for `category`, `industry`, and `search` are synced via `router.replace` (not `router.push`) to avoid polluting browser history on each keystroke.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Catalog grid layout:**
- Minimal card density: name, category icon, industry badge(s), monthly price
- 3-column grid (responsive: 3 desktop, 2 tablet, 1 mobile)
- Badge "Popular" on templates belonging to the "Mas populares" category (i.e., `is_featured = true`)
- Color accent per category (subtle — border, icon tint, or badge color)
- Click on card navigates to dedicated page at `/dashboard/catalog/[slug]`

**Filter interaction:**
- Category tabs (horizontal) at the top, industry chips below — both always visible
- Filters combine with AND logic (e.g., Retail + Ventas = retail sales templates only)
- Text search bar above filters — searches by template name
- Filter state reflected in URL query params (category, industry, search)
- Result counters on each chip/tab AND a total count above the grid ("Mostrando X de 66")

**Template detail page:**
- Layout: hero section at top + vertical content sections below
- Hero contains: template name, category, industry, pricing (setup + monthly), and the CTA button
- "Solicitar esta automatizacion" button positioned in the hero — visible without scroll
- Connected apps displayed as icon row with tooltip on hover (no text labels)
- Content sections below hero: description, connected apps, typical impact text, setup time

**Empty & edge states:**
- All 66+ templates loaded at once — filtering is instant client-side
- Empty filter results: illustration + "No hay automatizaciones para estos filtros" + "Limpiar filtros" button
- Back navigation: "Volver al catalogo" link at top of detail page

### Claude's Discretion
- Card visual style (flat+border vs shadow) — match existing dashboard patterns
- CTA placeholder behavior on click (toast vs disabled) — choose what feels natural
- Loading skeleton vs spinner — match existing dashboard patterns
- Whether to include "Tambien te puede interesar" section with 3-4 related templates on detail page
- Exact hover effects and transitions on cards

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CATL-01 | User can filter catalog grid by industry chip (Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes) and results update correctly | Client-side filter on `industry_tags` TEXT[] column; chip value maps to lowercase industry tag |
| CATL-02 | User can filter by category tab (Mas populares, Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA) and results update correctly | Client-side filter on `category` column + `is_featured` flag for "Mas populares"; AND-combined with industry |
| CATL-03 | User can view template detail page with description, connected apps, impact text, setup time, pricing | RSC at `/dashboard/catalog/[slug]` — single Supabase query by slug; all fields available in `automation_templates` |
| CATL-04 | User sees "Solicitar esta automatizacion" button (UI only — no Stripe Checkout wired) | Static button with toast or disabled state on click; no server action needed |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.x (project standard) | RSC data fetch + `[slug]` route | Already in use for all dashboard routes |
| next-intl | project standard | `getTranslations` server-side, `useTranslations` client-side | Already used across phases 8 and 9 |
| Supabase JS client | project standard | Template query from RSC | `createClient()` from `@/lib/supabase/server` |
| `@/lib/dashboard/queries.ts` | — | New `fetchCatalogTemplates` + `fetchTemplateBySlug` queries | Mirrors Phase 9 pattern exactly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | project standard | Category icons in cards | Same icon set used in automations |
| `useRouter` + `useSearchParams` | next/navigation | URL-driven filter state in client component | Same pattern as `AutomationsFilterTabs` |
| `cn` utility | project standard | Conditional class names | Already used everywhere |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Load all templates RSC → client filter | Server-side filter via searchParams | Server approach adds RSC round-trips on every filter change; client-side is instant (66 templates is tiny) |
| `router.replace` for search param updates | `router.push` | `push` pollutes history; `replace` is correct for filter state |
| Tooltip via `title` attribute for app icons | Radix Tooltip | `title` works; Radix adds complexity; use `title` unless UX demands more |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure

```
web/src/
├── app/(dashboard)/dashboard/
│   └── catalog/
│       ├── page.tsx                     # RSC: auth guard, fetch all templates, pass to CatalogClient
│       └── [slug]/
│           └── page.tsx                 # RSC: auth guard, fetch template by slug, render detail
├── components/dashboard/
│   ├── catalog-client.tsx               # "use client": owns filter state, URL sync, renders grid
│   ├── catalog-card.tsx                 # Pure display: single template card
│   ├── catalog-card-skeleton.tsx        # Loading skeleton (matches automation-card-skeleton pattern)
│   └── catalog-detail-hero.tsx          # Detail page hero (name, category, pricing, CTA button)
└── lib/dashboard/
    ├── queries.ts                        # ADD: fetchCatalogTemplates(), fetchTemplateBySlug()
    └── types.ts                          # ADD: CatalogTemplate, CatalogTemplateDetail interfaces
```

### Pattern 1: RSC Loads All → Client Filters
**What:** Server Component fetches all active templates once. Client component owns filter state and produces the filtered view via `useMemo`.
**When to use:** Dataset is small enough to load fully (66 templates, ~20KB), and instant filtering UX is required.

```typescript
// catalog/page.tsx (RSC)
export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [templates, t] = await Promise.all([
    fetchCatalogTemplates(),          // returns CatalogTemplate[]
    getTranslations("dashboard.catalog"),
  ]);

  const { category, industry, search } = await searchParams;

  return (
    <CatalogClient
      templates={templates}
      initialCategory={category ?? "all"}
      initialIndustry={industry ?? "all"}
      initialSearch={search ?? ""}
      translations={...}              // pre-resolved strings from `t`
    />
  );
}
```

```typescript
// catalog-client.tsx ("use client")
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function CatalogClient({ templates, initialCategory, initialIndustry, initialSearch, translations }) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [industry, setIndustry] = useState(initialIndustry);
  const [search, setSearch] = useState(initialSearch);

  // Update URL params without adding to history
  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "") params.set(k, v);
      else params.delete(k);
    });
    router.replace(`/dashboard/catalog?${params.toString()}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    return templates.filter(t => {
      const matchCategory = category === "all"
        ? true
        : category === "mas_populares"
        ? t.is_featured
        : t.category === category;
      const matchIndustry = industry === "all" || (t.industry_tags ?? []).includes(industry.toLowerCase());
      const matchSearch = search === "" || t.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchIndustry && matchSearch;
    });
  }, [templates, category, industry, search]);

  // ... render filter controls + grid
}
```

### Pattern 2: Detail Page RSC Fetch by Slug
**What:** `[slug]/page.tsx` fetches a single template by `slug` column. No org-scoping needed (global catalog).

```typescript
// catalog/[slug]/page.tsx (RSC)
export default async function CatalogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const template = await fetchTemplateBySlug(slug);
  if (!template) notFound();

  // Render hero + detail sections
}
```

### Pattern 3: i18n Key Resolution at Display Time
**What:** Template `name`, `description`, `typical_impact_text`, and `activity_metric_label` are stored as i18n keys (e.g., `templates.lead_followup_email.name`). Resolution happens in the Server Component using `getTranslations("templates")` or directly via the `en.json` / `es.json` message lookup. The RSC resolves the strings and passes them to client components as plain strings.

**Critical:** Do NOT pass raw i18n keys to client components and call `useTranslations` inside them — this pattern is already established in Phase 8 and 9.

```typescript
// In RSC (catalog/page.tsx or [slug]/page.tsx):
const tTemplates = await getTranslations(); // root namespace to access "templates.*"
// OR pass the key and resolve in RSC before handing to client
const resolvedName = t(template.name); // template.name = "templates.lead_followup_email.name"
```

**Note:** The `name` field in `automation_templates` stores i18n keys like `templates.lead_followup_email.name`. The `getTranslations()` function with no namespace argument (or `getTranslations("templates")`) should resolve these. Verify the exact key path against `messages/en.json` — keys under `"templates"` object have format `{snake_slug}.name`, `{snake_slug}.description`, etc.

### Pattern 4: URL Category/Industry Mapping
**What:** DB values differ from display labels. Mapping must be explicit.

| DB `category` | Tab label | URL param value |
|---------------|-----------|-----------------|
| `is_featured = true` | Mas populares | `mas_populares` |
| `sales` | Ventas | `sales` |
| `marketing` | Marketing | `marketing` |
| `customer_service` | Atencion al cliente | `customer_service` |
| `documents` | Documentos | `documents` |
| `operations` | Productividad | `operations` (`productivity` in tab) |
| `productivity` | Productividad | `productivity` |
| `reports` | Reportes | `reports` |
| `ai_agents` | Agentes IA | `ai_agents` |

**NOTE:** The DB CHECK constraint (from migration) allows: `customer_service`, `documents`, `marketing`, `sales`, `operations`, `productivity`, `reports`, `ai_agents`. The CONTEXT.md tabs include both "Productividad" and "Reportes" — these map to `productivity` and `reports` categories. Confirm whether `operations` is a distinct tab or combined with `productivity`.

| DB `industry_tags` value | Chip label |
|--------------------------|------------|
| `retail` | Retail |
| `salud` | Salud |
| `legal` | Legal |
| `inmobiliaria` | Inmobiliaria |
| `restaurantes` | Restaurantes |
| *(any / "Todas")* | Todas |

### Anti-Patterns to Avoid
- **Client-side i18n key resolution:** Don't pass raw `templates.foo.name` keys to client components and call `t()` there — resolve in RSC and pass plain strings.
- **`router.push` for filter state:** Use `router.replace` with `{ scroll: false }` to avoid polluting browser history.
- **Separate client components for tabs and chips:** Keep all filter state in a single `CatalogClient` component to avoid state sync issues between category and industry filters.
- **useSearchParams in RSC:** Can only be used in `"use client"` components; RSC reads via `searchParams` prop.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| i18n template name resolution | Custom key lookup | `getTranslations()` (next-intl) in RSC | Already established; templates store i18n key strings |
| Filter state ↔ URL sync | Custom history management | `router.replace(url, { scroll: false })` | Same pattern as AutomationsFilterTabs (Phase 9) |
| Price formatting (cents → display) | Custom formatter | `Intl.NumberFormat` with style: "currency" | Already in automation-card.tsx |
| App icon colors | Random or CSS | `getAppColor(appName)` hash function | Already in automation-card.tsx — reuse directly |

**Key insight:** Phase 9 already solved the hard parts. CatalogClient is essentially a more complex AutomationsFilterTabs with a grid output instead of a tab-bar output.

---

## Common Pitfalls

### Pitfall 1: Template Name Is an i18n Key
**What goes wrong:** Rendering `template.name` directly shows `"templates.lead_followup_email.name"` in the UI instead of the resolved string.
**Why it happens:** Seed data stores i18n keys in the `name`, `description`, `typical_impact_text`, and `activity_metric_label` text columns.
**How to avoid:** In the RSC, resolve all display strings via `getTranslations` before passing to client components. For the catalog grid (which renders many templates), resolve all names in the RSC using a translation lookup and pass a `displayName` field in the data shape.
**Warning signs:** Literal dot-notation strings visible in the UI ("templates.foo.bar").

### Pitfall 2: AND Filter Logic for Category "Mas populares"
**What goes wrong:** "Mas populares" is NOT a category value in the DB. It's a virtual category based on `is_featured = true`.
**Why it happens:** Per STATE.md Phase 07-02: `is_featured = true` for "Mas populares" — it's NOT a category value.
**How to avoid:** When `category === "mas_populares"`, filter by `template.is_featured === true` instead of `template.category === "mas_populares"`. Handle this case explicitly in the filter logic.

### Pitfall 3: useSearchParams Requires Suspense Boundary
**What goes wrong:** Next.js throws an error: "useSearchParams() should be wrapped in a Suspense boundary."
**Why it happens:** `useSearchParams` in client components requires Suspense (same as AutomationsFilterTabs in Phase 9).
**How to avoid:** Wrap `CatalogClient` (which uses `useSearchParams` indirectly via `useRouter`) in `<Suspense>` in the page, OR pass initial values from the RSC `searchParams` prop and use `useState` with those initial values instead of `useSearchParams`.
**Better approach:** Pass `initialCategory`, `initialIndustry`, `initialSearch` from RSC `searchParams` prop, use `useState` in client component, and update URL via `router.replace`. This avoids needing `useSearchParams` in the client at all.

### Pitfall 4: `searchParams` is a Promise in Next.js 15
**What goes wrong:** Accessing `searchParams.category` directly throws or returns undefined.
**Why it happens:** Next.js 15 (App Router) — `searchParams` is a Promise (same as `params`).
**How to avoid:** `const { category, industry, search } = await searchParams;` — same pattern used in AutomationsPage.

### Pitfall 5: i18n Namespace for Templates
**What goes wrong:** `getTranslations("dashboard.catalog")` doesn't resolve `templates.lead_followup_email.name`.
**Why it happens:** Template display strings live under the `"templates"` root namespace, not under `"dashboard"`.
**How to avoid:** Use separate `getTranslations` calls: `getTranslations("dashboard.catalog")` for UI chrome, and a separate mechanism for template content keys. The template `name` field stores the full key path `templates.{slug}.name` — resolve via `getTranslations()` (no namespace) and call `t("templates.lead_followup_email.name")` or equivalent.

### Pitfall 6: Slug vs ID in URL
**What goes wrong:** Using template `id` (UUID) in the URL instead of `slug`.
**Why it happens:** All other detail pages in the project use UUID as route param.
**How to avoid:** The CONTEXT.md explicitly requires `/dashboard/catalog/[slug]`. The `automation_templates` table has a `slug` column with a UNIQUE index. Use `fetchTemplateBySlug(slug)` with `.eq("slug", slug)`.

---

## Code Examples

Verified from project codebase:

### Supabase Query for All Catalog Templates
```typescript
// lib/dashboard/queries.ts addition
export async function fetchCatalogTemplates(): Promise<CatalogTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_templates")
    .select(`
      id, name, slug, category, icon,
      setup_price, monthly_price, setup_time_days,
      industry_tags, connected_apps,
      typical_impact_text, activity_metric_label,
      is_featured, sort_order
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as CatalogTemplate[];
}
```

### Supabase Query for Single Template by Slug
```typescript
export async function fetchTemplateBySlug(slug: string): Promise<CatalogTemplateDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_templates")
    .select(`
      id, name, slug, description, category, icon,
      setup_price, monthly_price, setup_time_days,
      industry_tags, connected_apps,
      typical_impact_text, avg_minutes_per_task, activity_metric_label,
      is_featured, sort_order
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as unknown as CatalogTemplateDetail;
}
```

### Price Formatting (integer cents → display)
```typescript
// Reuse from automation-card.tsx pattern
const formatPrice = (cents: number) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
```

### App Color Hash (reuse from automation-card.tsx)
```typescript
// Import or copy getAppColor() from automation-card.tsx
// Hash-based deterministic color from app name string
```

### Result Count Display
```typescript
// In CatalogClient, show "Mostrando X de 66"
const totalCount = templates.length;
const filteredCount = filtered.length;
// EN: "Showing {filteredCount} of {totalCount}"
// ES: "Mostrando {filteredCount} de {totalCount}"
```

---

## Data Shape Reference

### `automation_templates` columns relevant to Phase 10

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | TEXT | i18n key, e.g. `templates.lead_followup_email.name` |
| `slug` | VARCHAR(100) UNIQUE | URL path segment, e.g. `lead-followup-email` |
| `description` | TEXT | i18n key |
| `category` | TEXT | Values: `sales`, `marketing`, `customer_service`, `documents`, `operations`, `productivity`, `reports`, `ai_agents` |
| `icon` | VARCHAR(50) | lucide icon name |
| `setup_price` | INTEGER | Cents (e.g. 19900 = $199.00) |
| `monthly_price` | INTEGER | Cents (e.g. 4900 = $49.00) |
| `setup_time_days` | INTEGER | Business days |
| `industry_tags` | TEXT[] | e.g. `['retail', 'agencias', 'inmobiliaria']` |
| `connected_apps` | TEXT[] | e.g. `['HubSpot', 'Mailchimp', 'Google Workspace']` |
| `typical_impact_text` | TEXT | i18n key |
| `avg_minutes_per_task` | INTEGER | Used for ROI calculation |
| `activity_metric_label` | TEXT | i18n key |
| `is_featured` | BOOLEAN | `true` = "Mas populares" membership |
| `sort_order` | INTEGER | Display order within category |

### Industry Tags in Seed Data
Confirmed values from seed.sql: `retail`, `agencias`, `inmobiliaria`, `legal`, `salud`, `restaurantes`. The UI chips are Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes (note: `agencias` is NOT one of the 5 filterable industries per CONTEXT.md; templates tagged only with `agencias` would not match any active industry filter unless "Todas" is selected).

---

## i18n Keys Required

### New keys to add to `messages/en.json` and `messages/es.json`

Under `"dashboard.catalog"`:
- `title` — "Automation Catalog" / "Catálogo de automatizaciones"
- `subtitle` — count string "Showing {filtered} of {total}" / "Mostrando {filtered} de {total}"
- `searchPlaceholder` — "Search automations..."
- `clearFilters` — "Clear filters"
- `popularBadge` — "Popular"
- `emptyTitle` — "No automations for these filters"
- `emptyCta` — "Clear filters"
- `back` — "Back to catalog" / "Volver al catálogo"
- `requestButton` — "Request this automation" / "Solicitar esta automatización"
- `requestedToast` — "We'll be in touch soon!" / "¡Nos pondremos en contacto pronto!"
- `setupTime` — "Setup time: {days} days" / "Tiempo de configuración: {days} días"
- `setupPrice` — "Setup: {price}" / "Configuración: {price}"
- `monthlyPrice` — "{price}/mo" / "{price}/mes"
- `connectedApps` — "Connected apps" / "Aplicaciones conectadas"
- `impact` — "Typical impact" / "Impacto típico"

Category tab labels (under `"dashboard.catalog.categories"`):
- `all` — "All" / "Todas"
- `mas_populares` — "Most popular" / "Más populares"
- `sales` — "Sales" / "Ventas"
- `marketing` — "Marketing" / "Marketing"
- `customer_service` — "Customer service" / "Atención al cliente"
- `documents` — "Documents" / "Documentos"
- `productivity` — "Productivity" / "Productividad"
- `reports` — "Reports" / "Reportes"
- `ai_agents` — "AI Agents" / "Agentes IA"

Industry chip labels (under `"dashboard.catalog.industries"`):
- `all` — "All" / "Todas"
- `retail` — "Retail" / "Retail"
- `salud` — "Health" / "Salud"
- `legal` — "Legal" / "Legal"
- `inmobiliaria` — "Real estate" / "Inmobiliaria"
- `restaurantes` — "Restaurants" / "Restaurantes"

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `searchParams` as plain object | `searchParams` is a Promise | Next.js 15 | Must `await searchParams` in all RSC pages |
| `params` as plain object | `params` is a Promise | Next.js 15 | Must `await params` in `[slug]/page.tsx` |

---

## Open Questions

1. **`operations` vs `productivity` category overlap**
   - What we know: DB CHECK constraint includes both `operations` and `productivity` as valid categories. The CONTEXT.md tab list has 8 categories that don't include `operations` by name — only "Productividad".
   - What's unclear: Whether seed data uses `operations` or `productivity` for the "Productividad" tab category.
   - Recommendation: Query the seed data — check which category value is used for "productivity" templates. If both exist, either map both to the same tab or add an `operations` tab. Based on the migration, `operations` was the OLD value and `productivity` is the NEW one added in v1.1; likely all productivity-type templates use `productivity` in seed.

2. **`agencias` industry tag**
   - What we know: Some templates have `industry_tags = ARRAY['retail', 'agencias', ...]`. The CONTEXT.md chips do NOT include "Agencias".
   - What's unclear: Templates tagged only with `agencias` won't match Retail, Salud, Legal, Inmobiliaria, or Restaurantes filters, so they only appear under "Todas".
   - Recommendation: This is acceptable behavior. Document it as a known limitation — "Agencias" templates show under "Todas" only.

3. **CTA button behavior (Claude's Discretion)**
   - Recommendation: Show a toast "Solicitar esta automatización — ¡Nos pondremos en contacto pronto!" on click. This mirrors the non-wired patterns from Phase 9 lifecycle actions (pause/resume show toasts too). Disable the button after click for 3 seconds to prevent double-clicks.

---

## Sources

### Primary (HIGH confidence)
- Project codebase: `web/src/app/(dashboard)/dashboard/automations/page.tsx` — RSC + searchParams pattern
- Project codebase: `web/src/components/dashboard/automations-filter-tabs.tsx` — URL-driven filter state
- Project codebase: `web/src/components/dashboard/automation-card.tsx` — card display, price formatting, app color hash
- Project codebase: `web/src/lib/dashboard/queries.ts` — Supabase query patterns
- Project codebase: `web/src/lib/dashboard/types.ts` — TypeScript interface patterns
- Project codebase: `supabase/migrations/20260409000001_v1_1_schema_expansion.sql` — automation_templates columns
- Project codebase: `supabase/seed.sql` — i18n key format, industry_tags values, template data shape
- Project codebase: `web/messages/en.json` — existing i18n structure and template key format

### Secondary (MEDIUM confidence)
- Next.js 15 App Router docs (verified via project patterns): `searchParams` and `params` are Promises

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all patterns confirmed from Phase 9 codebase
- Architecture: HIGH — directly mirrors Phase 9 patterns with well-understood extensions
- Pitfalls: HIGH — confirmed from project codebase analysis and Next.js 15 patterns already in use

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable stack; no fast-moving dependencies)
