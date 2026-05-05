# Phase 17: Admin Foundation - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the base infrastructure for AIDEAS internal staff to operate the platform — `platform_staff` table, RLS bypass strategy, dedicated `/admin/*` route gate with separate login, dedicated admin layout, and `assertPlatformStaff` server-action helper. This phase delivers the **shell and security boundary**, not functional admin screens (those are Phases 18-22: Catalog, Requests, Automations, Clients, Admin Home).

</domain>

<decisions>
## Implementation Decisions

### Roles and permissions

- Two roles: `super_admin` and `operator`
- **Same operational permissions** for now (both can do everything in the admin area for v1.2 phases 18-22)
- **Sole role-gated capability:** managing the `platform_staff` table itself — only `super_admin` can add/remove staff
- v1.2 has NO UI for staff management — adding staff is done by SQL/seed only. The role distinction is seeded for future use.
- The first `super_admin` is created by the migration with `pdmckinster@gmail.com` hardcoded (the user's existing seed account).
- Platform staff are PURE accounts: they do NOT belong to any client organization. They are not in `organization_members`. Their role is purely platform-level.
- A `platform_staff` user navigating to `/dashboard` (the customer area) is automatically redirected to `/admin`.

### RLS bypass strategy

- Add SQL helper functions to centralize the staff check:
  - `is_platform_staff(uid uuid) returns boolean` — true if the user appears in `platform_staff` (any role). Used by most policies.
  - `is_super_admin(uid uuid) returns boolean` — true only if the user is in `platform_staff` with `role = 'super_admin'`. Reserved for critical operations (e.g., destroying organizations, managing staff itself).
- Extend the existing `USING` / `WITH CHECK` clauses on the 8 business tables (`organizations`, `profiles`, `organization_members`, `automation_templates`, `automations`, `automation_executions`, `automation_requests`, `subscriptions`, `chat_messages`, `notifications`, `invitations`) with `OR is_platform_staff(auth.uid())`. The existing org-scoped clauses are preserved unchanged.
- **Read AND write CRUD** are granted to platform staff on all mutable tables — phases 18-22 require full CRUD (catalog editing, request approval, automation status transitions, internal notes).
- **Immutable tables stay immutable for everyone**, including admin: `automation_executions` and `chat_messages` retain their no-UPDATE/no-DELETE policies. If admin needs to "remove" a record, the future approach is soft-delete with a flag, not bypassing immutability.

### Layout and entry point

- **Separate admin login:** new route `/admin/login` with its own UI, separate from the customer `/login`. Total isolation.
- **Independent sessions:** customer and staff sessions are independent — a single browser can be logged in as a customer in one tab and as staff in another simultaneously. Cookie/middleware design must support this (separate cookie names or scoped paths).
- **Dedicated admin layout** built from scratch as `AdminLayout` + `AdminSidebar` + `AdminHeader` — no reuse of customer dashboard shell components. Total visual + code separation.
- **Visual distinction:** the AIDEAS logo is shown alongside a colored `ADMIN` badge in the admin header (color TBD — orange or red, planner picks). The badge is always visible so a staff member can never confuse where they are.
- **Sidebar items (in order):** Home, Catalog, Requests, Automations, Clients, Logout. Logout is always visible at the bottom of the sidebar (mirrors the customer sidebar pattern but rendered in the admin shell). No Settings entry in v1.2 — added later if needed.

### Claude's Discretion

- Exact admin badge color and visual weight
- Cookie naming scheme for independent sessions (e.g., `sb-admin-*` vs `sb-*`) and middleware path scoping — planner picks the simplest implementation that achieves true session independence
- The `platform_staff` table column types and constraints beyond `(user_id uuid PK, role text CHECK, created_at timestamptz)`
- Helper function security model (`SECURITY DEFINER` vs `SECURITY INVOKER`) — pick the safest default for RLS helpers
- The exact i18n key namespace for admin strings (e.g., `admin.shell.banner` vs `admin.layout.banner`)
- Whether `/admin` itself renders an empty placeholder ("welcome — go to one of the sections") or auto-redirects to a default sub-route — phase 22 builds the real admin home

</decisions>

<specifics>
## Specific Ideas

- "La versión más profesional" for session handling — model after Stripe / Supabase / Vercel where you can be logged in as a member of multiple workspaces or as both a tenant and an admin without one session evicting the other.
- Email hardcoded in the migration: `pdmckinster@gmail.com`. This account already exists in the seed, so the migration just inserts a `platform_staff` row for the matching `auth.users.id`.

</specifics>

<deferred>
## Deferred Ideas

- UI to manage `platform_staff` (invite/remove staff) — future phase, not in v1.2 scope. Today only seed/SQL.
- A "Settings" sidebar entry for staff (profile, password) — added when needed, not in v1.2.
- Soft-delete flags on the immutable tables (`automation_executions`, `chat_messages`) — only if a real need arises post-v1.2.
- Audit log of admin actions — not in scope for v1.2 foundation; could become its own phase.
- Finer-grained role permissions (e.g., `operator` can view but not approve critical requests) — kept simple for v1.2; can be revisited when phases 18-22 reveal real need.

</deferred>

---

*Phase: 17-admin-foundation*
*Context gathered: 2026-05-05*
