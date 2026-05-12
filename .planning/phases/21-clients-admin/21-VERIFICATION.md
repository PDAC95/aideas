---
phase: 21-clients-admin
verified: 2026-05-08T00:00:00Z
uat_completed: 2026-05-11T00:00:00Z
status: passed
score: 6/6 must-haves verified (automated + 10/10 UAT)
uat_results: |
  All 10 human verification items passed in browser UAT on 2026-05-11.
  Two gap-closure fixes were committed during UAT:
  - 85f99c9: organization_notes.author_id FK swap profiles → auth.users
    (super_admin users have no profile row; FK insert was failing)
  - 531481a: permissive UUID validator (Zod v4 .uuid() rejects seed-style
    identifiers that Postgres accepts)
  Tech debt confirmed (already tracked elsewhere): no language switcher in
  admin layout — currently working around via NEXT_LOCALE cookie. Locale
  rendering parity verified visually for /admin/clients and detail page.
human_verification:
  - test: "Load /admin/clients as platform_staff and confirm all non-soft-deleted organizations render with name, slug, # active automations, # members, created date"
    expected: "Table renders 5 columns; row count matches SELECT count(*) FROM organizations WHERE deleted_at IS NULL"
    why_human: "Requires running app + signed-in staff session + seed data; cannot be verified by static grep alone"
  - test: "Type 'acme' (or any seeded org substring) in search input"
    expected: "List narrows within ~300ms (debounce) to matching name/slug rows; ?q= updates in URL"
    why_human: "Real-time debounce + URL state can only be verified in a running browser"
  - test: "Click an organization row from /admin/clients"
    expected: "Navigates to /admin/clients/[id] and renders persistent header (org name + 5-cell stat grid: Slug, Created, Members, Active automations, Pending requests) and 4 tabs in order: Automations -> Requests -> Members -> Notes"
    why_human: "Header layout + tab order is visual; needs live render to confirm"
  - test: "On the Automations tab click any row"
    expected: "Navigates to /admin/automations/[id] (Phase 20 detail page) and renders correctly"
    why_human: "Cross-link target verified to exist; end-to-end navigation needs live test"
  - test: "On the Requests tab click any row"
    expected: "Navigates to /admin/requests/[id] (Phase 19 detail page) and renders correctly"
    why_human: "Cross-link target verified to exist; end-to-end navigation needs live test"
  - test: "On the Notes tab click 'Add note', type a body, click Save"
    expected: "Note appears at the top of the list with author/date metadata"
    why_human: "Persistence + revalidatePath UX flow only observable in running app"
  - test: "Click Edit on a note, modify body, click Save; then refresh the page"
    expected: "Updated body persists across reload; '(edited)' marker appears (updated_at > created_at + 1s)"
    why_human: "Persistence across reload + edit marker conditional needs live DB"
  - test: "Click Delete on a note, confirm in inline panel"
    expected: "Note disappears from list and survives a refresh as deleted"
    why_human: "Hard-delete persistence requires live DB"
  - test: "Sign in as a non-staff customer user and visit /admin/clients (or directly query organization_notes)"
    expected: "Redirected away from /admin (admin layout already gates this); RLS prevents any read of organization_notes"
    why_human: "Negative-path security check requires non-staff session"
  - test: "Switch language to Espanol (cookie/locale switcher) and revisit /admin/clients and /admin/clients/[id]"
    expected: "All headers, columns, tabs, status badges, role labels, notes editor strings render in Spanish accent-free; no missing-key fallbacks"
    why_human: "EN/ES parity at runtime requires browsing both locales; static parity script confirmed key shape match but not visual rendering"
---

# Phase 21: Clients Admin Verification Report

