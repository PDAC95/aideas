# Phase 11: Reports & Billing - Research

**Researched:** 2026-04-15
**Domain:** Next.js RSC data queries, Recharts bar charts, Supabase aggregation, i18n, UI patterns
**Confidence:** HIGH

## Summary

Phase 11 adds two new dashboard pages — `/dashboard/reports` and `/dashboard/billing` — to an existing Next.js 16 + Supabase + next-intl + Recharts codebase. The technical patterns are already proven in the project: RSC pages fetch data via Supabase server client, pass serialized props to client components, and use `next/dynamic` with `ssr:false` for Recharts. The stack is well-established and no new libraries are needed.

Reports page requires three non-trivial data computations: (1) period-scoped execution counts and hours saved, (2) period-over-period change percentages for KPI cards, and (3) per-automation breakdown sorted by hours saved. All are achievable with Supabase PostgREST queries and in-memory aggregation, following the same pattern used in `fetchDashboardData` and `fetchAutomationDetail`. The 8-week chart for Reports extends the existing `groupByWeek` helper from 4 buckets to 8.

Billing page is mostly static presentation backed by seed data. `automations` with `template.monthly_price` give per-automation charges. `subscriptions` table has `current_period_end` for "next charge date". Payment history is pure mock data in seed — no query needed beyond a hardcoded array rendered as a table. `hourly_cost` lives in `organizations.settings` JSONB (`{"hourly_cost": 25}`), already seeded for Acme Corp.

**Primary recommendation:** Follow established project patterns exactly — RSC page + `lib/dashboard/queries.ts` function + typed interfaces in `types.ts` + `use client` display components. Use `next/dynamic ssr:false` for the reports bar chart. Add `reports` and `billing` translation namespaces to `en.json`/`es.json`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**KPI Cards (Reports)**
- 3 large cards: Tasks Completed, Hours Saved, Estimated Value
- Icon on left, large number, label below, change indicator vs same previous period
- Change indicator compares against equivalent previous period (This month vs Last month; Last 3 months vs the 3 months before that)
- Format: icon + big number + label + arrow with percentage change

