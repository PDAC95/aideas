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
last_updated: "2026-05-07T20:15:56Z"
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 20
  completed_plans: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-04 after v1.2 milestone start)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single bilingual dashboard — paired with an operations team who can fulfill what they request.
**Current focus:** v1.2 Admin Dashboard — Phase 17/18/19/20 complete (Phase 19 + 20 awaiting human UAT). Phase 21 (Clients Admin) is next.

## Current Position

Phase: Phase 20 — Automations Admin — COMPLETE (3/3 plans).
Plan: 20-03 complete. /admin/automations/[id] header now renders contextual 0..2 transition buttons by status: in_setup -> green Activate; active -> amber Pause + outline-red Archive; paused -> green Resume + outline-red Archive; archived/draft/pending_review/failed -> no buttons. Activate/Pause/Resume are direct-click; Archive opens a confirmation modal. All four server actions (activateAutomation, pauseAutomation, resumeAutomation, archiveAutomation) gated by assertPlatformStaff, race-guarded at app + SQL layer, fan out best-effort customer notifications with CONTEXT.md-verbatim copy, revalidate admin + customer paths. 16 new admin.automations.detail.actions/archiveModal i18n keys per locale (873 total leaf keys, full EN/ES parity).
Status: Phase 20 SHIPS AUTM-02 + AUTM-03 + AUTM-04 + I18N-01 (this slice). Combined with 20-01 (AUTM-01) and 20-02 (AUTM-05), all 5 Phase 20 requirements are now satisfied. Two new client component files (automation-transition-buttons.tsx, archive-automation-modal.tsx); two new lib files (validations/admin-automation.ts, actions/admin-automations.ts). Page update at (admin)/admin/automations/[id]/page.tsx wires actions through the AdminAutomationDetail actions ReactNode slot. tsc + scoped lint exit 0; npm run build exits 0 emitting both /admin/automations and /admin/automations/[id] as dynamic.
Last activity: 2026-05-07 — Plan 20-03 executed (3 tasks, 7 files; Zod schema + 4 server actions + 2 client components + page update + i18n). Phase 20 is now ready for human UAT and merge to main. Phase 21 (Clients Admin) is unblocked.

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 (target) |
|--------|------|------|---------------|
| Phases | 6 | 9 | 7 |
| Plans | 16 | 28 | ~20 |
| Requirements | 54/54 | 38/38 | 31 (planned) |
| Timeline | 70 days | 21 days | TBD |

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

## Accumulated Context

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

- **Phase 19 still awaiting human UAT** (separate from Phase 20 work). Migration `20260508000001_automations_setup_notes.sql` from 19-01 must be applied on the dev DB before approve/reject UAT.
- **Phase 20 awaits human UAT** (5 transitions × EN + ES locale; race-condition smoke; customer-side notification appears under /dashboard/notifications; archived row disappears from customer's /dashboard/automations active filter). Recommended UAT items captured in 20-03-SUMMARY.md.
- **Phase 20 ready to merge to main** once human UAT passes. After merge, Phase 21 (Clients Admin) starts on a new feature branch.
- **Cross-phase dead links accepted per CONTEXT.md:** "Open automation →" from Phase 19 approved-status detail now resolves to a live page (20-02 shipped). "View client profile →" goes to /admin/clients/[orgId] (still dead until Phase 21).

## Session Continuity

**Last session:** 2026-05-07T20:18:51.060Z
**Stopped at:** Completed 20-03-PLAN.md
**Next action:** Phase 20 is complete (5/5 requirements + I18N-01). Run human UAT against the 5 transitions × EN + ES locale on `feature/phase-20-automations-admin`, then merge the branch to `main` per the project's branching strategy. Phase 21 (Clients Admin) starts next on a fresh feature branch — patterns from Phase 20 (cross-org list with URL-state tabs/filters, read-only detail page with actions ReactNode slot, shared transition primitive with race guard + notification fan-out) all transfer directly.

2026-05-07 — Phase 20 plan 20-03 shipped: /admin/automations/[id] header now renders contextual 0..2 transition buttons (in_setup -> Activate; active -> Pause + Archive; paused -> Resume + Archive). 4 server actions (activate/pause/resume/archive) gated by assertPlatformStaff with two-layer race guard + best-effort customer notification fan-out + revalidate admin + customer paths. Archive opens a confirmation modal; the other three are direct-click. 16 new admin.automations.detail.actions/archiveModal i18n keys per locale (873 total). AUTM-02 + AUTM-03 + AUTM-04 + I18N-01 (this slice) satisfied. Phase 20 complete: AUTM-01..05 + I18N-01.

2026-05-07 — Phase 20 plan 20-02 shipped: /admin/automations/[id] real read-only detail surface (header + status badge + reserved actions slot, 4-card KPI grid, last-20 execution timeline, org card + template card + setup_notes). 31 new admin.automations.detail.* leaf keys per locale (857 total). AUTM-05 + I18N-01 (this slice) satisfied. fetchAdminAutomationDetail in automation-queries.ts; defensive singleEmbed normalization; two round trips. All 4 new files server-rendered. tsc + scoped lint exit 0; npm run build emits both /admin/automations and /admin/automations/[id] as dynamic.

2026-05-07 — Phase 20 plan 20-01 shipped: /admin/automations real cross-org list (5 status tabs + 3 combinable filters + 6-column table + full EN/ES i18n). placeholder removed. AUTM-01 + I18N-01 (this slice) satisfied. tsc + scoped lint exit 0; npm run build emits /admin/automations as dynamic.

2026-05-07 — Phase 19 hotfix: expanded admin requests inbox from 3 to 7 statuses via 3-tab grouping (pending tab now also shows in_review/payment_pending/payment_failed; approved tab also shows completed). Approve/Reject still locked to status='pending' exactly.
