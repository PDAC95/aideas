# Phase 14: i18n & Security Hygiene - Research

**Researched:** 2026-04-30
**Domain:** Server action security (org ownership) + next-intl i18n (client and server time strings)
**Confidence:** HIGH — all findings from direct codebase inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Security gap — `updateAutomationStatus`:**
- Allowed roles: `owner`, `admin`, `operator`. `viewer` is rejected.
- Helper location: `web/src/lib/auth/` (new directory), e.g., `assertOrgMembership`
- Helper behavior: reads user via `supabase.auth.getUser()`, queries `organization_members` for `(user_id, organization_id)`, verifies role is in `allowedRoles`
- Error contract: `{ error: string }` discriminated union (same as `lib/actions/settings.ts`)
- "Not found" and "forbidden" treated identically — generic error, no resource-existence oracle
- Backend logging: `console.error` with structured context (`userId`, `attemptedOrgId`, `automationId`) on rejection. No audit_log table.

**i18n key design:**
- Namespace: `common.timeAgo.*` — shared. Keys: `now`, `minutes`, `hours`, `days`
- Spanish abbreviations: `now → "ahora"`, `m → "m"`, `h → "h"`, `d → "d"`
- No pluralization — invariant abbreviations across all counts
- Add to BOTH `messages/en.json` and `messages/es.json`

**Translation patterns:**
- Client component (`notification-bell.tsx`): `useTranslations("common")` hook from `next-intl`
- Server component (`automations/[id]/page.tsx`): `getTranslations("common")` from `next-intl/server`; `buildTimeAgo` helper accepts translator `t` as parameter
- Shared helper: `web/src/lib/utils/time.ts` → `formatRelativeTime(date, t)` consumed by both call sites
- `notification-bell` scope: ONLY `formatRelativeTime`, not entire component

**Error UX:**
- Toast with generic localized message on `{ error }` from `updateAutomationStatus`
- Toast trigger: `automation-detail-header.tsx` reads `{ error }` from server action response
- Use existing project inline toast pattern (no new library)

**buildTimeAgo migration scope:** ENTIRE helper migrates to i18n (all buckets — not just `< 60s`)

### Claude's Discretion

- Exact name of the membership helper file/function (`assert-org-membership.ts` vs `org-access.ts`)
- Internal structure of `formatRelativeTime` (single function with bucket logic vs. small dispatcher)
- Whether `assertOrgMembership` returns a `Result`-style discriminated union or throws internally
- Exact set of i18n keys (whether to add `seconds` separately or fold into `now`)

### Deferred Ideas (OUT OF SCOPE)

- Audit log table for security-relevant events
- Automated E2E test infrastructure (Playwright)
- Full i18n audit of `notification-bell.tsx` beyond `formatRelativeTime`
- Pluralization with ICU MessageFormat
- Same membership-check refactor applied to other server actions
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTO-04 | Automation detail page shows timeline and chart | Gap: `buildTimeAgo` hardcodes "Just now" — fix all buckets to use `common.timeAgo.*` |
| AUTO-06 | Pause/resume/cancel buttons trigger server action correctly | Gap: `updateAutomationStatus` missing org ownership check — add membership guard before write |
| NOTF-02 | Bell dropdown shows notifications with relative time | Gap: `formatRelativeTime` hardcodes EN labels — wire to i18n via `useTranslations("common")` |
| I18N-01 | All UI text renders in both EN and ES | Gap: time strings only render in EN — add `common.timeAgo.*` keys to both JSON files |
</phase_requirements>

---

## Summary

Phase 14 closes 3 audit gaps across 6 files. The security fix requires creating a new reusable helper in a new `lib/auth/` directory, correcting the action to use the admin client for writes, and adding a membership guard. The i18n fixes require creating a new `lib/utils/time.ts` shared helper, adding `common.timeAgo.*` keys to both message files, and updating two components to use translations.

**Primary recommendation:** Implement in 3 atomic tasks — (1) security helper + action fix, (2) shared time helper + i18n keys, (3) wire both call sites to the shared helper. This order ensures the shared utility and message keys exist before consumers are updated.

---

## 1. Current State of Each Target File

### `web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts` — SECURITY GAP

