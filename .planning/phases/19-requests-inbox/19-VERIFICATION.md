---
phase: 19-requests-inbox
verified: 2026-05-07T00:00:00Z
uat_completed: 2026-05-07T18:00:00Z
status: passed
score: 12/12 must-haves verified + 5/6 human checks passed (1 deferred)
human_verification:
  - test: "Click Approve on a pending request and observe the customer-side notification"
    expected: "Request status flips to approved with timeline event; new automation row exists in_setup with setup_notes populated; customer notification of type=success appears with link to /dashboard/automations"
    why_human: "End-to-end approve flow crosses admin server action -> DB writes (automations + automation_requests) -> notification fan-out -> customer notification surface. Code paths verified statically; runtime behavior + DB side-effects need a real session."
  - test: "Reject modal opens, validates reason length, and disables Confirm until 10..500 chars"
    expected: "Typing <10 chars keeps Confirm disabled and shows 'Reason must be at least 10 characters' on attempt; typing 11+ chars enables Confirm; submitting with 600 chars hits the maxLength=500 cap on the textarea (UI prevents)"
    why_human: "Modal interaction (focus, keystroke validation, char counter color change at threshold, button enable/disable transitions) cannot be verified by grep; must observe DOM state across input events."
  - test: "Race-condition guard: open the same pending request in two tabs, approve in tab A, then approve in tab B"
    expected: "Tab B alerts errorStateChanged ('already processed by another staff member. Reloading.') and refreshes; second approval does NOT create a duplicate automation row"
    why_human: "Concurrent state-change behavior depends on real DB transactions and the second .eq('status','pending') guard catching the stale write. Not deterministic via static analysis."
  - test: "Tab navigation persists across page refresh"
    expected: "Click Approved tab -> URL becomes ?status=approved -> hard refresh (Ctrl+R) -> Approved tab still active and table shows approved rows; click Pending -> URL becomes bare /admin/requests with no querystring"
    why_human: "useRouter().push behavior + Next App Router URL state survival across refresh requires a live browser; verified the code uses next/navigation hooks correctly but runtime behavior is observational."
  - test: "EN/ES toggle: switch locale to Spanish and verify all admin.requests.list and admin.requests.detail strings render in Spanish"
    expected: "Page title 'Bandeja de solicitudes', tabs 'Pendientes/Aprobadas/Rechazadas', detail sections 'Cliente/Solicitud/Linea de tiempo/Resultado', reject modal 'Rechazar esta solicitud' etc., all without ICU MISSING_TRANSLATION errors in the console"
    why_human: "JSON parity is verified (791 keys both sides, zero missing) but actual locale switching + render behavior depends on next-intl runtime resolution which can fail silently (typos in dotted keys, wrong namespace at usage site, etc.). Quick visual verification."
  - test: "Approve creates automations row with status=in_setup and setup_notes=request.description"
    expected: "After approving request X with description 'Quiero conectar Stripe a Slack...', SELECT * FROM automations WHERE template_id=req.template_id AND organization_id=req.organization_id ORDER BY created_at DESC LIMIT 1 returns a row with status='in_setup' and setup_notes equal to that exact description text"
    why_human: "Verifies the migration column is actually populated by the server action against a real DB. Static check confirms code intent (setup_notes: req.description), but the column existing at runtime requires the migration to have been applied to the local Supabase instance."
---

# Phase 19: Requests Inbox Verification Report

**Phase Goal:** "List + detail + single-step approve (creates automation) + reject-with-reason"
**Verified:** 2026-05-07 (static) + 2026-05-07 (UAT)
**Status:** passed
**Re-verification:** No — initial verification

## UAT Outcomes (2026-05-07)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Approve flow end-to-end | PASSED | Required hotfix `8ec13ea` to nest subscriptions embed under organization (FK relationship runs through organizations, not direct from automation_requests) |
| 2 | Reject modal validation | PASSED | Modal opened, Zod min-10 validation triggered, reason persisted, timeline event added, outcome card rendered |
| 3 | Race condition guard | PASSED | Second approve attempt rejected with state_changed; page refreshed to show winner state |
| 4 | Tab URL persistence | PASSED | `?status=` survives F5 and is shareable across new tabs |
| 5 | EN/ES locale toggle | DEFERRED | Admin layout (Phase 17) does not include language switcher — cross-cutting gap, not Phase 19 scope |
| 6 | Migration applied + setup_notes populated | PASSED | Column exists as `text NULL`; populated correctly with request.description on approve |

## Hotfixes Applied During UAT

