# Feature Research

**Domain:** SaaS customer portal — managed automation service (monitor-not-build model)
**Researched:** 2026-04-09
**Confidence:** HIGH (patterns well-established; Stripe docs authoritative; MSP dashboard research confirmed by multiple sources)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any professional customer portal. Missing any of these makes the product feel unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dashboard home with top KPIs | Every SaaS portal opens to a summary view; users need orientation at a glance | LOW | 3–5 KPI cards in top row (F-pattern), then secondary content below. For AIDEAS: active automations count, executions this month, hours saved, estimated $ value saved |
| Automation list with status badges | Users must see what they paid for and whether it's working | LOW | Status: Active / Paused / Setup / Error. Color-coded badges. Table or card grid. Sortable by name/status/last-run |
| Automation detail view | Clicking any automation must show specifics — run history, last execution, config summary | MEDIUM | Recent executions log, success/failure rate, what the automation does, current status, lifecycle actions |
| Pause / Resume action on automations | Standard lifecycle control; missing this forces users to contact support for routine actions | MEDIUM | Requires Stripe subscription pause or metadata flag; confirmation modal before action; status updates immediately optimistically |
| Automation catalog with filters | Users want to discover and request new automations; browsing 66+ templates requires filtering | MEDIUM | Filter by industry + category. Card layout. Clear "Request" CTA. Not a self-serve builder — this triggers a managed request |
| Stripe Checkout for catalog purchases | Users expect to pay in-app; leaving to invoice/email is a conversion killer | HIGH | Stripe Checkout hosted page. Webhook handles activation. Idempotency keys. Success/cancel redirect handling |
| Billing summary and payment history | Every subscription product shows what you're paying and past invoices | MEDIUM | Current plan, next charge date, amount. Invoice list with download links. Sourced from Stripe API — never store locally |
| Stripe Customer Portal link | Industry standard for subscription management; re-implementing cancel/update flows is wasteful and error-prone | LOW | Single API call to create portal session. Redirect to Stripe-hosted portal. Handles cancellation, payment method update, plan change |
| Settings: profile edit | Users expect to change name, avatar, contact info | LOW | Name, email display (email change is complex — defer or route through Supabase Auth), avatar upload to Supabase Storage |
| Settings: password change | Security hygiene; users expect in-app password management | LOW | Current password + new password + confirm. Use Supabase Auth updateUser. Invalidate other sessions after change |
| Settings: language preference | Already bilingual (EN/ES); user must be able to switch persistently | LOW | Persist to profiles.language_preference column (already in schema). Cookie-based locale already implemented |
| Notifications dropdown | Bell icon with unread count badge is universal SaaS pattern; missing it signals the product is immature | MEDIUM | Flyout panel, not full page. Read/unread visual differentiation. Mark-all-read action. Sourced from notifications table via Supabase Realtime subscription |
| Unread count badge on bell icon | Users scan for the badge; exact count for <100, "99+" for overflow | LOW | Numeric badge. Disappears when all read. Updates in real time via Supabase Realtime |
| Empty state guidance | When no automations active, user needs clear next step | LOW | "Browse catalog to get started" CTA. Only needed if demo seed data is stripped — v1.1 seed covers this, but component must exist |
| Loading and error states | Every data-fetching component needs skeleton loaders and error fallbacks | LOW | Skeleton cards during fetch. Error boundary with retry. Toast notifications for action outcomes |

### Differentiators (Competitive Advantage)

Features that go beyond baseline and reinforce AIDEAS's core value proposition: "we prove your ROI."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Value estimation ($ saved) | Translates execution counts into business dollars; this is the primary retention driver for SMB customers who need to justify the subscription to their boss | MEDIUM | Formula: executions × avg_minutes_per_task × hourly_cost. Hourly cost is user-configurable in Settings. Display as "This month you saved $X (~Y hours)." shadcn Tooltip explains the formula |
| Per-automation impact breakdown in Reports | Aggregated totals hide which automations deliver value; breakdown surfaces the ROI story for each line item | MEDIUM | Table: automation name, runs this month, hours saved, $ saved. Sortable. Helps customers justify expanding |
| Weekly execution trend chart | Trend over time proves growing value, not stagnant; reinforces retention | MEDIUM | Recharts line chart. 12-week window. Group by week. Data from executions table |
| Hourly cost setting in preferences | Makes value estimation personal and defensible; if a customer sets their team's cost, the numbers feel real | LOW | Number input in Settings. Persisted to profiles.hourly_cost. Defaults to $50/hr (reasonable US SMB average) |
| Automation request flow from catalog | Lowers friction to expand; customer clicks, fills a short form, AIDEAS team sees a structured request | MEDIUM | Modal or dedicated form. Captures: which template, any customization notes. Creates row in requests table. AIDEAS team fulfills manually — no automation builder |
| Status timeline on automation detail | Shows "Requested → In Setup → Active" lifecycle; reduces "where is my automation?" support tickets | LOW | Stepper component showing lifecycle states with timestamps. Data from automations.status + created_at/activated_at |
| Execution log with success/failure indicators | Proves the automation is running; customers trust what they can verify | MEDIUM | Paginated table of recent executions. Status icon (success/error), timestamp, duration, optional error message. Read-only — customer monitors, does not debug |
| Realtime notification delivery | Alerts feel immediate, not stale; differentiates from portals that require page refresh | MEDIUM | Supabase Realtime channel subscription on notifications table filtered by org_id. Bell badge updates without polling |

