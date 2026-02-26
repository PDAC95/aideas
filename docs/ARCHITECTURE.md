# ARCHITECTURE.md - AIDEAS

**Version:** 3.0
**Created:** January 2026
**Last Updated:** February 2026
**Status:** Active Development

---

## Project Overview

**Product:** AIDEAS - AI Automation as a Service
**Type:** Managed Service Platform (Landing + Customer Portal + API)
**Business Model:** Service-based (not self-service)

**Key Insight:** AIDEAS is NOT a DIY platform. Customers describe their needs, AIDEAS implements the solution. The portal is for monitoring, not building.

---

## System Architecture

### High-Level Architecture

```
                                CLOUDFLARE
                           (DNS + CDN + WAF)
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │    LANDING    │      │   FRONTEND    │      │    BACKEND    │
   │  aideas.com   │      │app.aideas.com │      │api.aideas.com │
   │               │      │               │      │               │
   │ Static HTML   │      │   Next.js     │      │   FastAPI     │
   │ CSS/JS/SASS   │      │   React 18    │      │  Python 3.12  │
   │               │      │   TypeScript  │      │               │
   └───────────────┘      └───────┬───────┘      └───────┬───────┘
           │                      │                      │
           │                      │    ┌─────────────────┤
           │                      │    │                 │
           ▼                      ▼    ▼                 ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │  Vercel/CF    │      │   Supabase    │      │    Railway    │
   │    Pages      │      │               │      │               │
   │   (FREE)      │      │ • Auth        │      │ • FastAPI     │
   │               │      │ • Database    │      │ • Background  │
   │ Static Host   │      │ • Realtime    │      │   Jobs        │
   │               │      │ • Storage     │      │ • Webhooks    │
   └───────────────┘      └───────────────┘      └───────────────┘
                                 │
                                 ▼
                          ┌───────────────┐
                          │  PostgreSQL   │
                          │  (Supabase)   │
                          └───────────────┘
```

### Cost Breakdown (MVP)

| Service | Purpose | Monthly Cost |
|---------|---------|--------------|
| Landing (Vercel/CF Pages) | Static hosting | $0 |
| Frontend (Vercel) | Next.js app | $0-20 |
| Backend (Railway) | FastAPI + Jobs | $5-20 |
| Database (Supabase Pro) | PostgreSQL + Auth + Realtime | $25 |
| **TOTAL** | | **~$30-65/mo** |

---

## Technology Stack

### Landing Page (`landing/`)

```yaml
Type: Static Website
Purpose: Marketing, SEO, lead generation

Technologies:
  - HTML5
  - SCSS/CSS (Bootstrap 5 based)
  - JavaScript (jQuery + plugins)
  - GSAP animations

Build:
  - SASS compilation
  - No framework needed

Hosting:
  - Vercel (preferred)
  - Cloudflare Pages
  - Netlify

Features:
  - 100/100 Lighthouse score
  - SEO optimized
  - Fast load times
  - No server required
```

### Frontend Application (`web/`)

```yaml
Type: React SPA with SSR capabilities
Purpose: Customer portal (dashboard, chat, billing)

Framework: Next.js 14+ (App Router)
Language: TypeScript
UI Library: React 18

Key Dependencies:
  - @supabase/ssr          # Auth & Realtime
  - @tanstack/react-query  # Data fetching
  - shadcn/ui              # Component library
  - tailwindcss            # Styling
  - zustand                # State management (if needed)
  - socket.io-client       # Realtime (alternative to Supabase)

Features:
  - Server Components
  - Client Components for interactivity
  - Realtime chat with Supabase
  - Realtime notifications
  - Responsive design

Hosting: Vercel
```

### Backend API (`api/`)

```yaml
Type: REST API + Background Jobs
Purpose: Business logic, integrations, heavy processing

Framework: FastAPI
Language: Python 3.12+
Server: Uvicorn

Key Dependencies:
  - fastapi               # Web framework
  - supabase-py           # Database client
  - pydantic              # Validation
  - httpx                 # HTTP client
  - celery + redis        # Background tasks (optional)
  - stripe                # Payments
  - resend                # Emails
  - openai / anthropic    # AI integrations

Features:
  - REST API endpoints
  - Webhook handlers (Stripe, Supabase)
  - Background job processing
  - AI automation execution
  - Integration with external services

Hosting: Railway
```