**Entire file (24 lines):**
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAutomationStatus(
  automationId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("automations")
    .update({ status: newStatus })
    .eq("id", automationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/automations");
  revalidatePath(`/dashboard/automations/${automationId}`);
  return { success: true };
}
```

**What's wrong:**
1. No `supabase.auth.getUser()` — user identity never verified server-side
2. No organization membership check — any authenticated user can attempt to mutate any automation
3. Uses `createClient()` (cookie-based anon client) for the `.update()` — but `automations` writes are **service_role only** per migration (no authenticated UPDATE policy). The update is blocked by RLS but the error is an opaque RLS message, not a generic "forbidden"
4. Return type `{ success: boolean; error?: string }` is inconsistent with the project pattern of `{ success: true } | { error: string }`

**Fix requires:**
- Add auth check (`supabase.auth.getUser()`)
- Look up automation's `organization_id` (need to SELECT from `automations` first)
- Call `assertOrgMembership(supabase, orgId, ['owner', 'admin', 'operator'])`
- Use admin client for the actual `.update()` (since writes are service_role only)
- Align return type to discriminated union

**Called from:** `automation-detail-header.tsx` lines 80, 94, 106 — called with `(automationId, "paused")`, `(automationId, "active")`, `(automationId, "archived")`

### `web/src/components/dashboard/notification-bell.tsx` — i18n GAP

**Hardcoded function (lines 20–26):**
```typescript
function formatRelativeTime(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
```

**Labels hardcoded:** `"now"`, `"m"`, `"h"`, `"d"` — all English strings. Spanish needs `"ahora"` for `now`; `m/h/d` are the same character but should still come from translations for correctness.

**Used at line 142:** `{formatRelativeTime(notification.created_at)}`

**Component is `"use client"`** — `useTranslations()` hook is available.

**Current `translations` prop shape (does NOT include time labels):**
```typescript
translations: {
  title: string;
  markAllRead: string;
  empty: string;
}
```

**Fix:** Add `const tCommon = useTranslations("common")` at the top of `NotificationBell` component. Replace the module-level `formatRelativeTime` with a call to the shared helper from `lib/utils/time.ts`: `formatRelativeTime(notification.created_at, tCommon)`.

### `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` — i18n GAP

**Hardcoded helper (lines 16–30):**
```typescript
function buildTimeAgo(
  dateStr: string,
  nowMs: number,
  minutes: string,
  hours: string,
  days: string
): string {
  const seconds = Math.floor((nowMs - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";          // ← HARDCODED EN
  if (seconds < 3600)
    return minutes.replace("{count}", String(Math.floor(seconds / 60)));
  if (seconds < 86400)
    return hours.replace("{count}", String(Math.floor(seconds / 3600)));
  return days.replace("{count}", String(Math.floor(seconds / 86400)));
}
```

**Hardcoded:** `"Just now"` in the `< 60s` branch. The other buckets use template strings from the caller but via a hack (`tHome("timeAgo.minutes", { count: 99 }).replace("99", "{count}")`).

**Current caller pattern (lines 85–108):**
```typescript
const tHome = await getTranslations("dashboard.home");
const minutesTemplate = tHome("timeAgo.minutes", { count: 99 }).replace("99", "{count}");
const hoursTemplate = tHome("timeAgo.hours", { count: 99 }).replace("99", "{count}");
const daysTemplate = tHome("timeAgo.days", { count: 99 }).replace("99", "{count}");
const nowMs = Date.now();
const enrichedExecutions = executions.map((exec) => ({
  ...
  timeAgo: buildTimeAgo(exec.started_at, nowMs, minutesTemplate, hoursTemplate, daysTemplate),
}));
```

**Fix:** Remove `buildTimeAgo` helper and `tHome` call. Add `const tCommon = await getTranslations("common")`. Replace `enrichedExecutions` map body to use `formatRelativeTime(new Date(exec.started_at), tCommon)` from the shared helper.

---

## 2. Existing Patterns to Follow

### Organization Membership Check — `settings.ts` (HIGH confidence)

The canonical pattern (lines 70–79 of `settings.ts`):

```typescript
// 1. Get authenticated user
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) return { error: 'unauthorized' }

// 2. Verify org membership + role
const { data: member } = await supabase
  .from('organization_members')
  .select('role')
  .eq('user_id', user.id)
  .eq('organization_id', orgId)
  .single()

if (!member || !['owner', 'admin'].includes(member.role)) {
  return { error: 'unauthorized' }
}
```

**The `assertOrgMembership` helper extracts this exact sequence.** For `updateAutomationStatus`, `orgId` is not passed in directly — the action must first SELECT `organization_id` from `automations` where `id = automationId`, then check membership.

### Admin Client for Writes — `settings.ts` (HIGH confidence)

```typescript
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
const admin = getAdminClient()
const { error } = await admin.from('organizations').update({...}).eq('id', orgId)
```

`updateAutomationStatus` needs this because `automations` has no authenticated UPDATE policy (writes are service_role only per migration line 95).

### Discriminated Union Return Type — `settings.ts` (HIGH confidence)

```typescript
Promise<{ success: true } | { error: string }>
```

The current `actions.ts` uses `Promise<{ success: boolean; error?: string }>` — needs to align. **The caller (`automation-detail-header.tsx`) checks `result.success` — this still works with the new type since TypeScript narrows the discriminated union correctly.**

### Toast Pattern — project-wide (HIGH confidence)

**No sonner installed.** All toast UX in the codebase uses a homegrown inline div pattern:

```typescript
// State
const [toast, setToast] = useState<string | null>(null);

// Auto-dismiss
useEffect(() => {
  if (!toast) return;
  const timer = setTimeout(() => setToast(null), 3000);
  return () => clearTimeout(timer);
}, [toast]);

// In JSX
{toast && (
  <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
    {toast}
  </div>
)}
```

`automation-detail-header.tsx` already uses this exact pattern (lines 67–75, 243–248). The error toast path already exists at lines 85–87:
```typescript
} else {
  setOptimisticStatus(status);
  setToast(result.error ?? "Error");  // ← currently shows raw error string
}
```

**Fix:** Pass a localized `permissionError` string via the `translations` prop and use it: `setToast(translations.permissionError)` when `'error' in result`. The parent page passes translations from `getTranslations` server-side.

### Server Component Translation — `automations/[id]/page.tsx` (HIGH confidence)

```typescript
import { getTranslations } from "next-intl/server";
const t = await getTranslations("dashboard.automations");
```

Add: `const tCommon = await getTranslations("common");`

### Client Component Translation — next-intl `useTranslations` (HIGH confidence)

```typescript
"use client";
import { useTranslations } from "next-intl";

export function NotificationBell(...) {
  const tCommon = useTranslations("common");
  // use tCommon("timeAgo.now"), etc.
}
```

---

## 3. Helper File Location Decisions

### `lib/auth/` — Does NOT Exist Yet

Current `lib/` structure:
```
web/src/lib/
├── utils.ts              ← cn() utility (single file)
├── actions/
│   ├── auth.ts
│   └── settings.ts
├── dashboard/
│   ├── queries.ts
│   └── types.ts
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
└── validations/
    ├── login.ts
    ├── signup.ts
    ├── password-reset.ts
    └── settings.ts
```

**Create:** `web/src/lib/auth/assert-org-membership.ts` — new file in new directory. This follows the existing domain-grouping pattern (`supabase/`, `dashboard/`, `validations/`).

**Recommended function signature:**

```typescript
// web/src/lib/auth/assert-org-membership.ts
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_ALLOWED_ROLES = ["owner", "admin", "operator"] as const;
type OrgRole = "owner" | "admin" | "operator" | "viewer";

/**
 * Verifies the authenticated user is a member of the given organization
 * with one of the allowed roles. Returns { error: string } if not.
 * Generic error response prevents resource-existence oracle.
 */
export async function assertOrgMembership(
  supabase: SupabaseClient,
  orgId: string,
  allowedRoles: OrgRole[] = [...DEFAULT_ALLOWED_ROLES]
): Promise<{ error: string } | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "unauthorized" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .single();

  if (!member || !allowedRoles.includes(member.role as OrgRole)) {
    console.error("[assertOrgMembership] access denied", {
      userId: user.id,
      attemptedOrgId: orgId,
    });
    return { error: "forbidden" };
  }

  return null; // null = access granted
}
```

**Usage in `updateAutomationStatus`:**
```typescript
const denied = await assertOrgMembership(supabase, automation.organization_id);
if (denied) return denied;
```

### `lib/utils/time.ts` — Does NOT Exist Yet

Per CONTEXT.md decision, path is `web/src/lib/utils/time.ts`. This coexists with `web/src/lib/utils.ts` (TypeScript resolves both: `utils.ts` as a module and `utils/` as a directory).

**Recommended implementation:**

```typescript
// web/src/lib/utils/time.ts
// Generic translator type compatible with next-intl's TranslationValues

type TimeT = (key: string, values?: Record<string, unknown>) => string;

/**
 * Returns a compact relative time string using i18n keys from common.timeAgo.*
 * Works for both server (getTranslations) and client (useTranslations) t functions.
 *
 * @param date - Date or ISO string to compare against now
 * @param t    - Translator function scoped to "common" namespace
 * @returns    Compact string: "ahora" / "5m" / "2h" / "3d"
 */
export function formatRelativeTime(date: Date | string, t: TimeT): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return t("timeAgo.now");
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${t("timeAgo.minutes")}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t("timeAgo.hours")}`;
  return `${Math.floor(seconds / 86400)}${t("timeAgo.days")}`;
}
```

