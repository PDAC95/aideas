# ARCHITECTURE.md - AIDEAS

**Version:** 1.0
**Created:** January 2026
**Last Updated:** January 2026
**Maintained by:** aideas Team

---

## Project Overview

**Product:** aideas
**Type:** Complete System (Landing + Customer Portal + Admin Portal + API)
**Status:** 🟡 Planning

**MVP Scope:**
- Landing page (aideas.com)
- Customer portal (app.aideas.com)
- Admin portal (admin.aideas.com)
- REST API (api.aideas.com)
- Multi-language support (EN, ES, PT)
- Multi-tenant architecture

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE                                     │
│                         (DNS + CDN + WAF + DDoS)                            │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     LANDING     │       │     PORTAL      │       │      ADMIN      │
│   aideas.com    │       │  app.aideas.com │       │ admin.aideas.com│
│                 │       │                 │       │                 │
│    Next.js 14   │       │    Next.js 14   │       │    Next.js 14   │
│    (Vercel)     │       │    (Vercel)     │       │    (Vercel)     │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │                         │
                                   └────────────┬────────────┘
                                                │
                                                ▼
                              ┌─────────────────────────────┐
                              │         API GATEWAY         │
                              │      api.aideas.com         │
                              │                             │
                              │     FastAPI (Railway)       │
                              │     Python 3.12             │
                              └──────────────┬──────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
          ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
          │   PostgreSQL    │     │      Redis      │     │  Cloudflare R2  │
          │   (Railway)     │     │   (Railway)     │     │    (Storage)    │
          │                 │     │                 │     │                 │
          │   Primary DB    │     │  Cache + Queue  │     │  Files/Assets   │
          └─────────────────┘     └─────────────────┘     └─────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │    Backups      │
          │  (Automated)    │
          └─────────────────┘
```

### Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Frontend / Backend / Database clearly separated |
| **API-First** | Backend exposes RESTful API consumed by all frontends |
| **Multi-Tenant** | Single codebase serves multiple organizations |
| **Stateless Backend** | No session state in API servers (JWT-based) |
| **Security by Default** | Authentication required on all protected endpoints |
| **Scalability** | Designed to scale horizontally when needed |
| **i18n First** | Multi-language support built from day one |

---

## Technology Stack

### Frontend

```yaml
# Core
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Runtime: Node.js 20 LTS

# UI & Styling
CSS Framework: Tailwind CSS 3.x
Component Library: shadcn/ui
Icons: Lucide React
Animations: Framer Motion

# State & Data
State Management: Zustand (global) + React Query (server)
HTTP Client: Axios
Form Handling: React Hook Form + Zod
Date Handling: date-fns

# Internationalization
i18n: next-intl

# Development
Linting: ESLint + Prettier
Testing: Vitest + React Testing Library
E2E Testing: Playwright
Build Tool: Turbopack (Next.js built-in)

# Package Manager
Package Manager: pnpm
```

### Backend

```yaml
# Core
Language: Python 3.12
Framework: FastAPI 0.109+
ASGI Server: Uvicorn

# Database
ORM: SQLAlchemy 2.x
Migrations: Alembic
Database: PostgreSQL 16

# Caching & Queues
Cache: Redis 7.x
Task Queue: Celery + Redis
Rate Limiting: slowapi

# Authentication
Auth Provider: Clerk (external)
JWT Validation: python-jose

# Validation & Serialization
Validation: Pydantic v2
Serialization: Built-in Pydantic

# API Documentation
Docs: Swagger UI + ReDoc (FastAPI built-in)
OpenAPI: 3.1

# Development
Linting: Ruff + Black
Type Checking: mypy
Testing: pytest + pytest-asyncio + httpx
Coverage: pytest-cov

# Package Manager
Package Manager: pip + pip-tools (requirements.txt)
Virtual Environment: venv
```

### Infrastructure & DevOps

```yaml
# Hosting
Frontend Hosting: Vercel
Backend Hosting: Railway
Database Hosting: Railway (PostgreSQL)
Cache Hosting: Railway (Redis)
File Storage: Cloudflare R2

