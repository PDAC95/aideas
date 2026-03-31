# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Monorepo with Micro-Frontend Architecture

AIDEAS is structured as a three-tier distributed system with clear separation between presentation (landing + frontend), API layer, and data persistence. The architecture supports independent scaling and deployment while maintaining unified authentication and data consistency through Supabase.

**Key Characteristics:**
- Multi-project monorepo (landing, web frontend, FastAPI backend, database migrations)
- Server-side rendering (Next.js) for authenticated dashboard
- Supabase as unified authentication and database provider
- Organization-based multi-tenancy with row-level security
- API-first backend with FastAPI for scalable operations
- Token-based client authentication for frontend-to-API communication

## Layers

**Presentation Layer (Landing):**
- Purpose: Public marketing website to drive conversions
- Location: `/landing`
- Contains: Static HTML, SCSS assets, JavaScript, vendor libraries
- Depends on: None (independent)
- Used by: Public visitors via browser

**Frontend Application Layer (Next.js):**
- Purpose: Authenticated SPA for users to manage automations
- Location: `/web`
- Contains: React components, server components, client components, page routing, Supabase client integration
- Depends on: Supabase (authentication, data reads), FastAPI backend (/api endpoints), browser APIs
- Used by: Authenticated users via browser

**API Backend Layer (FastAPI):**
- Purpose: Business logic execution, webhooks, integrations, token verification
- Location: `/api/src`
- Contains: Route handlers, services, models, configuration, Supabase client
- Depends on: Supabase (database access, auth verification), external services (Stripe, Resend)
- Used by: Next.js frontend (HTTP requests), webhooks from external services

**Data Layer (Supabase PostgreSQL):**
- Purpose: Persistent data storage, user authentication, row-level security enforcement
- Location: `/supabase/migrations`
- Contains: Schema definitions (14 tables), RLS policies, indexes, triggers
- Depends on: PostgreSQL engine, UUID extension
- Used by: Next.js server components, FastAPI backend

## Data Flow

**Authentication Flow:**
1. User submits credentials on `/signup` or `/login` (client component)
2. Supabase client validates and stores session in cookies
3. Middleware (`/lib/supabase/middleware.ts`) refreshes session on every request
4. Protected routes check `auth.getUser()` and redirect to login if missing
5. Dashboard layout enforces server-side authentication check before rendering children

**API Authentication Flow:**
1. Frontend calls API endpoint with Bearer token from Supabase session
2. FastAPI route receives Authorization header
3. Backend uses Supabase service client to verify token (`supabase.auth.get_user(token)`)
4. User data returned or 401 error if invalid

**Data Access Flow:**
1. Next.js server component requests data via Supabase RLS-protected tables
2. RLS policies check `auth.uid()` matches organization membership
3. Only data for user's organizations returned (enforced at database level)
4. No direct API calls needed for simple reads (Supabase client on server)

**State Management:**
- Client state: React hooks (useState) in client components for form inputs
- Server state: Next.js server components cache data naturally per request
- Persistent state: PostgreSQL tables with RLS policies for isolation
- Session state: Supabase auth cookies maintained automatically by middleware
- No external state management library (Redux, Zustand, etc.) - not needed for this scope

## Key Abstractions

**Supabase Client Factory:**
- Purpose: Encapsulate environment-specific client creation for browser and server
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Pattern: Factory pattern with SSR-aware cookie handling

**Protected Routes:**
- Purpose: Ensure dashboard pages only accessible to authenticated users
- Examples: `src/app/(dashboard)/layout.tsx`, middleware.ts
- Pattern: Middleware + layout-level authentication checks (defense in depth)

**Organization Isolation:**
- Purpose: Multi-tenant data separation without separate databases
- Examples: All tables reference `organization_id`, RLS policies filter by org membership
- Pattern: Row-level security at database level - strongest guarantee

**UI Component Library:**
- Purpose: Reusable design system components (button, card, input, label)
- Examples: `src/components/ui/` directory with Radix UI + Tailwind
- Pattern: Unstyled component composition with class variance authority

**Navigation Abstraction:**
- Purpose: Centralized dashboard navigation structure as data
- Examples: `DashboardNav` component with navigation array
- Pattern: Data-driven UI that's easy to extend