- `8ec13ea` — `fix(19): nest subscription embed under organization in detail query` — PostgREST cannot resolve direct subscriptions embed from automation_requests; embed must navigate through organizations FK chain.
- 4 prior hotfixes already merged (commits `529cd20`, `9d32535`, `e19aa44`, `fcc6bd5`) — expanded admin requests inbox to handle the real 7-status DB funnel via 3-tab grouping (pending tab also shows in_review, payment_pending, payment_failed; approved tab also shows completed). Approve/Reject still locked to `status='pending'` exactly.

## Tech Debt Registered (does not block close)

1. **Race-condition error toast disappears too quickly** — when Tab B's reject hits `state_changed`, the toast is replaced almost immediately by `router.refresh()` so the user can't read the error. UX polish: persist toast ~3-5s before refresh.
2. **Language switcher missing in admin layout** — Phase 17 cross-cutting gap blocking I18N runtime UAT for all admin surfaces (17, 18, 19, 20, 21, 22). Surfaces a deferred test 5.

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                                          | Status     | Evidence                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Migration adds `setup_notes TEXT` to `automations` (idempotent)                                                                | VERIFIED   | `supabase/migrations/20260508000001_automations_setup_notes.sql:13-14` — `ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS setup_notes TEXT`                     |
| 2   | `request-queries.ts` exports the three query functions, all gated by `assertPlatformStaff`                                     | VERIFIED   | `request-queries.ts:39,110,149` (3 exports); `assertPlatformStaff` called at lines 44, 112, 154 — every function throws on non-ok                                       |
| 3   | `types.ts` exports the four shared types                                                                                       | VERIFIED   | `types.ts:8` (AdminRequestStatus), `:10` (AdminRequestRow), `:21` (AdminRequestDetail), `:47` (AdminRequestStatusCounts)                                                |
| 4   | `/admin/requests/page.tsx` is a server component using the queries (no ad-hoc Supabase calls inline)                           | VERIFIED   | No `"use client"` directive; imports `fetchAdminRequests` + `fetchAdminRequestStatusCounts` (line 2-5); zero matches for `supabase.from`/`createClient` in this file     |
| 5   | `admin-requests-tabs.tsx` is a client component syncing tab state to `?status=`                                                | VERIFIED   | Line 1 `"use client"`; uses `useRouter`/`useSearchParams`/`usePathname` (line 4); `router.push` with querystring (line 55); drops param when status==="pending" (line 47-51) |
| 6   | `admin-requests-table.tsx` is server-rendered with 5 columns                                                                   | VERIFIED   | No `"use client"` directive; 5 `<th>` headers (customer/template/status/customRequirements/createdAt) at lines 71-100; each row links to `/admin/requests/[id]`         |
| 7   | `validations/admin-request.ts` exports both Zod schemas with reason 10..500 chars after trim                                   | VERIFIED   | `REJECT_REASON_MIN=10` (line 10), `REJECT_REASON_MAX=500` (line 11); `rejectRequestSchema` uses `.transform(s => s.trim()).pipe(z.string().min(10).max(500))` (lines 19-27) |
| 8   | `actions/admin-requests.ts` exports `approveRequest`/`rejectRequest`, gated by `assertPlatformStaff`, with race-condition guard returning typed `state_changed` | VERIFIED | Both call `assertPlatformStaff` (lines 130, 272); both have pre-flight SELECT with `req.status !== "pending" → state_changed` (lines 155, 296); approve has SECOND `.eq("status","pending")` SQL guard (line 211); reject has same (line 319) |
| 9   | `/admin/requests/[id]/page.tsx` consumes `fetchAdminRequestDetail`                                                             | VERIFIED   | Line 3 imports, line 30 calls; `notFound()` on null (line 35); passes detail to `AdminRequestDetail` layout                                                             |
| 10  | Detail layout + approve button + reject modal all exist with correct client/server boundaries                                  | VERIFIED   | `admin-request-detail.tsx` is server (no `"use client"`, takes `actions: ReactNode` slot); `approve-request-button.tsx` is client (line 1) with `useTransition` + `router.refresh`; `reject-request-modal.tsx` is client (line 1) with textarea + char counter + 10..500 gate |
| 11  | en.json + es.json have full parity for `admin.requests.list.*` and `admin.requests.detail.*`                                   | VERIFIED   | Total keys 791 on both sides; zero missing in either direction; `admin.requests.list` has 18 keys, `admin.requests.detail` has 46 keys                                  |
| 12  | `admin.placeholders.requests` namespace removed from both locales                                                              | VERIFIED   | Grep returns zero matches in `web/messages/`; programmatic key count `admin.placeholders.requests` = 0; zero references in `web/src/`                                   |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact                                                              | Expected                                                                              | Status     | Details                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260508000001_automations_setup_notes.sql`      | Idempotent ADD COLUMN setup_notes TEXT + COMMENT                                      | VERIFIED   | 19 lines; correct ALTER statement + COMMENT ON COLUMN; no other side-effects                |
| `web/src/lib/admin/types.ts`                                          | 4 type exports                                                                        | VERIFIED   | 52 lines; all 4 exports present and well-documented                                         |
| `web/src/lib/admin/request-queries.ts`                                | 3 query functions; locale-filtered translation embed; subscription array normalization | VERIFIED   | 268 lines; defensive subscription unwrap (line 239-241); FIFO/DESC ordering at line 49     |
| `web/src/app/(admin)/admin/requests/page.tsx`                         | Server component; Promise.all(rows, counts, t); coerceStatus guard                    | VERIFIED   | 108 lines; coerceStatus drops invalid querystrings to "pending" (line 20-25)                |
| `web/src/components/admin/requests/admin-requests-tabs.tsx`           | Client; 3 tabs with counters; URL sync via router.push                                | VERIFIED   | 91 lines; `role="tablist"` and `aria-selected` for a11y; isPending dims tabs                |
| `web/src/components/admin/requests/admin-requests-table.tsx`          | Server; 5 columns; status badges; empty state                                         | VERIFIED   | 159 lines; amber/green/red badge palette; date via Intl.DateTimeFormat                      |
| `web/src/lib/validations/admin-request.ts`                            | Zod schemas; trim → 10..500 pipe; UUID-shape regex                                    | VERIFIED   | 32 lines; uuid regex matches Phase 18 pattern (loose 8-4-4-4-12)                            |
| `web/src/lib/actions/admin-requests.ts`                               | approveRequest + rejectRequest with race-guard + notification fan-out                 | VERIFIED   | 344 lines; INSERT-then-UPDATE order documented in comments (line 113-119); best-effort notify swallows errors (line 91) |
| `web/src/app/(admin)/admin/requests/[id]/page.tsx`                    | Server detail page; pre-resolved translations; actions slot                           | VERIFIED   | 133 lines; `notFound()` on null detail (line 35); approve/reject actions only when pending   |
| `web/src/components/admin/requests/admin-request-detail.tsx`          | Server layout; customer card + request body + timeline + result panel                 | VERIFIED   | 349 lines; conditional rendering for approved/rejected result panels (lines 306-343)        |
| `web/src/components/admin/requests/approve-request-button.tsx`        | Client; useTransition; router.refresh                                                 | VERIFIED   | 52 lines; alerts errorStateChanged on race condition then refreshes                          |
| `web/src/components/admin/requests/reject-request-modal.tsx`          | Client; textarea + char counter + Zod-mirrored validation                             | VERIFIED   | 180 lines; mirrors REJECT_REASON_MIN/MAX from schema; trims on display; click-outside-to-close |
| `web/messages/en.json`                                                | admin.requests.list (18 keys) + admin.requests.detail (46 keys); placeholder removed  | VERIFIED   | Programmatic verification confirms exact counts and full removal of placeholder              |
| `web/messages/es.json`                                                | Spanish parity                                                                        | VERIFIED   | Same 791 total keys; zero missing in either direction                                       |

### Key Link Verification

| From                                  | To                                                                | Via                                                                              | Status     | Details                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `/admin/requests/page.tsx`            | `fetchAdminRequests` + `fetchAdminRequestStatusCounts`            | `Promise.all` in server component (lines 46-50)                                  | WIRED      | Both queries called; results passed to tabs + table                                         |
| `AdminRequestsTabs`                   | URL `?status=`                                                    | `router.push(`${pathname}?${qs}`)` in startTransition (line 53-56)               | WIRED      | Drops param on default; sets it on others; preserves other querystring keys                  |
| `AdminRequestsTable` rows             | `/admin/requests/[id]`                                            | `<Link href={`/admin/requests/${row.id}`}>` (lines 117, 141)                     | WIRED      | Both customer and customRequirements columns are clickable links                            |
| `approveRequest`                      | `automations.insert + automation_requests.update + notifications` | Three sequential supabase calls (lines 184, 205, 226 via notifyOrgMembers)       | WIRED      | INSERT-first (better fail mode); SECOND `.eq("status","pending")` guard at SQL layer        |
| `approveRequest` pre-flight check     | race-condition guard                                              | `SELECT status` then `if (req.status !== "pending") return state_changed`        | WIRED      | Lines 140-155                                                                                |
| `rejectRequest`                       | `automation_requests.update (status + notes) + notifications`     | Single update + best-effort fan-out (lines 311-336)                              | WIRED      | Same double-guard pattern (line 319)                                                        |
| `ApproveRequestButton`/`RejectModal`  | `approveRequest` / `rejectRequest`                                | Direct server-action import + `startTransition` wrap                             | WIRED      | Both use `useTransition`; both call `router.refresh` on success                             |
| Approve/Reject success                | `revalidatePath` cache invalidation                               | `revalidatePath("/admin/requests")` + detail + customer surfaces (lines 235-238, 338-340) | WIRED | Both actions revalidate admin list + detail + dashboard notifications                      |
| Detail layout                         | `actions: ReactNode` slot                                         | Server layout receives client buttons as ReactNode prop (page.tsx line 110-122)  | WIRED      | Renders `{actions}` only when `status === "pending"` (admin-request-detail.tsx line 237)    |
| `assertPlatformStaff`                 | All admin queries + actions                                       | Throws on non-ok; mutations return typed error                                   | WIRED      | 5 call sites across queries (3) + actions (2); admin layout repeats check at request entry  |

### Requirements Coverage

| Requirement | Source Plan(s)         | Description                                                                                                              | Status      | Evidence                                                                                                  |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------- |
| REQS-01     | 19-01, 19-02           | Staff sees list of automation_requests filterable by status, ordered by created_at DESC, 5 columns                       | SATISFIED   | List page renders 3 status tabs + 5-column table; ordering FIFO for pending, DESC for approved/rejected (request-queries.ts line 49) |
| REQS-02     | 19-01, 19-03           | Staff opens request detail page showing customer info, template, custom requirements, status, history, creation timestamp | SATISFIED   | `/admin/requests/[id]/page.tsx` + `admin-request-detail.tsx` render customer card + request body + timeline + result panel |
| REQS-03     | 19-03                  | Staff approves a pending request — single-step transition that flips status AND creates automation in_setup linked to template/org | SATISFIED   | `approveRequest` server action: INSERT automations(status="in_setup", template_id, organization_id, setup_notes=description) + UPDATE request status="approved" |
| REQS-04     | 19-03                  | Staff rejects a pending request — requires non-empty rejection reason; status becomes rejected; reason stored in notes    | SATISFIED   | `rejectRequest` enforces `reason 10..500 chars after trim` via Zod; UPDATE persists `notes=reason` and `status="rejected"` |
| I18N-01     | 19-02, 19-03           | All admin UI strings in en.json AND es.json with 100% parity                                                              | SATISFIED   | Programmatic parity check passes (791 leaf keys both sides); `admin.requests.list` (18 keys) + `admin.requests.detail` (46 keys) added; obsolete `admin.placeholders.requests` removed |

**Coverage:** 5/5 requirements satisfied. No orphaned requirements (REQUIREMENTS.md only assigns REQS-01..04 + I18N-01 to phase 19, all claimed by at least one plan's `requirements:` frontmatter).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |

None found. Scan covered:
- TODO/FIXME/XXX/HACK/PLACEHOLDER markers in all 12 phase files: zero matches
- `console.log` in production code: zero matches (only `console.warn`/`console.error` for legitimate diagnostic logging in server actions)
- Hardcoded UI strings: zero (all text sourced from i18n)
- Stub returns (`return null`, empty handlers): zero
- Ad-hoc Supabase calls in pages bypassing query layer: zero
- TypeScript `any` types: not present in phase files
- Hardcoded English in notification copy: 1 acceptable case — notification `title`/`message` strings are pre-rendered English in approveRequest/rejectRequest (lines 230-231, 333-334); explicitly documented in plan 19-03 as consistent with how other v1.1 notifications are shaped, with v1.3 keyed-message migration noted

### Human Verification Required

See `human_verification` block in frontmatter. Six items flagged:

1. **Approve flow end-to-end** (DB side-effects + customer notification surface)
2. **Reject modal interaction** (focus, char counter, button enable transitions)
3. **Race-condition guard** (concurrent staff sessions)
4. **Tab persistence across refresh** (URL state survival)
5. **EN/ES locale toggle** (next-intl runtime resolution)
6. **Migration applied + setup_notes populated** (column exists in local DB and approve writes to it)

These cannot be verified statically — they require a live admin session, browser interaction, and a real Supabase instance with the migration applied.

### Gaps Summary

No gaps. All 12 must-haves verified, all 5 requirements satisfied, key links wired end-to-end, no anti-patterns. The phase achieves its stated goal: "List + detail + single-step approve (creates automation) + reject-with-reason." Build-time TypeScript compile passes (`npx tsc --noEmit -p web/tsconfig.json` exits 0 with no output).

The status is **human_needed** rather than **passed** because the Phase 19 surface is a write-heavy admin flow whose correctness depends on:
- Real DB writes (automations + automation_requests + notifications)
- Cross-tab race conditions
- Cross-route revalidation (admin → customer)
- Locale toggle behavior

These are observational tests that static analysis cannot replace. Once a human runs through the six items above (estimated 10 minutes), the phase is fully verified.

---

_Verified: 2026-05-07_
_Verifier: Claude (gsd-verifier)_
