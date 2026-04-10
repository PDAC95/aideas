-- =============================================================================
-- v1.1 Schema Expansion Migration
-- Phase 07: Schema & Seed Data
-- ALTERs: automation_templates, automations, automation_requests
-- Purpose: Adds pricing/catalog columns, payment tracking columns, and
--          expands CHECK constraints for new status values needed by
--          v1.1 dashboard phases (8-12).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. automation_templates — Add catalog/pricing columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.automation_templates
    ADD COLUMN IF NOT EXISTS setup_price            INTEGER,
    ADD COLUMN IF NOT EXISTS monthly_price          INTEGER,
    ADD COLUMN IF NOT EXISTS setup_time_days        INTEGER,
    ADD COLUMN IF NOT EXISTS industry_tags          TEXT[],
    ADD COLUMN IF NOT EXISTS connected_apps         TEXT[],
    ADD COLUMN IF NOT EXISTS typical_impact_text    TEXT,
    ADD COLUMN IF NOT EXISTS avg_minutes_per_task   INTEGER,
    ADD COLUMN IF NOT EXISTS activity_metric_label  TEXT;

-- setup_price / monthly_price: integer cents (Stripe standard)
--   setup_price range: 9900–49900 (e.g., 9900 = $99.00)
--   monthly_price range: 2900–14900 (e.g., 2900 = $29.00)
-- setup_time_days: 1–5 business days
-- avg_minutes_per_task: 5–45 minutes
-- industry_tags: TEXT[] for multi-industry tagging (e.g., ARRAY['retail', 'salud'])
-- connected_apps: TEXT[] of app names (e.g., ARRAY['Slack', 'HubSpot'])
-- typical_impact_text: i18n key for impact description
-- activity_metric_label: i18n key for metric label (e.g., 'automations.metric.conversations_handled')

-- ---------------------------------------------------------------------------
-- 2. automation_templates — Expand category CHECK
--    Old values: customer_service, documents, marketing, sales, operations
--    New values: + productivity, reports, ai_agents
--    NOTE: "Mas populares" is NOT a category — use is_featured = true instead
-- ---------------------------------------------------------------------------

ALTER TABLE public.automation_templates
    DROP CONSTRAINT IF EXISTS automation_templates_category_check;

ALTER TABLE public.automation_templates
    ADD CONSTRAINT automation_templates_category_check
        CHECK (category IN (
            'customer_service', 'documents', 'marketing', 'sales', 'operations',
            'productivity', 'reports', 'ai_agents'
        ));

-- ---------------------------------------------------------------------------
-- 3. automations — Add Stripe subscription tracking column
-- ---------------------------------------------------------------------------

ALTER TABLE public.automations
    ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- ---------------------------------------------------------------------------
-- 4. automations — Expand status CHECK
--    Old values: draft, pending_review, active, paused, failed, archived
--    New values: + in_setup
-- ---------------------------------------------------------------------------

ALTER TABLE public.automations
    DROP CONSTRAINT IF EXISTS automations_status_check;

ALTER TABLE public.automations
    ADD CONSTRAINT automations_status_check
        CHECK (status IN (
            'draft', 'pending_review', 'active', 'paused', 'failed', 'archived',
            'in_setup'
        ));

-- ---------------------------------------------------------------------------
-- 5. automation_requests — Add Stripe checkout tracking columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.automation_requests
    ADD COLUMN IF NOT EXISTS stripe_checkout_session_id  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS checkout_expires_at         TIMESTAMPTZ;

-- stripe_checkout_session_id: Stripe Checkout Session ID (cs_...)
-- checkout_expires_at: when the payment window expires (typically +24h)

-- ---------------------------------------------------------------------------
-- 6. automation_requests — Expand status CHECK
--    Old values: pending, in_review, approved, completed, rejected
--    New values: + payment_pending, payment_failed
-- ---------------------------------------------------------------------------

ALTER TABLE public.automation_requests
    DROP CONSTRAINT IF EXISTS automation_requests_status_check;

ALTER TABLE public.automation_requests
    ADD CONSTRAINT automation_requests_status_check
        CHECK (status IN (
            'pending', 'in_review', 'approved', 'completed', 'rejected',
            'payment_pending', 'payment_failed'
        ));