## Entry Points

**Landing Page Entry:**
- Location: `/landing/index.html`
- Triggers: User visits root domain (aideas.com)
- Responsibilities: Market the product, collect leads, link to app signup

**Web Frontend Entry:**
- Location: `/web/src/app/layout.tsx` (root layout)
- Triggers: User accesses app.aideas.com (any route)
- Responsibilities: Setup fonts, metadata, CSS imports; delegate to page components

**Homepage Route:**
- Location: `/web/src/app/page.tsx`
- Triggers: User visits `/` (root of web app)
- Responsibilities: Redirect to dashboard if authenticated, show marketing content if not

**Auth Routes:**
- Location: `/web/src/app/(auth)/`
- Triggers: User visits `/login`, `/signup`, `/auth/callback`
- Responsibilities: Handle authentication UX, exchange auth codes, redirect after success

**Dashboard Entry:**
- Location: `/web/src/app/(dashboard)/layout.tsx`
- Triggers: User visits `/dashboard` (protected route)
- Responsibilities: Check authentication, render sidebar navigation, enforce org context

**API Entry:**
- Location: `/api/src/main.py`
- Triggers: Server startup (uvicorn)
- Responsibilities: Configure FastAPI app, register CORS, load routes, setup lifespan hooks

**Health Check Entry:**
- Location: `/api/src/routes/health.py`
- Triggers: GET `/health`, `/health/live`, `/health/ready`
- Responsibilities: Verify API and database connectivity, return Kubernetes probe responses

**Auth API Entry:**
- Location: `/api/src/routes/auth.py`
- Triggers: GET `/api/v1/auth/me`
- Responsibilities: Verify Bearer token, return current user info from Supabase metadata

## Error Handling

**Strategy:** Graceful degradation with user-facing feedback

**Patterns:**

- **Frontend Auth Errors:** Supabase auth errors caught, displayed in error message div, loading state reset
  - Example: `src/app/(auth)/login/page.tsx` lines 20-37
  - User sees: "Invalid credentials" or specific error message

- **Frontend Route Errors:** Middleware redirects to login for unauthenticated dashboard access
  - Example: `src/lib/supabase/middleware.ts` lines 41-48
  - User sees: Automatic redirect to login page

- **API Auth Errors:** Missing/invalid Bearer token returns 401 HTTPException
  - Example: `src/routes/auth.py` lines 25-31
  - Client sees: 401 status code, "Missing or invalid authorization header"

- **Database Connection Errors:** Health check catches exceptions, returns degraded status
  - Example: `src/routes/health.py` lines 18-24
  - Monitoring sees: Database status as "unhealthy" with error details

- **Form Validation:** HTML5 validation + optional client-side checks
  - Example: `src/app/(auth)/signup/page.tsx` lines 105-127
  - User sees: Browser native validation messages

## Cross-Cutting Concerns

**Logging:**
- Frontend: `console.log` (captured by browser dev tools)
- Backend: Print statements to stdout (captured by container logs)
- No structured logging framework yet; appropriate for early stage

**Validation:**
- Frontend: HTML5 form validation (required, type=email, minLength)
- Backend: Pydantic models auto-validate request data (BaseModel, EmailStr)
- Database: Column constraints (NOT NULL, UNIQUE, REFERENCES)

**Authentication:**
- Supabase Auth handles credential storage, token generation, session management
- Frontend: Cookie-based sessions (Supabase SSR cookies in middleware)
- API: Bearer token verification via `supabase.auth.get_user(token)`
- RLS: Database-level enforcement of data isolation by organization

**CORS:**
- FastAPI middleware allows frontend origin (configurable via `ALLOWED_ORIGINS` env var)
- Credentials enabled for cookie-based auth if needed
- Applies to all origins in dev; restricted in production

**Configuration:**
- Frontend: Environment variables (NEXT_PUBLIC_* for browser access)
- Backend: Pydantic Settings loads from .env file
- Database: Migrations in version control, applied at deploy time

**Rate Limiting:** Not detected - no middleware for this, would be needed for production

---

*Architecture analysis: 2026-02-26*
