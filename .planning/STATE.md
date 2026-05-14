---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: "Completed 24-01-PLAN.md (Phase 24 retroactive verification: CARRY-01..04 satisfied, REQUIREMENTS.md reconciled to 31/31)"
last_updated: "2026-05-14T15:07:32.427Z"
progress:
  total_phases: 18
  completed_phases: 18
  total_plans: 53
  completed_plans: 53
decisions:
  - "24-01: Build exit 0 + lint exit 1 documented honestly per user-approved Option A — status: passed because CARRY-01..04 are satisfied in their touch surfaces; 103 pre-existing lint errors enumerated under Known Open Items (Out of Scope) rather than papered over"
  - "24-01: verified_retroactively: true frontmatter field added to 16-VERIFICATION.md as backfill marker that does not break the workflow status enum"
  - "24-01: Phase 16-03 partial RLS hardening gaps remain explicitly out of scope and tracked separately — this verification record closes the four CARRY requirements, not Phase 16 the workstream as a whole"
  - "24-01: REQUIREMENTS.md coverage reconciled to Satisfied 31 / Pending 0 — all v1.2 requirements now Complete (25 prior + 6 closed by Phases 23 and 24)"
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: "Completed 23-03-PLAN.md (Phase 23 plans 3/3 — awaiting verifier to flip phase to Complete)"
last_updated: "2026-05-14T00:30:00.000Z"
progress:
  total_phases: 18
  completed_phases: 16
  total_plans: 52
  completed_plans: 52
decisions:
  - "23-03: Relaxed isUuid regex to layout-only (no RFC 4122 v1-5 version/variant enforcement) — Postgres accepts any 128-bit hex as UUID; seed UUIDs (bbbbbbbb-0000-...) and nil UUID were being rejected by the strict regex and falling through to the slug path"
  - "23-03: ICU notFound placeholder must use double quotes around {value}, not single quotes — ICU MessageFormat treats single quotes as literal-escape syntax, rendering literal '{value}' text"
  - "23-03: Emitter contract verified zero-code-changes — orgSlug prop traced to organization.slug at (admin)/admin/clients/[id]/page.tsx:191,200; both Client 360 tabs already emit /admin/{requests|automations}?org=${encodeURIComponent(orgSlug)}"
  - "23-03: UAT 5/5 passed in EN and ES on dev server localhost:4000 (super_admin pdmckinster@gmail.com); admin-layout language switcher gap worked around via document.cookie console set — pre-existing Phase 17 tech debt"
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 23-02-PLAN.md
last_updated: "2026-05-13T19:27:23.810Z"
progress:
  total_phases: 18
  completed_phases: 16
  total_plans: 52
  completed_plans: 51
decisions:
  - "23-02: Pre-interpolate orgFilter.notFound at the page (parent t() call with {value}) so the chip stays decoupled from next-intl and reusable across both surfaces"
  - "23-02: Chip placement differs by page — requests page between tabs/table (no filter row), automations page after the existing filters bar (closest to the rows it filters)"
  - "23-02: Use Link (not button) for the clear affordance — preserves URL-as-state, browser back-button restores the filtered view"
  - "23-02: Accept cosmetic dropdown mismatch on /admin/automations (slug-form ?org= shows 'All organizations' selected) — chip is the primary affordance; dropdown realignment logged in deferred-items.md"
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 23-01-PLAN.md
last_updated: "2026-05-13T19:17:16.936Z"
progress:
  total_phases: 18
  completed_phases: 16
  total_plans: 52
  completed_plans: 50
decisions:
  - "23-01: Keep AdminAutomationListFilters.organizationId field name; widen meaning to slug-or-uuid via JSDoc (avoids phase-22-wide callsite rename)"
  - "23-01: Envelope return shape {rows, orgFilter} so the page renders the filter chip without a second org-lookup query"
  - "23-01: Unresolved-identifier short-circuit returns empty rows + echoes raw input via orgIdentifierProvided so the page can render 'Org not found' instead of an indistinguishable empty list"
  - "23-01: 100-char input cap inside resolveOrgIdentifier defends against hostile ?org=... payloads while preserving user intent for the not-found state"
  - "23-01: Generic SupabaseClient type (no Database generic) in resolveOrgIdentifier keeps the helper portable across admin/customer clients"
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 22-01-PLAN.md
last_updated: "2026-05-13T14:15:53.297Z"
progress:
  total_phases: 16
  completed_phases: 16
  total_plans: 49
  completed_plans: 49
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: "Completed 22-02-PLAN.md (Phase 22 complete: 2/2 plans — admin home KPIs + quick links + activity feed)"
last_updated: "2026-05-12T20:11:27Z"
progress:
  total_phases: 16
  completed_phases: 16
  total_plans: 49
  completed_plans: 49
decisions:
  - "22-02: automation_activated event approximated as status='active' ORDER BY updated_at DESC (no audit log in Phase 22)"
  - "22-02: 20-per-source pull + JS merge/sort/slice preserves global top-20 even when one source dominates"
  - "22-02: t.raw + manual string-replace substitution for feed event templates (avoids next-intl ICU formatter interfering with named placeholders)"
  - "22-02: Quick-link badge values reuse kpis object — no duplicate query, single source of truth"
  - "22-02: Hide badge entirely when count is 0 (avoids '0' looking like a loading state)"
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 22-01-PLAN.md
last_updated: "2026-05-12T20:03:51.978Z"
progress:
  total_phases: 16
  completed_phases: 15
  total_plans: 49
  completed_plans: 48
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: "Completed 21-03-PLAN.md (Phase 21 complete: 3/3 plans, all 6 v1.2 reqs satisfied)"
last_updated: "2026-05-08T16:44:16.399Z"
progress:
  total_phases: 15
  completed_phases: 15
  total_plans: 47
  completed_plans: 47
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 21-02-PLAN.md
last_updated: "2026-05-08T16:31:53.764Z"
progress:
  total_phases: 15
  completed_phases: 14
  total_plans: 47
  completed_plans: 46
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Phase 21 context gathered
last_updated: "2026-05-08T16:05:42.953Z"
progress:
  total_phases: 15
  completed_phases: 14
  total_plans: 47
  completed_plans: 45
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 20-04-PLAN.md
last_updated: "2026-05-08T14:50:42.941Z"
progress:
  total_phases: 14
  completed_phases: 14
  total_plans: 44
  completed_plans: 44
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
stopped_at: Completed 20-03-PLAN.md
last_updated: "2026-05-07T20:18:51.063Z"
progress:
  total_phases: 14
  completed_phases: 14
  total_plans: 43
  completed_plans: 43
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
last_updated: "2026-05-07T19:09:17.846Z"
progress:
  total_phases: 14
  completed_phases: 13
  total_plans: 40
  completed_plans: 40
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Admin Dashboard
status: unknown
last_updated: "2026-05-07T18:20:57.491Z"
progress:
  total_phases: 13
  completed_phases: 13
  total_plans: 40
  completed_plans: 40
---

---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Admin Dashboard
status: in_progress
last_updated: "2026-05-08T16:41:00Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 21
  completed_plans: 16
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-04 after v1.2 milestone start)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single bilingual dashboard — paired with an operations team who can fulfill what they request.
**Current focus:** v1.2 Admin Dashboard — Phase 17/18/19/20/21 complete (Phase 19 + 20 + 21 awaiting human UAT). Phase 22 (Admin Home) is next.

## Current Position

