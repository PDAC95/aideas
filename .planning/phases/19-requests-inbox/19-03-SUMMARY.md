---
phase: 19-requests-inbox
plan: 03
subsystem: admin-ui
tags: [next.js, react, server-components, client-components, server-actions, zod, i18n, admin, supabase, notifications, race-conditions]

requires:
  - phase: 19-requests-inbox
    plan: 01
    provides: fetchAdminRequestDetail, automations.setup_notes column, AdminRequestDetail type
  - phase: 19-requests-inbox
    plan: 02
    provides: admin.requests.list namespace (statusBadges, noTemplate, noRequirements re-used by detail)

provides:
  - approveRequest server action (race-guarded; INSERT automation in_setup -> UPDATE request approved -> best-effort notification fan-out)
  - rejectRequest server action (race-guarded; UPDATE request rejected with notes=reason -> best-effort notification with reason verbatim)
  - approveRequestSchema + rejectRequestSchema (Zod with uuid-shape regex; 10..500 char reason after trim)
  - /admin/requests/[id] server-rendered detail page
  - AdminRequestDetail server layout component (customer card + request body + timeline + terminal-state result panel)
  - ApproveRequestButton client component (single click, useTransition + router.refresh)
  - RejectRequestModal client component (textarea + char counter + Zod-mirrored client validation)
  - admin.requests.detail i18n namespace (41 leaf keys per locale, full EN/ES parity)
  - Removal of obsolete admin.placeholders.requests block

affects: [20-automations-admin, 21-clients-admin]

tech-stack:
  added: []
  patterns:
    - "Server action with discriminated-union result + typed race-condition error: pre-flight SELECT status -> mutation .eq('id', x).eq('status', 'pending') as second SQL-layer guard -> typed 'state_changed' error to UI"
    - "Best-effort notification fan-out: a helper function that swallows lookup/insert errors, logs warnings, and never propagates to caller — approve/reject succeed even if notifications fail"
    - "Server-component layout receives a children-shaped `actions: ReactNode` prop so client action UI (button + modal) can sit inside an otherwise server-rendered tree without forcing the parent to be 'use client'"
    - "Page resolves all translations server-side and forwards plain objects (including t.raw() template strings with {placeholder} tokens) to the client action components — no useTranslations() in the client subtree"
    - "Mirroring server-side Zod constraints in the client modal (REJECT_REASON_MIN/MAX imported from the schema file) so the Confirm button stays disabled until the server would accept — eliminates a server round-trip for invalid input"

key-files:
  created:
    - "web/src/lib/validations/admin-request.ts"
    - "web/src/lib/actions/admin-requests.ts"
    - "web/src/app/(admin)/admin/requests/[id]/page.tsx"
    - "web/src/components/admin/requests/admin-request-detail.tsx"
    - "web/src/components/admin/requests/approve-request-button.tsx"
    - "web/src/components/admin/requests/reject-request-modal.tsx"
  modified:
    - "web/messages/en.json"
    - "web/messages/es.json"

key-decisions:
  - "Approve flow ordering is INSERT-then-UPDATE: the failure mode of leaving an orphan in_setup automation with a still-pending request is recoverable via Phase 20 (operator archives), whereas the inverse (request flipped to approved with no automation) would lie to the customer about the work being underway"
  - "Double race guard: pre-flight `status='pending'` SELECT plus `.eq('status','pending')` on the UPDATE — second concurrent staff hitting Approve cannot double-create automations because their UPDATE matches zero rows AND/OR their pre-flight SELECT shows non-pending status"
  - "Notification copy is pre-rendered English strings on the server (mirrors how Phase 8 dashboard notifications render notifications.message verbatim) — keying notifications via i18n is a future v1.3 enhancement"
  - "REJECT_REASON_MIN=10, REJECT_REASON_MAX=500 enforced AFTER trim via Zod transform-then-pipe; matches CONTEXT.md's intentional friction for short-but-coherent reasons (\"Falta info\", \"Duplicado\")"
  - "Action button slot via ReactNode prop rather than children: allows the layout to keep precise structural control over WHERE actions render (inside the request card, only when status='pending', under a top border) without forcing a 'use client' boundary"
  - "Detail page consumes fetchAdminRequestDetail (Plan 19-01 contract) directly — no ad-hoc Supabase queries inline; keeps the data plane single-sourced and testable"
  - "Spanish translations stay accent-free (Solicitud, Aprobada, Rechazada, Linea de tiempo, Sin plan activo, Equipo AIDEAS) per existing es.json convention; matches Mexican-neutral phrasing used across the catalog admin"

