# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- TypeScript 5.x - Frontend (web) with Next.js
- Python 3.12 - Backend API with FastAPI

**Secondary:**
- SQL - Database schema and migrations (PostgreSQL via Supabase)
- TOML - Configuration (Supabase CLI config)

## Runtime

**Environment:**
- Node.js - for Next.js frontend development and build
- Python 3.12 - for FastAPI backend

**Package Manager:**
- npm - Frontend dependencies (see `web/package.json`)
- pip - Backend dependencies (see `api/requirements.txt`)
- Lockfile: npm (`web/package-lock.json` inferred), pip frozen requirements present

## Frameworks

**Core:**
- Next.js 16.1.6 - React SSR/SSG framework for web UI (`web/`)
- FastAPI 0.109.0+ - Async Python web framework for REST API (`api/`)
- React 19.2.3 - Frontend UI library with Next.js

**Testing:**
- pytest - Python backend testing (referenced in CI pipeline)
- Codecov - Coverage reporting integration

**Build/Dev:**
- TypeScript 5.x - Type checking and transpilation
- Tailwind CSS 4.x - Utility-first CSS framework
- ESLint 9.x - JavaScript/TypeScript linting
- Ruff - Python linting
- Black - Python code formatting
- MyPy - Python type checking
- Uvicorn - ASGI server for FastAPI applications

## Key Dependencies

**Critical - Frontend:**
- @supabase/supabase-js 2.95.0 - Supabase client for authentication and database access
- @supabase/ssr 0.8.0 - Server-side Supabase integration for Next.js
- react-hook-form 7.71.1 - Form state management
- zod 4.3.6 - TypeScript-first schema validation
- @hookform/resolvers 5.2.2 - Validation resolver for react-hook-form

**Critical - Frontend UI:**
- lucide-react 0.563.0 - Icon library
- radix-ui 1.4.3 - Unstyled, accessible component primitives
- class-variance-authority 0.7.1 - CSS class composition
- tailwind-merge 3.4.0 - Tailwind CSS class merging utility
- clsx 2.1.1 - Conditional className utility

**Critical - Backend:**
- supabase 2.3.0 - Supabase Python client
- stripe 7.0.0 - Stripe payment processing SDK
- resend 0.7.0 - Email sending service client
- httpx 0.26.0 - Async HTTP client for external API calls
- pydantic 2.5.0+ - Data validation using Python type hints
- pydantic-settings 2.1.0+ - Environment configuration management
- python-multipart 0.0.6 - Multipart form data parsing

**Infrastructure - Backend:**
- uvicorn[standard] 0.27.0+ - ASGI server with uvloop and httptools
- python-dotenv 1.0.0 - Environment variable loading from .env files

## Configuration

**Environment:**
- Environment variables via `.env` file (see `.env.example` for required vars)
- Separate configurations for development, staging, and production
- Settings loaded via Pydantic `BaseSettings` in `api/src/config.py`

**Required Environment Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous (client) API key
- `SUPABASE_SERVICE_KEY` - Supabase service role key (backend only)
- `STRIPE_SECRET_KEY` - Stripe secret API key (optional but needed for payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)
- `RESEND_API_KEY` - Resend email service API key (optional)
- `EMAIL_FROM` - Default sender email address
- `SECRET_KEY` - Application secret key
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `ENVIRONMENT` - development/staging/production
- `DEBUG` - Enable debug mode (true/false)

**Frontend-Specific Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL (exposed to browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key (exposed to browser)
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend requests
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

**Build:**
- TypeScript configuration: `web/tsconfig.json`
  - Target: ES2017
  - Strict mode enabled
  - Path aliases: `@/*` maps to `web/src/*`
- Next.js configuration: `web/next.config.ts` (minimal, using defaults)
- Supabase CLI configuration: `supabase/config.toml`
  - API port: 54321
  - Database port: 54322
  - Studio port: 54323
  - Auth redirect URLs configured

## Platform Requirements

**Development:**
- Node.js (latest LTS recommended for Next.js 16.x)
- Python 3.12
- Docker + Docker Compose (optional, for Supabase local development)
- Supabase CLI (for local development and migrations)

**Production:**
- Node.js runtime for Next.js server
- Python 3.12 runtime for FastAPI backend
- PostgreSQL 15+ database (via Supabase)
- Deployment: Railway.com (see GitHub Actions workflows)
- Git for version control and CI/CD

## CI/CD

**Pipeline Tools:**
- GitHub Actions - Automated testing and deployment
- Railway CLI - Deployment to Railway hosting platform
- Codecov - Test coverage tracking

**Testing in CI:**
- Linting: Ruff for Python
- Format checking: Black for Python code formatting
- Type checking: MyPy for Python type safety
- Unit tests: pytest for Python backend
- Coverage: Generated and uploaded to Codecov

---

*Stack analysis: 2026-02-26*
