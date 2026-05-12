# Phase 22: Admin Home - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the `/admin` landing page that staff sees when they enter the admin console. The page surfaces three sections in this order:

1. **4 KPI cards** with live counts (pending requests, in-setup automations, total active clients, signups this week)
2. **2 quick-link cards** to the most-used operational surfaces (Requests inbox, Automations in setup)
3. **Activity feed** of the last 15-20 system events (request created, automation activated, new signup)

Consumes data from Phases 18-21 (catalog, requests, automations, clients) — does NOT introduce new schema. The customer dashboard home (`/dashboard`) is unrelated and out of scope.

</domain>

<decisions>
## Implementation Decisions

### KPI cards (HOME-01)
- Layout: **grid 2x2** (two rows of two cards). Same pattern as customer dashboard. Stacks on mobile.
- Content per card: **only number + label** (icon + label + big number). Minimalist, no trend, no sparkline.
- Color: **neutral always** (white/dark depending on theme). No "urgency colors" (no red badges for high pending counts) — avoid alarm fatigue.
- Clickable: **yes, each card navigates to its filtered list**:
  - Pending requests → `/admin/requests?status=pending`
  - In-setup automations → `/admin/automations?status=in_setup`
  - Active clients → `/admin/clients`
  - Signups this week → `/admin/clients?sort=created_desc` (or equivalent — planner decides exact param)

### Activity feed (HOME-02)
- Event types included: **3 only**
  1. `request_created` — customer submitted a new automation request
  2. `automation_activated` — automation transitioned to `status=active`
  3. `new_signup` — new organization created an account
- Event types **NOT** included (deferred): generic status transitions (approved/rejected/paused/archived). Avoid noise; focus on the 3 highest-signal events.
- Row format: **icon + text + relative timestamp** (e.g. `📥 Carol Chen creó "Emergency Alert" · hace 3 min`). Icon indicates event type. Relative timestamp ("hace 3 min", "hace 2 h", "ayer").
- Organization: **flat chronological list** (most recent first). No day grouping headers.
- Limit: **15-20 events** (planner picks exact number; lean toward 20).
- Clickable rows: **yes, each navigates to the underlying entity**:
  - request_created → `/admin/requests/[id]`
  - automation_activated → `/admin/automations/[id]`
  - new_signup → `/admin/clients/[id]`

### Quick-link cards (HOME-03)
- Count and identity: **exactly 2** — Requests inbox and Automations in setup. No Clients/Catalog cards (sidebar already has them; diluting the focus weakens the "act here now" signal).
- Visual treatment: **larger/more prominent than KPI cards** — wide banner-style with large icon + descriptive text + implicit CTA (chevron →). Clear "this is where you go to work."
- Badges: **yes, prominent number badge** on each card (e.g. "Solicitudes pendientes (5)" or orange badge with number). The number is the urgency signal that justifies the shortcut.
- Position: **between KPIs and feed**. Top-down flow: KPIs (what exists) → Quick-links (where I act) → Feed (what happened).

### Refresh strategy
- Data freshness: **SSR snapshot on each page load**. No cache, no realtime subscriptions, no auto-refresh interval.
- Each visit to `/admin` runs fresh queries server-side. Cost is negligible (admin traffic is low).
- Manual refresh button: **no**. Browser F5 or re-clicking `/admin` in sidebar refreshes.
- Visual treatment of "new" events: **static**. No animations or highlight-fade for recent events. Consistent with the rest of the admin (functional, not flashy).

### i18n (I18N-01 contribution)
- All labels, card titles, badges, event text templates, and relative-time strings must exist in both `en.json` and `es.json`.
- Spanish convention: accent-free (matches existing admin namespaces: "Solicitudes pendientes", "Miembros", "Pagina X de Y").
- Relative time templates: needs translatable strings like `hace {n} min`, `hace {n} h`, `ayer`. Planner decides the exact key shape (could use `next-intl` plural/duration helpers or a hand-rolled formatter).

### Claude's Discretion
- Exact icon choice per event type (lucide-react names)
- Exact card spacing, shadow depth, and typography scale (follow existing admin patterns from Phase 21 detail page)
- Empty state copy and visuals when there are 0 KPIs / 0 events / 0 pending requests
- Loading state (skeleton vs spinner vs nothing — `<Suspense>` patterns)
- Whether event text in the feed shows the org name, the user name, or both (researcher should check what data is available cheaply)
- Whether `signups this week` means rolling 7-day window or current calendar week (Mon-Sun); planner decides based on what's simpler.

</decisions>

<specifics>
## Specific Ideas

- Visual consistency with Phase 21 detail page header (5-cell stat grid in `/admin/clients/[id]`) — same neutral tone, same typography.
- Quick-link cards should feel like the "primary actions" of the page — visually weightier than KPIs.
- Activity feed iconography: think `lucide-react` icons (`Inbox`, `Zap`, `UserPlus`) — keep it consistent with the sidebar nav vocabulary.

</specifics>

<deferred>
## Deferred Ideas

- **Realtime live updates** — Considered and rejected for v1.0. Admin traffic is low; SSR snapshot is sufficient. Revisit if/when ops staff complains about staleness. Would belong in a future "Admin Polish" milestone.
- **Status-transition events in the feed** — Approved/rejected/paused/archived events were excluded to keep the feed signal-dense. Could be added later via a "All events" toggle.
- **Card color urgency** — Red-when-backlog-high pattern was rejected to avoid alarm fatigue. Could be revisited with a configurable threshold per staff user.
- **Sparkline/trend on KPI cards** — Rejected for v1.0 simplicity. Belongs in a future "Admin Analytics" phase if reporting becomes a real need.
- **Manual refresh button + auto-refresh interval** — Rejected; F5/re-click pattern is sufficient. Reconsider if staff sessions become long-lived dashboards.
- **Activity feed grouping by day** — Rejected; flat list is fine at 15-20 events. Re-evaluate when volume grows.

</deferred>

---

*Phase: 22-admin-home*
*Context gathered: 2026-05-12*