# DNS & CDN
DNS: Cloudflare
CDN: Cloudflare
SSL: Cloudflare (automatic)
WAF: Cloudflare

# Containerization
Containers: Docker
Orchestration: Docker Compose (development)

# CI/CD
CI/CD: GitHub Actions
Registry: GitHub Container Registry

# Version Control
VCS: Git
Repository: GitHub
Branching: GitFlow (main + develop + feature/*)

# Monitoring & Observability
Error Tracking: Sentry
Logging: Structured JSON logs
Uptime Monitoring: Better Uptime (or similar)
```

### External Services

```yaml
# Authentication
Auth: Clerk
  - Social logins (Google, GitHub)
  - MFA support
  - User management UI
  - Webhook events

# Payments
Payments: Stripe
  - Subscriptions
  - Invoicing
  - Customer portal
  - Webhooks

# Email
Transactional Email: Resend
  - API-based sending
  - Templates
  - Analytics

# AI Services
AI APIs:
  - OpenAI (GPT-4, embeddings)
  - Anthropic (Claude)

# Analytics (Phase 2)
Analytics: PostHog or Mixpanel
```

---

## Repository Structure

### Monorepo with Turborepo

```
aideas/
│
├── apps/
│   │
│   ├── landing/                      # aideas.com
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/        # i18n routes
│   │   │   │   │   ├── page.tsx     # Home
│   │   │   │   │   ├── pricing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── features/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── about/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── contact/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── api/
│   │   │   │   │   └── webhook/     # Clerk/Stripe webhooks
│   │   │   │   ├── layout.tsx
│   │   │   │   └── not-found.tsx
│   │   │   │
│   │   │   ├── components/          # Landing-specific
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   ├── Testimonials.tsx
│   │   │   │   ├── CTA.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   │
│   │   ├── public/
│   │   │   ├── images/
│   │   │   └── locales/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── portal/                       # app.aideas.com
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── (auth)/      # Auth layout group
│   │   │   │   │   │   ├── sign-in/
│   │   │   │   │   │   ├── sign-up/
│   │   │   │   │   │   └── layout.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── (dashboard)/ # Dashboard layout group
│   │   │   │   │   │   ├── page.tsx # Dashboard home
│   │   │   │   │   │   ├── automations/
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   └── [id]/
│   │   │   │   │   │   │       └── page.tsx
│   │   │   │   │   │   ├── metrics/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── team/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── billing/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── support/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── layout.tsx
│   │   │   │   │   │
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   └── api/
│   │   │   │
│   │   │   ├── features/            # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types.ts
│   │   │   │   │
│   │   │   │   ├── automations/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── AutomationCard.tsx
│   │   │   │   │   │   ├── AutomationList.tsx
│   │   │   │   │   │   ├── AutomationDetail.tsx
│   │   │   │   │   │   └── RequestAutomationForm.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useAutomations.ts
│   │   │   │   │   │   └── useAutomationMetrics.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── automations.api.ts
│   │   │   │   │   └── types.ts
│   │   │   │   │
│   │   │   │   ├── metrics/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types.ts
│   │   │   │   │
│   │   │   │   ├── team/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types.ts
│   │   │   │   │
│   │   │   │   ├── billing/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── types.ts
│   │   │   │   │
│   │   │   │   └── support/
│   │   │   │       ├── components/
│   │   │   │       ├── hooks/
│   │   │   │       └── types.ts
│   │   │   │
│   │   │   ├── components/          # Shared portal components
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── MobileNav.tsx
│   │   │   │   └── common/
│   │   │   │
│   │   │   ├── hooks/               # Shared hooks
│   │   │   ├── lib/                 # Utilities
│   │   │   └── styles/
│   │   │
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── admin/                        # admin.aideas.com
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── (auth)/
│   │   │   │   │   ├── (dashboard)/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── customers/
│   │   │   │   │   │   ├── automations/
│   │   │   │   │   │   ├── templates/
│   │   │   │   │   │   ├── requests/
│   │   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── settings/
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── customers/
│   │   │   │   ├── automations/
│   │   │   │   ├── templates/
│   │   │   │   ├── requests/
│   │   │   │   └── analytics/
│   │   │   │
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   │
│   │   └── package.json
│   │
│   └── api/                          # api.aideas.com (FastAPI)
│       ├── src/
│       │   ├── main.py              # FastAPI app entry
│       │   │
│       │   ├── config/
│       │   │   ├── __init__.py
│       │   │   ├── settings.py      # Pydantic settings
│       │   │   └── database.py      # DB connection
│       │   │
│       │   ├── modules/             # Feature modules
│       │   │   ├── __init__.py
│       │   │   │
│       │   │   ├── auth/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── dependencies.py
│       │   │   │   └── schemas.py
│       │   │   │
│       │   │   ├── users/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── models.py
│       │   │   │   └── schemas.py
│       │   │   │
│       │   │   ├── organizations/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── models.py
│       │   │   │   └── schemas.py
│       │   │   │
│       │   │   ├── automations/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── models.py
│       │   │   │   ├── schemas.py
│       │   │   │   └── tasks.py     # Celery tasks
│       │   │   │
│       │   │   ├── billing/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── models.py
│       │   │   │   ├── schemas.py
│       │   │   │   └── stripe.py    # Stripe integration
│       │   │   │
│       │   │   ├── support/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── router.py
│       │   │   │   ├── service.py
│       │   │   │   ├── models.py
│       │   │   │   └── schemas.py
│       │   │   │
│       │   │   └── templates/       # Automation templates
│       │   │       ├── __init__.py
│       │   │       ├── router.py
│       │   │       ├── service.py
│       │   │       ├── models.py
│       │   │       └── schemas.py
│       │   │
│       │   ├── core/                # Shared core
│       │   │   ├── __init__.py
│       │   │   ├── security.py      # JWT, permissions
│       │   │   ├── exceptions.py    # Custom exceptions
│       │   │   ├── middleware.py    # CORS, logging, etc.
│       │   │   ├── responses.py     # Standard responses
│       │   │   └── pagination.py    # Pagination utils
│       │   │
│       │   ├── database/
│       │   │   ├── __init__.py
│       │   │   ├── base.py          # SQLAlchemy base
│       │   │   ├── session.py       # DB session
│       │   │   └── migrations/      # Alembic migrations
│       │   │       ├── versions/
│       │   │       ├── env.py
│       │   │       └── alembic.ini
│       │   │
│       │   └── workers/             # Celery workers
│       │       ├── __init__.py
│       │       ├── celery_app.py
│       │       └── tasks/
│       │
│       ├── tests/
│       │   ├── conftest.py
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       │
│       ├── scripts/
│       │   ├── seed_db.py
│       │   └── create_admin.py
│       │
│       ├── requirements/
│       │   ├── base.txt
│       │   ├── dev.txt
│       │   └── prod.txt
│       │
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── pyproject.toml
│       └── README.md
│
├── packages/                         # Shared packages
│   │
│   ├── ui/                          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   ├── Select/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Card/
│   │   │   │   ├── Table/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Alert/
│   │   │   │   ├── Spinner/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                       # Shared utilities
│   │   ├── src/
│   │   │   ├── formatting/
│   │   │   │   ├── date.ts
│   │   │   │   ├── currency.ts
│   │   │   │   └── number.ts
│   │   │   ├── validation/
│   │   │   │   └── schemas.ts
│   │   │   ├── constants/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts              # API response types
│   │   │   ├── user.ts
│   │   │   ├── organization.ts
│   │   │   ├── automation.ts
│   │   │   ├── billing.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                      # Shared configs
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── tailwind/
│           └── preset.js
│
├── docs/                            # Documentation
│   ├── AIDEAS-proyecto.md
│   ├── PRD-aideas.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # CI on PR
│   │   ├── deploy-staging.yml      # Deploy to staging
│   │   └── deploy-production.yml   # Deploy to production
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── scripts/
│   ├── setup.sh                    # Initial setup
│   └── clean.sh                    # Clean all
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── docker-compose.yml              # Local development
├── turbo.json                      # Turborepo config
├── pnpm-workspace.yaml             # pnpm workspaces
├── package.json                    # Root package.json
└── README.md
```

---

## Code Conventions

### Naming Conventions

#### Frontend (TypeScript/React)

```typescript
// === FILES ===
ComponentName.tsx        // React components (PascalCase)
ComponentName.test.tsx   // Tests
useCustomHook.ts         // Hooks (camelCase with 'use' prefix)
userService.ts           // Services (camelCase)
types.ts                 // Types/Interfaces
constants.ts             // Constants
utils.ts                 // Utilities

// === CODE ===

// Interfaces & Types (PascalCase)
interface UserData {
  id: string;
  email: string;
}

type UserRole = 'admin' | 'operator' | 'viewer';

// Constants (UPPER_SNAKE_CASE)
const API_BASE_URL = 'https://api.aideas.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Functions (camelCase)
function getUserById(id: string): Promise<User> {}
const formatCurrency = (amount: number) => {};

// Variables (camelCase)
const currentUser = await getUser();
let isLoading = false;

// React Components (PascalCase, named export)
export const UserProfile: React.FC<Props> = ({ userId }) => {
  return <div>{/* ... */}</div>;
};

