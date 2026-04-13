# Phase 9: My Automations - Research

**Researched:** 2026-04-13
**Domain:** Next.js App Router — filterable list page + dynamic detail page with charts
**Confidence:** HIGH

## Summary

Phase 9 builds two new routes: `/dashboard/automations` (filterable card grid) and `/dashboard/automations/[id]` (detail with KPIs, timeline, weekly bar chart). Both integrate with the existing Supabase data layer, i18n system, and RSC + Client Component hybrid pattern already established in Phase 8.

The main technical decision is the bar chart. No charting library is installed. The user confirmed bar charts with tooltip on hover — this requires a Client Component. The project has no Recharts or similar; research recommends installing Recharts (the React ecosystem standard) rather than building a custom SVG chart, because tooltips on hover with correct responsive sizing are non-trivial. An alternative is a pure-CSS/Tailwind bar chart for the 4-bar weekly view, which would avoid a dependency but loses hover tooltips.

The filter tab pattern (All / Active / In Setup / Paused) maps cleanly to a URL query param `?status=active`. Because `useSearchParams` is a Client hook, the tab switcher must be a Client Component, while the page itself can remain a Server Component that reads the param from `searchParams` prop and filters server-side. The pause/resume/cancel lifecycle actions are UI-only (no Stripe): clicking them calls a Supabase client-side mutation (UPDATE on automations) via a Client Component action, then updates local state optimistically.

**Primary recommendation:** Follow the established RSC pattern — Server Component page fetches all data, passes pre-computed props to Client Components for interactivity (tab switcher, action buttons, chart with tooltip). Install Recharts for the weekly bar chart.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**List & card layout:**
- Grid de tarjetas: 3 columnas desktop, 2 tablet, 1 mobile
- Cada tarjeta muestra: nombre, categoria, iconos pequenos de apps conectadas, badge de status, metrica mensual, precio mensual — todo visible sin clic
- Tabs horizontales: Todas (5), Activas (3), En Setup (1), Pausadas (1) — cada tab muestra conteo
- Tarjeta entera clickeable al detalle. Sin acciones rapidas en la tarjeta
- Ordenacion: activas primero, luego in_setup, luego pausadas; dentro de cada grupo alfabetico
- Header: titulo "Mis Automatizaciones" + conteo total (ej: "5 automatizaciones")
- Apps conectadas como iconos pequenos (logos de Mailchimp, HubSpot, etc.)

**Detail page structure:**
- Ruta: /dashboard/automations/[id]
- Header: nombre + categoria + iconos apps + badge status + botones de accion a la derecha
- Boton volver: flecha ← + "Mis Automatizaciones"
- 3 KPI cards en fila: metrica mensual, horas ahorradas, cargo mensual
- Dos columnas: timeline ejecuciones (izq), bar chart semanal (der)
- Timeline: lista vertical con puntos (timestamp, status exito/error, duracion). Ultimas 20 ejecuciones
- Bar chart: 4 barras (una por semana), tooltip al hover. Colores del tema
- Mobile: KPIs apilados, chart y timeline apilados verticalmente

