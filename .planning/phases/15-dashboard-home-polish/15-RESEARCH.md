# Phase 15: Dashboard Home Polish - Research

**Researched:** 2026-04-30
**Domain:** Frontend cleanup / RSC data fetching / i18n / SUMMARY frontmatter backfill
**Confidence:** HIGH

## Summary

Phase 15 is a small, surgical gap-closure phase that finishes the audit findings on Phase 8. It has three code-level fixes (one perf, two placeholder removals/replacements) and one documentation backfill. There is no new domain to research, no new library to choose, and no architectural decision to make — every dependency, pattern, and convention is already established in the codebase. The work is mechanical: drop a discarded query, decide whether to remove or compute three placeholder values, and write four `requirements_completed` lines into existing SUMMARY frontmatter.

The single non-trivial decision is whether to **remove** or **replace** the placeholders. Investigation shows the data needed for a "real" computed value is either trivially available (period-over-period KPI trends from `automation_executions.started_at`) or already on the page but unused (`avgResponseTime` could be computed from `executions[].duration_ms` already fetched in `fetchDashboardData`). However, the audit explicitly accepts removal as a valid outcome ("either replaced ... or removed entirely"), and removing the trend UI is the simpler/cleaner path that requires no new query. There is no `+5%` `successRate` trend in the audit scope, but it appears in the same file (`page.tsx:226`) and the planner should be aware of it (out-of-scope by audit boundary, but worth flagging).

**Primary recommendation:** Remove the hardcoded placeholders rather than computing replacements. Delete the `kpiTrends` prop and `TrendIndicator` from `KpiCards`; remove `avgResponseTime` from `performanceMetrics`. Drop the redundant `notificationsPromise` in `fetchDashboardData`. Backfill SUMMARY frontmatter with the existing `requirements_completed` field shape. Total surface: 5 files, ~50 lines net deletions.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | User sees personalized greeting with their first name | Already satisfied; this phase only backfills SUMMARY frontmatter mapping. No code changes touch the greeting. |
| HOME-02 | User sees 3 KPI summary cards | Already satisfied; this phase removes the hardcoded `kpiTrends` decoration that was layered on top of HOME-02 by quick-task `4-redesign-dashboard-ui-based-on-reference` (2026-04-10). The 3 KPI cards themselves remain. Investigation confirms `KpiCards` component will need either (a) `trends` prop made optional + `TrendIndicator` rendered conditionally, or (b) the `trends` prop and `TrendIndicator` removed entirely. Recommendation: option (b) — full removal — because the redesign that introduced trends was a quick-task visual exercise, not a tracked HOME requirement. |
| HOME-04 | User sees activity feed of last 10-15 execution events | Already satisfied; this phase only removes the redundant `notifications` fetch from `fetchDashboardData` which was a sibling field bundled with the activity-feed query. The activity-feed itself (executions) keeps its query untouched. |
| I18N-01 | All new dashboard UI text in EN+ES | Already satisfied; if `kpiTrends`/`avgResponseTime` are REMOVED, then `kpiTrends.noChange` and `performance.avgResponseTime` keys become orphans (already exist in both `en.json:216-218` and `es.json:216-218`, plus `en.json:211` and `es.json:211`). Recommendation: remove the orphaned keys for parity. If the placeholders are KEPT and computed instead, the keys stay used. |
</phase_requirements>

## Standard Stack

No new libraries. All fixes use already-installed dependencies.

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router with RSC | Existing project framework |
| React | 19.2.3 | UI library | Existing |
| TypeScript | ^5 | Type safety (strict) | Existing |
| next-intl | ^4.8.3 | i18n (cookie-based) | Existing — used for any retained/removed translation keys |
| @supabase/ssr | ^0.8.0 | Server-side Supabase client | Existing |