// Hooks (camelCase with 'use' prefix)
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser };
};

// Event Handlers (handle prefix)
const handleSubmit = (e: FormEvent) => {};
const handleUserClick = () => {};
```

#### Backend (Python/FastAPI)

```python
# === FILES ===
user_router.py          # Routers (snake_case)
user_service.py         # Services
user_models.py          # SQLAlchemy models
user_schemas.py         # Pydantic schemas
auth_dependencies.py    # Dependencies
string_utils.py         # Utilities

# === CODE ===

# Classes (PascalCase)
class UserService:
    pass

class UserNotFoundError(Exception):
    pass

# Pydantic Models (PascalCase)
class UserCreate(BaseModel):
    email: EmailStr
    name: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

# SQLAlchemy Models (PascalCase)
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True)
    email = Column(String, unique=True)

# Functions (snake_case)
def get_user_by_id(user_id: UUID) -> User:
    pass

async def create_user(data: UserCreate) -> User:
    pass

# Variables (snake_case)
current_user = get_current_user()
is_active = True

# Constants (UPPER_SNAKE_CASE)
MAX_CONNECTIONS = 100
DEFAULT_PAGE_SIZE = 20

# Private (underscore prefix)
def _validate_email(email: str) -> bool:
    pass

_cached_value = None
```

### Git Commit Convention

Using **Conventional Commits**:

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Build, configs, etc. |
| `ci` | CI/CD changes |

**Scopes:**

| Scope | Description |
|-------|-------------|
| `landing` | Landing page app |
| `portal` | Customer portal app |
| `admin` | Admin portal app |
| `api` | Backend API |
| `ui` | Shared UI package |
| `types` | Shared types package |
| `deps` | Dependencies |

**Examples:**

```bash
feat(portal): add automation request form
fix(api): resolve null pointer in user service
docs(readme): update installation instructions
refactor(admin): simplify customer list component
test(api): add unit tests for billing service
chore(deps): update Next.js to 14.1.0
ci: add staging deployment workflow
```

---

## API Design

### RESTful API Structure

```
Base URL: https://api.aideas.com/v1