### Database & Auth (Supabase)

```yaml
Database: PostgreSQL 15
Auth: Supabase Auth
  - Email/Password
  - Magic Links
  - OAuth (Google, GitHub) - optional

Realtime: Supabase Realtime
  - Chat messages
  - Notifications
  - Live updates

Storage: Supabase Storage
  - User uploads
  - Generated files

Features:
  - Row Level Security (RLS)
  - Automatic backups
  - Point-in-time recovery
```

---

## Repository Structure

```
aideas/
│
├── landing/                      # aideas.com (Static)
│   ├── index.html               # Homepage
│   ├── features.html            # Features page
│   ├── pricing.html             # Pricing page
│   ├── contact.html             # Contact page
│   ├── 404.html                 # Error page
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.min.css     # Compiled CSS
│   │   ├── scss/
│   │   │   ├── main.scss        # Main SCSS entry
│   │   │   ├── abstracts/       # Variables, mixins
│   │   │   ├── base/            # Reset, typography
│   │   │   ├── components/      # Buttons, forms
│   │   │   ├── layout/          # Header, footer
│   │   │   └── sections/        # Page sections
│   │   ├── js/
│   │   │   ├── main.js          # Main JavaScript
│   │   │   └── plugins.js       # Plugin initializations
│   │   ├── vendor/              # Third-party libs
│   │   │   ├── bootstrap/
│   │   │   ├── gsap/
│   │   │   ├── jquery/
│   │   │   └── ...
│   │   └── images/
│   │       ├── logo.png
│   │       ├── favicon.ico
│   │       └── ...
│   │
│   └── package.json             # SASS build scripts only
│
├── web/                          # app.aideas.com (Next.js)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (portal)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── automations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx     # Realtime support chat
│   │   │   ├── billing/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx       # Portal layout with sidebar
│   │   │
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Redirect to dashboard
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── chat-window.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── message-input.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   └── activity-feed.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── user-menu.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Auth middleware
│   │   ├── api.ts               # FastAPI client
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-chat.ts
│   │   └── use-realtime.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── api/                          # api.aideas.com (FastAPI)
│   ├── src/
│   │   ├── main.py              # FastAPI entry point
│   │   │
│   │   ├── config/
│   │   │   ├── settings.py      # Pydantic settings
│   │   │   └── supabase.py      # Supabase client
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py          # Auth endpoints
│   │   │   ├── users.py         # User management
│   │   │   ├── organizations.py # Org management
│   │   │   ├── automations.py   # Automation CRUD
│   │   │   ├── chat.py          # Chat/support
│   │   │   ├── billing.py       # Stripe integration
│   │   │   └── webhooks.py      # Stripe/Supabase webhooks
│   │   │
│   │   ├── services/
│   │   │   ├── automation_service.py
│   │   │   ├── billing_service.py
│   │   │   ├── chat_service.py
│   │   │   └── email_service.py
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   │
│   │   ├── core/
│   │   │   ├── security.py      # JWT validation
│   │   │   ├── dependencies.py  # FastAPI deps
│   │   │   └── exceptions.py
│   │   │
│   │   └── workers/             # Background tasks
│   │       ├── celery_app.py
│   │       └── tasks/
│   │           ├── automation_tasks.py
│   │           └── email_tasks.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_*.py
│   │
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   │
│   ├── Dockerfile
│   ├── railway.toml
│   └── pyproject.toml
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_chat_tables.sql
│   ├── seed.sql
│   └── config.toml
│
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── PRD-aideas.md           # Product requirements
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── PRODUCT-BACKLOG.md      # Feature backlog
│
├── .github/
│   └── workflows/
│       ├── deploy-landing.yml   # Deploy landing to Vercel
│       ├── deploy-web.yml       # Deploy Next.js to Vercel
│       └── deploy-api.yml       # Deploy FastAPI to Railway
│
├── .gitignore
└── README.md
```

