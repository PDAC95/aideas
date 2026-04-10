# Phase 8: Dashboard Home & Notifications - Research

**Researched:** 2026-04-10
**Domain:** Next.js 16 Server Components + Supabase data fetching + next-intl i18n + Tailwind CSS v4 dashboard UI
**Confidence:** HIGH

## Summary

Phase 8 builds the first real data-driven screen of the AIDEAS dashboard. The foundation is already solid: Next.js 16 App Router, Supabase SSR with RLS, next-intl 4.x for i18n, and shadcn-style Tailwind v4 UI components. The existing `(dashboard)/layout.tsx` provides the sidebar (via `DashboardNav`) and authenticated user via `createClient()`. The dashboard page (`(dashboard)/dashboard/page.tsx`) is a stub that just shows a greeting — Phase 8 replaces it with real content.

The technical work splits cleanly into three domains:
1. **Data layer** — Supabase queries to compute KPI values, fetch automations list, fetch recent executions, and fetch/update notifications. All reads go through the existing Server Component + RLS pattern. The single write action (mark-all-as-read) uses a Client Action calling Supabase directly (matching the "Settings writes direct to Supabase" pattern in STATE.md).
2. **UI layer** — Dashboard page layout (greeting, 3 KPIs, 2-column: automations + activity feed), plus the notification bell in the nav header. The nav currently has no header/topbar — the bell placement requires adding a topbar element to `DashboardNav` or creating a separate header component inside the dashboard layout.
3. **i18n layer** — Add `dashboard.home.*` and `dashboard.notifications.*` namespaces to `en.json` and `es.json`. The existing `dashboard.*` namespace has a stub greeting and nav items; Phase 8 adds the real dashboard home keys.

No new npm dependencies are needed. `lucide-react` (already installed) covers all icons. `radix-ui` (already installed) provides the popover primitive for the notification dropdown. Supabase queries are all standard `.select()` with filters — no custom RPC needed.

**Primary recommendation:** Build the dashboard page as a pure async Server Component doing 4 parallel Supabase queries (`Promise.all`), pass data down to Client Components only where interactivity is needed (notification dropdown, mark-all-as-read). Keep the KPI cards, automation list, and activity feed as Server Components rendered with Suspense boundaries for independent loading.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Greeting**: Time-of-day based in Spanish: "Buenos días / Buenas tardes / Buenas noches, {firstName}" — uses user's local time
- **Greeting CTA**: "+ Nueva automatización" button appears in TWO places: next to the greeting header AND at the bottom of the automation list
- **Greeting subtitle**: Subtitle/context line below the name
- **KPI cards**: 3 cards — active automations, tasks this week, hours saved this month — each clickable navigating to relevant section
- **Automation list**: Each row shows name, status badge, connected app icons, daily metric. Section header "Mis automatizaciones" with "Ver todas →" link (Phase 9 route). "+ Nueva automatización" CTA at bottom
- **Activity feed**: Last 10-15 execution events. Errors use inline "Error" badge (NOT background color change). Section header "Ver actividad completa →" links to Reports (Phase 11)
- **Notification bell**: Top-right header/topbar area next to user avatar. Unread count badge. Click opens dropdown/popover (NOT sidebar/drawer)
- **Notification items**: Icon specific to type (activation, error, request approved, etc.), blue dot for unread, relative timestamp, title + message
- **Notification list**: Last 20 notifications. "Marcar todas como leídas" action
- **Page layout**: 2-column below KPIs (automations LEFT, feed RIGHT). Full-width top: greeting row + KPI cards. Mobile: single-column stack
- **Visual style**: Modern and colorful — colored card icons, subtle gradients, vibrant accents (Stripe Dashboard / Plausible reference). Light AND dark mode
- **Responsive**: 2-column desktop, single-column mobile
- **i18n**: All new UI text MUST have EN/ES translation keys (I18N-01)