**Note on i18n key design for abbreviations:** The `common.timeAgo.minutes` value is just `"m"` (English) and `"m"` (Spanish). The number is prepended in code, not via ICU interpolation, to preserve the compact visual style (`5m` not `5 minutes`). This matches the existing `notification-bell` output style.

---

## 4. i18n Key Structure — What to Add

### In `messages/en.json` — add to `"common"` section:

```json
"common": {
  "language": "Language",
  "or": "or",
  "timeAgo": {
    "now": "now",
    "minutes": "m",
    "hours": "h",
    "days": "d"
  }
}
```

### In `messages/es.json` — add to `"common"` section:

```json
"common": {
  "language": "Idioma",
  "or": "o",
  "timeAgo": {
    "now": "ahora",
    "minutes": "m",
    "hours": "h",
    "days": "d"
  }
}
```

**Key finding:** `dashboard.home.timeAgo.*` already exists in BOTH `en.json` and `es.json` with FULL forms (`"{count}m ago"`, `"Hace {count}m"`). The new `common.timeAgo.*` uses COMPACT forms for the notification bell and automation timeline, which use shorter format.

**Existing `dashboard.home.timeAgo` (en.json):**
```json
"timeAgo": {
  "now": "Just now",
  "minutes": "{count}m ago",
  "hours": "{count}h ago",
  "days": "{count}d ago"
}
```

