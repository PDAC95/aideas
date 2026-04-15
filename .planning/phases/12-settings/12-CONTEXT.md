# Phase 12: Settings - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage their profile, preferences, and security from a single settings page. This includes avatar upload (Supabase Storage), editing name and company name, language switching (EN/ES), hourly cost setting (used in Reports estimated value), password change, and active sessions management.

</domain>

<decisions>
## Implementation Decisions

### Page Structure
- Single scrollable page with stacked cards (not tabs or sidebar)
- Three cards: Profile, Preferences, Security — all full width, same width
- Each card has its own Save button (independent form submissions)
- Toast notification (sonner/shadcn) on successful save
- Page title: simple "Settings" / "Configuracion" with subtitle — no user name in title

### Profile Card
- Avatar displayed at top of card, form fields below
- Fields: Avatar upload area, Full Name (editable), Company Name (editable), Email (visible but not editable/disabled)
- Avatar click or "Change" button opens file picker
- Preview shown immediately after file selection, uploaded on card Save
- "Remove" button available to revert to default avatar
- Default avatar (no image): circle with user's initials on colored background
- File limits: 2MB max, JPG/PNG/WebP formats accepted

### Preferences Card
- Language selector: dropdown/select (not toggle), options "English" and "Espanol"
- Language change applies instantly on selection (no Save needed) — updates next-intl cookie
- Hourly cost: numeric input with $ prefix, accepts decimals
- Hourly cost saved at organization level (organizations.settings JSONB)
- Only owner/admin roles can edit hourly cost
- Label explains: "Estimated hourly labor cost used to calculate automation value in Reports"

### Security Card
- Single card with divider line between two sections: Change Password (top) and Active Sessions (bottom)
- Change Password: requires Current Password + New Password + Confirm New Password
- Password strength indicator bar (weak/medium/strong with red/yellow/green colors)
- OAuth users (Google login): hide Change Password section entirely, show only Active Sessions
- Active Sessions: show device/browser type, approximate location (country/city), last access time
- Current session marked with "Current" badge
- Single "Sign Out All Other Sessions" button (no per-session sign out)
- Confirmation modal before signing out all sessions (destructive action, red button)

### Claude's Discretion
- Toast library choice (sonner vs shadcn toast)
- Exact password strength algorithm/thresholds
- How to detect OAuth-only users vs email+password users
- Session geolocation data source (from Supabase Auth JWT or user-agent parsing)
- Avatar image compression/resizing before upload
- Exact responsive breakpoints for mobile layout

</decisions>

<specifics>
## Specific Ideas

- Cards stacked vertically like Vercel/Linear settings pages — clean, no clutter
- Avatar with initials fallback similar to how GitHub/Slack handles missing avatars
- Password strength bar like the ones in 1Password or GitHub signup
- Session list similar to GitHub's "Sessions" security page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-settings*
*Context gathered: 2026-04-15*