**Phase Goal:** Operations get a 360 view of every customer organization — list, search, members, automations, requests, and free-form internal notes.
**Verified:** 2026-05-08
**Status:** human_needed (all automated checks pass; UAT items pending live verification)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                                                         | Status     | Evidence                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Staff loads `/admin/clients` and sees all organizations with name, slug, # active automations, # members, created date columns                 | VERIFIED   | `web/src/app/(admin)/admin/clients/page.tsx` renders `AdminClientsTable` with 5 columns; `fetchAdminClients` filters `deleted_at IS NULL`; counts buckets via `ACTIVE_LIKE_STATUSES` and `is_active=true` org members          |
| 2   | Staff filters/searches clients by name or slug and the list narrows accordingly                                                               | VERIFIED   | `admin-clients-search.tsx` debounces 300ms, pushes `?q=`; `client-queries.ts:90-94` performs ILIKE OR on `(name, slug)` with `%`/`_` escape                                                                                       |
| 3   | Staff opens client detail showing org info, members (email, role, last login), automations (status), requests (status)                       | VERIFIED   | `app/(admin)/admin/clients/[id]/page.tsx` calls `fetchAdminClientDetail`; renders 4 tab bodies (Automations / Requests / Members / Notes) all with required columns; SECURITY-DEFINER RPC `get_admin_org_members` surfaces `last_sign_in_at` |
| 4   | From client detail, staff clicks any automation row -> /admin/automations/[id], any request row -> /admin/requests/[id]                       | VERIFIED   | `admin-client-automations-tab.tsx:106` -> `/admin/automations/${row.id}`; `admin-client-requests-tab.tsx:107` -> `/admin/requests/${row.id}`. Both target pages exist                                                              |
| 5   | Staff adds and edits free-form internal notes per client; notes persist via `organization_notes` table; visible only to admin                  | VERIFIED   | Migration `20260509000001_organization_notes.sql` creates table + 4 RLS policies all gated by `is_platform_staff(auth.uid())`; server actions `createNote`/`updateNote`/`deleteNote` re-gate via `assertPlatformStaff`            |
| 6   | All clients admin UI strings have EN/ES parity                                                                                                | VERIFIED   | i18n parity script ran clean (`i18n parity ok`); all `admin.clients.list.*` and `admin.clients.detail.*` keys mirror exactly; `admin.placeholders.clients` removed from both locales                                                |

**Score:** 6/6 truths verified (automated)

### Required Artifacts

| Artifact                                                                       | Expected                                              | Status   | Details                                                                                                |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `supabase/migrations/20260509000001_organization_notes.sql`                    | Table + RLS + indexes + trigger                       | VERIFIED | CREATE TABLE; 4 RLS policies (select/insert/update/delete) all gated by `is_platform_staff`; 2 indexes; updated_at trigger |
| `supabase/migrations/20260509000002_admin_org_members_view.sql`                | RPC for last_sign_in_at                               | VERIFIED | SECURITY DEFINER fn `get_admin_org_members` joins auth.users; gated inside fn with `is_platform_staff`  |
| `web/src/lib/admin/types.ts`                                                   | AdminClient* types appended                           | VERIFIED | All 7 expected types present: `AdminClientRow`, `AdminClientListFilters`, `AdminClientsListResult`, `AdminClientMember`, `AdminClientAutomationRow`, `AdminClientRequestRow`, `AdminClientNoteEntry`, `AdminClientDetail` |
| `web/src/lib/admin/client-queries.ts`                                          | fetchAdminClients + fetchAdminClientDetail             | VERIFIED | Both exported; both gated by `assertPlatformStaff`; defensive ILIKE escape; locale-aware template join   |
| `web/src/lib/actions/admin-clients.ts`                                         | createNote/updateNote/deleteNote                      | VERIFIED | All 3 server actions use Zod parse + `assertPlatformStaff` + `revalidatePath`                          |
| `web/src/lib/validations/admin-client-note.ts`                                 | Zod schemas + MIN/MAX                                 | VERIFIED | createNoteSchema, updateNoteSchema, deleteNoteSchema; NOTE_MIN=1, NOTE_MAX=5000; trim-then-pipe shape  |
| `web/src/app/(admin)/admin/clients/page.tsx`                                   | List page (replaces placeholder)                      | VERIFIED | Server component; calls fetchAdminClients; renders search + table + pagination                          |
| `web/src/app/(admin)/admin/clients/[id]/page.tsx`                              | Detail page                                           | VERIFIED | Server component; calls fetchAdminClientDetail; renders header + tabs + active body; notFound() on miss |
| `web/src/components/admin/clients/admin-clients-search.tsx`                    | 300ms debounce + ?q= URL param                        | VERIFIED | "use client"; debounce constant 300; render-time setState pattern for back/forward sync; cleanup useEffect |
| `web/src/components/admin/clients/admin-clients-table.tsx`                     | 5-col table with empty state                          | VERIFIED | Renders 5 columns exactly; conditional empty (noResults vs noOrgs); row link to /admin/clients/[id]    |
| `web/src/components/admin/clients/admin-clients-pagination.tsx`                | ?page= URL param                                      | VERIFIED | Client component; returns null when totalPages<=1; previous/next buttons; useTransition                 |
| `web/src/components/admin/clients/admin-client-detail.tsx`                     | Header layout + children slot                         | VERIFIED | Renders back link + 5-cell stat grid + children                                                         |
| `web/src/components/admin/clients/admin-client-tabs.tsx`                       | Tab strip with ?tab= URL state                        | VERIFIED | "use client"; 4 tabs in order Automations -> Requests -> Members -> Notes; default tab drops `?tab=`     |
| `web/src/components/admin/clients/admin-client-automations-tab.tsx`            | Server table + cross-link                             | VERIFIED | 5 columns; row Link to /admin/automations/[id]; "View all" link to /admin/automations?org={slug}        |
| `web/src/components/admin/clients/admin-client-requests-tab.tsx`               | Server table + cross-link                             | VERIFIED | 4 columns; row Link to /admin/requests/[id]; "View all" link to /admin/requests?org={slug}              |
| `web/src/components/admin/clients/admin-client-members-tab.tsx`                | Read-only members table                               | VERIFIED | 5 columns: Email/FullName/Role/Last login/Joined; inactive opacity + chip; role labels translated      |
| `web/src/components/admin/clients/admin-client-notes-tab.tsx`                  | Notes tab wiring create + entry                       | VERIFIED | Server shell hosting AdminClientNoteCreate + AdminClientNoteEntry list; empty placeholder              |
| `web/src/components/admin/clients/admin-client-note-create.tsx`                | New-note creator                                      | VERIFIED | "use client"; collapsed/open states; trimmedLength gate on Save; charCounter; error surface             |
| `web/src/components/admin/clients/admin-client-note-entry.tsx`                 | View/edit/delete state machine                        | VERIFIED | "use client"; 3 modes view/edit/confirm-delete; "(edited)" marker via 1s tolerance; canSave dirty check |
| `web/messages/en.json` + `web/messages/es.json`                                | admin.clients.* with parity                           | VERIFIED | Parity script `i18n parity ok`; admin.placeholders.clients removed from both                            |