The new `common.timeAgo.*` keys are **different** — compact, no count interpolation (number prepended in code). The old `dashboard.home.timeAgo` keys can stay for the activity feed if needed, but Phase 14 replaces `automations/[id]/page.tsx` usage with `common.timeAgo.*`.

---

## 5. `organization_members` Table — Exact Schema

From migrations (combined across two files):

- `20260305000001_core_identity.sql` — creates table with `CHECK (role IN ('admin', 'operator', 'viewer'))`
- `20260401000001_user_registration.sql` — **expands CHECK constraint**: `CHECK (role IN ('owner', 'admin', 'operator', 'viewer'))`; trigger `handle_new_user()` inserts membership with `role = 'owner'` for org creator

**Final effective constraint:**
```
role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'operator', 'viewer'))
```

**Columns relevant to the helper:**
- `user_id UUID` — FK to `profiles.id`
- `organization_id UUID` — FK to `organizations.id`
- `role TEXT` — one of `'owner' | 'admin' | 'operator' | 'viewer'`
- `is_active BOOLEAN` — filter on `true` for active membership

**RLS on `organization_members`:**
- SELECT: `user_id = auth.uid()` — a user can only see their own membership rows
- Writes: service_role only

This means `assertOrgMembership` using the anon client (cookie supabase) can successfully query the user's own membership row — RLS allows `user_id = auth.uid()` selects.

---

## 6. Toast/Sonner Setup

