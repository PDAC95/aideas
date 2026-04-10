# Phase 8: Dashboard Home & Notifications - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Users land on a personalized dashboard that shows their automation health at a glance (KPI cards, automation list, activity feed) and can access their notifications via a bell icon with dropdown. This is the first screen after login. All data comes from Phase 7 seed/real data.

Out of scope: automation detail views (Phase 9), catalog browsing (Phase 10), reports (Phase 11), settings (Phase 12).

</domain>

<decisions>
## Implementation Decisions

### Greeting & Header
- Personalized greeting based on time of day: "Buenos dias, Patrick" / "Buenas tardes" / "Buenas noches" — changes based on user's local time
- "+ Nueva automatizacion" CTA button in TWO places: next to the greeting in the header AND at the bottom of the automation list
- Greeting area includes subtitle/context line below the name

### KPI Cards
- 3 KPI cards: active automations, tasks this week, hours saved this month
- Each card is clickeable — navigates to the relevant section (Automations, Reports)
- Visual style (number formatting, icons, trends/sparklines) at Claude's discretion

### Automation List (compact)
- Each row shows: name, status badge, connected app icons, and daily metric
- Section header "Mis automatizaciones" with "Ver todas →" link to My Automations (Phase 9)
- "+ Nueva automatizacion" CTA at the bottom of the list (in addition to header)
- Whether rows are clickeable to automation detail: Claude's discretion

### Activity Feed
- Last 10-15 execution events
- Errors shown with badge style ("Error" badge next to name — not background color)
- Section header with "Ver actividad completa →" link to Reports (Phase 11)
- Visual format (timeline vs list), metric detail per event, and which execution states to show: Claude's discretion based on seed data structure

### Notification Bell & Dropdown
- Bell icon in the top-right header/topbar area, next to user avatar
- Unread count badge on the bell icon
- Click opens a dropdown/popover panel (not sidebar/drawer)
- Each notification has an icon specific to its type (activation, error, request approved, etc.)
- Unread notifications marked with a blue dot (iOS/Slack style)
- Last 20 notifications shown
- "Marcar todas como leidas" action in the dropdown
- Notification content: icon by type, title, message, relative timestamp

### Page Layout
- 2-column layout below the KPI cards: automation list on the LEFT, activity feed on the RIGHT
- Full width at top: greeting/header row, then KPI cards row
- On mobile: collapses to single column stack (KPIs stacked, then automations, then feed)

### Visual Tone & Theming
- Modern and colorful style — colored card icons, subtle gradients, vibrant accents (reference: Stripe Dashboard, Plausible)
- Light AND Dark mode supported from the start
- Responsive breakpoints: 2-column on desktop, stack on mobile

### i18n
- All new UI text must have EN/ES translation keys (requirement I18N-01)

### Claude's Discretion
- KPI card visual style (number formatting, icons, trend indicators)
- Activity feed format (timeline vs simple list)
- Activity feed metric detail per event (specific count vs generic status)
- Which execution states to display in feed (completed only vs all states)
- Whether automation list rows are clickeable links
- Loading states and skeleton designs
- Exact spacing, typography, and color palette choices within the "modern colorido" direction
- Error states and empty states for each section

</decisions>

<specifics>
## Specific Ideas

- Dashboard should feel like Stripe Dashboard or Plausible — colorful but not overwhelming, data-forward
- Notifications follow iOS/Slack patterns: blue dot for unread, type-specific icons
- The 2-column layout should feel balanced — automations and feed should have similar visual weight
- Error badge in activity feed should be inline, not a background color change

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-dashboard-home-notifications*
*Context gathered: 2026-04-10*
