# Phase 19: Requests Inbox - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Operations team can attend and triage incoming customer `automation_requests` from `/admin/requests`. Includes: list with status tabs (pending/approved/rejected) + filters, detail page with status history, single-click approve (provisions a new automation atomically with notification to customer), reject with mandatory reason (notifies customer with the reason). Out of scope: editing requests, internal staff-only notes, comments/conversation thread, reopening rejected requests, bulk operations.

</domain>

<decisions>
## Implementation Decisions

### List view
- **Tabs by status** with counters: `Pending (N) | Approved (N) | Rejected (N)`. Default tab on load is **Pending** because that's where the actionable work is.
- **Intermediate column set** (5 cols): Customer (org name), Template, Status, Custom requirements (preview, ~80 chars truncated), Created date.
- **Default ordering**:
  - Pending tab → `created_at ASC` (FIFO — oldest waiting first, fairness for customers)
  - Approved + Rejected tabs → `created_at DESC` (most recent first, archive view)
- **No "new/unread" indicator**. The Pending FIFO ordering already surfaces what needs attention. Tracking `viewed_at` would require a migration, single-operator semantics (race condition on multi-staff), and adds noise without clear value at v1.2 scale.

### Request detail page
- **Customer info shown (full)**: org name, requesting user (full name + email), org plan/subscription tier, signup date, count of currently active automations, link to `/admin/clients/[org_id]` (the link is rendered but may resolve 404 until Phase 21 ships — that's accepted).
- **Status history = simple timeline** (max 2-3 events): `Created by {user}` (timestamp) → `Approved by {staff}` OR `Rejected by {staff}` (timestamp). No edit history, no comment threads.
- **No internal-notes editor**. Rejection-reason is the only freeform text staff writes. General internal notes belong to Phase 21 (Clients Admin) per its goal.
- **Result links from terminal states**:
  - Approved → link to the resulting automation at `/admin/automations/[id]` (Phase 20 will make this live; for now link is rendered but may 404).
  - Rejected → just displays the persisted rejection reason inline.

### Approve flow
- **Single-click direct approve**, no confirmation modal. Approve is the expected action; modal adds friction. Mistakes are recoverable via Phase 20 (archive the bad automation).
- **Data copied to the new `automations` row on approve**:
  - `template_id` (from request)
  - `organization_id` (from request)
  - `status` = `'in_setup'`
  - `name` defaulted to `"{Template name} for {Org name}"` so the automation is usable immediately
  - `setup_notes` (or equivalent freeform field) populated from the request's `custom_requirements` text so context isn't lost if the request is later updated/archived
  - `created_at` = now
- **Notify customer automatically** on approve. Insert a `notifications` row of type `success` for each `organization_member` of the requesting org with message like "Tu solicitud de {Template} fue aprobada y está en configuración". Insert happens in the same logical operation as the approve (best-effort transactional via supabase JS client; fall back to logged warning if notification insert fails — approve still succeeds).
- **Race condition on stale state**: server enforces strict status check. If the request is no longer `pending` (because another staff already processed it), the action returns a typed error and the page reloads showing the current state. No optimistic update — approve creates a real `automations` row, side effects must be deterministic.

### Reject flow
- **Modal UI** to capture the rejection reason (matches the deactivate-modal pattern from Phase 18 for consistency).
- **Reason validation**: minimum 10 characters after trim. Empty / "x" / "no" rejected by Zod with a localized error. Max length 500 (UX cap, no DB constraint needed beyond TEXT).
- **Notify customer with the reason**. Notification type `warning`, message includes the rejection reason verbatim ("Tu solicitud de {Template} fue rechazada: {reason}"). Staff knows the reason will reach the customer when they write it — they can phrase accordingly.
- **No un-reject**. Rejected is a terminal state. To revisit, the customer creates a new request. Final states must not be UI-reversible to keep audit clean.

### Claude's Discretion
- Modal styling (matches existing deactivate-modal from Phase 18)
- Status timeline visual (vertical line with dots is fine, or simple bullet list)
- Loading/saving spinner placement during approve/reject
- Color of pending/approved/rejected status badges (suggest green/blue/red but flexible)
- Empty-state copy when a tab has zero requests
- Whether the customer info card uses `/admin/clients/[org]` as a hyperlink or just displays the data inline (link is fine — dead link is acceptable until Phase 21 ships)
- The exact field name on `automations` to store custom requirements (could be a new `setup_notes` column added in this phase's migration, or repurpose an existing one — planner decides)

</decisions>

<specifics>
## Specific Ideas

- The approve flow's atomic feel matters. The user expects a single click → automation appears in `/admin/automations`. The notification insert is best-effort; if it fails we log and continue (don't block approve on notification).
- Customer-facing notifications must use the i18n-template pattern (existing `notifications.created_at` + structured message), not hardcoded English strings. The notification message can be stored as a key + params and resolved at render time, OR as plain pre-rendered text in the customer's locale at the moment of approval. Planner chooses based on what the existing notification system supports.
- The reject-with-reason modal should match the visual language of the deactivate-template modal from Phase 18 (Cancel + destructive-red action button) so admin UI feels consistent.
- The 10-char minimum on rejection reason is intentional friction — forces a coherent short phrase but doesn't block legitimate short reasons like "Falta info" or "Duplicado".

</specifics>

<deferred>
## Deferred Ideas

- **Comments/conversation thread on requests** — useful for back-and-forth before approving but big scope creep; out of scope.
- **Internal staff-only notes** on requests — belongs in Phase 21 (Clients Admin) where the broader internal-notes capability lives.
- **Request edit / amend by customer after submission** — needs design on what's editable; not in v1.2.
- **Reopen / un-reject** — explicitly rejected; revisit only if Operations actually demands it.
- **Bulk approve/reject** — not justified at current request volume.
- **Email notification to customer in addition to in-app notification** — eventually yes (use Resend), but not in this phase. The in-app notification is sufficient signal for v1.2.
- **"Viewed by staff" tracking** — explicitly rejected for v1.2.
- **SLA timer / deadline on pending requests** — could be useful operationally; deferred until volume justifies it.

</deferred>

---

*Phase: 19-requests-inbox*
*Context gathered: 2026-05-07*