**Weekly Activity Chart (Reports)**
- Simple vertical bar chart, ~8 weeks
- Metric: tasks completed per week
- Tooltip on hover showing week number and count
- Solid brand color bars (#a855f7 — matches existing)
- No grouped bars or line overlays

**Per-Automation Breakdown Table (Reports)**
- 4 columns: Automation Name, Metric Label, Count, Hours Saved
- Default sort: hours saved descending
- All columns sortable (asc/desc toggle on click)
- Show top 10 by default + "View all (N)" button when > 10
- Totals row at bottom summing Count and Hours Saved

**Navigation**
- Reports and Billing are separate pages with separate sidebar entries
- Routes: `/dashboard/reports` and `/dashboard/billing`
- Sidebar order: Dashboard, Automations, Reports, Billing, Settings (Reports added between Catalog... — see nav note below)

**Billing Page — Monthly Summary Card**
- Shows: total monthly charge, number of active automations, next charge date
- "Manage payment" button inside card
- Button shows toast "Portal de pagos disponible proximamente" on click (UI-only)

**Billing Page — Charges Table**
- 3 columns: Automation Name, Plan, Monthly Charge
- Totals row at bottom
- Always shows current billing cycle (no period selector)

**Billing Page — Payment History**
- 4 columns: Date, Amount, Status (Paid/Pending), Method (masked card)
- 3-5 rows of seed/mock data
- No pagination

**Period Selector (Reports)**
- Segmented control at top of Reports page
- 3 options: Este mes | Mes pasado | Ultimos 3 meses
- Click to switch; all KPIs, chart, and table update

**Empty States — Reports**
- Illustration + "Aun no hay datos. Crea tu primera automatizacion para ver reportes aqui." + CTA to /automations

**Empty States — Estimated Value without hourly_cost**
- Card exists, shows "--" as value
- Message: "Configura tu costo por hora para ver el valor estimado"
- Link to Settings page

**Empty States — Billing**
- Illustration + "Sin cargos activos. Activa una automatizacion para ver tu facturacion aqui." + CTA to /automations

### Claude's Discretion
- Exact icon choices for KPI cards
- Chart library choice (recharts is already in project — confirmed choice)
- Spacing, typography, and animation details
- Loading skeleton design
- Error state handling
- Exact illustration style for empty states

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REPT-01 | User can select report period (This month, Last month, Last 3 months) | Client component with useState drives period; RSC pre-fetches all 3 periods OR client re-queries on period change via query params/useState with server actions |
| REPT-02 | User sees 3 impact KPI cards (tasks completed, hours saved, estimated value) | Supabase count queries scoped by date range; hourly_cost from organizations.settings JSONB; pattern from fetchDashboardData |
| REPT-03 | User sees weekly activity bar chart (last ~8 weeks) | Extend groupByWeek to 8 buckets; Recharts BarChart with next/dynamic ssr:false — identical to WeeklyBarChart component |
| REPT-04 | User sees per-automation breakdown table (name, metric label, count, hours saved) | Query executions grouped by automation_id with template join; sort in-memory; client component for sort toggle |
| REPT-05 | Estimated value card shows when org has hourly_cost configured; link to settings when not set | Read organizations.settings.hourly_cost; conditional render in KPI card |
| BILL-01 | User sees monthly summary card (total active charges, next charge date) | automations with monthly_price + subscriptions.current_period_end; compute total = sum of monthly_price for active automations |
| BILL-02 | User sees per-automation monthly charges table | automations join automation_templates for monthly_price; filter active/in_setup automations |
| BILL-03 | User sees payment history table (from seed/mock data) | Hardcoded mock array in component or page; no DB query needed (Stripe not wired) |
| BILL-04 | User sees "Manage payment" button (UI only) | Button with onClick toast; state-based toast pattern from Phase 10 (CatalogRequestButton) |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.8.1 | Bar chart for weekly activity | Already in package.json; proven with WeeklyBarChart |
| next-intl | ^4.8.3 | i18n translations | Already used throughout dashboard |
| @supabase/supabase-js | ^2.95.0 | Data queries | Already used throughout dashboard |
| lucide-react | ^0.563.0 | Icons for KPI cards | Already used throughout dashboard |
| next/dynamic | (next 16.1.6) | SSR disable for Recharts | Required pattern — documented in existing codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| radix-ui | ^1.4.3 | Segmented control / tabs for period selector | Already in project; used for Popover |
| tailwind-merge + clsx | project | Conditional class utilities | Already used via cn() |

**Installation:** No new packages needed. All required libraries are in `web/package.json`.

---

## Architecture Patterns

### Recommended Project Structure
```
web/src/
├── app/(dashboard)/dashboard/
│   ├── reports/
│   │   └── page.tsx              # RSC: fetches data, passes to client components
│   └── billing/
│       └── page.tsx              # RSC: fetches data, passes to client components
├── components/dashboard/
│   ├── reports-kpi-cards.tsx     # "use client" — 3 KPI cards with period comparison
│   ├── reports-period-selector.tsx  # "use client" — segmented control
│   ├── reports-weekly-chart.tsx  # "use client" — Recharts bar chart (8 weeks)
│   ├── reports-breakdown-table.tsx  # "use client" — sortable table + show more
│   ├── billing-summary-card.tsx  # "use client" — monthly summary + manage button
│   ├── billing-charges-table.tsx # Pure display or "use client" — per-automation charges
│   └── billing-payment-history.tsx  # Pure display — mock payment rows
└── lib/dashboard/
    ├── queries.ts                # Add: fetchReportsData(), fetchBillingData()
    └── types.ts                  # Add: ReportsData, BillingData types
```

### Pattern 1: RSC Page with Client Component Island (established in Phase 8-10)
**What:** RSC page does all Supabase queries and passes serialized data to `"use client"` components as props. No client-side fetching.
**When to use:** All data is available at render time; period changes are either handled by URL search params (causing page re-render) or pre-computed.

**Key decision for Reports period selector:** Two valid approaches:
1. **URL search params (recommended)** — `page.tsx` reads `searchParams.period`, queries the correct date range server-side. Period selector does `router.push` with new param. Matches AutomationsFilterTabs pattern (Phase 09-02 decision: `router.push` for tab navigation keeps URL-driven state).
2. **Pre-compute all 3 periods** — page fetches all 3 date ranges in parallel, passes all data to client. Client switches between pre-fetched datasets. Avoids round trip but 3x the queries.

**Recommendation: URL search params** — matches existing pattern and avoids 3x query overhead.

```typescript
// page.tsx — RSC
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "this_month" } = await searchParams;
  const orgId = await getOrgId(user.id);
  const data = await fetchReportsData(orgId, period);
  // ...pass to client components
}
```

### Pattern 2: Recharts with next/dynamic ssr:false (established in Phase 09-03)
**What:** Recharts requires browser APIs. Always import chart components with `next/dynamic({ ssr: false })`.
**Example:**
```typescript
// Source: existing weekly-bar-chart.tsx usage in automation detail page
const ReportsWeeklyChart = dynamic(
  () => import("@/components/dashboard/reports-weekly-chart").then((mod) => ({
    default: mod.ReportsWeeklyChart,
  })),
  {
    ssr: false,
    loading: () => <div className="h-[240px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />,
  }
);
```

### Pattern 3: Client-side sort state in table (established Phase 09-02)
**What:** Sortable table keeps `sortKey` and `sortDir` in `useState`. No server round-trip for sort changes.
```typescript
"use client";
const [sortKey, setSortKey] = useState<"count" | "hoursSaved">("hoursSaved");
const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
```

### Pattern 4: State-based toast for UI-only buttons (established Phase 10-03)
**What:** `useState` + `useEffect` for toast dismiss. Used in `CatalogRequestButton`. Replaces sonner (not in project).
```typescript
"use client";
const [toastVisible, setToastVisible] = useState(false);
// onClick: setToastVisible(true)
// useEffect: setTimeout(() => setToastVisible(false), 3000)
```

### Pattern 5: Translation props threading (established Phase 8+)
**What:** RSC page calls `getTranslations("dashboard.reports")`, builds `translations` object, passes to components. Components receive typed `translations` prop — never call `useTranslations` directly.

### Anti-Patterns to Avoid
- **useTranslations in RSC:** Only `getTranslations` (async) works server-side. Client components get translations as props.
- **Direct Recharts import without dynamic:** Will cause SSR hydration mismatch. Always `next/dynamic ssr:false`.
- **Nested Supabase join for org settings:** Fetch `organizations.settings` directly via `orgId`, not via a join.
- **Period selector with useSearchParams without Suspense:** `useSearchParams` requires a Suspense boundary in App Router. Avoid it — use `router.push` and read `searchParams` in the RSC instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar chart | Custom SVG bars | Recharts BarChart (already installed) | Tooltip, responsive container, animation built-in |
| Sortable table | Custom sort implementation | useState with .sort() on pre-loaded data | Data is small (≤ N automations), no pagination needed |
| Toast notification | New toast library | State-based toast (Phase 10-03 pattern) | sonner not in project; simple show/hide is sufficient |
| Currency formatting | Manual string concat | `Intl.NumberFormat` with currency option | Handles locale, decimals, currency symbol correctly |

---

## Data Layer Details

### Reports — Data Queries

**Period date ranges:**
```typescript
function getPeriodRange(period: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  if (period === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    return { start, end: now, prevStart, prevEnd };
  }
  if (period === "last_month") {
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    return { start, end, prevStart, prevEnd };
  }
  // last_3_months: 90 days back, compare against prior 90 days
}
```

**KPI aggregation — tasks completed and hours saved:**
- Fetch executions with `status = 'success'` in the period range, scoped to org automation IDs
- Join `automation_templates.avg_minutes_per_task` via `automations!inner(template:automation_templates(avg_minutes_per_task))`
- Sum execution counts → tasks completed
- Sum `exec.automation.template.avg_minutes_per_task` → total minutes → divide by 60 → hours saved
- Repeat for previous period to compute change %
- Pattern: mirrors `fetchDashboardData` KPI3 query exactly

**Estimated value:**
- Read `organizations.settings` JSONB: `settings->>hourly_cost`
- `estimatedValue = hoursSaved * hourly_cost` (where hourly_cost is integer dollars)
- If `hourly_cost` is null/absent → show "--" with settings link

**Per-automation breakdown:**
- Fetch all success executions in period, grouped by `automation_id`
- In-memory: build map `automationId → { count, totalMinutes }`
- Join to automation names and `activity_metric_label` from template
- Sort by hoursSaved desc → top 10 + "View all" toggle

**8-week chart:**
- Extend `groupByWeek` to 8 buckets: W1=oldest (49-56 days ago), W8=most recent (0-7 days)
- Query executions over 56 days, count by week bucket
- Labels: "S1"…"S8" (semana) or week-of-month labels

### Billing — Data Queries

**Monthly summary card:**
- `automations` filtered by `status IN ('active', 'in_setup')` with `template.monthly_price`
- Sum `monthly_price / 100` for total monthly charge (integer cents → dollars)
- Count active automations
- `subscriptions.current_period_end` → next charge date

**Per-automation charges table:**
- Same automations fetch with `template.monthly_price, template.activity_metric_label`
- Display Plan column: derive from price tier or use `subscriptions.plan` (org-level)
- Totals row: sum monthly_price

**Payment history — mock data:**
- Hardcoded array in the page or component (no DB query)
- 3-5 rows with dates relative to "now" (e.g., `new Date()` minus N months)
- Status: "Paid" for all historical, optionally "Pending" for current month

**`organizations.settings` JSONB access:**
```typescript
// Supabase query — select settings column
const { data: org } = await supabase
  .from("organizations")
  .select("settings")
  .eq("id", orgId)
  .single();
const hourlyCost: number | null = (org?.settings as any)?.hourly_cost ?? null;
```
Note: `organizations` RLS only has select for members (via organization_members). The existing `getOrgId` already confirms org membership. A direct org select by id after membership is confirmed is safe.

---

## Navigation Update

The nav in `nav.tsx` currently has this order:
```
Dashboard, Automations, Catalog, Chat, Team, Billing, Settings
```

Required new order (per CONTEXT.md): Dashboard, Automations, Reports, Billing, Settings. "Catalog" stays (it's needed for the catalog feature). The context says "Reports" should be between Automations and Billing. Current nav array needs a `Reports` entry added (with `BarChart2` or `FileBarChart` icon from lucide-react).

Translation key `nav.reports` already exists in `en.json` under `dashboard.catalog.categories.reports` — but NOT under `dashboard.nav`. A new `"reports": "Reports"` key must be added to `dashboard.nav` in both `en.json` and `es.json`.

Wait — checking: `en.json` line 161 shows `"billing": "Billing"` which IS in `dashboard.nav`. And line 331 is inside `dashboard.catalog.categories` (that's a category name, not a nav key). So `dashboard.nav.reports` does NOT yet exist and must be added.

---

## Common Pitfalls

### Pitfall 1: Period selector using useSearchParams without Suspense
**What goes wrong:** App Router requires `useSearchParams` to be wrapped in Suspense. Missing Suspense causes build errors or blank page.
**How to avoid:** Don't use `useSearchParams` in the period selector client component. Instead: period selector calls `router.push('/dashboard/reports?period=last_month')`, RSC page reads `searchParams.period` — no client-side search param reading needed.

### Pitfall 2: Empty automationIds .in() query
**What goes wrong:** `.in("automation_id", [])` with empty array returns an error in Supabase PostgREST.
**How to avoid:** Check `orgAutomationIds.length > 0` before querying executions. Pattern already established in `fetchDashboardData`.

### Pitfall 3: Change indicator percentage division by zero
**What goes wrong:** Previous period had 0 tasks → division by zero for change %.
**How to avoid:** If `prevCount === 0`, show "+∞" or "—" or just show current value without percentage change.

### Pitfall 4: hourly_cost type mismatch
**What goes wrong:** `organizations.settings` is `JSONB DEFAULT '{}'`. `hourly_cost` is seeded as integer `25` (dollars, NOT cents — per Phase 07-03 decision). Multiplying hours × hourly_cost gives dollars directly.
**How to avoid:** Cast `(settings as any).hourly_cost` as `number | null`. Do NOT divide by 100 (it's already in dollars).

### Pitfall 5: monthly_price is in cents
**What goes wrong:** `automation_templates.monthly_price` is stored as integer cents (e.g., 4900 = $49.00). Displaying raw value shows wrong amount.
**How to avoid:** Always divide by 100 before display: `(monthly_price / 100).toFixed(2)` or use `Intl.NumberFormat` with `style: 'currency'`.

### Pitfall 6: Recharts without ssr:false
**What goes wrong:** Recharts imports cause Next.js SSR hydration errors.
**How to avoid:** Always `import dynamic from 'next/dynamic'` with `ssr: false`. Established pattern in the codebase.

---

## Code Examples

### groupByWeek extended to 8 buckets
```typescript
// Extend existing groupByWeek pattern to 8 weeks
function groupBy8Weeks(executions: { started_at: string }[], now: Date): WeeklyChartData[] {
  const buckets = Array.from({ length: 8 }, (_, i) => ({
    week: `S${i + 1}`,
    count: 0,
  }));
  const nowMs = now.getTime();
  executions.forEach((exec) => {
    const daysAgo = (nowMs - new Date(exec.started_at).getTime()) / (24 * 60 * 60 * 1000);
    const bucket = Math.floor(daysAgo / 7); // 0 = most recent week
    if (bucket < 8) {
      buckets[7 - bucket].count += 1; // S1=oldest, S8=most recent
    }
  });
  return buckets;
}
```

### Per-automation breakdown aggregation
```typescript
// In-memory aggregation after fetching executions with automation+template join
const breakdown = new Map<string, { name: string; metricLabel: string; count: number; minutes: number }>();
for (const exec of periodExecs) {
  const id = exec.automation_id;
  if (!breakdown.has(id)) {
    breakdown.set(id, {
      name: exec.automation.name,
      metricLabel: exec.automation.template?.activity_metric_label ?? "",
      count: 0,
      minutes: 0,
    });
  }
  const entry = breakdown.get(id)!;
  entry.count += 1;
  entry.minutes += exec.automation.template?.avg_minutes_per_task ?? 0;
}
const rows = [...breakdown.values()]
  .map((r) => ({ ...r, hoursSaved: Math.round((r.minutes / 60) * 10) / 10 }))
  .sort((a, b) => b.hoursSaved - a.hoursSaved);
```

### Billing total monthly charge
```typescript
// Sum monthly_price (cents) for active automations
const totalCents = activeAutomations.reduce((sum, a) => sum + (a.template?.monthly_price ?? 0), 0);
const totalDollars = (totalCents / 100).toFixed(2);
```

### Mock payment history data
```typescript
// Static mock — no DB query needed (Stripe wired in v1.2)
const mockPaymentHistory = [
  { date: new Date(now.getFullYear(), now.getMonth() - 1, 1), amount: totalCents, status: "paid", method: "•••• 4242" },
  { date: new Date(now.getFullYear(), now.getMonth() - 2, 1), amount: totalCents, status: "paid", method: "•••• 4242" },
  { date: new Date(now.getFullYear(), now.getMonth() - 3, 1), amount: totalCents, status: "paid", method: "•••• 4242" },
];
```

---

## i18n Keys Needed

Add to both `en.json` and `es.json` under `dashboard`:

**`dashboard.nav`:** Add `"reports": "Reports"` (ES: `"Reportes"`)

**`dashboard.reports`:** New namespace
```json
{
  "reports": {
    "title": "Reports",
    "period": {
      "this_month": "Este mes",
      "last_month": "Mes pasado",
      "last_3_months": "Ultimos 3 meses"
    },
    "kpi": {
      "tasksCompleted": "Tasks completed",
      "hoursSaved": "Hours saved",
      "estimatedValue": "Estimated value",
      "vsLastPeriod": "vs last period",
      "noHourlyCost": "Configura tu costo por hora para ver el valor estimado",
      "settingsLink": "Go to Settings"
    },
    "chart": {
      "title": "Weekly activity",
      "empty": "No activity in this period"
    },
    "breakdown": {
      "title": "Per-automation breakdown",
      "automationName": "Automation",
      "metricLabel": "Metric",
      "count": "Count",
      "hoursSaved": "Hours saved",
      "total": "Total",
      "viewAll": "View all ({count})",
      "showLess": "Show less"
    },
    "empty": {
      "message": "Aun no hay datos. Crea tu primera automatizacion para ver reportes aqui.",
      "cta": "Create automation"
    }
  }
}
```

**`dashboard.billing`:** New namespace
```json
{
  "billing": {
    "title": "Billing",
    "summary": {
      "title": "Monthly summary",
      "totalCharge": "Total monthly charge",
      "activeAutomations": "Active automations",
      "nextCharge": "Next charge date",
      "managePayment": "Manage payment",
      "toastMessage": "Portal de pagos disponible proximamente"
    },
    "charges": {
      "title": "Per-automation charges",
      "automation": "Automation",
      "plan": "Plan",
      "monthlyCharge": "Monthly charge",
      "total": "Total"
    },
    "history": {
      "title": "Payment history",
      "date": "Date",
      "amount": "Amount",
      "status": "Status",
      "method": "Method",
      "paid": "Paid",
      "pending": "Pending"
    },
    "empty": {
      "message": "Sin cargos activos. Activa una automatizacion para ver tu facturacion aqui.",
      "cta": "View automations"
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Client-side period fetch via useEffect | URL search params + RSC re-render | No useSearchParams needed; URL is shareable |
| Grouped bar chart for per-automation | Simple BarChart with one data series | Matches user decision: no grouped bars |

---

## Open Questions

1. **Nav order — "Reports" position**
   - What we know: CONTEXT.md says "Dashboard, Automations, Reports, Billing, Settings"
   - What's unclear: Does "Catalog" stay in nav? (It should — it's a completed feature). Reports goes between Catalog and Billing based on natural flow.
   - Recommendation: Add Reports after Catalog, before Billing: Dashboard → Automations → Catalog → Reports → Billing → Settings (Chat/Team/etc remain as-is)

2. **8-week chart label format**
   - What we know: Existing WeeklyBarChart uses "W1"–"W4"; 8-week version needs new labels
   - Recommendation: Use "S1"–"S8" (semana) to match Spanish-first product; or use short month+week labels like "Mar W1". Keep it simple: "S1"–"S8" matches existing pattern.

3. **Reports data for period: "last 3 months" — exec query window**
   - What we know: Need ~90 days of executions for the period + 90 days prior for comparison = 180 days total
   - Recommendation: Query executions with `gte(started_at, 180_days_ago)` once, filter in-memory for period vs prior period. Avoids 2 separate queries.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set in `.planning/config.json` — skipping this section.

---

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `web/src/lib/dashboard/queries.ts` — confirmed Supabase query patterns
- Codebase analysis: `web/src/components/dashboard/weekly-bar-chart.tsx` — confirmed Recharts usage + ssr:false requirement
- Codebase analysis: `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` — confirmed next/dynamic pattern
- Codebase analysis: `web/package.json` — confirmed library versions (recharts ^3.8.1, next-intl ^4.8.3)
- Codebase analysis: `supabase/migrations/20260305000002_automation_business.sql` — confirmed automation_executions schema
- Codebase analysis: `supabase/migrations/20260305000001_core_identity.sql` — confirmed organizations.settings JSONB
- Codebase analysis: `supabase/seed.sql` — confirmed hourly_cost=25 (integer dollars), subscription data
- Codebase analysis: `web/messages/en.json` — confirmed missing dashboard.nav.reports key, existing billing key
- Codebase analysis: `.planning/STATE.md` — confirmed Phase 07-03 decision: hourly_cost is integer dollars (not cents)

### Secondary (MEDIUM confidence)
- Recharts 3.x API: BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer — verified from existing working usage in codebase
- next-intl getTranslations pattern: verified from existing server component usage

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use; no new dependencies
- Architecture: HIGH — established patterns from 4 prior phases; data layer well understood
- Pitfalls: HIGH — sourced from actual codebase decisions and known DB schema constraints

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable stack — next.js/recharts/supabase)