### Anti-Features (Commonly Requested, Often Problematic)

Features that appear valuable but undermine the AIDEAS model, add disproportionate complexity, or violate the managed-service philosophy.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Self-serve automation builder / no-code editor | Customers want control; "can I configure it myself?" is a common ask | Destroys the managed-service moat; support burden explodes; IP is exposed; customers build badly and blame AIDEAS | Automation request form with customization notes. Catalog clearly describes what the automation does. AIDEAS team implements correctly |
| Real-time execution streaming / live logs | Power users want to watch automations run live | WebSocket infrastructure cost; most SMB automations run in seconds; streaming adds complexity with zero customer value at this stage | Execution log refreshed on page load + manual refresh button. Realtime is reserved for notifications, not execution telemetry |
| Editable automation configuration by customer | "Let me change the schedule myself" seems reasonable | Breaks AIDEAS's quality guarantee; misconfiguration creates support burden; schema must accommodate arbitrary config structures | Pause/Resume for immediate control. Change request via form for configuration changes. AIDEAS team applies the change |
| CSV/Excel export of all reports | Frequently requested by "data people" in SMB | Adds significant implementation scope; most SMBs don't act on raw exports; creates GDPR/data handling surface | Visual reports with clear numbers are sufficient for v1.1. Pro-tier export can be added post-PMF |
| In-app chat with AIDEAS team | Customers want direct communication | Already scoped to v1.2 specifically because real-time chat requires its own infrastructure (Supabase Realtime channels, message persistence, read receipts, agent-side interface) | Explicitly out of scope for v1.1. Notifications cover one-way AIDEAS → customer communication in the interim |
| Multi-user team management | Org owners want to invite colleagues | Out of scope for v1.1 (already decided); adding it mid-milestone splits focus | Scoped to v1.2. Current schema supports members table — no UI yet |
| Granular notification preferences (per-type toggles) | Users ask to control which notifications they receive | Premature optimization; notification volume in v1.1 is low (AIDEAS-triggered only); building preference matrix before knowing notification types is waste | Simple mark-as-read and dismiss. Preferences added when notification volume makes them necessary |
| Webhook / API for customers to pull their data | Technical customers want programmatic access | Substantial auth + docs + versioning overhead; zero demand evidence at SMB scale | Dashboard provides all data visually. Public API explicitly deferred to Phase 2+ |

---

## Feature Dependencies

```
[Stripe Checkout purchase]
    └──requires──> [Automation catalog with templates in DB]
                       └──requires──> [Schema migration: 66+ templates seeded]

[Automation detail view]
    └──requires──> [Automation list]
                       └──requires──> [automations table with seed data]

[Value estimation ($)]
    └──requires──> [Hourly cost in Settings]
    └──requires──> [Executions data from backend]

[Reports: per-automation breakdown]
    └──requires──> [Automation list]
    └──requires──> [Executions aggregation endpoint]

[Realtime notification badge]
    └──requires──> [Notifications table rows (created by business operations)]
    └──requires──> [Supabase Realtime subscription in layout]

[Pause/Resume automation]
    └──requires──> [Stripe subscription ID on automations row]
    └──requires──> [FastAPI endpoint: PATCH /automations/{id}/pause]

[Billing: Customer Portal]
    └──requires──> [Stripe Customer ID on organizations row]
    └──requires──> [FastAPI endpoint: POST /billing/portal-session]

[Billing: payment history]
    └──requires──> [Stripe API: list invoices by customer]
    └──enhances──> [Stripe Customer Portal] (portal has its own invoice list, but in-app list is faster)

[Status timeline on automation detail]
    └──enhances──> [Automation detail view]

[Execution log]
    └──enhances──> [Automation detail view]
    └──requires──> [executions table with data]
```