### Supporting (already in project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.563.0 | `TrendingUp`/`TrendingDown` icons | Currently used by `KpiCards` and `AutomationSuccessRate`; will be removed from `KpiCards` if trend UI is dropped |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Removing trends entirely | Compute period-over-period from `automation_executions.started_at` (mirror Phase 11's `getPeriodRange`) | +1 SQL roundtrip per dashboard load. Pattern proven in `fetchReportsData` (`queries.ts:457-591`). Reuses `getPeriodRange` helper if exported. Only worth it if product wants the trend UI; given audit accepts removal, removing is leaner. |
| Removing `avgResponseTime` | Compute from `executions[].duration_ms` already fetched in `fetchDashboardData` | Zero extra queries — `executions` array already contains `duration_ms`. But `seed.sql:1312-1313` shows seed `duration_ms` is 2-10 seconds for all automations; the displayed value would always be `~5s` (boring, not actionable). Keeping it is dead weight on the UI. |
| Backfilling 4 SUMMARY frontmatters | Single composite SUMMARY entry under Phase 15 | Audit explicitly says "backfill for plans 08-01, 08-02, 08-04, 08-05". Per-plan backfill matches the existing `requirements_completed` field used by Phase 13 and Phase 14 SUMMARYs (verified). |

**Installation:** None required.

## Architecture Patterns

### Recommended Project Structure (no new files)

```
web/src/
├── app/(dashboard)/dashboard/page.tsx    # MODIFY: remove kpiTrends + avgResponseTime
├── lib/dashboard/queries.ts              # MODIFY: drop notificationsPromise from fetchDashboardData
├── components/dashboard/
│   ├── kpi-cards.tsx                     # MODIFY: drop trends prop + TrendIndicator (if removing)
│   └── automation-performance.tsx        # NO CHANGE — still consumes a metrics array
└── messages/{en,es}.json                 # MODIFY: drop orphaned keys (kpiTrends.*, performance.avgResponseTime)

.planning/phases/08-dashboard-home-notifications/
├── 08-01-SUMMARY.md                      # MODIFY: add requirements_completed
├── 08-02-SUMMARY.md                      # MODIFY: add requirements_completed
├── 08-04-SUMMARY.md                      # MODIFY: add requirements_completed (note: 08-04 is verification-only — see frontmatter)
└── 08-05-SUMMARY.md                      # MODIFY: add requirements_completed
```

### Pattern 1: Discarded query removal in RSC data fetcher

**What:** Query is bundled into a `Promise.all([...])` but its return value is destructured-out by every consumer. Drop the query, drop the variable, drop the field on the return shape.

**When to use:** Performance hygiene — verified zero consumers via grep.

**Example (current state vs target state):**

```typescript
// Source: web/src/lib/dashboard/queries.ts:23-141 (current)
export async function fetchDashboardData(userId: string, orgId: string) {
  // ...
  const automationsPromise = supabase.from("automations")...;

  // 2. Fetch notifications for the bell dropdown (last 20 for this user)
  const notificationsPromise = supabase
    .from("notifications")
    .select("id, type, title, message, is_read, read_at, link, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const [automationsResult, notificationsResult] = await Promise.all([
    automationsPromise,
    notificationsPromise,
  ]);

  // ...
  return { automations, executions, notifications, kpis };
}
```

```typescript
// Target — after removal
export async function fetchDashboardData(userId: string, orgId: string) {
  // userId param is no longer needed (only used by the dropped query) — see Pitfall #1
  // ...
  const { data: automationsData } = await supabase.from("automations")....;
  const automations = (automationsData ?? []) as unknown as DashboardAutomation[];
  // (no Promise.all needed if only one query remains in the parallel block)
  // ...
  return { automations, executions, kpis };
}
```

### Pattern 2: Optional/removed prop on display component

**What:** Removing trend UI from `KpiCards` requires either a soft path (prop becomes optional, `TrendIndicator` renders conditionally) or a hard path (delete the `trends` interface field, callsite, component, icons, and orphan i18n keys).

**When to use:** Hard path when the prop has a single callsite (verified — only `dashboard/page.tsx:187` passes `trends`). Soft path when multiple callsites need different behavior.

**Example (hard path — recommended):**

```typescript
// Source: web/src/components/dashboard/kpi-cards.tsx (target)
import Link from "next/link";
import { Zap, ListChecks, Clock } from "lucide-react"; // remove TrendingUp/TrendingDown
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/dashboard/types";

interface KpiCardsProps {
  kpis: KpiData;
  labels: {
    activeAutomations: string;
    tasksThisWeek: string;
    hoursSavedThisMonth: string;
  };
  // trends: { ... } REMOVED
}

// TrendIndicator function REMOVED
// trend prop on KpiCardProps REMOVED
// <TrendIndicator trend={trend} /> JSX line REMOVED

export function KpiCards({ kpis, labels }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      <KpiCard href="/dashboard/automations" icon={...} value={...} label={labels.activeAutomations} />
      {/* trend prop removed */}
    </div>
  );
}
```