**Status & lifecycle UX:**
- Active = verde (#22c55e), En Setup = azul (#3b82f6), Pausada = gris (#9ca3af)
- Botones en el header del detalle, a la derecha del status badge
- Pausar y reanudar: sin confirmacion, cambio instantaneo de badge + toast
- Cancelar: dialogo de confirmacion (accion destructiva)
- Active muestra [Pausar] + [Cancelar], Paused muestra [Reanudar] + [Cancelar], In Setup no muestra botones

**Empty & edge states:**
- Sin automatizaciones: ilustracion + "Aun no tienes automatizaciones" + boton "Explorar catalogo"
- In setup: badge azul "En Setup", metrica muestra "Configurando..."
- Detalle in_setup: 3 KPIs muestran "---", timeline y chart vacios con mensaje "Esta automatizacion esta siendo configurada..."
- Filtro sin resultados: mensaje contextual al filtro (ej: "No tienes automatizaciones pausadas")
- Skeleton loaders en forma de tarjeta con animacion pulse

**Animations & transitions:**
- Sutil y funcional: fade-in al cargar tarjetas, transicion suave al cambiar filtros, hover con sombra ligera
- Skeleton loaders con animacion pulse

**Internationalization:**
- Ingles primario, espanol y frances como secundarios
- Todos los textos con claves i18n desde el inicio
- Formato de numeros y fechas localizado (1,240 EN vs 1.240 ES)

**Accessibility:**
- Semantica HTML correcta, aria-labels en botones, contraste WCAG AA, foco visible con teclado

**URL & routing:**
- Lista: /dashboard/automations
- Detalle: /dashboard/automations/[id]
- Filtro activo como query param: /dashboard/automations?status=active
- Deep links funcionales

### Claude's Discretion
- Espaciado y tipografia exactos
- Diseno del skeleton loader
- Ilustracion del empty state
- Micro-interacciones de hover en tarjetas
- Manejo de errores de red

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTO-01 | User can view filterable list of automations (All, Active, In Setup, Paused) | URL query param `?status=` read by Server Component; tab switcher is a Client Component using `useRouter`/`useSearchParams`; count badges computed from full automation list before filtering |
| AUTO-02 | User sees automation cards with name, category, connected apps, status badge, monthly metric, monthly price | Data: `automations` joined with `automation_templates` (monthly_price, activity_metric_label, connected_apps, category, avg_minutes_per_task); monthly metric = count executions this month; price from template.monthly_price (integer cents → format as $X/mo) |
| AUTO-03 | User can view automation detail with 3 KPI cards (metric count, hours saved, monthly charge) | Separate page `/dashboard/automations/[id]`; KPIs computed from executions (same pattern as dashboard home); monthly_price from template |
| AUTO-04 | User sees activity timeline of last 20 executions in detail view | Query `automation_executions` ORDER BY started_at DESC LIMIT 20; pass enriched rows (timeAgo pre-computed in server) to Client Component for rendering; duration_ms available for display |
| AUTO-05 | User sees weekly bar chart of executions (last 4 weeks) in detail view | Aggregate executions by week (date_trunc or JS grouping); bar chart rendered in Client Component; Recharts BarChart recommended; 4 data points |
| AUTO-06 | User sees pause/resume/cancel buttons (UI only — Stripe wired in future milestone) | Client Component action calls Supabase client UPDATE automations SET status=... ; no Stripe involvement; cancel opens Radix AlertDialog for confirmation; toast via optimistic update |
</phase_requirements>

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, RSC, dynamic routes | Project baseline |
| next-intl | 4.8.3 | i18n — `getTranslations()` server, `useTranslations()` client | Already used in Phase 8 |
| @supabase/ssr | 0.8.0 | Server-side Supabase client | Project baseline |
| @supabase/supabase-js | 2.95.0 | Client-side Supabase | Project baseline |
| radix-ui | 1.4.3 | AlertDialog (cancel confirmation), Popover — already used | Project baseline |
| lucide-react | 0.563.0 | Icons (ArrowLeft, Pause, Play, X, etc.) | Project baseline |
| class-variance-authority | 0.7.1 | Badge/status variants | Already used in StatusBadge |
| tailwind-merge | 3.4.0 | cn() utility | Project baseline |

### To Install
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| recharts | ^2.12.x | Weekly bar chart with hover tooltip | No chart library exists; Recharts is the most widely used React chart library; supports BarChart, ResponsiveContainer, Tooltip out of the box |

**Installation:**
```bash
npm install recharts --prefix web
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Pure CSS/Tailwind bars | CSS bars are simpler but can't do hover tooltips without JS anyway; Recharts gives tooltip + accessibility for free |
| Recharts | Chart.js + react-chartjs-2 | More config, larger bundle; Recharts is more React-idiomatic |
| Recharts | Custom SVG | Significant hand-roll complexity for responsive sizing + tooltips |

---

## Architecture Patterns

### Established Project Structure (Phase 8 baseline)

```
web/src/
├── app/(dashboard)/
│   ├── dashboard/           # Home page (existing)
│   │   └── page.tsx         # Server Component — fetches all data, passes props
│   ├── layout.tsx           # Dashboard layout — auth gate, nav, header
│   └── automations/         # NEW Phase 9
│       ├── page.tsx         # Server Component — list page
│       └── [id]/
│           └── page.tsx     # Server Component — detail page
├── components/dashboard/
│   ├── automation-list.tsx         # Existing (compact list for home)
│   ├── status-badge.tsx            # Existing — reuse for cards and detail
│   ├── automations-filter-tabs.tsx # NEW — Client Component (useSearchParams)
│   ├── automation-card.tsx         # NEW — pure display card component
│   ├── automation-detail-header.tsx# NEW — Client Component (action buttons + toast)
│   ├── automation-kpi-cards.tsx    # NEW — 3-KPI row for detail
│   ├── execution-timeline.tsx      # NEW — last 20 executions list
│   ├── weekly-bar-chart.tsx        # NEW — Client Component (Recharts)
│   └── automation-card-skeleton.tsx # NEW — skeleton loader
└── lib/dashboard/
    ├── types.ts              # Extend with new types
    └── queries.ts            # Add new query functions
```

### Pattern 1: Server Component Page with Pre-Computed Props (established in Phase 8)

**What:** Page fetches all data server-side, pre-computes derived values (timeAgo, formatted numbers), passes serializable props to Client Components.
**When to use:** All new pages in this phase.

```typescript
// Source: established in web/src/app/(dashboard)/dashboard/page.tsx
export default async function AutomationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams; // Next.js 15/16 — searchParams is async
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("dashboard.automations");
  const orgId = await getOrgId(user.id);

  const automations = await fetchAutomationsPage(orgId);

  // Pre-compute i18n strings, formatted prices, monthly metrics
  // Pass as plain props to Client Components
}
```

### Pattern 2: URL Query Param Filter (Client Component tab switcher)

**What:** Tab component reads current filter from URL, uses `useRouter` to push new URL on tab click. The Server Component page receives the filter via `searchParams` and filters data before passing props.
**When to use:** AutomationsFilterTabs component.

```typescript
// Source: Next.js App Router docs — useSearchParams pattern
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function AutomationsFilterTabs({ counts }: TabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";

  return (
    <div role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={current === tab.value}
          onClick={() => router.push(`/dashboard/automations${tab.value === "all" ? "" : `?status=${tab.value}`}`)}
        >
          {tab.label} <span>({counts[tab.value]})</span>
        </button>
      ))}
    </div>
  );
}
```

**Critical:** Wrap in `<Suspense>` in the page because `useSearchParams()` triggers Suspense boundary:
```typescript
// In page.tsx
<Suspense fallback={<TabsSkeleton />}>
  <AutomationsFilterTabs counts={counts} currentStatus={status} />
