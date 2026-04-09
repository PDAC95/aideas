# Architecture Research

**Domain:** SaaS Customer Portal — Dashboard + Stripe + Notifications on Next.js 14 + FastAPI + Supabase
**Researched:** 2026-04-09
**Confidence:** HIGH (architecture defined in existing spec and codebase; integration patterns verified against official docs)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                              │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────────────┐  │
│  │ Server Comp. │  │  Client Component   │  │  Stripe Checkout    │  │
│  │  (RSC reads) │  │ (notifications,     │  │  (hosted, redirect) │  │
│  │              │  │  realtime, charts)  │  │                     │  │
│  └──────┬───────┘  └─────────┬──────────┘  └────────┬────────────┘  │
└─────────┼────────────────────┼─────────────────────-─┼──────────────┘
          │ Supabase direct    │ Supabase Realtime       │ Stripe Events
          ▼                    ▼ (Postgres changes)      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 14 (Vercel)                         │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  (dashboard) route group — layout.tsx holds DashboardNav    │     │
│  │  /dashboard, /automations, /catalog, /reports,              │     │
│  │  /billing, /settings                                        │     │
│  └──────────────────────┬──────────────────────────────────────┘     │
│                         │ Server Actions / fetch (writes only)       │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
          ┌───────────────┴──────────────────────────────┐
          │                                              │
          ▼                                              ▼
┌──────────────────────┐                   ┌────────────────────────┐
│   SUPABASE           │                   │   FASTAPI (Railway)    │
│  ─────────────────   │                   │  ──────────────────    │
│  PostgreSQL + RLS    │◄──────────────────│  Business writes       │
│  Auth (JWT source)   │  supabase-py      │  Stripe integration    │
│  Realtime (WS)       │  service_role     │  Notification creates  │
│  Storage (avatars)   │                   │  JWT validation        │
│                      │                   │  (get_current_user)    │
└──────────────────────┘                   └───────────┬────────────┘
                                                       │
                                                       ▼
                                           ┌────────────────────────┐
                                           │   STRIPE               │
                                           │  ─────────────────     │
                                           │  Checkout Sessions     │
                                           │  Subscriptions         │
                                           │  Customer Portal       │
                                           │  Webhooks → FastAPI    │
                                           └────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js RSC (server) | Read data from Supabase directly, render HTML | `createClient()` from `@/lib/supabase/server`, async page.tsx |
| Next.js Client Component | Supabase Realtime subscriptions, interactive UI (charts, filters, dropdowns) | `'use client'` + `useEffect` + supabase browser client |
| DashboardNav | Sidebar nav + notification bell with unread count | Client component wrapping RSC-passed user context |
| FastAPI endpoints | All business writes, Stripe operations, notification creation | `Depends(get_current_user)` on every route |
| Stripe webhook handler | Receives Stripe events, updates DB state, triggers notifications | Raw bytes body, `stripe.Webhook.construct_event`, idempotency guard |
| Supabase RLS | Enforces org isolation on all reads from Next.js server components | Already on all 11 tables from v1.0 |

---

## Recommended Project Structure