### Pattern 3: SUMMARY frontmatter backfill

**What:** Add `requirements_completed: [LIST]` (or `requirements-completed:` — both forms exist in repo) to existing YAML frontmatter blocks.

**When to use:** Closing audit "documentation gap" findings. Established by Phase 13-01-SUMMARY (`requirements-completed: [CATL-01, CATL-02, CATL-03, I18N-01]`) and Phase 14-02-SUMMARY (`requirements-completed: [...]`).

**Repo style verified:** Phase 13 and Phase 14 use **kebab-case `requirements-completed`** field name. Phase 15 should match this style (NOT `requirements_completed` despite what the audit/roadmap text says — the file YAML in 13-01-SUMMARY.md:46 and 14-02-SUMMARY.md (line ~50) uses kebab-case).

**Per-plan target list:**
- `08-01-SUMMARY.md`: i18n keys + types + queries + StatusBadge → `requirements-completed: [HOME-02, HOME-03, HOME-04, NOTF-01, I18N-01]` (provides the data shape and i18n keys for all home cards + notification list)
- `08-02-SUMMARY.md`: KpiCards + AutomationList + ActivityFeed + dashboard page → `requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, I18N-01]` (the dashboard page itself ships)
- `08-04-SUMMARY.md`: verification-only plan (current frontmatter is minimal `phase/plan/status/started/completed` per file inspection) → `requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01]` (UAT verified everything green)
- `08-05-SUMMARY.md`: mobile NotificationBell + greeting CTA → already has `provides: [HOME-05, NOTF-02]` in dependency graph; add explicit `requirements-completed: [HOME-05, NOTF-02, I18N-01]`

Note: 08-03-SUMMARY (notification bell) is NOT in the audit scope (it already says `provides: ...NotificationBell`), but the audit only flagged 01/02/04/05. Stick to the 4 files specified.

### Anti-Patterns to Avoid

- **Replacing placeholder with another placeholder:** "fix" the `+12%` by computing a fake delta from a single data point. If trend UI is kept, the computation MUST be a true period-over-period delta from real data (mirror `fetchReportsData`'s pattern).
- **Backfilling SUMMARY frontmatter for plans not in the audit scope:** Audit names exactly four plans (01, 02, 04, 05). Don't drift into 08-03 or any other phase.
- **Removing `notifications` field from the return type but leaving the query:** Both query AND return-shape field must go. Otherwise TypeScript users may consume a perpetually empty `notifications: []` field thinking the data is just empty.
- **Forgetting that `userId` parameter is only used by the dropped query:** After removal, `userId` is dead in `fetchDashboardData`. Either drop the param (callsite update needed in `page.tsx:60`) OR keep it for future use with a comment. Prefer dropping for honesty; small callsite churn.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Period-over-period KPI delta computation | Custom date-range diff logic | If keeping trends, reuse `getPeriodRange` from `lib/dashboard/queries.ts:374-415` (already proven in Phase 11) | Same query shape, same units, same TZ handling |
| Locale-aware percentage formatting | Manual `+`/`-` prefix concatenation | `Intl.NumberFormat(locale, { signDisplay: 'exceptZero', style: 'percent' })` | Already used in `kpi-cards.tsx:formatNumber`. Spanish negative-sign placement differs from English. |
| Relative timestamp formatting | New helper | Use existing `@/lib/utils/time` `formatRelativeTime` (Phase 14-02 deliverable) | Single source of truth; supports both client and server translators |

**Key insight:** This phase has zero "build something new" work. Every fix is "remove dead code" or "wire to existing helper". If the planner finds themselves adding new helpers, they're scope-creeping.

## Common Pitfalls

### Pitfall 1: Dropping query but leaving its parameter

**What goes wrong:** `fetchDashboardData(userId, orgId)` keeps the `userId` parameter even after the only consumer of it (the notifications query) is dropped. ESLint may not flag because it's a function parameter (warned by `@typescript-eslint/no-unused-vars` only with the `argsIgnorePattern` config check; project lint baseline already shows 1584 warnings per Phase 13 STATE.md, so a new dead-param warning won't block the build).

**Why it happens:** Cargo-cult signature preservation.