### Claude's Discretion
- KPI card visual style (number formatting, icons, trend indicators)
- Activity feed format (timeline vs simple list)
- Activity feed metric detail per event (specific count vs generic status)
- Which execution states to display in feed (completed only vs all states)
- Whether automation list rows are clickable links
- Loading states and skeleton designs
- Exact spacing, typography, color palette within "modern colorido" direction
- Error states and empty states for each section

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | User sees personalized greeting with their first name | `user.user_metadata.first_name` available from `supabase.auth.getUser()` in layout; time-of-day greeting computed server-side from `new Date()` |
| HOME-02 | User sees 3 KPI summary cards (active automations, tasks this week, hours saved this month) | Three Supabase queries: COUNT active automations, COUNT executions (started_at > 7 days ago), SUM(duration_ms * avg_minutes_per_task logic) or hours via `avg_minutes_per_task` from template join |
| HOME-03 | User sees compact list of their automations with status and daily metric | Query `automations` with template join for `connected_apps`, `activity_metric_label`; daily metric = COUNT executions in last 24h per automation |
| HOME-04 | User sees activity feed of last 10-15 execution events | Query `automation_executions` ordered by `started_at DESC` limit 15, joined to `automations.name` |
| HOME-05 | User can navigate to catalog via "+ Nueva automatización" CTA | Link to `/dashboard/catalog` (Phase 10 route — render as link, not functional page yet) |
| NOTF-01 | User sees bell icon with unread count badge | Query `notifications` WHERE `user_id = auth.uid() AND is_read = false`, render count in DashboardNav |
| NOTF-02 | User can open dropdown with last 20 notifications (icon by type, title, message, timestamp) | Radix UI Popover (already in `radix-ui` package) for dropdown; fetch 20 notifications ordered by `created_at DESC` |
| NOTF-03 | User can mark all notifications as read | Server Action or direct Supabase client call: `UPDATE notifications SET is_read=true, read_at=NOW() WHERE user_id=auth.uid() AND is_read=false` |
| I18N-01 | All new dashboard UI text available in both EN and ES | Add keys under `dashboard.home.*` and `dashboard.notifications.*` namespaces to `en.json` and `es.json` |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, Server Components, layouts | Already installed; `(dashboard)` route group established |
| `@supabase/ssr` | 0.8.0 | SSR Supabase client for Server Components | `createClient()` in `lib/supabase/server.ts` already set up |
| `@supabase/supabase-js` | 2.95.0 | Supabase client, query builder | Already installed |
| `next-intl` | 4.8.3 | `getTranslations()` for Server Components, `useTranslations()` for Client Components | Already installed and configured in `i18n/request.ts` |
| `lucide-react` | 0.563.0 | Bell icon, status icons, KPI icons | Already installed; consistent with project icon approach |
| `radix-ui` | 1.4.3 | Popover primitive for notification dropdown | Already installed; provides accessible dropdown out of the box |
| `tailwindcss` | v4 | Styling — dark mode, responsive, color system | Already installed; v4 CSS-first config |
| `clsx` + `tailwind-merge` | latest | Class composition | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react` | 19.2.3 | `useState`, `useEffect` for client dropdown state | Client Components only (notification bell) |
| `class-variance-authority` | 0.7.1 | Variant-based badge styles | Status badge component (active/paused/error/in_setup) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Radix UI Popover | Custom dropdown div | Radix handles focus trapping, keyboard nav, a11y — don't hand-roll |
| Supabase `.select()` queries | Raw SQL via Supabase RPC | Not needed — the query complexity is well within the JS client's query builder |
| Server Component with Suspense | SWR/React Query client fetch | Server Components + Suspense is the idiomatic Next.js 16 pattern; avoids client-side fetch waterfalls |

**Installation:** No new packages needed — all dependencies already installed.

---

## Architecture Patterns

### Recommended File Structure
```
web/src/
├── app/(dashboard)/
│   └── dashboard/
│       └── page.tsx                    # Main Server Component — runs 4 parallel queries
├── components/dashboard/
│   ├── nav.tsx                         # MODIFY — add topbar with bell + avatar
│   ├── sign-out.tsx                    # Unchanged
│   ├── kpi-cards.tsx                   # Server Component — 3 KPI cards (or subcomponents)
│   ├── automation-list.tsx             # Server Component — compact automations list
│   ├── activity-feed.tsx               # Server Component — last 10-15 executions
│   ├── status-badge.tsx                # Shared — status badge with CVA variants
│   ├── notification-bell.tsx           # Client Component — bell + popover + mark-all-read
│   └── notification-item.tsx           # Client Component (child of bell)
└── messages/
    ├── en.json                         # ADD dashboard.home.* and dashboard.notifications.*
    └── es.json                         # ADD Spanish equivalents