### Dependency Notes

- **Catalog purchase requires seeded templates:** Stripe Checkout cannot be tested without real template rows. Schema migration (ALTER + seed 66 templates) is the prerequisite for both catalog browsing and purchase flow.
- **Value estimation requires hourly cost:** The $ savings calculation must have a denominator. Settings preference must be implemented before Reports can show dollar figures. Default $50/hr covers the case where user has not set a value.
- **Pause/Resume requires Stripe metadata or subscription item ID:** The automations table must store stripe_subscription_item_id or equivalent reference so FastAPI can call Stripe's pause API. This must be confirmed in schema migration planning.
- **Notifications are business-operation-created:** The customer portal only reads and displays notifications. No customer-facing UI to create them. AIDEAS staff or automated backend processes insert rows — this means v1.1 can use seed data without building the creation side.
- **Realtime badge is additive:** The notification dropdown functions with polling fallback; Supabase Realtime subscription is an enhancement, not a hard dependency. Build polling first, add Realtime subscription second.

---

## MVP Definition

### Launch With (v1.1 — this milestone)

- [ ] Dashboard home: 4 KPI cards + automation list preview + activity feed (recent executions) — orientation and proof-of-value on first load
- [ ] My Automations list: full list with status badges, search/filter — customers must see all their automations
- [ ] Automation detail view: description, status timeline, execution log, pause/resume actions — reduces support tickets
- [ ] Automation catalog: 66+ template cards, industry + category filters, detail modal, "Request" flow — growth surface
- [ ] Stripe Checkout: purchase flow from catalog → Stripe hosted page → webhook activation — monetization
- [ ] Reports: KPI trend chart + per-automation breakdown + value estimation — the ROI proof that drives retention
- [ ] Billing: current plan summary + payment history + Customer Portal redirect — eliminates "how do I cancel/update card" support
- [ ] Settings: profile edit + language preference + hourly cost + password change — personalization and security
- [ ] Notifications: bell with badge + flyout with read/unread + mark-all-read — communication channel from AIDEAS team
- [ ] Schema migration + 66 template seeds + demo org data — prerequisite for all above

### Add After Validation (v1.x → v1.2)

- [ ] Real-time chat with AIDEAS team — already planned for v1.2; requires agent-side interface too
- [ ] Team management + member invitations — members table is ready; UI deferred
- [ ] Empty states for zero-automation users (pre-seed scenario) — covers onboarding before any automations are active
- [ ] Status update notes during setup — AIDEAS team comments on in-progress automations
- [ ] Admin panel for AIDEAS team — fulfill requests, manage activations

### Future Consideration (v2+)

- [ ] CSV/Excel export of reports — add when enterprise-tier customers appear
- [ ] Public API + webhooks — add when technical customers with integration needs emerge
- [ ] Mobile-native app — PWA may suffice; evaluate after dashboard usage patterns are known
- [ ] AI needs-discovery chat — high complexity; add when chat infrastructure is in place
- [ ] Granular notification preferences — add when notification volume makes noise a real problem

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Dashboard home (KPIs + list preview) | HIGH | LOW | P1 |
| My Automations list | HIGH | LOW | P1 |
| Automation detail view | HIGH | MEDIUM | P1 |
| Automation catalog + filters | HIGH | MEDIUM | P1 |
| Stripe Checkout purchase | HIGH | HIGH | P1 |
| Reports with value estimation | HIGH | MEDIUM | P1 |
| Billing summary + Customer Portal | HIGH | MEDIUM | P1 |
| Settings (profile, language, hourly cost) | MEDIUM | LOW | P1 |
| Settings: password change | MEDIUM | LOW | P1 |
| Notifications dropdown + badge | MEDIUM | MEDIUM | P1 |
| Schema migration + 66 seeds | HIGH | MEDIUM | P1 (prerequisite) |
| FastAPI business endpoints | HIGH | HIGH | P1 (prerequisite) |
| Stripe webhooks | HIGH | HIGH | P1 (prerequisite) |
| Pause/Resume automation | MEDIUM | MEDIUM | P1 |
| Status timeline on detail | MEDIUM | LOW | P2 |
| Execution log pagination | MEDIUM | LOW | P2 |
| Realtime notification delivery | LOW | MEDIUM | P2 |
| CSV export | LOW | HIGH | P3 |
| Granular notification preferences | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v1.1 milestone
- P2: Should have; include if implementation proceeds smoothly
- P3: Nice to have; defer

---

## Competitor Feature Analysis

