# Phase 7: Schema & Seed Data - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the existing database schema (ALTER 3 tables) and seed 66+ automation templates plus realistic demo organization data. All downstream dashboard phases (8-12) depend on this data being in place. No UI work, no API endpoints — pure schema + data.

</domain>

<decisions>
## Implementation Decisions

### Migration strategy
- TRUNCATE existing seed data and re-seed from scratch — no incremental inserts
- Single consolidated migration file for all 3 table ALTERs (automation_templates, automations, automation_requests)
- Replace existing `seed.sql` entirely with expanded version containing 66+ templates and full demo data
- Seed must be idempotent: TRUNCATE CASCADE at the top + fixed UUIDs so it can be re-run safely
- Rollback strategy: `supabase db reset` (re-applies all migrations + seed from scratch)

### Pricing & metrics
- Target market: US and Canada (not LATAM)
- Setup price range: $99-$499 USD (one-time configuration fee)
- Monthly price range: $29-$149 USD (recurring)
- All prices stored as **integer cents** (Stripe standard) — e.g., $99.00 = 9900
- Currency: USD only
- Default org hourly_cost: $25 USD/hour (US/CA admin employee benchmark)
- avg_minutes_per_task: 5-45 minutes depending on complexity (simple emails ~5-10 min, complex reports ~30-45 min)
- setup_time_days: 1-5 days depending on complexity (basic chatbot: 1-2 days, AI agents with multiple integrations: 3-5 days)

### Demo org realism
- Demo org represents a **marketing agency** — uses automations across sales, marketing, reports, and customer service
- ~500 executions over 60 days with **gradual growth** pattern (few at start, increasing week-over-week to simulate adoption)
- ~5% error rate (~475 success, ~25 errors) — 95% success rate looks professional without hiding error states
- 8-10 notifications with varied mix: 2-3 success, 2-3 info, 2 warning, 1-2 action_required. Mix of read and unread
- 5-6 automations with diverse statuses (active, in_setup, paused)
- 5-6 automation requests with mixed statuses

### Template catalog content
- ~8 templates per category (balanced distribution across all 8 categories)
- 8 categories: Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA, Mas populares
- 6 industries: Retail, Salud, Legal, Inmobiliaria, Restaurantes, Agencias/Marketing
- Each template tagged with 1-3 industries based on relevance (some specific like "Solo Legal", others cross-industry)
- connected_apps drawn from popular US/CA ecosystem: Google Workspace, Slack, HubSpot, Salesforce, QuickBooks, Shopify, Mailchimp, Notion, Stripe
- Template names and descriptions stored as **i18n keys** with translations in EN/ES message files (not hardcoded text in DB)

### Claude's Discretion
- Exact template names and descriptions (following the i18n key pattern)
- Specific connected_apps assignments per template
- typical_impact_text and activity_metric_label content
- Exact distribution of executions across the 60-day growth curve
- Error message content for failed executions
- Notification message content and timing

</decisions>

<specifics>
## Specific Ideas

- Industry list includes "Agencias/Marketing" to align with the demo org being a marketing agency
- Execution growth pattern should feel like real onboarding: week 1 = testing (few runs), week 4+ = full production volume
- Prices in cents align with future Stripe integration (no conversion needed later)
- i18n approach for template content: DB stores keys like `templates.ai_chatbot.name`, message files have the actual translated strings

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-schema-seed-data*
*Context gathered: 2026-04-09*
