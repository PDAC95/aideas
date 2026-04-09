# Pitfalls Research

**Domain:** Adding Stripe + Dashboard + Notifications to existing Next.js + FastAPI + Supabase app
**Researched:** 2026-04-09
**Confidence:** HIGH (most pitfalls verified via official Stripe/Supabase docs and community post-mortems)

---

## Critical Pitfalls

### Pitfall 1: Stripe Webhook Raw Body Consumed Before Verification

**What goes wrong:**
Stripe signature verification fails silently or throws a 400 on every webhook. The endpoint looks correct but all events are rejected. In production this means payment events (checkout.session.completed, subscription.updated) are never processed — automations never activate.

**Why it happens:**
Next.js App Router (and FastAPI middleware) often parses the request body as JSON before the handler runs. Stripe's `constructEvent` computes the signature over the *raw* byte string. Once the body is parsed and re-serialized, the bytes differ and the HMAC check fails.

**How to avoid:**
- **FastAPI:** Read the raw body via `await request.body()` *before* any JSON parsing. Do not use `request.json()` or a Pydantic model parameter for the webhook route — use `Request` directly.
- **Next.js (if webhooks go through it):** Use `await req.text()`, not `await req.json()` or `request.body()`. The App Router's `request.text()` returns the untouched buffer.
- Add `export const config = { api: { bodyParser: false } }` if using Pages Router; with App Router this is automatic when using `req.text()`.
- Verify the `stripe-signature` header is present before calling `stripe.webhooks.constructEvent`.

**Warning signs:**
- "Webhook signature verification failed" error on every request, even with valid test events.
- Events work in Stripe CLI local forwarding but fail after deployment to Railway.
- Logs show 400 from the webhook endpoint immediately after Stripe sends the event.

**Phase to address:** Stripe Webhooks phase (before any business logic is wired up). Test with `stripe trigger checkout.session.completed` against the actual deployed endpoint before considering the feature complete.

---

### Pitfall 2: Stripe CLI Webhook Secret vs. Dashboard Webhook Secret

**What goes wrong:**
Developer tests locally with `stripe listen --forward-to localhost:8000/webhooks/stripe`. It works. After deploying, all webhooks fail with signature errors because the production endpoint uses the CLI's ephemeral `whsec_` secret, not the Dashboard-registered secret.

**Why it happens:**
The Stripe CLI generates its own signing secret for local forwarding — it is not the same as the secret on the Dashboard webhook endpoint. They are always different values. Developers copy the CLI secret into their `.env` and then forget to swap it for the real Dashboard secret in production env vars.

**How to avoid:**
- Store two environment variables: `STRIPE_WEBHOOK_SECRET_LOCAL` (CLI) and `STRIPE_WEBHOOK_SECRET` (Dashboard).
- Production (`Railway`) always uses `STRIPE_WEBHOOK_SECRET`. Local dev uses `STRIPE_WEBHOOK_SECRET_LOCAL`.
- Never commit either secret. Add both to `.env.example` with placeholder values.
- Confirm the Dashboard webhook endpoint URL matches the Railway API URL, not localhost.

**Warning signs:**
- Local webhook tests pass; production webhook tests fail.
- `stripe trigger` works; real payment events fail.
- Environment variable named `STRIPE_WEBHOOK_SECRET` contains a value starting with `whsec_` that was copied from CLI output.

**Phase to address:** Stripe Webhooks phase. Include a deployment checklist item: "Verify `STRIPE_WEBHOOK_SECRET` on Railway matches the Dashboard endpoint secret."

---

### Pitfall 3: Webhook Handler Processes Events Non-Idempotently

**What goes wrong:**
Stripe delivers webhooks at-least-once. Network blips cause Stripe to retry the same event. The handler runs twice: the subscription is activated twice, the automation count is incremented twice, the welcome notification is inserted twice. Data is corrupt.

**Why it happens:**
Handlers are written for the happy path — receive event, update database, done. The retry case is an afterthought. The `findOne → create` pattern is not atomic and creates a TOCTOU (time-of-check to time-of-use) race condition.