Relevant reference points for the managed-service monitoring portal model (customers monitor, don't build):

| Feature | Zapier (self-serve) | Workato (enterprise) | AIDEAS Approach |
|---------|---------------------|----------------------|-----------------|
| Automation list | Full zap list with run/pause/edit | Recipe list with version history | List with status badges; no edit — request form for changes |
| Execution history | Per-zap task history, filterable | Full audit log with replay | Per-automation execution log, read-only, paginated |
| Catalog / templates | Large template library, user-deploys | Admin-controlled templates | Catalog with 66+ templates; customer requests, AIDEAS deploys |
| Billing | Stripe, self-serve plan changes | Contract-based, admin managed | Stripe Checkout for new purchases; Customer Portal for plan changes |
| ROI reporting | None (tool-focused, not outcome-focused) | Basic ROI calculator in enterprise tier | Core differentiator — time/$ saved is the primary value display |
| Notifications | Email only; no in-app notification center | In-app + email | In-app bell + flyout; email via Resend for critical events |
| Team management | Shared workspace | Role-based access | Single user per org in v1.1; team in v1.2 |
| Self-serve builder | Core feature | Core feature | Explicitly not offered — this is the AIDEAS moat |

---

## Implementation Notes for This Milestone

**Stripe integration complexity is the highest-risk item.** Checkout session creation, webhook processing (with idempotency), Customer Portal session creation, and payment history retrieval from the Stripe API all need to be wired together correctly. Webhook signature verification is mandatory — skip it and you create a security hole. Process webhook events asynchronously (queue or background task in FastAPI).

**Stripe Customer Portal requires configuration in the Stripe Dashboard before the API call works.** Features (cancellation, payment method update, invoice history) must be enabled in the portal configuration. This is a one-time setup step that is easy to miss and blocks all billing UI testing.

**Value estimation formula must be surfaced transparently.** SMB customers will ask "how is this calculated?" — the tooltip/explainer is not optional UX sugar, it's a trust mechanism. Show: executions × minutes_per_task × hourly_cost = hours saved = $ saved.

**Pagination is required for execution logs.** A customer with an active automation for 6 months may have thousands of execution rows. Query with LIMIT/OFFSET from day one. Default 20 per page.

**The automation catalog (66+ templates) is read-only for customers.** Filters (industry, category) should client-side filter a JSON payload or a lightweight Supabase query — no complex search infrastructure needed at this scale.

**Notifications are AIDEAS-written, not customer-written.** The portal only renders what's in the notifications table. Seed realistic notifications in demo data to validate the UI without building admin tooling.

---

## Sources

- [Stripe Customer Portal Integration Docs](https://docs.stripe.com/customer-management/integrate-customer-portal) — HIGH confidence, official
- [Stripe SaaS Integration Guide](https://docs.stripe.com/saas) — HIGH confidence, official
- [Stripe Checkout Flow Design Strategies](https://stripe.com/resources/more/checkout-flow-design-strategies-that-can-help-boost-conversion-and-customer-retention) — HIGH confidence, official
- [Stripe Pricing Table / Embeddable Checkout](https://docs.stripe.com/payments/checkout/pricing-table) — HIGH confidence, official
- [Stripe SaaS Billing Best Practices](https://stripe.com/resources/more/best-practices-for-saas-billing) — HIGH confidence, official
- [MSP KPI Reporting Guide — Acronis](https://www.acronis.com/en/blog/posts/msp-kpi-reporting/) — MEDIUM confidence, industry publication
- [MSP KPIs — ConnectWise](https://www.connectwise.com/blog/msp-kpis) — MEDIUM confidence, industry authority
- [Notification UX — Userpilot](https://userpilot.com/blog/notification-ux/) — MEDIUM confidence, UX publication
- [Notification System Design — MagicBell](https://www.magicbell.com/blog/notification-system-design) — MEDIUM confidence, practitioner source
- [B2B SaaS Dashboard Design — UX Collective](https://uxdesign.cc/design-thoughtful-dashboards-for-b2b-saas-ff484385960d) — MEDIUM confidence, practitioner source
- [Smart SaaS Dashboard Design Guide 2026 — F1Studioz](https://f1studioz.com/blog/smart-saas-dashboard-design/) — MEDIUM confidence, current year
- [Self-Service Checkout for SaaS — Ordway](https://ordwaylabs.com/blog/self-service-checkout-for-saas/) — MEDIUM confidence, billing specialist
- [Workato Automation Dashboard re-introduction](https://www.workato.com/product-hub/re-introducing-the-automation-dashboard/) — MEDIUM confidence, competitor reference

---

*Feature research for: AIDEAS customer portal — managed automation service, monitor-not-build model*
*Researched: 2026-04-09*
