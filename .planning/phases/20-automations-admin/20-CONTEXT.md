# Phase 20: Automations Admin - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Operations get a global, cross-org view of every `automation` at `/admin/automations`. They can filter and triage from a list, open a read-only detail with KPIs and execution timeline, and transition status (`in_setup → active`, `active ⇄ paused`, `active|paused → archived`). No field editing — only status transitions. Customer-side automation creation, editing, and execution remain out of scope (already shipped in v1.1).

</domain>

<decisions>
## Implementation Decisions

### List page (`/admin/automations`)
- **Layout:** Status tabs + table — same pattern as Phase 19 Requests Inbox. Tabs: `Active`, `In Setup`, `Paused`, `Failed`, `Archived` (and possibly `Draft`/`Pending Review` if rows can land there). Each tab shows a counter.
- **Columns (in order):** Name, Customer (org), Template, Status, Executions count, Created date.
- **Filters (in addition to tabs):** Org dropdown, Template dropdown, name search box. All three combine with the active tab.
- **Default order:** `created_at DESC` (most recent first), consistent with Requests Inbox non-pending tabs.
- **URL state:** Active tab and filters URL-synced (same convention as Phase 19) so links/refresh preserve state.

### Detail page (`/admin/automations/[id]`)
- **Layout:** Header (name + status badge + transition action buttons) → KPI grid → 2-column body (left: execution timeline; right: org info card + template info card + setup_notes if present).
- **KPIs (4 cards):** Total executions, Hours saved, Success rate, Last execution (relative timestamp).
- **Timeline:** Last 20 executions as a list. Each row: status icon (success/fail), relative timestamp, execution duration. Compact, no pagination in this phase.
- **Org info card:** Org name + slug + link to `/admin/clients/[id]` (Phase 21 — link will be live once Phase 21 ships; until then the route renders 404 or placeholder, which is acceptable).
- **Template info card:** Template name + category + price (read-only).
- **No field editing** — only the status transition buttons change state.

### Status transitions
- **Buttons are contextual:** Only valid transitions for the current status are rendered.
  - `in_setup` → `Activate` button
  - `active` → `Pause`, `Archive` buttons
  - `paused` → `Resume`, `Archive` buttons
  - `archived` → no transition buttons (terminal)
  - `draft`, `pending_review`, `failed` → no admin transitions in this phase (out of scope; failed handling is operations-investigation, not a UI button)
- **Confirmation modal:** Only `Archive` (irreversible) opens a confirmation modal. Activate/Pause/Resume execute on direct click — they're reversible.
- **Server action pattern:** One server action per transition (`activateAutomation`, `pauseAutomation`, `resumeAutomation`, `archiveAutomation`), each gated by `assertPlatformStaff`.
- **Race-condition guard:** Same pattern as Phase 19 — server action receives the `expected_status` from the client, verifies before updating, returns `state_changed` error if the row moved. UI handles `state_changed` with `router.refresh()` and a toast. (Inherits the Phase 19 tech-debt note: race-condition toast may be visually swallowed by the refresh — acceptable to ship with the same behavior, polish ticket already tracked.)

### Side effects on transition
- **Notification fan-out:** Every successful transition emits a notification to the org owner (best-effort). If the notification insert fails, the transition still succeeds — same posture as Phase 19 approve/reject.
- **Notification copy (per transition, EN/ES via i18n):**
  - `in_setup → active`: `success` type — "Your automation '{name}' is now active"
  - `active → paused`: `info` type — "Your automation '{name}' has been paused"
  - `paused → active`: `success` type — "Your automation '{name}' has been resumed"
  - `* → archived`: `info` type — "Your automation '{name}' has been archived"
- **No customer-side action required** — these are operational notifications, not action_required type.

### Customer-side visibility (`/dashboard/automations`)
- **Archived:** Filtered out of the default customer view. A separate `Archived` tab/filter on the customer surface lets them inspect history. (May require a small adjustment to Phase 09's filter logic — check during planning.)
- **Paused:** Visible in the customer's active list with a `Paused` status badge. No customer action — only admin can resume.
- **Realtime propagation:** Status changes propagate via Supabase Realtime to the customer's `/dashboard/automations` and detail page. If the customer has the page open, the status badge updates without refresh. Same realtime pattern Phase 19 already validated for notifications/state changes.

### i18n
- New namespace `admin.automations.list.*` for tabs, columns, filters, search placeholder, empty states.
- New namespace `admin.automations.detail.*` for KPI labels, timeline labels, org/template card labels, transition button labels, confirmation modal copy.
- Notification copy keys live under existing notifications namespace with new entries per transition.
- All keys present in both `en.json` and `es.json`.

### Claude's Discretion
- Exact tab order beyond the listed status set (e.g., whether `Draft` and `Pending Review` get their own tabs or are folded into a catch-all)
- Empty-state illustrations and exact copy (researcher/planner can model on Phase 19)
- Whether `Last execution` KPI shows "Never" vs "—" when there are no executions yet
- Exact relative-time format for KPI and timeline (model on existing dashboard helpers)
- Pagination of the list table — start without and add only if a tab grows past a usable threshold
- Whether to render `setup_notes` (the column added in Phase 19) inline in the detail or as a collapsible section
- Visual/behavioral details of the confirmation modal (uses existing modal primitives)
- Loading and error states styling

</decisions>

<specifics>
## Specific Ideas

- Reuse the **Phase 19 Requests Inbox** patterns end-to-end: status-tabs-with-counters, URL-synced state, FIFO/DESC ordering, race-condition handling, notification fan-out as best-effort, EN/ES i18n parity.
- The customer-side surface should feel **passive** — admin pauses/resumes/archives, customer sees the result. No new customer-side controls in this phase.
- Cross-link to `/admin/clients/[id]` even though Phase 21 hasn't shipped — keeps the link in place when Phase 21 lands.

</specifics>

<deferred>
## Deferred Ideas

- **Customer-controlled pause/resume** — would let customers pause their own automations. New capability, customer-facing surface; belongs in a future v1.x phase if requested.
- **Audit trail of transitions** (who flipped status, when, from what to what) — useful for compliance/debugging, but no requirement in this phase. Note for backlog.
- **Failed-status investigation tooling** (drilldown into why an execution failed, retry from admin) — operational depth beyond this phase. Backlog.
- **Bulk status transitions** (select multiple automations, apply same action) — efficiency feature, not in scope.
- **Race-condition toast persistence polish** — already tracked as Phase 19 tech debt; will inherit same UX in Phase 20 and be fixed alongside it.

</deferred>

---

*Phase: 20-automations-admin*
*Context gathered: 2026-05-07*
