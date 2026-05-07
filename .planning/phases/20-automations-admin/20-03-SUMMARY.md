---
phase: 20-automations-admin
plan: 03
subsystem: ui
tags: [next-intl, supabase, postgrest, admin, automations, server-actions, transitions, race-condition, notifications]

# Dependency graph
requires:
  - phase: 20-automations-admin
    plan: 01
    provides: AdminAutomationStatus type, /admin/automations list with row Name links to detail page
  - phase: 20-automations-admin
    plan: 02
    provides: AdminAutomationDetail type, fetchAdminAutomationDetail, /admin/automations/[id] with actions ReactNode slot pre-wired (passing null)
  - phase: 19-requests-inbox
    plan: 03
    provides: server-action skeleton (assertPlatformStaff -> Zod parse -> pre-flight SELECT -> mutation with second SQL guard -> revalidatePath admin + customer paths), notifyOrgMembers shape, race-condition state_changed pattern, client useTransition + router.refresh pattern, full-screen modal pattern with click-outside-to-close
  - phase: 17-admin-foundation
    provides: assertPlatformStaff helper, createAdminServerClient, (admin) route group + AdminShell layout
provides:
  - transitionAutomationSchema (Zod) — uuid + expectedStatus enum (in_setup|active|paused)
  - ALLOWED_EXPECTED_STATUSES readonly tuple
  - TransitionAutomationInput type
  - TransitionResult discriminated union
  - activateAutomation (in_setup -> active, success notification)
  - pauseAutomation (active -> paused, info notification)
  - resumeAutomation (paused -> active, success notification)
  - archiveAutomation (active|paused -> archived, info notification)
  - AutomationTransitionButtons (client) — contextual 0..2 buttons by status
  - ArchiveAutomationModal (client) — confirmation modal, calls archiveAutomation
  - admin.automations.detail.actions namespace (9 leaf keys per locale)
  - admin.automations.detail.archiveModal namespace (7 leaf keys per locale)
affects: [21-clients-admin, 22-admin-home]

# Tech tracking
tech-stack:
  added: []  # No new libraries
  patterns:
    - "Shared transition primitive: doTransition(args) wrapping Zod parse + assertPlatformStaff + pre-flight SELECT + .eq('status', expectedStatus) SQL race guard + best-effort notification fan-out + revalidatePath. Four exported actions wrap with their from/to/notification copy. ~30 LOC of duplication of notifyOrgMembers vs admin-requests.ts is intentional (per-domain helper evolution)."
    - "Action-layer enum guard: each action constrains expectedFromStatuses to its allowed starting state(s); a request with the wrong expected_status returns invalid_input even though Zod accepts any of the three. Belt-and-braces."
    - "Archive-only confirmation modal pattern: only one of the four transitions warrants confirmation friction. The other three are direct-click. Modal owns its own open state + isPending + error display; trigger button lives inside the modal component (clones reject-request-modal.tsx without the textarea + char counter)."
    - "Contextual buttons component: 0..2 buttons rendered by currentStatus discriminator. Page passes currentStatus narrowed to 'in_setup'|'active'|'paused' via type assertion (transitionableStatuses readonly array .includes guard); other statuses return null actions."

key-files:
  created:
    - web/src/lib/validations/admin-automation.ts
    - web/src/lib/actions/admin-automations.ts
    - web/src/components/admin/automations/automation-transition-buttons.tsx
    - web/src/components/admin/automations/archive-automation-modal.tsx
  modified:
    - web/src/app/(admin)/admin/automations/[id]/page.tsx (actions={null} -> AutomationTransitionButtons for transitionable statuses)
    - web/messages/en.json (+ admin.automations.detail.actions + admin.automations.detail.archiveModal)
    - web/messages/es.json (+ admin.automations.detail.actions + admin.automations.detail.archiveModal, accent-free Spanish)