**sonner is NOT installed.** No `sonner` in `package.json`, no `import from 'sonner'` anywhere in the codebase.

**Project toast pattern:** Inline local state + auto-dismiss `useEffect` + fixed-position div. Used consistently in:
- `automation-detail-header.tsx` — simple `string | null` state
- `settings-profile-card.tsx` — `{ type: 'success' | 'error'; message: string } | null`
- `settings-preferences-card.tsx` — same typed toast
- `settings-security-card.tsx` — same typed toast
- `billing-summary-card.tsx` — simple boolean

**For the permission error toast in `automation-detail-header.tsx`:**
The component already has the toast infrastructure. The error path is at lines 85–87 (and similar for resume, cancel):
```typescript
} else {
  setOptimisticStatus(status);
  setToast(result.error ?? "Error");
}
```

After fix: The `translations` prop gets a new `permissionError` key. The page server-side passes `t("actions.permissionError")`. The component calls `setToast(translations.permissionError)` when `'error' in result`. The toast div already exists and shows green — it should show red for errors. Minor styling fix needed (or add a separate error toast type like settings cards do).

---

## 7. Risks and Pitfalls

### Risk 1: `automations` Write Policy — CRITICAL

**What goes wrong:** The current `updateAutomationStatus` uses the cookie-based Supabase client for the `.update()` call. `automations` has **no authenticated UPDATE policy** — only service_role writes are allowed. This means the current action is likely failing silently in production (RLS blocks the update and returns an error, which the action returns as `{ success: false, error: "..." }`).

**Prevention:** Use `createAdminClient` (service_role) for the `.update()` call, exactly like `settings.ts` does for `organizations`.

### Risk 2: Two-Step Lookup — Race Condition is Acceptable

**What goes wrong:** The action must first SELECT `organization_id FROM automations WHERE id = automationId`, then check membership. Between the two queries, the automation could theoretically be deleted.

**Prevention:** Not a concern for this scope. If the automation is deleted between queries, the `SELECT organization_id` returns no rows → early return with generic error. Acceptable.

### Risk 3: `assertOrgMembership` Takes `supabase` as Param — Correct Pattern

The helper receives the already-created supabase client. Do NOT create a new client inside the helper. The action creates the client, passes it to the helper. This ensures the same session/cookie context is used throughout.

### Risk 4: Hydration Issues with `useTranslations` in `notification-bell.tsx`

**What goes wrong:** `notification-bell.tsx` is `"use client"` and renders on the client. `useTranslations()` in next-intl works correctly in client components — no hydration mismatch issue. The locale is set server-side and included in the initial HTML.

**Prevention:** Standard pattern — verified by existing project usage of next-intl client hooks in other components (settings cards, etc.).

### Risk 5: `formatRelativeTime` Type Safety — `any` Trap

**What goes wrong:** next-intl's translator function `t` has complex generic types. Using `any` for the `TimeT` parameter would violate strict TypeScript.

**Prevention:** Use a simple structural type `type TimeT = (key: string, values?: Record<string, unknown>) => string` which is compatible with next-intl's `useTranslations` return type. This avoids importing next-intl types into a utility file.

### Risk 6: Existing `dashboard.home.timeAgo` Keys — Don't Delete

**What goes wrong:** The activity feed components may still use `dashboard.home.timeAgo.*` keys. Phase 14 adds `common.timeAgo.*` but does NOT remove `dashboard.home.timeAgo.*`.

**Prevention:** Only change the two identified call sites. Leave `dashboard.home.timeAgo.*` keys in both JSON files untouched. Phase 15 can clean up if needed.

### Risk 7: `automation-detail-header.tsx` Error Toast Color

**What goes wrong:** The current toast is always `bg-green-600`. If the action returns `{ error }` (permission denied), showing a green toast is confusing.

**Prevention:** Add `{ type: 'success' | 'error'; message: string }` toast state (matching settings card pattern) to `automation-detail-header.tsx`. Show red for errors, green for success. This is a minor change in the same file.

### Risk 8: Return Type Change in `updateAutomationStatus` — Caller Compatibility

**What goes wrong:** Changing return type from `{ success: boolean; error?: string }` to `{ success: true } | { error: string }` may break TypeScript at call sites.