**How to avoid:** Either (a) drop `userId` from the signature and update the callsite in `dashboard/page.tsx:60` to pass only `orgId`, OR (b) keep it but add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` and a comment "reserved for future user-scoped queries". Recommendation: drop it. Function is single-callsite (verified by grep — only `dashboard/page.tsx:60` calls it).

**Warning signs:** ESLint warning on unused parameter; reviewer asking "why does this take userId?"

### Pitfall 2: Orphan i18n keys after removal

**What goes wrong:** Removing `avgResponseTime` from `performanceMetrics` array leaves `dashboard.home.performance.avgResponseTime` key alive in `en.json:211` and `es.json:211` with no consumer. Same for `dashboard.home.kpiTrends.noChange` (`en.json:216-218`, `es.json:216-218`).

**Why it happens:** Code change scoped to TSX, JSON files forgotten.

**How to avoid:** After deleting consumer, grep for the key string in `web/src` to confirm zero usages, then delete from both locale JSON files. Pattern: `grep -rn "performance.avgResponseTime\|kpiTrends.noChange" web/src messages/`. If the planner chooses to KEEP the keys (for "future use"), document that decision in the SUMMARY.

**Warning signs:** `Unused i18n key` if a tooling check is run; bilingual JSON drift over time.

### Pitfall 3: Mass-drift in SUMMARY frontmatter format

**What goes wrong:** Phase 8 plans use **mixed YAML key styles** — `08-01` uses `dependency_graph:`/`tech_stack:`/`key_files:` (snake_case keys), while `08-03` and Phase 13/14 use `tech-stack:`/`key-files:`/`requirements-completed:` (kebab-case). Adding `requirements_completed:` to 08-01 would visually clash with its existing snake_case style; adding `requirements-completed:` would clash with 08-01's snake_case but match the repo's newer style.

**Why it happens:** Frontmatter style evolved between phases; YAML accepts both.

**How to avoid:** **Match the existing style of each individual file**. For 08-01 and 08-02 (snake_case): add `requirements_completed: [LIST]`. For 08-04 (minimal frontmatter): add a new `requirements-completed: [LIST]` line keeping the file's existing style or following the newer kebab-case norm. For 08-05 (snake_case): add `requirements_completed: [LIST]`. **Verify each file before editing**.

**Warning signs:** Linter accepts both, but a casual reader may flag the inconsistency. Document the per-file style match in the plan.

### Pitfall 4: KPI removal breaks dashboard layout

**What goes wrong:** `KpiCards` currently renders the trend at the bottom of each card with `mt-1.5` spacing. Removing `<TrendIndicator>` reduces card height by ~24px (1 line of text + spacing). This is fine alone, but the `KpiCards` is in a `lg:col-span-2` cell next to `TopAutomationCard` — heights may now mismatch on `lg` viewport. Phase 8-04 verification screenshots may need re-review.

**Why it happens:** Removing a UI element changes vertical rhythm.

**How to avoid:** Visual UAT step in Plan: load `/dashboard` at `≥lg` breakpoint, screenshot, compare card heights. Add `min-h-[X]` on `KpiCard` if heights diverge. Likely no fix needed because each `KpiCard` already has `p-6` and the icon/value/label content is taller than the trend was — but verify.

**Warning signs:** Visual regression flagged in UAT; user reports "looks weird now".

### Pitfall 5: `successRate` trend "+5%" is hardcoded too

**What goes wrong:** Phase 15 audit scope is `kpiTrends` + `avgResponseTime` + `notificationsPromise` + 4 SUMMARY backfills. But `dashboard/page.tsx:226` ALSO has `trend="+5%"` as a hardcoded prop on `<AutomationSuccessRate>`. This is a sibling placeholder that the audit did NOT call out (it's not in the LOW-2 line items).

**Why it happens:** Same redesign quick-task introduced all the placeholders together.

**How to avoid:** **DO NOT** silently fix it as part of this phase — it would extend the scope and create traceability ambiguity. Two options: (a) leave it as-is (most conservative — matches audit scope exactly); (b) explicitly include it in CONTEXT/PLAN as "in-scope expansion since it's identical-shape work in the same file" with rationale. Recommendation: leave it; flag in 15-CONTEXT.md as an open question for the user to decide.

**Warning signs:** User asking "why didn't you fix the success rate trend too while you were in there?"

## Code Examples

Verified patterns from this codebase:

### Example 1: Period-over-period delta (if computing trends)

```typescript
// Source: web/src/lib/dashboard/queries.ts:457-555 (fetchReportsData pattern)
const { start, end, prevStart, prevEnd } = getPeriodRange("this_month", now);

