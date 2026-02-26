# External Integrations

## Supabase (Database + Auth)

**Role:** Primary database (PostgreSQL) and authentication provider
**Status:** Configured and active

### Database
- **Connection:** Via `@supabase/supabase-js` (frontend) and `supabase` Python SDK (backend)
- **Tables:** 13 tables defined in `supabase/migrations/001_initial_schema.sql`
- **RLS:** Enabled on all tables with organization-scoped isolation
- **Migrations:** Managed via Supabase CLI (`supabase/migrations/`)

### Authentication
- **Frontend:** `@supabase/ssr` for cookie-based session management in Next.js
- **Middleware:** `web/src/middleware.ts` calls `updateSession()` on every request
- **Backend:** Token verification via `supabase.auth.get_user(token)` in `api/src/routes/auth.py`
- **User model:** Extends `auth.users` with custom `users` table (first_name, last_name, etc.)

### Configuration
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Public client key (frontend)
- `SUPABASE_SERVICE_KEY` - Service role key (backend)
- `NEXT_PUBLIC_SUPABASE_URL` - Frontend public URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Frontend public key

## Stripe (Payments)

**Role:** Subscription billing and payment processing
**Status:** Configured in settings, not yet implemented

### Planned Usage
- Subscription management (starter/pro/business plans)
- Customer billing via `subscriptions` and `invoices` tables
- Webhook processing for payment events

### Configuration
- `STRIPE_SECRET_KEY` - Server-side API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side key

### Database Support
- `subscriptions` table with `stripe_customer_id`, `stripe_subscription_id`
- `invoices` table with `stripe_invoice_id`
- Plans: starter, pro, business with monthly/yearly billing cycles

## Resend (Email)

**Role:** Transactional email delivery
**Status:** Configured in settings, not yet implemented

### Configuration
- `RESEND_API_KEY` - API key for sending emails
- `EMAIL_FROM` - Sender address (default: `noreply@aideas.com`)

### Planned Usage
- Invitation emails for organization members
- Support ticket notifications
- Transactional notifications

## Redis (Caching)

**Role:** Optional caching layer
**Status:** Commented out in `.env.example`, not implemented

### Configuration
- `REDIS_URL` - Connection URL (optional, commented out)

## CI/CD (GitHub Actions)

**Role:** Continuous integration and deployment
**Status:** Workflow files exist

### Workflows
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy-production.yml` - Production deployment
- `.github/workflows/deploy-staging.yml` - Staging deployment

### Deployment Target
- Backend: Railway (referenced in docs)
- Frontend: Likely Vercel (Next.js standard)

## CORS Configuration

- **Backend:** FastAPI `CORSMiddleware` in `api/src/main.py`
- **Origins:** Configurable via `ALLOWED_ORIGINS` env var
- **Default:** `http://localhost:3000`
- **Methods:** All (`*`)
- **Headers:** All (`*`)
- **Credentials:** Enabled

## Integration Architecture

```
Browser → Next.js (web/) → Supabase Auth (cookies/SSR)
                         → FastAPI (api/) → Supabase (service key)
                                          → Stripe (planned)
                                          → Resend (planned)
```

The frontend communicates with Supabase directly for auth and data, and with the FastAPI backend for business logic. The backend uses the Supabase service key for privileged operations.
