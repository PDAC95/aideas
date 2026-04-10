---
phase: quick
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/dashboard/kpi-cards.tsx
  - web/src/components/dashboard/automation-list.tsx
  - web/src/components/dashboard/activity-feed.tsx
  - web/src/components/dashboard/automation-success-rate.tsx
  - web/src/components/dashboard/automation-performance.tsx
  - web/src/components/dashboard/top-automation-card.tsx
  - web/src/app/(dashboard)/dashboard/page.tsx
  - web/messages/en.json
  - web/messages/es.json
autonomous: true
requirements: [QUICK-4]

must_haves:
  truths:
    - "KPI cards show trend percentage indicators (e.g. +12%) with up/down arrows"
    - "A featured 'Top Automation' gradient card highlights the most-executed automation"
    - "Automation Success Rate displays as a large percentage with trend indicator"
    - "Automation Performance section shows summary metrics table"
    - "Activity feed has status icons instead of plain dots"
    - "Automation list is restyled as 'Top Automations' ranked by execution count"
    - "Greeting subtitle matches reference style"
    - "Purple accent color scheme throughout"
    - "All new text has EN and ES translations"
  artifacts:
    - path: "web/src/components/dashboard/kpi-cards.tsx"
      provides: "Redesigned KPI cards with trend indicators"
    - path: "web/src/components/dashboard/top-automation-card.tsx"
      provides: "Featured gradient card for top automation"
    - path: "web/src/components/dashboard/automation-success-rate.tsx"
      provides: "Success rate percentage display"
    - path: "web/src/components/dashboard/automation-performance.tsx"
      provides: "Performance metrics table"
    - path: "web/src/components/dashboard/activity-feed.tsx"
      provides: "Enhanced activity feed with icons"
    - path: "web/src/components/dashboard/automation-list.tsx"
      provides: "Restyled as Top Automations ranking"
    - path: "web/src/app/(dashboard)/dashboard/page.tsx"
      provides: "Recomposed dashboard layout"
  key_links:
    - from: "web/src/app/(dashboard)/dashboard/page.tsx"
      to: "all dashboard components"
      via: "props computed server-side from existing queries.ts data"
      pattern: "import.*from.*components/dashboard"
---

<objective>
Redesign the dashboard home page to match a modern reference design with purple accent styling, KPI trend indicators, featured automation card, success rate display, performance metrics, and enhanced activity feed.

Purpose: Transform the functional but basic dashboard into a polished, data-rich experience that immediately communicates automation ROI to AIDEAS customers.
Output: 6 component files (3 modified, 3 new), updated page layout, EN+ES translations.
</objective>

<execution_context>
@C:/Users/patri/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/patri/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@web/src/app/(dashboard)/dashboard/page.tsx
@web/src/components/dashboard/kpi-cards.tsx
@web/src/components/dashboard/automation-list.tsx
@web/src/components/dashboard/activity-feed.tsx
@web/src/lib/dashboard/queries.ts
@web/src/lib/dashboard/types.ts
@web/messages/en.json
@web/messages/es.json

<interfaces>
From web/src/lib/dashboard/types.ts:
```typescript
export interface DashboardAutomation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'failed' | 'in_setup' | 'pending_review' | 'draft' | 'archived';
  last_run_at: string | null;
  template: {
    connected_apps: string[] | null;
    activity_metric_label: string | null;
    avg_minutes_per_task: number | null;
  } | null;
  daily_execution_count: number;
}

export interface DashboardExecution {
  id: string;
  automation_id: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  automation: { name: string; };
}

export interface KpiData {
  activeAutomations: number;
  tasksThisWeek: number;
  hoursSavedThisMonth: number;
}
```

From web/src/lib/dashboard/queries.ts — fetchDashboardData returns:
```typescript
{ automations: DashboardAutomation[], executions: DashboardExecution[], notifications: DashboardNotification[], kpis: KpiData }
```
Note: queries.ts must NOT be modified. All new computed values (success rate, top automation, performance metrics) are derived in page.tsx from the existing return data.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create new components and redesign existing ones</name>
  <files>
    web/src/components/dashboard/kpi-cards.tsx
    web/src/components/dashboard/automation-list.tsx
    web/src/components/dashboard/activity-feed.tsx
    web/src/components/dashboard/top-automation-card.tsx
    web/src/components/dashboard/automation-success-rate.tsx
    web/src/components/dashboard/automation-performance.tsx
  </files>
  <action>
