# Phase 10: Catalog - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse the full automation catalog (66+ templates) with industry and category filters, and view complete template details before requesting. The "Solicitar" button is UI-only — Stripe Checkout is wired in a future milestone.

</domain>

<decisions>
## Implementation Decisions

### Catalog grid layout
- Minimal card density: name, category icon, industry badge(s), monthly price
- 3-column grid (responsive: 3 desktop, 2 tablet, 1 mobile)
- Badge "Popular" on templates belonging to the "Mas populares" category
- Color accent per category (subtle — border, icon tint, or badge color)
- Click on card navigates to dedicated page at `/dashboard/catalog/[slug]`

### Filter interaction
- Category tabs (horizontal) at the top, industry chips below — both always visible
- Filters combine with AND logic (e.g., Retail + Ventas = retail sales templates only)
- Text search bar above filters — searches by template name
- Filter state reflected in URL query params (category, industry, search)
- Result counters on each chip/tab AND a total count above the grid ("Mostrando X de 66")

### Template detail page
- Layout: hero section at top + vertical content sections below
- Hero contains: template name, category, industry, pricing (setup + monthly), and the CTA button
- "Solicitar esta automatizacion" button positioned in the hero — visible without scroll
- Connected apps displayed as icon row with tooltip on hover (no text labels)
- Content sections below hero: description, connected apps, typical impact text, setup time

### Empty & edge states
- All 66+ templates loaded at once — filtering is instant client-side
- Empty filter results: illustration + "No hay automatizaciones para estos filtros" + "Limpiar filtros" button
- Back navigation: "Volver al catalogo" link at top of detail page

### Claude's Discretion
- Card visual style (flat+border vs shadow) — match existing dashboard patterns
- CTA placeholder behavior on click (toast vs disabled) — choose what feels natural
- Loading skeleton vs spinner — match existing dashboard patterns
- Whether to include "Tambien te puede interesar" section with 3-4 related templates on detail page
- Exact hover effects and transitions on cards

</decisions>

<specifics>
## Specific Ideas

- Industry chips use the same labels as seed data: Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes
- Category tabs match seed data: Mas populares, Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA
- All UI text must support EN/ES (i18n keys, same pattern as existing dashboard)
- URL pattern for detail page: `/dashboard/catalog/[slug]`
- The existing automations page (Phase 9) already uses card-based patterns — catalog should feel consistent

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-catalog*
*Context gathered: 2026-04-14*