### Key Link Verification

| From                                                              | To                                                  | Via                                | Status | Details                                                                            |
| ----------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `/admin/clients/page.tsx`                                         | `client-queries.ts:fetchAdminClients`               | server import + invocation         | WIRED  | `import { fetchAdminClients }`; awaited inside `Promise.all` line 38               |
| `client-queries.ts`                                               | supabase organizations + automations + members      | Supabase JS .from + .or + .in     | WIRED  | `.from("organizations").or("name.ilike,slug.ilike,...")`; `.from("automations").in("status", ACTIVE_LIKE_STATUSES)`; `.from("organization_members").eq("is_active", true)` |
| `migration 20260509000001`                                        | `is_platform_staff()` RLS helper                    | USING + WITH CHECK on each policy  | WIRED  | All 4 policies use `public.is_platform_staff((SELECT auth.uid()))` exactly         |
| `/admin/clients/page.tsx`                                         | `messages/{en,es}.json`                             | `getTranslations('admin.clients.list')` | WIRED  | All 5 sub-namespaces (title/subtitle/search/columns/empty/pagination) accessed     |
| `/admin/clients/[id]/page.tsx`                                    | `client-queries.ts:fetchAdminClientDetail`          | server import + invocation         | WIRED  | `import { fetchAdminClientDetail }`; awaited inside `Promise.all`                  |
| `admin-client-automations-tab.tsx`                                | `/admin/automations/[id]`                           | Next.js `<Link>` on row            | WIRED  | `href={\`/admin/automations/${row.id}\`}`; target page exists                      |
| `admin-client-requests-tab.tsx`                                   | `/admin/requests/[id]`                              | Next.js `<Link>` on row            | WIRED  | `href={\`/admin/requests/${row.id}\`}`; target page exists                         |
| `admin-client-automations-tab.tsx`                                | `/admin/automations?org={slug}`                     | "View all" footer link             | WIRED  | `href={\`/admin/automations?org=${encodeURIComponent(orgSlug)}\`}`                 |
| `admin-client-requests-tab.tsx`                                   | `/admin/requests?org={slug}`                        | "View all" footer link             | WIRED  | `href={\`/admin/requests?org=${encodeURIComponent(orgSlug)}\`}`                    |
| `admin-client-note-create.tsx`                                    | `actions/admin-clients.ts:createNote`               | server action invocation onSave    | WIRED  | `import { createNote }`; called inside `startTransition`                           |
| `admin-client-note-entry.tsx`                                     | `actions/admin-clients.ts:updateNote, deleteNote`   | server action invocation           | WIRED  | Both imported and called inside `startTransition` for edit/delete flows           |
| `actions/admin-clients.ts`                                        | supabase organization_notes + revalidatePath        | INSERT/UPDATE/DELETE + revalidate  | WIRED  | All 3 actions touch `from("organization_notes")` and call `revalidatePath('/admin/clients/${id}')` |
| `actions/admin-clients.ts`                                        | `assertPlatformStaff`                               | guard before any DB write          | WIRED  | All 3 actions call `assertPlatformStaff(supabase)` immediately after auth setup    |

