# Stack Research

**Domain:** SaaS Customer Dashboard — Stripe billing, analytics charts, file uploads, real-time notifications
**Researched:** 2026-04-09
**Confidence:** HIGH (Stripe SDK already in requirements; chart/storage patterns verified via official docs and multiple sources)

## Context: What Already Exists (Do Not Re-research)

The following are validated and operational in v1.0. This file documents ONLY what is new for v1.1:

- Next.js 16.1.6 (App Router) + React 19.2.3 + TypeScript + Tailwind CSS 4 + shadcn/ui
- FastAPI + Python 3.12 + Supabase (PostgreSQL + Auth + Realtime + Storage)
- `stripe>=7.0.0` already in `api/requirements/base.txt` — installed at 14.3.0
- `@supabase/supabase-js ^2.95.0` already in `web/package.json`
- `lucide-react ^0.563.0` already in `web/package.json` (bell icon available)

## New Stack Additions for v1.1

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| recharts | ^3.6.0 | Dashboard charts (weekly trends, per-automation breakdown) | shadcn/ui charts are built on Recharts v3 — zero friction, consistent styling, copy-paste components |
| @stripe/stripe-js | ^9.1.0 | Stripe.js loader for Checkout redirect on frontend | PCI-required: must load from js.stripe.com, not bundle. Thin loader only. |
| @stripe/react-stripe-js | ^6.1.0 | React wrapper for Stripe Elements (if embedded payment UI needed) | Only needed if embedding Stripe Elements in the page. For hosted Checkout redirect, this is optional. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^3.6.0 | Area, bar, line, pie charts for Reports section | Always — needed for weekly charts, KPI trend lines, per-automation breakdown |
| @stripe/stripe-js | ^9.1.0 | `loadStripe()` for Checkout session redirect | When user clicks "Purchase" in Catalog — redirect to Stripe-hosted Checkout |
| @stripe/react-stripe-js | ^6.1.0 | `<Elements>` provider for embedded Stripe UI | Only if AIDEAS moves to embedded payment form. Not needed for hosted Checkout redirect pattern. |

### Python Backend (FastAPI) — Already Present, No New Installs

| Package | Current | Purpose | Notes |
|---------|---------|---------|-------|
| stripe | 14.3.0 (installed) | Checkout sessions, Customer Portal sessions, webhook verification | Already in `requirements/base.txt` as `stripe>=7.0.0`. v14 is current. No version change needed. |

## Installation

```bash
# Frontend — add chart library and Stripe loader
npm install recharts @stripe/stripe-js

# Only add react-stripe-js if using embedded Stripe Elements (not needed for hosted Checkout)
# npm install @stripe/react-stripe-js

# No new Python packages — stripe 14.3.0 already installed
```

## Integration Patterns

### 1. Charts (Recharts via shadcn/ui)

Use `npx shadcn@latest add chart` to scaffold the chart component wrapper. This adds `recharts` as a dependency and gives you a `ChartContainer` / `ChartTooltip` wrapper styled with CSS variables (compatible with Tailwind 4 and dark mode).

**Use these chart types for v1.1:**
- Area chart — weekly automation execution trend (Reports section)
- Bar chart — per-automation time saved comparison
- Donut/Pie — KPI summary breakdown on Dashboard home

**React 19 / Next.js 16 note:** Recharts 3.x had React 19 peer dependency conflicts in early releases. The shadcn/ui chart component handles this via `--legacy-peer-deps`. Use `npx shadcn@latest add chart` rather than installing recharts directly to get the correct wrapper and avoid hydration issues.

### 2. Stripe Checkout Flow (Frontend)

The pattern for AIDEAS is **server-redirected hosted Checkout** — not embedded Elements. The flow:

1. User clicks "Purchase" in Catalog
2. Next.js Server Action calls FastAPI `/billing/create-checkout-session`
3. FastAPI creates `stripe.checkout.Session` with `mode='payment'` or `'subscription'`, returns `session.url`
4. Frontend redirects: `window.location.href = session.url`

`@stripe/stripe-js` is needed only for `loadStripe()` if using `stripe.redirectToCheckout()` (legacy). For the modern `session.url` redirect pattern, `@stripe/stripe-js` is not strictly required — a plain redirect works. **Add `@stripe/stripe-js` only if you want type-safe Stripe.js methods client-side.**

### 3. Stripe Customer Portal (Frontend)

Same pattern as Checkout — FastAPI generates a Customer Portal session URL, frontend redirects. No React Stripe library needed.

```python
# FastAPI endpoint pattern
session = stripe.billing_portal.Session.create(
    customer=stripe_customer_id,
    return_url=f"{settings.app_url}/dashboard/billing",
)
return {"url": session.url}
```

### 4. Stripe Webhooks (FastAPI)

**Critical:** FastAPI must receive the raw body before any JSON parsing to validate the `stripe-signature` header. Use `Request` directly:

```python
@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()  # raw bytes, not parsed
    sig_header = request.headers.get("stripe-signature")
    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )
    # route by event.type
```

Do NOT use `body: dict = Body(...)` — that parses JSON before you can validate the signature.

**Events to handle for v1.1:**
- `checkout.session.completed` — activate automation, update subscription status
- `customer.subscription.updated` — pause/resume automation status
- `customer.subscription.deleted` — cancel automation
- `invoice.payment_failed` — notify customer, flag subscription

### 5. Supabase Storage — Avatar Uploads

No new packages required. `@supabase/supabase-js` (already installed at ^2.95.0) includes the Storage client.

