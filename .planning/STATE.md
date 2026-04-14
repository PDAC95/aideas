---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-14T12:53:44.690Z"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 12
  completed_plans: 11
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single dashboard that proves the value of their AIDEAS subscription
**Current focus:** Phase 7 — Schema & Seed Data

## Current Position

Phase: 9 of 12 (My Automations) — In Progress
Plan: 3 of 5 in current phase (09-01, 09-02, 09-03 complete)
Status: In Progress
Last activity: 2026-04-14 — Completed 09-03: Recharts WeeklyBarChart and ExecutionTimeline visualization components (82d82c9)

Progress: [██████████░░░░░░░░░░] 52% (12/21 plans — v1.0 complete, v1.1 Phase 07 done, Phase 08 done, Phase 09 3/5 done)

## Accumulated Context

### Decisions

Key v1.1 decisions (see PROJECT.md for full log):
- **Stripe OUT OF SCOPE for v1.1** — all payment UI uses mock/seed data; Stripe wired in v1.2 (STRP-01–STRP-06 deferred)
- **Data flow: Hybrid C** — reads via Supabase Server Components, writes via FastAPI, Settings writes direct to Supabase (no business logic)
- **Schema changes are ALTERs** — v1.0 already created tables; v1.1 adds columns and expands CHECK constraints
- **I18N-01 applies across all frontend phases** — EN/ES translation keys tracked from Phase 8 through Phase 12
- **Mock billing data** — payment history from seed data in v1.1; Stripe API in v1.2

Phase 07-01 decisions (2026-04-10):
- **Prices as integer cents** — setup_price/monthly_price stored as integer cents (Stripe standard: 9900 = $99.00), not decimals
- **is_featured = true for "Mas populares"** — NOT a new category value; featured flag handles this UI concept
- **in_setup status on automations** — represents automation during onboarding/setup phase after payment
- **payment_pending/payment_failed on automation_requests** — tracks Stripe checkout session lifecycle

Phase 07-02 decisions (2026-04-10):
- **TRUNCATE CASCADE for seed idempotency** — clean-slate replaces ON CONFLICT pattern in seed.sql
- **i18n keys in DB TEXT columns** — templates store keys like `templates.lead_followup_email.name` for bilingual catalog display (phases 8, 10)
- **12 featured templates** — `is_featured=true` distributed across all 8 categories for Top Picks UI section
- **pricing_tier mapping** — starter=simple 1-day, pro=medium 2-3 day, business=complex/AI 5-day templates

Phase 08-02 decisions (2026-04-10):
- **Pre-compute enriched executions in parent page** — formatTimeAgo cannot be passed as function prop across RSC boundaries (not serializable); parent page computes timeAgo strings and passes enriched array to ActivityFeed
- **Automation names rendered directly** — seed stores human-readable names (e.g., "Acme Customer Support Chatbot"), not i18n keys; confirmed from seed.sql
- **Template substitution for i18n count strings** — format with sentinel "99" then replace with "{count}" for runtime substitution pattern

Phase 08-03 decisions (2026-04-10):
- **Notifications fetched once in layout.tsx** — DashboardHeader takes props (not self-fetching) to avoid duplicate DB queries for desktop + mobile
- **Radix Popover via portal** — ensures correct z-index stacking above sidebar (z-50)
- **Bell placement: DashboardHeader (desktop hidden on mobile) + nav mobile header** — single server fetch, two consumers

Phase 08-01 decisions (2026-04-10):
- **Executions query uses .in() not nested .eq()** — fetching automations first then scoping executions by `orgAutomationIds` avoids unreliable PostgREST nested relation filtering
- **daily_execution_count mutated onto automation objects** — avoids extra round-trip; computed from last-24h executions query after initial fetch
- **hoursSavedThisMonth rounded to 1 decimal** — `Math.round(minutes/60 * 10)/10` for clean display

Phase 07-03 decisions (2026-04-10):
- **Growth curve via separate INSERT blocks per time period** — clearer and tunable vs. single calculated generate_series
- **Paused automation has partial execution history** — lead-nurture stops at day 40, explaining why it's paused
- **hourly_cost=25 as integer dollars** — not Stripe cents; human-entered rate for Phase 11 ROI estimates
- **in_setup automation has zero executions** — invoice-processing never activated yet, accurate demo state

Phase 08-05 decisions (2026-04-13):
- **NotificationBell replaces static mobile notification div** — mobile users can now open popover and mark notifications read
- **Mobile CTA button in greeting row** — purple Link to /dashboard/catalog visible at all viewports; compact label on mobile, full text on sm+

Phase 09-01 decisions (2026-04-14):
- **monthly_execution_count computed from success-only executions since month start** — mutated onto automation objects, mirrors daily_execution_count pattern from 08-01
- **STATUS_ORDER map sorts active/in_setup/paused alphabetically within groups** — stable sort for automations list page
- **groupByWeek uses day-offset buckets (0-7 = W4 = most recent)** — predictable 4-bucket chart labels for detail page
- **hoursSaved = monthlyMetricCount * avg_minutes_per_task / 60 rounded to 1 decimal** — consistent with 08-01 KPI pattern

Phase 09-03 decisions (2026-04-14):
- **WeeklyBarChart is "use client" + next/dynamic ssr:false required** — Recharts requires browser APIs; JSDoc documents requirement for Plan 04 consumer
- **ExecutionTimeline is pure display component (no use client)** — parent RSC pre-computes timeAgo and durationLabel strings (extends 08-02 pattern)
- **Purple-500 (#a855f7) bar fill** — matches existing dashboard accent theme
- [Phase 09-02]: AutomationsFilterTabs uses router.push for tab navigation to keep URL-driven state while staying on same page context
- [Phase 09-02]: AutomationCard receives locale from server for Intl.NumberFormat to avoid hydration mismatches

### Pending Todos

- Run `npx supabase db reset` when Docker Desktop is running to confirm full migration stack + seed apply cleanly (prerequisite before Phase 08).

### Blockers/Concerns

- Phase 7 (schema migration) is a hard prerequisite for all v1.1 frontend phases — must complete first
- `automation_templates.category` CHECK constraint expansion requires careful ALTER ordering (drop old, add new)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix password reset email link redirecting to root instead of reset-password page | 2026-04-01 | 984780a | [1-fix-password-reset-email-link-redirectin](./quick/1-fix-password-reset-email-link-redirectin/) |
| 2 | Fix password reset link showing expired (PKCE cookie in browser context) | 2026-04-02 | ed19bfc | [2-fix-password-reset-link-showing-expired-](./quick/2-fix-password-reset-link-showing-expired-/) |
| 3 | Replace main page with full AIDEAS branded landing page (React conversion from HTML/jQuery) | 2026-04-07 | c30b119 | [3-replace-main-page-with-landing-page-and-](./quick/3-replace-main-page-with-landing-page-and-/) |
| 4 | Redesign dashboard UI with purple accent, KPI trends, gradient top automation card, success rate, performance metrics, status-icon activity feed | 2026-04-10 | 41cdcec | [4-redesign-dashboard-ui-based-on-reference](./quick/4-redesign-dashboard-ui-based-on-reference/) |

## Session Continuity

Last session: 2026-04-14
Stopped at: Completed 09-03-PLAN.md — visualization components (WeeklyBarChart + ExecutionTimeline).
Resume file: None