**All components are server components (no "use client"). All text comes via translation props — never import or call t() directly. Use lucide-react icons. Keep dark: classes on everything. Use purple accent colors (purple-600/purple-500/purple-100/purple-900) as the primary accent, replacing blue where appropriate.**

**1. Redesign `kpi-cards.tsx`:**
- Keep the existing 3-card grid layout and KpiCardsProps interface
- Add a `trends` prop to KpiCardsProps: `trends: { activeAutomations: string; tasksThisWeek: string; hoursSavedThisMonth: string }` — these are pre-formatted strings like "+12%" passed from page.tsx
- Make the number larger: `text-3xl font-bold` instead of `text-2xl`
- Below each number+label, add a trend indicator row: small `TrendingUp` or `TrendingDown` icon (from lucide-react) + the trend string in green (positive) or red (negative). Parse the first character of the trend string to determine direction ('+' or no prefix = up/green, '-' = down/red)
- Change icon backgrounds to use subtle purple tints for the third card, keep emerald for first and blue for second
- Add subtle hover scale: `hover:scale-[1.02] transition-all`

**2. Create `top-automation-card.tsx`:**
- Props: `{ automationName: string; executionCount: number; statusLabel: string; translations: { title: string; executions: string; status: string } }`
- A full-width card with a purple gradient background: `bg-gradient-to-r from-purple-600 to-pink-500`
- White text throughout
- Title "Top Automation" (from translations.title) at top-left in small caps/semibold
- Large automation name below
- Two stat pills at bottom: execution count + status badge
- Min height: `min-h-[140px]`, rounded-xl, padding p-6
- If automationName is empty string, render nothing (return null) — handles edge case of no automations

**3. Create `automation-success-rate.tsx`:**
- Props: `{ rate: number; trend: string; translations: { title: string; trendLabel: string } }`
- Card with white/dark bg, rounded-xl, border, shadow-sm (matching other cards)
- Title from translations.title at top
- Large centered percentage: `text-4xl font-bold text-purple-600 dark:text-purple-400` showing `rate` + "%" 
- Below it, trend indicator (same pattern as KPI cards — TrendingUp/Down icon + trend string)
- If rate is 0, show "—" instead of "0%"

**4. Create `automation-performance.tsx`:**
- Props: `{ metrics: { label: string; value: string }[]; translations: { title: string } }`
- Card container matching other cards (white/dark bg, rounded-xl, border, shadow-sm)
- Title from translations.title
- Render metrics as a clean list/table: each row has label (left, text-sm text-muted-foreground) and value (right, text-sm font-semibold text-gray-900 dark:text-white)
- Rows separated by thin dividers (divide-y)
- Expect 3-4 metrics passed from page.tsx (Avg Response Time, Total Executions, Success Rate, Active Automations)