**Prevention:** `automation-detail-header.tsx` caller checks `result.success` — TypeScript narrows correctly with discriminated union. The only change needed is reading `result.error` → check `'error' in result` instead of `!result.success`. Or: keep the discriminated union but update the caller to check `'error' in result`.

---

## 8. Implementation Order Recommendations

**Recommended task order (minimizes churn):**

### Task 1: Security Helper + Action Fix

Files changed:
- CREATE `web/src/lib/auth/assert-org-membership.ts` (new file, new directory)
- UPDATE `web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts`
- UPDATE `web/src/components/dashboard/automation-detail-header.tsx` (error toast + translations prop)
- UPDATE `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` (pass `permissionError` translation to header)
- ADD i18n key `dashboard.automations.actions.permissionError` to `en.json` and `es.json`

**Why first:** Independent of i18n changes. Tests security fix in isolation.

### Task 2: i18n Keys + Shared Time Helper

Files changed:
- CREATE `web/src/lib/utils/time.ts` (new file in new directory)
- UPDATE `web/messages/en.json` (add `common.timeAgo.*`)
- UPDATE `web/messages/es.json` (add `common.timeAgo.*`)

**Why second:** The shared utility and message keys must exist before either consumer is updated. No component changes in this task.

### Task 3: Wire Both Components to Shared Helper

Files changed:
- UPDATE `web/src/components/dashboard/notification-bell.tsx` (use `useTranslations("common")` + `formatRelativeTime`)
- UPDATE `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` (remove `buildTimeAgo`, remove `tHome` call, use `formatRelativeTime`)

**Why third:** Depends on Task 2 (shared helper + keys). Clean up after both utilities exist.

---

## 9. Test/UAT Approach

### Security UAT — Cross-Org Attack (manual)

To test `updateAutomationStatus` org ownership check:
1. The seed has two orgs (`Automatiza Pro` and `FlowTech Solutions`). Alice belongs to org A. Carol belongs to org B.
2. Directly call the server action from browser devtools or a test script with `automationId` from org B while authenticated as Alice.
3. Expected: `{ error: "forbidden" }` returned. Vercel/dev console shows `console.error` with `userId` and `attemptedOrgId`.
4. Simpler approach: As Alice, navigate to the detail page of Carol's automation (if slug is known) and click Pause — should show the permission error toast.

### Security UAT — Viewer Role Blocked (manual)

1. Temporarily update seed to set Alice's role to `viewer`
2. As Alice, attempt pause/resume/cancel
3. Expected: `{ error: "forbidden" }` — permission error toast shows

### i18n UAT — Spanish locale (manual)

1. Switch to Spanish via Settings > Preferences > Language = Español
2. Navigate to Notifications bell — timestamps should show `"ahora"`, `"5m"`, `"2h"`, `"3d"` style
3. Navigate to an automation detail page — timeline timestamps should show Spanish abbreviations
4. Check for `"Just now"` in page source — must be gone

### i18n UAT — English locale (sanity check)

1. Switch to English
2. Notification bell shows `"now"`, `"5m"`, `"2h"`, `"3d"`
3. Automation detail timeline shows same format
4. No regression in existing functionality

---

## Standard Stack

| Library | Version | Purpose |
|---------|---------|---------|
| `next-intl` | ^4.8.3 | i18n — `getTranslations` (server), `useTranslations` (client) |
| `@supabase/supabase-js` | ^2.95.0 | Admin client for service_role writes |
| `@supabase/ssr` | ^0.8.0 | Cookie-based anon client (read queries) |

No new packages needed. All dependencies already installed.

---

## Code Examples

### `assertOrgMembership` helper

```typescript
// web/src/lib/auth/assert-org-membership.ts
'use server'

import type { SupabaseClient } from "@supabase/supabase-js";

type OrgRole = "owner" | "admin" | "operator" | "viewer";

const DEFAULT_ALLOWED_ROLES: OrgRole[] = ["owner", "admin", "operator"];

/**
 * Verifies the authenticated user is an active member of `orgId` with one of `allowedRoles`.
 * Returns { error: string } on failure, null on success.
 * Uses generic error messages to prevent resource-existence oracle.
 */
export async function assertOrgMembership(
  supabase: SupabaseClient,
  orgId: string,
  allowedRoles: OrgRole[] = DEFAULT_ALLOWED_ROLES
): Promise<{ error: string } | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "unauthorized" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .single();

  if (!member || !allowedRoles.includes(member.role as OrgRole)) {
    console.error("[assertOrgMembership] access denied", {
      userId: user.id,
      attemptedOrgId: orgId,
    });
    return { error: "forbidden" };
  }

  return null;
}
```