**Pattern for avatar uploads in Settings:**
```typescript
// Client component — browser uploads directly to Supabase Storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.webp`, file, {
    upsert: true,
    contentType: 'image/webp',
  })
```

**Bucket setup required in Supabase:**
- Create `avatars` bucket (public read, authenticated write)
- RLS policy: users can only write to their own `{user_id}/` prefix
- Use `getPublicUrl()` to get the CDN URL to store in `profiles.avatar_url`

**File type constraint:** Accept only image/* on the input, convert to WebP client-side if possible, enforce 2MB max. Supabase Storage has a 50MB default limit but avatar use case should enforce smaller.

### 6. Notifications — Bell Dropdown with Realtime

No new packages required. Uses `@supabase/supabase-js` Realtime + existing `lucide-react` (Bell icon) + shadcn/ui `Popover` component.

**Pattern:**
```typescript
// Client component in nav
useEffect(() => {
  const channel = supabase
    .channel('user-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      setNotifications(prev => [payload.new, ...prev])
      setUnreadCount(c => c + 1)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [userId])
```

**UI:** shadcn/ui `Popover` + `ScrollArea` for the dropdown list. Badge on Bell icon for unread count. Add `npx shadcn@latest add popover scroll-area badge` if not already installed.

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| recharts (via shadcn chart) | Chart.js | Not React-native, requires ref wrappers, no shadcn integration |
| recharts (via shadcn chart) | Victory | Less ecosystem momentum, no shadcn/ui built-in support |
| recharts (via shadcn chart) | Tremor | Tremor is itself built on recharts + radix; adds a layer without benefit since we already have shadcn/ui |
| recharts (via shadcn chart) | D3 | Too low-level; appropriate for custom viz, not standard dashboard charts |
| Hosted Checkout redirect | Embedded Stripe Elements | Elements require `@stripe/react-stripe-js` + more UI work; hosted Checkout is PCI-simpler and faster to ship |
| Supabase Storage direct upload | FastAPI upload proxy | Direct browser → Supabase is faster, avoids Railway bandwidth, already supported by supabase-js |

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `stripe` npm package (Node.js) | FastAPI handles all Stripe API calls server-side; no Stripe SDK needed in Next.js | FastAPI endpoints — keeps secret key server-only |
| `@tremor/react` | Redundant layer over recharts + radix; heavy bundle, no benefit given existing shadcn/ui | recharts via shadcn chart |
| React Query / SWR | Not in existing stack; polling/realtime is handled by Supabase Realtime subscriptions | Supabase Realtime + `useEffect` subscription |
| `react-dropzone` | Overkill for single avatar upload; native `<input type="file">` with `onChange` is sufficient | Native file input + Supabase Storage client |
| Stripe Billing Portal npm package | Does not exist; portal is entirely hosted by Stripe, no frontend library needed | Redirect to `session.url` from FastAPI endpoint |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| recharts ^3.6.0 | React 19.2.3 | Install via `npx shadcn@latest add chart` to handle peer dep overrides correctly |
| @stripe/stripe-js ^9.1.0 | Next.js 16 (any) | No SSR — only import in client components or after hydration |
| @stripe/react-stripe-js ^6.1.0 | React 19, Next.js 16 | Supports React 16.8+; confirmed compatible with React 19 |
| stripe 14.3.0 (Python) | FastAPI 0.115+, Python 3.12 | Already installed; no changes needed |

## shadcn/ui Components to Add (npx shadcn@latest add)

These are not new npm packages — they are copy-paste components generated into the project:

| Component | Section | Already Installed? |
|-----------|---------|-------------------|
| `chart` | Reports, Dashboard KPIs | No — add this |
| `popover` | Notifications bell dropdown | Check — may already exist |
| `scroll-area` | Notification list scroll | Check — may already exist |
| `badge` | Unread count indicator | Check — may already exist |
| `progress` | Automation setup progress | Check — may already exist |
| `tabs` | Billing / Reports section tabs | Check — may already exist |

Run `npx shadcn@latest add chart popover scroll-area badge progress tabs` to add all at once. shadcn skips already-installed components.

## Sources

- [shadcn/ui Chart docs](https://ui.shadcn.com/docs/components/chart) — confirmed Recharts v3, installation command (HIGH confidence)
- [recharts npm releases](https://github.com/recharts/recharts/releases) — confirmed latest stable 3.6.0 as of Dec 2025 (HIGH confidence)
- [@stripe/stripe-js npm](https://www.npmjs.com/package/@stripe/stripe-js) — confirmed 9.1.0 (HIGH confidence)
- [@stripe/react-stripe-js npm](https://www.npmjs.com/package/@stripe/react-stripe-js) — confirmed 6.1.0 (HIGH confidence)
- [Stripe Webhooks docs](https://docs.stripe.com/webhooks) — raw body requirement confirmed (HIGH confidence)
- [Stripe Customer Portal API](https://docs.stripe.com/api/webhook_endpoints/create?lang=python) — session creation pattern (HIGH confidence)
- [Supabase Storage upload guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) — direct browser upload pattern (HIGH confidence)
- [Supabase Realtime notifications](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs) — channel + postgres_changes pattern (MEDIUM confidence — third-party guide, consistent with official docs)
- `api/requirements/base.txt` — stripe 14.3.0 already installed (verified locally)
- `web/package.json` — confirmed existing dependency versions (verified locally)

---
*Stack research for: AIDEAS Customer Portal v1.1 — Dashboard, Stripe, Charts, Notifications*
*Researched: 2026-04-09*