key-decisions:
  - "Shared doTransition primitive over four separate copy-pasted actions. Single race-guard and revalidatePath site, four thin wrappers. Easier to evolve."
  - "notifyOrgMembers helper duplicated from admin-requests.ts (~30 LOC) instead of imported. Per CONTEXT.md guidance: each action module owns its own helper so per-domain copy/type/link rules can evolve independently."
  - "Notification copy is pre-rendered English strings on the server, mirroring Phase 19 approve/reject. Switching to keyed messages requires a notification i18n layer; deferred to v1.3 per CONTEXT.md."
  - "Notification link is /dashboard/automations for ALL four transitions — gives the customer a single click to see the affected automation in their list."
  - "Archive is the only transition with a confirmation modal. The other three are direct-click — friction only where it matters (irreversible-from-customer-side)."
  - "All four transition actions accept the same TransitionAutomationInput shape (uuid + expectedStatus enum). Zod accepts any of the three enum values; the action layer enforces the specific allowed-from list. Lets a single Zod schema serve four actions."
  - "Defense-in-depth race guard: app-level pre-flight SELECT + SQL-level .eq('status', expectedStatus) on UPDATE. Two concurrent staff clicks: first wins; second's pre-flight catches the state change OR (if both pass pre-flight) second's UPDATE matches zero rows (Supabase returns success with no error) — but app-level pre-flight already returned state_changed."
  - "expectedStatus narrowing via runtime type assertion in page.tsx. The transitionableStatuses tuple is `as const` and the page does (transitionableStatuses as readonly string[]).includes(detail.status) before asserting detail.status as 'in_setup'|'active'|'paused'. Simple and lint-clean."
  - "ArchiveAutomationModal forwards its trigger inside its own component (vs. a children-as-trigger pattern). Cleaner prop API; matches reject-request-modal.tsx exactly."
  - "Customer-side propagation relies on revalidatePath (admin + customer routes) + best-effort notification fan-out, NOT a Supabase Realtime subscription on automations. Same posture as Phase 19. Realtime on automations could be added later if a UAT smoke test reveals stale UI on the customer side."
  - "Status badge palette already covers all 7 DB statuses (Plan 20-02). The detail page now also handles the operational subset {in_setup, active, paused} with active transition buttons; archived/draft/pending_review/failed render header without buttons."
  - "Did NOT add audit_log or who-flipped-status-when persistence — explicitly deferred per CONTEXT.md."
  - "Did NOT touch RLS — Phase 17's admin policies on automations and notifications already allow staff INSERT/UPDATE."

patterns-established:
  - "Shared transition primitive (doTransition) wrapping the Phase 19 server-action skeleton. Reusable for any future state-machine admin action where 2..N transitions share the same race-guard + notification + revalidate scaffolding (Phase 21 client suspend/reactivate, Phase 22 admin-driven status flips)."
  - "Confirmation-modal-only-when-irreversible pattern: clone reject-request-modal.tsx structure for any admin action that needs friction; direct-click everything else. Friction budget is small."
  - "Contextual buttons component: read currentStatus, return 0..N action buttons. Reusable for client account profile actions (suspend/reactivate/delete) in Phase 21."

requirements-completed: [AUTM-02, AUTM-03, AUTM-04, I18N-01]

# Metrics
duration: 5min
completed: 2026-05-07
---

# Phase 20 Plan 03: Admin Automation Status Transitions Summary

**Four contextual server actions (activate / pause / resume / archive) gated by `assertPlatformStaff` with race-condition guard + best-effort customer-notification fan-out, exposed via 0..2 contextual buttons on the /admin/automations/[id] header. Archive is the only one with a confirmation modal; the other three are direct-click. 16 new i18n keys per locale; full EN/ES parity. Phase 20 is now complete (5/5 requirements + I18N-01).**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-07T20:11:06Z
- **Completed:** 2026-05-07T20:15:56Z
- **Tasks:** 3
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- Four new server actions wrapping a shared `doTransition` primitive: activateAutomation, pauseAutomation, resumeAutomation, archiveAutomation. All gated by `assertPlatformStaff`, all with two-layer race guard (app-level pre-flight SELECT + SQL-level `.eq('status', expectedStatus)` on UPDATE), all with best-effort notifyOrgMembers fan-out, all revalidating four paths (admin list/detail + customer automations/notifications).
- `transitionAutomationSchema` Zod schema accepts uuid + expectedStatus enum (`in_setup|active|paused`); each action enforces its allowed starting states at the action body layer (belt-and-braces with Zod).
- `TransitionResult` discriminated union: `{ ok: true, newStatus }` or `{ ok: false, error: invalid_input | not_authenticated | not_staff | not_found | state_changed | update_failed }`.
- `AutomationTransitionButtons` client component renders contextual 0..2 buttons:
  - `in_setup` -> green Activate
  - `active` -> amber Pause + outline-red Archive
  - `paused` -> green Resume + outline-red Archive
  - `archived | draft | pending_review | failed` -> renders nothing (page passes `actions={null}`)