# Health
GET    /health                          # Health check

# Authentication (Clerk webhooks)
POST   /webhooks/clerk                   # Clerk webhook handler

# Users
GET    /users/me                         # Get current user
PATCH  /users/me                         # Update current user

# Organizations
GET    /organizations/:id                # Get organization
PATCH  /organizations/:id                # Update organization
GET    /organizations/:id/members        # List members
POST   /organizations/:id/members        # Invite member
DELETE /organizations/:id/members/:uid   # Remove member

# Automations
GET    /automations                      # List automations (catalog)
GET    /automations/:id                  # Get automation details
POST   /automations/:id/request          # Request automation

# Customer Automations (active)
GET    /customer-automations             # List my automations
GET    /customer-automations/:id         # Get automation details
GET    /customer-automations/:id/metrics # Get metrics
PATCH  /customer-automations/:id/config  # Update config

# Templates (admin only)
GET    /templates                        # List templates
POST   /templates                        # Create template
GET    /templates/:id                    # Get template
PATCH  /templates/:id                    # Update template
DELETE /templates/:id                    # Delete template

# Billing
GET    /billing/subscription             # Get subscription
POST   /billing/subscription             # Create subscription
PATCH  /billing/subscription             # Update subscription
DELETE /billing/subscription             # Cancel subscription
GET    /billing/invoices                 # List invoices
GET    /billing/invoices/:id             # Get invoice
POST   /billing/portal                   # Create Stripe portal session