Phase: Phase 21 — Clients Admin — COMPLETE (3/3 plans shipped).
Plan: 21-03 complete. AdminClientNotesTab swapped from read-only to full create/edit/delete editor: AdminClientNoteCreate (collapsed "Add note" button -> textarea + Save/Cancel + live char counter) and AdminClientNoteEntry (per-existing-note three-state machine: view / edit / confirm-delete). 3 server actions (createNote / updateNote / deleteNote) gated by assertPlatformStaff with revalidatePath('/admin/clients/[id]'). 3 Zod schemas (createNoteSchema / updateNoteSchema / deleteNoteSchema) with NOTE_MIN=1 + NOTE_MAX=5000 transform-then-pipe shape that catches whitespace-only input. Inline confirm-delete panel (NOT a portal Dialog — project's shadcn/ui set ships only button/card/form/input/label primitives). 24 new admin.clients.detail.notes.editor.* leaf keys per locale; comingSoon dead key removed from both locales (full EN/ES parity, accent-free Spanish). CLNT-05 + I18N-01 (this slice) satisfied. Phase 21 closes all 6 v1.2 requirements (CLNT-01..05 + I18N-01).
Status: Plan 21-03 ships CLNT-05 + I18N-01. tsc --noEmit exits 0; scoped ESLint exits 0 across src/components/admin/clients/, src/app/(admin)/admin/clients/[id]/page.tsx, src/lib/actions/admin-clients.ts, src/lib/validations/admin-client-note.ts; i18n parity script confirms editor.* matches EN/ES + comingSoon removed from both. `npm run build` still blocked by pre-existing Google Fonts TLS issue (deferred-items.md from 21-01, NOT introduced by 21-03). 4 files created, 4 modified, 3 atomic commits, 5 minutes.
Last activity: 2026-05-08 — Plan 21-03 executed (3 tasks: Zod schemas + 3 server actions, 2 client components, notes-tab wiring + i18n + comingSoon removal). Phase 21 verifier is next; once VERIFICATION.md status is `passed` the branch `feature/phase-21-clients-admin` should be merged to `main`. Phase 22 (Admin Home) is the next phase.

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 (target) |
|--------|------|------|---------------|
| Phases | 6 | 9 | 7 |
| Plans | 16 | 28 | ~20 |
| Requirements | 54/54 | 38/38 | 31 (planned) |
| Timeline | 70 days | 21 days | TBD |
| Phase 21 P02 | 15 min | 4 tasks | 12 files |
| Phase 21 P03 | 5 min  | 3 tasks | 8 files  |
| Phase 22 P01 | 3 min | 2 tasks | 6 files |
| Phase 23-client-360-crosslink-fix P01 | 3 min | 2 tasks | 4 files |
| Phase 23-client-360-crosslink-fix P02 | 5 min | 3 tasks | 6 files |

### Per-plan execution metrics (v1.2)

| Phase-Plan | Duration (min) | Tasks | Files changed |
|------------|----------------|-------|---------------|
| 17-01      | 10             | 2     | 1             |
| 17-02      | 3              | 3     | 7             |
| 17-03      | 5              | 2     | 13            |
| 18-01      | 16             | 2     | 5             |
| 18-02      | 10             | 2     | 9             |
| 18-03      | 12             | 2     | 8             |
| 19-01      | 4              | 2     | 3             |
| 19-02      | 5              | 3     | 5             |
| 19-03      | 6              | 3     | 8             |
| 20-01      | 12             | 3     | 8             |
| 20-02      | 7              | 3     | 8             |
| 20-03      | 5              | 3     | 7             |
| 20-04      | 6              | 6     | 7             |
| 21-01      | 5              | 3     | 10            |
| 21-02      | 15             | 4     | 12            |
| 21-03      | 5              | 3     | 8             |

## Accumulated Context

### Decisions (Phase 21-03 execution, 2026-05-08)

- **Inline confirm-delete state, NOT a portal Dialog primitive.** The project's shadcn/ui set currently ships only button/card/form/input/label — adding @radix-ui/react-dialog for a single-purpose confirmation panel adds a dependency, mounts a portal, and complicates SSR. The inline three-state component (view -> confirm-delete -> view) is simpler, accessible (red border + role=alert error surface), keyboard-traversable, and trivially testable. Pattern reusable for any future admin destructive-action confirmation that doesn't warrant a full Dialog (Phase 22 admin home action items, future per-row destructive actions on /admin/clients).
- **NOTE_MIN=1 / NOTE_MAX=5000 with `transform(s=>s.trim()).pipe(min/max)` Zod shape.** MIN=1 because CONTEXT.md positions notes as a "running log" with short tags like "VIP" or "churn risk" explicitly supported. The Phase 19 reject-reason MIN=10 is intentional friction (operator must justify a customer-facing rejection); notes are admin-internal and can be one word. transform-then-pipe ordering catches whitespace-only input before length validation; custom message codes (body_too_short / body_too_long) flow through to typed client-side error mapping.
- **createNote does NOT call notifyOrgMembers.** Phase 19 approve/reject and Phase 20 transitions all fan out customer-facing notifications because those state changes affect the customer experience; internal notes are admin-only and CONTEXT.md is explicit they are "NEVER visible to customer users." Sending a notification on note save would leak the existence of internal notes to customers via /dashboard/notifications.
- **deleteNote performs HARD delete, not soft delete.** organization_notes has no deleted_at column (Plan 21-01 migration); CONTEXT.md positions notes as "running log" not audit log. If regulator/legal team ever needs forensic recovery, the path is DB backups, not soft-delete pollution of the running list.
- **updateNote / deleteNote do NOT enforce author-id ownership.** CONTEXT.md is explicit: "any platform staff member can create/edit/delete any note ... small team, high trust." Building author-id checks would be premature constraint — the team would route around them via direct DB access anyway. If staff count grows past trust threshold in v2.x, add the check at that time.
- **No optimistic concurrency control on updateNote.** Two staff clicking Save within milliseconds simply produce a last-writer-wins outcome; the body is short and conflicts are recoverable by reading + retyping. An ETag/version-id approach would add a column + a roundtrip + a surfaced-conflict UX path for a vanishingly rare scenario.
- **Save button blocks when body.trim() === note.body.trim() in edit mode.** Avoids a needless DB write that bumps updated_at, fires the trigger, and adds a bogus "(edited)" marker. Mirrors form-dirty checks but at the value-comparison level rather than via React Hook Form (this surface is too small for RHF).
- **Each action runs a pre-flight SELECT before mutating.** createNote: org-existence + soft-delete check (defense in depth — RLS would let an org-id-pointer-mismatch insert succeed). update/delete: load row to extract organization_id so revalidatePath targets the correct page after the mutation removes the row. Two round trips per action; correctness over micro-perf.
- **No revalidatePath('/admin/clients') in any action.** The list page does not surface note counts or any per-org note metric; revalidating it on every save would cause needless cache churn. If Phase 22 surfaces "X new notes this week", it will revalidate its own home path independently.
- **Single charCounter key duplicated across editor.create.charCounter AND editor.entry.charCounter, NOT promoted.** The dict shape stays per-component-self-contained: AdminClientNoteCreate.translations and AdminClientNoteEntry.translations are independent prop types, both with their own charCounter field. Avoids a "where does this key live?" lookup at component-edit time. Cost: one duplicated value '{n} / {max}' in en.json + es.json — acceptable.
- **entry.writtenBy + entry.edited re-use parent notes.writtenBy + notes.edited (NOT cloned into editor.entry.*).** View-mode metadata is identical between Plan 21-02's read-only entry and Plan 21-03's view state of the editable entry — duplicating those keys would invite drift over time. Page assembles notesTabTranslations.entry.writtenBy from t.raw('notes.writtenBy') and entry.edited from t('notes.edited').
- **errorTooShort / errorTooLong are fixed-translation strings, NOT MIN/MAX-substituted.** Error keys are clean prose ("Note cannot be empty." / "Note exceeds 5000 characters.") instead of templated "Note must be between {min} and {max} characters". If MIN or MAX changes, both schema constants AND en.json/es.json strings update — explicit coupling beats a substitution layer for a tiny key surface.
- **bodyFieldErrorFromZod helper signature uses ReadonlyArray<{path: ReadonlyArray<PropertyKey>; message: string}>.** Zod v4 issue paths are PropertyKey[] (which includes symbol). The plan-prescribed (string|number)[] signature failed type-check; the wider PropertyKey shape correctly accepts Zod's emitted issues — caught + auto-fixed during Task 1 verify (Rule 1 — Bug). Runtime check `i.path[0] === "body"` still works correctly because string equality short-circuits on non-string PropertyKeys.
- **Read-only-then-editor split across two plans is now a battle-tested pattern.** 21-02 ships read-only Notes tab + flagged comingSoon i18n key; 21-03 swaps the body for the editor and removes the comingSoon key. Useful for any future feature where the read surface naturally precedes the write surface (a future audit-log read tab whose entries gain actions in a later plan, etc.).

### Decisions (Phase 21-02 execution, 2026-05-08)

- **SECURITY-DEFINER RPC, not a JOIN or a view, for cross-schema auth.users.last_sign_in_at access.** Supabase JS PostgREST cannot embed across schemas in one query. Function (vs view) wins because (1) the inline `WHERE ... AND public.is_platform_staff((SELECT auth.uid()))` gate is per-call — no caching, no stale grant exposure window; (2) matches Phase 17 helper-function convention exactly; (3) takes input parameters cleanly (`p_organization_id UUID`) without a doubled WHERE-clause RLS surface; (4) `GRANT EXECUTE` is a cleaner permission gate than table-level GRANT. Non-staff caller receives empty result set, not error — defense-in-depth posture (no `403` noise leaking RPC existence to leaked admin tokens).
- **8 parallel round trips for the detail fetcher (1 org + 4 list queries + 3 HEAD counts), not 5.** Counting from `array.length` of LIMIT-25 listings would underreport whenever any header counter crosses 25; HEAD `count: exact` is a single round trip per counter, no row payload, parallelized by `Promise.all`. Members RPC has no `count: exact` so members count uses a separate `organization_members` HEAD query — symmetry across the 3 header counters keeps the code readable.
- **Per-tab translation dicts as concrete TypeScript object literals, NOT prose comments.** Each of 5 dicts (header / tabs / automations / requests / members / notes) is built from `t(...)` and `t.raw(...)` calls in `page.tsx`. Tab components accept resolved-string dicts as props with no `useTranslations` import — server-rendered, framework-agnostic, easy to test with literal-string fixtures. Pattern reusable for any future detail page with N tab bodies.
- **`members.roles.owner` is required, not optional in the i18n parity script.** The `handle_new_user()` trigger creates `role='owner'` for the first `organization_members` row per org — every customer org has at least one owner. The role union is forward-compat string union and the renderer falls back to raw role for unknown values, but missing `owner` would render the most common role untranslated as a lowercase "owner". Verification script explicitly checks `en.admin.clients.detail.members.roles.owner` and `es.admin.clients.detail.members.roles.owner`.
- **`notes.comingSoon` flagged for removal in 21-03.** Plan 21-03 will replace `AdminClientNotesTab`'s body with the create/edit/delete editor; the `comingSoon` footer + the i18n key in both locales must be removed at that time. Logged in 21-02 SUMMARY's `key-decisions` so 21-03 doesn't ship a dead key.
- **Note body rendering — XSS posture: plain JSX text inside `<p className="whitespace-pre-wrap">{note.body}</p>`.** React's default escaping is the entire defense. No HTML-injection prop, no markdown render, no link auto-detection in 21-02. CONTEXT.md explicit: "Plain text ... escape HTML on render." If 21-03 reviewer wants markdown support, separate plan.
- **(edited) chip uses 1-second tolerance against `updated_at vs created_at`.** Strict `>` comparison flags every freshly-inserted row as edited because the `update_updated_at_column()` trigger fires `BEFORE UPDATE` (not on INSERT — column DEFAULTs to NOW()). 1s is wider than any single-host clock-precision noise but tighter than any human-typed edit. Reusable for any "edited?" surface.
- **Defensive embed-shape normalization on `automations.template`, `requests.requester`, `notes.author`.** Phase 19/20 SUMMARYs documented the gotcha that Supabase JS PostgREST sometimes returns single-row !inner / !left embeds as T, sometimes T[]. All three mappers use the `Array.isArray(x) ? x[0] ?? null : x ?? null` normalizer.
- **Cross-link "View all" footer targets accept degradation.** `/admin/automations?org=<slug>` and `/admin/requests?org=<slug>` link to global lists that don't yet honor `?org=` filtering. CONTEXT.md accepts this — user lands on unfiltered list, same UX as direct nav. Phase 22 or a future polish plan can wire the filter without rewriting the link target. Logged so no executor wastes a deviation.
- **`?tab=` URL state owns ONE query param only.** Page reads only `?tab=` from `searchParams` (typed as `Promise<{ tab?: string }>`). No `?page=` (per-tab listings capped at 25 — anything bigger lives on global list page), no other params. Keeps mental model simple: one search param, four tab values, deterministic default.
- **Synthetic `?tab=` UI state with default-canonicalization.** Default tab = "automations" drops the param so refresh on default stays bare and shareable URLs are minimal; other tabs set `?tab=requests|members|notes`. Three-way duplication of tab literals (Type union + ADMIN_CLIENT_TABS array + VALID_TABS in page.tsx) is acceptable at this size; collapsing to a single `as const` source would couple type to runtime data and lose forward-compat on the includes() guard.
- **Read-only-then-editor split: 21-02 ships read-only Notes; 21-03 swaps the body for the editor and removes notes.comingSoon.** Pattern reusable for any future plan that ships UI before behavior — establishes a "scaffold-then-wire" cadence at the plan level.
- **Supabase JS RPC return shape gotcha.** `supabase.rpc(...)` returns `{ data, error }` where `data` is a flat array of plain row objects (same shape as a SELECT result), NOT a `{ rows: [...] }` wrapper. The mapper code treats `membersRes.data ?? []` as `RawMember[]` directly. Worth flagging because a developer used to `.from(...)` returning `data` AND a developer used to a SQL function returning a single SETOF can both land here with the wrong assumption.

### Decisions (Phase 21-01 execution, 2026-05-08)

- **Migration owned by 21-01, not 21-03.** Pulling `organization_notes` into Plan 1 means Plan 21-02's detail page can render the (initially empty) Notes tab on day one, and Plan 21-03 only adds writes — no migration race between sibling plans. Establishes a "plan-1-of-phase migration foundation" pattern reusable for any phase whose later plans need writes against a fresh table.
- **4 RLS policies, one per verb, all gated by `is_platform_staff((SELECT auth.uid()))`.** Mirrors the `organizations` admin policies in `20260506000001_admin_foundation.sql`. Clearer audit trail than `FOR ALL`; easier to revoke a single verb later. No customer-facing policy exists on this table at all — RLS denies customer reads by default.
- **`author_id` references `profiles(id) ON DELETE RESTRICT`** so a staff-author profile cannot be deleted while their notes exist (preserves audit trail). `organization_id` references `organizations(id) ON DELETE CASCADE` so notes follow their org if the org is hard-deleted.
- **Two round trips, not embeds.** Main paginated org query (`.range()` + `{ count: "exact" }` for totalCount in same response) + parallel pair of `.in("organization_id", orgIds)` queries against `automations` + `organization_members`, bucketed in JS keyed by `organization_id`. Established Phase 20 pattern; embed-style child counts cause Supabase JS typing pain and aren't faster at our volume. Reuse for 21-02's per-org KPI widgets.
- **`ACTIVE_LIKE_STATUSES = ["active","in_setup","paused","pending_review"]` duplicated, not imported from request-queries.** 4-element `as const` tuple. Cross-module import would couple two query modules; duplication is cheaper and keeps each module self-contained.
- **Defensive ILIKE wildcard escape on user input.** `filters.q.replace(/[%_]/g, c => "\\" + c)` before `.or("name.ilike.{pat},slug.ilike.{pat}")`. Defends against a search like `100%` exploding into a wildcard. Same defense Phase 20 uses; reuse for 21-02 if it ever adds free-text search.
- **`.or()` syntax for multi-column ILIKE.** Single string with comma-separated branches: `name.ilike.${pat},slug.ilike.${pat}`. Supabase JS PostgREST pattern. Reuse for any future multi-column free-text search.
- **Defensive page/pageSize coercion.** `Math.max(1, Math.floor(filters.page) || 1)` and `Math.min(MAX_PAGE_SIZE=100, Math.max(1, Math.floor(filters.pageSize) || 25))` so a hostile `?pageSize=10000` URL caps at 100 and `?page=garbage` lands on 1.
- **Render-time setState comparison for URL sync (no useEffect).** Search component derives `urlQ` during render, compares against `lastSyncedQ` stored in useState, calls setValue in render only when they diverge. Pattern proven in Phase 20-01 (avoids `react-hooks/set-state-in-effect`). Reuse for any client subtree on 21-02's detail page that needs to honor external URL changes.
- **Pagination component returns null when totalPages <= 1.** Caller doesn't have to branch; component decides. Same shape reusable for any paginated child component on 21-02 or Phase 22.
- **Resetting `?q=` drops `?page=`.** A user who narrows their search shouldn't land on a page 3 that no longer exists for the new filtered result. URL-state-correctness pattern.
- **Row link `/admin/clients/${row.id}` 404s until 21-02 ships.** CONTEXT.md accepts cross-plan dead links between sequential plans (Phase 19 SUMMARY established the pattern); worth being explicit so no executor wastes a deviation reverting it.
- **`admin.clients.list.*` namespace shape locked in for 21-02 / 21-03 to extend.** 15 leaf keys: title/subtitle, search.{label,placeholder,clear}, columns.{name,slug,activeAutomations,members,createdAt}, empty.{noResults,noOrgs}, pagination.{label,previous,next,page}. 21-02 should add `admin.clients.detail.*` peer namespace under `admin.clients`; 21-03 adds `admin.clients.detail.notes.*` peer under `clients.detail`. Pagination `label` and `page` use string templates `{from}/{to}/{total}` and `{page}/{total}` respectively, substituted client-side via `t.raw()` (NOT via `t()` interpolation) so the placeholder lives unresolved on the server-side string and the client owns the live count substitution. Reuse for any future paginated admin list.
- **Spanish stays accent-free** ("Clientes", "Buscar por nombre o slug", "Pagina", "Anterior", "Siguiente", "Limpiar busqueda") — matches the existing `admin.*` namespace convention from Phases 17-20.

### Decisions (Phase 20-04 execution, 2026-05-08)

- **Synthetic UI-only tab value, not a DB status.** Adding `"other"` to `AdminAutomationStatus` would have lied about what the DB CHECK constraint allows. Keeping the union strictly real-DB-statuses preserves type safety for anything that touches `automations.status` directly; the new `"other"` lives only in `AdminAutomationTab` (the type that drives the UI strip + URL state). Reusable for any future "group these N statuses under one tab" admin pattern.
- **Reuse existing per-row status badges.** Each row inside the catch-all keeps its real underlying status badge (Draft / Pending review) via the already-existing `statusBadges.draft` and `statusBadges.pending_review` keys. The user sees a clean "Other (N)" tab BUT each row still tells them which exact pre-operational state it's in. No new badge keys.
- **Single early-return guard inside `.map`** instead of `ADMIN_AUTOMATION_TABS.filter(...).map(...)`. Preserves React key alignment, doesn't duplicate the array, matches the component's existing style. The guard is one load-bearing line: `if (tab === "other" && counts.other === 0) return null;`.
- **`coerceTab` required NO edit.** It was already data-driven via `(ADMIN_AUTOMATION_TABS as readonly string[]).includes(raw)`. Adding `"other"` to the array made `?status=other` a valid landing URL automatically. Small but clean architectural payoff of data-driven design.
- **Filter chain refactor was minimal.** Dropped the inline `.eq("status", filters.tab)` from the chain, branched it as `query = query.eq(...)` or `query = query.in(...)`, then continued via `query = query.is(...).eq(...).eq(...)`. Equivalent SQL output for non-other tabs; correct SQL for `tab === "other"`. Filter ordering preserved verbatim.
- **`translations.other` required, not optional.** The page always passes it; making it optional would invite regressions where a future locale forgets to populate it. Required is the safer default for a strict EN/ES parity project.
- **i18n strings stay accent-free in Spanish** ("Otros", "borrador", "revision", "automatizacion") — matches the existing `admin.*` namespace convention from Phases 17-20.

### Decisions (Phase 20-03 execution, 2026-05-07)

- **Shared `doTransition` primitive over four copy-pasted actions.** Single race-guard + revalidatePath + notification fan-out site; four thin wrappers (activateAutomation, pauseAutomation, resumeAutomation, archiveAutomation) provide the from/to/notification-copy specifics. Easier to evolve. Reusable for any future state-machine admin action where 2..N transitions share the same scaffolding (Phase 21 client suspend/reactivate, Phase 22 admin-driven status flips).
- **`notifyOrgMembers` helper duplicated from `admin-requests.ts` (~30 LOC), not imported.** Per CONTEXT.md guidance: each action module owns its own helper so per-domain copy / notification type / link rules can evolve independently. The duplication cost is small and stable.
- **Notification copy pre-rendered English on the server**, mirroring Phase 19 approve/reject. Switching to keyed messages requires a notification i18n layer; deferred to v1.3 per CONTEXT.md. All four transition titles + messages match CONTEXT.md verbatim (see SUMMARY notification-copy table).
- **Notification `link` is `/dashboard/automations` for ALL four transitions** — gives the customer a single click to see the affected automation in their list. Per CONTEXT.md.
- **Archive is the only transition with a confirmation modal.** Activate / pause / resume are direct-click. Friction-only-where-it-matters principle (irreversible-from-customer-side warrants confirmation; reversible state flips do not). Per AUTM-04.
- **All four actions accept the same `TransitionAutomationInput` shape** (uuid + expectedStatus enum: in_setup|active|paused). Zod accepts any of the three values; each action then enforces its specific allowed-from list at the body layer (e.g. `activateAutomation` rejects expectedStatus='paused' as `invalid_input`). Belt-and-braces.
- **Defense-in-depth race guard at two layers.** App-level pre-flight `SELECT id, name, organization_id, status` + status check + SQL-level `.eq('id', automationId).eq('status', expectedStatus)` on UPDATE. Two concurrent staff clicks: first wins; second's pre-flight catches state change OR (rare interleaving) UPDATE matches zero rows. Either way the second client gets `state_changed` and `router.refresh()`.
- **`expectedStatus` narrowing via runtime guard + type assertion in page.tsx.** `transitionableStatuses` tuple `as const`; page does `(transitionableStatuses as readonly string[]).includes(detail.status as string)` then asserts to the union. Simple, no intermediate switch, lint-clean.
- **`ArchiveAutomationModal` owns its trigger button inside the component.** Same pattern as `RejectRequestModal`; cleaner prop API than children-as-trigger. Reusable for any "trigger + modal" admin action requiring confirmation.
- **Customer-side propagation relies on `revalidatePath` + best-effort notification fan-out**, NOT a Supabase Realtime subscription on `automations`. Same posture as Phase 19. CONTEXT.md amended "Propagation pattern" section. If UAT reveals stale UI on the customer side after a status flip, a Realtime channel can be added later.
- **Status badge palette already covers all 7 DB statuses (Plan 20-02).** This plan adds active transitions for the operational subset {in_setup, active, paused} only. Header for archived/draft/pending_review/failed renders the badge but with empty actions slot — `{actions && (...)}` in `AdminAutomationDetail` (Plan 20-02) gracefully collapses an empty wrapper.
- **No `audit_log` or persistence of who-flipped-status-when** — explicitly deferred per CONTEXT.md.
- **No RLS changes.** Phase 17's admin policies on `automations` and `notifications` already cover this work end-to-end.
- **Customer-side query unchanged.** Phase 09's `.not("status", "eq", "archived")` on `/dashboard/automations` already filters archived from the default customer view; revalidate-on-archive refreshes the list correctly.

### Decisions (Phase 20-02 execution, 2026-05-07)

- **Defensive singleEmbed() normalization for both !inner AND !left UNIQUE-FK embeds.** Even though FK + UNIQUE constraints make automations→organizations and automations→automation_templates 1-to-1, Supabase JS PostgREST sometimes returns single-row embeds as T (single object) and sometimes as T[] (length 0..1). Phase 20-01's SUMMARY explicitly flagged this as a 20-02 concern; the detail fetcher applies the normalizer from day 1. Helper is internal to automation-queries.ts; copy-don't-export when Phase 21 needs the same defense for clients↔owner.
- **Two round trips for the detail query, not three.** Pulled ALL executions (`.order(started_at, desc)`) instead of separate aggregate + slice queries. KPIs (total, successful, success rate) and the last-20 timeline both derive from the same rowset. Acceptable at v1.2 volume; revisit only if a single automation crosses ~10k executions.
- **Hours saved formula mirrors Phase 8 dashboard exactly.** `round((successfulExecutions × template.avg_minutes_per_task) / 60, 1 decimal)`. avg_minutes_per_task may be NULL → coerced to 0 so the multiplication is safe; row shows 0.0h, which is correct given we have no time-savings signal otherwise. Reuse pattern for Phase 22 admin home aggregate "hours saved across all orgs" KPI.
- **lastRunAt prefers automations.last_run_at column with execution-most-recent as fallback.** Defends against writer-process lag (column never written, e.g. test seed data) — the most recent execution's started_at is the next-best signal.
- **Setup notes section renders ONLY when value is non-empty after .trim().** Avoids an empty purple card for any seed automation whose setup_notes is the empty string or whitespace-only. CONTEXT.md prescribed inline (not collapsible).
- **Actions ReactNode slot only renders when truthy.** `{actions && (<div>{actions}</div>)}` — passing actions={null} from the page (this plan) yields a header with no flex wrap container, no empty whitespace. Plan 20-03 will swap null for the four contextual transition buttons; the layout container is already in place. Same pattern as Phase 19-03 admin-request-detail; reuse for Phase 21 (client account actions) and Phase 22 (admin home contextual actions).
- **Status badge palette covers all 7 real DB statuses.** Unlike the list view (which tabs only the 5 main ones), the detail page might receive an automation in `draft` or `pending_review` and must render a sensible badge. Palette: active=green, in_setup=blue, paused=amber, failed=red, archived=gray, draft=gray, pending_review=purple. Fallback to draft palette for any unknown future status string.
- **Monthly price formatted as USD currency with 2 decimals via Intl.NumberFormat.** Schema stores cents (Phase 18-03 convention); detail divides by 100 and formats. Locale-aware separators on free.
- **Custom-automation empty state copy in template card.** When template_id is null, show 'Custom automation' heading + 'This automation was set up without a catalog template.' body — operator-friendly explanation rather than a NULL/dash. Reusable copy pattern.
- **All four new files are server components.** No `"use client"` directive anywhere; Intl.RelativeTimeFormat / Intl.NumberFormat run on the server during render. Zero hydration cost. The actions slot is the only seam where a client subtree could enter (Plan 20-03 will pass client transition buttons through it).
- **Translation-string wins; slug is the fallback for templateDisplayName.** `translations[0]?.value ?? slug ?? null`. Cheap defense against any future row-level translation deletion.

### Decisions (Phase 20-01 execution, 2026-05-07)

- **Tab values map 1:1 to real DB status values for automations.** Unlike Phase 19 Requests (where 7 DB statuses fold into 3 UI tabs via `TAB_TO_STATUSES`), automations expose 5 tabs that exactly equal 5 of the 7 real statuses (`active` / `in_setup` / `paused` / `failed` / `archived`). The URL `?status=` value, the SQL `.eq('status', ...)` filter, and the i18n key all share the same string. Eliminates an indirection layer at the cost of nothing — `draft` and `pending_review` are intentionally not tabbed (CONTEXT.md "Claude's Discretion") because automations rarely sit in those states. Pattern is more readable; reuse for Phase 21 Clients Admin if its tabs map 1:1 to real statuses.
- **Per-row aggregate counts via second bucketed query, not per-row aggregate.** `fetchAdminAutomations` issues one main rowset query, then ONE more `.in('automation_id', ids)` against `automation_executions` and buckets in JS keyed by `automation_id`. N-aggregate alternative explodes round trips for any list view; Postgres aggregate alternative forces awkward Supabase JS typings. Battle-tested at Phase 18 (`automations` count per template) and now here; established pattern for any "list rows + per-row count from a child table" admin surface.
- **Filter chain ordering matters and is now battle-tested twice.** `.eq(status).is(deleted_at,null).eq(translations.locale).eq(translations.field)` THEN optional filters THEN `.order(...)`. Mirrors `request-queries.ts` verbatim. Mixing this order has caused embedded-filter bugs in older postgrest-js. Worth re-asserting for Phase 20-02 + 20-03.
- **URL-state sync via render-time setState comparison, not useEffect.** First draft used `useEffect(() => setLocal(params))` to honor external URL changes (e.g., when the tabs component resets the search params). The project's `react-hooks/set-state-in-effect` ESLint rule rejected it (cascading-renders). Refactored to the React-docs "storing information from previous renders" pattern: derive `urlSig` during render, store `lastSyncedSig` in useState, call setState in render only when they diverge. Same external behavior, zero cascading renders. Pattern reusable for ANY client component that needs to honor external URL/prop changes without `useEffect(() => setState(prop))`.
- **`ilike` search escapes `%` and `_` in user input** so a search like `100%` doesn't blow into a wildcard. Reuse for any future free-text search filter (Phase 20-02 detail-page comments search? Phase 21 client search?).
- **Customer-side `/dashboard/automations` was intentionally NOT modified.** Archived rows are already filtered out in `web/src/lib/dashboard/queries.ts` via `.not("status","eq","archived")` per Phase 09. CONTEXT.md's "Archived: filtered out of customer view" was already satisfied; this plan only touches the admin surface.
- **No `Create automation` button** on this list. Operators don't create automations from the global view — they create via the approve-request flow (Phase 19) or via Phase 20-02 detail page actions. Surface stays focused on triage + drill-down.
- **Embed-shape gotcha noted for plan 20-02.** Supabase JS embed shapes for `!inner` joins on UNIQUE-FK relations sometimes return as `T` (single object) and sometimes as `T[]`. Plan 20-02 detail page joining `automations -> automation_templates !left -> translations !left -> automation_executions` will need the defensive `Array.isArray(x) ? x[0] ?? null : x ?? null` normalizer that Phase 19-01 established for `subscriptions`. Bake into the detail query from day 1.

### Decisions (Phase 19-03 execution, 2026-05-07)

- **Approve flow ordering is INSERT-then-UPDATE.** Failure modes inverted: an orphan in_setup automation with a still-pending request is recoverable via Phase 20 (operator archives the orphan). The opposite ordering (UPDATE first) would leave the customer seeing "approved" with no actual automation row — silently lying about work being underway. INSERT first, UPDATE second is the safer asymmetric failure mode.
- **Double race guard for concurrent staff approvals.** A pre-flight `SELECT status='pending'` plus a second `.eq('status','pending')` clause on the UPDATE statement at the SQL layer ensures concurrent staff cannot both succeed. The first staff to UPDATE wins; the second sees the request as no-longer-pending on their pre-flight (or matches zero rows on UPDATE) and returns the typed `state_changed` error to the client, which alerts and refreshes.
- **Best-effort notification fan-out, not transactional.** Helper `notifyOrgMembers` swallows errors and logs warnings; never propagates to caller. CONTEXT.md explicit: notification failures must NOT block approve/reject. The customer's in-app notification is best-effort messaging, not a contract — the source of truth is the request + automation rows.
- **Notification copy is pre-rendered English strings on the server.** Mirrors how Phase 8 dashboard notifications render `notifications.title` / `notifications.message` verbatim. Switching to keyed messages requires a notification i18n layer; deferred to v1.3.
- **REJECT_REASON_MIN=10, MAX=500 enforced AFTER trim** via Zod `transform(s=>s.trim()).pipe(min(10).max(500))`. Catches whitespace-padding tricks and "x"/"no" non-reasons while still permitting short-but-coherent phrases like "Falta info" / "Duplicado" per CONTEXT.md's "intentional friction" guidance. Constants are exported from the schema file so the client modal mirrors server limits (Confirm stays disabled until the server would accept).
- **Action slot via `actions: ReactNode` prop, not `children`.** Lets the server layout decide WHERE the slot renders (inside the request card, after the body, under a top border, only when status='pending') while still allowing client-component children to live inside the otherwise-server tree. Cleaner than a fragment with conditional siblings.
- **Field-error extraction for reject.** The Zod transform-then-pipe shape returns issues at `path: ["reason"]`. The action extracts the issue's message code (`reason_too_short` / `reason_too_long`) and forwards as a typed `fieldError` so the modal shows the right localized message without parsing Zod error envelopes on the client.
- **Server-action skeleton + notification fan-out helper are reusable** for Phase 20+ admin status transitions. The pattern `assertPlatformStaff -> Zod parse -> pre-flight SELECT -> mutation with second SQL guard -> revalidatePath admin + customer paths` is now battle-tested twice (Phase 18 toggles, this plan's approve/reject); Phase 20 transitions (in_setup -> active, active <-> paused, archive) clone it verbatim. `notifyOrgMembers(supabase, organizationId, type, title, message, link)` is the right shape for any "tell the customer their X changed state" event.

### Decisions (Phase 19-02 execution, 2026-05-07)

- **Tabs are client; table is server.** The 5-column table has no client state — every row's interactive surface is a `<Link>` which works fine in a server component. Only the active-tab decision needs `useRouter`/`useSearchParams`/`usePathname`, so only that strip pays the client-bundle cost. Pattern reusable for any URL-state-driven filter on top of an otherwise-static admin table.
- **Default-tab canonicalization on Pending click.** When the user clicks Pending we `searchParams.delete("status")` instead of `set("status","pending")`. Refresh on Pending stays bare (`/admin/requests`); refresh on Approved keeps `?status=approved`. Shareable URLs are minimal and the canonical default never accumulates a redundant query string.
- **`t.raw()` for `{count}` tab labels.** The placeholder is left unresolved server-side; the client substitutes it from live counts at render time. Reading via `t("tabs.pending", { count })` would freeze the value at request-time and skip the substitution layer, which would break any future client-side action that mutates counts without a full server round-trip.
- **`coerceStatus()` silently falls back to pending.** A user fat-fingering `?status=garbage` lands silently on Pending. No 404, no error toast — the canonical default is the right landing for any unknown value. Validation: `(VALID_STATUSES as string[]).includes(raw)`.
- **Status badges use amber/green/red** (CONTEXT.md "Claude's Discretion"). Amber on Pending reads as "waiting" more clearly than blue, and the green/red pair on Approved/Rejected matches universal terminal-state semantics.
- **`admin.placeholders.requests` preserved deliberately.** Removing those keys now would risk a half-translated state for any environment that hadn't pulled this commit. Plan 19-03 (which fully replaces the last placeholder consumer with the detail page) is the right place for that cleanup.
- **Translation-prop pattern reused verbatim from Phase 18.** Server resolves `t('foo')` and `t.raw('templateString')` into a plain object, then forwards it as a `translations` prop to a client subtree. No `useTranslations()` in the client tree. Established pattern across catalog admin and now requests admin; Phase 20+ will keep cloning it.

### Decisions (Phase 19-01 execution, 2026-05-07)

- **`automations.setup_notes` is plain nullable TEXT.** No CHECK, no default. NULL is the correct sentinel for automations not created via the approve-request flow; populated only when the operator approves a request and we copy `automation_requests.description` (the customer's custom_requirements text) onto the new row. Migration `20260508000001_automations_setup_notes.sql` uses `ADD COLUMN IF NOT EXISTS` for re-run safety.
- **`resultingAutomationId` is derived per-call, not persisted as a column.** `fetchAdminRequestDetail` matches `(organization_id, template_id, created_at >= request.created_at)` and takes the earliest hit. Avoids a schema migration; deterministic at v1.2 volume; if collisions ever surface in v1.3 we add a foreign key. Pattern: derive ephemeral relations on the read path before paying for a column.
- **Single-query tab counts, bucketed client-side.** `fetchAdminRequestStatusCounts` issues ONE `select id, status` for the three statuses we surface, then buckets in JS — three separate count queries would burn three RTTs. Same trick is reusable for any small fixed-cardinality status counter (Phase 20 automations admin tabs, Phase 22 home dashboard).
- **All admin query functions throw on auth failure.** Mirrors `fetchAdminCatalogTemplates`. The admin layout (Phase 17-03) gates the route, so reaching these without staff is a programmer error — not user input. A `Result` union here would push dead code into every caller.
- **Defensive `subscription` embed-shape normalization.** Although `subscriptions.UNIQUE(organization_id)` makes it 1-to-1, Supabase JS's PostgREST resolver sometimes returns single-row LEFT embeds as `T | null` and sometimes as `T[]`. `fetchAdminRequestDetail` accepts both via `Array.isArray(detail.subscription) ? detail.subscription[0] ?? null : detail.subscription ?? null`. Reusable defense for any future `!left` embed on a UNIQUE-FK relation (Phase 20 automations -> latest execution, Phase 21 clients -> primary owner).
- **Admin shared types live in `web/src/lib/admin/types.ts`.** Future admin features (Phase 20 automations admin, Phase 21 clients admin) extend this single file rather than each shipping their own; query files import from it. Keeps the AdminX type surface discoverable.

### Decisions (Phase 18-03 execution, 2026-05-06)

- **Pricing input layer is USD, schema layer is cents.** The form's price fields accept dollars with `step=0.01` and `inputMode=decimal`; submit calls `dollarsToCents` to round to integer cents; edit pre-fills via `centsToDollarString` so the operator sees what they typed (or close to it). Zod only ever validates cents, so server-side validation matches what gets persisted. Pattern reusable for any future price-input form (Phase 19+).
- **Custom RHF resolver instead of `zodResolver`.** `zodResolver` from `@hookform/resolvers/zod` expects 1:1 form-to-schema mapping; this form has different shapes (USD strings, blank-as-null numerics, snake_case price field rename). The custom resolver runs `formToZodInput` first, then `safeParse`, then maps `setup_price` -> `setup_price_dollars` and `monthly_price` -> `monthly_price_dollars` paths back onto form fields. Pattern reusable when form values diverge from schema values.
- **Schema selection inside the resolver, not via prop swap.** The resolver reads `is_active` from values on each invocation and picks `adminCatalogTemplateActiveSchema` vs `adminCatalogTemplateBaseSchema` accordingly. After `is_active` toggles, an effect calls `form.trigger()` (only when the form has been submitted at least once) so existing errors update without remounting. Cheaper than swapping resolvers via props.
- **Slug auto-gen on EN-name keystroke + sticky manual-edit flag.** A `slugManuallyEdited` ref starts `false` on create / `true` on edit. As long as the user has not typed in the slug field directly, name_en changes auto-rewrite the slug via NFKD-normalize-and-strip-accents slugify (capped at 100 chars). On edit pages the ref starts `true` so the slug is treated as immutable; the input is also visually disabled with a lock icon.
- **Slug input disabled (not hidden) on edit pages.** Communicates the lock-after-creation constraint without removing the value from view. CONTEXT.md prescribed lock-after-creation; this is the visual treatment.
- **Connected apps as multi-select with datalist, NOT chips.** Industries are a fixed 6-element enum and chip-toggle scales fine; connected_apps grows over time so chip-toggle would explode. Multi-select with chips-as-selected and a datalist of 12 common suggestions (Slack, HubSpot, Salesforce, Zapier, Notion, Airtable, Stripe, Google Workspace, WhatsApp, Mailchimp, Zoho, Pipedrive) is the planner's prescribed shape — and free-text additions via Enter remain possible.
- **Industries chips reuse the customer catalog visual pattern** (border-purple when selected). Operators flipping between admin and customer catalog see the same toggle pattern.
- **Atomic create with best-effort rollback.** Supabase JS does not expose transactions across multiple `.from(...)` calls. Strategy: INSERT template -> INSERT 8 translations -> on translation failure DELETE the template. If both fail, log the orphan templateId for manual cleanup. In practice the only way both fail is the DB going offline mid-write.
- **Update path uses UPSERT on `(template_id, locale, field)` instead of DELETE + INSERT.** Idempotent re-saves; partial saves don't clear other locales' rows. The PK on the table makes the UPSERT a single round trip.
- **Legacy text columns kept and synced to EN.** `automation_templates.{name, description, typical_impact_text, activity_metric_label}` written with EN translation values on every create/update so any unmigrated reader still sees sane strings. Drop only when no consumer remains.
- **Active toggle as HTML checkbox, not a Switch.** shadcn/ui in this project does not ship a Switch primitive (only Button, Card, Form, Input, Label). A checkbox + label hint communicates draft-vs-active at zero new-component cost.
- **Spanish translations stay accent-free** ("Informacion basica", "Categorizacion", "Categoria", "Metricas", "Traducciones"). Matches existing es.json convention.
- **Form pattern with conditional refinement for draft mode** (base schema = always-required structural; superRefine = activation gates) is reusable for any future "save as draft / publish" workflow (Phase 19 request templates, Phase 22 marketing campaigns).

### Decisions (Phase 18-02 execution, 2026-05-06)

- **Toggle translations packaged together** — `deactivateModal` is nested under `translations.toggle` rather than living as a sibling. The table/grid components forward a single `toggle` prop into `CatalogToggleCell`. The original PLAN sketch placed `deactivateModal` as a sibling and failed type-check; nesting it under `toggle` is the cleaner shape and is now the canonical layout for any future toggle-with-modal cell.
- **Search filters by name OR slug** (admin-specific). Customer-facing search-by-name is unchanged. Admin operators routinely need to find a template by its slug when debugging URLs (e.g., the customer reported a 404 on `/dashboard/catalog/audience-segmentation`).
- **View toggle defaults to `table`.** URL only carries `?view=grid` when explicitly chosen, so a refresh on default-table is a no-op and a refresh after switching to grid stays on grid. Operators get table density by default; grid is opt-in.
- **Warn-modal is purely client-side.** Server action accepts the deactivation either direction. CONTEXT.md prescribed warn-but-allow over hard-block; if a determined attacker bypasses the warning the only consequence is that the template is deactivated, which is the action they asked for. Server-side enforcement adds zero security and would just make the action less reusable.
- **Two queries instead of one with a count subquery.** `fetchAdminCatalogTemplates` issues a templates SELECT + an automations SELECT and reduces the latter into a Map keyed by `template_id`. Simple, readable, well under 50ms in practice. Single-query alternatives with a Postgres count aggregate forced awkward Supabase typings.
- **Inactive rows still render their toggle** so an operator can flip them back on. Opacity-60 is the only visual cue. Hiding inactive rows behind a separate tab would break the muscle memory of "find any template, click switch".
- **Pricing-tier badge tones** — gray (starter) / purple-50 (pro) / purple-100 (business). Subtle escalation reused from Phase 11's billing card; no new design tokens.
- **Server-action skeleton established for the rest of v1.2:** `createAdminServerClient -> assertPlatformStaff -> Zod parse -> Supabase mutation -> revalidatePath(admin) + revalidatePath(customer)`. Phase 19/20/21 server actions will clone this shape verbatim.
- **Translation-prop pattern established:** server resolves `t('foo')` and `t.raw('templateString')` into a plain object, then passes the object as `translations` to a `'use client'` component. No `useTranslations()` in the client tree. Keeps the client component framework-agnostic and easy to test.

### Decisions (Phase 18-01 execution, 2026-05-06)

- **Two-source backfill (migration + seed)** — the migration's DO block backfills against the existing 66 templates in prod, and seed.sql gains a 528-INSERT block before COMMIT for local resets (where migrations run before seed and the DO block noops). Both paths are idempotent via `INSERT ... SELECT ... ON CONFLICT DO NOTHING`.
- **Locale-aware embed JOIN** — customer queries pass `locale` to `fetchCatalogTemplates(locale)` and `fetchTemplateBySlug(slug, locale)`, then embed-join `automation_template_translations` filtered by `translations.locale` and (for the list query) `translations.field='name'`. One round trip per page; resolved display strings come back in a single rowset.
- **Keep messages/templates JSON namespace untouched** — backfill seeded the table from those values, no other consumer was identified, and removing keys from a shipped i18n bundle has its own risks. Cleanup deferred until callers are inventoried.
- **Defensive null fallbacks in the query layer** — `displayName` falls back to `slug`; the detail query returns `null` if no translation rows are returned. Cheap safety net for any admin DELETE that orphans translations later.
- **Auto-fixed pre-existing slug corruption** — `seed.sql` shipped two corrupted slugs (`'a0dience-segmentation'` -> `'audience-segmentation'`, `'a0to-response-email'` -> `'auto-response-email'`) that were already user-visible at the URL level. Fixed inline as Rule 1 (Bug). Remaining `a0` typos in `features[]` / `use_cases[]` logged in `.planning/phases/18-catalog-admin/deferred-items.md`.

### Decisions (Phase 17-03 execution, 2026-05-05)

- **Admin badge color is orange (`bg-orange-500`)** — high-contrast against the dark gray-900 sidebar and the white-text login page; consistent across mobile top bar, sidebar header, login page, and AdminHeader subtitle area, so the visual cue never disappears regardless of viewport.
- **Sidebar palette intentionally distinct from customer DashboardNav** — gray-900 background, gray-300 inactive text, orange-500/15 + orange-300 active states. Customer side uses white card + purple accents. A staff member who toggles to /admin sees an obviously different UI in <500ms.
- **AdminHeader hidden on mobile (`lg:flex`)** — the mobile sidebar bar already shows the logo + ADMIN badge inline; a duplicate header would waste vertical space.
- **Active sidebar state matches both exact path AND prefix** — Home uses `exact: true` so it does not stay highlighted under sub-routes; sub-pages match prefix so e.g. `/admin/catalog/[id]` keeps the Catalog item active.
- **Spanish strings drop accents** (Catalogo, Cerrar sesion, Contrasena, Solicitudes...) — matches existing es.json convention; keeps Mexican-neutral phrasing.
- **Server actions return English error strings; client localizes via `localizeError()` switch** — cheaper than refactoring `signInStaff` to return discriminated codes; revisit if more callers need the same strings.
- **Inline retrofit of `/admin/login` + `AdminLoginForm` to consume `admin.*` keys in 17-03** — avoided a half-translated state where some Phase 17 pages used i18n keys and the entry point did not. I18N-01 is now actually satisfied for the entire phase.
- **Convention established for Phase 18-22 pages:** `(admin)/admin/<section>/page.tsx` for shell-wrapped pages; `(admin-auth)/admin/login` already lives outside the shell. Future bare/fullscreen admin pages should use a new `(admin-bare)` route group rather than fight the layout.

### Decisions (Phase 17-02 execution, 2026-05-05)

- **Two-cookie session scheme** — customer (`sb-*`) and admin (`sb-admin-*`) sessions coexist in the same browser via Supabase `cookieOptions.name`. Pattern matches Stripe / Supabase / Vercel where you can be logged into multiple workspaces simultaneously.
- **Two `getUser()` calls per request** (customer + admin in parallel) — extra ~30ms of network IO traded for correctness. A single Supabase client cannot read two cookie scopes in one pass; `Promise.all` keeps it parallel.
- **`/admin/*` branch wins over customer logic** — path is checked first; customer auth gates do not run for admin paths. Keeps the two flows from interfering when a customer accidentally hits `/admin` or vice versa.
- **Non-staff who land in admin scope are SIGNED OUT before bouncing** — defense in depth: prevents a stale admin cookie sitting in a removed staff member's browser.
- **`signInStaff` server action double-checks platform_staff after Supabase auth** — second query and explicit signOut on failure, so an RLS regression on `platform_staff_select_self` cannot leak admin sessions to non-staff.
- **No Google OAuth on /admin/login** — staff are seeded by SQL/migration only in v1.2 (per CONTEXT.md). Email/password keeps the surface area minimal.
- **/admin/login uses hardcoded English (no next-intl yet)** — admin i18n keys are 17-03's job. Cross-plan dependency on a non-existent namespace is avoided.
- **`(admin-auth)` route group for /admin/login** — kept outside the future `(admin)` shell from 17-03 so it has no sidebar, no header, no auth-gate-component.
- **Staff-on-/dashboard cross-redirect** — when `customerUser` (sb-* scope) is in `platform_staff`, middleware redirects them to `/admin`. Catches the case where a staff member signs into the customer login by accident.

### Decisions (Phase 17 execution, 2026-05-05)

- **Helper functions are SECURITY DEFINER + STABLE + `SET search_path = ''`** — callers without RLS access to `platform_staff` can still check membership; STABLE lets the planner hoist the call out of per-row evaluation; empty search_path prevents schema-hijack attacks.
- **Admin RLS is additive, not replacing** — 38 new admin policies coexist with existing org-scoped client policies; Postgres OR-combines policies for the same command. Clients keep their access exactly as before.
- **Mutable tables use 4 separate policies (SELECT/INSERT/UPDATE/DELETE)** rather than `FOR ALL` — clearer audit trail, easier to revoke a single verb later.
- **Immutable tables get SELECT only for admins too** — `automation_executions` and `chat_messages` retain their no-INSERT/UPDATE/DELETE-for-authenticated-users posture even for staff. Soft-delete is a deferred option if a real need arises.
- **`chat_messages_insert_clients` preserved untouched** — admin chat sends in the future would use service_role (consistent with existing architecture); this surfaces as a flag for Phase 19.
- **First super_admin seeded inside the migration itself** — idempotent + safe-no-op via `DO $$` block with `RAISE NOTICE` fallback; the moment `pdmckinster@gmail.com` signs up, re-running the migration promotes them.

### Decisions (v1.2 questioning gate, 2026-05-04)

- **Operations-first sequencing** — admin before Stripe. Without admin, the team cannot fulfill orders that Stripe would create. v1.1 shipped customer side; v1.2 ships team side; v1.3 wires Stripe.
- **Admin lives at `/admin/*`** — same Next.js app, role-gated route. No subdomain, no separate repo.
- **`platform_staff` table** — new table with FK to `auth.users`, separate from `organization_members` (which scopes per-org client roles). Bypasses org-scope via RLS `EXISTS (SELECT 1 FROM platform_staff WHERE user_id = auth.uid())`.
- **Two staff roles from day one** — `super_admin | operator` in schema; UI for staff invitation deferred until needed.
- **Visual: same layout, different banner** — reuse customer sidebar/header/components, add "AIDEAS Admin" banner or title. NO redesign of shadcn theme.
- **Bilingual EN/ES** — strict parity, follows project rule.
- **Seed-vs-prod cleanup deferred** — decide at v1.3 deploy time, not now.
- **Carry-over from v1.1 lands first** — Next.js 16 build blocker, AutomationSuccessRate placeholder, assertOrgMembership consolidation, symmetric reCAPTCHA bypass — bundled as Phase 16 to unblock CI before admin work begins.
- **Single-step approval** — approving a request flips it to `approved` AND creates the automation row in `in_setup` in one transaction.
- **Reject requires reason** — non-empty rejection reason enforced via form validation, persisted in request notes.
- **Automation admin detail is read-only** — no field editing in admin; only status transitions via dedicated buttons (in_setup→active, active↔paused, active|paused→archived).

### Roadmap (defined 2026-05-04)

| Phase | Name | Plans | Reqs |
|-------|------|-------|------|
| 16 | Carry-over Cleanup | 3 | CARRY-01..04 |
| 17 | Admin Foundation | 3 | FOUND-01..05, I18N-01 |
| 18 | Catalog Admin | 3 | CTLG-01..05, I18N-01 |
| 19 | Requests Inbox | 3 | REQS-01..04, I18N-01 |
| 20 | Automations Admin | 3 | AUTM-01..05, I18N-01 |
| 21 | Clients Admin | 3 | CLNT-01..05, I18N-01 |
| 22 | Admin Home | 2 | HOME-01..03, I18N-01 |

Coverage: 31/31 v1.2 requirements mapped. I18N-01 cross-cuts every UI-bearing phase.

### Blockers/Concerns

- v1.1 build blocker: `next/dynamic ssr:false` in `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16` breaks `npm run build` under Next.js 16 + Turbopack. Targeted by Phase 16 (CARRY-01) so CI is green before Phase 17 begins.
- Pre-existing `a0` typos in `seed.sql` `features[]` / `use_cases[]` and a few `automation_requests` body strings (~25 occurrences). Customer-visible only as faint copy issues (catalog list does not render `features` / `use_cases`). Logged in `.planning/phases/18-catalog-admin/deferred-items.md` for a separate cleanup commit.

### Pending Todos

- **Phase 21 COMPLETE** on `feature/phase-21-clients-admin` branch. 3/3 plans shipped (21-01 + 21-02 + 21-03). All 6 v1.2 Phase 21 requirements satisfied (CLNT-01..05 + I18N-01). Phase 21 verifier is the next runner; once VERIFICATION.md status is `passed` the branch should be merged to `main`.
- **Phase 22 (Admin Home) is the next phase.** Likely surfaces "X new notes this week" as an activity-feed item — that work should add an `admin.home.*` namespace with its own keys, NOT extend `admin.clients.detail.notes.*`.
- **Migrations `20260509000001_organization_notes.sql` (21-01) and `20260509000002_admin_org_members_view.sql` (21-02) must be applied to the dev DB** before testing the detail page — without 21-02's `get_admin_org_members` RPC the Members tab throws at runtime. Notes CRUD (21-03) writes against `organization_notes` (21-01); both migrations are required for full smoke testing. `supabase db push` from the project root applies all unapplied migrations.
- **Phase 19 still awaiting human UAT** (separate from Phase 21 work). Migration `20260508000001_automations_setup_notes.sql` from 19-01 must be applied on the dev DB before approve/reject UAT.
- **Phase 20 awaits human UAT** (5 transitions × EN + ES locale; race-condition smoke; customer-side notification appears under /dashboard/notifications; archived row disappears from customer's /dashboard/automations active filter). Recommended UAT items captured in 20-03-SUMMARY.md.
- **Phase 21 awaits human UAT** (notes create/edit/cancel/delete-confirm/delete cycle in EN + ES; empty-body Save disabled; 5000+ char counter turns red; non-staff RLS rejection). Recommended UAT items captured in 21-03-SUMMARY.md "User Setup Required" section.
- **Phases 19, 20, 21 ready to merge to main** once human UAT passes (each individually).
- **Cross-phase dead links accepted per CONTEXT.md:** "Open automation →" from Phase 19 approved-status detail resolves to a live page (20-02). "View client profile →" goes to /admin/clients/[orgId] — list AND detail pages now live (21-01 + 21-02 + 21-03 close the chain).
- **Pre-existing build environment issue:** `npm run build` fails locally due to Google Fonts TLS error (unrelated to any phase code). Logged in `.planning/phases/21-clients-admin/deferred-items.md`. Recommended fix: `experimental.turbopackUseSystemTlsCerts: true` in `next.config.ts` or self-host font assets.

## Session Continuity

**Last session:** 2026-05-14T15:07:32.422Z
**Stopped at:** Completed 24-01-PLAN.md (Phase 24 retroactive verification: CARRY-01..04 satisfied, REQUIREMENTS.md reconciled to 31/31)
**Next action:** Phase 22 plan 22-01 shipped on branch `feature/phase-22-admin-home`. Next runner is `/gsd:execute-phase 22-admin-home` to ship plan 22-02 (activity feed + quick-link cards) on top of the new KPI grid. Phase 21 verifier still pending — once Phase 21 VERIFICATION.md status is `passed` the branch `feature/phase-21-clients-admin` should be merged to `main`.

2026-05-12 — Phase 22 plan 22-01 shipped: /admin placeholder replaced with real 2x2 KPI grid (Pending requests / Automations in setup / Active clients / Signups this week). fetchAdminHomeKpis() runs 4 parallel HEAD-only count: 'exact' queries via Promise.all; gated by assertPlatformStaff (defense-in-depth on top of layout guard). pendingRequests reuses TAB_TO_STATUSES.pending so the home counter matches /admin/requests Pending tab exactly. signupsThisWeek uses a rolling 7-day window (JS-computed ISO cutoff, DB-agnostic). Both client-related cards (activeClients + signupsThisWeek) link to /admin/clients with no extra params; the list page default `created_at DESC` surfaces recent signups at the top naturally. AdminHomeKpiCards is server-friendly (no use client) — receives a labels prop object so the parent page owns getTranslations. Neutral gray icon backgrounds (no urgency colors). 6 new admin.home.* leaf keys per locale (title + subtitle + 4 KPI labels). admin.placeholders.home block removed from both en.json and es.json. HOME-01 (KPI section) + I18N-01 (this slice) satisfied. tsc + scoped lint exit 0. 2 files created, 4 modified, 2 atomic commits, 3 minutes.

2026-05-08 — Phase 21 plan 21-03 shipped: AdminClientNotesTab swapped from read-only to full create/edit/delete editor. AdminClientNoteCreate (collapsed "Add note" button -> textarea + Save/Cancel + live char counter); AdminClientNoteEntry (per-existing-note three-state machine: view / edit / confirm-delete with inline red panel, NOT a portal Dialog). 3 server actions (createNote / updateNote / deleteNote) gated by assertPlatformStaff with revalidatePath('/admin/clients/[id]'). 3 Zod schemas with NOTE_MIN=1 + NOTE_MAX=5000 transform-then-pipe shape catches whitespace-only input. 24 new admin.clients.detail.notes.editor.* leaf keys per locale + comingSoon dead key removed (full EN/ES parity, accent-free Spanish). CLNT-05 + I18N-01 (this slice) satisfied. Phase 21 closes all 6 v1.2 requirements (CLNT-01..05 + I18N-01). tsc + scoped lint + i18n parity exit 0. 4 files created, 4 modified, 3 atomic commits, 5 minutes.

2026-05-08 — Phase 21 plan 21-02 shipped: /admin/clients/[id] 360 detail page live with persistent header (org name + 5-cell stat grid: Slug / Created / Members / Active automations / Pending requests) + 4 read-only tabs (Automations -> Requests -> Members -> Notes). Synthetic ?tab= URL state, default tab drops the param. Automations/Requests rows link to /admin/automations/[id] and /admin/requests/[id] respectively; Members tab read-only with translated owner role; Notes tab read-only with whitespace-pre-wrap body + (edited) chip + Plan-21-03 comingSoon footer. New SECURITY-DEFINER RPC get_admin_org_members surfaces auth.users.last_sign_in_at across schemas with inline is_platform_staff gate. fetchAdminClientDetail issues 8 parallel queries (1 org + 4 listings + 3 HEAD counts). 47 new admin.clients.detail.* leaf keys per locale (full EN/ES parity, members.roles.owner explicitly required). CLNT-03 + CLNT-04 + I18N-01 (this slice) satisfied. tsc + scoped lint exit 0; i18n parity confirmed. 8 files created, 4 modified, 6 atomic commits, 15 minutes.

2026-05-08 — Phase 21 plan 21-01 shipped: /admin/clients placeholder replaced with real cross-org list (5 columns: Name link, Slug mono, # Active automations right-aligned, # Members right-aligned, Created date) + 300ms ILIKE-debounced ?q= search on (name OR slug) + ?page= pager (25/page, hidden when totalPages <= 1). organization_notes table shipped with 4 admin-only RLS policies + 2 indexes + updated_at trigger — foundation for Plan 21-03 notes CRUD. fetchAdminClients(filters) gated by assertPlatformStaff, two-round-trip strategy. 15 new admin.clients.list.* leaf keys per locale (EN/ES parity). admin.placeholders.clients removed. CLNT-01 + CLNT-02 + I18N-01 (this slice) satisfied. tsc + scoped lint exit 0. 6 files created, 4 modified, 3 atomic commits, 5 minutes.

2026-05-08 — Phase 20 plan 20-04 shipped: AUTM-01 strict-ROADMAP-wording gap closed via conditional 'Other' / 'Otros' catch-all tab in /admin/automations surfacing draft + pending_review rows under a single counter when count > 0 (hidden when count === 0). 'other' threaded through AdminAutomationTab union, ADMIN_AUTOMATION_TABS array, fetchAdminAutomations (.in branch), fetchAdminAutomationStatusCounts (6th HEAD count), page tabsTranslations + empty-union, AdminAutomationsTabs prop type + early-return guard. 2 new i18n leaf keys per locale (875 total). REQUIREMENTS.md AUTM-01 flipped to [x] + Traceability row to Complete. 6 atomic commits in 6 minutes.

2026-05-07 — Phase 20 plan 20-03 shipped: /admin/automations/[id] header now renders contextual 0..2 transition buttons (in_setup -> Activate; active -> Pause + Archive; paused -> Resume + Archive). 4 server actions (activate/pause/resume/archive) gated by assertPlatformStaff with two-layer race guard + best-effort customer notification fan-out + revalidate admin + customer paths. Archive opens a confirmation modal; the other three are direct-click. 16 new admin.automations.detail.actions/archiveModal i18n keys per locale (873 total). AUTM-02 + AUTM-03 + AUTM-04 + I18N-01 (this slice) satisfied. Phase 20 complete: AUTM-01..05 + I18N-01.

2026-05-07 — Phase 20 plan 20-02 shipped: /admin/automations/[id] real read-only detail surface (header + status badge + reserved actions slot, 4-card KPI grid, last-20 execution timeline, org card + template card + setup_notes). 31 new admin.automations.detail.* leaf keys per locale (857 total). AUTM-05 + I18N-01 (this slice) satisfied. fetchAdminAutomationDetail in automation-queries.ts; defensive singleEmbed normalization; two round trips. All 4 new files server-rendered. tsc + scoped lint exit 0; npm run build emits both /admin/automations and /admin/automations/[id] as dynamic.

2026-05-07 — Phase 20 plan 20-01 shipped: /admin/automations real cross-org list (5 status tabs + 3 combinable filters + 6-column table + full EN/ES i18n). placeholder removed. AUTM-01 + I18N-01 (this slice) satisfied. tsc + scoped lint exit 0; npm run build emits /admin/automations as dynamic.

2026-05-07 — Phase 19 hotfix: expanded admin requests inbox from 3 to 7 statuses via 3-tab grouping (pending tab now also shows in_review/payment_pending/payment_failed; approved tab also shows completed). Approve/Reject still locked to status='pending' exactly.