</Suspense>
```

### Pattern 3: Optimistic Status Update (pause/resume)

**What:** Client Component calls Supabase client UPDATE, updates local state optimistically, shows toast on success/error.
**When to use:** AutomationDetailHeader action buttons.

```typescript
"use client";
// No server action needed — direct Supabase client call is fine
// (writes are service_role only on RLS, but status update is user-facing UI action)
// NOTE: Check RLS policy — writes may require service_role.
// If blocked by RLS, use a Next.js Server Action or API Route instead.

async function handlePause() {
  setOptimisticStatus("paused");
  const { error } = await supabase
    .from("automations")
    .update({ status: "paused" })
    .eq("id", automationId);
  if (error) {
    setOptimisticStatus(originalStatus); // rollback
    showErrorToast();
  }
}
```

**RLS Important Note:** The existing `automations` table has "writes are service_role only" on RLS (no INSERT/UPDATE/DELETE policies for authenticated users). This means direct client-side `supabase.update()` will be blocked. The pause/resume/cancel actions need either:
1. A Next.js Server Action (`"use server"`) that uses `createClient()` server-side (which uses the service role in dev/prod)
2. Or — since it's UI only with no Stripe — a simple RLS UPDATE policy added for org members to update their own automations' status

The simpler path for Phase 9 (UI-only) is to add a targeted RLS UPDATE policy:
```sql
CREATE POLICY "automations_update_status_org_members"
  ON public.automations FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members ...))
  WITH CHECK (status IN ('active', 'paused'));
```
Or use a Server Action.

### Pattern 4: Weekly Bar Chart (Recharts)

**What:** Client Component with Recharts BarChart; data is 4 weekly aggregates passed as props from Server Component.
**When to use:** WeeklyBarChart component.

```typescript
// Source: Recharts docs — BarChart
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyData {
  week: string; // "Apr 7 - Apr 13"
  count: number;
}