**How to avoid:**
- Record the Stripe event ID (`evt_xxx`) in a `stripe_events` table with a UNIQUE constraint on `stripe_event_id`.
- At the start of every handler: `INSERT INTO stripe_events (stripe_event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`. If no row returned, the event was already processed — return 200 immediately.
- For subscription state changes, use upsert (`INSERT ... ON CONFLICT (stripe_subscription_id) DO UPDATE`) rather than insert + conditional update.
- For critical state (subscription activation), wrap the event record insert and the business update in a single database transaction.

**Warning signs:**
- Duplicate notifications in the UI for the same billing event.
- `subscriptions` table has two rows with the same `stripe_subscription_id`.
- Customer reports being charged correctly but automation shows "pending" (event processed once but second retry failed after first created a duplicate constraint violation).

**Phase to address:** Stripe Webhooks phase. The `stripe_events` deduplication table should be created in the same migration as the webhook handler.

---

### Pitfall 4: ALTER TABLE on Existing Tables Locks Rows or Breaks RLS

**What goes wrong:**
`ALTER TABLE automations ADD COLUMN config JSONB NOT NULL DEFAULT '{}'` runs fine on an empty dev database. On a production database with existing rows, adding a NOT NULL column without a default can fail. Adding a CHECK constraint without `NOT VALID` locks the table while Postgres validates all existing rows. Adding columns to tables that have RLS SELECT policies can silently return wrong results if policies reference columns that don't exist yet.

**Why it happens:**
v1.0 shipped with 11 tables and complete RLS. v1.1 adds columns (config, pricing_tier, stripe_price_id, etc.) to existing tables. Developers run migrations against their empty local DB without issues, then are surprised when deployed migrations behave differently against real data.

**How to avoid:**
- For new NOT NULL columns on existing tables: always supply a `DEFAULT` value or use a two-step migration (add nullable column, backfill, add NOT NULL constraint).
- For new CHECK or FOREIGN KEY constraints: use `ADD CONSTRAINT ... NOT VALID` then `VALIDATE CONSTRAINT` separately (splits locking).
- Test migrations against a Supabase branch or a local DB seeded with representative data, not an empty schema.
- When adding columns referenced in RLS policies, add the column in migration N, add the policy in migration N+1 (never in the same file).
- New columns on tables with RLS: confirm existing policies still pass `EXPLAIN` after the schema change — a policy referencing `org_id` on a column that moved to a JOIN can cause a full table scan.

**Warning signs:**
- Migration succeeds locally but times out on Railway seed execution.
- Supabase Dashboard shows migration as applied but queries return empty arrays for authenticated users.
- `pg_locks` shows long-held locks during deployment.

**Phase to address:** Schema Migration phase (first phase of v1.1). Run all ALTERs before any business logic or seeding.

---

### Pitfall 5: RLS Policy Missing on New Tables or Columns Added in Migration

**What goes wrong:**
A new table (`stripe_events`, `automation_configs`) is created in a migration without enabling RLS. The Supabase anon key can read all rows from the browser. Or: a new column on an existing table leaks sensitive data (e.g., `stripe_customer_id`) because the SELECT policy returns all columns and the column was not considered during policy design.

**Why it happens:**
RLS is off by default in Postgres. Supabase's Table Editor enables it automatically, but SQL migrations do not. Developers add tables via migration scripts and forget the `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY` line. Policy audits are not part of the migration review process.

**How to avoid:**
- Every `CREATE TABLE` in a migration must be immediately followed by `ALTER TABLE [name] ENABLE ROW LEVEL SECURITY` and at least one policy.
- For internal/admin tables that users should never access directly (like `stripe_events`), add a deny-all policy: `CREATE POLICY "no_access" ON stripe_events FOR ALL USING (false)`.
- Add a CI check or migration linter: any migration that creates a table must contain `ENABLE ROW LEVEL SECURITY`.
- Never use the service role key in frontend code — if RLS is misconfigured, this bypasses it entirely and the misconfiguration goes undetected.

**Warning signs:**
- Supabase Dashboard Security Advisor shows "RLS Disabled" warning on a table.
- Browser network tab shows raw Stripe customer IDs or internal IDs in API responses.
- Anonymous (unauthenticated) requests return data from tables that should require login.

