# AIDEAS

AI automation as a service for Ontario small and medium businesses. Customers describe what they need, AIDEAS designs, builds, and runs the automation — managed service, not DIY.

This repository is organized as **three independent paralel modules** under a single root:

```
12ai/
├── landing/   → Public marketing site (Vite + React + Bootstrap)   → aideas.ca
├── web/       → Dashboard (Next.js + React + Tailwind + shadcn)    → app.aideas.ca
├── api/       → Backend (FastAPI + Python)                          → api.aideas.ca
├── supabase/  → Shared database (migrations + seed)
├── scripts/   → Cross-module tooling (sync-tokens.js, etc.)
└── .planning/ → GSD planning artifacts (PROJECT, ROADMAP, phases)
```

Each module has its own `README.md`, `package.json`/`requirements/`, and deploy. They are not a monorepo with shared packages — they are independent projects living in the same git repo, glued together by `tokens.json` (visual parity) and the FastAPI contract.

## Quick start (full stack locally)

You need **Docker Desktop**, **Node.js 20+**, and **Python 3.12+**.

```bash
# 1. Database (Supabase local — first run takes ~5 min)
npx supabase start
npx supabase db reset

# 2. Landing (Vite — http://localhost:5173)
cd landing && npm install && npm run dev

# 3. Dashboard (Next.js — http://localhost:4000)
cd web && npm install && cp .env.example .env.local && npm run dev

# 4. Backend (FastAPI — http://localhost:8000)
cd api && python -m venv venv && source venv/Scripts/activate
pip install -r requirements/dev.txt
cp .env.example .env
uvicorn src.main:app --reload
```

You don't need all four running at once. Most dashboard work needs `web/` + `supabase/`. Landing work needs `landing/` alone (unless you're testing the contact form, then add `api/`).

## Module READMEs

- [`landing/README.md`](landing/README.md) — Vite + Orisa template, 6 public routes, design tokens source.
- [`web/README.md`](web/README.md) — Next.js dashboard + admin, Tailwind 4 + shadcn/ui, Supabase server components.
- [`api/README.md`](api/README.md) — FastAPI with `public/`, `client/`, `admin/` namespaces and hybrid API strategy.

## Architecture

```
                    aideas.ca                  app.aideas.ca
                  ┌──────────────┐            ┌──────────────┐
                  │   landing/   │  Log in →  │     web/     │
                  │  (Vite SPA)  │            │  (Next.js)   │
                  └──────┬───────┘            └──────┬───────┘
                         │                           │
            POST /public │      GET/POST /client     │
                         │      GET/POST /admin      │
                         ▼                           ▼
                       ┌──────────────────────────────┐
                       │            api/              │
                       │  FastAPI — single backend    │
                       │  Namespaces: public, client, │
                       │              admin           │
                       └─────────────┬────────────────┘
                                     │
                                     ▼
                       ┌──────────────────────────────┐
                       │         Supabase             │
                       │  Postgres + Auth + Realtime  │
                       │  + Storage                   │
                       └──────────────────────────────┘
```

**API strategy (hybrid pragmatic):** the dashboard (`web/`) reads Supabase directly from Server Components for queries already shipped. FastAPI handles **all** public endpoints (the landing must never touch Supabase directly), webhooks, long-running jobs, and secret-bearing integrations. New features default to FastAPI; existing Server Components stay. See "API Strategy" in [`CLAUDE.md`](CLAUDE.md).

## Tech stack

| Module | Stack |
|--------|-------|
| `landing/` | Vite 6, React 19, TypeScript, Bootstrap 5.3, GSAP 3.12, Swiper 11, DM Sans, Orisa template |
| `web/` | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, next-intl, Supabase SSR, Recharts |
| `api/` | FastAPI, Python 3.12, supabase-py, pydantic-settings, slowapi |
| Database | Supabase (managed Postgres + Auth + Realtime + Storage) |
| Hosting | Vercel (`landing/` + `web/`), Railway or Fly (`api/`), Supabase (DB) |

## Seed users (local dev)

All use password `Password123@`.

| Email | Org | Role |
|-------|-----|------|
| alice@acmecorp.com | Acme Corp | Owner (most seed data) |
| bob@acmecorp.com | Acme Corp | Member |
| carol@globaltech.io | GlobalTech | Owner |
| dave@globaltech.io | GlobalTech | Member |
| dev@jappi.ca | Dev | Platform staff (admin) |

## Useful URLs (local)

| URL | What |
|-----|------|
| http://localhost:5173 | landing/ — public marketing site |
| http://localhost:4000 | web/ — dashboard (login required) |
| http://localhost:8000/docs | api/ — Swagger UI |
| http://127.0.0.1:54323 | Supabase Studio — DB explorer |
| http://127.0.0.1:54324 | Mailpit — captured outgoing emails |

## Design tokens

`landing/tokens.json` is the single source of truth for design tokens (colors, typography, spacing, radii, breakpoints). It is copied byte-identical to `web/tokens.json` via `node scripts/sync-tokens.js`. `node scripts/check-tokens-sync.js` is the CI guard. The dashboard does NOT consume tokens yet — it keeps its own Factory.ai palette in `web/src/app/globals.css` until a future reskin phase reconciles the two systems.

## Methodology

This project uses the GSD (Get Stuff Done) planning methodology. Every phase lives in `.planning/phases/XX-name/` with `CONTEXT.md`, `XX-NN-PLAN.md`, `XX-NN-SUMMARY.md`, and a `VERIFICATION.md`. The current state is always summarised in `.planning/ROADMAP.md`.

## Common issues

- **"fetch failed" in console** — Supabase is not running. Start Docker Desktop and run `npx supabase start`.
- **"Invalid login credentials"** — Run `npx supabase db reset` to re-seed users.
- **Blank page after login** — Clear browser cookies or open in incognito.
- **Landing styles broken** — `cd landing && npm install` may not have completed; re-run.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — global rules for AI-assisted work (language policy, conventions, sensitive areas, architecture patterns, API strategy).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture details.
- [`.planning/REORG-V2-PLAN.md`](.planning/REORG-V2-PLAN.md) — the v1.3 three-module reorganization plan (current milestone).

## License

Proprietary — all rights reserved.
