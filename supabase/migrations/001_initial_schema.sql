-- ===========================================
-- AIDEAS Initial Database Schema
-- ===========================================
-- Version: 1.0
-- Created: February 2026
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ORGANIZATIONS
-- ===========================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- 'small', 'medium', 'large'
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- USERS (extends Supabase auth.users)
-- ===========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ORGANIZATION MEMBERS (User-Org relationship)
-- ===========================================
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- 'admin', 'operator', 'viewer'
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ===========================================
-- INVITATIONS
-- ===========================================
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUTOMATION TEMPLATES (Master catalog)
-- ===========================================
CREATE TABLE automation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'customer_service', 'documents', 'marketing', 'sales', 'operations'
    icon VARCHAR(50),
    features TEXT[], -- Array of feature descriptions
    use_cases TEXT[], -- Array of use case descriptions
    config_schema JSONB DEFAULT '{}', -- JSON schema for configuration
    pricing_tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'pro', 'business'
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUTOMATIONS (Customer's active automations)
-- ===========================================
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES automation_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'paused', 'error', 'archived'
    config JSONB DEFAULT '{}', -- Customer-specific configuration
    schedule JSONB, -- Cron schedule if applicable
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUTOMATION EXECUTIONS (Run history)
-- ===========================================
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'running', 'success', 'error', 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    error_stack TEXT,
    triggered_by VARCHAR(50) DEFAULT 'schedule', -- 'schedule', 'manual', 'webhook', 'api'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUTOMATION REQUESTS (Customer requests)
-- ===========================================
CREATE TABLE automation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES automation_templates(id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
    notes TEXT, -- Internal notes
    assigned_to VARCHAR(255), -- Internal team member
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUBSCRIPTIONS (Billing)
-- ===========================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'pro', 'business'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'cancelled', 'trialing'
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- ===========================================
-- INVOICES
-- ===========================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    description TEXT,
    pdf_url TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUPPORT TICKETS
-- ===========================================
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    automation_id UUID REFERENCES automations(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'waiting', 'resolved', 'closed'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    category VARCHAR(100), -- 'bug', 'feature', 'question', 'billing', 'other'
    assigned_to VARCHAR(255), -- Internal team member
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUPPORT MESSAGES
-- ===========================================
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL for system/staff messages
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer
    attachments JSONB DEFAULT '[]', -- Array of attachment URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- CONTACT MESSAGES (Landing page)
-- ===========================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Users
CREATE INDEX idx_users_email ON users(email);

-- Organization Members
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Invitations
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Automation Templates
CREATE INDEX idx_templates_category ON automation_templates(category);
CREATE INDEX idx_templates_active ON automation_templates(is_active);
CREATE INDEX idx_templates_slug ON automation_templates(slug);

-- Automations
CREATE INDEX idx_automations_org ON automations(organization_id);
CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_template ON automations(template_id);
CREATE INDEX idx_automations_org_status ON automations(organization_id, status);

-- Automation Executions
CREATE INDEX idx_executions_automation ON automation_executions(automation_id);
CREATE INDEX idx_executions_status ON automation_executions(status);
CREATE INDEX idx_executions_started ON automation_executions(started_at);

-- Automation Requests
CREATE INDEX idx_requests_org ON automation_requests(organization_id);
CREATE INDEX idx_requests_status ON automation_requests(status);

-- Subscriptions
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Invoices
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- Support Tickets
CREATE INDEX idx_tickets_org ON support_tickets(organization_id);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- Support Messages
CREATE INDEX idx_messages_ticket ON support_messages(ticket_id);

-- Contact Messages
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_email ON contact_messages(email);

-- ===========================================
-- TRIGGERS for updated_at
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON automation_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON automation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Organization members can view their organizations
CREATE POLICY "Members can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Organization members policies
CREATE POLICY "Members can view org members" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Automation templates are public (read-only for customers)
CREATE POLICY "Templates are viewable by authenticated users" ON automation_templates
    FOR SELECT USING (is_active = true);

-- Automations - users can only see their organization's automations
CREATE POLICY "Users can view org automations" ON automations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Executions - same as automations
CREATE POLICY "Users can view org executions" ON automation_executions
    FOR SELECT USING (
        automation_id IN (
            SELECT id FROM automations
            WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
    );

-- Requests - organization isolation
CREATE POLICY "Users can view org requests" ON automation_requests
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Subscriptions - organization isolation
CREATE POLICY "Users can view org subscription" ON subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Invoices - organization isolation
CREATE POLICY "Users can view org invoices" ON invoices
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Support tickets - organization isolation
CREATE POLICY "Users can view org tickets" ON support_tickets
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Support messages - based on ticket access
CREATE POLICY "Users can view ticket messages" ON support_messages
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM support_tickets
            WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
        AND is_internal = false
    );

-- ===========================================
-- END OF MIGRATION
-- ===========================================
