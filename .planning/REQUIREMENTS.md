# Requirements: AIDEAS Customer Portal

**Defined:** 2026-03-05
**Core Value:** Customers can monitor automations, request new ones, and communicate with the AIDEAS team from a single dashboard

## v1 Requirements

Requirements for initial release (Phase 1: Backend Foundation + Auth).

### API Foundation

- [ ] **API-01**: FastAPI app initialized with proper folder structure (routes, services, models)
- [ ] **API-02**: Pydantic Settings configuration with .env support
- [ ] **API-03**: Supabase client configured and connected
- [ ] **API-04**: CORS configured for app.aideas.com and localhost origins
- [ ] **API-05**: Health check endpoint at `/health` returns service status
- [ ] **API-06**: OpenAPI docs available at `/docs`
- [ ] **API-07**: Requirements files (base.txt, dev.txt) with pinned dependencies
- [ ] **API-08**: Structured logging with loguru or structlog
- [ ] **API-09**: .env.example with all required variables documented

### Database

- [ ] **DB-01**: Supabase `organizations` table with RLS policies
- [ ] **DB-02**: Supabase `profiles` table extending auth.users with RLS policies
- [ ] **DB-03**: Supabase `organization_members` table with role enum (admin/operator/viewer) and RLS
- [ ] **DB-04**: Supabase `automation_templates` table with category, name, description and RLS
- [ ] **DB-05**: Supabase `automations` table linked to org with status tracking and RLS
- [ ] **DB-06**: Supabase `automation_executions` table with metrics and RLS
- [ ] **DB-07**: Supabase `automation_requests` table with urgency levels and RLS
- [ ] **DB-08**: Supabase `subscriptions` table synced with Stripe and RLS
- [ ] **DB-09**: Supabase `chat_messages` table with realtime enabled and RLS
- [ ] **DB-10**: Supabase `notifications` table with read/unread status and RLS
- [ ] **DB-11**: Supabase `invitations` table with token and expiry and RLS
- [ ] **DB-12**: All migrations in `supabase/migrations/` directory
- [ ] **DB-13**: Seed script for development data (sample org, users, templates)

### Auth Integration

- [ ] **AUTH-01**: Supabase Auth configured for email/password signup
- [ ] **AUTH-02**: Supabase Auth configured for Google OAuth
- [ ] **AUTH-03**: Email templates customized with AIDEAS branding
- [ ] **AUTH-04**: Redirect URLs configured for local dev and production
- [ ] **AUTH-05**: JWT validation dependency in FastAPI (extracts user from token)
- [ ] **AUTH-06**: Protected route middleware in FastAPI (rejects unauthenticated requests)

### User Registration

- [ ] **REG-01**: Signup page at `/signup` with form (email, password, name, company)
- [ ] **REG-02**: Form validation with Zod schema
- [ ] **REG-03**: Account creation via Supabase Auth
- [ ] **REG-04**: Organization auto-created on first signup with user as admin
- [ ] **REG-05**: Email verification sent automatically
- [ ] **REG-06**: Redirect to `/verify-email` after signup
- [ ] **REG-07**: Error message if email already exists
- [ ] **REG-08**: Google OAuth signup option

### User Login

- [ ] **LOGIN-01**: Login page at `/login` with email + password form
- [ ] **LOGIN-02**: Login via Supabase Auth with JWT in cookies
- [ ] **LOGIN-03**: Redirect to `/dashboard` after successful login
- [ ] **LOGIN-04**: Error message for incorrect credentials
- [ ] **LOGIN-05**: Link to forgot password page
- [ ] **LOGIN-06**: Google OAuth login option
- [ ] **LOGIN-07**: Session persists across browser refresh

### Password Recovery

- [ ] **PWD-01**: Forgot password page at `/forgot-password` with email input
- [ ] **PWD-02**: Reset email sent via Supabase Auth
- [ ] **PWD-03**: Reset password page at `/reset-password` with new password form
- [ ] **PWD-04**: Password strength validation
- [ ] **PWD-05**: Confirmation message after password changed
- [ ] **PWD-06**: Redirect to login after reset

### Email Verification

- [ ] **VERIFY-01**: Verification email sent automatically on signup
- [ ] **VERIFY-02**: Verification link in email confirms account
- [ ] **VERIFY-03**: Verify-email page at `/verify-email` with status message
- [ ] **VERIFY-04**: User can only login after email is verified
- [ ] **VERIFY-05**: Resend verification email option

## v2 Requirements

Deferred to future milestones. Not in current roadmap.

### Dashboard & Portal

- **DASH-01**: Dashboard with automation metrics cards
- **DASH-02**: Automation catalog with search/filter
- **DASH-03**: Request automation workflow
- **DASH-04**: My automations list with real-time status

### Communication

- **CHAT-01**: Real-time chat with AIDEAS team
- **NOTIF-01**: In-app notifications with bell icon

### Team Management

- **TEAM-01**: Invite members by email
- **TEAM-02**: Role-based access (admin/operator/viewer)

### Billing

- **BILL-01**: Stripe checkout integration
- **BILL-02**: Stripe customer portal
- **BILL-03**: Invoice history

### Admin Panel

- **ADMIN-01**: Admin dashboard with KPIs
- **ADMIN-02**: Customer management
- **ADMIN-03**: Template management

## Out of Scope

| Feature | Reason |
|---------|--------|
| Self-service automation builder | Not the AIDEAS business model — managed service only |
| Mobile app | Web-first for MVP, mobile Phase 2+ |
| AI chat assistant | Phase 2 feature (US-007) |
| Slack/WhatsApp integrations | Phase 2 feature (US-008) |
| Public API | Phase 2+ feature |
| Multi-language UI | English only for Phase 1, i18n structure ready |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| — | — | — |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 0
- Unmapped: 47

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after initial definition*
