# Codebase Structure

## Directory Layout

```
12ai/
├── .env                        # Root environment variables (Supabase, Stripe, Resend)
├── .env.example                # Environment template
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       ├── deploy-production.yml
│       └── deploy-staging.yml
├── api/                        # Python FastAPI backend
│   ├── .env                    # API-specific env
│   ├── requirements.txt        # Python dependencies
│   └── src/
│       ├── __init__.py
│       ├── config.py           # Settings via pydantic-settings
│       ├── main.py             # FastAPI app entry point
│       ├── models/             # Pydantic models (empty)
│       │   └── __init__.py
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── auth.py         # /api/v1/auth/* endpoints
│       │   └── health.py       # /health, /health/live, /health/ready
│       └── services/           # Business logic (empty)
│           └── __init__.py
├── docs/                       # Project documentation
│   ├── AIDEAS-proyecto.md      # Project concept
│   ├── ARCHITECTURE.md         # Architecture design doc
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── PRD-aideas.md           # Product Requirements Document
│   ├── PRODUCT-BACKLOG.md      # Full backlog
│   ├── SPRINT-01.md            # Sprint 1 plan
│   └── SPRINT-02.md            # Sprint 2 plan
├── supabase/                   # Supabase configuration & migrations
│   ├── config.toml             # Supabase CLI config
│   ├── migrations/
│   │   ├── 000_drop_all.sql    # Reset migration
│   │   ├── 001_initial_schema.sql  # Full schema (13 tables)
│   │   └── 002_fix_rls_policies.sql
│   └── seed.sql                # Seed data
├── web/                        # Next.js frontend
│   ├── .env.local              # Frontend env (NEXT_PUBLIC_*)
│   ├── components.json         # shadcn/ui configuration
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx      # Root layout (Geist fonts)
│       │   └── page.tsx        # Homepage
│       ├── lib/
│       │   └── utils.ts        # cn() utility (clsx + tailwind-merge)
│       └── middleware.ts       # Supabase session management
└── README.md
```

## Key Locations

| Purpose | Location |
|---------|----------|
| API entry point | `api/src/main.py` |
| API configuration | `api/src/config.py` |
| API routes | `api/src/routes/` |
| Frontend entry point | `web/src/app/page.tsx` |
| Frontend layout | `web/src/app/layout.tsx` |
| Auth middleware | `web/src/middleware.ts` |
| Database schema | `supabase/migrations/001_initial_schema.sql` |
| RLS policies | `supabase/migrations/001_initial_schema.sql` (bottom) + `002_fix_rls_policies.sql` |
| Seed data | `supabase/seed.sql` |
| CI/CD | `.github/workflows/` |
| Project docs | `docs/` |
| Environment config | `.env`, `.env.example`, `api/.env`, `web/.env.local` |

## Naming Conventions

- **Files:** snake_case for Python (`config.py`, `auth.py`), kebab-case or camelCase for TypeScript
- **Directories:** lowercase, no separators (`routes/`, `services/`, `models/`)
- **Database tables:** snake_case plural (`organization_members`, `automation_templates`)
- **Database columns:** snake_case (`created_at`, `stripe_customer_id`)
- **API routes:** kebab-case with version prefix (`/api/v1/auth/me`)
- **Environment vars:** SCREAMING_SNAKE_CASE (`SUPABASE_URL`, `STRIPE_SECRET_KEY`)

## Monorepo Structure

This is an **informal monorepo** (no workspace manager like Turborepo/Nx):
- `web/` - Independent Next.js project with its own `package.json`
- `api/` - Independent Python project with its own `requirements.txt`
- `supabase/` - Database migrations managed by Supabase CLI
- Root `.env` shared across services via relative path references
