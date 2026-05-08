# Phase 21: Clients Admin - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Operations staff get a 360° admin view of every customer organization at `/admin/clients`: a searchable list with stats, plus a per-client detail page that surfaces members, automations, automation requests, and free-form internal notes. All UI is staff-only (gated by `assertPlatformStaff`) and bilingual (EN/ES).

Out of scope: customer-facing UI, removing/inviting members from the admin panel, billing/Stripe management, automation editing, request approval/rejection (those live in Phases 19/20), tagging system, client health/churn scoring.

</domain>

<decisions>
## Implementation Decisions

### List page (`/admin/clients`)
- **Layout:** Dense table (consistent with `/admin/automations` and `/admin/requests` from Phases 19-20). Sticky headers, compact rows, fast scan.
- **Columns:** Name, Slug, # Active automations, # Members, Created date.
- **Default sort:** `created_at DESC` (most recent organizations first).
- **Pagination:** Classic pagination, 25 rows per page. URL-shareable, predictable.
- **Search (CLNT-02):** Single input with 300ms debounce. Searches `name` and `slug` together using ILIKE partial match. No filter dropdown — one input does both.

### Detail page (`/admin/clients/[id]`)
- **Structure:** Persistent header + tabbed sections (`Automations` → `Requests` → `Members` → `Notes` in that order).
- **Header (always visible):** Name, slug, created date, # members, # active automations, # pending requests. Stats give immediate context without clicking tabs.
- **Tab order rationale:** Automations first (most-consulted: "what does this client run?"), then Requests (pending work), then Members (who's on the account), Notes last (deep context).
- **Navigation back to list:** Breadcrumb pattern `Admin > Clients > [Name]` (matches Phase 19/20 admin convention). Click on `Clients` returns to list.

### Internal notes (CLNT-05)
- **Storage:** New table `organization_notes` (id, organization_id FK, author_id FK -> profiles.id, body TEXT, created_at, updated_at). Multiple entries per org with timestamp + author — preserves history of who wrote what when.
- **Format:** Plain text with line breaks. Textarea input, escape HTML on render. No markdown, no rich text. Sufficient for "VIP", "churn risk", and short context notes.
- **Save behavior:** Explicit Save/Cancel buttons per note entry. Each entry has a view mode and an edit mode. Avoids accidental saves and matches expected admin UX.
- **Permissions:** Any platform staff member can create / edit / delete any note (small team, high trust). Server actions guarded by `assertPlatformStaff`. RLS policy on `organization_notes` requires `is_platform_staff = true`.
- **Visibility:** Notes are NEVER visible to customer users — only on the admin client detail page. RLS enforces this.

### Embedded tabs in detail page
- **Automations tab:** Table with columns `Name | Status | Template | Created | Last execution`. Row click navigates to `/admin/automations/[id]` (Phase 20 cross-link, fulfills CLNT-04). Status badge styling consistent with Phase 20.
- **Requests tab:** Table with columns `Title | Status | Submitted by | Created at`. Row click navigates to `/admin/requests/[id]` (Phase 19 cross-link, fulfills CLNT-04). `Submitted by` resolves to the profile's email or full_name.
- **Members tab:** Table with columns `Email | Full name | Role | Last login | Joined`. `Last login` from `auth.users.last_sign_in_at`. `Joined` from `organization_members.created_at`. Read-only — no remove/invite actions in this phase.
- **Pagination per tab:** Show first 25 rows, then a "View all" link at the bottom that navigates to the corresponding admin list page filtered by org (e.g. `/admin/automations?org=<slug>`). Detail page stays light; deep dives happen on the dedicated admin pages.

### i18n (I18N-01 cross-cutting)
- All strings (table headers, search placeholder, tab labels, breadcrumb, notes editor labels and buttons, empty states) ship with EN/ES parity.
- Keys live under `admin.clients.*` namespace in `messages/en.json` and `messages/es.json`.
- Status badges reuse keys from Phases 19/20 where applicable (avoid duplication).

### Claude's Discretion
- Exact RLS policy SQL for `organization_notes` (must enforce platform-staff-only read/write — Claude figures out the cleanest expression consistent with existing project RLS patterns).
- Skeleton/loading states for list and detail tabs.
- Empty-state copy and illustrations (no automations / no requests / no members / no notes yet).
- Error toast/banner styling on failed save/delete.
- Server action structure (one file vs split per resource).
- Whether to use Server Components + server actions exclusively or add a tiny client component for notes inline edit toggling (likely the latter — prefer minimal `"use client"`).
- Precise migration filename timestamp.

</decisions>

<specifics>
## Specific Ideas

- **Visual consistency is non-negotiable:** The clients admin must feel like a sibling of `/admin/requests` (Phase 19) and `/admin/automations` (Phase 20) — same table style, same status badges, same breadcrumb pattern, same density.
- **Cross-linking is a primary feature, not a nice-to-have:** Staff workflow is "open client → see something interesting → drill into the request or automation." Row clicks in the embedded tabs must take staff straight to the dedicated admin detail pages (Phase 19/20).
- **Notes as a running log:** Multiple short entries with author + timestamp beats one long blob. Mental model is closer to a CRM activity feed than a single "notes" textarea.
- **Search is for staff scanning a long list:** 300ms debounce ILIKE on name+slug is the floor. If staff types `"acme"` they should see Acme Corp instantly without picking a filter.

</specifics>

<deferred>
## Deferred Ideas

- **Client health badge** (active / at-risk / churned) — requires defining health rules; future phase.
- **Tags on clients** ("VIP", "churn risk" as taggable entities, with filter-by-tag in the list) — separate phase if it proves valuable beyond free-text notes.
- **Member management actions** (invite, remove, change role from admin) — explicit out of scope; CLNT-03 only requires viewing members.
- **Filter requests by status inside the tab** — single status filter could be added later if staff find the embedded table noisy.
- **Append-only / author-only notes permissions** — current decision is "any staff can edit any note"; tighter audit trail can come later if the team grows.
- **Rich-text or markdown notes** — plain text now; revisit if staff request formatting.
- **Author-only edit/delete on notes** — kept open for the future if accountability becomes an issue.

</deferred>

---

*Phase: 21-clients-admin*
*Context gathered: 2026-05-08*