**Phase to address:** Schema Migration phase. Audit every table for RLS status before any frontend code consumes data.

---

### Pitfall 6: Chart Components Trigger "document is not defined" SSR Error

**What goes wrong:**
Recharts, Chart.js, and similar libraries use browser-only DOM APIs. Importing them in a Server Component (or a Client Component that isn't properly deferred) causes a build error or runtime crash: `ReferenceError: document is not defined` or `TypeError: Super expression must either be null or a function`.

**Why it happens:**
Next.js App Router renders Server Components on the server by default. Chart libraries call `window`, `document`, or `ResizeObserver` during module initialization — before any `useEffect`. Adding `'use client'` is necessary but not always sufficient if the parent Server Component imports the chart directly without dynamic import.

**How to avoid:**
- Every chart component must have `'use client'` as its first line.
- In the parent Server Component, use `dynamic(() => import('./WeeklyChart'), { ssr: false })` — this is the belt-and-suspenders approach.
- Keep data fetching in the Server Component; pass serialized data (plain objects, not class instances) as props to the Client Component chart.
- Pattern: `DashboardPage` (Server) fetches data → passes `chartData: ChartPoint[]` as props → `WeeklyChart` (Client, `ssr: false`) renders.
- shadcn/ui's `<Chart>` wrapper handles this correctly when used as documented — don't bypass it.

**Warning signs:**
- Build succeeds but page crashes on first render in production.
- Error boundary triggers on the chart section only.
- `next dev` works but `next build && next start` fails.

**Phase to address:** Reports phase and Dashboard Home phase (anywhere charts appear). Establish the Server→Client data handoff pattern in the first chart implementation and reuse it.

---

### Pitfall 7: Notification Unread Count Desynchronizes from Real-Time Events

**What goes wrong:**
The badge shows "3 unread" but clicking the dropdown shows 5 notifications. Or: marking all as read clears the badge but a new notification arrives via Supabase Realtime and the count jumps back without a re-fetch — sometimes to the wrong number because the local state update and the Realtime event race.

**Why it happens:**
Unread count is tracked in two places: a `useState` (or React Query cache) initialized from an initial fetch, and a Supabase Realtime subscription that fires INSERT events. If the component mounts and the initial fetch is in-flight when the first Realtime event arrives, the event is processed against stale state (count = 0), resulting in count = 1 even if 3 notifications exist.

**How to avoid:**
- Derive unread count from the notifications list, not a separate state variable. `const unreadCount = notifications.filter(n => !n.read_at).length`.
- Realtime events should call `refetch()` (React Query) or re-fetch the notifications list — not increment a counter.
- Use Supabase Realtime's channel subscription only for triggering re-fetches, not for maintaining derived state manually.
- If using React Query: subscribe to `INSERT` events on the `notifications` table with `filter: org_id=eq.${orgId}`, and on each event call `queryClient.invalidateQueries(['notifications', orgId])`.
- Mark-as-read should use an optimistic update (flip `read_at` locally) then confirm with the server response — don't wait for the Realtime event to reflect the mark-as-read.

**Warning signs:**
- Unread badge count differs from the actual count of unread items in the open dropdown.
- Badge resets to 0 then jumps back after marking all as read.
- Count increases by 2 when one notification arrives (double-counting from Realtime event + re-fetch).

**Phase to address:** Notifications phase. Establish the "Realtime triggers re-fetch, not counter increment" pattern before building the dropdown.

---

### Pitfall 8: Per-Automation Stripe Subscription Model Creates Unbounded Complexity

**What goes wrong:**
Modeling each automation as its own Stripe Subscription (one subscription per automation per customer) seems clean. In practice: a customer with 5 automations has 5 subscriptions, 5 subscription IDs to track, 5 webhook streams, 5 cancellation events to handle. Pause/resume means canceling and recreating subscriptions, which generates new IDs and breaks history. Billing summary page requires 5 separate API calls to Stripe or a complex aggregation query.

**Why it happens:**
The data model mirrors the product model too literally. "Each automation is a subscription" seems like a 1:1 mapping. The complexity of managing multiple subscriptions per customer is underestimated.

**How to avoid:**
- Model billing at the **org level**: one Stripe Customer per org, one Subscription per org with multiple line items (one per active automation using Stripe's `subscription_items`).
- Adding an automation = adding a `subscription_item` to the existing subscription.
- Pausing = setting `subscription_item.quantity = 0` or moving to a paused price, not canceling.
- The `automations` table stores `stripe_subscription_item_id` (not `stripe_subscription_id`).
- Invoices and payment history remain unified under one subscription — single Stripe Customer Portal session covers all automations.
- Store `stripe_customer_id`, `stripe_subscription_id` on `organizations`; store `stripe_subscription_item_id` on `automations`.

**Warning signs:**
- Database schema has `stripe_subscription_id` on the `automations` table as a 1:1 field.
- Billing summary page makes N Stripe API calls (one per automation).
- Canceling one automation triggers a Stripe subscription deletion event that your webhook handler treats as "customer churned."

**Phase to address:** Billing data model phase (before any Stripe integration code). This is a schema decision that is expensive to change after checkout flows are built.

---

### Pitfall 9: Seed Data Violates Foreign Key Order or Trips Existing RLS

**What goes wrong:**
Seeding 66+ templates plus demo org data fails mid-script because a template references an `industry_id` that hasn't been inserted yet. Or: the seed script runs as the `postgres` superuser (bypassing RLS) in development, but in CI or staging it runs as an authenticated user and RLS blocks inserts into tables where only the owning org can write.

**Why it happens:**
SQL seed files assume sequential execution and correct FK ordering, but large seed files get reorganized. RLS is designed for runtime user sessions, not seed scripts — seed scripts need to bypass RLS or run within a valid session.

**How to avoid:**
- Structure seed files top-down by dependency: `organizations` → `profiles` → `members` → `templates` → `automations` → `executions` → `notifications`.
- Use `SET session_replication_role = 'replica'` at the start of the seed script to temporarily disable FK constraint checking during bulk insert, then re-enable. Only safe in a controlled seed context.
- Alternatively: wrap the entire seed in a transaction and use `DEFERRABLE INITIALLY DEFERRED` constraints for FK checks.
- For RLS: seed scripts should use the Supabase service role client (bypasses RLS) or run via `supabase db seed` which uses the postgres role.
- Use `ON CONFLICT DO NOTHING` on all seed inserts so the script is re-runnable without errors.
- Test the seed script against a fresh Supabase local instance before each PR that modifies it.

**Warning signs:**
- Seed script fails with FK constraint violation midway through.
- Seed completes but some foreign key references point to wrong rows (IDs assumed sequential but are UUIDs).
- Seed works locally but fails in CI because CI uses a restricted database role.

**Phase to address:** Schema Migration phase (alongside the ALTER TABLE migrations). Seed data should be validated before any feature development depends on it.

---

### Pitfall 10: FastAPI Endpoint Missing Org Membership Authorization

**What goes wrong:**
A FastAPI endpoint validates the JWT (user is authenticated) but does not verify that the user is a member of the org they are requesting data for. A user can pass any `org_id` in the request body or URL path and access another organization's automations, billing data, or notifications.

**Why it happens:**
JWT validation is added as a dependency and confirms identity. Org membership check is a second, separate concern that is easy to forget when adding a new endpoint. In Supabase, RLS handles this at the DB layer for direct queries — but FastAPI endpoints that construct queries with the service role key bypass RLS entirely and must enforce membership in application code.

**How to avoid:**
- Create a FastAPI dependency: `async def verify_org_membership(org_id: UUID, current_user = Depends(get_current_user), db = Depends(get_db))` that checks `SELECT 1 FROM members WHERE org_id = $1 AND user_id = $2`. Raise `403` if not found.
- Apply this dependency to **every** endpoint that accepts an `org_id` parameter — make it impossible to add a new endpoint without passing through this check.
- Write a test that authenticates as User A and attempts to access User B's org — assert 403. Run this test for every new endpoint category.
- Alternatively: use a Supabase client initialized with the user's JWT (not service role) for DB queries — RLS then enforces membership automatically. Reserve service role for admin-only operations.

**Warning signs:**
- New endpoint added without a PR comment noting "org membership check included."
- FastAPI endpoint accepts `org_id` from request body (user-controlled) without membership verification.
- No test exists that asserts cross-org access returns 403.

**Phase to address:** Every FastAPI endpoint phase. Add the `verify_org_membership` dependency to the codebase in the first endpoint sprint and document it as mandatory.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode Stripe Price IDs in code | Faster initial setup | Price changes require redeployment; mismatch between test/live modes causes silent billing errors | Never — use environment variables |
| Use service role key for all Supabase queries in FastAPI | No need to thread user JWT through layers | Bypasses RLS; org isolation depends entirely on application code correctness | Only for admin/internal operations never triggered by end users |
| Skip idempotency on webhook handler | Simpler handler code | Duplicate subscription activations, double-charged users on Stripe retries | Never for payment events |
| Polling for notifications instead of Supabase Realtime | Simpler to implement, no WebSocket setup | 30-60s latency on notifications; unnecessary database load | Only as fallback if Realtime quota is exceeded |
| Single seed file with all 66+ templates inline | Easy to write initially | Merge conflicts on every template addition; re-seeding requires truncating all data | OK for v1.1; plan a template management UI for v1.2 |
| Per-automation Stripe subscription | Conceptually clean model | Unbounded webhook complexity, N API calls for billing summary, pause/resume = cancel+recreate | Never — use subscription items instead |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Webhooks | Using `request.json()` — body already parsed, signature check fails | `await request.body()` (FastAPI) or `await req.text()` (Next.js) for raw bytes |
| Stripe Webhooks | Using Stripe CLI secret in production | Separate env vars: `STRIPE_WEBHOOK_SECRET_LOCAL` (CLI) vs `STRIPE_WEBHOOK_SECRET` (Dashboard) |
| Stripe Customer Portal | Creating a new portal session on every page load | Cache the portal session URL for the duration of the user session (~1 min TTL) |
| Stripe Checkout | Not storing `checkout_session_id` before redirect | Store session ID before redirect; retrieve in success URL handler before calling `retrieve()` |
| Supabase Realtime | Subscribing in a component without cleanup | Always `supabase.removeChannel(channel)` in the `useEffect` cleanup function |
| Supabase Realtime | Expecting INSERT events to trigger for rows blocked by RLS | Realtime respects RLS — the listener user must have SELECT permission on the row being inserted |
| Supabase Migrations | Non-idempotent `CREATE POLICY` statements | Wrap in `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE ...) THEN ... END IF; END $$` |
| Vercel Deployment | Deployment Protection blocking Stripe webhook POST requests | Add the webhook route path to Vercel's "Bypassed Routes" for deployment protection |
| FastAPI + Supabase | Using service role key for user-scoped queries | Initialize a per-request Supabase client with the user's JWT; let RLS enforce access |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries in automation list | List page takes 2-5s; DB CPU spikes on page load | Eager-load executions and last-run stats in a single JOIN query | ~50 automations per org |
| Missing index on `notifications.org_id` | Notification dropdown slow; full table scan on every page load | Add `CREATE INDEX ON notifications (org_id, created_at DESC)` in migration | ~10K notifications |
| Missing index on RLS policy columns | RLS policies cause sequential scans | Index every column used in a `USING` clause: `user_id`, `org_id` | ~5K rows per table |
| Fetching Stripe invoice history per-render | Billing page slow; Stripe rate limit hit | Cache billing history in database, sync nightly via cron; show cached data | Any traffic > 1 req/s |
| Recharts rendering large datasets client-side | Chart freezes browser on reports page | Aggregate data server-side to max 52 weekly points before passing to chart | >200 data points |
| Supabase Realtime channels per tab | Multiple tabs each open their own channel; DB connection pool exhausted | Use `supabase.channel()` with a stable channel name; close on unmount | >10 tabs per user |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Service role key in `NEXT_PUBLIC_*` env var | Full database access from browser; bypasses all RLS | Never prefix service role key with `NEXT_PUBLIC_`; only use in Server Components or API routes |
| Stripe webhook endpoint without signature verification | Attacker can forge payment events (fake subscription activations) | Always call `stripe.webhooks.constructEvent()` — reject if it throws |
| `org_id` trusted from request body without membership check | Cross-org data access by any authenticated user | Enforce membership via FastAPI dependency on every org-scoped endpoint |
| Missing RLS on `stripe_events` or billing tables | Billing history and Stripe IDs readable by any authenticated user | Enable RLS and add org-scoped SELECT policy on every billing-adjacent table |
| Hardcoded Stripe price IDs in client bundle | Exposes internal pricing structure; test IDs shipped to production | Store price IDs in server-side env vars only; never in `NEXT_PUBLIC_*` |
| Stripe Checkout `success_url` not validated | Open redirect if URL is constructed from user input | Use a fixed success URL pattern; never interpolate user-supplied values into it |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during Stripe Checkout redirect | User double-clicks, two checkout sessions created; duplicate charges | Disable button and show spinner immediately on click; re-enable only on error |
| Billing page shows Stripe IDs instead of readable dates | Customer confusion; support tickets | Format all Stripe timestamps (`Unix epoch`) to locale-aware date strings before displaying |
| Pause/resume automation with no confirmation | Accidental pauses; customer thinks automation is broken | Require confirmation dialog with "this will pause billing" warning |
| Notification dropdown with no empty state | Looks broken when user has no notifications | Explicit "No notifications yet" message |
| Chart with no data shows broken/empty graph | Looks like a bug, not a valid empty state | Detect zero-data state and show "No activity this period" message instead of empty axes |
| Automation status transitions not reflected in real-time | User thinks action failed; submits duplicate request | Optimistic UI update on action + Realtime subscription to confirm state change |

---

## "Looks Done But Isn't" Checklist

- [ ] **Stripe Checkout:** Test the full flow in Stripe *test mode* with card `4242 4242 4242 4242` — verify webhook fires, automation activates, confirmation page loads.
- [ ] **Stripe Webhooks:** Confirm the Railway endpoint URL is registered in the Stripe Dashboard webhook, not just locally via CLI. Verify `STRIPE_WEBHOOK_SECRET` on Railway matches Dashboard.
- [ ] **Webhook Idempotency:** Send the same test event twice via `stripe trigger` — confirm only one subscription row created.
- [ ] **RLS on new tables:** Run `SELECT * FROM new_table` with the anon key (no auth) — confirm 0 rows returned, not an error-free full result set.
- [ ] **Chart SSR:** Run `next build` (not just `next dev`) — confirm no "document is not defined" errors in the build output.
- [ ] **Org isolation:** Log in as Org A user, manually change `org_id` in a POST request to Org B's ID — confirm 403 from FastAPI.
- [ ] **Seed data:** Truncate and re-run seed script from scratch on a fresh local Supabase instance — confirm it completes without errors.
- [ ] **Notification count:** Open two browser tabs, trigger a notification insert from one — confirm both tabs update the badge count without doubling.
- [ ] **Billing summary:** Verify billing page works when a customer has 0, 1, and 5 automations — no N+1 queries, no blank page.
- [ ] **Mobile layout:** Dashboard KPI cards and charts reflow correctly on 375px viewport (Stripe Customer Portal is mobile-responsive by default, but custom billing page is not).

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Per-automation subscription model shipped | HIGH | Migrate subscriptions to subscription items; update all webhook handlers; re-map automation IDs to item IDs; coordinate with Stripe support for subscription consolidation |
| Non-idempotent webhook handler (duplicates exist) | MEDIUM | Write a de-duplication script; delete duplicate rows; add deduplication table; re-deploy handler |
| RLS missing on billing table (data exposed) | HIGH | Enable RLS immediately (one SQL statement); audit access logs for unauthorized reads; notify affected users if data was accessed |
| Wrong webhook secret in production (all events missed) | LOW | Update `STRIPE_WEBHOOK_SECRET` env var in Railway; Stripe auto-retries failed webhooks for 72 hours — re-delivery covers missed window |
| Chart SSR crash in production | LOW | Wrap chart component in dynamic import with `ssr: false`; deploy hotfix; no data loss |
| Seed data FK violation (partial seed) | LOW | Truncate seeded tables in reverse FK order; fix seed script ordering; re-run |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Webhook raw body consumed before verification | Stripe Webhooks | `stripe trigger` against deployed endpoint returns 200 |
| CLI secret vs Dashboard secret mismatch | Stripe Webhooks | Railway env var audit before any payment test |
| Non-idempotent webhook handler | Stripe Webhooks | Send same event twice; confirm single DB row |
| ALTER TABLE locks / breaks RLS | Schema Migration | Run migrations against seeded local DB, not empty DB |
| RLS missing on new tables | Schema Migration | Anon key SELECT test on every new table |
| Chart SSR crash | Dashboard Home / Reports | `next build` clean with no errors before PR merge |
| Notification count desync | Notifications | Two-tab test: insert notification, verify both tabs update |
| Per-automation subscription model | Billing data model (first sprint) | Schema review: `stripe_subscription_item_id` on automations, `stripe_subscription_id` on orgs |
| Seed data FK violation | Schema Migration | Fresh-instance seed test in CI |
| Missing org membership check in FastAPI | Every endpoint phase | Cross-org access test returns 403 for every new endpoint |

---

## Sources

- [Stripe: Idempotent Requests](https://docs.stripe.com/api/idempotent_requests) — official
- [Stripe: Resolve Webhook Signature Verification Errors](https://docs.stripe.com/webhooks/signature) — official
- [Stripe: Receive Events in Webhook Endpoint](https://docs.stripe.com/webhooks) — official
- [Stripe Webhooks: Solving Race Conditions — Pedro Alonso](https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/) — community, HIGH confidence
- [The Race Condition You're Probably Shipping With Stripe Webhooks — DEV](https://dev.to/belazy/the-race-condition-youre-probably-shipping-right-now-with-stripe-webhooks-mj4) — community
- [FastAPI Webhook Safety Guide — Greeden Blog](https://blog.greeden.me/en/2026/04/07/a-practical-guide-to-safely-implementing-webhook-receiver-apis-in-fastapi-from-signature-verification-and-retry-handling-to-idempotency-and-asynchronous-processing/) — MEDIUM confidence
- [Next.js App Router + Stripe Webhook Signature Verification — Kitson Broadhurst](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f) — community, HIGH confidence (multiple sources agree)
- [Stripe Webhook in Next.js App Router Issue #48885 — Vercel/Next.js](https://github.com/vercel/next.js/discussions/48885) — official GitHub discussion
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — official
- [Supabase: How We Made RLS Migrations Idempotent — DEV](https://dev.to/nareshipme/how-we-made-our-supabase-rls-migrations-idempotent-and-why-you-should-too-4d2g) — community
- [Supabase: RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — official
- [Supabase Security Misconfiguration — Stingrai](https://www.stingrai.io/blog/supabase-powerful-but-one-misconfiguration-away-from-disaster) — community
- [10 Common Mistakes Building with Next.js and Supabase](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes) — community
- [Supabase: Seeding Your Database](https://supabase.com/docs/guides/local-development/seeding-your-database) — official
- [Building Real-time Notification System with Supabase and Next.js — MakerKit](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs) — community, MEDIUM confidence
- [Mastering SSR and CSR in Next.js: Data Visualizations — DZone](https://dzone.com/articles/mastering-ssr-and-csr-in-nextjs) — community
- [Stripe SaaS Subscription Models Guide](https://stripe.com/resources/more/saas-subscription-models-101-a-guide-for-getting-started) — official
- [Stripe Recurring Pricing Models](https://docs.stripe.com/products-prices/pricing-models) — official
- [FastAPI Multitenancy Guide](https://app-generator.dev/docs/technologies/fastapi/multitenancy.html) — community

---
*Pitfalls research for: AIDEAS Portal v1.1 — Stripe + Dashboard + Notifications integration*
*Researched: 2026-04-09*
