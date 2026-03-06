-- =============================================================================
-- Automation Business Migration
-- Phase 02: Database Schema
-- Tables: automation_templates, automations, automation_executions,
--         automation_requests, subscriptions
-- =============================================================================

-- ---------------------------------------------------------------------------
-- automation_templates
-- Global catalog — readable by all authenticated users, not org-scoped
-- Writes: service_role only
-- ---------------------------------------------------------------------------

CREATE TABLE public.automation_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    category        TEXT NOT NULL
                        CHECK (category IN ('customer_service', 'documents', 'marketing', 'sales', 'operations')),
    icon            VARCHAR(50),
    features        TEXT[],
    use_cases       TEXT[],
    config_schema   JSONB NOT NULL DEFAULT '{}',
    pricing_tier    TEXT NOT NULL DEFAULT 'starter'
                        CHECK (pricing_tier IN ('starter', 'pro', 'business')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No deleted_at — use is_active to hide (per CONTEXT.md)
);

ALTER TABLE public.automation_templates ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users can read active templates (global catalog, not org-scoped)
CREATE POLICY "automation_templates_select_active"
    ON public.automation_templates
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Writes are service_role only (no INSERT/UPDATE/DELETE policies for authenticated users)

CREATE TRIGGER automation_templates_updated_at
    BEFORE UPDATE ON public.automation_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_automation_templates_category  ON public.automation_templates (category);
CREATE INDEX idx_automation_templates_is_active ON public.automation_templates (is_active);
CREATE INDEX idx_automation_templates_slug      ON public.automation_templates (slug);

-- ---------------------------------------------------------------------------
-- automations
-- Org-scoped — 6-state lifecycle, soft delete
-- Writes: service_role only
-- ---------------------------------------------------------------------------

CREATE TABLE public.automations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    template_id     UUID REFERENCES public.automation_templates(id),  -- nullable (custom automations)
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'failed', 'archived')),
    config          JSONB NOT NULL DEFAULT '{}',
    last_run_at     TIMESTAMPTZ,
    next_run_at     TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can read their org's automations (not soft-deleted)
CREATE POLICY "automations_select_org_members"
    ON public.automations
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = automations.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- Writes are service_role only (no INSERT/UPDATE/DELETE policies for authenticated users)

CREATE TRIGGER automations_updated_at
    BEFORE UPDATE ON public.automations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_automations_organization_id            ON public.automations (organization_id);
CREATE INDEX idx_automations_status                     ON public.automations (status);
CREATE INDEX idx_automations_template_id                ON public.automations (template_id);
CREATE INDEX idx_automations_organization_id_status     ON public.automations (organization_id, status);

-- ---------------------------------------------------------------------------
-- automation_executions
-- Immutable execution records — no updated_at, no deleted_at
-- Org-scoped via join through automations
-- Writes: service_role only
-- ---------------------------------------------------------------------------

CREATE TABLE public.automation_executions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id   UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
    status          TEXT NOT NULL
                        CHECK (status IN ('running', 'success', 'error', 'cancelled')),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    duration_ms     INTEGER,
    input_data      JSONB,
    output_data     JSONB,
    error_message   TEXT,
    triggered_by    TEXT NOT NULL DEFAULT 'schedule'
                        CHECK (triggered_by IN ('schedule', 'manual', 'webhook', 'api')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No updated_at or deleted_at — execution records are immutable
);

ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can see executions for their org's automations
-- Join path: automation_executions -> automations -> organization_members
CREATE POLICY "automation_executions_select_org_members"
    ON public.automation_executions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.automations a
            JOIN public.organization_members om
              ON om.organization_id = a.organization_id
            WHERE a.id = automation_executions.automation_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
              AND a.deleted_at IS NULL
        )
    );

-- Writes are service_role only (no INSERT/UPDATE/DELETE policies for authenticated users)

CREATE INDEX idx_automation_executions_automation_id ON public.automation_executions (automation_id);
CREATE INDEX idx_automation_executions_status        ON public.automation_executions (status);
CREATE INDEX idx_automation_executions_started_at    ON public.automation_executions (started_at);

-- ---------------------------------------------------------------------------
-- automation_requests
-- Org-scoped — user INSERT allowed (interaction table), service_role for updates
-- Soft delete
-- ---------------------------------------------------------------------------

CREATE TABLE public.automation_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    template_id     UUID REFERENCES public.automation_templates(id),  -- nullable
    user_id         UUID NOT NULL REFERENCES public.profiles(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    urgency         TEXT NOT NULL DEFAULT 'normal'
                        CHECK (urgency IN ('low', 'normal', 'urgent')),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_review', 'approved', 'completed', 'rejected')),
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

ALTER TABLE public.automation_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can read their org's requests (not soft-deleted)
CREATE POLICY "automation_requests_select_org_members"
    ON public.automation_requests
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = automation_requests.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- INSERT: org members can submit requests for their own org
-- WITH CHECK verifies: user is submitting for themselves AND is a member of the org
CREATE POLICY "automation_requests_insert_org_members"
    ON public.automation_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = automation_requests.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- UPDATE/DELETE: service_role only (no policies for authenticated users)

CREATE TRIGGER automation_requests_updated_at
    BEFORE UPDATE ON public.automation_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_automation_requests_organization_id ON public.automation_requests (organization_id);
CREATE INDEX idx_automation_requests_status          ON public.automation_requests (status);
CREATE INDEX idx_automation_requests_user_id         ON public.automation_requests (user_id);

-- ---------------------------------------------------------------------------
-- subscriptions
-- One per org — synced from Stripe via service_role
-- Writes: service_role only
-- ---------------------------------------------------------------------------

CREATE TABLE public.subscriptions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id         UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stripe_customer_id      VARCHAR(255),
    stripe_subscription_id  VARCHAR(255) UNIQUE,
    plan                    TEXT NOT NULL DEFAULT 'starter'
                                CHECK (plan IN ('starter', 'pro', 'business')),
    status                  TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
    billing_cycle           TEXT NOT NULL DEFAULT 'monthly'
                                CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancel_at               TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    trial_start             TIMESTAMPTZ,
    trial_end               TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- No deleted_at — subscription lifecycle managed by Stripe
    UNIQUE (organization_id)  -- one subscription per org
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can read their org's subscription
CREATE POLICY "subscriptions_select_org_members"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = subscriptions.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- Writes are service_role only (no INSERT/UPDATE/DELETE policies — synced from Stripe)

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_subscriptions_organization_id         ON public.subscriptions (organization_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id  ON public.subscriptions (stripe_subscription_id);
CREATE INDEX idx_subscriptions_status                  ON public.subscriptions (status);