```
web/src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx                  # DashboardNav (already exists), pass user to nav
│       ├── dashboard/
│       │   └── page.tsx                # Home — KPIs + automation list + activity feed (RSC)
│       ├── automations/
│       │   ├── page.tsx                # My Automations list (RSC)
│       │   └── [id]/
│       │       └── page.tsx            # Automation detail (RSC + client chart)
│       ├── catalog/
│       │   ├── page.tsx                # Catalog grid — fetch all templates (RSC), filter client-side
│       │   └── [slug]/
│       │       └── page.tsx            # Template detail + request button (RSC)
│       ├── reports/
│       │   └── page.tsx                # Reports (RSC initial data, client period selector)
│       ├── billing/
│       │   └── page.tsx                # Billing (RSC for monthly charges, client for history fetch)
│       └── settings/
│           └── page.tsx                # Settings (client form for profile edits)
├── components/
│   └── dashboard/
│       ├── nav.tsx                     # Already exists — add NotificationBell here
│       ├── notifications/
│       │   ├── notification-bell.tsx   # 'use client' — unread badge, dropdown
│       │   └── notification-list.tsx   # Renders notification items
│       ├── home/
│       │   ├── summary-cards.tsx
│       │   ├── automations-list.tsx
│       │   └── activity-feed.tsx
│       ├── automations/
│       │   ├── automation-card.tsx
│       │   ├── automation-actions.tsx  # 'use client' — pause/resume/cancel POST to FastAPI
│       │   └── execution-chart.tsx     # 'use client' — recharts/tremor bar chart
│       ├── catalog/
│       │   ├── catalog-filters.tsx     # 'use client' — industry chips + category tabs
│       │   ├── template-card.tsx
│       │   └── request-button.tsx      # 'use client' — POST to FastAPI, redirect to Stripe
│       ├── reports/
│       │   ├── period-selector.tsx     # 'use client' — dropdown controlling query range
│       │   ├── impact-cards.tsx
│       │   └── weekly-chart.tsx        # 'use client' — bar chart
│       └── billing/
│           └── payment-history.tsx     # 'use client' — fetch GET /api/v1/billing/history

api/src/
├── routes/
│   ├── health.py                       # Already exists
│   ├── auth.py                         # Already exists
│   ├── automations.py                  # NEW — pause/resume/cancel/request
│   ├── billing.py                      # NEW — portal session, payment history
│   ├── webhooks.py                     # NEW — Stripe webhook handler
│   └── admin.py                        # NEW — activate endpoint (service_role protected)
├── services/
│   ├── stripe_service.py               # NEW — Stripe SDK wrapper (checkout, portal, subscriptions)
│   └── notification_service.py         # NEW — creates notifications rows in Supabase
├── dependencies.py                     # Already exists (get_current_user, get_supabase)
├── config.py                           # Already exists — add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
└── main.py                             # Already exists — add new routers
```

### Structure Rationale

- **`(dashboard)` route group:** keeps all dashboard routes under one shared layout without adding `/dashboard/` prefix duplication. Already established in v1.0.
- **RSC by default:** all page.tsx files are RSC (server components) — they read from Supabase directly. Client components are isolated to interactive islands (filters, charts, action buttons, notifications).
- **`services/` layer in FastAPI:** separates Stripe API calls from route handlers. `stripe_service.py` keeps all stripe SDK usage in one place, making it mockable.
- **`notification_service.py`:** centralized function for inserting into the `notifications` table. All webhook handlers and business endpoints call this one function. Prevents schema drift.

---

## Architectural Patterns

### Pattern 1: Hybrid C — RSC Reads, FastAPI Writes

**What:** Next.js Server Components fetch data directly from Supabase using the server-side client (which carries the user session cookie). Supabase RLS enforces org isolation automatically. All mutations go through FastAPI, which validates JWT and applies business logic.

**When to use:** Any data read in a `page.tsx` or server component. Any data write that has business side effects (Stripe calls, notifications, status transitions).

**Trade-offs:** Eliminates a network hop for reads (RSC → Supabase directly, not RSC → FastAPI → Supabase). FastAPI is the sole authority for writes, keeping business logic in one place. The downside is two different auth paths: Supabase session cookies for RSC, Bearer JWT for FastAPI calls from the client.

**Exception — Settings writes:** Profile, language preference, and hourly cost go direct to Supabase from client components. These have no business logic side effects and RLS permits users to update their own rows.

```typescript
// RSC page (reads) — no FastAPI involved
export default async function AutomationsPage() {
  const supabase = await createClient();
  const { data: automations } = await supabase
    .from('automations')
    .select('*, automation_templates(*)')
    .order('created_at', { ascending: false });
  return <AutomationsList automations={automations} />;
}

// Client component (write) — goes through FastAPI
async function handlePause(automationId: string) {
  const session = await supabase.auth.getSession();
  await fetch(`${API_URL}/api/v1/automations/${automationId}/pause`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
  });
}
```

### Pattern 2: Catalog — Fetch All, Filter Client-Side

**What:** `catalog/page.tsx` fetches all 66+ active templates in one RSC query. The result is passed to a `CatalogFilters` client component that does in-memory filtering by industry and category. No additional database queries on filter change.