// Fetch executions covering both periods in one round-trip
const { data: allExecs } = await supabase
  .from("automation_executions")
  .select("automation_id, started_at, status")
  .in("automation_id", orgAutomationIds)
  .eq("status", "success")
  .gte("started_at", prevStart)
  .lte("started_at", end);

const startMs = new Date(start).getTime();
const prevEndMs = new Date(prevEnd).getTime();

const periodExecs = allExecs.filter(e => new Date(e.started_at).getTime() >= startMs);
const prevExecs   = allExecs.filter(e => new Date(e.started_at).getTime() <= prevEndMs);

const tasksChange = prevExecs.length > 0
  ? Math.round(((periodExecs.length - prevExecs.length) / prevExecs.length) * 100)
  : null;
```

### Example 2: Discarded result removal (target shape)

```typescript
// Source: web/src/lib/dashboard/queries.ts:23-141 (target after Plan 15-XX)
export async function fetchDashboardData(orgId: string) {
  const supabase = await createClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch automations with template data
  const { data: automationsData } = await supabase
    .from("automations")
    .select(`...`)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .not("status", "eq", "archived")
    .order("created_at", { ascending: false });

  const automations = (automationsData ?? []) as unknown as DashboardAutomation[];
  const orgAutomationIds = automations.map(a => a.id);

  // 2. Activity-feed executions (was Step 3 — keep)
  let executions: DashboardExecution[] = [];
  if (orgAutomationIds.length > 0) {
    // ... unchanged
  }

  // 3. KPIs (was Step 4 — keep)
  // ...

  // 4. daily_execution_count (was Step 5 — keep)
  // ...

  return { automations, executions, kpis };  // notifications field DROPPED
}
```

### Example 3: SUMMARY frontmatter backfill (matching repo style)

```yaml
# Source: pattern verified in 13-01-SUMMARY.md:46 and 14-02-SUMMARY.md (~line 50)
# For 08-04-SUMMARY.md (verification-only plan with minimal frontmatter):
---
phase: 08-dashboard-home-notifications
plan: 04
status: complete
started: 2026-04-10
completed: 2026-04-10
requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01]
---

# For 08-01-SUMMARY.md (existing snake_case keys):
---
phase: 08-dashboard-home-notifications
plan: "01"
subsystem: frontend/dashboard
# ... existing keys ...
requirements_completed: [HOME-02, HOME-03, HOME-04, NOTF-01, I18N-01]
metrics:
  duration: ~8 minutes
# ...
---
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline relative-time formatting per surface | Shared `@/lib/utils/time` `formatRelativeTime(date, t)` helper | Phase 14-02 (2026-04-30) | Already shipped; this phase doesn't touch the activity feed's time strings, so no migration needed |
| Hardcoded `kpiTrends` placeholders | (To be decided) — remove or compute | This phase | Closes audit LOW-2 + tech-debt items |
| `requirements_completed`/`requirements-completed` field absent on Phase 8 plans | Backfilled per audit recommendation | This phase | Closes audit "SUMMARY frontmatter missing" tech-debt |

**Deprecated/outdated:**
- The `kpiTrends` and `avgResponseTime` placeholders date from quick-task `4-redesign-dashboard-ui-based-on-reference` (2026-04-10, commit `41cdcec`) — a visual-only redesign that did not have backing data infrastructure. They have lived as `// TODO` for ~3 weeks.

## Open Questions

1. **Remove placeholders or compute them?**
   - What we know: Audit accepts both ("either replaced ... or removed entirely"). Computing would require ~1 extra query for KPI trends; `avgResponseTime` could use already-fetched `executions[].duration_ms` (zero new query).
   - What's unclear: Product's intent for the trend UI. The redesign quick-task added it for visual richness, but no requirement (HOME-02) actually demands it.
   - Recommendation: **Remove**. Cleaner, smaller diff, fewer code paths to maintain. If the user wants to keep the look, surface it as a discretion question in CONTEXT.md and provide both removal and computation paths in the plan.