patterns-established:
  - "Server-action skeleton for Phase 20+ admin transitions: createAdminServerClient -> assertPlatformStaff -> Zod parse -> pre-flight status SELECT -> mutation with second SQL guard -> revalidatePath admin + customer routes. Phase 20 status transitions (in_setup->active, active<->paused, archive) clone this verbatim."
  - "Best-effort notification fan-out helper: any future server action that needs to ping all active members of an org reuses notifyOrgMembers shape — pull org_members where is_active=true, build N rows, single bulk insert, swallow on failure"

requirements-completed: [REQS-02, REQS-03, REQS-04, I18N-01]

duration: 6 min
completed: 2026-05-07
---

# Phase 19 Plan 03: Detail Page + Approve/Reject Actions Summary

**Closes Phase 19 by shipping the detail route at /admin/requests/[id] plus two race-guarded server actions (approveRequest, rejectRequest) with Zod-validated input and best-effort customer notifications. Operations can now triage incoming customer requests end-to-end: see customer context, read the full request, and either approve (which creates a real in_setup automation row + notifies the org) or reject (which captures a 10..500 char reason + notifies with that reason verbatim). Removes the now-obsolete admin.placeholders.requests block from both locales.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-07T13:41:30Z
- **Completed:** 2026-05-07T13:47:31Z
- **Tasks:** 3
- **Files modified:** 8 (6 created, 2 modified)

## Accomplishments

