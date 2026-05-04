# Phase 16: Carry-over Cleanup - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve the 4 v1.1 audit tech-debt items so the build is green and helpers are consolidated before admin work begins. Each item has root cause and location already identified in `milestones/v1.1-MILESTONE-AUDIT.md`. NO new tech-debt items, NO scope expansion to other dashboard or auth surfaces — strictly the 4 carry-over fixes.

</domain>

<decisions>
## Implementation Decisions

### CARRY-01 — Build fix: `next/dynamic({ ssr: false })` rejection

- **Pattern:** Eliminate the leftover `next/dynamic({ ssr: false })` wrapper from `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16`. The `WeeklyBarChart` component is ALREADY a `"use client"` component (locked decision from Phase 09-03 STATE log). Importing it directly works under Next.js 15+ — client islands inside RSC don't require the `dynamic` wrapper.
- **Scope:** Only fix `WeeklyBarChart` consumer. Do NOT touch `ReportsWeeklyChart` (the `reports-weekly-chart-loader.tsx` already exists per git status; if it doesn't break the build, it stays as-is).
- **Architecture rationale:** Page stays Server Component (RSC). Server-by-default + client islands is the canonical Next.js 16 pattern, and the project already established this convention in v1.1.
- **Verification:** `npm run build` passes cleanly under Next.js 16 + Turbopack with zero errors AND zero `ssr: false` rejection. Manual smoke test of `/dashboard/automations/[id]` in browser — confirm chart renders, KPIs display, execution timeline displays, status action buttons work.

### CARRY-02 — `<AutomationSuccessRate trend="+5%" />` placeholder

- **Strategy:** Show success rate WITHOUT trend. Don't compute a real trend (Phase 15-01 explicitly locked this OUT-OF-SCOPE — no reliable historical data); don't remove the card (success rate is genuinely useful info for the customer).
- **Refactor scope:** Eliminate the `trend` prop AND all trend-related logic from the `AutomationSuccessRate` component. Not opt-out, not optional — full removal. Honors the project rule: "Don't design for hypothetical future requirements" + "Dead code is worse than no code". If trend computation is reintroduced in v1.5+, it gets built fresh with the right approach, not by reactivating a stale prop.
- **Layout:** Center the remaining content (success rate big number + caption) vertically inside the card. Trivial CSS change (Tailwind `justify-center` / `items-center`). DO NOT change card height — would desbalance the KPI grid in `dashboard/page.tsx`.
- **Verification:** Grep upfront for all `AutomationSuccessRate` consumers BEFORE planning, so the plan can declare every file it touches. Project is small; grep is instant; no excuse to discover consumers during execution.

### CARRY-03 — `assertOrgMembership` consolidation in `settings.ts`

- **Scope:** Only `saveCompanyName` and `saveHourlyCost` server actions in `web/src/lib/actions/settings.ts`. Audit-defined boundary; do NOT expand opportunistically to other actions in the file or the project.
- **Helper status:** VERIFIED — `assertOrgMembership` (lives at `web/src/lib/auth/assert-org-membership.ts`) signature ALREADY supports the "validate with cookie client → write with admin client" pattern that `settings.ts` needs. The helper takes `(supabase, orgId, allowedRoles?)` and returns `{ error: string } | null`. Same exact pattern that `updateAutomationStatus` already uses successfully. ZERO modifications to the helper required.
- **Roles to pass:** `["owner", "admin"]` — matches the inline check currently in `settings.ts` (which excludes operator and viewer from settings writes, by design from Phase 12-01).
- **Refactor mechanics:** In each action, replace the inline `organization_members` query block with `const denied = await assertOrgMembership(supabase, orgId, ["owner", "admin"]); if (denied) return denied;`. The `getAdminClient()` write that follows stays untouched.
- **Verification:** `npm run build` passes. Manual smoke test of Settings page — owner/admin user can save company name and hourly cost; viewer/operator user gets typed error.

### CARRY-04 — reCAPTCHA symmetric client bypass

- **Policy:** Dev-only bypass. Production NEVER bypasses captcha — if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is missing in production deploy, signup hard-fails (intentional security-by-default). Local/dev: bypass when key is missing so developers can test signup flow without configuring reCAPTCHA.
- **Why dev-only and NOT symmetric with server:** Server bypass exists for operational ergonomics (env var sync edge cases on Railway). Replicating that in client would open attack surface in production — silent captcha bypass means weeks of spam before discovery. CLAUDE.md security rule "validate at system boundaries" applies: client-side captcha IS a boundary, relaxing it in prod violates the rule.
- **Environment detection:** `process.env.NODE_ENV !== 'production'`. Standard Next.js pattern; injected automatically at build time; impossible to leak to production (Vercel always builds with `NODE_ENV=production`). No new env var to onboard.
- **Implementation location:** Directly in `web/src/components/auth/signup-form.tsx` at the existing `if (!executeRecaptcha)` check (lines ~46-54). Single consumer; no admin form has captcha (admin is role-gated). NO new abstraction (no helper file, no provider wrapper) — premature for one consumer.
- **Bypass token:** Empty string `""`. Server's `verifyRecaptcha("")` already handles this gracefully when `RECAPTCHA_SECRET_KEY` is missing (skips verification, returns true with a console.warn). Acts as defense-in-depth: if client bypass ever leaked to production accidentally, server would still attempt verification with the empty token and Google would reject it.
- **Verification:** Manual smoke test in dev — `npm run dev` without `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set in `.env.local`, complete signup form end-to-end, confirm user lands on `/verify-email`. Closes `.planning/debug/resolved/verification-failed-signup.md` for real (not just by configuration workaround).

### Claude's Discretion

- **Order of execution within Phase 16** — items are independent; planner picks the order that makes commits cleanest. CARRY-01 likely first (unblocks `npm run build` for downstream verifications) but not strictly required.
- **Plan splitting** — roadmapper sketched 3 plans. Final split (3 plans bundling related items, vs. 4 plans one-per-CARRY, vs. 2 plans by file-touch overlap) is the planner's call based on commit-atomicity.
- **Layout micro-details for CARRY-02** — exact Tailwind classes for the centering, whether to add `gap-y-*` or `space-y-*`, etc. Standard component-style decisions.
- **Logging in CARRY-03** — whether to add a `console.error` log around the `assertOrgMembership` call in settings.ts to match the pattern in `updateAutomationStatus`. Probably yes for consistency, but planner can decide.
- **Whether to write the warning console.log when CARRY-04 bypass triggers in dev** — could be silent (cleaner console) or warn ("⚠️ reCAPTCHA bypass — dev mode, key missing"). Planner picks.

</decisions>

<specifics>
## Specific Ideas

- **The audit document is the source of truth for what's broken**: `.planning/milestones/v1.1-MILESTONE-AUDIT.md` lists exact file:line locations and root causes. Planner should re-read it before decomposing tasks to avoid re-discovery work.
- **Phase 09-03 decision is locked**: `WeeklyBarChart is "use client" + next/dynamic ssr:false required` — this comment in STATE was correct AT THE TIME (Next.js 15) but is now obsolete under Next.js 16. The fix is removing the `dynamic` wrapper, not changing the component.
- **Phase 12-01 decision is locked**: `serviceRole for org writes — organizations table has no authenticated UPDATE policy; saveCompanyName and saveHourlyCost use getAdminClient() pattern from auth.ts`. The CARRY-03 refactor preserves this pattern; it only consolidates the membership check, NOT the write mechanism.
- **Test the bypass leak path on CARRY-04**: in dev verification, also confirm that running `NODE_ENV=production npm run build && npm start` (or equivalent prod simulation) WITHOUT keys in env results in signup hard-failing — proves the bypass is NOT leaking to prod-mode runtime.

</specifics>

<deferred>
## Deferred Ideas

- **Audit log of admin actions** — mentioned during questioning gate as v1.3+ (HARD-01); not in CARRY-03 scope even though it would be natural to add when consolidating helpers.
- **Symmetric refactor across all settings.ts actions** — opportunistic cleanup of EVERY action in settings.ts to use `assertOrgMembership` was explicitly rejected as scope creep. Future "settings hardening" phase if it ever feels worthwhile.
- **Symmetric refactor across all server actions in the project** — same as above; out of scope, not blocking anything.
- **Real trend computation for `AutomationSuccessRate`** — explicitly OUT-OF-SCOPE per Phase 15-01 lock. Reintroduce in a future v1.5+ phase only with reliable historical data and a proper period-over-period calculation.
- **Reusable `getRecaptchaToken()` helper or provider wrapper** — premature for one consumer; revisit if/when admin or other forms add captcha.

</deferred>

---

*Phase: 16-carry-over-cleanup*
*Context gathered: 2026-05-04*