2. **What about the `+5%` hardcoded trend on `AutomationSuccessRate`?**
   - What we know: It's hardcoded the same way at `dashboard/page.tsx:226`. Audit did NOT include it in scope (LOW-2 lists three specific items, this is not one).
   - What's unclear: Whether the user wants Phase 15 to extend scope or stick rigidly to the audit list.
   - Recommendation: Surface as discretion question in CONTEXT.md. If included, it's literally one more line to remove and the i18n key `successRate.trendLabel` becomes an orphan candidate.

3. **Drop `userId` from `fetchDashboardData` signature?**
   - What we know: Single callsite (verified by grep). Removing the parameter is a 1-line callsite change.
   - What's unclear: Whether to keep it for "future user-scoped queries" — but YAGNI argues against speculation.
   - Recommendation: **Drop it**. Minimal diff, honest signature. Add it back when needed.

4. **Per-plan SUMMARY frontmatter style consistency?**
   - What we know: 08-01/02/05 use snake_case (`dependency_graph`, `key_files`); 08-03 uses kebab-case (`dependency-graph`, `key-files`); 08-04 has minimal status-only frontmatter; Phase 13/14 use kebab-case (`requirements-completed`).
   - What's unclear: Whether to standardize all 4 to one style during the backfill OR match each file's existing style.
   - Recommendation: **Match each file's existing style**. Standardization is a separate concern. Use `requirements_completed` (snake) for 08-01/02/05; use `requirements-completed` (kebab) for 08-04 (matching the repo's newer style for new fields in minimal frontmatter).

## Sources

### Primary (HIGH confidence)
- `web/src/lib/dashboard/queries.ts:24-141` — `fetchDashboardData` source code, confirms unused `notifications` (line 49-54, 62, 140)
- `web/src/app/(dashboard)/dashboard/page.tsx:60, 137-146, 226` — confirms callsite of `fetchDashboardData` destructures only `automations, executions, kpis`; confirms `kpiTrends` placeholder shape; confirms sibling `+5%` placeholder on `AutomationSuccessRate`
- `web/src/app/(dashboard)/layout.tsx:22-30` — confirms layout's separate notifications fetch (the actual source of truth)
- `web/src/components/dashboard/kpi-cards.tsx` — confirms `trends` prop interface and `TrendIndicator` sub-component to remove
- `web/src/components/dashboard/automation-performance.tsx` — confirms simple `metrics: PerformanceMetric[]` shape; removing one entry is non-structural
- `web/messages/en.json:211, 216-218` and `es.json:211, 216-218` — confirms i18n keys that become orphaned if removal path chosen
- `supabase/migrations/20260305000002_automation_business.sql:113-128` — `automation_executions` schema with `duration_ms INTEGER` available
- `supabase/seed.sql:1312-1313, 1330` — confirms seeded `duration_ms` is 2-10 seconds (avgResponseTime would always show ~5s)
- `.planning/v1.1-MILESTONE-AUDIT.md:185-213, 244` — audit scope and recommended fixes
- `.planning/REQUIREMENTS.md:127-135` — HOME-01..05 + I18N-01 requirement definitions, gap-closure annotations
- `.planning/ROADMAP.md:153-164` — Phase 15 success criteria
- `.planning/STATE.md:226-239` — Phase 14 decisions (sister gap-closure phase, frontmatter pattern reference)
- `.planning/phases/13-catalog-coverage-fix/13-01-SUMMARY.md:46` — `requirements-completed:` field shape (kebab-case)
- `.planning/phases/14-i18n-security-hygiene/14-02-SUMMARY.md` — `requirements-completed:` field shape (kebab-case)
- `.planning/phases/08-dashboard-home-notifications/08-01..05-SUMMARY.md` — existing frontmatter shape per file (mixed snake/kebab styles)
- `web/package.json` — confirms next-intl 4.8.3 and no test framework configured

### Secondary (MEDIUM confidence)
- next-intl 4.x `useTranslations` / `getTranslations` patterns — already in use throughout dashboard, no new pattern needed

### Tertiary (LOW confidence)
- None for this phase — all findings cross-verified against repo source

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all helpers already in repo
- Architecture: HIGH — all changes are deletions or wiring to existing patterns
- Pitfalls: HIGH — verified by direct source inspection (lint baseline, frontmatter style mix, i18n orphans)
- Scope discipline: MEDIUM — audit boundary vs. sibling `+5%` placeholder is a real ambiguity to resolve in CONTEXT

**Research date:** 2026-04-30
**Valid until:** 30 days (low-volatility phase: removal/cleanup work, no third-party API surface)