- **Zod validation** (`web/src/lib/validations/admin-request.ts`):
  - `approveRequestSchema` with uuid-shape regex (loose, matches the seed's non-RFC UUIDs).
  - `rejectRequestSchema` with `transform(s => s.trim()).pipe(min(10, "reason_too_short").max(500, "reason_too_long"))` — Zod returns localized error codes (`reason_too_short`, `reason_too_long`) that the modal maps to client copy.
  - Exports the constants `REJECT_REASON_MIN=10` and `REJECT_REASON_MAX=500` so the client modal can mirror server-side limits (disable Confirm before round-tripping).
- **Server actions** (`web/src/lib/actions/admin-requests.ts`):
  - `approveRequest` returns `{ ok: true, automationId } | { ok: false, error: 'invalid_input' | 'not_authenticated' | 'not_staff' | 'not_found' | 'state_changed' | 'create_failed' }`. Steps: assertPlatformStaff -> Zod parse -> SELECT request (pre-flight status guard) -> resolve template+org names (best-effort) -> INSERT automation `{template_id, organization_id, status:'in_setup', name:"{Template} for {Org}", description:request.description, setup_notes:request.description}` -> UPDATE request `{status:'approved', completed_at:now}` with `.eq('status','pending')` second guard -> notifyOrgMembers (success type, `link:'/dashboard/automations'`) -> revalidatePath admin list/detail + customer notifications/automations.
  - `rejectRequest` returns `{ ok: true } | { ok: false, error: ..., fieldError?: 'reason_too_short'|'reason_too_long' }`. Steps: assertPlatformStaff -> Zod parse with field-error extraction -> SELECT request (pre-flight status guard) -> resolve template name (best-effort) -> UPDATE request `{status:'rejected', notes:reason, completed_at:now}` with `.eq('status','pending')` second guard -> notifyOrgMembers (warning type, message includes reason verbatim).
  - Helper `notifyOrgMembers` swallows errors and logs warnings; never blocks the parent action.
- **Detail page** (`web/src/app/(admin)/admin/requests/[id]/page.tsx`):
  - Server-rendered. Calls `fetchAdminRequestDetail(id, locale)` from Plan 19-01; returns `notFound()` on null.
  - Pre-resolves all translations (uses `t.raw()` for templates with `{user}`/`{reason}`/`{count}`/`{max}` placeholders that components substitute at render).
  - Builds an `actions` ReactNode (Approve button + Reject modal) only when `detail.status === 'pending'` and forwards it via prop.
- **Detail layout** (`web/src/components/admin/requests/admin-request-detail.tsx`):
  - Server component. Three-column responsive layout (`lg:grid-cols-3`): customer card on the left (1 col), request body + timeline + terminal-state result panel on the right (2 cols).
  - Customer card: org name, slug (font-mono), plan (or "No active plan"), signup date, active automations count, requester (name + email), View client profile link.
  - Request body: template (or "Custom request" fallback when template_id is null), urgency, full custom_requirements (`whitespace-pre-wrap` + "No additional requirements" fallback). Below the body, a top-bordered actions row renders the slot only when status='pending'.
  - Timeline: 1 event when pending (Created by {user}), 2 events when terminal (+ Approved/Rejected by AIDEAS staff). Vertical bullet style with color-coded dots (blue/green/red).
  - Result panel: green success card linking to `/admin/automations/[id]` (live in Phase 20+) when approved; red error card with reason inline when rejected.
- **Action UI** (client components):
  - `approve-request-button.tsx` — single button, `useTransition`, calls `approveRequest`. On `state_changed`: alert + `router.refresh()`. On other errors: alert + log. On success: `router.refresh()`.
  - `reject-request-modal.tsx` — trigger button, full-screen overlay with click-outside-to-close, textarea + char counter + error display, Cancel + red Confirm buttons. Confirm gated by `trimmed.length >= 10 && trimmed.length <= 500 && !isPending`. On success: close + reset + `router.refresh()`.
- **i18n** — 41 leaf keys added to `admin.requests.detail` per locale: `backLink`, 4 section headers, 8 customer labels, 7 request labels (incl. 3 urgency values), 4 timeline templates, 6 result labels, 5 action labels, 11 reject-modal labels (including `charCounter` template). Removed the obsolete `admin.placeholders.requests` block from both locales (the page that consumed it is now the real list page from 19-02 + the real detail page from this plan). EN/ES parity verified by recursive flattening — zero missing in either direction; total i18n key count is now 791.
- **Build verified** — `npm run build` (with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` per the same Google Fonts sandbox issue 19-01/02 documented) exits 0 and emits BOTH `/admin/requests` AND `/admin/requests/[id]` as dynamic server-rendered routes. `tsc --noEmit` exits 0 across the project. Scoped lint on the 6 created/modified files exits 0.

## Task Commits

1. **Task 1: Zod schemas + approve/reject server actions** — `d13246b` (feat)
2. **Task 2: Detail page + AdminRequestDetail layout + ApproveRequestButton + RejectRequestModal** — `b38774b` (feat)
3. **Task 3: Add admin.requests.detail i18n keys + remove admin.placeholders.requests** — `0bd3654` (feat)

**Plan metadata:** _(committed after this summary)_

## Files Created/Modified

- `web/src/lib/validations/admin-request.ts` — Zod schemas (approve + reject) with reason min/max constants.
- `web/src/lib/actions/admin-requests.ts` — `approveRequest` and `rejectRequest` server actions; private `notifyOrgMembers` helper.
- `web/src/app/(admin)/admin/requests/[id]/page.tsx` — Server-rendered detail route; pre-resolves translations and conditionally builds the actions slot.
- `web/src/components/admin/requests/admin-request-detail.tsx` — Server layout with customer card, request body, timeline, and terminal-state result panel.
- `web/src/components/admin/requests/approve-request-button.tsx` — Client button with useTransition + router.refresh.
- `web/src/components/admin/requests/reject-request-modal.tsx` — Client modal with textarea, char counter, and Zod-mirrored validation.
- `web/messages/en.json` — Added `admin.requests.detail.*` (41 leaf keys). Removed `admin.placeholders.requests`.
- `web/messages/es.json` — Added `admin.requests.detail.*` (41 leaf keys, accent-free). Removed `admin.placeholders.requests`.

## Server-Action Contract Reference (intel for Phase 20+)

```typescript
approveRequest({ requestId: string }): Promise<
  | { ok: true; automationId: string }
  | { ok: false; error:
      | "invalid_input"
      | "not_authenticated"
      | "not_staff"
      | "not_found"
      | "state_changed"   // race condition: another staff already processed
      | "create_failed" }
>

rejectRequest({ requestId: string; reason: string }): Promise<
  | { ok: true }
  | { ok: false; error: ...same shape as above with 'update_failed'
      ; fieldError?: "reason_too_short" | "reason_too_long" }
>
```

Both actions trigger these revalidations on success:
- `/admin/requests` (list)
- `/admin/requests/{id}` (detail self)
- `/dashboard/notifications` (so the customer sees the new notification on next visit)
- approve adds `/dashboard/automations` (the new in_setup automation is visible there)

### Data Copied to the New Automations Row on Approve

| Column            | Source                                                    |
|-------------------|-----------------------------------------------------------|
| `organization_id` | `automation_requests.organization_id`                     |
| `template_id`     | `automation_requests.template_id` (NULL for custom requests) |
| `name`            | `"${templateName} for ${orgName}"` (templateName resolved from EN translation row, fallback to request.title; orgName from organizations.name, fallback "your organization") |
| `description`     | `automation_requests.description` (mirror; backwards-compat) |
| `status`          | Literal `'in_setup'`                                      |
| `setup_notes`     | `automation_requests.description` (the customer's custom_requirements text, persisted via the Plan 19-01 column) |
| `created_at`      | NOT overridden — uses table default `NOW()`               |

### Detail Page Component Split

| Component                  | Boundary | Responsibility                                                                                  |
|----------------------------|----------|-------------------------------------------------------------------------------------------------|
| `[id]/page.tsx`            | Server   | Fetches detail, resolves translations, builds the actions ReactNode if pending, renders layout. |
| `AdminRequestDetail`       | Server   | Pure layout: customer card, request body, timeline, terminal result panel. Receives `actions` slot. |
| `ApproveRequestButton`     | Client   | useTransition + approveRequest call + router.refresh.                                           |
| `RejectRequestModal`       | Client   | Modal lifecycle, textarea state, char counter, Zod-mirrored validation, rejectRequest call.     |

## Decisions Made

- **Approve flow ordering is INSERT-then-UPDATE.** Failure modes inverted: orphan in_setup automation with a still-pending request is recoverable via Phase 20 (operator archives the orphan). The opposite ordering (UPDATE first) would leave the customer seeing "approved" with no actual automation — silently lying about work being underway.
- **Double race guard.** A pre-flight SELECT verifies status='pending' before mutating; a second `.eq('status','pending')` clause on the UPDATE statement at the SQL layer ensures concurrent staff cannot both succeed. The first staff to hit the UPDATE wins; the second sees the request as no-longer-pending on their pre-flight (or matches zero rows on UPDATE) and returns `state_changed`.
- **Best-effort notifications, not transactional.** `notifyOrgMembers` swallows errors and logs warnings. CONTEXT.md is explicit: notification failures must not block approve/reject. The customer's in-app notification is best-effort messaging, not a contract.
- **Notification copy is pre-rendered English strings.** The customer's `/dashboard/notifications` page renders `notifications.title` and `notifications.message` verbatim (Phase 8 contract). A future v1.3 phase can switch to keyed messages once a notification i18n layer exists.
- **REJECT_REASON_MIN=10 enforced AFTER trim.** CONTEXT.md prescribes "intentional friction" — short-but-coherent phrases like "Falta info" and "Duplicado" must work. Trim then check at >=10 chars catches both whitespace-padding tricks and "x"/"no" non-reasons.
- **Action slot via `actions: ReactNode` prop, not `children`.** Lets the server layout decide WHERE the slot renders (inside the request card, after the body, under a top border, only when status='pending') while still allowing client-component children to live inside the otherwise-server tree.
- **Field-error extraction for reject.** The Zod transform-then-pipe shape returns issues at `path: ["reason"]`. The action extracts the issue's message code (`reason_too_short` / `reason_too_long`) and forwards as `fieldError` so the modal can show the right localized message without parsing the error envelope.
- **Translation forwarding pattern reused from Phase 18 catalog.** Server resolves every label server-side, forwards plain JS objects to client components, no `useTranslations()` in the client subtree. `t.raw()` for any string containing `{placeholder}` tokens that the component substitutes at render.

## Deviations from Plan

None - plan executed exactly as written.

The plan's Task 2 step instructed first writing an empty `<div>` action-slot placeholder and then refactoring it to use the `actions` prop. I skipped the placeholder and went straight to the `actions` prop pattern in a single pass — same code shape the plan ultimately specified, just less churn. No functional difference.

## Issues Encountered

- **`npm run build` requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` in this sandbox** — same Google Fonts TLS issue documented in 19-01-SUMMARY.md and 19-02-SUMMARY.md. Not a code defect; an environmental constraint when running CI offline of the global Google Fonts CDN. With the flag set, build exits 0 and emits both `/admin/requests` and `/admin/requests/[id]` as dynamic server-rendered routes.
- **No new lint errors introduced.** Scoped lint against the 6 created/modified files exits 0. `tsc --noEmit` exits 0 across the project.

## User Setup Required

None — no external service or env var changes. The `automations.setup_notes` column from 19-01 must already be applied on whatever DB this runs against; for local dev that's `supabase migration up` or equivalent.

## Recommended UAT (Human, Pre-Phase-19-Verification)

1. Sign in to `/admin/login` as `pdmckinster@gmail.com`.
2. Hit `/admin/requests` — Pending tab shows the seed pending request `e9111111-...000001`.
3. Click into it → detail page renders:
   - Customer card with org name, slug, plan, signup date, active automations count, requester
   - Request body with template, urgency, full custom_requirements
   - Timeline with one "Created by {user}" event
   - Approve + Reject buttons in the action slot under the request body
4. Click **Approve** → page refreshes; status badge becomes "Approved"; timeline gains the second event "Approved by AIDEAS staff"; green Outcome panel appears with "Open automation →" link (404 OK, lives in Phase 20).
5. As the customer (other browser), refresh `/dashboard/notifications` → see the new "Request approved" notification with link to `/dashboard/automations`.
6. On a fresh pending request, click **Reject** → modal opens.
   - Type "x" → "Reason must be at least 10 characters." appears as you reach 1+ chars; Confirm stays disabled.
   - Type "Falta informacion sobre integraciones" → counter shows live count, Confirm enabled.
   - Click Confirm → modal closes; page refreshes; status badge becomes "Rejected"; reason shown inline in the red Outcome panel.
7. Customer notifications now contain the rejection notification with the reason text verbatim.
8. **Race-condition smoke (optional):** open the same pending request in two staff browser tabs. Approve in tab A → tab B's button click should alert "This request was already processed by another staff member. Reloading." and refresh the page to show the approved state.
9. Switch language to Spanish (cookie or settings) and repeat any of the above to confirm Spanish copy renders correctly across the detail page, Approve/Reject buttons, and reject modal.

## Next Phase Readiness

- **Phase 20 (Automations Admin)** can wire `/admin/automations` and the cross-org list page; the green "Open automation →" link in the approved-result panel will go live the moment 20 ships, with no changes needed in 19's code.
- **Phase 21 (Clients Admin)** will activate the "View client profile →" link in the customer card; same — no detail-page changes needed.
- **Server-action skeleton** (`assertPlatformStaff -> Zod parse -> pre-flight SELECT -> mutation with second SQL guard -> revalidate admin + customer paths`) is now battle-tested twice (Phase 18 toggles + this plan's approve/reject). Phase 20 status transitions (`in_setup -> active`, `active <-> paused`, `archive`) clone this verbatim. Notification fan-out helper (`notifyOrgMembers`) is the right shape for any future "tell the customer their automation changed state" event.
- **Phase 19 is functionally complete** at the end of this plan: REQS-01 (list, in 19-02), REQS-02 (detail, in 19-03), REQS-03 (approve, in 19-03), REQS-04 (reject, in 19-03), I18N-01 (cross-cuts; full parity at every plan boundary). After human UAT passes, Phase 19 verification ticks `passed`.

---
*Phase: 19-requests-inbox*
*Completed: 2026-05-07*

## Self-Check: PASSED

All claimed artifacts verified on disk:
- `web/src/lib/validations/admin-request.ts` — FOUND
- `web/src/lib/actions/admin-requests.ts` — FOUND
- `web/src/app/(admin)/admin/requests/[id]/page.tsx` — FOUND
- `web/src/components/admin/requests/admin-request-detail.tsx` — FOUND
- `web/src/components/admin/requests/approve-request-button.tsx` — FOUND
- `web/src/components/admin/requests/reject-request-modal.tsx` — FOUND
- `.planning/phases/19-requests-inbox/19-03-SUMMARY.md` — FOUND

All claimed commits verified in `git log`:
- `d13246b` feat(19-03): add Zod schemas and approve/reject server actions — FOUND
- `b38774b` feat(19-03): add request detail page with approve/reject actions — FOUND
- `0bd3654` feat(19-03): add admin.requests.detail i18n namespace and remove placeholder — FOUND

Verification commands run during execution (all passed):
- `npx tsc --noEmit -p .` from `web/` — exit 0
- Scoped `npx eslint` against the 6 created/modified files — exit 0
- Exports symbol check (approveRequestSchema, rejectRequestSchema, REJECT_REASON_MIN, REJECT_REASON_MAX, approveRequest, rejectRequest, ApproveResult, RejectResult) — OK
- File-existence check for the 4 component/page files — OK
- i18n parity script (recursive flatten, both directions, 41 required leaf keys, admin.placeholders.requests removal check) — OK, 791 total keys
- `npm run build` (with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`) — exit 0; both `/admin/requests` and `/admin/requests/[id]` emitted as dynamic server-rendered routes