# Support
GET    /support/tickets                  # List tickets
POST   /support/tickets                  # Create ticket
GET    /support/tickets/:id              # Get ticket
POST   /support/tickets/:id/messages     # Add message

# Admin endpoints (admin role required)
GET    /admin/customers                  # List all customers
GET    /admin/customers/:id              # Get customer details
GET    /admin/requests                   # List automation requests
PATCH  /admin/requests/:id               # Update request status
GET    /admin/analytics                  # Platform analytics
```

### Request/Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (delete) |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `422` | Validation Error |
| `429` | Rate Limited |
| `500` | Server Error |

---

## Database Design

### Core Entities

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'starter',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization Members (junction)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- admin, operator, viewer
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Automation Templates (aideas library)
CREATE TABLE automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    config_schema JSONB, -- JSON Schema for configuration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Automations (deployed)
CREATE TABLE customer_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES automation_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, paused, error
    deployed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation Executions (logs)
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES customer_automations(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- success, error
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation Requests
CREATE TABLE automation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    template_id UUID REFERENCES automation_templates(id),
    description TEXT NOT NULL,
    requirements JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, approved, rejected, deployed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Messages
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices (synced from Stripe)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    invoice_url VARCHAR(500),
    invoice_pdf VARCHAR(500),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_customer_automations_org ON customer_automations(organization_id);
CREATE INDEX idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX idx_automation_executions_created ON automation_executions(created_at);
CREATE INDEX idx_automation_requests_org ON automation_requests(organization_id);
CREATE INDEX idx_support_tickets_org ON support_tickets(organization_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
```

### Entity Relationships

```
Organization (1) ──────< (N) OrganizationMember >────── (1) User
      │
      │ (1)
      │
      ├──────< (N) CustomerAutomation >────── (1) AutomationTemplate
      │              │
      │              └──────< (N) AutomationExecution
      │
      ├──────< (N) AutomationRequest
      │
      ├──────< (N) SupportTicket >────── (N) TicketMessage
      │
      └──────< (N) Invoice
```

---

## Security Standards

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW (Clerk)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. User signs in via Clerk (frontend)                                 │
│   2. Clerk returns session token (JWT)                                  │
│   3. Frontend includes token in API requests                            │
│   4. Backend validates token with Clerk                                 │
│   5. Backend extracts user info and permissions                         │
│                                                                         │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐      │
│   │  User    │────►│  Clerk   │────►│ Frontend │────►│  API     │      │
│   │          │     │          │     │          │     │          │      │
│   │ Sign In  │     │  Auth    │     │  Token   │     │ Validate │      │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Authorization (Role-Based)

```python
# Roles and Permissions
ROLES = {
    'admin': [
        'org:read', 'org:write', 'org:delete',
        'members:read', 'members:write', 'members:delete',
        'automations:read', 'automations:write',
        'billing:read', 'billing:write',
        'support:read', 'support:write',
    ],
    'operator': [
        'org:read',
        'members:read',
        'automations:read', 'automations:write',
        'support:read', 'support:write',
    ],
    'viewer': [
        'org:read',
        'automations:read',
        'support:read',
    ],
}
```

### Security Measures

```python
# CORS Configuration
CORS_ORIGINS = [
    "https://aideas.com",
    "https://app.aideas.com",
    "https://admin.aideas.com",
]

# Rate Limiting
RATE_LIMITS = {
    "default": "100/minute",
    "auth": "10/minute",
    "api": "1000/hour",
}

# Security Headers (via middleware)
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
}
```