```

### Pattern 1: Parallel Data Fetching in Server Component
**What:** Dashboard page fetches all data in parallel using `Promise.all`, then passes to child components as props.
**When to use:** Multiple independent queries needed for initial page render — avoids sequential waterfall.
**Example:**
```typescript
// Source: Next.js App Router docs pattern
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = /* from profile query */;

  const [automations, recentExecutions, notifications] = await Promise.all([
    supabase
      .from('automations')
      .select('id, name, status, template:automation_templates(connected_apps, activity_metric_label)')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),

    supabase
      .from('automation_executions')
      .select('id, automation_id, status, started_at, completed_at, automation:automations(name)')
      .in('automation_id', activeAutomationIds)
      .order('started_at', { ascending: false })
      .limit(15),

    supabase
      .from('notifications')
      .select('id, type, title, message, is_read, created_at, link')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
}
```

### Pattern 2: Notification Bell as Client Component with Server-Fetched Initial Data
**What:** Bell is a Client Component (needs `useState` for open/close), but initial unread count is computed server-side and passed as prop.
**When to use:** Interactivity needed (popover toggle, optimistic mark-as-read) but initial render should be fast.
**Example:**
```typescript
// Server Component (nav.tsx or dashboard layout)
// Pass initial data as props to avoid client-side fetch on mount
<NotificationBell 
  initialNotifications={notifications} 
  unreadCount={notifications.filter(n => !n.is_read).length}
  userId={user.id}
/>
```

```typescript
// Client Component (notification-bell.tsx)
"use client";
import * as Popover from '@radix-ui/react-popover';

export function NotificationBell({ initialNotifications, unreadCount, userId }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [localUnread, setLocalUnread] = useState(unreadCount);

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setLocalUnread(0);
    // Persist via Supabase client
    const supabase = createClient(); // client-side Supabase
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        {/* Bell icon + unread badge */}
      </Popover.Trigger>
      <Popover.Content>
        {/* Notification list */}
      </Popover.Content>
    </Popover.Root>
  );
}
```

### Pattern 3: KPI Computation Queries
**What:** Three KPI values computed via Supabase queries.
**When to use:** Real data from seed — no mock values.

```typescript
// KPI 1: Active automations count
const { count: activeCount } = await supabase
  .from('automations')
  .select('*', { count: 'exact', head: true })
  .eq('organization_id', orgId)
  .eq('status', 'active')
  .is('deleted_at', null);

// KPI 2: Tasks this week (executions in last 7 days)
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const { count: weeklyTasks } = await supabase
  .from('automation_executions')
  .select('*', { count: 'exact', head: true })
  .in('automation_id', orgAutomationIds)
  .gte('started_at', weekAgo);

