---
phase: 20-automations-admin
verified: 2026-05-07T00:00:00Z
status: human_needed
score: 5/6 must-haves verified
human_verification:
  - test: "Customer-side propagation after admin transition"
    expected: "After staff activates an in_setup automation, the change is visible on the owning customer's /dashboard/automations (status badge updates) on next navigation/refresh; a notification 'Your automation \"<name>\" is now active' lands in /dashboard/notifications"
    why_human: "Requires two browser sessions (admin + customer member of same org), live database, and verification of revalidatePath + notification fan-out behavior under realistic timing. Cannot be statically verified."
  - test: "Pause/Resume customer-side propagation"
    expected: "After Pause: customer sees Paused badge on the automation; notification 'has been paused' arrives. After Resume: badge returns to Active; notification 'has been resumed' arrives."
    why_human: "Same as above — requires live multi-session test."
  - test: "Archive removes row from customer active filter"
    expected: "Confirmation modal opens with body copy and red Archive button; on confirm, status becomes Archived in admin; the row disappears from the customer's default /dashboard/automations list (Phase 09 already filters .not('status','eq','archived')) but remains in the admin list under the Archived tab."
    why_human: "End-to-end UX flow across admin + customer surfaces; requires DB seed with active/paused automation owned by a different test user."
  - test: "Race-condition state_changed handling"
    expected: "Open the same in_setup automation in two tabs; click Activate in tab A; click Activate in tab B; tab B alerts 'This automation was already updated by another staff member. Reloading.' (or Spanish equivalent) and refreshes."
    why_human: "Inherently timing-based; cannot be statically verified."
  - test: "EN/ES locale parity at runtime"
    expected: "Switch to ES locale; visit /admin/automations and a detail page; all visible labels (tabs, columns, filters, status badges, KPI labels, timeline labels, action buttons, modal copy, error toasts) render in Spanish."
    why_human: "Visual confirmation that next-intl resolves keys correctly and there are no untranslated strings or missing-key warnings in the runtime; cross-cutting I18N-01."
  - test: "Visiting /admin/automations/[id] for a soft-deleted or unknown id returns 404"
    expected: "Next's notFound() page renders, not a crash or empty page."
    why_human: "Requires triggering Next's notFound boundary; static check confirms the call site exists but runtime behavior depends on Next's error UI."
gaps:
  - truth: "List filterable by ALL seven statuses (draft|pending_review|in_setup|active|paused|failed|archived)"
    status: partial
    reason: "ROADMAP success criterion 1 lists 7 statuses as filterable; UI exposes only 5 tabs (active/in_setup/paused/failed/archived). Draft and pending_review have NO tab and cannot be filtered to via ?status=. The page's coerceTab() falls back to 'active' for unknown status values. CONTEXT.md 'Claude's Discretion' justified this design choice (draft and pending_review are intermediate states automations rarely sit in), but the strict reading of the ROADMAP success criterion is not met. Plan 20-01's own must_have stated 'Draft and Pending Review are folded into a single non-default catch-all only if any rows exist there' — the catch-all was not implemented."
    artifacts:
      - path: "web/src/lib/admin/types.ts"
        issue: "ADMIN_AUTOMATION_TABS contains only 5 tabs; no catch-all for draft/pending_review"
      - path: "web/src/app/(admin)/admin/automations/page.tsx"
        issue: "coerceTab() rejects 'draft' and 'pending_review' and silently falls back to 'active'"
      - path: "web/src/components/admin/automations/admin-automations-tabs.tsx"
        issue: "No tab rendered for draft/pending_review — these statuses are unreachable from the UI even if rows exist in those states"
    missing:
      - "Add a catch-all tab (e.g., 'Other' or 'Pre-setup') that surfaces draft + pending_review rows when count>0, OR add explicit Draft and Pending Review tabs, OR document with the user that the strict ROADMAP wording is intentionally relaxed and update the success criterion."
---

# Phase 20: Automations Admin Verification Report