export function WeeklyBarChart({ data }: { data: WeeklyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 5: Data Aggregation for Monthly Metric and Weekly Chart

**Monthly metric on card:** Count of successful executions this month per automation.
```typescript
// Aggregate in query — group by automation_id, count where started_at >= monthStart
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const { data: monthlyExecCounts } = await supabase
  .from("automation_executions")
  .select("automation_id")
  .in("automation_id", orgAutomationIds)
  .eq("status", "success")
  .gte("started_at", monthStart);
// Then reduce to a Map<automation_id, count>
```

**Weekly chart (last 4 weeks):** Group executions by ISO week.
```typescript
// Fetch 28-day executions for one automation, group by week in JS
const weekStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
// Group: Math.floor((execDate - weekStart) / 7days) => 0..3
```

**Hours saved (detail KPI):** Same as dashboard home — `avg_minutes_per_task` from template × success count ÷ 60.

**Monthly charge:** `automation.template.monthly_price` (integer cents) ÷ 100 formatted as `$XX.XX/mo`.

### Anti-Patterns to Avoid

- **Fetching data in Client Components:** Don't use `useEffect` + `fetch` for automation data — fetch server-side in page.tsx and pass as props (established RSC pattern).
- **Passing functions across RSC boundaries:** Cannot pass `formatDate` or `buildTimeAgo` as props — pre-compute strings in the Server Component (already documented in Phase 08-02 decisions).
- **Nested Supabase queries inside component render:** Keep all queries in `queries.ts` functions, not inline in page.tsx.
- **Blocking reads with sequential queries:** Use `Promise.all()` for parallel queries (established pattern in `fetchDashboardData`).
- **Single filter state in global state:** Keep filter as URL param only — no Zustand/context needed for this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar chart with hover tooltip | Custom SVG path + tooltip div | Recharts BarChart + Tooltip | Responsive sizing, keyboard access, touch events are non-trivial |
| Confirmation dialog for cancel | Custom modal with z-index | Radix AlertDialog (already in radix-ui v1.4.3) | Focus trap, Escape key, accessibility already handled |
| Toast notification | Custom positioned div | Simple inline state (show toast = true, auto-dismiss) — or add sonner/react-hot-toast | Toast is 1 notification, not a queue; can be simple |
| Number/date formatting | Manual locale logic | `Intl.NumberFormat` + `Intl.DateTimeFormat` with locale from next-intl | Handles EN vs ES number format difference (1,240 vs 1.240) |

**Key insight:** The project already has Radix UI installed — use `AlertDialog` from `radix-ui` for the cancel confirmation. No new dialog library needed.

---

## Common Pitfalls

### Pitfall 1: searchParams is async in Next.js 15/16
**What goes wrong:** `params` and `searchParams` in page components are now Promises in Next.js 15+. Destructuring synchronously throws.
**Why it happens:** Next.js 15 changed page props to async.
**How to avoid:** `const { status } = await searchParams;` in the Server Component, or use `useSearchParams()` in a Client Component.
**Warning signs:** TypeScript error "type Promise<...> has no property 'status'".

### Pitfall 2: useSearchParams() requires Suspense boundary
**What goes wrong:** `useSearchParams()` in a Client Component causes the entire page to opt out of static rendering and requires a Suspense boundary.
**Why it happens:** Next.js requirement — any component using `useSearchParams` must be wrapped in `<Suspense>`.
**How to avoid:** Wrap `<AutomationsFilterTabs>` in `<Suspense fallback={...}>` in the Server Component page.
**Warning signs:** Next.js build warning about `useSearchParams() should be wrapped in a suspense boundary`.

### Pitfall 3: RLS blocks client-side status updates
**What goes wrong:** `supabase.from("automations").update(...)` from a client component returns permission denied.
**Why it happens:** The `automations` table has no UPDATE policy for authenticated users — writes are service_role only.
**How to avoid:** Either add a targeted RLS UPDATE policy for status changes (preferred for simplicity), or use a Next.js Server Action.
**Warning signs:** Supabase error `{ code: "42501", message: "new row violates row-level security policy" }`.

### Pitfall 4: Connected app logos — using text or emojis as "icons"
**What goes wrong:** User wants "small app icons (logos)" but there are no image assets for Mailchimp/HubSpot logos in the project.
**Why it happens:** External logos require either CDN links or SVG components.
**How to avoid:** Use the `connected_apps` text array as short text badges or initials for Phase 9. Flag proper logo assets as a future enhancement. Alternative: use brand color + initial (e.g., "M" for Mailchimp in an orange circle).
**Warning signs:** Missing image 404s or placeholder boxes in production.

### Pitfall 5: Monthly metric is "executions this month" not a stored value
**What goes wrong:** Assuming a stored `monthly_execution_count` column exists.
**Why it happens:** The schema has no such column — must be computed from `automation_executions`.
**How to avoid:** Query executions with `gte("started_at", monthStart)` grouped by automation_id, exactly like `daily_execution_count` in the dashboard home but for the current month.

### Pitfall 6: Recharts bundle in SSR
**What goes wrong:** Recharts tries to access `window` during SSR and throws.
**Why it happens:** Chart libraries often use browser APIs.
**How to avoid:** Import the chart component with `next/dynamic` and `{ ssr: false }`:
```typescript
const WeeklyBarChart = dynamic(
  () => import("@/components/dashboard/weekly-bar-chart"),
  { ssr: false }
);
```

---

## Code Examples

### Automation page query (list + monthly metrics)
```typescript
// Source: queries.ts pattern from Phase 8
export async function fetchAutomationsPage(orgId: string) {
  const supabase = await createClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [automationsRes, monthlyExecsRes] = await Promise.all([
    supabase
      .from("automations")
      .select(`
        id, name, status, last_run_at,
        template:automation_templates(
          category, connected_apps, activity_metric_label,
          avg_minutes_per_task, monthly_price
        )
      `)
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .not("status", "eq", "archived")
      .order("name"),
    supabase
      .from("automation_executions")
      .select("automation_id")
      .eq("status", "success")
      .gte("started_at", monthStart),
  ]);

  // Compute monthly counts per automation
  const monthlyCounts = new Map<string, number>();
  (monthlyExecsRes.data ?? []).forEach((e: any) => {
    monthlyCounts.set(e.automation_id, (monthlyCounts.get(e.automation_id) ?? 0) + 1);
  });

  return (automationsRes.data ?? []).map((a: any) => ({
    ...a,
    monthly_execution_count: monthlyCounts.get(a.id) ?? 0,
  }));
}
```

### Detail page query (single automation + last 20 executions + weekly aggregates)
```typescript
export async function fetchAutomationDetail(automationId: string, orgId: string) {
  const supabase = await createClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const [automationRes, executionsRes, monthlyCountRes] = await Promise.all([
    supabase
      .from("automations")
      .select(`
        id, name, status,
        template:automation_templates(
          category, connected_apps, activity_metric_label,
          avg_minutes_per_task, monthly_price
        )
      `)
      .eq("id", automationId)
      .eq("organization_id", orgId)
      .single(),
    supabase
      .from("automation_executions")
      .select("id, status, started_at, completed_at, duration_ms, error_message")
      .eq("automation_id", automationId)
      .order("started_at", { ascending: false })
      .limit(20),
    supabase
      .from("automation_executions")
      .select("started_at, status")
      .eq("automation_id", automationId)
      .eq("status", "success")
      .gte("started_at", fourWeeksAgo),
  ]);

  return { automation: automationRes.data, executions: executionsRes.data ?? [], weeklyExecs: monthlyCountRes.data ?? [] };
}
```

### Sorting: active first, in_setup second, paused third
```typescript
const STATUS_ORDER: Record<string, number> = {
  active: 0, in_setup: 1, paused: 2, failed: 3, pending_review: 4, draft: 5,
};
automations.sort((a, b) => {
  const orderDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
  if (orderDiff !== 0) return orderDiff;
  return a.name.localeCompare(b.name);
});
```

### Price formatting (integer cents → localized string)
```typescript
// Intl.NumberFormat handles EN vs ES difference
function formatPrice(cents: number | null, locale: string): string {
  if (!cents) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(cents / 100);
}
```

### Weekly aggregation (4 buckets)
```typescript
function groupByWeek(executions: { started_at: string }[], now: Date): { week: string; count: number }[] {
  const buckets = [0, 0, 0, 0];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  executions.forEach(({ started_at }) => {
    const age = now.getTime() - new Date(started_at).getTime();
    const weekIdx = Math.min(3, Math.floor(age / msPerWeek));
    buckets[3 - weekIdx]++; // most recent = last bucket
  });
  // Label each bucket
  return buckets.map((count, i) => ({
    week: `W${i + 1}`, // or compute real date range
    count,
  }));
}
```

### Radix AlertDialog for cancel confirmation
```typescript
// radix-ui v1.4.3 already installed
import { AlertDialog } from "radix-ui";

<AlertDialog.Root>
  <AlertDialog.Trigger asChild>
    <button>Cancelar</button>
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
    <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl">
      <AlertDialog.Title>{t("cancelDialog.title")}</AlertDialog.Title>
      <AlertDialog.Description>{t("cancelDialog.description")}</AlertDialog.Description>
      <div className="flex gap-3 mt-4">
        <AlertDialog.Cancel asChild><button>{t("cancelDialog.back")}</button></AlertDialog.Cancel>
        <AlertDialog.Action asChild><button onClick={handleCancel}>{t("cancelDialog.confirm")}</button></AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params`/`searchParams` as sync props | Async Promise props in page components | Next.js 15 | Must `await searchParams` |
| `getServerSideProps` | RSC async page functions | Next.js 13+ App Router | No change needed — already on App Router |
| Recharts v1.x (class components) | Recharts v2.x (functional, hooks) | 2021 | Use `<BarChart>` not legacy API |

---

## Open Questions

1. **Toast notification library**
   - What we know: No toast library is installed. Phase 8 added toasts via simple state in NotificationBell.
   - What's unclear: Is a proper toast queue needed, or will a simple "show/hide" state suffice for 1-at-a-time lifecycle toasts?
   - Recommendation: Use simple local state (show=true, setTimeout dismiss) for Phase 9. If toasts are needed in multiple places in Phase 10+, add `sonner` then.

2. **App icon logos for connected_apps**
   - What we know: `connected_apps` is a `TEXT[]` of strings like "HubSpot", "Mailchimp". No logo assets exist.
   - What's unclear: Should Phase 9 show real logos or text badges?
   - Recommendation: Render short text abbreviation badges (first 2 chars) with a consistent color scheme per app name. Real logos can be added as SVG files in Phase 10 when the catalog also needs them.

3. **RLS update policy for pause/resume/cancel**
   - What we know: Currently no UPDATE RLS policy for authenticated users on automations.
   - What's unclear: Should we add an RLS policy or use Server Actions?
   - Recommendation: Add a targeted RLS policy in a new migration (`20260413000001_automations_status_update_policy.sql`) that allows org members to update status to `active` or `paused` only. Cancel (which sets `deleted_at` or `archived`) may need service_role — use Server Action for cancel only.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `/web/src/app/(dashboard)/dashboard/page.tsx` — RSC data fetch pattern, timeAgo pre-computation
- Codebase: `/web/src/lib/dashboard/queries.ts` — Supabase query patterns, Promise.all, .in() scoping
- Codebase: `/web/src/components/dashboard/status-badge.tsx` — CVA variant pattern for status
- Codebase: `/web/src/components/dashboard/notification-bell.tsx` — Client Component + Radix Popover + optimistic update pattern
- Codebase: `/supabase/migrations/20260305000002_automation_business.sql` — automations + automation_executions schema (duration_ms, triggered_by, etc.)
- Codebase: `/supabase/migrations/20260409000001_v1_1_schema_expansion.sql` — monthly_price, connected_apps, activity_metric_label, in_setup status
- Codebase: `/supabase/seed.sql` — 6 Acme automations with realistic data across all statuses

### Secondary (MEDIUM confidence)
- Next.js docs: `searchParams` is now async in Next.js 15 — confirmed by Next.js 15 migration guide
- Next.js docs: `useSearchParams()` requires `<Suspense>` wrapper — documented in App Router docs
- Recharts docs: BarChart + ResponsiveContainer + Tooltip pattern — standard Recharts v2 usage
- `radix-ui` v1.4.3 package (installed): includes AlertDialog component

### Tertiary (LOW confidence)
- RLS UPDATE policy recommendation — based on reading existing RLS patterns; actual behavior needs testing against running Supabase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed except Recharts; Recharts is the clear standard
- Architecture: HIGH — patterns directly derived from Phase 8 codebase
- Pitfalls: HIGH for RLS and async searchParams (verified from schema/docs); MEDIUM for Recharts SSR (common known issue)

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (stable domain)