// KPI 3: Hours saved this month
// Formula: SUM(executions this month) * AVG(avg_minutes_per_task from template) / 60
// Fetch executions joined to automation→template, sum avg_minutes_per_task
```

### Pattern 4: next-intl in Server Components (verified pattern)
**What:** Use `getTranslations(namespace)` for async Server Components.
**When to use:** Any Server Component that needs translated text.
```typescript
// Source: Context7 /amannn/next-intl
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard'); // matches existing namespace
  const tHome = await getTranslations('dashboard.home'); // new sub-namespace
}
```

For Client Components (notification bell), use `useTranslations('dashboard.notifications')`.

### Pattern 5: Hours Saved Calculation
**What:** "Hours saved this month" requires joining executions → automations → templates to get `avg_minutes_per_task`.
**Approach:** Fetch executions with `automation.template.avg_minutes_per_task` for the current month, sum up `avg_minutes_per_task` per execution, divide by 60.
**Alternative:** Pre-compute in SQL via a Supabase RPC if JS-side aggregation is too slow (not needed for seed data volume — ~500 records total).

### Pattern 6: Nav Layout for Bell Placement
**What:** Current nav (`nav.tsx`) is a left sidebar — no topbar exists. The bell must go "top-right header/topbar area next to user avatar." 
**Decision:** Add a sticky topbar element inside `nav.tsx` that shows on desktop alongside the sidebar. On mobile, it merges with the existing mobile header (which already shows at top). The topbar will hold: page title (optional), bell icon, and user avatar.
**Layout impact:** The dashboard `<main>` in `layout.tsx` gets `lg:pl-64` for the sidebar. A topbar would be `fixed top-0 right-0 left-64` on desktop, overlapping with the mobile header on small screens.

### Anti-Patterns to Avoid
- **Fetching notifications client-side on bell open:** Causes visible loading delay. Pass initial data from server as props.
- **One big query with all data:** Use `Promise.all` for parallel queries, not sequential awaits.
- **Translating template i18n keys client-side:** Template names like `templates.lead_followup_email.name` are already i18n keys — use `t(automation.name)` (from translations namespace `templates`) to render them. The seed stores keys, not raw strings.
- **Hardcoding status badge colors:** Use CVA variants so dark mode works correctly.
- **Blocking render on notification fetch:** Notifications for the bell can load after the main content with a Suspense boundary.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notification dropdown with focus management | Custom div with onclick | `@radix-ui/react-popover` (already in `radix-ui` package) | Handles keyboard nav, focus trap, portal, a11y — already installed |
| Status badge variants | Inline conditional classes | CVA (`class-variance-authority`) — already installed | Type-safe variants, clean API, dark mode support |
| Relative timestamps | Custom date formatting | `Intl.RelativeTimeFormat` (browser built-in) or simple `date-fns`-style logic | Already available, no package needed |
| Unread count badge | Custom counter component | Simple `span` with Tailwind — 3 lines of JSX | Not complex enough to warrant a library |

**Key insight:** The project already has all needed libraries. The work is composition, not installation.

---

## Common Pitfalls

### Pitfall 1: Template i18n Key Resolution
**What goes wrong:** Automation names in DB are stored as i18n keys (e.g., `templates.lead_followup_email.name`), not human-readable strings. Rendering them raw shows the key, not the name.
**Why it happens:** Phase 07-02 decision: "i18n keys in DB TEXT columns."
**How to avoid:** Pass the automation's `name` field (which is a key) through `t(name)` where `t` is loaded from the `templates` namespace. In Server Components: `const tTemplates = await getTranslations('templates')`. Then `tTemplates(automation.name.split('.').slice(1).join('.'))` — or restructure keys to match the nested path.
**Warning signs:** Automation list shows raw strings like "templates.ai_chatbot_24_7.name."

### Pitfall 2: org_id Not Available on auth.user
**What goes wrong:** `supabase.auth.getUser()` returns `user.id` (auth UID) but NOT `org_id`. The dashboard page needs `org_id` to filter automations, executions, notifications.
**Why it happens:** `org_id` is on the `profiles` table, not `auth.users`.
**How to avoid:** Add a profile fetch at the start of the page: `await supabase.from('profiles').select('org_id').eq('id', user.id).single()`. The dashboard layout could also do this once and pass `orgId` down, but currently `layout.tsx` only passes `user` to `DashboardNav`.
**Warning signs:** Queries return no data or RLS errors because `organization_id` filter is wrong.

### Pitfall 3: Execution Count Scope for KPIs
**What goes wrong:** Supabase RLS on `automation_executions` filters by org membership (through automation join). But to count KPI2 (tasks this week), you need automation IDs for the org first.
**Why it happens:** `automation_executions` has no direct `organization_id` column — access goes through `automations`.
**How to avoid:** First fetch org automation IDs, then use `.in('automation_id', ids)` for execution queries. Or use a single query with embedded select: `automations.select('id, automation_executions(count)')`.
**Warning signs:** Execution count is 0 when it should have data, or includes other orgs' executions.

### Pitfall 4: Hours Saved KPI Requires Template Join
**What goes wrong:** `avg_minutes_per_task` lives on `automation_templates`, not `automations` or `automation_executions`. Computing hours saved requires joining across 3 tables.
**Why it happens:** Schema normalization — template metrics on template, not copied to automation.
**How to avoid:** Fetch automations with `template:automation_templates(avg_minutes_per_task)`, then for each execution, look up its automation's template's `avg_minutes_per_task`. Or compute in a single query: `from('automations').select('id, template:automation_templates(avg_minutes_per_task), automation_executions(id, started_at)')`.
**Warning signs:** Hours saved always shows 0 or undefined.

### Pitfall 5: Notification Bell Position Requires Nav Refactor
**What goes wrong:** Current `nav.tsx` is a left sidebar only — there's no topbar. Adding a bell "top-right next to user avatar" requires either: (a) a new fixed topbar component, or (b) repurposing the existing mobile header div to also show on desktop.
**Why it happens:** Original nav design was sidebar-only; topbar not needed until Phase 8.
**How to avoid:** Plan the nav refactor as a distinct task. Add a `<header>` element fixed to top of the main content area (`fixed top-0 left-64 right-0` on desktop, `fixed top-0 left-0 right-0` on mobile). The dashboard layout gets `pt-16` to account for the header height.
**Warning signs:** Bell overlaps sidebar content, or appears in wrong position on mobile.

### Pitfall 6: next-intl Namespace for Nested Keys
**What goes wrong:** Using `getTranslations('dashboard')` and then calling `t('home.greeting')` fails if the message file has `dashboard.home.greeting` as a nested object — the namespace must match the nesting level.
**Why it happens:** next-intl 4.x uses dot-notation namespaces that map to nested JSON.
**How to avoid:** Either call `getTranslations('dashboard.home')` and use `t('greeting')`, OR call `getTranslations('dashboard')` and use `t('home.greeting')`. Both work — the former is cleaner. Confirmed pattern from Context7: `const t = await getTranslations('HomePage')` maps to `messages.HomePage.*`.
**Warning signs:** `t()` returns the key string instead of the translation.

### Pitfall 7: Dark Mode with Tailwind v4
**What goes wrong:** Tailwind v4 uses CSS-first config. Dark mode class names and the mechanism for toggling differ slightly from v3.
**Why it happens:** v4 changed config from `tailwind.config.js` to CSS `@theme` blocks.
**How to avoid:** Use `dark:` prefix classes as in v3 (they still work). Check `globals.css` for the dark mode strategy (class vs media). The existing nav already uses `dark:bg-gray-800` — follow that pattern for new components.
**Warning signs:** Dark mode not applying to new components.

---

## Code Examples

Verified patterns from existing project:

### Existing: Server Component data fetch + i18n pattern
```typescript
// Source: web/src/app/(dashboard)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("dashboard");
  const firstName = (user?.user_metadata?.first_name as string) || "";
  // ...
}
```

### Existing: Client Component i18n pattern
```typescript
// Source: web/src/components/dashboard/nav.tsx
"use client";
import { useTranslations } from "next-intl";
export function DashboardNav({ user }: { user: User }) {
  const t = useTranslations("dashboard");
  // t("nav.dashboard") etc.
}
```

### Existing: Supabase client-side (for mark-all-read action)
```typescript
// Source: web/src/components/dashboard/sign-out.tsx pattern
import { createClient } from "@/lib/supabase/client";
// Use in Client Component for write operations
```

### New: Profile + org_id fetch pattern
```typescript
// Fetch profile to get org_id — required before any org-scoped queries
const { data: profile } = await supabase
  .from('profiles')
  .select('org_id, first_name')
  .eq('id', user.id)
  .single();