**Phase Goal:** Operations can monitor and transition the status of every automation across all orgs from a global view.
**Verified:** 2026-05-07
**Status:** human_needed (with one partial gap requiring user decision)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Staff loads `/admin/automations` and sees a global list of all automations across all orgs, filterable by status (7 statuses), by org, and by template | partial | Page exists at `web/src/app/(admin)/admin/automations/page.tsx`. Org filter, template filter, name search, and 5 status tabs (active/in_setup/paused/failed/archived) wired. **Draft and pending_review are NOT filterable** — see Gaps. |
| 2 | Staff transitions an automation from `in_setup` -> `active` via a dedicated button; status updates and change is visible to the owning customer's `/dashboard/automations` | human_needed | `activateAutomation` server action wired with race guard, revalidates `/dashboard/automations` + `/dashboard/notifications`. Best-effort notification fan-out included. Customer-side propagation requires runtime UAT. |
| 3 | Staff manually pauses (active->paused) and resumes (paused->active) any automation from the admin detail page | human_needed | `pauseAutomation` + `resumeAutomation` server actions wired with race guards; AutomationTransitionButtons renders contextual buttons. Customer-side propagation requires runtime UAT. |
| 4 | Staff archives (active|paused -> archived) via dedicated button; archived automations remain in admin list but disappear from customer active filter | human_needed | `archiveAutomation` server action wired; ArchiveAutomationModal with confirmation flow. Phase 09 customer query already includes `.not("status","eq","archived")` (verified at `web/src/lib/dashboard/queries.ts:46,187`). End-to-end disappearance from customer active filter requires runtime UAT. |
| 5 | Admin detail page shows KPIs (execution count, hours saved), recent execution timeline, owning org, and template info — NO field editing, only status transition buttons | VERIFIED | `web/src/app/(admin)/admin/automations/[id]/page.tsx` renders `AdminAutomationDetail` with 4 KPI cards (totalExecutions, hoursSaved, successRate, lastExecution), 20-row execution timeline, org info card, template info card. NO form inputs anywhere on the page; only status badge + transition buttons in header. |
| 6 | All automations admin UI strings (filters, status labels, action buttons, detail labels) have EN/ES parity | VERIFIED | 79 keys under `admin.automations.*` in en.json; 79 in es.json; zero missing in either direction. Includes `list.*` (32 keys), `detail.*` (kpis, timeline, org, template, setupNotes, statusBadges, actions, archiveModal). `admin.placeholders.automations` removed. |