- `ArchiveAutomationModal` client component owns its own open state + isPending + inline error display; trigger button is inside the component (no children-as-trigger pattern); calls `archiveAutomation` directly with `expectedStatus` forwarded by the parent.
- Detail page (`/admin/automations/[id]`) updated to swap `actions={null}` for `<AutomationTransitionButtons />` when status is one of `in_setup|active|paused`; reads `actions.*` and `archiveModal.*` translations into a flat object and forwards as a `translations` prop.
- 16 new i18n leaf keys per locale (9 actions + 7 archiveModal); full EN/ES parity preserved (873 total leaf keys after this plan, was 857).
- Notification copy verified verbatim against CONTEXT.md (in_setup->active = success "Your automation '{name}' is now active"; active->paused = info; paused->active = success; *->archived = info).

## Task Commits

Each task was committed atomically on `feature/phase-20-automations-admin`:

1. **Task 1: Zod schema + four server actions (activate/pause/resume/archive)** — `c2af7a0` (feat)
2. **Task 2: AutomationTransitionButtons (client) + ArchiveAutomationModal (client) + page.tsx update** — `31cfc9e` (feat)
3. **Task 3: Add admin.automations.detail.actions + archiveModal i18n keys (EN + ES, full parity)** — `be26f6c` (feat)

## Files Created/Modified

**Created:**
- `web/src/lib/validations/admin-automation.ts` — Zod schema (`transitionAutomationSchema`), readonly enum tuple (`ALLOWED_EXPECTED_STATUSES`), inferred type (`TransitionAutomationInput`).
- `web/src/lib/actions/admin-automations.ts` — `"use server"` module exporting `TransitionResult` type and four async server actions, plus the internal `doTransition` primitive and the duplicated `notifyOrgMembers` helper.
- `web/src/components/admin/automations/automation-transition-buttons.tsx` — client component, contextual 0..2 buttons by `currentStatus`. Direct-click for activate/pause/resume; renders `<ArchiveAutomationModal>` for archive on the active and paused branches.
- `web/src/components/admin/automations/archive-automation-modal.tsx` — client component, full-screen modal overlay (click-outside-to-close), Cancel + red Confirm row, inline error message between body and buttons. Calls `archiveAutomation` and forwards `expectedStatus` from props.

**Modified:**
- `web/src/app/(admin)/admin/automations/[id]/page.tsx` — added import for `AutomationTransitionButtons`, built `actionTranslations` object from `t("actions.*")` and `t("archiveModal.*")`, computed `actions` ReactNode from `transitionableStatuses.includes(detail.status)` guard, swapped `actions={null}` for `actions={actions}`. Page remains a server component; only the buttons + modal subtree is client.
- `web/messages/en.json` — added `admin.automations.detail.actions` (9 leaf keys) + `admin.automations.detail.archiveModal` (7 leaf keys) as siblings of `setupNotes`.
- `web/messages/es.json` — same shape with Spanish parity (accent-free per project convention).

## Decisions Made

- **Shared `doTransition` primitive over four copy-pasted actions.** Single race-guard + revalidatePath + notification fan-out site; four thin wrappers (`activateAutomation`, `pauseAutomation`, `resumeAutomation`, `archiveAutomation`) provide the from/to/notification-copy specifics. Easier to evolve (any change to race-guard or revalidate paths is one site, not four).
- **`notifyOrgMembers` helper duplicated from `admin-requests.ts` (~30 LOC), not imported.** Per CONTEXT.md guidance: each action module owns its own helper so per-domain copy / notification type / link rules can evolve independently. The duplication cost is small and stable.
- **Notification copy is pre-rendered English strings on the server.** Mirrors Phase 19 approve/reject exactly. Switching to keyed messages requires a notification i18n layer; deferred to v1.3 per CONTEXT.md.
- **Notification `link` is `/dashboard/automations` for all four transitions.** Gives the customer a single click to see the affected automation in their list (rather than a per-status varying link). Per CONTEXT.md.
- **Archive is the only transition with a confirmation modal.** Activate / pause / resume are direct-click — friction only where the action is irreversible-from-the-customer-side. Per CONTEXT.md and AUTM-04.
- **All four actions accept the same `TransitionAutomationInput` shape (uuid + expectedStatus enum).** Zod accepts any of the three enum values (`in_setup|active|paused`); each action then enforces the specific allowed-from list at the body layer (e.g. `activateAutomation` rejects expectedStatus='paused' as `invalid_input`). Lets a single Zod schema serve four actions while still giving belt-and-braces protection.
- **Defense-in-depth race guard.** App-level pre-flight `SELECT id, name, organization_id, status` followed by `if (row.status !== expectedStatus) return state_changed;`, then SQL-level `.eq('id', automationId).eq('status', expectedStatus)` on the UPDATE. Two concurrent staff clicks: the first wins; the second's pre-flight catches the state change OR (in the rare interleaving where both pass pre-flight) the second's UPDATE matches zero rows. Either way the second client gets `state_changed` and `router.refresh()` reconciles.
- **`expectedStatus` narrowing via runtime guard + type assertion in page.tsx.** The `transitionableStatuses` tuple is `as const`; the page does `(transitionableStatuses as readonly string[]).includes(detail.status as string)` then asserts `detail.status as 'in_setup'|'active'|'paused'`. Simple, no intermediate switch, lint-clean.
- **`ArchiveAutomationModal` owns its trigger button inside the component.** Same pattern as `RejectRequestModal`; cleaner prop API than children-as-trigger.
- **Customer-side propagation relies on `revalidatePath` + best-effort notification fan-out, NOT a Supabase Realtime subscription on `automations`.** Same posture as Phase 19. CONTEXT.md amended "Propagation pattern" section. If a UAT smoke test ever reveals stale UI on the customer side after a status flip, a Realtime channel can be added in a future plan.
- **Status badge palette already covers all 7 DB statuses (Plan 20-02).** This plan adds active transitions only for the operational subset `{in_setup, active, paused}`. The header for `archived`, `draft`, `pending_review`, `failed` still renders the badge but with no actions slot content — the `{actions && (...)}` conditional in `AdminAutomationDetail` (Plan 20-02) gracefully collapses an empty actions wrapper.
- **No `audit_log` or persistence of "who flipped status when".** Explicitly deferred per CONTEXT.md.
- **No RLS changes.** Phase 17's admin policies on `automations` (admin INSERT/UPDATE/DELETE) and `notifications` (admin INSERT) already cover this work end-to-end.