**5. Restyle `automation-list.tsx` as "Top Automations":**
- Keep the existing AutomationListProps interface but add `rankByExecutions: boolean` as optional prop (default false for backwards compat, but page.tsx will pass sorted automations + true)
- When rankByExecutions is true, show a rank number (#1, #2, #3...) before each automation name using `text-purple-600 dark:text-purple-400 font-bold text-sm` styling
- Change the "View All" link color from blue to purple: `text-purple-600 dark:text-purple-400`
- Limit display to top 5 automations (slice in component)
- Keep the existing StatusBadge and daily metric display
- Change the CTA button border and hover from blue to purple accent

**6. Enhance `activity-feed.tsx`:**
- Replace the plain 2px status dots with lucide-react icons inside small colored circles (24x24):
  - success: `CheckCircle2` icon in emerald circle bg
  - error: `XCircle` icon in red circle bg  
  - running: `Loader2` icon in blue circle bg (add `animate-spin` class)
  - cancelled: `MinusCircle` icon in gray circle bg
- Make each icon 14x14 (`h-3.5 w-3.5`) inside a 24x24 (`h-6 w-6`) rounded-full container with light background tint
- Add a subtle description line below automation name showing the status text: `text-xs text-muted-foreground` — use a new `statusLabels` field in translations prop: `statusLabels: Record<string, string>` with keys "success", "error", "running", "cancelled"
- Change "View all" link to purple accent color
  </action>
  <verify>
Run `cd C:/dev/12ai/web && npx tsc --noEmit 2>&1 | head -30` — no type errors in dashboard component files.
  </verify>
  <done>All 6 component files exist, compile without type errors, use purple accent colors, have dark mode support, and accept all text via translation props.</done>
</task>

<task type="auto">
  <name>Task 2: Recompose page layout, compute new data, add translations</name>
  <files>
    web/src/app/(dashboard)/dashboard/page.tsx
    web/messages/en.json
    web/messages/es.json
  </files>
  <action>
**1. Add translation keys to `en.json` under `dashboard.home`:**

```json
"topAutomation": {
  "title": "Top Automation",
  "executions": "executions today",
  "status": "Status"
},
"successRate": {
  "title": "Automation Success Rate",
  "trendLabel": "vs last week"
},
"performance": {
  "title": "Automation Performance",
  "avgResponseTime": "Avg. Response Time",
  "totalExecutions": "Total Executions",
  "successRate": "Success Rate",
  "activeAutomations": "Active Automations"
},
"activityFeed": {
  ...existing keys...,
  "statusLabels": {
    "success": "Completed successfully",
    "error": "Failed with error",
    "running": "Currently running",
    "cancelled": "Cancelled"
  }
},
"kpiTrends": {
  "noChange": "0%"
},
"subtitle": "Here are the most important things for the day"
```

Note: The subtitle key already exists — update its value from "Here's how your automations are doing" to "Here are the most important things for the day" to match the reference design.

**2. Add matching Spanish translations to `es.json`:**

```json
"topAutomation": {
  "title": "Automatizacion principal",
  "executions": "ejecuciones hoy",
  "status": "Estado"
},
"successRate": {
  "title": "Tasa de exito de automatizaciones",
  "trendLabel": "vs semana pasada"
},
"performance": {
  "title": "Rendimiento de automatizaciones",
  "avgResponseTime": "Tiempo promedio de respuesta",
  "totalExecutions": "Ejecuciones totales",
  "successRate": "Tasa de exito",
  "activeAutomations": "Automatizaciones activas"
},
"activityFeed": {
  ...existing keys...,
  "statusLabels": {
    "success": "Completado exitosamente",
    "error": "Fallo con error",
    "running": "En ejecucion",
    "cancelled": "Cancelado"
  }
},
"kpiTrends": {
  "noChange": "0%"
},
"subtitle": "Estas son las cosas mas importantes del dia"
```

Use proper accented characters where appropriate (ejecucion → ejecución, etc.).

**3. Rewrite `page.tsx` layout:**

Keep ALL existing imports, auth checks, org checks, greeting logic, timeAgo logic, and data fetching from fetchDashboardData unchanged. Add new imports for the 3 new components.

Add these computations AFTER the existing `kpis` and `enrichedExecutionsFinal` data (all server-side in page.tsx, NOT in queries.ts):

```typescript
// Top automation — sort by daily_execution_count descending, pick first
const sortedAutomations = [...automations].sort((a, b) => b.daily_execution_count - a.daily_execution_count);
const topAutomation = sortedAutomations[0] ?? null;

// Success rate — from all executions in the fetched set
const totalExecs = executions.length;
const successExecs = executions.filter(e => e.status === 'success').length;
const successRate = totalExecs > 0 ? Math.round((successExecs / totalExecs) * 100) : 0;

// KPI trends — hardcoded as "+12%" for now since we don't have historical comparison data yet
// TODO: compute real trends when weekly snapshot data is available
const kpiTrends = {
  activeAutomations: "+12%",
  tasksThisWeek: "+8%",
  hoursSavedThisMonth: "+15%",
};

// Performance metrics
const avgResponseTime = "< 1 min";  // placeholder — real value needs execution duration tracking
const performanceMetrics = [
  { label: t("performance.avgResponseTime"), value: avgResponseTime },
  { label: t("performance.totalExecutions"), value: String(totalExecs) },
  { label: t("performance.successRate"), value: `${successRate}%` },
  { label: t("performance.activeAutomations"), value: String(kpis.activeAutomations) },
];
```

**4. New page layout structure** (replace current return JSX):

```
<div>
  {/* Row 1: Greeting — keep existing but update subtitle text (translation key already updated) */}
  <div> greeting + subtitle + "+ New automation" button (change button from bg-blue-600 to bg-purple-600 hover:bg-purple-700) </div>

  {/* Row 2: KPI Cards + Top Automation Card — use grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
    {/* KPI cards take 2 columns on lg */}
    <div className="lg:col-span-2">
      <KpiCards kpis={kpis} labels={...} trends={kpiTrends} />
    </div>
    {/* Top automation card takes 1 column */}
    <TopAutomationCard
      automationName={topAutomation?.name ?? ""}
      executionCount={topAutomation?.daily_execution_count ?? 0}
      statusLabel={topAutomation ? (statusLabels[topAutomation.status] ?? topAutomation.status) : ""}
      translations={{ title: t("topAutomation.title"), executions: t("topAutomation.executions"), status: t("topAutomation.status") }}
    />
  </div>

  {/* Row 3: 2-column — Top Automations (left) + right column with Success Rate + Performance stacked */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <AutomationList
      automations={sortedAutomations}
      rankByExecutions={true}
      translations={...existing translation props...}
    />
    <div className="flex flex-col gap-6">
      <AutomationSuccessRate
        rate={successRate}
        trend="+5%"
        translations={{ title: t("successRate.title"), trendLabel: t("successRate.trendLabel") }}
      />
      <AutomationPerformance
        metrics={performanceMetrics}
        translations={{ title: t("performance.title") }}
      />
    </div>
  </div>

  {/* Row 4: Activity Feed — full width */}
  <div className="mt-6">
    <ActivityFeed
      executions={enrichedExecutionsFinal}
      translations={{
        ...existing props...,
        statusLabels: {
          success: t("activityFeed.statusLabels.success"),
          error: t("activityFeed.statusLabels.error"),
          running: t("activityFeed.statusLabels.running"),
          cancelled: t("activityFeed.statusLabels.cancelled"),
        },
      }}
    />
  </div>
</div>
```

Key constraints:
- Do NOT modify queries.ts — all new computations happen in page.tsx
- Do NOT add "use client" to page.tsx — it remains a server component
- Keep the existing auth check, org check, and no-org empty state at the top unchanged
- Pass the existing `statusLabels` record to AutomationList exactly as before
  </action>
  <verify>
Run `cd C:/dev/12ai/web && npx tsc --noEmit 2>&1 | head -30` — no type errors. Then run `cd C:/dev/12ai/web && npx next build 2>&1 | tail -20` — build succeeds with no errors.
  </verify>
  <done>Dashboard page renders with new layout: KPI cards with trends (row 1), top automation gradient card (row 1 right), top automations list ranked (row 2 left), success rate + performance metrics (row 2 right), enhanced activity feed (row 3 full width). All text in EN and ES. Purple accent throughout. No modifications to queries.ts.</done>
</task>

</tasks>

<verification>
1. `cd C:/dev/12ai/web && npx tsc --noEmit` — zero type errors
2. `cd C:/dev/12ai/web && npx next build` — build succeeds
3. Visual: dashboard shows purple accent styling, KPI trend arrows, gradient top automation card, ranked automation list, success rate percentage, performance metrics table, enhanced activity feed with status icons
</verification>

<success_criteria>
- Dashboard matches reference design aesthetic: large KPI numbers with trends, gradient featured card, clean metrics sections
- Purple accent color scheme replaces blue in all dashboard components
- All 3 new components render correctly with mock/computed data from existing queries
- Activity feed shows status icons (CheckCircle2, XCircle, Loader2, MinusCircle) instead of plain dots
- Automation list displays rank numbers and is sorted by execution count
- EN and ES translation files contain all new keys
- No modifications to queries.ts
- TypeScript compiles, Next.js builds
</success_criteria>

<output>
After completion, create `.planning/quick/4-redesign-dashboard-ui-based-on-reference/4-SUMMARY.md`
</output>
