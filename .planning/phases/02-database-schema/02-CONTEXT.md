# Phase 2: Database Schema - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Create all 11 Supabase tables with correct RLS policies, versioned migrations in `supabase/migrations/`, and a seed script for development. Tables: organizations, profiles, organization_members, automation_templates, automations, automation_executions, automation_requests, subscriptions, chat_messages, notifications, invitations. This phase delivers schema only — no API endpoints or UI.

</domain>

<decisions>
## Implementation Decisions

### RLS Policies
- Isolate data by organization — users only see rows belonging to their org
- Role-based permissions (admin/operator/viewer) enforced in application layer (FastAPI), not in RLS
- `automation_templates` readable by all authenticated users (global catalog, not org-scoped)
- Hybrid write policy: interaction tables (`automation_requests`, `chat_messages`) allow user INSERT; system tables (`automations`, `automation_executions`, `subscriptions`) only writable via service_role key
- AIDEAS admin team accesses all data via service_role key (bypasses RLS) — no super_admin role needed in DB

### Seed Data
- Realistic data reflecting AIDEAS business: automation templates for lead generation, customer support, internal processes
- Volume: 2 organizations, 4 users (2 per org with different roles), ~8 automation templates
- Include variety of states: active automations, paused, failed; pending and completed requests; sample chat messages
- Seed covers enough scenarios to test org isolation and UI states during development

### Deletion and Lifecycle
- Soft delete with `deleted_at` timestamp across tables — no physical deletion
- Automation status enum: `draft`, `pending_review`, `active`, `paused`, `failed`, `archived` (6 states, reflects managed-service review flow)
- Automation request urgency: `low`, `normal`, `urgent` (3 levels)

### Audit Fields
- All tables include `created_at` and `updated_at` timestamps (auto-managed)

### Realtime and Chat
- Chat is client-to-AIDEAS only (dedicated support channel per organization, not inter-member messaging)
- Chat messages: text-only for v1 (no file attachments — can expand later)
- Supabase Realtime enabled only on `chat_messages` table; notifications and other changes via polling/page load
- Notifications table includes `type` field: `info`, `warning`, `success`, `action_required`

### Claude's Discretion
- Exact column types and naming conventions
- Index strategy for performance
- Migration file naming and ordering
- Foreign key constraint details beyond what's specified
- Notification `type` enum implementation (check constraint vs Postgres enum)

</decisions>

<specifics>
## Specific Ideas

- Automation templates should reflect real AIDEAS services: lead generation bots, customer support chatbots, invoice processing, data sync between CRM systems, report generation
- The 6-state automation lifecycle (draft → pending_review → active → paused → failed → archived) reflects that AIDEAS reviews and builds automations for clients — it's not self-service
- Org isolation is the security foundation — every query must be scoped to the user's organization

</specifics>

<deferred>
## Deferred Ideas

- File attachments in chat — future enhancement when Supabase Storage is configured
- Realtime for notifications and execution status — consider for v2 dashboard phase
- Inter-member chat within an organization — not needed for v1 support model

</deferred>

---

*Phase: 02-database-schema*
*Context gathered: 2026-03-05*