**When to use:** Static-ish data (templates don't change frequently), small dataset (66 records is well under 1 MB), multi-dimension filtering without server round trips.

**Trade-offs:** Initial payload is slightly larger (all 66 templates), but filtering is instant with no latency. Templates can be cached with `revalidate` since they change infrequently. Alternative (server-side filter per request) would add latency to every filter change and is unnecessary at this scale.

```typescript
// page.tsx — fetch once
const { data: templates } = await supabase
  .from('automation_templates')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');

// Pass to client filter component
<CatalogFilters templates={templates} />

// CatalogFilters — 'use client', filters in memory
const filtered = templates.filter(t =>
  (industry === 'all' || t.industry_tags.includes(industry)) &&
  (category === 'all' || t.category === category)
);
```

### Pattern 3: Stripe Webhook — Raw Body, Verify First, ACK Fast

**What:** The webhook endpoint reads the raw bytes body before any parsing, calls `stripe.Webhook.construct_event()` with the `Stripe-Signature` header, then dispatches to event-specific handlers. Returns 200 immediately after dispatching (or after fast synchronous DB writes). Heavy work uses `BackgroundTasks`.

**When to use:** All Stripe webhook handling. This is the only correct approach — any body parsing before signature verification breaks HMAC validation.

**Trade-offs:** FastAPI's default JSON body parsing would corrupt the raw bytes. Must use `await request.body()` directly. The endpoint must NOT use a Pydantic model as the request body parameter.

```python
@router.post("/stripe/webhooks")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    supabase: Client = Depends(get_supabase),
):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # Idempotency: check if event already processed
    existing = supabase.table("stripe_events").select("id").eq("event_id", event["id"]).execute()
    if existing.data:
        return {"status": "already_processed"}

    # Record event ID first
    supabase.table("stripe_events").insert({"event_id": event["id"], "type": event["type"]}).execute()

    # Dispatch to handler (fast sync or background)
    if event["type"] == "checkout.session.completed":
        background_tasks.add_task(handle_checkout_completed, event, supabase)
    elif event["type"] == "invoice.paid":
        background_tasks.add_task(handle_invoice_paid, event, supabase)
    # ... other events

    return {"status": "received"}
```

### Pattern 4: Supabase Realtime Notifications — Client Component with Cleanup

**What:** `NotificationBell` is a `'use client'` component that receives the initial unread count from the server (as a prop from RSC) and subscribes to Supabase Realtime for INSERT events on the `notifications` table filtered by `user_id`. On new notification, increments the badge and appends to the list. `useEffect` cleanup unsubscribes the channel on unmount.

**When to use:** Notification bell in the sidebar. This is the right scope — only subscribe to realtime for live UI elements. Do not use Realtime for data that's read once on page load (use RSC for that).

**Trade-offs:** Requires a Supabase browser client (anon key, session via cookie). The `notifications` table must have Realtime enabled in Supabase dashboard. RLS on the table already ensures users only receive their own rows.

```typescript
'use client';
export function NotificationBell({ initialCount, userId }: Props) {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const supabase = createBrowserClient(...);

  useEffect(() => {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((c) => c + 1);
          // append payload.new to dropdown list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <Bell count={unreadCount} />;
}
```

---

## Data Flow

### Stripe Checkout (Catalog Purchase)

```
User clicks "Solicitar automatización" on /catalog/[slug]
    ↓
Client component POSTs to FastAPI:
  POST /api/v1/automations/{template_id}/request
  Headers: Authorization: Bearer {supabase_access_token}
    ↓
FastAPI get_current_user validates JWT → extracts org_id from profiles
    ↓
FastAPI: INSERT automation_requests (status: pending_payment)
FastAPI: stripe.checkout.Session.create(
  line_items=[{price_data: {unit_amount: setup_price, ...}}],
  mode="payment",
  success_url="https://app.aideas.com/dashboard?checkout=success",
  cancel_url="https://app.aideas.com/dashboard/catalog/{slug}",
  metadata={request_id: ..., org_id: ...}
)
Returns { checkout_url }
    ↓
Client redirects window.location.href = checkout_url (Stripe hosted page)
    ↓
User pays → Stripe sends checkout.session.completed to:
  POST /api/v1/stripe/webhooks
    ↓
FastAPI webhook handler (raw body, verified):
  UPDATE automation_requests SET status = 'in_setup'
  INSERT automations (status: 'in_setup', org_id from metadata)
  INSERT notifications (type: 'success', message: "Pago confirmado, comenzando setup")
    ↓
User lands back on /dashboard (success_url)
Notification bell shows +1 via Realtime
```

### Automation Lifecycle (Pause/Resume/Cancel)

```
User clicks Pause on /dashboard/automations/[id]
    ↓
Client component POSTs:
  POST /api/v1/automations/{id}/pause
  Headers: Authorization: Bearer {token}
    ↓
FastAPI:
  Verify user owns this automation (query automations JOIN org membership)
  stripe.Subscription.modify(stripe_subscription_id, pause_collection={behavior: 'void'})
  UPDATE automations SET status = 'paused'
  INSERT notifications (type: 'warning', "Tu automatización fue pausada")
  Return 200 { status: 'paused' }
    ↓
Client component: optimistic UI update + router.refresh() to re-fetch RSC data
```

### Notification Read Flow

```
Dashboard layout renders (RSC):
  SELECT count(*) FROM notifications WHERE user_id = $1 AND is_read = false
  → passes initialCount to DashboardNav as prop
    ↓
DashboardNav passes to NotificationBell (client component)
    ↓
NotificationBell subscribes to Realtime (INSERT events, filter user_id)
    ↓
User opens bell dropdown:
  Fetch last 20 notifications (Supabase direct from client)
  Display list with relative timestamps
    ↓
User clicks "Mark all as read":
  UPDATE notifications SET is_read = true WHERE user_id = $1
  (Supabase direct — RLS permits own-row updates)
  setUnreadCount(0)
```

### Billing Data Flow

```
/dashboard/billing RSC renders:
  Query 1: SELECT automations JOIN automation_templates (monthly_price) → monthly charges table
  Query 2: GET from Supabase subscriptions table → stripe_customer_id
  → passes stripe_customer_id to PaymentHistory client component

PaymentHistory client component ('use client'):
  On mount: fetch /api/v1/billing/history (Bearer token)
  FastAPI: stripe.Invoice.list(customer=stripe_customer_id, limit=24)
  Returns invoice list → rendered as payment history table

Manage Payment button:
  POST /api/v1/billing/portal (Bearer token)
  FastAPI: stripe.billing_portal.Session.create(customer=stripe_customer_id, return_url=...)
  Returns { portal_url }
  Client: window.location.href = portal_url
```

---

## Integration Points

### New vs Modified: Frontend

| Item | Status | Details |
|------|--------|---------|
| `(dashboard)/layout.tsx` | MODIFY | Add `NotificationBell` to `DashboardNav`, pass initial unread count |
| `(dashboard)/dashboard/page.tsx` | REWRITE | Full home implementation (KPIs, automations list, activity feed) |
| `(dashboard)/automations/page.tsx` | NEW | Automation list page |
| `(dashboard)/automations/[id]/page.tsx` | NEW | Automation detail with chart |
| `(dashboard)/catalog/page.tsx` | NEW | Template grid with client-side filters |
| `(dashboard)/catalog/[slug]/page.tsx` | NEW | Template detail + request button |
| `(dashboard)/reports/page.tsx` | NEW | Reports with period selector |
| `(dashboard)/billing/page.tsx` | NEW | Billing + payment history |
| `(dashboard)/settings/page.tsx` | NEW | Profile, preferences, security |
| `components/dashboard/nav.tsx` | MODIFY | Add NotificationBell slot |
| `components/dashboard/notifications/` | NEW | Bell, dropdown, list components |
| `lib/api-client.ts` | NEW | Wrapper for FastAPI calls with Bearer token injection |

### New vs Modified: Backend

| Item | Status | Details |
|------|--------|---------|
| `api/src/config.py` | MODIFY | Add `stripe_secret_key`, `stripe_webhook_secret`, `stripe_price_*` env vars |
| `api/src/main.py` | MODIFY | Register 4 new routers (automations, billing, webhooks, admin) |
| `api/src/routes/automations.py` | NEW | request, pause, resume, cancel endpoints |
| `api/src/routes/billing.py` | NEW | portal session, payment history |
| `api/src/routes/webhooks.py` | NEW | Stripe webhook handler |
| `api/src/routes/admin.py` | NEW | Activate endpoint (service_role check) |
| `api/src/services/stripe_service.py` | NEW | Stripe SDK wrapper |
| `api/src/services/notification_service.py` | NEW | Centralized notification INSERT |
| `api/src/dependencies.py` | MODIFY | Add `get_org_id` dependency (extracts org from profiles via user_id) |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe Checkout | FastAPI creates session, returns URL, client redirects | Use `metadata` to carry `request_id` and `org_id` through webhook |
| Stripe Customer Portal | FastAPI creates portal session on demand | Requires `stripe_customer_id` from `subscriptions` table; create `subscriptions` row on first purchase if missing |
| Stripe Webhooks | POST to `/api/v1/stripe/webhooks`, raw body required | Register endpoint in Stripe Dashboard; need idempotency table or flag |
| Supabase Realtime | Browser client subscribes in client component | Enable Realtime on `notifications` table in Supabase dashboard; RLS filters by `user_id` |
| Supabase Storage | Avatar upload in Settings | Bucket: `avatars`; RLS policy: users can upload to their own path |
| Resend (email) | Not needed for v1.1 | Notifications are in-app only; email notifications deferred |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| RSC page → Supabase | Direct via `createClient()` server client | Cookie-based session; RLS enforces org isolation |
| Client component → FastAPI | `fetch` with `Authorization: Bearer {token}` | Extract token from `supabase.auth.getSession()` |
| Client component → Supabase (reads/notifications) | Browser client via `createBrowserClient()` | Only for Realtime subscriptions and Settings writes |
| FastAPI → Supabase | `supabase-py` service_role client | Can bypass RLS for cross-org operations (admin endpoint only) |
| FastAPI → Stripe | `stripe` Python SDK | All Stripe operations go through `stripe_service.py` |
| Stripe → FastAPI | Webhook POST (HTTPS) | Stripe must be configured with Railway public URL |

---

## Suggested Build Order

The dependency chain drives this order. Each phase is unblockable by the next.

1. **Schema migration + seed data** — Everything else depends on having columns and data. Run migration first, seed 66 templates and demo org data. This unblocks all frontend pages.

2. **FastAPI foundation for writes** — `config.py` additions, `get_org_id` dependency, `stripe_service.py`, `notification_service.py`. These are shared by all 4 new route files. Build once, referenced everywhere.

3. **Stripe webhook handler** — Build early because it defines the state machine (request_status, automation_status transitions). The frontend pages show these statuses, so knowing the state flow before building UI prevents rework.

4. **Catalog page + request flow** — Highest business value. Requires schema (templates columns), `stripe_service.py` (checkout session), and webhook handler (to verify the flow end-to-end). This is the money-generating path.

5. **My Automations (list + detail)** — Depends on having automations records (from seed data) and the pause/resume/cancel endpoints. Build after catalog so the full lifecycle is demonstrable.

6. **Dashboard Home** — Aggregates data from automations and executions. Build after My Automations so the data exists to populate KPIs.

7. **Reports** — Pure read, depends on executions seed data. Build after Home.

8. **Billing** — Requires `GET /api/v1/billing/history` and `POST /api/v1/billing/portal`. Build after Stripe is working (step 2-3).

9. **Settings** — Mostly Supabase direct writes (profile, password). Independent from Stripe. Can be built any time after schema; placed last because it's lowest business priority.

10. **Notifications** — Bell component modifies existing `DashboardNav`. Enable Supabase Realtime on `notifications` table. Can be layered in after step 3 since webhooks create notifications.

---

## Anti-Patterns

### Anti-Pattern 1: Parsing Body Before Stripe Signature Verification

**What people do:** Define the webhook route with a Pydantic model parameter, letting FastAPI auto-parse JSON, then try to pass `request.body()` to `construct_event`.

**Why it's wrong:** Once FastAPI's body parser consumes the request stream, calling `request.body()` returns empty bytes or a re-serialized version that doesn't match the original HMAC. Signature verification always fails.

**Do this instead:** Use `payload = await request.body()` as the very first line. Do not declare a Pydantic request body on the webhook route. Verify signature before any JSON parsing.

### Anti-Pattern 2: Processing Heavy Logic Inside the Webhook Handler Synchronously

**What people do:** Run all DB writes, Stripe API calls, and notification inserts synchronously inside the webhook handler before returning 200.

**Why it's wrong:** Stripe considers your endpoint failed if it doesn't respond within 10 seconds. Complex chains (DB write + Stripe subscription create + notification) can exceed this. Stripe retries failed deliveries, causing duplicate processing.

**Do this instead:** Verify signature, record event ID for idempotency, return 200 immediately, dispatch remaining work to FastAPI `BackgroundTasks`. For v1.1 the writes are fast enough to be synchronous (no Stripe API calls inside the webhook handler — those happen in the admin activate endpoint), but design with this in mind.

### Anti-Pattern 3: Subscribing to Supabase Realtime in Server Components

**What people do:** Try to set up a Realtime subscription inside an async Server Component.

**Why it's wrong:** RSCs run once on the server and return HTML. There is no persistent connection and no way to push updates back to the client from an RSC.

**Do this instead:** Pass the initial data (e.g., `initialUnreadCount`) from the RSC as a prop. The client component handles the Realtime subscription. Always `'use client'` for anything using `useEffect` or Supabase channel subscriptions.

### Anti-Pattern 4: Fetching Stripe Invoice History in an RSC

**What people do:** Call the Stripe API from a `page.tsx` server component to show payment history.

**Why it's wrong:** Stripe API calls add latency to the server-side render. The payment history table is not critical for initial paint. It also ties the RSC render to an external API's availability.

**Do this instead:** Render the billing page shell (monthly charges table from local DB) in the RSC. Render the payment history section as a client component that fetches via `GET /api/v1/billing/history` on mount, with a loading skeleton while the Stripe API responds.

### Anti-Pattern 5: Duplicate Stripe Customer per Org

**What people do:** Create a new Stripe Customer on every checkout session creation without checking if one already exists.

**Why it's wrong:** Multiple Stripe Customers for the same org means payment methods, invoices, and Customer Portal access are fragmented. Stripe support becomes a nightmare.

**Do this instead:** On checkout session creation, check `subscriptions.stripe_customer_id` for the org. If null, call `stripe.Customer.create()` and immediately INSERT/UPSERT into `subscriptions` with the new `stripe_customer_id`. On subsequent checkouts, reuse the existing Customer ID with `customer=stripe_customer_id` in `Session.create()`.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is correct. Single Railway instance. In-memory rate limiter (slowapi) is fine. |
| 1k-10k users | Replace in-memory rate limiter with Redis (noted as tech debt in PROJECT.md). Add Supabase connection pooler (PgBouncer) if connection count spikes. |
| 10k+ users | Stripe webhook volume may warrant a dedicated queue (Redis + worker). Supabase Realtime has per-project connection limits — review plan. |

### Scaling Priorities

1. **First bottleneck:** In-memory rate limiter fails when Railway scales to multiple instances. Fix: add Redis (Upstash or Railway Redis add-on) and switch slowapi to use it. Already flagged as tech debt.
2. **Second bottleneck:** Supabase Realtime concurrent connections (varies by plan). At scale, consider batch notifications instead of per-event subscriptions, or move to a push notification service.

---

## Sources

- Stripe webhook signature verification (official): https://docs.stripe.com/webhooks
- Stripe Checkout Sessions API: https://stripe.com/docs/api/checkout/sessions
- FastAPI Stripe webhook implementation: https://blog.frank-mich.com/fastapi-stripe-webhook-template/
- FastAPI Stripe webhooks + idempotency: https://blog.greeden.me/en/2026/04/07/a-practical-guide-to-safely-implementing-webhook-receiver-apis-in-fastapi-from-signature-verification-and-retry-handling-to-idempotency-and-asynchronous-processing/
- Supabase Realtime with Next.js (official): https://supabase.com/docs/guides/realtime/realtime-with-nextjs
- Supabase Realtime notification pattern: https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs
- Stripe + FastAPI + Supabase subscription pattern: https://medium.com/@ojasskapre/implementing-stripe-subscriptions-with-supabase-next-js-and-fastapi-666e1aada1b5

---

*Architecture research for: AIDEAS v1.1 — Dashboard + Stripe + Notifications on Next.js 14 + FastAPI + Supabase*
*Researched: 2026-04-09*
