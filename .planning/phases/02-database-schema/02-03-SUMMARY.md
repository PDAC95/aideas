---
phase: 02-database-schema
plan: "03"
subsystem: database
tags: [postgres, supabase, rls, realtime, migrations, seed-data]

# Dependency graph
requires:
  - phase: 02-01
    provides: organizations, profiles, organization_members tables with RLS patterns
  - phase: 02-02
    provides: automation_templates, automations, automation_executions, automation_requests, subscriptions

provides:
  - chat_messages table (org-scoped, immutable, Realtime-enabled, hybrid write)
  - notifications table (user-scoped, 4-value type CHECK, service_role writes)
  - invitations table (token-based with gen_random_bytes, org-scoped read)
  - Realtime publication on chat_messages for live chat
  - Comprehensive seed data for all 11 tables (2 orgs, 5 users, varied states)

affects:
  - 03-api (FastAPI endpoints will query all communication tables)
  - 04-dashboard (UI reads chat, notifications, invitations)
  - all development testing (seed data provides org isolation scenarios)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Immutable message pattern: chat_messages has no updated_at or deleted_at (v1 constraint)"
    - "Realtime via ALTER PUBLICATION: only chat_messages added to supabase_realtime publication"
    - "Token generation: gen_random_bytes(32) encoded as hex produces 64-char unique invitation tokens"
    - "Hybrid write for communication: chat_messages client INSERT + service_role for aideas messages"
    - "Seed transaction wrapping: entire seed.sql wrapped in BEGIN/COMMIT for atomicity"
    - "Seed FK ordering: auth.users -> organizations -> organization_members -> templates -> automations -> executions -> requests -> subscriptions -> chat_messages -> notifications -> invitations"

key-files:
  created:
    - supabase/migrations/20260305000003_communication.sql
    - supabase/seed.sql (replaced existing stub with comprehensive seed)
  modified: []

key-decisions:
  - "chat_messages has no updated_at or deleted_at — immutable in v1, matches CONTEXT.md no-edit constraint"
  - "Realtime enabled only on chat_messages via ALTER PUBLICATION — notifications via polling per CONTEXT.md"
  - "notifications uses CHECK constraint (not ENUM) for type — matches established pattern from prior migrations"
  - "invitations token uses gen_random_bytes(32) encoded hex — 64-char, cryptographically secure, no pgcrypto dependency beyond what Supabase provides"
  - "Seed wrapped in transaction — atomicity on supabase db reset; partial seed state impossible"
  - "auth.identities seeded alongside auth.users — required for Supabase email login to function in local dev"

patterns-established:
  - "Communication tables: no deleted_at when lifecycle is managed differently (expiry, immutability)"
  - "Seed UUIDs: fixed human-readable patterns (aaaaaa..., bbbbbb..., tt000001...) for easy debugging"
  - "Seed data: ON CONFLICT DO NOTHING on id column makes seed idempotent across multiple resets"

requirements-completed: [DB-09, DB-10, DB-11, DB-12, DB-13]

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 2 Plan 03: Communication Tables and Seed Data Summary

**Three communication tables (chat_messages with Realtime, notifications, invitations) plus comprehensive seed covering all 11 tables with 2 orgs, 5 users, varied automation states, and chat conversations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T00:49:10Z
- **Completed:** 2026-03-06T00:52:14Z
- **Tasks:** 2
- **Files modified:** 2 (1 created migration, 1 replaced seed.sql)

## Accomplishments

- Created `20260305000003_communication.sql` with chat_messages, notifications, and invitations tables
- chat_messages is immutable (no updated_at/deleted_at), enables client INSERT with strict `WITH CHECK`, and AIDEAS replies go via service_role — enforces the support-channel model
- Realtime enabled on chat_messages via `ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages` — only table with live subscription per CONTEXT.md
- notifications has a 4-value type CHECK constraint (info/warning/success/action_required) with user-scoped SELECT and UPDATE policies; service_role manages creation
- invitations uses `gen_random_bytes(32)` encoded as hex for a 64-char cryptographically secure token with unique constraint
- Replaced stub seed.sql with a comprehensive 12-INSERT transaction covering all 11 tables
- Seed includes dev@jappi.ca / Password123 as admin of Acme Corp for development login
- auth.identities seeded alongside auth.users to enable Supabase email login in local dev
- 6 automations in all meaningful lifecycle states to test UI state rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create communication tables migration with Realtime** - `f0cf728` (feat)
2. **Task 2: Create comprehensive seed script** - `65ce076` (feat)

## Files Created/Modified

- `supabase/migrations/20260305000003_communication.sql` - chat_messages (immutable, Realtime, hybrid write), notifications (user-scoped, 4-type CHECK), invitations (token-based, org-scoped)
- `supabase/seed.sql` - Replaced with comprehensive 12-INSERT transaction: 5 users, 2 orgs, 5 members, 8 templates, 6 automations, 4 executions, 3 requests, 2 subscriptions, 5 chat messages, 4 notifications, 1 invitation

## Decisions Made

- chat_messages is fully immutable (no updated_at, no deleted_at) — v1 has no message edit/delete per CONTEXT.md; simpler schema and cleaner audit trail
- Realtime is added only to chat_messages via ALTER PUBLICATION — notifications and other state changes use polling/page load per CONTEXT.md decision
- Seed wrapped in BEGIN/COMMIT transaction — if any insert fails during `supabase db reset`, the entire seed rolls back cleanly with no partial state
- auth.identities must be seeded for email login to work in local Supabase — without this, users exist in auth.users but cannot sign in via email provider
- Fixed UUIDs in seed follow human-readable patterns (aaa.../bbb... for users, aaaaaaa.../bbbbbbb... for orgs) making debugging straightforward

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Phase 2 Completion

All 11 tables are now created across three migrations:
- `20260305000001_core_identity.sql` — organizations, profiles, organization_members (02-01)
- `20260305000002_automation_business.sql` — automation_templates, automations, automation_executions, automation_requests, subscriptions (02-02)
- `20260305000003_communication.sql` — chat_messages, notifications, invitations (02-03)

The seed script covers all 11 tables with realistic AIDEAS business data demonstrating org isolation, varied automation states, client-AIDEAS chat flow, and notification types.

Phase 2 complete. Ready for Phase 3 (API Endpoints).

---
*Phase: 02-database-schema*
*Completed: 2026-03-06*