const orgId = profile?.org_id;
```

### New: Automation list with template data
```typescript
const { data: automations } = await supabase
  .from('automations')
  .select(`
    id, name, status, last_run_at,
    template:automation_templates(
      connected_apps,
      activity_metric_label,
      avg_minutes_per_task
    )
  `)
  .eq('organization_id', orgId)
  .is('deleted_at', null)
  .not('status', 'eq', 'archived')
  .order('created_at', { ascending: false });
```

### New: Status badge with CVA
```typescript
// Source: CVA pattern — no external reference needed, already in project
import { cva } from "class-variance-authority";
const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    status: {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      in_setup: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      pending_review: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    }
  }
});
```

### New: Relative timestamp (no library needed)
```typescript
function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  return `Hace ${Math.floor(seconds / 86400)}d`;
}
```

### New: Notification type → icon mapping
```typescript
// lucide-react icons for notification types
// success → CheckCircle (green)
// warning → AlertTriangle (yellow)
// info → Info (blue)
// action_required → AlertCircle (orange/red)
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
const notificationIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  action_required: AlertCircle,
};
```

### New: i18n key structure for en.json additions
```json
{
  "dashboard": {
    "home": {
      "greetingMorning": "Buenos días, {name}",
      "greetingAfternoon": "Buenas tardes, {name}",
      "greetingEvening": "Buenas noches, {name}",
      "subtitle": "Aquí está el estado de tus automatizaciones",
      "newAutomation": "+ Nueva automatización",
      "kpi": {
        "activeAutomations": "Automatizaciones activas",
        "tasksThisWeek": "Tareas esta semana",
        "hoursSavedThisMonth": "Horas ahorradas este mes"
      },
      "automationList": {
        "title": "Mis automatizaciones",
        "viewAll": "Ver todas →",
        "dailyMetric": "{count} hoy",
        "noRuns": "Sin ejecuciones hoy"
      },
      "activityFeed": {
        "title": "Actividad reciente",
        "viewAll": "Ver actividad completa →",
        "errorBadge": "Error",
        "noActivity": "Sin actividad reciente"
      }
    },
    "notifications": {
      "title": "Notificaciones",
      "markAllRead": "Marcar todas como leídas",
      "empty": "No tienes notificaciones",
      "unreadCount": "{count} sin leer"
    }
  }
}
```

Note: Per CONTEXT.md, UI copy is in Spanish (the app targets Spanish-speaking SMBs). The English keys mirror the same structure with English text. Both `en.json` and `es.json` must be updated.

---

## Data Model Summary

Key tables and columns Phase 8 reads from:

| Table | Columns Used | Notes |
|-------|-------------|-------|
| `profiles` | `id`, `org_id`, `first_name` | Needed to get org_id for all other queries |
| `automations` | `id`, `name`, `status`, `last_run_at`, `template_id`, `organization_id`, `deleted_at` | Filter by org, exclude archived+deleted |
| `automation_templates` | `connected_apps`, `activity_metric_label`, `avg_minutes_per_task` | Joined from automations; `name` is i18n key |
| `automation_executions` | `id`, `automation_id`, `status`, `started_at`, `completed_at`, `error_message` | Filter by automation_id IN (org automations); limit 15 for feed |
| `notifications` | `id`, `type`, `title`, `message`, `is_read`, `read_at`, `link`, `created_at` | Filter by user_id; limit 20 for bell |

**Write operation (Phase 8):** Only one write — `UPDATE notifications SET is_read=true, read_at=NOW()` — done via Supabase client in a Client Component (RLS policy `notifications_update_own` already covers this).

---

## Nav Refactor: Topbar for Bell Placement

The current nav is sidebar-only. Phase 8 introduces a topbar. Two approaches:

**Option A (Recommended): Add sticky header inside `(dashboard)/layout.tsx`**
- Create `<DashboardHeader>` Server Component that receives `user` + pre-fetched notifications
- Layout renders both sidebar + topbar, main content gets `pt-16 lg:pl-64`
- Bell + avatar in topbar. Topbar: `fixed top-0 left-0 right-0 lg:left-64 h-16 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 z-30`

**Option B: Merge into nav.tsx**
- Add topbar div inside `DashboardNav`; position it fixed top-right
- Less clean separation, but fewer files

Option A is preferred — keeps nav.tsx as the sidebar only, new `dashboard-header.tsx` handles topbar.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Client-side data fetching with SWR | Server Components with `Promise.all` | No loading spinners for initial paint; data ready on first render |
| Client-side i18n bundles | next-intl server-side `getTranslations()` | Zero i18n JS in client bundle for Server Components |
| Manual dropdown components | Radix UI Popover | Accessible, keyboard-nav, portal rendering out of the box |

---

## Open Questions

1. **Hours saved KPI formula precision**
   - What we know: `avg_minutes_per_task` on `automation_templates`; executions have status (success/error)
   - What's unclear: Should errored executions count toward hours saved? Likely no.
   - Recommendation: Only count `status = 'success'` executions for hours saved. Formula: `SUM(avg_minutes_per_task) / 60` for success executions in current month.

2. **Daily metric per automation in list**
   - What we know: Each automation row shows a "daily metric" (e.g., "47 conversations today")
   - What's unclear: Should this be count of success executions only, or all executions in last 24h?
   - Recommendation: Count all `status IN ('success', 'error')` (completed) executions in last 24h. Show error badge separately. This gives most accurate activity picture.

3. **"+ Nueva automatización" target route**
   - What we know: Links to catalog (Phase 10) — `href="/dashboard/catalog"`
   - What's unclear: Phase 10 doesn't exist yet — will clicking it 404?
   - Recommendation: Render the link as-is. Next.js will 404, which is acceptable since Phase 10 is clearly not done. Do NOT create a stub page in Phase 8.

4. **Topbar mobile behavior**
   - What we know: Mobile already has a header in nav.tsx (hamburger + logo)
   - What's unclear: Should bell appear in mobile header alongside hamburger?
   - Recommendation: Yes — add bell to the existing mobile header div in nav.tsx. The new topbar only shows on `lg:` screens. Mobile header gets bell + avatar added to right side.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — only `workflow.research`, `workflow.plan_check`, and `workflow.verifier` are set. Skipping Validation Architecture section.

---

## Sources

### Primary (HIGH confidence)
- `/amannn/next-intl` Context7 — `getTranslations` server usage, namespace patterns
- `web/src/app/(dashboard)/layout.tsx` — existing layout pattern, auth flow
- `web/src/app/(dashboard)/dashboard/page.tsx` — existing page stub
- `web/src/components/dashboard/nav.tsx` — existing nav, i18n usage pattern
- `supabase/migrations/20260305000002_automation_business.sql` — schema: automations, executions, templates
- `supabase/migrations/20260305000003_communication.sql` — schema: notifications
- `supabase/migrations/20260409000001_v1_1_schema_expansion.sql` — added columns: connected_apps, avg_minutes_per_task, activity_metric_label
- `supabase/seed.sql` — exact seed data: 6 Acme automations, ~500 executions, 10 Acme notifications, statuses

### Secondary (MEDIUM confidence)
- `/supabase/supabase` Context7 — `.select()` with joins, count queries, `.in()` filter pattern
- `web/package.json` — confirmed: radix-ui, lucide-react, CVA all already installed

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use; verified from package.json
- Architecture: HIGH — patterns match existing project conventions confirmed from source files
- Data model: HIGH — read directly from migration SQL and seed.sql
- i18n patterns: HIGH — verified from Context7 `/amannn/next-intl`
- Pitfalls: HIGH — identified from actual code inspection (template key pattern, org_id gap, nav layout)

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable stack — no fast-moving dependencies)
