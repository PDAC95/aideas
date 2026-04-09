# Phase 7: Schema & Seed Data - Research

**Researched:** 2026-04-09
**Domain:** PostgreSQL schema migrations (Supabase CLI), SQL seed data generation
**Confidence:** HIGH

## Summary

This phase has two clearly separated concerns: (1) ALTER three existing tables to add new columns and expand CHECK constraints, and (2) replace the existing `seed.sql` with a comprehensive version containing 66+ templates and rich demo data. Both are pure SQL — no application code, no API endpoints.

The existing migration pattern (four files in `supabase/migrations/`) and `supabase/seed.sql` are well-established. The v1.1 schema changes follow an exact precedent set by `20260401000001_user_registration.sql`, which already demonstrates the DROP CONSTRAINT / ADD CONSTRAINT pattern for expanding CHECK constraints. All decisions are locked by CONTEXT.md and leave no ambiguity about approach.

The primary complexity risks are: (1) correctly sequencing ALTER operations so the category CHECK constraint expansion doesn't violate existing data, (2) generating 66+ rows of realistic seed data with i18n key references rather than hardcoded text, and (3) building the ~500-execution growth curve in pure SQL using generate_series.

**Primary recommendation:** Write a single migration file for all three ALTERs, then replace seed.sql entirely — TRUNCATE CASCADE at top, fixed UUIDs throughout, idempotent by design.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- TRUNCATE existing seed data and re-seed from scratch — no incremental inserts
- Single consolidated migration file for all 3 table ALTERs (automation_templates, automations, automation_requests)
- Replace existing `seed.sql` entirely with expanded version containing 66+ templates and full demo data
- Seed must be idempotent: TRUNCATE CASCADE at the top + fixed UUIDs so it can be re-run safely
- Rollback strategy: `supabase db reset` (re-applies all migrations + seed from scratch)
- Target market: US and Canada (not LATAM)
- Setup price range: $99-$499 USD (one-time); stored as integer cents (9900-49900)
- Monthly price range: $29-$149 USD (recurring); stored as integer cents (2900-14900)
- Default org hourly_cost: $25 USD/hour
- avg_minutes_per_task: 5-45 minutes depending on complexity
- setup_time_days: 1-5 days depending on complexity
- Demo org = marketing agency (Acme Corp, already seeded)
- ~500 executions over 60 days with gradual growth pattern
- ~5% error rate (~475 success, ~25 errors)
- 8-10 notifications with varied mix (2-3 success, 2-3 info, 2 warning, 1-2 action_required), mix of read/unread
- 5-6 automations with diverse statuses (active, in_setup, paused)
- 5-6 automation requests with mixed statuses
- ~8 templates per category (balanced), 8 categories, 6 industries
- Template names/descriptions stored as i18n keys (e.g. `templates.ai_chatbot.name`), not hardcoded text
- connected_apps from: Google Workspace, Slack, HubSpot, Salesforce, QuickBooks, Shopify, Mailchimp, Notion, Stripe

### Claude's Discretion

