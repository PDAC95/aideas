# Phase 11: Reports & Billing - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see the ROI of their automations and review their billing charges. Two separate pages: Reports (/reports) and Billing (/billing), each with its own sidebar entry. Reports shows impact KPIs, weekly activity chart, and per-automation breakdown. Billing shows monthly summary, per-automation charges, mock payment history, and a "Manage payment" button (UI only — no Stripe wired).

</domain>

<decisions>
## Implementation Decisions

### KPI Cards (Reports)
- 3 large cards with icon on the left, large number, label below, and change indicator vs same previous period
- Cards: Tasks Completed, Hours Saved, Estimated Value
- Change indicator compares against the equivalent previous period (e.g., "This month" vs "Last month"; "Last 3 months" vs the 3 months before that)
- Format: icon + big number + label + arrow with percentage change

### Weekly Activity Chart (Reports)
- Simple vertical bar chart, ~8 weeks
- Metric: tasks completed per week
- Tooltip on hover showing week number and count
- Solid brand color bars
- No grouped bars or line overlays — keep it simple

### Per-Automation Breakdown Table (Reports)
- Classic table with 4 columns: Automation Name, Metric Label, Count, Hours Saved
- Default sort: hours saved descending
- All columns sortable by clicking headers (asc/desc toggle)
- Show top 10 by default + "View all (N)" button when more than 10
- Totals row at bottom summing Count and Hours Saved

### Navigation
- Reports and Billing are separate pages with separate sidebar entries
- Routes: /reports and /billing
- Sidebar order: Dashboard, Automations, Reports, Billing, Settings

### Billing Page — Monthly Summary Card
- Dashboard-style informative card (not formal invoice style)
- Shows: total monthly charge, number of active automations, next charge date
- "Manage payment" button inside this card
- Button shows toast notification "Portal de pagos disponible proximamente" on click (UI-only)

### Billing Page — Charges Table
- 3 columns: Automation Name, Plan, Monthly Charge
- Totals row at bottom
- No period selector — always shows current billing cycle

### Billing Page — Payment History
- Simple table with 4 columns: Date, Amount, Status (Paid/Pending), Method (masked card)
- 3-5 rows of seed/mock data
- No pagination needed for mock data

### Period Selector (Reports)
- Segmented control / inline tabs at top of Reports page
- 3 options: Este mes | Mes pasado | Ultimos 3 meses
- Click to switch; all KPIs, chart, and breakdown table update accordingly

### Empty States — Reports
- When no automations exist: illustration + message "Aun no hay datos. Crea tu primera automatizacion para ver reportes aqui." + CTA button linking to /automations

### Empty States — Estimated Value without hourly_cost
- Card exists but shows "--" as value
- Message: "Configura tu costo por hora para ver el valor estimado"
- Link to Settings page

### Empty States — Billing
- Same pattern as Reports: illustration + "Sin cargos activos. Activa una automatizacion para ver tu facturacion aqui." + CTA to /automations

### Claude's Discretion
- Exact icon choices for KPI cards
- Chart library choice (recharts, chart.js, etc.)
- Spacing, typography, and animation details
- Loading skeleton design
- Error state handling
- Exact illustration style for empty states

</decisions>

<specifics>
## Specific Ideas

- KPI cards should match the style of the existing dashboard KPI cards (consistency)
- Billing page should feel like part of the product dashboard, not a formal invoice
- Empty states should use the same illustration style across Reports and Billing for consistency
- "Manage payment" toast is a placeholder — Stripe Customer Portal will be wired in a future phase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-reports-billing*
*Context gathered: 2026-04-15*