### Requirements Coverage

| Requirement | Source Plan          | Description                                                                                                | Status      | Evidence                                                                                                                       |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| CLNT-01     | 21-01                | Staff sees list of all organizations with columns name/slug/# active automations/# members/created          | SATISFIED   | `/admin/clients` table with the 5 required columns; `fetchAdminClients` returns all 5 fields                                   |
| CLNT-02     | 21-01                | Staff can filter/search clients by name or slug                                                            | SATISFIED   | Search input + 300ms debounce + ILIKE OR on (name, slug) in `client-queries.ts:90-94`                                          |
| CLNT-03     | 21-02                | Staff opens client detail showing org info + members + automations + requests                             | SATISFIED   | `/admin/clients/[id]` renders header + 4 tabs; Automations/Requests/Members tabs each show required fields                   |
| CLNT-04     | 21-02                | From client detail, navigation links to automation/request detail pages                                    | SATISFIED   | Row links in `admin-client-automations-tab.tsx` and `admin-client-requests-tab.tsx` route to Phase 19/20 detail pages         |
| CLNT-05     | 21-03                | Staff adds and edits free-form internal notes per client; visible only on admin                            | SATISFIED   | `organization_notes` table + 3 server actions + create/edit/delete UI; RLS gates all 4 verbs to platform_staff only            |
| I18N-01     | 21-01, 21-02, 21-03  | All admin UI strings have EN/ES parity                                                                     | SATISFIED   | i18n parity script `i18n parity ok`; placeholders.clients removed from both locales                                            |

All 6 declared requirement IDs are accounted for. No orphaned IDs in REQUIREMENTS.md (all CLNT-01..05 and I18N-01 mapped to declaring plans).

### Anti-Patterns Found

| File                                       | Line | Pattern                              | Severity | Impact                                                                                                       |
| ------------------------------------------ | ---- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `admin-clients.ts` (server action)         | 115, 132, 181, 193, 231, 243 | `console.error(...)` in catch branches | Info     | Legitimate server-side error logging consistent with Phase 19/20 actions; not a stub or anti-pattern        |

No TODO/FIXME/HACK markers, no placeholder/coming-soon strings (the `placeholder` matches are HTML attribute names + i18n key names, not stub text), no empty handlers, no return-null stubs, no `any` types in Phase 21 files. Lint runs clean against all Phase 21 paths (filtered output empty).

### Build / Lint / Types

- `npx tsc --noEmit` exits 0 across whole web/.
- `npm run lint` reports 0 errors / 0 warnings in Phase-21 paths (`admin/clients`, `admin-client*`, `client-queries.ts`, `admin-clients.ts`, `admin-client-note.ts`).
- `npm run build` is blocked by a pre-existing environmental Google Fonts TLS issue (`deferred-items.md`) unrelated to Phase 21 — same blocker would affect any Next 16 build on this machine.

### Human Verification Required

The 10 items in the frontmatter `human_verification` block cover the runtime behaviors that cannot be verified by static inspection: golden-path browse, debounce timing, cross-link navigation, note CRUD persistence, RLS negative path, EN/ES runtime rendering. All structural pieces verified to exist and be wired; manual UAT in browser is the remaining step.

### Gaps Summary

No structural gaps. All 6 success criteria from ROADMAP map 1:1 to implemented artifacts and wiring; all 6 requirement IDs are satisfied at the code level. Phase 21 is structurally complete; the only outstanding work is human UAT (visible behavior, network timing, persistence, EN/ES visual parity, and RLS negative-path verification with a non-staff session). The pre-existing Google Fonts build error is environmental and tracked separately in `deferred-items.md`.

---

_Verified: 2026-05-08_
_Verifier: Claude (gsd-verifier)_