---

## Environment Configuration

### Backend (.env)

```bash
# Application
APP_ENV=development  # development, staging, production
APP_DEBUG=true
APP_SECRET_KEY=your-secret-key-here
API_VERSION=v1

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aideas
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@aideas.com

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=aideas-files

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
SENTRY_DSN=https://...

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/v1

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## Environments

### Development

```yaml
Purpose: Local development
URLs:
  - Landing: http://localhost:3000
  - Portal: http://localhost:3001
  - Admin: http://localhost:3002
  - API: http://localhost:8000

Database: Local PostgreSQL (Docker)
Redis: Local Redis (Docker)
Debug: Enabled
Hot Reload: Enabled
External Services: Test mode / Mocked
```

### Staging

```yaml
Purpose: Pre-production testing
URLs:
  - Landing: https://staging.aideas.com
  - Portal: https://app.staging.aideas.com
  - Admin: https://admin.staging.aideas.com
  - API: https://api.staging.aideas.com

Database: Railway PostgreSQL (staging)
Redis: Railway Redis (staging)
Deploy Trigger: Push to 'develop' branch
External Services: Test mode
```

### Production

```yaml
Purpose: Live application
URLs:
  - Landing: https://aideas.com
  - Portal: https://app.aideas.com
  - Admin: https://admin.aideas.com
  - API: https://api.aideas.com

Database: Railway PostgreSQL (production)
Redis: Railway Redis (production)
Deploy Trigger: Push to 'main' branch (manual approval)
External Services: Live mode
Backups: Automated daily
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### CI (on Pull Request)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm typecheck

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test --filter=./apps/*

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r apps/api/requirements/dev.txt
      - run: pytest apps/api/tests

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test-frontend, test-backend]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
```

#### Deploy Staging (on merge to develop)

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Deploy Frontend to Vercel
      - name: Deploy Landing (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_LANDING_PROJECT_ID }}
          working-directory: ./apps/landing
          
      # Deploy Backend to Railway
      - name: Deploy API (Staging)
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: api-staging
          
      # Notify
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployed!'
```

#### Deploy Production (on merge to main)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4
      
      # Deploy with --prod flag
      - name: Deploy Landing (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_LANDING_PROJECT_ID }}
          
      # Similar for portal, admin, api...
      
      # Post-deploy verification
      - name: Health Check
        run: |
          curl -f https://api.aideas.com/health || exit 1
          
      # Notify
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployed!'
```

---

## Performance Targets

```yaml
# API Performance
Response Time (p95): < 200ms
Response Time (p99): < 500ms
Error Rate: < 0.1%
Availability: 99.9%

# Frontend Performance
First Contentful Paint: < 1.5s
Largest Contentful Paint: < 2.5s
Time to Interactive: < 3.5s
Cumulative Layout Shift: < 0.1
Lighthouse Score: > 90

# Database
Query Time (p95): < 50ms
Connection Pool: 20 connections
Max Connections: 100
```

---

## Monitoring & Logging

### Error Tracking (Sentry)

```python
# Backend
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.APP_ENV,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
)
```

### Structured Logging

```python
# Backend logging format
{
    "timestamp": "2026-01-28T12:00:00Z",
    "level": "INFO",
    "message": "User created",
    "context": {
        "user_id": "123",
        "organization_id": "456",
        "request_id": "req_789"
    }
}
```

---

## Backup & Recovery

```yaml
Database Backups:
  Frequency: Daily
  Retention: 30 days
  Storage: Cloudflare R2 (separate bucket)
  
Recovery:
  RTO: 4 hours
  RPO: 24 hours
  Process: Documented in DEPLOYMENT.md
```

---

## Document Maintenance

| Item | Schedule |
|------|----------|
| Review this document | Quarterly |
| Update after major changes | Immediately |
| Security audit | Bi-annually |

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2026 | Initial architecture | aideas Team |

---

**Last Updated:** January 2026
**Next Review:** April 2026
