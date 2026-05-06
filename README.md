# AIDEAS

## Quick Start (desarrollo local)

### Prerequisitos

- **Docker Desktop** instalado y corriendo
- **Node.js 20+**
- **Python 3.12+** (solo si necesitas el API backend)

### Paso 1: Base de datos (Supabase local)

```bash
cd c:\dev\12ai

# Levanta PostgreSQL, Auth, Storage en Docker (primera vez tarda ~5 min)
npx supabase start

# Crea tablas y carga datos de prueba
npx supabase db reset
```

> Los warnings de `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` se pueden ignorar (solo afectan login con Google).

### Paso 2: Frontend (Next.js)

```bash
cd c:\dev\12ai\web
npm run dev
```

Abre http://localhost:3000

### Paso 3 (opcional): Backend API (FastAPI)

Solo necesario si trabajas con las rutas del API Python. El dashboard y auth funcionan sin esto.

```bash
cd c:\dev\12ai\api
venv\Scripts\activate
uvicorn src.main:app --reload
```

### Usuarios de prueba

Todos usan password: `Password123@`

| Email | Organizacion | Rol |
|-------|-------------|-----|
| alice@acmecorp.com | Acme Corp | Admin (mas datos de prueba) |
| bob@acmecorp.com | Acme Corp | Member |
| carol@globaltech.io | GlobalTech | Admin |
| dave@globaltech.io | GlobalTech | Member |
| dev@jappi.ca | Dev | Dev |

### Herramientas utiles

| Herramienta | URL | Para que sirve |
|-------------|-----|----------------|
| App | http://localhost:3000 | Frontend Next.js |
| Supabase Studio | http://127.0.0.1:54323 | Explorar DB, ver tablas, editar datos |
| Mailpit | http://127.0.0.1:54324 | Ver emails enviados (verificacion, recovery) |
| API Docs | http://localhost:8000/docs | Swagger del backend Python (si esta corriendo) |

### Problemas comunes

- **"fetch failed" en consola**: Supabase no esta corriendo. Abre Docker Desktop y corre `npx supabase start`
- **"Invalid login credentials"**: Corre `npx supabase db reset` para recargar los usuarios seed
- **Pagina en blanco despues de login**: Limpia cookies del navegador o abre en incognito

---

AI-powered automation solutions for small and medium businesses.

## Overview

AIDEAS provides managed AI automation services that help businesses eliminate repetitive tasks, reduce operational waste, and optimize processes. Unlike DIY platforms, AIDEAS handles everything - customers describe their needs, and we implement the solution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AIDEAS PLATFORM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Landing (aideas.com)      👤 App (app.aideas.com)      │
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │ Static HTML     │          │ Next.js 14      │          │
│  │ Bootstrap 5     │          │ React 18 + TS   │          │
│  │ SCSS + GSAP     │          │ Tailwind CSS    │          │
│  └─────────────────┘          └─────────────────┘          │
│         │                              │                    │
│         └──────────┬───────────────────┘                    │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ 🔌 API Backend  │                               │
│           │ api.aideas.com  │                               │
│           │ FastAPI/Python  │                               │
│           └─────────────────┘                               │
│                    │                                        │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ 🗄️ Supabase     │                               │
│           │ PostgreSQL      │                               │
│           │ Auth + Realtime │                               │
│           └─────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
12ai/
├── landing/              # Static landing page (aideas.com)
│   ├── index.html
│   ├── pages/            # Additional pages (pricing, features, contact)
│   └── assets/
│       ├── css/          # Compiled CSS
│       ├── scss/         # SCSS source
│       ├── js/           # JavaScript
│       ├── images/       # Images
│       └── vendor/       # Third-party libraries
│
├── web/                  # Next.js frontend (app.aideas.com)
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── public/           # Static assets
│
├── api/                  # FastAPI backend (api.aideas.com)
│   ├── src/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── requirements/
│
├── supabase/             # Database migrations
│   └── migrations/
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── PRD-aideas.md
│   ├── PRODUCT-BACKLOG.md
│   └── DEPLOYMENT.md
│
└── .github/              # CI/CD workflows
    └── workflows/
```

## Tech Stack

| Component | Technology | Hosting |
|-----------|------------|---------|
| Landing | HTML/CSS/JS + Bootstrap 5 + GSAP | Vercel |
| Frontend | Next.js 14 + React 18 + TypeScript | Vercel |
| Backend | FastAPI + Python 3.12 | Railway |
| Database | PostgreSQL | Supabase |
| Auth | Supabase Auth | Supabase |
| Realtime | Supabase Realtime | Supabase |
| Storage | Supabase Storage | Supabase |
| Payments | Stripe | - |
| Email | Resend | - |
| DNS/CDN | Cloudflare | - |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Supabase CLI
- Vercel CLI (optional)
- Railway CLI (optional)

### Landing Page

```bash
cd landing

# If using SCSS compilation
npm install
npm run scss:watch

# Otherwise, just open index.html in browser
```

### Frontend (Next.js)

```bash
cd web

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Backend (FastAPI)

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements/dev.txt

# Create .env
cp .env.example .env
# Edit with your credentials

# Run development server
uvicorn src.main:app --reload

# Open http://localhost:8000/docs
```

### Database

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
# Landing (Vercel)
cd landing && vercel --prod

# Frontend (Vercel)
cd web && vercel --prod

# Backend (Railway)
cd api && railway up
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Technical architecture details
- [PRD](docs/PRD-aideas.md) - Product requirements document
- [Backlog](docs/PRODUCT-BACKLOG.md) - Product backlog with user stories
- [Deployment](docs/DEPLOYMENT.md) - Deployment guide

## Development

### Code Style

- **Frontend:** ESLint + Prettier (Next.js defaults)
- **Backend:** Black + isort + ruff

### Testing

```bash
# Frontend
cd web && npm run test

# Backend
cd api && pytest
```

## License

Proprietary - All rights reserved.

---

*Built with Claude Code*
