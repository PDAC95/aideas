# aideas

> AI-powered automation platform for SMBs

[![License](https://img.shields.io/badge/license-Private-red.svg)]()

## Overview

**aideas** is a SaaS platform that democratizes access to AI solutions for small and medium businesses, enabling them to automate repetitive processes without prohibitive costs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL 16, Redis |
| **Infrastructure** | Vercel, Railway, Cloudflare |
| **Auth** | Clerk |
| **Payments** | Stripe |

## Project Structure

```
aideas/
├── apps/
│   ├── landing/          # Landing page (aideas.com)
│   ├── portal/           # Customer portal (app.aideas.com)
│   ├── admin/            # Admin panel (admin.aideas.com)
│   └── api/              # Backend API (api.aideas.com)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
├── docs/                 # Project documentation
└── scripts/              # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.12+
- Docker Desktop

### Installation

```bash
# Clone the repository
git clone https://github.com/PDAC95/aideas.git
cd aideas

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env.local

# Start development
pnpm dev
```

### Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Format code
pnpm format

# Clean all build artifacts
pnpm clean
```

## Apps

### Landing (`apps/landing`)
Marketing website at `aideas.com`

### Portal (`apps/portal`)
Customer dashboard at `app.aideas.com`

### Admin (`apps/admin`)
Internal admin panel at `admin.aideas.com`

### API (`apps/api`)
Backend REST API at `api.aideas.com`

## Documentation

- [PRD](docs/PRD-aideas.md) - Product Requirements Document
- [Architecture](docs/ARCHITECTURE.md) - Technical Architecture
- [Product Backlog](docs/PRODUCT-BACKLOG.md) - Prioritized Backlog
- [Sprint 1](docs/SPRINT-01.md) - Current Sprint

## Contributing

This is a private repository. Please follow the established conventions:

- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Create feature branches from `develop`
- Submit PRs for review before merging

## License

Private - All rights reserved.
