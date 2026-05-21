# api/

AIDEAS backend. FastAPI service that owns external integrations, public-form intake, and any operation that doesn't belong in a Next.js Server Component.

> Production URL: **https://api.aideas.ca** (TBD)
> Consumers: `landing/` (public endpoints only) and `web/` (client + admin endpoints)
> Single Supabase project shared with `web/` server components.

---

## Quick start

```bash
cd api
python -m venv venv
source venv/Scripts/activate          # Git Bash on Windows
# or:  source venv/bin/activate       # macOS/Linux
pip install -r requirements/dev.txt
cp .env.example .env                  # fill in SUPABASE_URL / SUPABASE_KEY
uvicorn src.main:app --reload         # → http://localhost:8000
```

Docs: http://localhost:8000/docs (Swagger UI) or http://localhost:8000/redoc.

## Audience namespaces (Phase 30 reorg)

Routes are grouped under three audience-scoped prefixes. Auth dependencies attach at the namespace router level, never on individual endpoints.

| Prefix | Auth | Rate limit | Who calls it |
|--------|------|------------|--------------|
| `/api/v1/health` | none | none | uptime probes, load balancers |
| `/api/v1/public/*` | none | per-endpoint (3-5/min) | `landing/` (anonymous visitors) |
| `/api/v1/client/*` | Supabase JWT | per-endpoint | `web/` (authenticated customers) |
| `/api/v1/admin/*` | JWT + `platform_staff` role | per-endpoint | `web/` (admin surfaces) |

Adding a new endpoint:

1. Pick the namespace based on who calls it (anyone / logged-in customer / staff).
2. Add a file under `api/src/routes/<namespace>/<feature>.py` exporting `router: APIRouter`.
3. Import + include it inside `api/src/routes/<namespace>/__init__.py`.
4. Don't re-attach `Depends(get_current_user)` or `Depends(get_platform_staff)` — the namespace router already does it.

## Current endpoints (Phase 30)

```
GET  /api/v1/health
POST /api/v1/public/contact      (landing contact form, 3/min, honeypot)
POST /api/v1/public/waitlist     (landing email gate, 5/min, honeypot)
GET  /api/v1/client/auth/status  (verify Supabase session, 5/min)
```

The admin namespace is wired but has no endpoints yet — they land in Phase 31 (lead inbox) and later admin work.

## Dependencies

Defined in `src/dependencies.py`:

- **`get_supabase`** — returns the shared Supabase client from `app.state`.
- **`get_current_user`** — validates the Bearer JWT via `supabase.auth.get_user()` (server-authoritative, not local decode). Raises `401` on missing/invalid/expired.
- **`get_platform_staff`** — layered on top of `get_current_user`. Looks up the user in the `platform_staff` table, requires role `super_admin` or `operator`. Raises `403` if authenticated but not staff.

## CORS

Configured in `src/main.py` from `ALLOWED_ORIGINS` (comma-separated env var).

Default dev origins:

```
http://localhost:5173    landing/
http://localhost:3000    web/
```

Production:

```
https://aideas.ca        landing/
https://app.aideas.ca    web/
```

`allow_credentials=True` is set so the dashboard can send Supabase cookies.

## API strategy (mirrors `CLAUDE.md`)

Hybrid pragmatic. FastAPI is the **single backend** but Next.js Server Components keep reading Supabase directly for queries that already exist. New features default to FastAPI. Rule: **if in doubt, FastAPI.**

What lives here:

- All public endpoints (the landing must never touch Supabase directly).
- Webhooks (Stripe, n8n, Resend).
- Long-running jobs (>5s).
- Secret-bearing integrations.
- Anything a future mobile/B2B client would need.

What stays in `web/` Server Components:

- Reading data to render dashboard pages.
- Mutating the user's own state (profile, automation status, settings).
- Anything already shipped and working.

## File structure

```
api/
├── src/
│   ├── main.py                  # FastAPI app + lifespan + CORS + router include
│   ├── config.py                # Pydantic settings (env-driven)
│   ├── dependencies.py          # get_supabase, get_current_user, get_platform_staff
│   ├── middleware.py            # slowapi limiter
│   ├── logging_config.py        # structured logging
│   ├── routes/
│   │   ├── health.py
│   │   ├── public/              # contact, waitlist
│   │   ├── client/              # auth.py (status), future customer endpoints
│   │   └── admin/               # future staff-only endpoints
│   ├── services/                # cross-route business logic
│   └── models/                  # pydantic shapes shared across endpoints
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── Dockerfile
├── .env.example
└── README.md
```

## Environment variables

| Var | Required | Purpose |
|-----|----------|---------|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_KEY` | yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_KEY` | recommended | Service role key for admin ops |
| `ALLOWED_ORIGINS` | yes | Comma-separated CORS origins |
| `ENVIRONMENT` | optional | `development` (default), `staging`, `production` |
| `DEBUG` | optional | `true` enables FastAPI debug |
| `SECRET_KEY` | optional | App-level secret (placeholder for future signed payloads) |
| `RESEND_API_KEY` | future | Wired in Phase 31 |
| `STRIPE_SECRET_KEY` | future | Wired in v1.4 |
| `STRIPE_WEBHOOK_SECRET` | future | Wired in v1.4 |

See `.env.example` for the full template.

## Rate limiting

`slowapi` with in-memory storage. Limits attach per endpoint via `@limiter.limit("N/minute")`. For production at scale, swap to Redis-backed storage (slowapi supports it via env config — not enabled yet).

## Deploy

- **Local:** `uvicorn src.main:app --reload`
- **Container:** `docker build -t aideas-api . && docker run -p 8000:8000 aideas-api` (see `Dockerfile`)
- **Railway / Fly / Render:** point at this directory, build command `pip install -r requirements/prod.txt`, run command `uvicorn src.main:app --host 0.0.0.0 --port $PORT`.

## Conventions

- **One file per feature** inside a namespace. Keep route files small (< 200 lines).
- **Pydantic models live in the route file** unless reused across files; then move to `src/models/`.
- **Never bypass auth dependencies.** If an endpoint needs to skip auth temporarily for debugging, do it via `ENVIRONMENT=development` checks inside the dependency, not by removing the dependency.
- **Log structured.** Use `logger.info(msg, extra={...})`. Don't `print()`.
- **Honeypots on public forms.** Add an optional `website` field; non-empty = bot, silently accept (return 200) but never persist.
- **No table assumptions.** If a feature depends on a not-yet-created Supabase table, degrade gracefully (log + return success with `persisted: false`) so the form keeps working through the migration window.