---

## Data Flow

### Authentication Flow

```
1. User visits app.aideas.com/login
2. Next.js renders login page
3. User submits credentials
4. Supabase Auth validates
5. Supabase returns JWT + refresh token
6. Next.js stores tokens (httpOnly cookies)
7. Subsequent requests include JWT
8. FastAPI validates JWT with Supabase
```

### Realtime Chat Flow

```
1. User opens chat in portal
2. Next.js subscribes to Supabase Realtime channel
3. User sends message
4. Message inserted into Supabase DB
5. Supabase broadcasts to all subscribers
6. Admin receives notification
7. Admin responds (same flow)
8. User sees response instantly
```

### Automation Request Flow

```
1. User requests automation via portal
2. Next.js calls FastAPI endpoint
3. FastAPI creates request in Supabase
4. FastAPI notifies admin (email/Slack)
5. Admin implements automation
6. Admin marks as complete
7. User sees status update (realtime)
8. Automation starts running
9. Metrics flow to dashboard (realtime)
```

---

## Database Schema (Core Tables)

```sql
-- Users (managed by Supabase Auth)
-- auth.users table is automatic

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Automations
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'error')),
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation Executions
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id),
    status TEXT CHECK (status IN ('running', 'success', 'error')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result JSONB,
    error TEXT
);

-- Chat Conversations
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id),
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_from_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (Stripe)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    plan TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security

### Authentication
- Supabase Auth (JWT-based)
- httpOnly cookies for token storage
- Automatic token refresh

### Authorization
- Row Level Security (RLS) in Supabase
- Organization-based access control
- Role-based permissions (admin/operator/viewer)

### API Security
- CORS configuration
- Rate limiting
- Input validation (Pydantic)
- HTTPS only

---

## Deployment

### Landing (Vercel/Cloudflare Pages)
- Auto-deploy on push to `main`
- Build: SASS compilation
- CDN: Global edge network

### Frontend (Vercel)
- Auto-deploy on push to `main`
- Build: Next.js build
- Edge functions for middleware

### Backend (Railway)
- Auto-deploy on push to `main`
- Docker container
- Environment variables in Railway

### Database (Supabase)
- Managed PostgreSQL
- Migrations via Supabase CLI
- Automatic backups (Pro plan)

---

## Environment Variables

### Landing
```bash
# No env vars needed (static)
```

### Frontend (Next.js)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.aideas.com
```

### Backend (FastAPI)
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...

OPENAI_API_KEY=sk-...
```

---

## Development Workflow

### Local Setup

```bash
# 1. Clone repo
git clone https://github.com/yourorg/aideas.git
cd aideas

# 2. Landing (optional - just open HTML files)
cd landing
npm install
npm run scss:watch

# 3. Frontend
cd web
npm install
cp .env.example .env.local
npm run dev

# 4. Backend
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
cp .env.example .env
uvicorn src.main:app --reload
```

### Access Points (Local)

| Service | URL |
|---------|-----|
| Landing | Open `landing/index.html` in browser |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Monitoring

- **Errors:** Sentry (frontend + backend)
- **Uptime:** Better Uptime / UptimeRobot
- **Logs:** Railway logs (backend), Vercel logs (frontend)
- **Database:** Supabase dashboard
- **Analytics:** Vercel Analytics (frontend)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial (Next.js monorepo) |
| 2.0 | Feb 2026 | FastAPI + Jinja2 SSR |
| 3.0 | Feb 2026 | **Separated architecture:** Static landing + Next.js frontend + FastAPI backend |

---

## Quick Reference

**Stack:**
- Landing: Static HTML/CSS/JS
- Frontend: Next.js 14 + React 18 + TypeScript
- Backend: FastAPI + Python 3.12
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- Hosting: Vercel (landing + frontend) + Railway (backend)

**Monthly Cost:** ~$30-65

**Key Principle:** Customers don't build - they request. AIDEAS implements.
