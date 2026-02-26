# AIDEAS

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