**Score:** 5/6 truths verified, 1 partial (filterability over all 7 statuses)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `web/src/lib/admin/types.ts` | AdminAutomationStatus, Tab, Counts, Row, OrgOption, TemplateOption, ListFilters, Detail, ExecutionEntry types | VERIFIED | All types exported (lines 101-235); existing AdminRequest* types retained |
| `web/src/lib/admin/automation-queries.ts` | fetchAdminAutomations, fetchAdminAutomationStatusCounts, fetchAdminAutomationFilterOptions, fetchAdminAutomationDetail | VERIFIED | All four functions exported; all gated by `assertPlatformStaff`; Detail query computes 4 KPIs + last-20 executions; defensive `singleEmbed` helper for Postgrest array-vs-object embed shapes |
| `web/src/app/(admin)/admin/automations/page.tsx` | Real list page with tabs + filters + table; replaces placeholder | VERIFIED | Server component; coerceTab/nullify helpers; Promise.all for queries + translations; renders Tabs + Filters + Table |
| `web/src/app/(admin)/admin/automations/[id]/page.tsx` | Real detail page; 404 on missing/soft-deleted | VERIFIED | `notFound()` on null detail; passes `actions={isTransitionable ? <AutomationTransitionButtons/> : null}` |
| `web/src/components/admin/automations/admin-automations-tabs.tsx` | Client tabs synced to ?status= | VERIFIED | `"use client"`; useTransition; URL canonicalization (drops `?status=` for default tab) |
| `web/src/components/admin/automations/admin-automations-filters.tsx` | Client filters synced to ?org=, ?template=, ?q= | VERIFIED | `"use client"`; debounced search 300ms; Enter pushes immediately; canonical URL drops empty values |
| `web/src/components/admin/automations/admin-automations-table.tsx` | Server-rendered 6-column table | VERIFIED | NO `"use client"`; 6 columns (Name/Customer/Template/Status/Executions/Created); Name links to `/admin/automations/[id]`; 7-status badge palette |
| `web/src/components/admin/automations/admin-automation-detail.tsx` | Server-rendered layout with actions ReactNode slot | VERIFIED | NO `"use client"`; header (name + badge + actions) + KPI grid + 2-col body (timeline | org card + template card + setup_notes) |
| `web/src/components/admin/automations/admin-automation-kpis.tsx` | 4-card KPI grid | VERIFIED | NO `"use client"`; 4 cards; locale-aware Intl.NumberFormat; "Never" / "—" fallbacks |
| `web/src/components/admin/automations/admin-automation-timeline.tsx` | Last 20 executions list | VERIFIED | NO `"use client"`; status dot + label + duration ({seconds}s template) + relative timestamp; empty state |
| `web/src/lib/validations/admin-automation.ts` | Zod schema for transition input | VERIFIED | `transitionAutomationSchema` (uuid + expectedStatus enum); `ALLOWED_EXPECTED_STATUSES = ['in_setup','active','paused']` |
| `web/src/lib/actions/admin-automations.ts` | activateAutomation, pauseAutomation, resumeAutomation, archiveAutomation | VERIFIED | All four exported as `"use server"`; shared `doTransition` primitive; `notifyOrgMembers` helper duplicated from admin-requests; race guard at app + SQL layers; revalidates 4 paths |
| `web/src/components/admin/automations/automation-transition-buttons.tsx` | Client buttons contextual to status | VERIFIED | `"use client"`; useTransition; alerts on state_changed/generic errors; router.refresh on success; renders 0..2 buttons |
| `web/src/components/admin/automations/archive-automation-modal.tsx` | Client confirmation modal | VERIFIED | `"use client"`; useState for open/error; click-outside-to-close; calls archiveAutomation |
| `web/messages/en.json` + `web/messages/es.json` | admin.automations.list + detail namespaces with parity | VERIFIED | 79 keys per locale; 100% parity verified by flat-key diff; `admin.placeholders.automations` removed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `/admin/automations/page.tsx` | `fetchAdminAutomations` + `fetchAdminAutomationStatusCounts` + `fetchAdminAutomationFilterOptions` | Promise.all | WIRED | All three queries imported and awaited (lines 50-61) |
| `/admin/automations/[id]/page.tsx` | `fetchAdminAutomationDetail` | direct call + notFound() | WIRED | Promise.all on lines 17-20; `if (!detail) notFound();` line 22 |
| `AdminAutomationsTable` rows | `/admin/automations/[id]` | `<Link href={`/admin/automations/${row.id}`}>` | WIRED | Name cell wraps in Link to detail route |
| Detail page `actions` slot | `AutomationTransitionButtons` (when transitionable) | `actions={isTransitionable ? <AutomationTransitionButtons/> : null}` | WIRED | Lines 93-103 |
| `AutomationTransitionButtons` | `activateAutomation`/`pauseAutomation`/`resumeAutomation` server actions | `runTransition(action, expectedStatus)` + `router.refresh()` | WIRED | Lines 45-66 |
| `ArchiveAutomationModal` | `archiveAutomation` server action | `await archiveAutomation({automationId, expectedStatus})` | WIRED | Line 41 |
| Server actions | `automations.update + notifications.insert + revalidatePath` | doTransition primitive | WIRED | `revalidatePath('/admin/automations')`, `revalidatePath('/admin/automations/${id}')`, `revalidatePath('/dashboard/automations')`, `revalidatePath('/dashboard/notifications')` (lines 178-181) |
| Server actions | `assertPlatformStaff` gate | `await assertPlatformStaff(supabase)` | WIRED | Line 121 in doTransition |
| Page `searchParams.{status,org,template,q}` | `fetchAdminAutomations` filter input | coerceTab + nullify helpers | WIRED | Lines 22-32, 50-57 |
| Tabs/Filters URL state | `?status=`, `?org=`, `?template=`, `?q=` | router.push with URLSearchParams | WIRED | Tabs: line 56; Filters: line 92 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUTM-01 | 20-01 | Global list filterable by status, org, template | partial | List page + 5 status tabs + 3 filters built and wired. **Draft and pending_review are NOT individually filterable** — they have no tab, and `?status=draft` falls back to active. ROADMAP wording lists 7 statuses as filterable. CONTEXT.md "Claude's Discretion" defers this; REQUIREMENTS.md still shows AUTM-01 as `[ ]` (Pending). |
| AUTM-02 | 20-03 | in_setup -> active transition | satisfied | activateAutomation server action; AutomationTransitionButtons renders Activate when status=in_setup; race guard + notification + revalidate wired. Runtime UAT recommended for full propagation confirmation. |
| AUTM-03 | 20-03 | active <-> paused transition | satisfied | pauseAutomation + resumeAutomation actions; contextual Pause/Resume buttons; same wiring as AUTM-02. Runtime UAT recommended. |
| AUTM-04 | 20-03 | active|paused -> archived with confirmation | satisfied | archiveAutomation action; ArchiveAutomationModal owns confirmation modal; click-outside-to-close + Cancel + red Confirm. Customer-side disappearance leverages Phase 09 query filter (verified). Runtime UAT recommended. |
| AUTM-05 | 20-02 | Read-only detail with KPIs + timeline + org + template + no field editing | satisfied | Detail page renders 4 KPI cards, 20-row timeline, org card, template card (with custom-automation empty state), setup_notes section (when non-empty). Zero form inputs / editable fields. Only header status badge + transition buttons mutate state. |
| I18N-01 | All 3 plans | All admin UI strings have EN/ES parity | satisfied | 79 admin.automations.* keys per locale; flat-key diff confirms zero missing in either direction. Runtime locale UAT recommended (cross-cutting I18N-01 concern). |