### Updated `updateAutomationStatus`

```typescript
// web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { assertOrgMembership } from "@/lib/auth/assert-org-membership";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function updateAutomationStatus(
  automationId: string,
  newStatus: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  // 1. Look up the automation's org (anon client — READ is allowed for org members)
  const { data: automation, error: fetchError } = await supabase
    .from("automations")
    .select("organization_id")
    .eq("id", automationId)
    .single();

  if (fetchError || !automation) return { error: "forbidden" };

  // 2. Assert org membership (owner | admin | operator)
  const denied = await assertOrgMembership(
    supabase,
    automation.organization_id,
    ["owner", "admin", "operator"]
  );
  if (denied) {
    console.error("[updateAutomationStatus] access denied", {
      automationId,
      attemptedOrgId: automation.organization_id,
    });
    return denied;
  }

  // 3. Perform the write via admin client (automations has no authenticated UPDATE policy)
  const admin = getAdminClient();
  const { error } = await admin
    .from("automations")
    .update({ status: newStatus })
    .eq("id", automationId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/automations");
  revalidatePath(`/dashboard/automations/${automationId}`);
  return { success: true };
}
```

### `formatRelativeTime` shared helper

```typescript
// web/src/lib/utils/time.ts
type TimeT = (key: string) => string;

/**
 * Returns a compact relative time string using i18n keys from common.timeAgo.*
 * Compatible with next-intl's useTranslations("common") and getTranslations("common").
 */
export function formatRelativeTime(date: Date | string, t: TimeT): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return t("timeAgo.now");
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${t("timeAgo.minutes")}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t("timeAgo.hours")}`;
  return `${Math.floor(seconds / 86400)}${t("timeAgo.days")}`;
}
```

---

## Open Questions

1. **`permissionError` i18n key location**
   - What we know: The header component already has a `translations` prop and the page passes values from `getTranslations`
   - Proposed: Add `dashboard.automations.actions.permissionError` to both JSON files, pass via `headerTranslations` object in `page.tsx`
   - No ambiguity — follows existing pattern exactly

2. **`assertOrgMembership` logging includes `automationId`?**
   - CONTEXT.md specifies logging `userId`, `attemptedOrgId`, `automationId`
   - The helper itself doesn't know `automationId` (it only knows `orgId`)
   - Solution: Log `automationId` in the action after calling the helper, not inside the helper
   - Or: Pass optional `resourceId` to helper for logging context

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts` — full file
- `web/src/components/dashboard/notification-bell.tsx` — full file
- `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` — full file
- `web/src/lib/actions/settings.ts` — membership check pattern
- `web/messages/en.json` — existing i18n structure including `common` and `dashboard.home.timeAgo`
- `web/messages/es.json` — Spanish equivalents confirmed
- `supabase/migrations/20260305000001_core_identity.sql` — organization_members schema + RLS
- `supabase/migrations/20260305000002_automation_business.sql` — automations schema + RLS (writes: service_role only)
- `supabase/migrations/20260401000001_user_registration.sql` — role CHECK expansion to include 'owner'
- `web/src/i18n/request.ts` — next-intl config (cookie-based locale)
- `web/src/lib/` — directory structure (no existing `lib/auth/` or `lib/utils/`)
- Multiple settings components — toast pattern verification (no sonner)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and existing imports
- Architecture patterns: HIGH — verified from direct codebase reading
- Security fix approach: HIGH — follows exact pattern from `settings.ts` (same codebase)
- i18n approach: HIGH — follows established next-intl project patterns
- Pitfalls: HIGH — derived from direct schema and RLS inspection

**Research date:** 2026-04-30
**Valid until:** This research is codebase-specific and does not expire unless files change

## RESEARCH COMPLETE