## Notification Copy Verification (verbatim against CONTEXT.md)

| Transition | Type | Title (server-rendered EN) | Message (server-rendered EN) |
|------------|------|----------------------------|------------------------------|
| in_setup -> active | success | "Automation activated" | `Your automation "{name}" is now active` |
| active -> paused | info | "Automation paused" | `Your automation "{name}" has been paused` |
| paused -> active | success | "Automation resumed" | `Your automation "{name}" has been resumed` |
| active|paused -> archived | info | "Automation archived" | `Your automation "{name}" has been archived` |

All four titles + messages match CONTEXT.md verbatim. Notification `type` mapping matches (success / info / success / info).

## Customer-side query confirmation

Phase 09's customer-side query at `web/src/lib/dashboard/queries.ts` already includes `.not("status", "eq", "archived")` for the default `/dashboard/automations` list. **No customer-side query change is needed for this plan.** Once an admin archives a row, the customer's list refreshes (via `revalidatePath('/dashboard/automations')`) and the row disappears from the default view. The Phase 09 client tabs (All / Active / In Setup / Paused) also exclude archived rows.

## Phase 20 completion

This plan is the third and final plan of Phase 20 — Automations Admin. After this commit:

- **AUTM-01** (Cross-org list with tabs + filters) — complete (Plan 20-01).
- **AUTM-02** (Activate `in_setup -> active`) — complete (this plan).
- **AUTM-03** (Pause `active -> paused`, Resume `paused -> active`) — complete (this plan).
- **AUTM-04** (Archive `active|paused -> archived` with confirmation modal) — complete (this plan).
- **AUTM-05** (Read-only detail page with KPIs + execution timeline) — complete (Plan 20-02).
- **I18N-01** (EN/ES parity for the entire phase) — satisfied across all three plans.

**Phase 20 is now ready for human UAT and merge.**

## Deviations from Plan

None — plan executed exactly as written. The shared `doTransition` primitive matches the plan-prescribed shape; the four exported actions match exactly; the two client components and the page update match exactly; the 16 i18n keys match the plan's EN/ES copy verbatim.

**Total deviations:** 0
**Impact on plan:** None.

## Issues Encountered

