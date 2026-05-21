# web/

AIDEAS dashboard. Next.js 16 app that serves all authenticated surfaces: customer dashboard (`/dashboard/*`), platform-staff admin (`/admin/*`), and auth flows (`/login`, `/signup`, etc.).

> Production URL: **https://app.aideas.ca**
> Sibling apps in this repo: `landing/` (Vite, public site at aideas.ca) and `api/` (FastAPI backend).

---

## Quick start

```bash
cd web
npm install
cp .env.example .env.local            # fill in Supabase URL + keys
npm run dev                           # → http://localhost:4000
```

Build: `npm run build` → `npm run start` (production server).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirect — auth users go to `/dashboard`, unauth users go to `NEXT_PUBLIC_LANDING_URL` (the landing module) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth flows |
| `/dashboard/*` | Customer dashboard (Home, Automations, Catalog, Reports, Billing, Settings, Notifications) |
| `/admin/*` | Platform-staff surfaces (Home, Catalog, Requests, Automations, Clients) |
| `/terms`, `/privacy` | Legal pages |

Middleware in `src/lib/supabase/middleware.ts` enforces auth gates and the dashboard/admin split. Customers on `/admin/*` get redirected to `/dashboard`; staff on `/dashboard/*` get redirected to `/admin`.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** (config-in-CSS via `@theme inline` in `src/app/globals.css`)
- **shadcn/ui** for primitives (Radix-based, copy-paste components in `src/components/ui/`)
- **next-intl 4** for i18n (EN/ES, cookie-based locale)
- **Supabase** via `@supabase/ssr` — cookies + RLS for auth and data
- **Recharts** for dashboard charts
- **Zod** + **React Hook Form** for validation
- **Lucide** for icons

## Data strategy (matches CLAUDE.md "API Strategy")

Hybrid pragmatic. This app keeps reading Supabase directly from Server Components for everything already shipped:

- KPI cards, automation lists, catalog queries, report aggregations.
- Form mutations that map cleanly to one Supabase write (profile edits, status toggles, etc.).

What the dashboard does **not** do:

- It does not call Supabase from public surfaces. There are none here — the landing site is a separate module.
- It does not implement new public forms, webhooks, or long-running jobs. Those go to `api/` (FastAPI). See the "API Strategy" section in `CLAUDE.md` at the repo root.

When a new feature would obviously benefit a future mobile/B2B client, build it in `api/` and call it from here. When in doubt, FastAPI.

## File structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # `/` redirect (auth → /dashboard, unauth → landing)
│   │   ├── layout.tsx
│   │   ├── globals.css           # Tailwind 4 @theme inline + Factory.ai palette
│   │   ├── (auth)/               # login, signup, verify-email, forgot-password, reset-password
│   │   ├── (dashboard)/          # customer dashboard surfaces
│   │   ├── (admin)/              # platform_staff surfaces
│   │   └── (legal)/              # terms, privacy
│   ├── components/
│   │   ├── ui/                   # shadcn primitives (Button, Card, Input, ...)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── lib/
│   │   ├── actions/              # Server Actions (auth, settings, automations, ...)
│   │   ├── supabase/             # client + server + middleware Supabase configs
│   │   ├── dashboard/queries.ts  # all dashboard data fetchers
│   │   ├── admin/                # admin queries + types
│   │   ├── auth/assert-platform-staff.ts
│   │   ├── validations/          # Zod schemas
│   │   └── utils.ts              # cn() helper
│   ├── i18n/                     # next-intl request config
│   └── middleware.ts             # auth gates + dashboard/admin split
├── messages/                     # en.json, es.json
├── components.json               # shadcn config
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── tokens.json                   # mirror of landing/tokens.json (parity only, not consumed yet)
├── .env.example
└── package.json
```

## Environment variables

| Var | Required | Purpose |
|-----|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Admin key — server-only, never expose |
| `NEXT_PUBLIC_SITE_URL` | yes | Where this app is served (OAuth callbacks need it) |
| `NEXT_PUBLIC_LANDING_URL` | yes | Where the landing module is served — root `/` redirects here for unauth users |
| `NEXT_PUBLIC_API_URL` | yes | FastAPI backend URL — used by client/admin features that hit FastAPI |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | optional | reCAPTCHA v3 on signup; if empty, dev-bypass activates |
| `RECAPTCHA_SECRET_KEY` | optional | Server-side reCAPTCHA verification |

See `.env.example`.

## Design tokens

`web/tokens.json` mirrors `landing/tokens.json` for tooling parity (run `node scripts/sync-tokens.js` from repo root to re-sync; `scripts/check-tokens-sync.js` is the CI guard). It is **not** consumed by Tailwind in this app — the dashboard keeps its existing Factory.ai palette in `src/app/globals.css` until a future reskin phase reconciles the two systems.

## Conventions

- **Server Components by default.** `"use client"` only when needed (forms with state, browser APIs, charts that hydrate).
- **Imports use the `@/` alias.** Never relative across folders (`../../..`).
- **No React Query / SWR.** Server Components + Supabase Realtime is the data model.
- **i18n keys live in both `messages/en.json` and `messages/es.json`.** Any new UI string adds entries to both files.
- **No `any`.** TypeScript strict is on. Use discriminated unions for action results.
- **`cn()` for Tailwind class merging.** Not `clsx` directly, not template strings.
- **Atomic, conventional commits with phase scope** (`feat(11-02): ...`, `fix(auth): ...`). One logical change per commit.

## Deploy

- **Vercel** — point at `web/` directory, framework auto-detected as Next.js.
- Set every `NEXT_PUBLIC_*` env var in the Vercel project settings.
- Custom domain → `app.aideas.ca`.
- Middleware runs on Edge by default; nothing extra to configure.

## Methodology

This module follows the GSD (Get Stuff Done) planning methodology — all phase artifacts live in `.planning/` at the repo root, not inside `web/`. See `.planning/PROJECT.md` and `.planning/ROADMAP.md`.