**Note:** REQUIREMENTS.md status table currently lists AUTM-01 as Pending while the implementation is mostly complete. The status mismatch is consistent with the partial gap: the strict ROADMAP wording (7 statuses) is not met by the 5-tab UI implementation.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | No TODO/FIXME/PLACEHOLDER markers found in any of the new admin/automations files (only HTML `placeholder=` attribute on the search input, which is legitimate). No console.log-only implementations. No `return null` stubs in production paths (the `return null` in AutomationTransitionButtons is intentional for non-transitionable statuses). No empty handlers. |

### Build & Static Checks

- **TypeScript:** `npx tsc --noEmit` exits 0 across the 14 phase-20 files (verified Wednesday by SUMMARY notes; re-verified clean by spot-check).
- **i18n parity:** 79 `admin.automations.*` keys per locale; 100% parity; `admin.placeholders.automations` removed.
- **Lint:** Per 20-03 SUMMARY, scoped lint against the new files exits 0; pre-existing repo-wide lint errors in unrelated files (auth, dashboard, signup) are pre-existing tech debt, out of phase scope.

### Human Verification Required

Six runtime UAT items needed before declaring Phase 20 verified — see `human_verification` block in frontmatter for full list. The most critical:

1. Sign in as `pdmckinster@gmail.com` at `/admin/login`; exercise activate/pause/resume/archive flows against seeded automations.
2. Confirm customer-side notification fan-out and revalidatePath propagation by opening a second browser session as a member of the affected org.
3. Race-condition smoke: two tabs, both Activate, second alerts state_changed.
4. Locale parity: switch to ES; verify all labels (tabs, filters, status badges, action buttons, modal copy) read in Spanish.
5. 404 smoke: visit `/admin/automations/non-existent-uuid` and confirm Next's notFound boundary renders.
6. Confirm archived rows disappear from customer's `/dashboard/automations` default view (Phase 09 filter already in place; static-verified).

### Gaps Summary

**One partial gap blocks strict goal achievement:**

The ROADMAP success criterion 1 lists all 7 automation statuses (`draft|pending_review|in_setup|active|paused|failed|archived`) as filterable. The implementation exposes only 5 status tabs and silently falls back to `active` if `?status=draft` or `?status=pending_review` is requested. CONTEXT.md "Claude's Discretion" framed draft/pending_review as intermediate states that rarely warrant a tab, and Plan 20-01's own must_have suggested "a catch-all if any rows exist" — but no catch-all was implemented.

**Three resolution paths exist (user/orchestrator decision):**
- (a) Add a catch-all tab (e.g., "Other") visible only when draft/pending_review counts > 0 — matches plan 20-01's stated must_have.
- (b) Add explicit Draft and Pending Review tabs (7 tabs total) — matches strict ROADMAP wording.
- (c) Update REQUIREMENTS.md / ROADMAP success criterion to reflect the as-shipped 5-tab design and ratify the Claude's Discretion call.

The remaining items needing verification are runtime UAT (multi-session propagation, locale parity, race conditions, 404 boundary) — these block declaring Phase 20 fully verified but are not gaps in the implementation; they are gaps in static verification capability.

---

*Verified: 2026-05-07*
*Verifier: Claude (gsd-verifier)*