- `npm run build` requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` env var on Windows for Geist Google Fonts (carry-over from Phase 16/19/20-01/20-02). Build succeeds with the env var set; emits both `/admin/automations` AND `/admin/automations/[id]` as `ƒ (Dynamic) — server-rendered on demand`, the expected shape.
- Pre-existing `npm run lint` errors in unrelated files (auth, dashboard, signup form, ~104 errors) remain — out of scope per deviation-rules scope boundary. Scoped lint against this plan's 5 files exits 0 (zero errors, zero warnings).

## User Setup Required

None — no external service configuration. The transition actions are wired against existing seed data (operator can sign in to /admin/login and exercise the four buttons against the seeded automations).

## Recommended UAT (human, before declaring Phase 20 verified)

1. **Sign in as `pdmckinster@gmail.com`** at `/admin/login`.
2. **Activate flow:** Navigate to `/admin/automations`, filter by `In setup` tab, click into a seeded `in_setup` automation. Header should show a green **Activate** button. Click it. Page refreshes; status badge becomes "Active". Customer (in another browser as a member of the same org) sees a new notification: `"Your automation '<name>' is now active"` under `/dashboard/notifications`.
3. **Pause flow:** Click into an `active` automation. Header should show amber **Pause** + outline-red **Archive**. Click Pause. Status becomes "Paused"; notification fires.
4. **Resume flow:** On a `paused` automation, click green **Resume**. Status returns to "Active"; notification fires.
5. **Archive flow:** On an `active` (or `paused`) automation, click outline-red **Archive**. Confirmation modal opens with body copy and red **Archive** confirm. Click Confirm. Status becomes "Archived"; row disappears from customer's `/dashboard/automations` default tab (Phase 09 filter).
6. **Modal cancel:** On any archive flow, click Cancel — modal closes, no state change. Click outside the modal (on the dim overlay) — modal closes, no state change.
7. **Race-condition smoke:** Open the same automation in two browser tabs as `in_setup`. Click Activate in tab A. Then click Activate in tab B. Tab B should alert "This automation was already updated by another staff member. Reloading." and refresh; the page now shows the actions for `active` (Pause + Archive) instead of Activate.
8. **Locale parity:** Switch to ES locale; repeat steps 2-7. All button labels read in Spanish (Activar / Pausar / Reanudar / Archivar / Cancelar / Archivando..., etc.); modal title reads "Archivar esta automatizacion?"; error toast in race-condition test reads "Esta automatizacion ya fue actualizada por otro miembro del equipo. Recargando."
9. **Forbidden statuses:** Visit a `draft` or `pending_review` or `failed` or `archived` automation's detail page. Header shows the status badge with NO action buttons (the actions slot is empty).
10. **RLS smoke:** As a non-staff customer logged in to `/dashboard/*`, open devtools and try `fetch('/admin/automations/<id>', { method: 'POST', body: ... })` — expected: middleware redirects to `/admin/login` (or RLS rejects). Direct server-action invocation by non-staff returns `{ok:false, error:"not_staff"}`.

## Next Phase Readiness

- **Phase 20 is complete.** Five requirements (AUTM-01..05) + I18N-01 satisfied. Ready for human UAT and merge to main.
- **Phase 21 (Clients Admin) is unblocked.** The patterns established in Phase 20 — cross-org list with URL-state tabs/filters (20-01), read-only detail page with actions ReactNode slot (20-02), shared transition primitive with race guard + notification fan-out (20-03) — all transfer directly to client account management.
- **The shared `doTransition` primitive is reusable** for any future admin state-machine action. Phase 21 client suspend/reactivate flows can clone the pattern verbatim with their own from/to/notification-copy.
- **The contextual-buttons-by-status component** (`AutomationTransitionButtons`) is a reusable pattern for any future surface where 0..N actions render conditionally on a discriminator — Phase 21 client account actions (suspend/reactivate/delete), Phase 22 admin-home contextual quick-actions.

## Self-Check: PASSED

Files verified to exist:
- web/src/lib/validations/admin-automation.ts — FOUND
- web/src/lib/actions/admin-automations.ts — FOUND
- web/src/components/admin/automations/automation-transition-buttons.tsx — FOUND
- web/src/components/admin/automations/archive-automation-modal.tsx — FOUND
- web/src/app/(admin)/admin/automations/[id]/page.tsx — FOUND (modified)
- web/messages/en.json — FOUND (modified)
- web/messages/es.json — FOUND (modified)

Commits verified to exist on `feature/phase-20-automations-admin`:
- c2af7a0 — FOUND
- 31cfc9e — FOUND
- be26f6c — FOUND

Verifications run:
- `npx tsc --noEmit` against the 5 plan-20-03 files exits 0 (no project-wide change introduced).
- `npx eslint` against the 5 plan-20-03 files exits 0 with zero errors and zero warnings.
- `npm run build` (with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`) exits 0 and emits both `/admin/automations` AND `/admin/automations/[id]` as `ƒ (Dynamic)` server-rendered routes.
- i18n parity script: 873 total keys, zero missing in either direction; all 16 required `admin.automations.detail.actions.*` and `admin.automations.detail.archiveModal.*` leaf keys present in both locales.
- Two new client component files start with `"use client"` directive at file head.
- Page-level grep confirms `AutomationTransitionButtons`, `transitionableStatuses`, and `actionTranslations` references in `/admin/automations/[id]/page.tsx`.

---
*Phase: 20-automations-admin*
*Plan: 03*
*Completed: 2026-05-07*