- Exact template names and descriptions (following the i18n key pattern)
- Specific connected_apps assignments per template
- typical_impact_text and activity_metric_label content
- Exact distribution of executions across the 60-day growth curve
- Error message content for failed executions
- Notification message content and timing

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Schema migration ALTERs `automation_templates` with pricing, industry, metric columns and expanded category CHECK | Migration pattern from `20260401000001_user_registration.sql`; DROP/ADD CHECK constraint pattern confirmed |
| DATA-02 | Schema migration ALTERs `automations` with `stripe_subscription_id` and `in_setup` status | Simple ADD COLUMN + DROP/ADD CHECK; `stripe_subscription_id` nullable VARCHAR matches existing subscriptions table pattern |
| DATA-03 | Schema migration ALTERs `automation_requests` with checkout fields and expanded status CHECK | Checkout fields = stripe_checkout_session_id, checkout_expires_at; same DROP/ADD CHECK pattern |
| DATA-04 | Seed 66+ automation templates across 8 categories and 6 industries with realistic pricing and metrics | 8 categories × ~8 templates = 64 minimum; achieve 66+ with 2 categories at 9; i18n key pattern confirmed |
| DATA-05 | Seed demo org data: 5-6 automations, ~500 executions over 60 days, 5-6 requests, 8-10 notifications, org settings with hourly_cost | generate_series pattern for bulk execution rows; gradual growth via INTERVAL arithmetic; hourly_cost in org settings JSONB |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Supabase CLI | Latest (project uses) | Run migrations, reset, apply seed | Project's existing workflow |
| PostgreSQL | 15 (per config.toml) | Native SQL ALTER, generate_series | Already defined in supabase/config.toml |
| supabase/migrations/*.sql | — | Schema migration files | Established pattern in project |
| supabase/seed.sql | — | Seed data, re-applied on `supabase db reset` | Established pattern in project |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `generate_series` (PostgreSQL) | Built-in | Generate 500 execution rows efficiently | Avoids writing 500 manual INSERT rows |
| `TRUNCATE ... CASCADE` | Built-in | Reset all tables in dependency order | Top of seed.sql for idempotency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| generate_series for executions | 500 manual INSERTs | Manual is brittle, verbose, harder to adjust growth curve |
| Single migration file | Separate file per table | Single file simpler since all 3 ALTERs are related and same phase |
| i18n keys in DB | Hardcoded Spanish/English | Keys allow both languages without schema duplication |

**Run commands:**
```bash
supabase db reset           # apply all migrations + seed from scratch (development)
supabase migration new v1_1_schema_expansion   # create new migration file
```

## Architecture Patterns

### Migration File Naming
New migration follows existing timestamp pattern. Next available:
```
supabase/migrations/20260409000001_v1_1_schema_expansion.sql
```
Existing files: 20260305000001, 20260305000002, 20260305000003, 20260401000001. Use today's date (2026-04-09).

### Pattern 1: Expanding a CHECK Constraint (Established in Project)
**What:** Drop old named constraint, add new one with expanded values  
**When to use:** Any time a CHECK constraint needs new enum values  
**Example from `20260401000001_user_registration.sql`:**
```sql
ALTER TABLE public.organization_members
    DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_role_check
        CHECK (role IN ('owner', 'admin', 'operator', 'viewer'));
```
Apply same pattern to:
- `automation_templates.category` — add 6 new categories
- `automations.status` — add `in_setup`
- `automation_requests.status` — add checkout-related statuses

### Pattern 2: Adding Columns to Existing Tables
**What:** `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`  
**When to use:** All new columns in this phase  
**Example:**
```sql
ALTER TABLE public.automation_templates
    ADD COLUMN IF NOT EXISTS setup_price         INTEGER,
    ADD COLUMN IF NOT EXISTS monthly_price       INTEGER,
    ADD COLUMN IF NOT EXISTS setup_time_days     INTEGER,
    ADD COLUMN IF NOT EXISTS industry_tags       TEXT[],
    ADD COLUMN IF NOT EXISTS connected_apps      TEXT[],
    ADD COLUMN IF NOT EXISTS typical_impact_text TEXT,
    ADD COLUMN IF NOT EXISTS avg_minutes_per_task INTEGER,
    ADD COLUMN IF NOT EXISTS activity_metric_label TEXT;
```

### Pattern 3: TRUNCATE CASCADE for Idempotent Seeds
**What:** TRUNCATE all tables in reverse-FK order at top of seed.sql  
**When to use:** Always — enables safe re-runs  
**Example:**
```sql
BEGIN;

-- Disable trigger for seed control
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- TRUNCATE in reverse FK order (children first)
TRUNCATE TABLE
    public.invitations,
    public.notifications,
    public.chat_messages,
    public.subscriptions,
    public.automation_requests,
    public.automation_executions,
    public.automations,
    public.automation_templates,
    public.organization_members,
    public.profiles,
    public.organizations
CASCADE;

-- Also clear auth tables seeded manually
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- Re-enable trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

### Pattern 4: Bulk Executions with generate_series
**What:** Use generate_series to generate ~500 execution rows with a growth curve  
**When to use:** Any time bulk time-series data is needed  
**Example (gradual growth over 60 days):**
```sql
-- Week 1-2: low volume (testing phase) — ~3 runs/day total
-- Week 3-4: medium volume (ramp-up) — ~7 runs/day total
-- Week 5-8: full production — ~12 runs/day total

INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'au111111-0000-0000-0000-000000000001',  -- specific automation
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '60 days' + (n * INTERVAL '4 hours'),
    NOW() - INTERVAL '60 days' + (n * INTERVAL '4 hours') + INTERVAL '8 seconds',
    (random() * 10000 + 2000)::INTEGER,
    '{"tasks_processed": ' || (random()*20+1)::INTEGER || '}',
    NULL,
    NULL,
    'schedule'
FROM generate_series(1, 150) AS n;
```

The growth curve can be approximated by distributing INSERT batches per automation with different generate_series ranges and intervals.

### Pattern 5: i18n Key Convention for Template Content
**What:** Store dotted-path keys in DB; actual text lives in `web/messages/en.json` and `web/messages/es.json`  
**When to use:** All `name` and `description` fields in `automation_templates`  
**Example:**
```sql
-- DB stores key
('tt010001-...', 'templates.lead_followup_email.name', 'lead-followup-email', 'templates.lead_followup_email.description', ...)

-- en.json
"templates": {
  "lead_followup_email": {
    "name": "Lead Follow-up Email Sequence",
    "description": "Automatically nurture leads with personalized email sequences"
  }
}
```
**IMPORTANT:** The existing seed.sql stored hardcoded English strings (e.g., `'AI Chatbot'`, `'Intelligent chatbot...'`). The new seed MUST switch to i18n key pattern per CONTEXT.md decision. This requires adding translation entries to both `web/messages/en.json` and `web/messages/es.json`.

### Pattern 6: Org Settings JSONB for hourly_cost
**What:** Add `hourly_cost` to the existing `settings` JSONB column in `organizations`  
**When to use:** Demo org seed update  
**Example:**
```sql
UPDATE public.organizations
SET settings = settings || '{"hourly_cost": 2500}'::jsonb
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';
```
Note: `hourly_cost` stored as integer cents (2500 = $25.00/hr) consistent with price fields. **OR** store as numeric 25.00 — decision needed. Given prices are cents (INTEGER), recommend cents for consistency.

### Anti-Patterns to Avoid
- **Hardcoded text in template name/description:** Use i18n keys per CONTEXT.md decision
- **Incremental inserts into existing templates:** TRUNCATE and re-seed — no ON CONFLICT merges for templates
- **Altering constraints without DROP IF EXISTS first:** PostgreSQL requires dropping before recreating with expanded values
- **Timestamps using NOW() for all 500 executions:** All executions will have identical timestamps — use generate_series with interval offsets
- **Random UUIDs for automations/requests:** Use fixed UUIDs for FK stability; only execution rows need gen_random_uuid() since they're not FK'd by other tables

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 500 execution rows | 500 manual INSERT statements | `generate_series(1, N)` | Maintainable, parameterizable, correct intervals |
| Bulk inserts with ON CONFLICT | Complex upsert logic | TRUNCATE + INSERT — seed owns the table | Seed is authoritative source; simpler and faster |
| UUID generation in seed | Static UUIDs for everything | Fixed UUIDs for anchor rows, `gen_random_uuid()` for executions | Executions aren't FK-referenced by downstream tables |

**Key insight:** Seed files are not migrations — they are owned data. TRUNCATE gives you a clean slate; you own every row. This eliminates all conflict-handling complexity.

## Common Pitfalls

### Pitfall 1: CHECK Constraint Expansion Ordering
**What goes wrong:** `ALTER TABLE ... ADD CONSTRAINT` fails if existing rows violate the new constraint (but since we're only adding values, not removing them, this is safe here — expansion only)
**Why it happens:** Existing rows with `category = 'customer_service'` would fail if the new CHECK excluded it
**How to avoid:** Only ADD new values to CHECK, never remove old ones. The migration expands from 5 categories to 8 — verify old values are still included in the new CHECK definition
**Warning signs:** Migration fails with "check constraint violated"

### Pitfall 2: category CHECK Must Include ALL Old Values
**What goes wrong:** New category CHECK omits one of the 5 existing values (`customer_service`, `documents`, `marketing`, `sales`, `operations`)
**Why it happens:** Typo or oversight when writing the new expanded constraint
**How to avoid:** The new CHECK must include all 5 old values PLUS the 3 new ones (ventas → sales already exists; map correctly). Check old constraint in `20260305000002_automation_business.sql` before writing:
- Old: `('customer_service', 'documents', 'marketing', 'sales', 'operations')`
- New (CONTEXT.md categories): Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA, Mas populares
- **NOTE:** Categories in CONTEXT.md appear to be display names. The DB values should be slugs. Map: ventas→sales, marketing→marketing, atencion_al_cliente→customer_service, documentos→documents, productividad→productivity (new), reportes→reports (new), agentes_ia→ai_agents (new), mas_populares→featured (new or join column)
- "Mas populares" is likely a UI filter (is_featured=true) not a DB category value — confirm during planning
**Warning signs:** Old templates with `category='operations'` become invalid after migration

### Pitfall 3: TRUNCATE CASCADE Wipes auth Tables Too
**What goes wrong:** `TRUNCATE public.organizations CASCADE` also deletes profiles which CASCADE deletes auth.users (via FK from profiles to auth.users... but actually profiles.id REFERENCES auth.users.id ON DELETE CASCADE — it's the other direction)
**Why it happens:** FK direction confusion
**How to avoid:** The FK is `profiles.id REFERENCES auth.users(id) ON DELETE CASCADE` — meaning deleting auth.users deletes profiles. So TRUNCATE public.profiles does NOT cascade to auth.users. But TRUNCATE auth.users will cascade to profiles. Explicitly DELETE from auth.identities and auth.users after truncating public tables.
**Warning signs:** After reset, auth.users still has old rows

### Pitfall 4: generate_series Execution Timestamps with NOW()
**What goes wrong:** All executions appear to have happened in the same second
**Why it happens:** NOW() is evaluated once per transaction in PostgreSQL
**How to avoid:** Use offset arithmetic: `NOW() - INTERVAL '60 days' + (n || ' hours')::INTERVAL`
**Warning signs:** Dashboard charts show flat line, all activity on one day

### Pitfall 5: i18n Keys Don't Match en.json/es.json
**What goes wrong:** UI shows raw key string (e.g., `templates.ai_chatbot.name`) instead of translated text
**Why it happens:** DB key not added to message files, or key path doesn't match exactly
**How to avoid:** Define key schema first, then write DB values and message file entries together. Use consistent dotted path: `templates.{slug_snake_case}.name` and `templates.{slug_snake_case}.description`
**Warning signs:** Dashboard shows dotted key strings in template cards

### Pitfall 6: Migration Runs Before Seed — Column Must Exist Before Seed Uses It
**What goes wrong:** Seed references new columns before migration applies them
**Why it happens:** Supabase applies migrations before seed; safe as long as migration file has correct timestamp
**How to avoid:** Migration file timestamp `20260409000001` is after all existing migrations (latest: `20260401000001`) — correct ordering is guaranteed
**Warning signs:** Seed fails with "column does not exist"

### Pitfall 7: `in_setup` vs Existing `automations.status` Values
**What goes wrong:** Existing seeded automations with `status = 'draft'` or `'pending_review'` — verify these remain valid after constraint expansion
**Why it happens:** When expanding the CHECK, all existing values must still be in the new CHECK list
**How to avoid:** New constraint must include: `'draft', 'pending_review', 'active', 'paused', 'failed', 'archived', 'in_setup'`
**Warning signs:** Migration fails or existing rows become invalid

## Code Examples

### Migration: automation_templates ALTER
```sql
-- Source: existing project pattern (20260401000001_user_registration.sql)

-- Add new columns
ALTER TABLE public.automation_templates
    ADD COLUMN IF NOT EXISTS setup_price            INTEGER,           -- cents, e.g. 9900 = $99.00
    ADD COLUMN IF NOT EXISTS monthly_price          INTEGER,           -- cents, e.g. 4900 = $49.00
    ADD COLUMN IF NOT EXISTS setup_time_days        INTEGER,           -- 1-5
    ADD COLUMN IF NOT EXISTS industry_tags          TEXT[],            -- e.g. ARRAY['retail','salud']
    ADD COLUMN IF NOT EXISTS connected_apps         TEXT[],            -- e.g. ARRAY['HubSpot','Slack']
    ADD COLUMN IF NOT EXISTS typical_impact_text    TEXT,              -- i18n key
    ADD COLUMN IF NOT EXISTS avg_minutes_per_task   INTEGER,           -- 5-45
    ADD COLUMN IF NOT EXISTS activity_metric_label  TEXT;              -- i18n key (e.g. 'templates.chatbot.metric')

-- Expand category CHECK
ALTER TABLE public.automation_templates
    DROP CONSTRAINT IF EXISTS automation_templates_category_check;

ALTER TABLE public.automation_templates
    ADD CONSTRAINT automation_templates_category_check
        CHECK (category IN (
            'customer_service', 'documents', 'marketing', 'sales', 'operations',
            'productivity', 'reports', 'ai_agents'
        ));
-- Note: 'mas_populares' / featured is handled via is_featured=true flag, not a category value
```

### Migration: automations ALTER
```sql
ALTER TABLE public.automations
    ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Expand status CHECK to include 'in_setup'
ALTER TABLE public.automations
    DROP CONSTRAINT IF EXISTS automations_status_check;

ALTER TABLE public.automations
    ADD CONSTRAINT automations_status_check
        CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'failed', 'archived', 'in_setup'));
```

### Migration: automation_requests ALTER
```sql
ALTER TABLE public.automation_requests
    ADD COLUMN IF NOT EXISTS stripe_checkout_session_id  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS checkout_expires_at         TIMESTAMPTZ;

-- Expand status CHECK
ALTER TABLE public.automation_requests
    DROP CONSTRAINT IF EXISTS automation_requests_status_check;

ALTER TABLE public.automation_requests
    ADD CONSTRAINT automation_requests_status_check
        CHECK (status IN ('pending', 'in_review', 'approved', 'completed', 'rejected', 'payment_pending', 'payment_failed'));
-- Note: exact checkout status values to be confirmed during planning based on Stripe workflow needs
```

### Seed: Template Row Example (i18n keys)
```sql
INSERT INTO public.automation_templates (
    id, name, slug, description, category, icon,
    setup_price, monthly_price, setup_time_days,
    industry_tags, connected_apps,
    typical_impact_text, avg_minutes_per_task, activity_metric_label,
    features, use_cases, config_schema, pricing_tier, is_active, is_featured, sort_order
) VALUES (
    'tt010001-0000-0000-0000-000000000001',
    'templates.ai_chatbot_24_7.name',
    'ai-chatbot-24-7',
    'templates.ai_chatbot_24_7.description',
    'customer_service',
    'message-circle',
    19900,    -- $199 setup
    4900,     -- $49/month
    2,        -- 2 days setup
    ARRAY['retail', 'salud', 'agencias'],
    ARRAY['Slack', 'HubSpot', 'Google Workspace'],
    'templates.ai_chatbot_24_7.impact',
    8,        -- 8 min per conversation handled
    'templates.ai_chatbot_24_7.metric_label',
    ARRAY['Natural language understanding', 'Escalation to human'],
    ARRAY['Handle FAQ', 'Qualify leads'],
    '{}'::jsonb,
    'starter', true, true, 1
);
```

### Seed: Execution Growth Curve (generate_series)
```sql
-- Phase 1: weeks 1-2, low volume (automation_id = chatbot)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at,
    duration_ms, input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'au111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '60 days' + (n * INTERVAL '16 hours'),
    NOW() - INTERVAL '60 days' + (n * INTERVAL '16 hours') + INTERVAL '6 seconds',
    (random() * 8000 + 2000)::INTEGER,
    ('{"conversations": ' || (random()*15+3)::INTEGER || '}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"handled": ' || (random()*12+2)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN 'Webhook timeout after 30s' ELSE NULL END,
    'schedule'
FROM generate_series(1, 90) AS n;  -- ~90 runs in weeks 1-2 across all automations
```

### Seed: Update Demo Org Settings with hourly_cost
```sql
UPDATE public.organizations
SET settings = settings || '{"hourly_cost": 25}'::jsonb
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';
-- Note: store as integer (25 = $25/hr) or numeric — to be decided during planning
-- Recommend integer (consistent with price cents) or plain number since this isn't a monetary transaction amount
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual INSERT per row for bulk data | `generate_series()` for time-series data | PostgreSQL standard | Reduces 500-line seed to ~30-line query |
| Hardcoded strings in DB | i18n key references | CONTEXT.md decision | Enables bilingual (EN/ES) template catalog |
| ON CONFLICT DO UPDATE in seeds | TRUNCATE CASCADE + plain INSERT | CONTEXT.md decision | Simpler, faster, fully deterministic |

## Open Questions

1. **"Mas populares" category vs is_featured flag**
   - What we know: CONTEXT.md lists it as one of 8 "categories" for UI display
   - What's unclear: Should it be a real `category` value in the DB CHECK, or is it a virtual tab driven by `is_featured = true`?
   - Recommendation: Use `is_featured = true` filter for "Mas populares" tab — don't add it as a category value. This means 7 real category values in the CHECK constraint + is_featured flag. Planner should confirm this interpretation.

2. **Exact `automation_requests` checkout status values**
   - What we know: CONTEXT.md says "expanded status values" and "checkout fields"
   - What's unclear: Exact new statuses needed (payment_pending? awaiting_checkout? checkout_started?)
   - Recommendation: Add `'payment_pending'` and `'payment_failed'` — these mirror Stripe checkout lifecycle and are what the future STRP phase will use.

3. **hourly_cost storage type in org settings JSONB**
   - What we know: Other prices are integer cents; hourly_cost is a different mental model ($/hr not $/item)
   - What's unclear: Should it be 2500 (cents) or 25 (dollars) in the JSONB?
   - Recommendation: Store as plain integer dollars (25) for hourly_cost since it's a human-entered rate, not a Stripe amount. The reports page will do arithmetic: `hours_saved * hourly_cost`.

4. **Whether `typical_impact_text` and `activity_metric_label` should be i18n keys**
   - What we know: CONTEXT.md places these in "Claude's Discretion" for content
   - What's unclear: Should these also be i18n keys like name/description, or can they be plain text?
   - Recommendation: Make them i18n keys too — these are user-visible strings that need EN/ES translation.

5. **Execution data `input_data`/`output_data` schema per automation type**
   - What we know: Different automations track different metrics (chatbot: conversations, lead email: emails_sent, report: reports_generated)
   - What's unclear: Exact JSONB shape for each automation's execution data
   - Recommendation: Claude decides — keep it simple (1-2 keys per automation type, consistent across all executions for that automation)

## Sources

### Primary (HIGH confidence)
- `C:/dev/12ai/supabase/migrations/20260305000002_automation_business.sql` — existing table definitions and CHECK constraints
- `C:/dev/12ai/supabase/migrations/20260401000001_user_registration.sql` — established DROP/ADD CONSTRAINT pattern
- `C:/dev/12ai/supabase/seed.sql` — existing seed structure, UUID conventions, TRUNCATE approach
- `C:/dev/12ai/supabase/config.toml` — PostgreSQL 15, Supabase CLI confirmed

### Secondary (MEDIUM confidence)
- PostgreSQL 15 docs: `generate_series`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, TRUNCATE CASCADE — standard SQL, no version changes expected

### Tertiary (LOW confidence)
- i18n key pattern inferred from CONTEXT.md decision and existing `web/messages/en.json` structure — implementation details to be confirmed during task execution

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — project tooling is fully established
- Architecture patterns: HIGH — DROP/ADD constraint pattern confirmed from existing migration; generate_series is standard PostgreSQL
- Pitfalls: HIGH — derived from direct reading of existing schema files; all constraint names and FK directions verified

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (stable domain — SQL migrations don't change)
