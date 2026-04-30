# Phase 14: i18n & Security Hygiene - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Close 3 audit gaps from prior phases — defense-in-depth on the automation lifecycle action and full i18n coverage on user-visible time strings. Specifically:

1. **Security:** `updateAutomationStatus` server action must verify the caller's organization membership (and role) for the target automation's `organization_id` before mutating, returning a typed error otherwise. (Closes MEDIUM-1)
2. **i18n (server):** `automations/[id]/page.tsx` `buildTimeAgo` helper must return localized strings for all time buckets (now, minutes, hours, days), not just the `< 60s` "Just now" hardcoded case. (Closes LOW-1, expands per discussion)
3. **i18n (client):** `notification-bell.tsx` `formatRelativeTime` must read its labels (`now`, `m`, `h`, `d`) from translations so Spanish locale renders Spanish abbreviations. (Closes NEW-LOW-1)

Out of scope: any other hardcoded strings in `notification-bell.tsx` beyond `formatRelativeTime`; new audit logging tables; automated security tests; refactor of unrelated server actions.

</domain>

<decisions>
## Implementation Decisions

### Membership Validation Strategy (Security gap)

- **Allowed roles for `updateAutomationStatus`:** `owner`, `admin`, `operator`. `viewer` is rejected. Coherent with the role hierarchy `owner > admin > operator > viewer` defined in `CLAUDE.md`.
- **Helper location:** Reusable helper in `web/src/lib/auth/` (e.g., `assertOrgMembership(supabase, orgId, allowedRoles?)`). Designed for reuse by future server actions that need the same check.
- **Helper behavior:** Reads the authenticated user via `supabase.auth.getUser()`, then queries `organization_members` for `(user_id, organization_id)` and verifies role is in `allowedRoles` (defaults to all non-viewer roles when not specified).
- **Error contract:** Discriminated union `{ error: string }` — same pattern as `lib/actions/auth.ts`. Generic message ("forbidden" / localized "No tienes permiso para realizar esta acción") to avoid leaking resource existence.
- **"Not found" vs "forbidden":** Treated identically — both return the same generic error. Standard practice to avoid an existence oracle.
- **Backend logging:** On rejected access attempt, `console.error` with structured context (`userId`, `attemptedOrgId`, `automationId`). No new `audit_log` table this phase — Vercel logs capture is sufficient.

### i18n Key Design (Time-relative strings)

- **Namespace:** `common.timeAgo.*` — single shared namespace reused by `notification-bell`, `buildTimeAgo`, and any future component. Keys to add: `now`, `minutes`, `hours`, `days` (and any additional buckets the existing helpers use).
- **Spanish abbreviations:** Short form to match existing English design. `now → "ahora"`, `m → "m"`, `h → "h"`, `d → "d"`. Preserves the compact visual layout of the notification bell (e.g., `"5m"`, `"2h"`).
- **Pluralization:** No pluralization on abbreviations — invariant across `1m / 5m`, `1h / 5h`. Matches current notification-bell pattern. Skip ICU MessageFormat for this phase (overkill for short labels).
- **Add to both `messages/en.json` and `messages/es.json`** — required by project i18n policy (CLAUDE.md).

### Translation Pattern (Client + Server)

- **Client component (`notification-bell.tsx`):** Use `useTranslations()` hook from `next-intl` directly. Standard next-intl 4.x pattern; less boilerplate than prop-drilling and avoids server payload growth.
- **Server component (`automations/[id]/page.tsx`):** Use `getTranslations()` from `next-intl/server`. The `buildTimeAgo` helper accepts the translator function `t` as a parameter so it stays a pure function and remains testable.
- **Shared helper:** Extract relative-time formatting to `web/src/lib/utils/time.ts` (e.g., `formatRelativeTime(date, t)`). Both `notification-bell` and `automations/[id]/page.tsx` consume the same helper. Single source of truth, prevents future divergence between the two sites.
- **Helper scope creep guardrail:** Only `formatRelativeTime` migrates to i18n — the rest of `notification-bell.tsx` stays as-is. Audit any other hardcoded strings as deferred work, not this phase.

### Error UX

- **Permission failure feedback:** Toast with generic localized message ("No tienes permiso para realizar esta acción" / "You don't have permission to perform this action"). No specifics about which org/automation.
- **Toast trigger location:** The client component that invokes `updateAutomationStatus` reads `{ error }` from the server action response and dispatches a toast (sonner / shadcn pattern). No global error boundary involved.
- **Loading/disabled state:** Existing patterns; no change needed unless the action call site doesn't already handle pending state.

### Verification (UAT)

- Add a manual UAT case to the phase's UAT.md: "As a user of Org A, attempt to call `updateAutomationStatus` for an automation belonging to Org B → must fail with the generic permission error and log a backend warning."
- Add a UAT case for i18n: "Switch locale to Spanish → notification bell shows `5m`/`2h`/`ahora` correctly; automation detail page shows `ahora`/`5m`/`2h`/`3d` instead of English variants."
- No automated E2E test (no Playwright infra in repo yet — out of scope per CLAUDE.md current state).

### Claude's Discretion

- Exact name of the membership helper file/function (e.g., `assert-org-membership.ts` vs `org-access.ts`) — pick what reads best alongside existing `lib/auth/` patterns.
- Internal structure of `formatRelativeTime` (single function with bucket logic vs. small dispatcher).
- Toast component to use (project already has sonner/shadcn — use whatever is currently set up, don't introduce a new one).
- Whether `assertOrgMembership` returns a `Result`-style discriminated union or throws internally and is wrapped in the action — pick whichever produces the cleaner action code.
- Exact set of i18n keys (e.g., whether to add `seconds` separately or fold it into `now`).

</decisions>

<specifics>
## Specific Ideas

- The membership helper should be designed with future reuse in mind — Phase 12 (Settings) and any later automation lifecycle actions (delete, archive) will likely need the same check.
- Generic "forbidden" responses for both `not found` and `not a member` are deliberate — security-first posture, matches industry best practice for multi-tenant apps.
- `notification-bell` already uses a compact visual style (`"5m"`, `"2h"`) — Spanish abbreviations must preserve this; no `"5 minutos"` long form.

</specifics>

<deferred>
## Deferred Ideas

- **Audit log table** for security-relevant events (failed permission checks, role changes) — out of scope this phase, candidate for a future security-hardening phase.
- **Automated E2E test infrastructure** (Playwright) — repo doesn't have this set up yet; tracked separately in CLAUDE.md tech debt.
- **Full i18n audit of `notification-bell.tsx`** beyond `formatRelativeTime` — note as deferred work if any other hardcoded strings are spotted during implementation.
- **Pluralization with ICU MessageFormat** — could be revisited if a future phase needs full-form time strings ("1 minute" vs "5 minutes").
- **Same membership-check refactor applied to other server actions** (e.g., archive/delete automation, settings mutations) — natural follow-up but out of this phase's scope.

</deferred>

---

*Phase: 14-i18n-security-hygiene*
*Context gathered: 2026-04-30*
