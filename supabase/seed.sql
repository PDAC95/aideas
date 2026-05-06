-- =============================================================================
-- AIDEAS Seed Data
-- Phase 07-02: Expanded Automation Templates (66+ templates with i18n keys)
-- Phase 07-03: Demo Org Data (automations, ~500 executions, requests, notifications)
-- =============================================================================
-- Coverage: 2 orgs, 5 users (4 seed + 1 dev), 66+ automation templates,
--           9 automations (6 Acme + 3 GlobalTech), ~500 execution records with
--           60-day growth curve, 7 requests, 13 notifications, hourly_cost setting
-- FK order: auth.users -> organizations -> profiles -> organization_members ->
--           automation_templates -> automations -> automation_executions ->
--           automation_requests -> subscriptions -> chat_messages ->
--           notifications -> invitations
-- Note: Uses TRUNCATE CASCADE for idempotency (clean slate approach per CONTEXT.md)
--       on_auth_user_created trigger disabled during auth.users insert.
-- Usage: Applied automatically by `supabase db reset`
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. TRUNCATE all tables (reverse FK order) for clean slate idempotency
-- =============================================================================

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

DELETE FROM auth.identities;
DELETE FROM auth.users;

-- =============================================================================
-- 1. auth.users (5 users: 4 seed + 1 dev user)
-- =============================================================================
-- Disable the on_auth_user_created trigger so the seed can insert auth.users
-- with fixed UUIDs and then manually create organizations, profiles, and
-- organization_members with deterministic IDs for FK stability across resets.

SET session_replication_role = replica;

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
)
VALUES
    -- Acme Corp users
    ('00000000-0000-0000-0000-000000000000',
     'a1111111-1111-1111-1111-111111111111',
     'authenticated', 'authenticated',
     'alice@acmecorp.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Alice Johnson", "first_name": "Alice", "last_name": "Johnson"}'::jsonb,
     NOW(), NOW(), '', '',
     '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'a2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'bob@acmecorp.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Bob Martinez", "first_name": "Bob", "last_name": "Martinez"}'::jsonb,
     NOW(), NOW(), '', '',
     '', ''),

    -- GlobalTech users
    ('00000000-0000-0000-0000-000000000000',
     'b1111111-1111-1111-1111-111111111111',
     'authenticated', 'authenticated',
     'carol@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Carol Chen", "first_name": "Carol", "last_name": "Chen"}'::jsonb,
     NOW(), NOW(), '', '',
     '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'b2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'dave@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dave Wilson", "first_name": "Dave", "last_name": "Wilson"}'::jsonb,
     NOW(), NOW(), '', '',
     '', ''),

    -- Dev user (from project instructions: dev@jappi.ca / Password123)
    ('00000000-0000-0000-0000-000000000000',
     'de000000-0000-0000-0000-000000000001',
     'authenticated', 'authenticated',
     'dev@jappi.ca',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dev User", "first_name": "Dev", "last_name": "User"}'::jsonb,
     NOW(), NOW(), '', '',
     '', ''),

    -- AIDEAS platform staff (super_admin) — pure account, no org membership
    ('00000000-0000-0000-0000-000000000000',
     'aaaa0000-0000-0000-0000-000000000001',
     'authenticated', 'authenticated',
     'pdmckinster@gmail.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Patrick McKinster", "first_name": "Patrick", "last_name": "McKinster"}'::jsonb,
     NOW(), NOW(), '', '',
     '', '');

SET session_replication_role = DEFAULT;

-- =============================================================================
-- 2. auth.identities (required by Supabase auth for email login)
-- =============================================================================

INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
)
VALUES
    ('a1111111-1111-1111-1111-111111111111',
     'a1111111-1111-1111-1111-111111111111',
     'a1111111-1111-1111-1111-111111111111',
     '{"sub":"a1111111-1111-1111-1111-111111111111","email":"alice@acmecorp.com"}'::jsonb,
     'email', NOW(), NOW(), NOW()),

    ('a2222222-2222-2222-2222-222222222222',
     'a2222222-2222-2222-2222-222222222222',
     'a2222222-2222-2222-2222-222222222222',
     '{"sub":"a2222222-2222-2222-2222-222222222222","email":"bob@acmecorp.com"}'::jsonb,
     'email', NOW(), NOW(), NOW()),

    ('b1111111-1111-1111-1111-111111111111',
     'b1111111-1111-1111-1111-111111111111',
     'b1111111-1111-1111-1111-111111111111',
     '{"sub":"b1111111-1111-1111-1111-111111111111","email":"carol@globaltech.io"}'::jsonb,
     'email', NOW(), NOW(), NOW()),

    ('b2222222-2222-2222-2222-222222222222',
     'b2222222-2222-2222-2222-222222222222',
     'b2222222-2222-2222-2222-222222222222',
     '{"sub":"b2222222-2222-2222-2222-222222222222","email":"dave@globaltech.io"}'::jsonb,
     'email', NOW(), NOW(), NOW()),

    ('de000000-0000-0000-0000-000000000001',
     'de000000-0000-0000-0000-000000000001',
     'de000000-0000-0000-0000-000000000001',
     '{"sub":"de000000-0000-0000-0000-000000000001","email":"dev@jappi.ca"}'::jsonb,
     'email', NOW(), NOW(), NOW()),

    ('aaaa0000-0000-0000-0000-000000000001',
     'aaaa0000-0000-0000-0000-000000000001',
     'aaaa0000-0000-0000-0000-000000000001',
     '{"sub":"aaaa0000-0000-0000-0000-000000000001","email":"pdmckinster@gmail.com"}'::jsonb,
     'email', NOW(), NOW(), NOW());

-- AIDEAS platform staff seed — promote pdmckinster@gmail.com to super_admin.
-- This runs AFTER the admin_foundation migration creates the platform_staff table,
-- so we can insert directly. Idempotent via ON CONFLICT.
INSERT INTO public.platform_staff (user_id, role)
VALUES ('aaaa0000-0000-0000-0000-000000000001', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- 3. organizations (2 orgs)
-- =============================================================================

INSERT INTO public.organizations (id, name, slug, website, settings)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001',
     'Acme Corp',
     'acme-corp',
     'https://acmecorp.com',
     '{"timezone": "America/Toronto", "industry": "marketing_agency"}'::jsonb),

    ('bbbbbbbb-0000-0000-0000-000000000001',
     'GlobalTech',
     'globaltech',
     'https://globaltech.io',
     '{"timezone": "America/Vancouver", "industry": "tech_consulting"}'::jsonb);

-- Update Acme Corp org settings with hourly_cost (dollars per hour, used for ROI calculations)
-- Stored as plain integer: 25 = $25/hr (not Stripe cents — this is a human-entered rate)
UPDATE public.organizations
SET settings = settings || '{"hourly_cost": 25}'::jsonb
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- =============================================================================
-- 4. profiles (manually inserted — trigger disabled above)
-- =============================================================================

INSERT INTO public.profiles (id, email, full_name, first_name, last_name, org_id)
VALUES
    ('a1111111-1111-1111-1111-111111111111',
     'alice@acmecorp.com', 'Alice Johnson', 'Alice', 'Johnson',
     'aaaaaaaa-0000-0000-0000-000000000001'),

    ('a2222222-2222-2222-2222-222222222222',
     'bob@acmecorp.com', 'Bob Martinez', 'Bob', 'Martinez',
     'aaaaaaaa-0000-0000-0000-000000000001'),

    ('b1111111-1111-1111-1111-111111111111',
     'carol@globaltech.io', 'Carol Chen', 'Carol', 'Chen',
     'bbbbbbbb-0000-0000-0000-000000000001'),

    ('b2222222-2222-2222-2222-222222222222',
     'dave@globaltech.io', 'Dave Wilson', 'Dave', 'Wilson',
     'bbbbbbbb-0000-0000-0000-000000000001'),

    ('de000000-0000-0000-0000-000000000001',
     'dev@jappi.ca', 'Dev User', 'Dev', 'User',
     'aaaaaaaa-0000-0000-0000-000000000001');

-- =============================================================================
-- 5. organization_members (5 members: 4 seed users + dev user)
-- =============================================================================

INSERT INTO public.organization_members (id, organization_id, user_id, role, is_active)
VALUES
    ('dd111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'owner', true),

    ('dd111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'operator', true),

    ('dd222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'owner', true),

    ('dd222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b2222222-2222-2222-2222-222222222222',
     'viewer', true),

    ('dd111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'de000000-0000-0000-0000-000000000001',
     'admin', true);

-- =============================================================================
-- 6. automation_templates (66 templates across 8 categories with i18n keys)
-- =============================================================================
-- UUID pattern: tt{cat}{seq}-0000-0000-0000-000000000001
--   cat 01 = sales, 02 = marketing, 03 = customer_service, 04 = documents
--   cat 05 = operations, 06 = productivity, 07 = reports, 08 = ai_agents
-- i18n key pattern: templates.{snake_slug}.name / .description / .impact / .metric_label

INSERT INTO public.automation_templates (
    id, name, slug, description, category, icon,
    setup_price, monthly_price, setup_time_days,
    industry_tags, connected_apps,
    typical_impact_text, avg_minutes_per_task, activity_metric_label,
    features, use_cases, config_schema,
    pricing_tier, is_active, is_featured, sort_order
)
VALUES

-- ==================== SALES (cat 01, 8 templates) ====================

    ('ee010100-0000-0000-0000-000000000001',
     'templates.lead_followup_email.name',
     'lead-followup-email',
     'templates.lead_followup_email.description',
     'sales', 'user-plus',
     19900, 4900, 2,
     ARRAY['retail', 'agencias', 'inmobiliaria'],
     ARRAY['HubSpot', 'Mailchimp', 'Google Workspace'],
     'templates.lead_followup_email.impact',
     8, 'templates.lead_followup_email.metric_label',
     ARRAY['Personalized email sequences', 'A/B testing support', 'Engagement tracking', 'a0to-pause on reply'],
     ARRAY['Nurture cold leads', 'Follow up after trade shows', 'Re-engage inactive prospects'],
     '{}'::jsonb, 'pro', true, true, 1),

    ('ee010200-0000-0000-0000-000000000001',
     'templates.crm_data_sync.name',
     'crm-data-sync',
     'templates.crm_data_sync.description',
     'sales', 'git-merge',
     29900, 7900, 3,
     ARRAY['agencias', 'retail'],
     ARRAY['HubSpot', 'Salesforce', 'Google Workspace'],
     'templates.crm_data_sync.impact',
     15, 'templates.crm_data_sync.metric_label',
     ARRAY['Bi-directional sync', 'Conflict resolution rules', 'a0dit trail logging', 'Field mapping'],
     ARRAY['Keep CRM and ERP in sync', 'Eliminate duplicate entries', 'Real-time data updates'],
     '{}'::jsonb, 'business', true, false, 2),

    ('ee010300-0000-0000-0000-000000000001',
     'templates.proposal_generator.name',
     'proposal-generator',
     'templates.proposal_generator.description',
     'sales', 'file-text',
     29900, 7900, 3,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'HubSpot', 'Notion'],
     'templates.proposal_generator.impact',
     20, 'templates.proposal_generator.metric_label',
     ARRAY['Template-based generation', 'CRM data pre-fill', 'PDF export', 'e-Signature ready'],
     ARRAY['Generate client proposals fast', 'Standardize proposal format', 'Reduce manual writing'],
     '{}'::jsonb, 'business', true, true, 3),

    ('ee010400-0000-0000-0000-000000000001',
     'templates.quote_builder.name',
     'quote-builder',
     'templates.quote_builder.description',
     'sales', 'calculator',
     19900, 4900, 2,
     ARRAY['retail', 'inmobiliaria'],
     ARRAY['HubSpot', 'QuickBooks', 'Google Workspace'],
     'templates.quote_builder.impact',
     12, 'templates.quote_builder.metric_label',
     ARRAY['Dynamic pricing rules', 'Product catalog integration', 'a0to-expiry reminders', 'One-click to invoice'],
     ARRAY['Quote products and services quickly', 'Handle volume discounts', 'Track quote acceptance rates'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('ee010500-0000-0000-0000-000000000001',
     'templates.pipeline_alerts.name',
     'pipeline-alerts',
     'templates.pipeline_alerts.description',
     'sales', 'bell',
     9900, 2900, 1,
     ARRAY['agencias', 'retail', 'inmobiliaria'],
     ARRAY['HubSpot', 'Slack', 'Google Workspace'],
     'templates.pipeline_alerts.impact',
     5, 'templates.pipeline_alerts.metric_label',
     ARRAY['Stage change notifications', 'Stale deal alerts', 'Win/loss summaries', 'Slack integration'],
     ARRAY['Alert reps on deal changes', 'Prevent deals from going cold', 'Keep managers informed'],
     '{}'::jsonb, 'starter', true, false, 5),

    ('ee010600-0000-0000-0000-000000000001',
     'templates.territory_report.name',
     'territory-report',
     'templates.territory_report.description',
     'sales', 'map',
     19900, 4900, 2,
     ARRAY['retail', 'agencias'],
     ARRAY['Salesforce', 'Google Workspace', 'Slack'],
     'templates.territory_report.impact',
     25, 'templates.territory_report.metric_label',
     ARRAY['Geographic segmentation', 'Rep performance breakdown', 'Quota attainment tracking', 'Scheduled delivery'],
     ARRAY['Weekly territory reviews', 'Quota planning support', 'Regional performance comparison'],
     '{}'::jsonb, 'pro', true, false, 6),

    ('ee010700-0000-0000-0000-000000000001',
     'templates.win_loss_analysis.name',
     'win-loss-analysis',
     'templates.win_loss_analysis.description',
     'sales', 'bar-chart-2',
     29900, 7900, 3,
     ARRAY['agencias', 'retail'],
     ARRAY['HubSpot', 'Salesforce', 'Google Workspace'],
     'templates.win_loss_analysis.impact',
     30, 'templates.win_loss_analysis.metric_label',
     ARRAY['Closed deal analysis', 'Competitor win rate tracking', 'Stage dropout heatmap', 'AI insight summaries'],
     ARRAY['Identify why deals are lost', 'Improve win rates', 'Refine sales messaging'],
     '{}'::jsonb, 'business', true, false, 7),

    ('ee010800-0000-0000-0000-000000000001',
     'templates.sales_forecasting.name',
     'sales-forecasting',
     'templates.sales_forecasting.description',
     'sales', 'trending-up',
     49900, 14900, 5,
     ARRAY['retail', 'agencias'],
     ARRAY['Salesforce', 'HubSpot', 'Google Workspace'],
     'templates.sales_forecasting.impact',
     40, 'templates.sales_forecasting.metric_label',
     ARRAY['ML-based revenue prediction', 'Pipeline coverage analysis', 'Scenario modeling', 'Executive dashboards'],
     ARRAY['Improve forecast accuracy', 'Plan headcount and inventory', 'Align teams on revenue targets'],
     '{}'::jsonb, 'business', true, true, 8),

-- ==================== MARKETING (cat 02, 8 templates) ====================

    ('ee020100-0000-0000-0000-000000000001',
     'templates.content_generation.name',
     'content-generation',
     'templates.content_generation.description',
     'marketing', 'edit-3',
     19900, 7900, 2,
     ARRAY['agencias', 'retail', 'restaurantes'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.content_generation.impact',
     15, 'templates.content_generation.metric_label',
     ARRAY['Blog, social, and email content', 'Brand voice matching', 'SEO keyword integration', 'Multi-format output'],
     ARRAY['Scale content production', 'Maintain brand consistency', 'Reduce writer bottlenecks'],
     '{}'::jsonb, 'pro', true, true, 1),

    ('ee020200-0000-0000-0000-000000000001',
     'templates.social_scheduler.name',
     'social-scheduler',
     'templates.social_scheduler.description',
     'marketing', 'calendar',
     9900, 2900, 1,
     ARRAY['retail', 'restaurantes', 'agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.social_scheduler.impact',
     10, 'templates.social_scheduler.metric_label',
     ARRAY['Multi-platform scheduling', 'Optimal time targeting', 'Content calendar sync', 'Performance tracking'],
     ARRAY['Schedule posts weeks in advance', 'Maintain consistent posting', 'Coordinate campaign launches'],
     '{}'::jsonb, 'starter', true, false, 2),

    ('ee020300-0000-0000-0000-000000000001',
     'templates.lead_scoring.name',
     'lead-scoring',
     'templates.lead_scoring.description',
     'marketing', 'target',
     19900, 4900, 2,
     ARRAY['agencias', 'inmobiliaria', 'retail'],
     ARRAY['HubSpot', 'Mailchimp', 'Google Workspace'],
     'templates.lead_scoring.impact',
     10, 'templates.lead_scoring.metric_label',
     ARRAY['Behavioral scoring', 'Demographic weighting', 'CRM score sync', 'Real-time updates'],
     ARRAY['Focus sales on hot leads', 'Reduce wasted outreach', 'Improve lead-to-close rates'],
     '{}'::jsonb, 'pro', true, true, 3),

    ('ee020400-0000-0000-0000-000000000001',
     'templates.email_campaigns.name',
     'email-campaigns',
     'templates.email_campaigns.description',
     'marketing', 'mail',
     19900, 4900, 2,
     ARRAY['retail', 'agencias', 'restaurantes'],
     ARRAY['Mailchimp', 'HubSpot', 'Google Workspace'],
     'templates.email_campaigns.impact',
     8, 'templates.email_campaigns.metric_label',
     ARRAY['Segmented audience targeting', 'Drip sequences', 'Open/click tracking', 'a0tomated list hygiene'],
     ARRAY['Nurture subscribers to buyers', 'Announce product launches', 'Recover abandoned carts'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('ee020500-0000-0000-0000-000000000001',
     'templates.seo_monitoring.name',
     'seo-monitoring',
     'templates.seo_monitoring.description',
     'marketing', 'search',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.seo_monitoring.impact',
     10, 'templates.seo_monitoring.metric_label',
     ARRAY['Keyword rank tracking', 'Competitor monitoring', 'Algorithm change alerts', 'Weekly digest reports'],
     ARRAY['Track keyword position changes', 'Alert team on ranking drops', 'Monitor competitor rankings'],
     '{}'::jsonb, 'starter', true, false, 5),

    ('ee020600-0000-0000-0000-000000000001',
     'templates.ad_performance.name',
     'ad-performance',
     'templates.ad_performance.description',
     'marketing', 'bar-chart',
     19900, 4900, 2,
     ARRAY['retail', 'agencias', 'restaurantes'],
     ARRAY['Google Workspace', 'Slack', 'HubSpot'],
     'templates.ad_performance.impact',
     15, 'templates.ad_performance.metric_label',
     ARRAY['Cross-platform aggregation', 'ROAS and CPA tracking', 'Budget pacing alerts', 'Anomaly detection'],
     ARRAY['Track ad spend efficiency', 'Alert on budget overruns', 'Compare campaign performance'],
     '{}'::jsonb, 'pro', true, false, 6),

    ('ee020700-0000-0000-0000-000000000001',
     'templates.audience_segmentation.name',
     'audience-segmentation',
     'templates.audience_segmentation.description',
     'marketing', 'users',
     29900, 7900, 3,
     ARRAY['retail', 'agencias'],
     ARRAY['HubSpot', 'Mailchimp', 'Salesforce'],
     'templates.audience_segmentation.impact',
     20, 'templates.audience_segmentation.metric_label',
     ARRAY['RFM analysis', 'Behavioral clustering', 'Dynamic segment sync', 'CRM tag automation'],
     ARRAY['Personalize campaigns by segment', 'Identify high-value customer groups', 'a0tomate list management'],
     '{}'::jsonb, 'business', true, false, 7),

    ('ee020800-0000-0000-0000-000000000001',
     'templates.newsletter_automation.name',
     'newsletter-automation',
     'templates.newsletter_automation.description',
     'marketing', 'send',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Mailchimp', 'Google Workspace', 'Notion'],
     'templates.newsletter_automation.impact',
     8, 'templates.newsletter_automation.metric_label',
     ARRAY['Content curation from RSS/blog', 'Personalized subject lines', '50bscriber health monitoring', 'Unsubscribe handling'],
     ARRAY['Send weekly newsletters automatically', 'Curate relevant industry news', 'Maintain subscriber engagement'],
     '{}'::jsonb, 'starter', true, false, 8),

-- ==================== CUSTOMER SERVICE (cat 03, 9 templates) ====================

    ('ee030100-0000-0000-0000-000000000001',
     'templates.ai_chatbot_24_7.name',
     'ai-chatbot-24-7',
     'templates.ai_chatbot_24_7.description',
     'customer_service', 'message-circle',
     29900, 9900, 3,
     ARRAY['retail', 'salud', 'restaurantes'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.ai_chatbot_24_7.impact',
     5, 'templates.ai_chatbot_24_7.metric_label',
     ARRAY['Natural language understanding', 'Multi-language support', 'Human escalation routing', 'Knowledge base integration'],
     ARRAY['Handle FAQs automatically', 'Qualify leads before handoff', 'Provide instant after-hours support'],
     '{}'::jsonb, 'business', true, true, 1),

    ('ee030200-0000-0000-0000-000000000001',
     'templates.auto_response_email.name',
     'auto-response-email',
     'templates.auto_response_email.description',
     'customer_service', 'mail',
     9900, 2900, 1,
     ARRAY['retail', 'salud', 'legal'],
     ARRAY['Google Workspace', 'Zendesk', 'HubSpot'],
     'templates.auto_response_email.impact',
     5, 'templates.auto_response_email.metric_label',
     ARRAY['Smart categorization', 'Template-based replies', 'SLA acknowledgment', 'Priority routing'],
     ARRAY['Acknowledge support emails instantly', 'Send order confirmations', 'Route tickets by topic'],
     '{}'::jsonb, 'starter', true, false, 2),

    ('ee030300-0000-0000-0000-000000000001',
     'templates.ticket_routing.name',
     'ticket-routing',
     'templates.ticket_routing.description',
     'customer_service', 'git-branch',
     19900, 4900, 2,
     ARRAY['retail', 'salud', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'HubSpot'],
     'templates.ticket_routing.impact',
     8, 'templates.ticket_routing.metric_label',
     ARRAY['AI-powered classification', 'Skill-based routing', 'Load balancing', 'Priority override rules'],
     ARRAY['Route tickets to right agent', 'Reduce misassignments', 'Balance team workload'],
     '{}'::jsonb, 'pro', true, false, 3),

    ('ee030400-0000-0000-0000-000000000001',
     'templates.satisfaction_surveys.name',
     'satisfaction-surveys',
     'templates.satisfaction_surveys.description',
     'customer_service', 'star',
     9900, 2900, 1,
     ARRAY['retail', 'salud', 'restaurantes'],
     ARRAY['Google Workspace', 'Slack', 'Zendesk'],
     'templates.satisfaction_surveys.impact',
     5, 'templates.satisfaction_surveys.metric_label',
     ARRAY['Post-ticket CSAT surveys', 'NPS collection', 'Low-score alert routing', 'Trend dashboards'],
     ARRAY['Measure service quality', 'Alert team on unhappy customers', 'Track satisfaction over time'],
     '{}'::jsonb, 'starter', true, false, 4),

    ('ee030500-0000-0000-0000-000000000001',
     'templates.sla_monitoring.name',
     'sla-monitoring',
     'templates.sla_monitoring.description',
     'customer_service', 'clock',
     19900, 4900, 2,
     ARRAY['salud', 'legal', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.sla_monitoring.impact',
     8, 'templates.sla_monitoring.metric_label',
     ARRAY['Breach prediction alerts', 'a0to-escalation rules', 'SLA compliance reporting', 'Priority queue management'],
     ARRAY['Prevent SLA breaches', 'a0to-escalate at-risk tickets', 'Prove compliance to clients'],
     '{}'::jsonb, 'pro', true, false, 5),

    ('ee030600-0000-0000-0000-000000000001',
     'templates.knowledge_base_updater.name',
     'knowledge-base-updater',
     'templates.knowledge_base_updater.description',
     'customer_service', 'book-open',
     19900, 4900, 2,
     ARRAY['retail', 'salud', 'agencias'],
     ARRAY['Notion', 'Zendesk', 'Slack'],
     'templates.knowledge_base_updater.impact',
     20, 'templates.knowledge_base_updater.metric_label',
     ARRAY['Recurring query detection', 'Draft article generation', 'Review workflow', 'KB search integration'],
     ARRAY['Keep help docs current', 'Reduce repetitive ticket volume', 'Empower customers to self-serve'],
     '{}'::jsonb, 'pro', true, false, 6),

    ('ee030700-0000-0000-0000-000000000001',
     'templates.escalation_manager.name',
     'escalation-manager',
     'templates.escalation_manager.description',
     'customer_service', 'alert-triangle',
     29900, 7900, 3,
     ARRAY['salud', 'legal', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.escalation_manager.impact',
     10, 'templates.escalation_manager.metric_label',
     ARRAY['Multi-tier escalation paths', 'VIP customer detection', 'Sentiment-based triggers', 'Manager notification'],
     ARRAY['Catch at-risk customers before they churn', 'Escalate VIP issues immediately', 'Ensure senior team visibility'],
     '{}'::jsonb, 'business', true, true, 7),

    ('ee030800-0000-0000-0000-000000000001',
     'templates.faq_bot.name',
     'faq-bot',
     'templates.faq_bot.description',
     'customer_service', 'help-circle',
     9900, 2900, 1,
     ARRAY['restaurantes', 'retail', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'Zendesk'],
     'templates.faq_bot.impact',
     5, 'templates.faq_bot.metric_label',
     ARRAY['FAQ library management', 'Fuzzy matching', 'Multi-channel deployment', 'Fallback to human'],
     ARRAY['Answer common questions instantly', 'Reduce tier-1 ticket volume', 'Deploy to website and chat'],
     '{}'::jsonb, 'starter', true, false, 8),

    ('ee030900-0000-0000-0000-000000000001',
     'templates.review_response.name',
     'review-response',
     'templates.review_response.description',
     'customer_service', 'message-square',
     9900, 2900, 1,
     ARRAY['restaurantes', 'retail', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'HubSpot'],
     'templates.review_response.impact',
     5, 'templates.review_response.metric_label',
     ARRAY['Multi-platform monitoring', 'Sentiment-aware drafts', 'Brand voice templates', 'Response time tracking'],
     ARRAY['Respond to all reviews fast', 'Protect online reputation', 'Identify recurring complaints'],
     '{}'::jsonb, 'starter', true, false, 9),

-- ==================== DOCUMENTS (cat 04, 8 templates) ====================

    ('ee040100-0000-0000-0000-000000000001',
     'templates.invoice_processing.name',
     'invoice-processing',
     'templates.invoice_processing.description',
     'documents', 'file-text',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'inmobiliaria'],
     ARRAY['QuickBooks', 'Google Workspace', 'Stripe'],
     'templates.invoice_processing.impact',
     15, 'templates.invoice_processing.metric_label',
     ARRAY['OCR data extraction', 'Vendor matching', 'Multi-format support', 'ERP posting'],
     ARRAY['Process vendor invoices', 'a0tomate accounts payable', 'Reconcile against POs'],
     '{}'::jsonb, 'business', true, true, 1),

    ('ee040200-0000-0000-0000-000000000001',
     'templates.report_generation.name',
     'report-generation',
     'templates.report_generation.description',
     'documents', 'bar-chart-2',
     19900, 4900, 2,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.report_generation.impact',
     25, 'templates.report_generation.metric_label',
     ARRAY['Custom report templates', 'Scheduled generation', 'PDF and Excel export', 'a0to-distribution'],
     ARRAY['Generate weekly sales reports', 'Produce client-facing summaries', 'a0tomate board reports'],
     '{}'::jsonb, 'pro', true, false, 2),

    ('ee040300-0000-0000-0000-000000000001',
     'templates.contract_analysis.name',
     'contract-analysis',
     'templates.contract_analysis.description',
     'documents', 'shield',
     49900, 14900, 5,
     ARRAY['legal', 'inmobiliaria', 'agencias'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.contract_analysis.impact',
     35, 'templates.contract_analysis.metric_label',
     ARRAY['Key clause extraction', 'Risk flagging', 'Obligation tracking', 'Renewal alerts'],
     ARRAY['Review contracts at scale', 'Flag non-standard terms', 'Track contract obligations'],
     '{}'::jsonb, 'business', true, true, 3),

    ('ee040400-0000-0000-0000-000000000001',
     'templates.data_extraction.name',
     'data-extraction',
     'templates.data_extraction.description',
     'documents', 'database',
     19900, 4900, 2,
     ARRAY['retail', 'salud', 'legal'],
     ARRAY['Google Workspace', 'QuickBooks', 'Notion'],
     'templates.data_extraction.impact',
     20, 'templates.data_extraction.metric_label',
     ARRAY['Multi-format parsing (PDF, Excel, CSV)', 'Field validation', 'Structured output export', 'Error flagging'],
     ARRAY['Extract data from forms', 'Parse lab reports', 'Digitize paper records'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('ee040500-0000-0000-0000-000000000001',
     'templates.document_approval.name',
     'document-approval',
     'templates.document_approval.description',
     'documents', 'check-circle',
     19900, 4900, 2,
     ARRAY['legal', 'inmobiliaria', 'agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.document_approval.impact',
     15, 'templates.document_approval.metric_label',
     ARRAY['Multi-stage approval workflows', 'Deadline reminders', 'a0dit trail', 'e-Signature integration'],
     ARRAY['Route documents for sign-off', 'Track approval status', 'Enforce compliance workflows'],
     '{}'::jsonb, 'pro', true, false, 5),

    ('ee040600-0000-0000-0000-000000000001',
     'templates.template_filling.name',
     'template-filling',
     'templates.template_filling.description',
     'documents', 'copy',
     9900, 2900, 1,
     ARRAY['legal', 'inmobiliaria', 'retail'],
     ARRAY['Google Workspace', 'HubSpot', 'Notion'],
     'templates.template_filling.impact',
     10, 'templates.template_filling.metric_label',
     ARRAY['CRM data merge', 'Dynamic field population', 'Batch document generation', 'Version control'],
     ARRAY['a0to-fill NDAs and contracts', 'Generate personalized letters', 'Produce onboarding documents'],
     '{}'::jsonb, 'starter', true, false, 6),

    ('ee040700-0000-0000-0000-000000000001',
     'templates.receipt_scanning.name',
     'receipt-scanning',
     'templates.receipt_scanning.description',
     'documents', 'camera',
     9900, 2900, 1,
     ARRAY['retail', 'restaurantes', 'legal'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.receipt_scanning.impact',
     8, 'templates.receipt_scanning.metric_label',
     ARRAY['Mobile photo capture', 'Expense categorization', 'Accounting sync', 'Reimbursement workflow'],
     ARRAY['Digitize expense receipts', 'a0to-categorize business expenses', 'Speed up reimbursements'],
     '{}'::jsonb, 'starter', true, false, 7),

    ('ee040800-0000-0000-0000-000000000001',
     'templates.compliance_checker.name',
     'compliance-checker',
     'templates.compliance_checker.description',
     'documents', 'shield-check',
     49900, 14900, 5,
     ARRAY['legal', 'salud', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.compliance_checker.impact',
     30, 'templates.compliance_checker.metric_label',
     ARRAY['Regulatory rule library', 'Document gap analysis', 'Remediation workflow', 'a0dit report generation'],
     ARRAY['Check documents for compliance', 'Identify regulatory gaps', 'Prepare audit documentation'],
     '{}'::jsonb, 'business', true, false, 8),

-- ==================== OPERATIONS (cat 05, 8 templates) ====================

    ('ee050100-0000-0000-0000-000000000001',
     'templates.data_reconciliation.name',
     'data-reconciliation',
     'templates.data_reconciliation.description',
     'operations', 'git-merge',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'agencias'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.data_reconciliation.impact',
     30, 'templates.data_reconciliation.metric_label',
     ARRAY['Multi-source comparison', 'Discrepancy detection', 'a0to-resolution rules', 'Exception reporting'],
     ARRAY['Match bank statements', 'Reconcile inventory counts', 'Verify transaction records'],
     '{}'::jsonb, 'business', true, true, 1),

    ('ee050200-0000-0000-0000-000000000001',
     'templates.inventory_sync.name',
     'inventory-sync',
     'templates.inventory_sync.description',
     'operations', 'package',
     19900, 4900, 2,
     ARRAY['retail', 'restaurantes'],
     ARRAY['Shopify', 'QuickBooks', 'Google Workspace'],
     'templates.inventory_sync.impact',
     20, 'templates.inventory_sync.metric_label',
     ARRAY['Real-time stock updates', 'Multi-location tracking', 'Reorder point alerts', '50pplier order automation'],
     ARRAY['Keep all systems in sync', 'Prevent overselling', 'a0tomate purchase orders'],
     '{}'::jsonb, 'pro', true, true, 2),

    ('ee050300-0000-0000-0000-000000000001',
     'templates.shift_scheduling.name',
     'shift-scheduling',
     'templates.shift_scheduling.description',
     'operations', 'calendar',
     19900, 4900, 2,
     ARRAY['restaurantes', 'retail', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'Zoom'],
     'templates.shift_scheduling.impact',
     15, 'templates.shift_scheduling.metric_label',
     ARRAY['Availability-based scheduling', 'Coverage gap detection', 'a0tomated shift reminders', 'Swap request handling'],
     ARRAY['Build weekly schedules automatically', 'Prevent understaffing', 'Notify staff of shifts'],
     '{}'::jsonb, 'pro', true, false, 3),

    ('ee050400-0000-0000-0000-000000000001',
     'templates.vendor_management.name',
     'vendor-management',
     'templates.vendor_management.description',
     'operations', 'briefcase',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'inmobiliaria'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.vendor_management.impact',
     20, 'templates.vendor_management.metric_label',
     ARRAY['Contract expiry tracking', 'Performance scoring', 'Payment schedule automation', 'Onboarding workflows'],
     ARRAY['Track vendor contract renewals', 'Monitor supplier performance', 'a0tomate vendor payments'],
     '{}'::jsonb, 'business', true, false, 4),

    ('ee050500-0000-0000-0000-000000000001',
     'templates.quality_monitoring.name',
     'quality-monitoring',
     'templates.quality_monitoring.description',
     'operations', 'shield',
     29900, 7900, 3,
     ARRAY['salud', 'restaurantes', 'retail'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.quality_monitoring.impact',
     20, 'templates.quality_monitoring.metric_label',
     ARRAY['Threshold-based alerting', 'Trend analysis', 'Non-conformance tracking', 'Corrective action workflows'],
     ARRAY['Monitor production quality metrics', 'Alert on defect spikes', 'Track corrective actions'],
     '{}'::jsonb, 'business', true, false, 5),

    ('ee050600-0000-0000-0000-000000000001',
     'templates.workflow_orchestrator.name',
     'workflow-orchestrator',
     'templates.workflow_orchestrator.description',
     'operations', 'git-branch',
     49900, 14900, 5,
     ARRAY['agencias', 'retail', 'legal'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.workflow_orchestrator.impact',
     25, 'templates.workflow_orchestrator.metric_label',
     ARRAY['Visual workflow builder', 'Conditional logic routing', 'Cross-system triggers', 'Error handling and retries'],
     ARRAY['a0tomate multi-step business processes', 'Connect siloed systems', 'Replace manual handoffs'],
     '{}'::jsonb, 'business', true, true, 6),

    ('ee050700-0000-0000-0000-000000000001',
     'templates.system_health_monitor.name',
     'system-health-monitor',
     'templates.system_health_monitor.description',
     'operations', 'activity',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Slack', 'Google Workspace', 'Notion'],
     'templates.system_health_monitor.impact',
     8, 'templates.system_health_monitor.metric_label',
     ARRAY['Uptime monitoring', 'Latency tracking', 'Error rate alerting', 'Incident auto-creation'],
     ARRAY['Monitor API and service uptime', 'Alert team on outages', 'Track performance degradation'],
     '{}'::jsonb, 'starter', true, false, 7),

    ('ee050800-0000-0000-0000-000000000001',
     'templates.backup_verification.name',
     'backup-verification',
     'templates.backup_verification.description',
     'operations', 'hard-drive',
     9900, 2900, 1,
     ARRAY['legal', 'salud', 'agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.backup_verification.impact',
     10, 'templates.backup_verification.metric_label',
     ARRAY['Scheduled backup checks', 'Integrity validation', 'Recovery test automation', 'Failure alerting'],
     ARRAY['Verify backups completed', 'Test recovery procedures', 'Ensure data protection compliance'],
     '{}'::jsonb, 'starter', true, false, 8),

-- ==================== PRODUCTIVITY (cat 06, 8 templates) ====================

    ('ee060100-0000-0000-0000-000000000001',
     'templates.meeting_notes_ai.name',
     'meeting-notes-ai',
     'templates.meeting_notes_ai.description',
     'productivity', 'mic',
     9900, 2900, 1,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Zoom', 'Google Workspace', 'Notion'],
     'templates.meeting_notes_ai.impact',
     20, 'templates.meeting_notes_ai.metric_label',
     ARRAY['a0to-transcription', 'Action item extraction', '50mmary email generation', 'CRM note sync'],
     ARRAY['Capture meeting decisions automatically', 'Distribute meeting summaries', 'Track action items'],
     '{}'::jsonb, 'starter', true, true, 1),

    ('ee060200-0000-0000-0000-000000000001',
     'templates.task_assignment.name',
     'task-assignment',
     'templates.task_assignment.description',
     'productivity', 'check-square',
     9900, 2900, 1,
     ARRAY['agencias', 'retail', 'inmobiliaria'],
     ARRAY['Notion', 'Slack', 'Google Workspace'],
     'templates.task_assignment.impact',
     8, 'templates.task_assignment.metric_label',
     ARRAY['Trigger-based task creation', 'Smart assignment rules', 'Due date calculation', 'Progress tracking'],
     ARRAY['a0to-create tasks from emails', 'Assign based on workload', 'Track task completion rates'],
     '{}'::jsonb, 'starter', true, false, 2),

    ('ee060300-0000-0000-0000-000000000001',
     'templates.time_tracking_sync.name',
     'time-tracking-sync',
     'templates.time_tracking_sync.description',
     'productivity', 'clock',
     9900, 2900, 1,
     ARRAY['agencias', 'legal'],
     ARRAY['Google Workspace', 'QuickBooks', 'Slack'],
     'templates.time_tracking_sync.impact',
     10, 'templates.time_tracking_sync.metric_label',
     ARRAY['Project-level time aggregation', 'Billing rate calculation', 'Weekly timesheet generation', 'Approval workflow'],
     ARRAY['a0to-generate client invoices from time', 'Track billable vs non-billable', 'Produce payroll data'],
     '{}'::jsonb, 'starter', true, false, 3),

    ('ee060400-0000-0000-0000-000000000001',
     'templates.calendar_optimizer.name',
     'calendar-optimizer',
     'templates.calendar_optimizer.description',
     'productivity', 'calendar',
     9900, 2900, 1,
     ARRAY['agencias', 'inmobiliaria', 'salud'],
     ARRAY['Google Workspace', 'Calendly', 'Zoom'],
     'templates.calendar_optimizer.impact',
     10, 'templates.calendar_optimizer.metric_label',
     ARRAY['Focus time blocking', 'Meeting clustering', 'Buffer time enforcement', 'Booking link management'],
     ARRAY['Protect deep work time', 'Reduce scheduling back-and-forth', 'Improve team meeting hygiene'],
     '{}'::jsonb, 'starter', true, false, 4),

    ('ee060500-0000-0000-0000-000000000001',
     'templates.slack_digest.name',
     'slack-digest',
     'templates.slack_digest.description',
     'productivity', 'message-square',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Slack', 'Google Workspace', 'Notion'],
     'templates.slack_digest.impact',
     5, 'templates.slack_digest.metric_label',
     ARRAY['Channel summarization', 'Priority thread highlighting', 'Action item extraction', 'Scheduled delivery'],
     ARRAY['Catch up on missed messages fast', '50rface important decisions', 'Reduce notification fatigue'],
     '{}'::jsonb, 'starter', true, false, 5),

    ('ee060600-0000-0000-0000-000000000001',
     'templates.project_status_report.name',
     'project-status-report',
     'templates.project_status_report.description',
     'productivity', 'bar-chart-2',
     19900, 4900, 2,
     ARRAY['agencias', 'inmobiliaria', 'legal'],
     ARRAY['Notion', 'Google Workspace', 'Slack'],
     'templates.project_status_report.impact',
     20, 'templates.project_status_report.metric_label',
     ARRAY['Multi-project aggregation', 'RAG status detection', 'Stakeholder email delivery', 'Risk highlighting'],
     ARRAY['a0to-generate weekly status reports', 'Keep stakeholders informed', 'Escalate at-risk projects'],
     '{}'::jsonb, 'pro', true, true, 6),

    ('ee060700-0000-0000-0000-000000000001',
     'templates.daily_standup_bot.name',
     'daily-standup-bot',
     'templates.daily_standup_bot.description',
     'productivity', 'zap',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Slack', 'Notion', 'Google Workspace'],
     'templates.daily_standup_bot.impact',
     10, 'templates.daily_standup_bot.metric_label',
     ARRAY['Async standup collection', 'Blocker highlighting', 'Team summary digest', 'Manager visibility'],
     ARRAY['Run remote standups async', '50rface team blockers early', 'Reduce sync meeting time'],
     '{}'::jsonb, 'starter', true, false, 7),

    ('ee060800-0000-0000-0000-000000000001',
     'templates.resource_planner.name',
     'resource-planner',
     'templates.resource_planner.description',
     'productivity', 'users',
     29900, 7900, 3,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.resource_planner.impact',
     25, 'templates.resource_planner.metric_label',
     ARRAY['Capacity utilization tracking', 'Skill matching', 'Overallocation alerts', 'Bench time reporting'],
     ARRAY['Balance team workloads', 'Plan project staffing', 'Identify capacity gaps'],
     '{}'::jsonb, 'business', true, false, 8),

-- ==================== REPORTS (cat 07, 8 templates) ====================

    ('ee070100-0000-0000-0000-000000000001',
     'templates.executive_dashboard.name',
     'executive-dashboard',
     'templates.executive_dashboard.description',
     'reports', 'layout',
     49900, 14900, 5,
     ARRAY['agencias', 'retail', 'legal'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.executive_dashboard.impact',
     40, 'templates.executive_dashboard.metric_label',
     ARRAY['Cross-system KPI aggregation', 'Real-time refresh', 'Drill-down capability', 'Mobile-friendly layout'],
     ARRAY['Give executives a single source of truth', 'Track company OKRs', 'Replace manual board packs'],
     '{}'::jsonb, 'business', true, true, 1),

    ('ee070200-0000-0000-0000-000000000001',
     'templates.kpi_tracker.name',
     'kpi-tracker',
     'templates.kpi_tracker.description',
     'reports', 'target',
     19900, 4900, 2,
     ARRAY['agencias', 'retail', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'HubSpot'],
     'templates.kpi_tracker.impact',
     20, 'templates.kpi_tracker.metric_label',
     ARRAY['Goal vs actual comparison', 'Threshold-based alerts', 'Trend visualization', 'Owner accountability tracking'],
     ARRAY['Monitor KPI performance weekly', 'Alert on targets missed', 'Keep teams accountable'],
     '{}'::jsonb, 'pro', true, true, 2),

    ('ee070300-0000-0000-0000-000000000001',
     'templates.financial_summary.name',
     'financial-summary',
     'templates.financial_summary.description',
     'reports', 'dollar-sign',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'inmobiliaria'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.financial_summary.impact',
     35, 'templates.financial_summary.metric_label',
     ARRAY['P&L, balance sheet, cash flow', 'Budget vs actual comparison', 'Trend analysis', 'a0tomated distribution'],
     ARRAY['Produce monthly financial reports', 'Share with board and investors', 'Track budget adherence'],
     '{}'::jsonb, 'business', true, false, 3),

    ('ee070400-0000-0000-0000-000000000001',
     'templates.client_performance.name',
     'client-performance',
     'templates.client_performance.description',
     'reports', 'user-check',
     19900, 4900, 2,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'HubSpot', 'Slack'],
     'templates.client_performance.impact',
     20, 'templates.client_performance.metric_label',
     ARRAY['Per-client KPI tracking', 'SLA compliance reporting', 'Health score calculation', 'a0tomated client delivery'],
     ARRAY['Send clients automated performance reports', 'Track deliverables by client', 'Prove ROI to clients'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('ee070500-0000-0000-0000-000000000001',
     'templates.team_productivity.name',
     'team-productivity',
     'templates.team_productivity.description',
     'reports', 'users',
     19900, 4900, 2,
     ARRAY['agencias', 'retail'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.team_productivity.impact',
     20, 'templates.team_productivity.metric_label',
     ARRAY['Output vs capacity metrics', 'Individual contribution tracking', 'Bottleneck identification', 'Weekly delivery'],
     ARRAY['Monitor team output weekly', 'Identify underperforming areas', 'Reward top contributors'],
     '{}'::jsonb, 'pro', true, false, 5),

    ('ee070600-0000-0000-0000-000000000001',
     'templates.marketing_roi.name',
     'marketing-roi',
     'templates.marketing_roi.description',
     'reports', 'trending-up',
     29900, 7900, 3,
     ARRAY['retail', 'agencias'],
     ARRAY['Google Workspace', 'HubSpot', 'Mailchimp'],
     'templates.marketing_roi.impact',
     30, 'templates.marketing_roi.metric_label',
     ARRAY['Multi-channel attribution', 'Cost per lead/acquisition', 'Campaign ROI calculation', 'Budget optimization suggestions'],
     ARRAY['Prove marketing ROI to leadership', 'Optimize channel spending', 'Track campaign performance holistically'],
     '{}'::jsonb, 'business', true, false, 6),

    ('ee070700-0000-0000-0000-000000000001',
     'templates.operations_scorecard.name',
     'operations-scorecard',
     'templates.operations_scorecard.description',
     'reports', 'clipboard',
     29900, 7900, 3,
     ARRAY['retail', 'restaurantes', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.operations_scorecard.impact',
     30, 'templates.operations_scorecard.metric_label',
     ARRAY['Process efficiency metrics', 'Quality and error rate tracking', 'Cost per unit analysis', 'Trend dashboards'],
     ARRAY['Score operational performance', 'Identify process bottlenecks', 'Track improvement over time'],
     '{}'::jsonb, 'business', true, false, 7),

    ('ee070800-0000-0000-0000-000000000001',
     'templates.custom_analytics.name',
     'custom-analytics',
     'templates.custom_analytics.description',
     'reports', 'pie-chart',
     49900, 14900, 5,
     ARRAY['agencias', 'retail', 'legal'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.custom_analytics.impact',
     45, 'templates.custom_analytics.metric_label',
     ARRAY['Custom metric definition', 'Multi-source data blending', 'Scheduled report delivery', 'Self-serve query interface'],
     ARRAY['Build bespoke analytics for your business', 'Answer custom business questions', 'Replace manual spreadsheet analysis'],
     '{}'::jsonb, 'business', true, false, 8),

-- ==================== AI AGENTS (cat 08, 9 templates) ====================

    ('ee080100-0000-0000-0000-000000000001',
     'templates.multichannel_support_agent.name',
     'multichannel-support-agent',
     'templates.multichannel_support_agent.description',
     'ai_agents', 'brain',
     49900, 14900, 5,
     ARRAY['retail', 'salud', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.multichannel_support_agent.impact',
     5, 'templates.multichannel_support_agent.metric_label',
     ARRAY['Email, chat, SMS unification', 'AI intent classification', 'a0to-resolution for common issues', 'Seamless human handoff'],
     ARRAY['Handle support across all channels', 'Reduce agent handling time', 'Provide consistent service experience'],
     '{}'::jsonb, 'business', true, true, 1),

    ('ee080200-0000-0000-0000-000000000001',
     'templates.research_assistant.name',
     'research-assistant',
     'templates.research_assistant.description',
     'ai_agents', 'search',
     29900, 9900, 3,
     ARRAY['legal', 'agencias', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.research_assistant.impact',
     20, 'templates.research_assistant.metric_label',
     ARRAY['Web and database search', 'Source summarization', 'Fact verification', 'Structured report output'],
     ARRAY['Research competitors or markets', 'Prepare briefing documents', 'Gather due diligence data'],
     '{}'::jsonb, 'business', true, false, 2),

    ('ee080300-0000-0000-0000-000000000001',
     'templates.data_analyst_agent.name',
     'data-analyst-agent',
     'templates.data_analyst_agent.description',
     'ai_agents', 'bar-chart-2',
     49900, 14900, 5,
     ARRAY['retail', 'agencias', 'salud'],
     ARRAY['Google Workspace', 'QuickBooks', 'Notion'],
     'templates.data_analyst_agent.impact',
     40, 'templates.data_analyst_agent.metric_label',
     ARRAY['Natural language data queries', 'a0tomated visualization', 'Anomaly detection', 'Insight narration'],
     ARRAY['Ask questions of your business data', 'Detect unusual patterns', 'Generate analytical reports on demand'],
     '{}'::jsonb, 'business', true, true, 3),

    ('ee080400-0000-0000-0000-000000000001',
     'templates.content_strategist_agent.name',
     'content-strategist-agent',
     'templates.content_strategist_agent.description',
     'ai_agents', 'edit-3',
     29900, 9900, 3,
     ARRAY['agencias', 'retail'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.content_strategist_agent.impact',
     25, 'templates.content_strategist_agent.metric_label',
     ARRAY['Content gap analysis', 'Topic ideation', 'Editorial calendar management', 'Multi-format content production'],
     ARRAY['Plan and produce a full content calendar', 'Identify high-opportunity topics', 'Maintain consistent publishing'],
     '{}'::jsonb, 'business', true, false, 4),

    ('ee080500-0000-0000-0000-000000000001',
     'templates.sales_copilot.name',
     'sales-copilot',
     'templates.sales_copilot.description',
     'ai_agents', 'zap',
     49900, 14900, 5,
     ARRAY['retail', 'agencias', 'inmobiliaria'],
     ARRAY['HubSpot', 'Salesforce', 'Google Workspace'],
     'templates.sales_copilot.impact',
     15, 'templates.sales_copilot.metric_label',
     ARRAY['Deal coaching suggestions', 'Next best action recommendations', 'Objection handling prompts', 'Pipeline risk scoring'],
     ARRAY['Guide reps through complex deals', 'Improve win rate with AI coaching', 'Identify at-risk opportunities early'],
     '{}'::jsonb, 'business', true, true, 5),

    ('ee080600-0000-0000-0000-000000000001',
     'templates.hr_onboarding_agent.name',
     'hr-onboarding-agent',
     'templates.hr_onboarding_agent.description',
     'ai_agents', 'user-plus',
     29900, 9900, 3,
     ARRAY['retail', 'salud', 'agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.hr_onboarding_agent.impact',
     20, 'templates.hr_onboarding_agent.metric_label',
     ARRAY['Onboarding checklist automation', 'Welcome email sequences', 'Document collection workflows', 'Day-1 readiness tracking'],
     ARRAY['Onboard new hires automatically', 'Ensure all setup steps are completed', 'Reduce HR admin time'],
     '{}'::jsonb, 'business', true, false, 6),

    ('ee080700-0000-0000-0000-000000000001',
     'templates.code_review_agent.name',
     'code-review-agent',
     'templates.code_review_agent.description',
     'ai_agents', 'code',
     29900, 9900, 3,
     ARRAY['agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.code_review_agent.impact',
     30, 'templates.code_review_agent.metric_label',
     ARRAY['a0tomated PR analysis', 'Security vulnerability scanning', 'Code quality scoring', 'Inline review comments'],
     ARRAY['Speed up code review cycles', 'Catch security issues early', 'Enforce coding standards'],
     '{}'::jsonb, 'business', true, false, 7),

    ('ee080800-0000-0000-0000-000000000001',
     'templates.compliance_agent.name',
     'compliance-agent',
     'templates.compliance_agent.description',
     'ai_agents', 'shield-check',
     49900, 14900, 5,
     ARRAY['legal', 'salud', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.compliance_agent.impact',
     35, 'templates.compliance_agent.metric_label',
     ARRAY['Regulation monitoring', 'Policy gap detection', 'a0dit preparation workflows', 'Remediation tracking'],
     ARRAY['Monitor regulatory changes', 'Ensure policy documents are current', 'Prepare for audits automatically'],
     '{}'::jsonb, 'business', true, false, 8),

    ('ee080900-0000-0000-0000-000000000001',
     'templates.competitive_intel_agent.name',
     'competitive-intel-agent',
     'templates.competitive_intel_agent.description',
     'ai_agents', 'eye',
     29900, 9900, 3,
     ARRAY['retail', 'agencias', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.competitive_intel_agent.impact',
     25, 'templates.competitive_intel_agent.metric_label',
     ARRAY['Competitor web and news monitoring', 'Pricing change detection', 'Product launch alerts', 'Weekly intel digest'],
     ARRAY['Track competitor moves automatically', 'Alert team on pricing changes', 'Build competitive battlecards'],
     '{}'::jsonb, 'business', true, true, 9);

-- =============================================================================
-- 7. automations (9 automations: 6 Acme + 3 GlobalTech — diverse statuses)
-- =============================================================================
-- Acme Corp automations use UUID prefix: au111111-0000-0000-0000-00000000000N
-- GlobalTech automations use UUID prefix: au222222-0000-0000-0000-00000000000N

INSERT INTO public.automations (
    id, organization_id, template_id, name, description, status, config, last_run_at, error_message
)
VALUES
    -- ---- Acme Corp (6 automations) ----
    ('a0111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee030100-0000-0000-0000-000000000001',
     'Acme Customer Support Chatbot',
     'Handles incoming customer inquiries on our website 24/7',
     'active',
     '{"webhook_url": "https://acmecorp.com/chatbot", "escalation_email": "support@acmecorp.com", "hours": "24/7"}'::jsonb,
     NOW() - INTERVAL '2 hours',
     NULL),

    ('a0111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee020100-0000-0000-0000-000000000001',
     'Acme Content Pipeline',
     'Weekly blog post and social media content generation for the marketing team',
     'active',
     '{"frequency": "weekly", "topics": ["marketing", "automation", "AI"], "output_formats": ["blog", "social", "email"]}'::jsonb,
     NOW() - INTERVAL '1 day',
     NULL),

    ('a0111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee010100-0000-0000-0000-000000000001',
     'Acme Lead Nurture Sequence',
     'a0tomated follow-up email sequence for prospects who fill out the website lead form',
     'paused',
     '{"sequence_length": 5, "delay_days": 3, "from_email": "hello@acmecorp.com"}'::jsonb,
     NOW() - INTERVAL '20 days',
     NULL),

    ('a0111111-0000-0000-0000-000000000004',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee070100-0000-0000-0000-000000000001',
     'Acme Weekly Executive Report',
     'a0to-generated weekly executive summary of marketing KPIs delivered every Monday',
     'active',
     '{"schedule": "0 8 * * 1", "recipients": ["alice@acmecorp.com"], "format": "pdf"}'::jsonb,
     NOW() - INTERVAL '3 days',
     NULL),

    ('a0111111-0000-0000-0000-000000000005',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee040100-0000-0000-0000-000000000001',
     'Acme Invoice Processing',
     'OCR-powered invoice extraction from the accounts@acmecorp.com inbox to QuickBooks',
     'in_setup',
     '{"email_inbox": "accounts@acmecorp.com", "erp": "quickbooks"}'::jsonb,
     NULL,
     NULL),

    ('a0111111-0000-0000-0000-000000000006',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee020200-0000-0000-0000-000000000001',
     'Acme Social Media Scheduler',
     'Schedules and posts approved content to LinkedIn, Instagram, and Facebook on optimal timing',
     'active',
     '{"platforms": ["linkedin", "instagram", "facebook"], "post_frequency": "daily", "approval_required": true}'::jsonb,
     NOW() - INTERVAL '6 hours',
     NULL),

    -- ---- GlobalTech (3 automations) ----
    ('a0222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'ee040100-0000-0000-0000-000000000001',
     'GlobalTech Invoice Processor',
     'Processes vendor invoices from email attachments and posts to accounting',
     'active',
     '{"email_inbox": "invoices@globaltech.io", "erp_endpoint": "https://erp.globaltech.io/api"}'::jsonb,
     NOW() - INTERVAL '30 minutes',
     NULL),

    ('a0222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'ee050100-0000-0000-0000-000000000001',
     'GlobalTech Data Sync',
     'Nightly reconciliation between CRM and billing system',
     'failed',
     '{"crm_url": "https://crm.globaltech.io", "billing_url": "https://billing.globaltech.io"}'::jsonb,
     NOW() - INTERVAL '8 hours',
     'Connection timeout to billing API after 3 retries. Last attempt: rate limit exceeded.'),

    ('a0222222-0000-0000-0000-000000000003',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'ee040200-0000-0000-0000-000000000001',
     'GlobalTech Monthly Reporting',
     'a0to-generate monthly performance reports for executive team',
     'pending_review',
     '{"recipients": ["ceo@globaltech.io", "cfo@globaltech.io"], "format": "pdf"}'::jsonb,
     NULL,
     NULL);

-- =============================================================================
-- 8. automation_executions (~500 rows with 60-day growth curve — Plan 03)
-- =============================================================================
-- Growth curve: testing (days 1-14) → ramp-up (15-28) → growing (29-42) → full production (43-60)
-- 95% success / 5% error rate across all automations
-- Automation breakdown:
--   au111111-...-001 = Chatbot (heaviest: schedule + webhook)
--   au111111-...-002 = Content Pipeline (weekly, active)
--   au111111-...-003 = Lead Nurture (paused at day 40 — partial history only)
--   au111111-...-004 = Weekly Executive Report (runs every Monday)
--   au111111-...-006 = Social Media Scheduler (daily)
--   au111111-...-005 = Invoice Processing (in_setup — NO executions)

-- ---- CHATBOT (au111111-001) — heaviest usage automation ----

-- Weeks 1-2: ~2 runs/day (every 12h)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '60 days' + (n * INTERVAL '12 hours') + ((random() * 3600)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '60 days' + (n * INTERVAL '12 hours') + ((random() * 3600)::int * INTERVAL '1 second') + ((random() * 8000 + 2000)::int * INTERVAL '1 millisecond'),
    (random() * 8000 + 2000)::INTEGER,
    ('{"messages_received": ' || (random()*15+3)::INTEGER || ', "source": "website"}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"messages_handled": ' || (random()*12+2)::INTEGER || ', "escalated": ' || (random()*2)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Webhook timeout after 30s','API rate limit exceeded','Connection refused by downstream service','a0thentication token expired'])[floor(random()*4+1)::int] ELSE NULL END,
    CASE WHEN random() < 0.3 THEN 'webhook' ELSE 'schedule' END
FROM generate_series(1, 28) AS n;

-- Weeks 3-4: ~4 runs/day (every 6h)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '46 days' + (n * INTERVAL '6 hours') + ((random() * 1800)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '46 days' + (n * INTERVAL '6 hours') + ((random() * 1800)::int * INTERVAL '1 second') + ((random() * 8000 + 2000)::int * INTERVAL '1 millisecond'),
    (random() * 8000 + 2000)::INTEGER,
    ('{"messages_received": ' || (random()*20+5)::INTEGER || ', "source": "website"}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"messages_handled": ' || (random()*18+4)::INTEGER || ', "escalated": ' || (random()*3)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Webhook timeout after 30s','API rate limit exceeded','Connection refused by downstream service','a0thentication token expired'])[floor(random()*4+1)::int] ELSE NULL END,
    CASE WHEN random() < 0.3 THEN 'webhook' ELSE 'schedule' END
FROM generate_series(1, 56) AS n;

-- Weeks 5-8: ~5 runs/day (every 4-5h)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '32 days' + (n * INTERVAL '5 hours') + ((random() * 1800)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '32 days' + (n * INTERVAL '5 hours') + ((random() * 1800)::int * INTERVAL '1 second') + ((random() * 8000 + 2000)::int * INTERVAL '1 millisecond'),
    (random() * 8000 + 2000)::INTEGER,
    ('{"messages_received": ' || (random()*25+8)::INTEGER || ', "source": "website"}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"messages_handled": ' || (random()*22+6)::INTEGER || ', "escalated": ' || (random()*3)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Webhook timeout after 30s','API rate limit exceeded','Connection refused by downstream service','a0thentication token expired'])[floor(random()*4+1)::int] ELSE NULL END,
    CASE WHEN random() < 0.3 THEN 'webhook' ELSE 'schedule' END
FROM generate_series(1, 154) AS n;

-- ---- CONTENT PIPELINE (au111111-002) — weekly cadence, active since day 7 ----

-- Weeks 1-4: 1 run/week
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000002',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '53 days' + (n * INTERVAL '7 days') + ((random() * 3600)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '53 days' + (n * INTERVAL '7 days') + ((random() * 3600)::int * INTERVAL '1 second') + ((random() * 12000 + 5000)::int * INTERVAL '1 millisecond'),
    (random() * 12000 + 5000)::INTEGER,
    ('{"topics_queued": ' || (random()*5+2)::INTEGER || ', "formats": ["blog","social","email"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"articles_generated": ' || (random()*4+1)::INTEGER || ', "posts_created": ' || (random()*8+4)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['OpenAI API timeout','Content generation rate limit hit','Template render error'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 8) AS n;

-- Weeks 5-8: 2 runs/week (higher frequency after ramp-up)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000002',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '30 days' + (n * INTERVAL '3 days' + ((random() * 7200)::int * INTERVAL '1 second')),
    NOW() - INTERVAL '30 days' + (n * INTERVAL '3 days' + ((random() * 7200)::int * INTERVAL '1 second')) + ((random() * 12000 + 5000)::int * INTERVAL '1 millisecond'),
    (random() * 12000 + 5000)::INTEGER,
    ('{"topics_queued": ' || (random()*6+3)::INTEGER || ', "formats": ["blog","social","email"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"articles_generated": ' || (random()*5+2)::INTEGER || ', "posts_created": ' || (random()*10+5)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['OpenAI API timeout','Content generation rate limit hit','Template render error'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 10) AS n;

-- ---- LEAD NURTURE SEQUENCE (au111111-003) — paused 20 days ago, history only for days 1-40 ----

-- Active phase: days 1-40 (now paused — shows why it has history)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000003',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '40 days' + (n * INTERVAL '3 days') + ((random() * 7200)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '40 days' + (n * INTERVAL '3 days') + ((random() * 7200)::int * INTERVAL '1 second') + ((random() * 6000 + 2000)::int * INTERVAL '1 millisecond'),
    (random() * 6000 + 2000)::INTEGER,
    ('{"leads_queued": ' || (random()*10+3)::INTEGER || ', "sequence_step": ' || (n % 5 + 1) || '}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"emails_sent": ' || (random()*8+2)::INTEGER || ', "opens": ' || (random()*5+1)::INTEGER || ', "replies": ' || (random()*2)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Email delivery failure — domain blocked','Mailchimp API authentication expired','Recipient list validation error'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 13) AS n;

-- ---- WEEKLY EXECUTIVE REPORT (au111111-004) — Mondays only, active since day 5 ----

-- Every week for ~8 weeks
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000004',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '55 days' + (n * INTERVAL '7 days') + INTERVAL '8 hours' + ((random() * 600)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '55 days' + (n * INTERVAL '7 days') + INTERVAL '8 hours' + ((random() * 600)::int * INTERVAL '1 second') + ((random() * 10000 + 5000)::int * INTERVAL '1 millisecond'),
    (random() * 10000 + 5000)::INTEGER,
    ('{"metrics_collected": ' || (random()*8+4)::INTEGER || ', "data_sources": ["hubspot","google_analytics","slack"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"pages": ' || (random()*5+3)::INTEGER || ', "kpis_tracked": ' || (random()*10+5)::INTEGER || ', "report_url": "https://reports.acmecorp.com/week-' || n || '"}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Google Analytics API quota exceeded','HubSpot rate limit hit','PDF generation timeout'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 8) AS n;

-- ---- SOCIAL MEDIA SCHEDULER (au111111-006) — daily, started at day 10 ----

-- Weeks 2-4: 1 run/day
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000006',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '50 days' + (n * INTERVAL '1 day') + INTERVAL '9 hours' + ((random() * 3600)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '50 days' + (n * INTERVAL '1 day') + INTERVAL '9 hours' + ((random() * 3600)::int * INTERVAL '1 second') + ((random() * 5000 + 1500)::int * INTERVAL '1 millisecond'),
    (random() * 5000 + 1500)::INTEGER,
    ('{"posts_queued": ' || (random()*4+1)::INTEGER || ', "platforms": ["linkedin","instagram","facebook"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"posts_published": ' || (random()*4+1)::INTEGER || ', "scheduled": ' || (random()*3)::INTEGER || ', "engagement_tracked": true}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['LinkedIn API rate limit','Instagram token expired','Facebook post rejected — policy violation'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 21) AS n;

-- Weeks 5-8: 2 runs/day (morning + afternoon)
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000006',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '29 days' + (n * INTERVAL '12 hours') + ((random() * 1800)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '29 days' + (n * INTERVAL '12 hours') + ((random() * 1800)::int * INTERVAL '1 second') + ((random() * 5000 + 1500)::int * INTERVAL '1 millisecond'),
    (random() * 5000 + 1500)::INTEGER,
    ('{"posts_queued": ' || (random()*5+2)::INTEGER || ', "platforms": ["linkedin","instagram","facebook"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"posts_published": ' || (random()*5+2)::INTEGER || ', "scheduled": ' || (random()*4)::INTEGER || ', "engagement_tracked": true}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['LinkedIn API rate limit','Instagram token expired','Facebook post rejected — policy violation'])[floor(random()*3+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 58) AS n;

-- ---- CHATBOT EXTRA: webhook-triggered runs (boost total toward ~500) ----
-- Additional webhook runs weeks 3-8: ad-hoc customer interactions
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '46 days' + (n * INTERVAL '18 hours') + ((random() * 7200)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '46 days' + (n * INTERVAL '18 hours') + ((random() * 7200)::int * INTERVAL '1 second') + ((random() * 6000 + 1500)::int * INTERVAL '1 millisecond'),
    (random() * 6000 + 1500)::INTEGER,
    ('{"messages_received": ' || (random()*8+2)::INTEGER || ', "source": "widget"}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"messages_handled": ' || (random()*7+1)::INTEGER || ', "escalated": ' || (random()*1)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Widget integration timeout','API rate limit exceeded'])[floor(random()*2+1)::int] ELSE NULL END,
    'webhook'
FROM generate_series(1, 62) AS n;

-- ---- CONTENT PIPELINE EXTRA: manual on-demand runs ----
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000002',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '55 days' + (n * INTERVAL '5 days') + ((random() * 14400)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '55 days' + (n * INTERVAL '5 days') + ((random() * 14400)::int * INTERVAL '1 second') + ((random() * 10000 + 4000)::int * INTERVAL '1 millisecond'),
    (random() * 10000 + 4000)::INTEGER,
    ('{"topics_queued": ' || (random()*4+2)::INTEGER || ', "formats": ["blog","social"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"articles_generated": ' || (random()*3+1)::INTEGER || ', "posts_created": ' || (random()*6+2)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['OpenAI API timeout','Template render error'])[floor(random()*2+1)::int] ELSE NULL END,
    'manual'
FROM generate_series(1, 11) AS n;

-- ---- WEEKLY REPORT EXTRA: manual report runs requested by Alice ----
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000004',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '50 days' + (n * INTERVAL '10 days') + ((random() * 3600)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '50 days' + (n * INTERVAL '10 days') + ((random() * 3600)::int * INTERVAL '1 second') + ((random() * 8000 + 3000)::int * INTERVAL '1 millisecond'),
    (random() * 8000 + 3000)::INTEGER,
    ('{"metrics_collected": ' || (random()*6+3)::INTEGER || ', "data_sources": ["hubspot","google_analytics"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"pages": ' || (random()*4+2)::INTEGER || ', "kpis_tracked": ' || (random()*8+4)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN 'Google Analytics API quota exceeded' ELSE NULL END,
    'manual'
FROM generate_series(1, 5) AS n;

-- ---- SOCIAL SCHEDULER EXTRA: full-production daily double-post (weeks 7-8) ----
-- Represents peak usage: 3x/day posting in final production weeks
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000006',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '14 days' + (n * INTERVAL '8 hours') + ((random() * 900)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '14 days' + (n * INTERVAL '8 hours') + ((random() * 900)::int * INTERVAL '1 second') + ((random() * 4000 + 1000)::int * INTERVAL '1 millisecond'),
    (random() * 4000 + 1000)::INTEGER,
    ('{"posts_queued": ' || (random()*6+3)::INTEGER || ', "platforms": ["linkedin","instagram","facebook","twitter"]}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"posts_published": ' || (random()*6+2)::INTEGER || ', "scheduled": ' || (random()*4)::INTEGER || ', "engagement_tracked": true}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['LinkedIn API rate limit','Instagram token expired'])[floor(random()*2+1)::int] ELSE NULL END,
    'schedule'
FROM generate_series(1, 42) AS n;

-- ---- CHATBOT: recent high-frequency period (last 14 days — peak usage) ----
INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
SELECT
    gen_random_uuid(),
    'a0111111-0000-0000-0000-000000000001',
    CASE WHEN random() < 0.95 THEN 'success' ELSE 'error' END,
    NOW() - INTERVAL '14 days' + (n * INTERVAL '3 hours') + ((random() * 900)::int * INTERVAL '1 second'),
    NOW() - INTERVAL '14 days' + (n * INTERVAL '3 hours') + ((random() * 900)::int * INTERVAL '1 second') + ((random() * 7000 + 2000)::int * INTERVAL '1 millisecond'),
    (random() * 7000 + 2000)::INTEGER,
    ('{"messages_received": ' || (random()*28+10)::INTEGER || ', "source": "website"}')::jsonb,
    CASE WHEN random() < 0.95 THEN ('{"messages_handled": ' || (random()*25+8)::INTEGER || ', "escalated": ' || (random()*3)::INTEGER || '}')::jsonb ELSE NULL END,
    CASE WHEN random() >= 0.95 THEN (ARRAY['Webhook timeout after 30s','API rate limit exceeded','a0thentication token expired'])[floor(random()*3+1)::int] ELSE NULL END,
    CASE WHEN random() < 0.4 THEN 'webhook' ELSE 'schedule' END
FROM generate_series(1, 24) AS n;

-- =============================================================================
-- 9. automation_requests (7 requests: 6 Acme + 1 GlobalTech — all statuses)
-- =============================================================================
-- Acme request UUIDs: rq111111-0000-0000-0000-00000000000N
-- Status coverage: pending, in_review, approved, completed, rejected, payment_pending
-- New columns from 07-01 migration: stripe_checkout_session_id, checkout_expires_at

INSERT INTO public.automation_requests (
    id, organization_id, template_id, user_id,
    title, description, urgency, status, notes,
    completed_at, created_at
)
VALUES
    -- pending: new request waiting for AIDEAS review
    ('e9111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee020300-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'Lead Scoring for Website Visitors',
     'We want to automatically score leads that fill out our contact form based on company size, industry, and behavior on the site. Currently doing this manually and it takes 2 hours per week.',
     'normal',
     'pending',
     NULL, NULL,
     NOW() - INTERVAL '2 days'),

    -- in_review: AIDEAS team is actively reviewing it
    ('e9111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee070100-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'Executive KPI Dashboard for Client Reporting',
     'We need a real-time dashboard that pulls KPIs from HubSpot, Google Analytics, and our project management tool. Right now we spend 4 hours each Friday compiling this for client presentations.',
     'urgent',
     'in_review',
     'Gathering technical requirements — checking HubSpot API access and GA4 data export permissions.', NULL,
     NOW() - INTERVAL '5 days'),

    -- approved: AIDEAS approved, waiting for client to start setup
    ('e9111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee020400-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'Monthly Email Campaign Automation',
     'a0tomate our monthly newsletter: pull from our blog RSS, segment our list by client industry, and send personalized versions. We have ~3,500 subscribers across 4 segments.',
     'normal',
     'approved',
     'Approved! Setup will begin once you provide Mailchimp API key and confirm audience segment names.', NULL,
     NOW() - INTERVAL '10 days'),

    -- completed: delivered and running
    ('e9111111-0000-0000-0000-000000000004',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee030200-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'Email Auto-Responder for Support Inbox',
     'Set up auto-responses for our support@acmecorp.com inbox with acknowledgment messages and estimated response times based on ticket type.',
     'low',
     'completed',
     'Implemented and live. Auto-responder handling ~40 emails/day. Response time estimates configured per category.',
     NOW() - INTERVAL '25 days',
     NOW() - INTERVAL '35 days'),

    -- rejected: declined with explanation
    ('e9111111-0000-0000-0000-000000000005',
     'aaaaaaaa-0000-0000-0000-000000000001',
     NULL,
     'a1111111-1111-1111-1111-111111111111',
     'AI Voice Bot for Phone Support',
     'We want an AI voice bot to handle inbound phone calls, qualify leads, and route to the right team member. Target: handle 70% of calls without human intervention.',
     'normal',
     'rejected',
     'This requires telephony infrastructure (Twilio) that is currently outside our automation scope. We recommend a third-party solution. Consider our AI Chatbot (web) as an alternative for digital channels.', NULL,
     NOW() - INTERVAL '18 days'),

    -- payment_pending: Stripe checkout started but not completed
    ('e9111111-0000-0000-0000-000000000006',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'ee080100-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'AI Sales Agent for Demo Scheduling',
     'We want an AI agent that qualifies inbound leads from our website, answers common questions, and books demo calls directly into our calendar — fully automated, 24/7.',
     'urgent',
     'payment_pending',
     'Setup quote sent. Checkout link opened but payment not yet completed. Follow up with client.', NULL,
     NOW() - INTERVAL '1 day'),

    -- GlobalTech: urgent request in review
    ('e9222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     NULL,
     'b1111111-1111-1111-1111-111111111111',
     'Emergency Alert System for API Downtime',
     'Our main product API goes down occasionally and we only find out when customers complain. We need real-time monitoring with alerts to Slack and PagerDuty when downtime is detected. This is costing us SLA credits.',
     'urgent',
     'in_review',
     'Customer flagged this as blocking a contract renewal.', NULL,
     NOW() - INTERVAL '7 hours');

-- =============================================================================
-- 10. subscriptions (1 per org)
-- =============================================================================

INSERT INTO public.subscriptions (
    id, organization_id, plan, status, billing_cycle,
    current_period_start, current_period_end
)
VALUES
    ('50111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'pro', 'active', 'monthly',
     NOW() - INTERVAL '15 days',
     NOW() + INTERVAL '15 days'),

    ('50222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'starter', 'active', 'monthly',
     NOW() - INTERVAL '8 days',
     NOW() + INTERVAL '22 days');

-- =============================================================================
-- 11. chat_messages (5 messages: client-AIDEAS conversations in both orgs)
-- =============================================================================

INSERT INTO public.chat_messages (id, organization_id, sender_id, sender_type, content, created_at)
VALUES
    ('ca111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'client',
     'Hi! Our chatbot stopped responding this morning around 9 AM. Is everything okay on your end?',
     NOW() - INTERVAL '3 hours'),

    ('ca111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     NULL,
     'aideas',
     'Hello Alice! We''ve identified a brief connectivity issue that was resolved at 9:15 AM. Your chatbot is fully operational now and we''re monitoring it closely. We''ll send a full incident report by end of day.',
     NOW() - INTERVAL '2 hours 45 minutes'),

    ('ca111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'client',
     'Thanks for the quick response! Looking forward to the report. Can you also check if the escalation emails are working properly?',
     NOW() - INTERVAL '2 hours 30 minutes'),

    ('ca222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'client',
     'The data sync failed again last night. We''re getting pressure from the finance team — this is the third time this month. What''s the root cause?',
     NOW() - INTERVAL '7 hours'),

    ('ca222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     NULL,
     'aideas',
     'Hi Carol, we''ve investigated and the root cause is rate limiting on your billing API — it''s rejecting bulk sync requests after midnight. We''re implementing exponential backoff and splitting the sync into smaller batches. Fix will be deployed tonight. We''ll monitor the next run personally.',
     NOW() - INTERVAL '6 hours 30 minutes');

-- =============================================================================
-- 12. notifications (13 notifications: 10 Acme + 3 GlobalTech — all 4 types)
-- =============================================================================
-- Acme notification UUIDs: nt111111-0000-0000-0000-00000000000N
-- GlobalTech notification UUIDs: nt222222-0000-0000-0000-00000000000N
-- Type coverage: success, info, warning, action_required
-- Mix: 4 unread (is_read=false), 6 read (is_read=true with read_at)
-- Spread created_at over last 30 days for realistic timeline
-- All Acme notifications for Alice (primary demo user)

INSERT INTO public.notifications (
    id, organization_id, user_id, type, title, message, is_read, read_at, link, created_at
)
VALUES
    -- ---- Acme Corp — Alice (10 notifications) ----

    -- success: automation went live (unread)
    ('ba111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'success',
     'Customer Support Chatbot Is Live',
     'Your AI Customer Support Chatbot has been activated and is handling inquiries. It handled 47 conversations in its first 24 hours.',
     false, NULL,
     '/dashboard/automations',
     NOW() - INTERVAL '58 days'),

    -- info: system update (read)
    ('ba111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'info',
     'New Feature: ROI Dashboard Available',
     'We''ve launched the ROI Dashboard — see the estimated time and cost savings from all your active automations in one place.',
     true, NOW() - INTERVAL '51 days',
     '/dashboard/roi',
     NOW() - INTERVAL '52 days'),

    -- success: request completed (read)
    ('ba111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'success',
     '50pport Auto-Responder Delivered',
     'Your Email Auto-Responder for Support request has been completed and is live on support@acmecorp.com.',
     true, NOW() - INTERVAL '24 days',
     '/dashboard/requests',
     NOW() - INTERVAL '25 days'),

    -- info: Bob joined (read)
    ('ba111111-0000-0000-0000-000000000004',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'info',
     'Bob Martinez Joined Your Team',
     'Bob Martinez has accepted your invitation and joined Acme Corp as an Operator. They can now view and manage automations.',
     true, NOW() - INTERVAL '43 days',
     '/dashboard/team',
     NOW() - INTERVAL '44 days'),

    -- warning: automation error (read)
    ('ba111111-0000-0000-0000-000000000005',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'warning',
     'Chatbot Experienced an Error',
     'Your Customer Support Chatbot encountered a webhook timeout error. The issue was automatically resolved and the automation resumed normally.',
     true, NOW() - INTERVAL '20 days',
     '/dashboard/automations',
     NOW() - INTERVAL '21 days'),

    -- warning: Lead Nurture paused (unread)
    ('ba111111-0000-0000-0000-000000000006',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'warning',
     'Lead Nurture Sequence Paused',
     'Your Lead Nurture Sequence automation has been paused. Reason: email sending limit reached for this billing cycle. Resume when ready.',
     false, NULL,
     '/dashboard/automations',
     NOW() - INTERVAL '20 days'),

    -- success: milestone reached (read)
    ('ba111111-0000-0000-0000-000000000007',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'success',
     '500 Automation Runs Milestone',
     'Acme Corp has reached 500 total automation executions! Your automations are saving an estimated 42 hours per month.',
     true, NOW() - INTERVAL '10 days',
     '/dashboard/roi',
     NOW() - INTERVAL '11 days'),

    -- info: monthly summary (read)
    ('ba111111-0000-0000-0000-000000000008',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'info',
     'March Monthly Summary Ready',
     'Your March automation report is ready: 4 active automations, 218 executions, 96.3% success rate, estimated $1,050 in time savings.',
     true, NOW() - INTERVAL '8 days',
     '/dashboard/roi',
     NOW() - INTERVAL '9 days'),

    -- action_required: review pending request (unread)
    ('ba111111-0000-0000-0000-000000000009',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'action_required',
     'Chatbot Incident Report Ready',
     'The incident report for this morning''s chatbot connectivity issue is ready for your review.',
     false, NULL,
     '/dashboard/chat',
     NOW() - INTERVAL '1 hour'),

    -- action_required: payment pending (unread — matches rq111111-006)
    ('ba111111-0000-0000-0000-000000000010',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'action_required',
     'Complete Payment for AI Sales Agent',
     'Your AI Sales Agent setup is approved and waiting for payment. Complete checkout to begin the 5-day setup process.',
     false, NULL,
     '/dashboard/requests',
     NOW() - INTERVAL '1 day'),

    -- ---- GlobalTech — Carol (3 notifications) ----

    -- warning: data sync failed (unread)
    ('ba222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'warning',
     'Data Sync Failed — Action Required',
     'The GlobalTech Data Sync automation failed during last night''s run. Our team is investigating. Check the chat for updates.',
     false, NULL,
     '/dashboard/automations',
     NOW() - INTERVAL '7 hours 30 minutes'),

    -- info: Dave joined (read)
    ('ba222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'info',
     'Dave Wilson Joined Your Organization',
     'Dave Wilson has accepted the invitation and joined GlobalTech as a viewer.',
     true, NOW() - INTERVAL '6 days',
     '/dashboard/team',
     NOW() - INTERVAL '7 days'),

    -- success: subscription upgraded (read)
    ('ba222222-0000-0000-0000-000000000003',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'success',
     '50bscription Upgraded to Pro',
     'GlobalTech has been upgraded to the Pro plan. New automation slots are now available.',
     true, NOW() - INTERVAL '14 days',
     '/dashboard/billing',
     NOW() - INTERVAL '15 days');

-- =============================================================================
-- 13. invitations (1 pending invitation for Acme Corp)
-- =============================================================================

INSERT INTO public.invitations (
    id, organization_id, email, role, token, invited_by, expires_at, accepted_at
)
VALUES
    ('1a111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'charlie@acmecorp.com',
     'operator',
     'a8f3b2e1d4c7960f5e2b8a3d1c4e7f0b9a6d3c2e5b8f1a4d7c0e3b6f9a2d5c8',
     'a1111111-1111-1111-1111-111111111111',
     NOW() + INTERVAL '7 days',
     NULL);

-- =============================================================================
-- 13. automation_template_translations (528 rows: 66 templates x 4 fields x 2 locales)
-- =============================================================================
-- Backfilled from web/messages/{en,es}.json — kept in sync with the same data
-- as the 18-01 migration so a fresh `db reset` produces 528 translation rows.
-- The migration alone cannot populate this table during `db reset` because
-- migrations run BEFORE seed.sql, when automation_templates is still empty.

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Lead Follow-up Email Sequence' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically nurture leads with personalized email sequences triggered by form submissions, ensuring no prospect falls through the cracks.' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces lead response time from hours to minutes, increasing conversions by up to 35%' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Emails sent' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Secuencia de Seguimiento a Prospectos' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Nutre a tus prospectos automáticamente con secuencias de correo personalizadas activadas por formularios, asegurando que ninguna oportunidad se pierda.' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de respuesta a prospectos de horas a minutos, aumentando las conversiones hasta un 35%' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Correos enviados' FROM public.automation_templates WHERE slug = 'lead-followup-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'CRM Data Sync' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Keep your CRM and other business systems in perfect sync with bi-directional data reconciliation and conflict resolution.' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Eliminates duplicate records and manual data entry, saving 5+ hours per week' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Records synced' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Sincronización de CRM' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Mantén tu CRM y otros sistemas de negocio perfectamente sincronizados con reconciliación de datos bidireccional y resolución de conflictos.' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Elimina registros duplicados y la captura manual de datos, ahorrando más de 5 horas por semana' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Registros sincronizados' FROM public.automation_templates WHERE slug = 'crm-data-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Automated Proposal Generator' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Generate professional, branded sales proposals in minutes by pulling client data from your CRM and filling pre-built templates.' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Cuts proposal creation time by 80%, enabling reps to send proposals within the same day' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Proposals generated' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Generador Automático de Propuestas' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera propuestas de venta profesionales y con tu marca en minutos, extrayendo datos del cliente de tu CRM y llenando plantillas prediseñadas.' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de creación de propuestas en un 80%, permitiendo enviarlas el mismo día' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Propuestas generadas' FROM public.automation_templates WHERE slug = 'proposal-generator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Instant Quote Builder' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically build accurate price quotes from product catalogs, applying volume discounts and sending reminders before quotes expire.' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces quoting time from hours to minutes and improves quote-to-close rates by 20%' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Quotes created' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Constructor de Cotizaciones' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera cotizaciones precisas automáticamente desde tu catálogo de productos, aplicando descuentos por volumen y enviando recordatorios antes de que venzan.' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de cotización de horas a minutos y mejora las tasas de cierre en un 20%' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Cotizaciones creadas' FROM public.automation_templates WHERE slug = 'quote-builder'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Sales Pipeline Alerts' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Get real-time Slack and email alerts when deals change stage, go stale, or require urgent attention from your team.' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Prevents hot deals from going cold, recovering an average of 15% of at-risk opportunities' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Alerts sent' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Alertas de Pipeline de Ventas' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Recibe alertas en tiempo real por Slack y correo cuando los negocios cambien de etapa, se enfríen o requieran atención urgente.' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Previene que los negocios calientes se enfríen, recuperando en promedio un 15% de las oportunidades en riesgo' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Alertas enviadas' FROM public.automation_templates WHERE slug = 'pipeline-alerts'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Territory Performance Report' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically generate weekly territory reports showing rep performance, quota attainment, and regional breakdown delivered to managers.' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Saves managers 3+ hours per week on manual reporting and improves coaching conversations' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports delivered' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte de Desempeño Territorial' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera automáticamente reportes semanales de territorio mostrando el desempeño de los vendedores, cumplimiento de cuotas y desglose regional.' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Ahorra a los gerentes más de 3 horas semanales en reportes manuales y mejora las sesiones de coaching' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes entregados' FROM public.automation_templates WHERE slug = 'territory-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Win/Loss Analysis' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically analyze closed deals to surface patterns in why you win or lose, with AI-generated insights on competitor performance and stage dropouts.' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves win rates by 10-15% by identifying and addressing the top reasons deals are lost' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Deals analyzed' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Análisis de Negocios Ganados y Perdidos' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Analiza automáticamente los negocios cerrados para identificar patrones de por qué ganas o pierdes, con insights generados por IA sobre competidores.' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora las tasas de cierre entre un 10% y 15% al identificar y abordar las principales razones de pérdida' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Negocios analizados' FROM public.automation_templates WHERE slug = 'win-loss-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'AI Sales Forecasting' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Use machine learning to predict revenue with high accuracy, model scenarios, and align your team around a single forecast number.' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves forecast accuracy by up to 40%, enabling better resource planning and fewer surprises' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Forecasts generated' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Pronóstico de Ventas con IA' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Usa aprendizaje automático para predecir ingresos con alta precisión, modelar escenarios y alinear a tu equipo alrededor de un único número de pronóstico.' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora la precisión del pronóstico hasta en un 40%, permitiendo mejor planeación de recursos y menos sorpresas' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Pronósticos generados' FROM public.automation_templates WHERE slug = 'sales-forecasting'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'AI Content Generation' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Generate on-brand blog posts, social media content, and email copy at scale using AI tuned to your brand voice and SEO keywords.' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases content output by 5x while maintaining brand consistency and reducing writing time' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Content pieces created' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Generación de Contenido con IA' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera artículos de blog, contenido para redes sociales y textos de email a escala, usando IA entrenada con la voz de tu marca y palabras clave SEO.' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta la producción de contenido 5 veces mientras mantiene la consistencia de marca y reduce el tiempo de redacción' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Piezas de contenido creadas' FROM public.automation_templates WHERE slug = 'content-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Social Media Scheduler' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Schedule and publish social media posts across platforms at optimal times, keeping your content calendar full without manual effort.' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Saves 4+ hours per week on scheduling and improves engagement with optimal posting times' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Posts scheduled' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Programador de Redes Sociales' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Programa y publica contenido en redes sociales en los momentos óptimos, manteniendo tu calendario lleno sin esfuerzo manual.' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Ahorra más de 4 horas semanales en programación y mejora el engagement con horarios de publicación óptimos' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Publicaciones programadas' FROM public.automation_templates WHERE slug = 'social-scheduler'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Automated Lead Scoring' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically score and prioritize leads based on behavioral signals and demographic data, syncing scores to your CRM in real time.' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases sales team efficiency by 30% by focusing effort on the highest-potential leads' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Leads scored' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Calificación Automática de Prospectos' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Califica y prioriza prospectos automáticamente según señales de comportamiento y datos demográficos, sincronizando puntajes a tu CRM en tiempo real.' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta la eficiencia del equipo de ventas en un 30% al enfocar el esfuerzo en los prospectos de mayor potencial' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Prospectos calificados' FROM public.automation_templates WHERE slug = 'lead-scoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Email Campaign Automation' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Build and automate segmented email drip campaigns with personalized messaging that guides prospects from awareness to purchase.' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases email open rates by 25% and conversion rates by up to 40% through personalization' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Emails sent' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Automatización de Campañas de Email' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Diseña y automatiza campañas de email segmentadas con mensajes personalizados que guían a los prospectos desde el conocimiento hasta la compra.' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta las tasas de apertura en un 25% y las tasas de conversión hasta un 40% mediante la personalización' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Correos enviados' FROM public.automation_templates WHERE slug = 'email-campaigns'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'SEO Rank Monitoring' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically track keyword rankings, monitor competitor positions, and receive alerts when significant ranking changes occur.' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Catches ranking drops 10x faster than manual checks, minimizing traffic loss from algorithm changes' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Keywords tracked' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Monitoreo de Posicionamiento SEO' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Rastrea automáticamente las posiciones de tus palabras clave, monitorea a la competencia y recibe alertas cuando ocurran cambios significativos en el ranking.' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Detecta caídas de posicionamiento 10 veces más rápido que la revisión manual, minimizando la pérdida de tráfico' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Palabras clave monitoreadas' FROM public.automation_templates WHERE slug = 'seo-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Ad Performance Monitor' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Aggregate ad performance data from all platforms, track ROAS and CPA, and receive alerts when campaigns underperform or budgets are at risk.' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces wasted ad spend by 20% through real-time anomaly detection and budget pacing alerts' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Campaigns monitored' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Monitor de Rendimiento Publicitario' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Consolida el rendimiento de anuncios de todas las plataformas, monitorea el ROAS y el CPA, y recibe alertas cuando las campañas no cumplan las metas.' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el gasto publicitario desperdiciado en un 20% mediante la detección de anomalías y alertas de presupuesto en tiempo real' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Campañas monitoreadas' FROM public.automation_templates WHERE slug = 'ad-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Audience Segmentation Engine' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically segment your customer base using RFM analysis and behavioral clustering, keeping CRM tags updated in real time.' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases campaign revenue by 25% through hyper-targeted messaging to the right audience segments' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Segments updated' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Motor de Segmentación de Audiencias' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Segmenta tu base de clientes automáticamente usando análisis RFM y agrupación por comportamiento, manteniendo las etiquetas del CRM actualizadas en tiempo real.' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta los ingresos de campañas en un 25% mediante mensajes altamente dirigidos a los segmentos correctos' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Segmentos actualizados' FROM public.automation_templates WHERE slug = 'audience-segmentation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Newsletter Automation' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically curate content from your blog and industry sources, personalize subject lines, and send weekly newsletters to engaged subscribers.' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Maintains consistent subscriber engagement while reducing newsletter production time by 70%' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Newsletters sent' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Automatización de Newsletter' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Curada automáticamente de contenido de tu blog y fuentes del sector, personaliza líneas de asunto y envía newsletters semanales a suscriptores activos.' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mantiene el engagement con suscriptores mientras reduce el tiempo de producción del newsletter en un 70%' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Newsletters enviados' FROM public.automation_templates WHERE slug = 'newsletter-automation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'AI Customer Support Chatbot' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Deploy an AI chatbot that handles customer inquiries 24/7, understands natural language, and seamlessly escalates to human agents when needed.' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Resolves 60% of support tickets without human intervention, reducing support costs by up to 40%' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Conversations handled' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Chatbot de Atención al Cliente con IA' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Despliega un chatbot con IA que atiende consultas de clientes 24/7, entiende lenguaje natural y escala a agentes humanos cuando es necesario.' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Resuelve el 60% de los tickets sin intervención humana, reduciendo los costos de soporte hasta un 40%' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Conversaciones atendidas' FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Auto-Response Email' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically respond to incoming support and inquiry emails with smart categorization and appropriate templated replies.' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces average first response time from hours to under 2 minutes for all inbound emails' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Emails responded' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Respuesta Automática de Correo' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Responde automáticamente los correos de soporte e consultas entrantes con categorización inteligente y respuestas basadas en plantillas.' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo promedio de primera respuesta de horas a menos de 2 minutos para todos los correos entrantes' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Correos respondidos' FROM public.automation_templates WHERE slug = 'auto-response-email'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Smart Ticket Routing' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Use AI to classify incoming support tickets by topic and urgency, then automatically route them to the right agent or team.' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces misassigned tickets by 85% and cuts average handle time by 30% through smart routing' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Tickets routed' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Enrutamiento Inteligente de Tickets' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Usa IA para clasificar los tickets de soporte por tema y urgencia, y enrutarlos automáticamente al agente o equipo correcto.' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce los tickets mal asignados en un 85% y el tiempo de manejo promedio en un 30% mediante enrutamiento inteligente' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Tickets enrutados' FROM public.automation_templates WHERE slug = 'ticket-routing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Customer Satisfaction Surveys' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically send CSAT and NPS surveys after ticket resolution and alert your team when satisfaction scores drop below thresholds.' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases survey response rates by 3x with automated follow-up, giving you actionable satisfaction data' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Surveys sent' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Encuestas de Satisfacción del Cliente' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Envía encuestas de CSAT y NPS automáticamente tras resolver tickets y alerta al equipo cuando los puntajes caen por debajo de los umbrales.' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta las tasas de respuesta a encuestas 3 veces con seguimiento automatizado, obteniendo datos acciónables de satisfacción' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Encuestas enviadas' FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'SLA Monitoring & Alerts' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Proactively monitor SLA compliance, predict at-risk tickets before they breach, and auto-escalate to senior agents when needed.' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces SLA breach rate by 90% with proactive alerting and automatic escalation workflows' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'SLA checks performed' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Monitoreo y Alertas de SLA' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea proactivamente el cumplimiento de SLAs, predice tickets en riesgo antes de que incumplan y escala automáticamente cuando es necesario.' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce la tasa de incumplimiento de SLA en un 90% con alertas proactivas y flujos de escalación automática' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Verificaciones de SLA realizadas' FROM public.automation_templates WHERE slug = 'sla-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Knowledge Base Updater' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Detect recurring support questions and automatically draft knowledge base articles for agent review, keeping your help docs current.' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces repetitive ticket volume by 30% within 60 days by keeping self-service content up to date' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Articles updated' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Actualizador de Base de Conocimiento' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Detecta preguntas de soporte recurrentes y genera automáticamente borradores de artículos para revisión, manteniendo la documentación actualizada.' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el volumen de tickets repetitivos en un 30% en 60 días al mantener actualizado el contenido de autoservicio' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Artículos actualizados' FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Escalation Manager' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically identify at-risk customers through sentiment analysis and escalate high-value issues to senior agents or managers instantly.' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces churn from poor service experiences by 25% through proactive VIP customer escalation' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Escalations managed' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Gestor de Escalaciones' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Identifica automáticamente clientes en riesgo mediante análisis de sentimiento y escala problemas de alto valor a agentes senior o gerentes al instante.' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce la pérdida de clientes por malas experiencias de servicio en un 25% mediante escalación proactiva de clientes VIP' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Escalaciones gestionadas' FROM public.automation_templates WHERE slug = 'escalation-manager'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'FAQ Bot' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Deploy a lightweight bot that answers frequently asked questions instantly across your website, chat, and messaging channels.' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Deflects 40% of inbound support volume by answering common questions without agent involvement' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'FAQs answered' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Bot de Preguntas Frecuentes' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Despliega un bot ligero que responde preguntas frecuentes al instante en tu sitio web, chat y canales de mensajería.' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Desvía el 40% del volumen de soporte entrante respondiendo preguntas comunes sin intervención de agentes' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Preguntas respondidas' FROM public.automation_templates WHERE slug = 'faq-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Review Response Automation' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Monitor online reviews across platforms and automatically draft personalized responses that protect and enhance your brand reputation.' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves average review response time from days to hours, boosting overall rating by 0.3-0.5 stars' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reviews responded' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Automatización de Respuestas a Reseñas' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea reseñas en línea en todas las plataformas y genera automáticamente respuestas personalizadas que protegen la reputación de tu marca.' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora el tiempo de respuesta a reseñas de días a horas, aumentando la calificación general entre 0.3 y 0.5 estrellas' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reseñas respondidas' FROM public.automation_templates WHERE slug = 'review-response'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Invoice Processing' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Extract data from vendor invoices using OCR, validate against purchase orders, and post approved invoices directly to your accounting system.' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Processes invoices 10x faster than manual entry, reducing accounts payable processing costs by 60%' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Invoices processed' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Procesamiento de Facturas' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Extrae datos de facturas de proveedores mediante OCR, valida contra órdenes de compra y publica facturas aprobadas directamente en tu sistema contable.' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Procesa facturas 10 veces más rápido que la captura manual, reduciendo los costos de cuentas por pagar en un 60%' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Facturas procesadas' FROM public.automation_templates WHERE slug = 'invoice-processing'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Automated Report Generation' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Generate formatted reports from your business data on a schedule and automatically distribute them to the right stakeholders.' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Saves analysts 5+ hours per week on report preparation and ensures stakeholders always have current data' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports generated' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Generación Automática de Reportes' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera reportes formateados con datos de tu negocio de forma programada y distribúyelos automáticamente a los interesados correctos.' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Ahorra a los analistas más de 5 horas semanales en la preparación de reportes y asegura que los datos siempre estén actualizados' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes generados' FROM public.automation_templates WHERE slug = 'report-generation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Contract Analysis' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Use AI to extract key clauses, flag non-standard terms, and track obligations across your entire contract portfolio.' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces contract review time by 70% and catches risk clauses that manual review often misses' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Contracts analyzed' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Análisis de Contratos con IA' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Usa IA para extraer cláusulas clave, detectar términos no estándar y rastrear obligaciones en todo tu portafolio de contratos.' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de revisión de contratos en un 70% y detecta cláusulas de riesgo que la revisión manual frecuentemente pasa por alto' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Contratos analizados' FROM public.automation_templates WHERE slug = 'contract-analysis'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Document Data Extraction' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically extract structured data from PDFs, spreadsheets, and scanned forms, with validation and error flagging built in.' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Eliminates manual data entry for 90% of incoming documents, reducing errors by 95%' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Documents processed' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Extracción de Datos de Documentos' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Extrae automáticamente datos estructurados de PDFs, hojas de cálculo y formularios escaneados, con validación y detección de errores integrada.' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Elimina la captura manual de datos para el 90% de los documentos entrantes, reduciendo errores en un 95%' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Documentos procesados' FROM public.automation_templates WHERE slug = 'data-extraction'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Document Approval Workflow' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Route documents through multi-stage approval workflows with deadline reminders, audit trails, and e-signature integration.' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces document approval cycle time by 50% and ensures full compliance audit trails' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Documents approved' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Flujo de Aprobación de Documentos' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Enruta documentos a través de flujos de aprobación multi-etapa con recordatorios de plazos, registro de auditoría e integración de firma electrónica.' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo del ciclo de aprobación de documentos en un 50% y garantiza registros de auditoría completos' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Documentos aprobados' FROM public.automation_templates WHERE slug = 'document-approval'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Document Template Filling' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically populate document templates — contracts, letters, onboarding docs — with data pulled from your CRM or database.' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces document preparation time from 30 minutes to under 2 minutes per document' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Documents generated' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Llenado Automático de Plantillas' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Llena automáticamente plantillas de documentos —contratos, cartas, documentos de incorporación— con datos extraídos de tu CRM o base de datos.' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de preparación de documentos de 30 minutos a menos de 2 minutos por documento' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Documentos generados' FROM public.automation_templates WHERE slug = 'template-filling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Receipt Scanning & Expense Tracking' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Capture receipts via mobile photo, automatically categorize expenses, and sync to your accounting system for fast reimbursement.' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Cuts expense report processing time by 75% and reduces errors from manual expense entry' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Receipts processed' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Escaneo de Recibos y Control de Gastos' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Captura recibos con foto desde el celular, categoriza gastos automáticamente y sincroniza con tu sistema contable para reembolsos rápidos.' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de procesamiento de gastos en un 75% y disminuye errores por captura manual' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Recibos procesados' FROM public.automation_templates WHERE slug = 'receipt-scanning'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Document Compliance Checker' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically check documents against regulatory requirements, identify compliance gaps, and generate remediation workflows.' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces compliance risk exposure by catching 95% of regulatory gaps before they become audit findings' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Documents reviewed' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Verificador de Cumplimiento Normativo' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Revisa documentos automáticamente contra requisitos regulatorios, identifica brechas de cumplimiento y genera flujos de remediación.' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce la exposición al riesgo regulatorio al detectar el 95% de las brechas antes de que se conviertan en hallazgos de auditoría' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Documentos revisados' FROM public.automation_templates WHERE slug = 'compliance-checker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Data Reconciliation' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically compare data across multiple systems to detect discrepancies, apply resolution rules, and generate exception reports.' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces reconciliation time from days to hours and catches 99% of data discrepancies automatically' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Records reconciled' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Conciliación de Datos' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Compara automáticamente datos entre múltiples sistemas para detectar discrepancias, aplicar reglas de resolución y generar reportes de excepciones.' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de conciliación de días a horas y detecta automáticamente el 99% de las discrepancias de datos' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Registros conciliados' FROM public.automation_templates WHERE slug = 'data-reconciliation'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Inventory Sync' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Keep inventory levels synchronized across all your sales channels and locations in real time, with automatic reorder point alerts.' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Eliminates overselling and stockouts, improving inventory accuracy to 99%+ across all channels' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'SKUs synced' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Sincronización de Inventario' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Mantén los niveles de inventario sincronizados en todos tus canales de venta y ubicaciones en tiempo real, con alertas automáticas de punto de reorden.' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Elimina las ventas en exceso y las roturas de stock, mejorando la precisión del inventario al 99%+ en todos los canales' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'SKUs sincronizados' FROM public.automation_templates WHERE slug = 'inventory-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Automated Shift Scheduling' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Build optimal shift schedules based on staff availability and coverage requirements, with automated notifications and swap handling.' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces scheduling time by 80% and cuts understaffing incidents by 60% through smart coverage planning' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Shifts scheduled' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Programación Automática de Turnos' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera turnos óptimos según la disponibilidad del personal y los requisitos de cobertura, con notificaciones automáticas y manejo de cambios.' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de programación en un 80% y los incidentes de falta de personal en un 60% mediante planeación inteligente' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Turnos programados' FROM public.automation_templates WHERE slug = 'shift-scheduling'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Vendor Management Automation' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Track vendor contracts, monitor performance scores, automate payment schedules, and streamline vendor onboarding workflows.' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces vendor management overhead by 50% and prevents costly contract lapses through automated renewal alerts' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Vendors managed' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Automatización de Gestión de Proveedores' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Rastrea contratos con proveedores, monitorea puntajes de desempeño, automatiza calendarios de pago y agiliza los flujos de incorporación de proveedores.' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce la carga administrativa de gestión de proveedores en un 50% y previene costosas caducidades de contrato' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Proveedores gestionados' FROM public.automation_templates WHERE slug = 'vendor-management'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Quality Monitoring' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Continuously monitor quality metrics, trigger alerts when thresholds are breached, and automate corrective action workflows.' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces quality-related costs by 30% through early detection and faster corrective action resolution' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Quality checks run' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Monitoreo de Calidad' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea continuamente métricas de calidad, activa alertas cuando se superan los umbrales y automatiza los flujos de acción correctiva.' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce los costos relacionados con calidad en un 30% mediante detección temprana y resolución más rápida de acciónes correctivas' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Verificaciones de calidad realizadas' FROM public.automation_templates WHERE slug = 'quality-monitoring'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Workflow Orchestrator' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Design and automate complex multi-step business processes with visual workflow logic, conditional branching, and cross-system triggers.' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Replaces 80% of manual handoffs in complex workflows, reducing process cycle time by up to 60%' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Workflows executed' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Orquestador de Flujos de Trabajo' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Diseña y automatiza procesos de negocio complejos de múltiples pasos con lógica visual, ramificación condicional y disparadores entre sistemas.' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reemplaza el 80% de los traspasos manuales en flujos complejos, reduciendo el tiempo de ciclo de procesos hasta un 60%' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Flujos ejecutados' FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'System Health Monitor' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Monitor uptime, latency, and error rates across your APIs and services, with instant Slack alerts and automatic incident creation.' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces mean time to detection for outages by 10x, minimizing the business impact of downtime' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Health checks run' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Monitor de Salud de Sistemas' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea la disponibilidad, latencia y tasa de errores en tus APIs y servicios, con alertas instantáneas en Slack y creación automática de incidentes.' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo promedio de detección de interrupciones 10 veces, minimizando el impacto de caídas en el negocio' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Verificaciones de salud realizadas' FROM public.automation_templates WHERE slug = 'system-health-monitor'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Backup Verification' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically verify that scheduled backups completed successfully, validate data integrity, and alert the team on any failures.' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Ensures 100% backup coverage and catches backup failures before they become data loss events' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Backups verified' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Verificación de Respaldos' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Verifica automáticamente que los respaldos programados se completaron correctamente, valida la integridad de los datos y alerta al equipo ante fallas.' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Garantiza una cobertura de respaldo del 100% y detecta fallas antes de que se conviertan en pérdida de datos' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Respaldos verificados' FROM public.automation_templates WHERE slug = 'backup-verification'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'AI Meeting Notes' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically transcribe meetings, extract action items and decisions, and distribute summaries to attendees after every call.' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Saves 30+ minutes per meeting on note-taking and ensures 100% of action items are captured' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Meetings summarized' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Notas de Reuniones con IA' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Transcribe reuniones automáticamente, extrae puntos de acción y decisiones, y distribuye resúmenes a los asistentes después de cada llamada.' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Ahorra más de 30 minutos por reunión en toma de notas y garantiza que el 100% de los puntos de acción queden registrados' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reuniones resumidas' FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Automated Task Assignment' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically create and assign tasks from emails, meetings, or triggers, routing them to the right person based on workload and skills.' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces task setup time by 70% and ensures no action items are dropped or forgotten' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Tasks assigned' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Asignación Automática de Tareas' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Crea y asigna tareas automáticamente a partir de correos, reuniones o disparadores, enrutándolas a la persona correcta según carga de trabajo y habilidades.' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de configuración de tareas en un 70% y asegura que ningún punto de acción se pierda u olvide' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Tareas asignadas' FROM public.automation_templates WHERE slug = 'task-assignment'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Time Tracking Sync' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Aggregate time tracking data across projects, calculate billable amounts, generate timesheets, and sync to your billing system.' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Recovers 5-10% of previously unbilled time and cuts timesheet preparation time by 80%' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Hours synced' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Sincronización de Control de Horas' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Agrega datos de control de horas entre proyectos, calcula montos facturables, genera partes de horas y los sincroniza con tu sistema de facturación.' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Recupera entre el 5% y 10% de horas no facturadas anteriormente y reduce el tiempo de preparación de partes de horas en un 80%' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Horas sincronizadas' FROM public.automation_templates WHERE slug = 'time-tracking-sync'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Calendar Optimizer' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Protect deep work time, cluster meetings intelligently, enforce buffer times, and optimize your team''s calendars for productivity.' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases uninterrupted work blocks by 40% and reduces context-switching fatigue' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Calendar events optimized' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Optimizador de Calendario' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Protege el tiempo de trabajo profundo, agrupa reuniones de forma inteligente, establece tiempos de amortiguación y optimiza los calendarios del equipo.' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta los bloques de trabajo ininterrumpido en un 40% y reduce la fatiga por cambio de contexto' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Eventos de calendario optimizados' FROM public.automation_templates WHERE slug = 'calendar-optimizer'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Slack Channel Digest' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically summarize Slack channels, highlight important threads, and extract action items into a daily or weekly digest.' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces time spent catching up on Slack by 50%, surfacing only what truly needs your attention' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Channels summarized' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Resumen de Canales de Slack' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Resume automáticamente los canales de Slack, destaca hilos importantes y extrae puntos de acción en un resumen diario o semanal.' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de actualización en Slack en un 50%, mostrando solo lo que realmente requiere tu atención' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Canales resumidos' FROM public.automation_templates WHERE slug = 'slack-digest'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Project Status Report' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically compile project data from your tools, generate RAG status reports, and deliver them to stakeholders on a schedule.' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Saves project managers 3+ hours per week on status reporting and improves stakeholder visibility' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports delivered' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte de Estado de Proyectos' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Compila automáticamente datos de proyectos de tus herramientas, genera reportes de estado RAG y los entrega a los interesados con puntualidad.' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Ahorra a los gerentes de proyecto más de 3 horas semanales en reportes de estado y mejora la visibilidad de los involucrados' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes entregados' FROM public.automation_templates WHERE slug = 'project-status-report'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Daily Standup Bot' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Run async daily standups via Slack, collect team updates, highlight blockers, and deliver a team summary to managers automatically.' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Replaces 30-minute sync standups, saving 2.5+ hours per week per team member' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Standups collected' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Bot de Standup Diario' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Realiza standups diarios de forma asíncrona por Slack, recopila actualizaciones del equipo, resalta bloqueos y entrega un resumen automático a los gerentes.' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reemplaza standups sincrónicos de 30 minutos, ahorrando más de 2.5 horas semanales por miembro del equipo' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Standups recopilados' FROM public.automation_templates WHERE slug = 'daily-standup-bot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Resource Planner' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Track team capacity, match skills to project needs, flag overallocations, and report on bench time across your organization.' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves resource utilization by 20% and prevents team burnout through proactive capacity monitoring' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Capacity plans updated' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Planeador de Recursos' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Rastrea la capacidad del equipo, relaciona habilidades con necesidades de proyectos, detecta sobreasignaciones y reporta tiempo disponible en la organización.' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora la utilización de recursos en un 20% y previene el agotamiento del equipo mediante monitoreo proactivo de capacidad' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Planes de capacidad actualizados' FROM public.automation_templates WHERE slug = 'resource-planner'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Executive Dashboard' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Aggregate KPIs from all business systems into a single real-time dashboard designed for executive decision-making.' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Eliminates weekly manual reporting packs, giving leadership real-time visibility into company performance' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Dashboards refreshed' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Dashboard Ejecutivo' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Consolida KPIs de todos los sistemas de negocio en un único dashboard en tiempo real diseñado para la toma de decisiones ejecutivas.' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Elimina los reportes manuales semanales para la dirección, dando visibilidad en tiempo real del desempeño de la empresa' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Dashboards actualizados' FROM public.automation_templates WHERE slug = 'executive-dashboard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'KPI Tracker' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Monitor key performance indicators against targets, alert owners when goals are at risk, and track trends over time.' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves goal attainment rates by 25% through proactive alerting and accountability tracking' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'KPIs monitored' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Seguimiento de KPIs' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea indicadores clave de desempeño contra objetivos, alerta a los responsables cuando las metas están en riesgo y rastrea tendencias en el tiempo.' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora el cumplimiento de metas en un 25% mediante alertas proactivas y seguimiento de responsabilidades' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'KPIs monitoreados' FROM public.automation_templates WHERE slug = 'kpi-tracker'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Financial Summary Report' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically generate P&L, balance sheet, and cash flow summaries with budget-vs-actual comparisons and trend analysis.' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Delivers board-ready financial reports in minutes instead of days, improving financial decision-making speed' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports generated' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte Financiero Resumido' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera automáticamente resúmenes de estado de resultados, balance general y flujo de caja con comparativos presupuesto-real y análisis de tendencias.' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Entrega reportes financieros listos para el consejo en minutos en vez de días, acelerando la toma de decisiones' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes generados' FROM public.automation_templates WHERE slug = 'financial-summary'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Client Performance Report' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automatically generate and deliver per-client performance reports with KPIs, SLA compliance, and health scores.' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases client retention by 15% by proactively demonstrating value and catching at-risk accounts early' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Client reports sent' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte de Desempeño por Cliente' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Genera y entrega automáticamente reportes de desempeño por cliente con KPIs, cumplimiento de SLA y puntajes de salud.' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta la retención de clientes en un 15% al demostrar valor proactivamente y detectar cuentas en riesgo a tiempo' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes de clientes enviados' FROM public.automation_templates WHERE slug = 'client-performance'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Team Productivity Report' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Measure team output against capacity, track individual contributions, and identify bottlenecks with weekly automated reports.' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves team throughput by 15% by identifying and resolving bottlenecks faster' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Productivity reports sent' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte de Productividad del Equipo' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Mide el rendimiento del equipo contra la capacidad, rastrea contribuciones individuales e identifica cuellos de botella con reportes semanales automáticos.' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora el rendimiento del equipo en un 15% al identificar y resolver cuellos de botella con mayor rapidez' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes de productividad enviados' FROM public.automation_templates WHERE slug = 'team-productivity'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Marketing ROI Report' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Aggregate performance data across all marketing channels, calculate ROI and attribution, and deliver insights to optimize spending.' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Improves marketing ROI by 20% by identifying the highest-performing channels and reallocating budget accordingly' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports generated' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Reporte de ROI de Marketing' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Consolida datos de rendimiento de todos los canales de marketing, calcula el ROI y la atribución, y entrega insights para optimizar el gasto.' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mejora el ROI de marketing en un 20% al identificar los canales de mayor rendimiento y reasignar presupuesto en consecuencia' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes generados' FROM public.automation_templates WHERE slug = 'marketing-roi'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Operations Scorecard' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Score operational performance across quality, efficiency, and cost metrics, tracking trends and flagging areas needing improvement.' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces operational costs by 10-15% by continuously surfacing inefficiencies and improvement opportunities' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Scorecards generated' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Scorecard de Operaciones' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Evalúa el desempeño operacional en métricas de calidad, eficiencia y costo, rastreando tendencias y señalando áreas que requieren mejora.' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce los costos operacionales entre un 10% y 15% al identificar continuamente ineficiencias y oportunidades de mejora' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Scorecards generados' FROM public.automation_templates WHERE slug = 'operations-scorecard'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Custom Analytics Builder' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Build bespoke analytics reports by blending data from multiple sources, with scheduled delivery and a self-serve query interface.' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Replaces weeks of manual spreadsheet analysis with on-demand answers to any business question' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Reports generated' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Constructor de Analítica Personalizada' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Diseña reportes analíticos a la medida combinando datos de múltiples fuentes, con entrega programada e interfaz de consulta de autoservicio.' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reemplaza semanas de análisis manual en hojas de cálculo con respuestas instantáneas a cualquier pregunta de negocio' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes generados' FROM public.automation_templates WHERE slug = 'custom-analytics'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Multi-Channel Support Agent' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'An AI agent that unifies support across email, chat, and SMS, classifies intent, resolves common issues autonomously, and hands off to humans seamlessly.' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Handles 70% of support volume autonomously across all channels, reducing support staffing needs by 30%' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Interactions resolved' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente de Soporte Multicanal' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Un agente de IA que unifica el soporte por correo, chat y SMS, clasifica la intención, resuelve problemas comunes de forma autónoma y transfiere a humanos sin interrupciones.' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Gestiona el 70% del volumen de soporte de forma autónoma en todos los canales, reduciendo las necesidades de personal en un 30%' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Interacciónes resueltas' FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Research Assistant Agent' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'An AI agent that conducts structured research on competitors, markets, or topics and delivers organized summaries and briefing documents.' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Completes in 20 minutes what previously took a junior analyst 2 days to research and compile' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Research reports produced' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente Asistente de Investigación' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Un agente de IA que realiza investigaciones estructuradas sobre competidores, mercados o temas, y entrega resúmenes organizados y documentos de briefing.' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Completa en 20 minutos lo que antes tomaba a un analista junior 2 días de investigación y compilación' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes de investigación producidos' FROM public.automation_templates WHERE slug = 'research-assistant'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Data Analyst Agent' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Ask business questions in plain language and get instant data analysis, visualizations, and insights generated by an AI analyst.' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Gives every team member analyst-level insights without waiting for the data team, reducing reporting backlogs by 80%' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Analyses generated' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente Analista de Datos' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Haz preguntas de negocio en lenguaje natural y obtén análisis de datos instantáneo, visualizaciones e insights generados por un analista de IA.' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Da a cada miembro del equipo acceso a insights de nivel analista sin esperar al equipo de datos, reduciendo retrasos de reportes en un 80%' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Análisis generados' FROM public.automation_templates WHERE slug = 'data-analyst-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Content Strategist Agent' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'An AI agent that analyzes content gaps, ideates topics, manages your editorial calendar, and produces multi-format content at scale.' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Triples content output while reducing strategy and production time by 60%' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Content pieces produced' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente Estratega de Contenido' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Un agente de IA que analiza brechas de contenido, genera ideas de temas, gestiona tu calendario editorial y produce contenido en múltiples formatos a escala.' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Triplica la producción de contenido mientras reduce el tiempo de estrategia y producción en un 60%' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Piezas de contenido producidas' FROM public.automation_templates WHERE slug = 'content-strategist-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Sales Copilot Agent' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'An AI copilot that coaches reps on active deals, recommends next best actions, surfaces objection handling prompts, and scores pipeline risk.' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Increases rep win rates by 20% and reduces average sales cycle length by 15% through AI-guided coaching' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Deal recommendations made' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Copiloto de Ventas' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Un copiloto de IA que asesora a los vendedores en negocios activos, recomienda las mejores acciónes, ofrece respuestas a objeciones y evalúa el riesgo del pipeline.' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Aumenta la tasa de cierre de los vendedores en un 20% y reduce el ciclo de ventas promedio en un 15% mediante asesoría guiada por IA' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Recomendaciones de negocio realizadas' FROM public.automation_templates WHERE slug = 'sales-copilot'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'HR Onboarding Agent' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Automate the entire new hire onboarding journey — checklists, welcome emails, document collection, and day-1 readiness tracking.' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces HR onboarding admin time by 70% and improves new hire time-to-productivity by 30%' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Onboardings completed' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente de Incorporación de Personal' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Automatiza todo el proceso de incorporación de nuevos empleados — checklists, correos de bienvenida, recopilación de documentos y seguimiento de preparación para el día 1.' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo administrativo de incorporación en RR.HH. en un 70% y mejora el tiempo de productividad de nuevos empleados en un 30%' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Incorporaciones completadas' FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Code Review Agent' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'An AI agent that analyzes pull requests for security vulnerabilities, code quality issues, and style violations, posting inline review comments.' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Catches 80% of common security and quality issues before human review, cutting PR review time in half' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'PRs reviewed' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente de Revisión de Código' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Un agente de IA que analiza pull requests en busca de vulnerabilidades de seguridad, problemas de calidad de código e infracciónes de estilo, publicando comentarios de revisión en línea.' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Detecta el 80% de los problemas comunes de seguridad y calidad antes de la revisión humana, reduciendo el tiempo de revisión de PRs a la mitad' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'PRs revisados' FROM public.automation_templates WHERE slug = 'code-review-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Compliance Agent' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Monitor regulatory changes, check policy documents for gaps, automate audit preparation workflows, and track remediation progress.' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Reduces compliance preparation time by 60% and minimizes regulatory risk through continuous monitoring' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Compliance checks run' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente de Cumplimiento Normativo' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea cambios regulatorios, verifica brechas en documentos de política, automatiza la preparación de auditorías y rastrea el progreso de remediación.' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de preparación de cumplimiento en un 60% y minimiza el riesgo regulatorio mediante monitoreo continuo' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Verificaciones de cumplimiento realizadas' FROM public.automation_templates WHERE slug = 'compliance-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'name', 'Competitive Intelligence Agent' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'description', 'Continuously monitor competitors for product launches, pricing changes, and news mentions, delivering weekly intel digests to your team.' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'typical_impact_text', 'Keeps your team 10x better informed on competitive moves, enabling faster strategic responses' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'en', 'activity_metric_label', 'Intel reports delivered' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'name', 'Agente de Inteligencia Competitiva' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'description', 'Monitorea continuamente a la competencia en lanzamientos de productos, cambios de precio y menciones en medios, entregando resúmenes de inteligencia semanales a tu equipo.' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'typical_impact_text', 'Mantiene a tu equipo 10 veces mejor informado sobre los movimientos de la competencia, permitiendo respuestas estratégicas más rápidas' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;

INSERT INTO public.automation_template_translations (template_id, locale, field, value)
SELECT id, 'es', 'activity_metric_label', 'Reportes de inteligencia entregados' FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
ON CONFLICT (template_id, locale, field) DO NOTHING;


COMMIT;

-- ===========================================
-- END OF SEED DATA
-- ===========================================
-- Summary:
--   auth.users:            5 (Alice, Bob, Carol, Dave, Dev)
--   auth.identities:       5
--   organizations:         2 (Acme Corp [hourly_cost:25], GlobalTech)
--   profiles:              5 (with first_name, last_name, org_id)
--   organization_members:  5 (Alice+Carol as owner, others unchanged)
--   automation_templates:  66 (8 categories, ~8-9 per category, i18n keys)
--   automations:           9 (6 Acme: active/active/paused/active/in_setup/active + 3 GlobalTech)
--   automation_executions: ~500 (60-day growth curve, 95% success, generate_series)
--   automation_requests:   7 (6 Acme: pending/in_review/approved/completed/rejected/payment_pending + 1 GlobalTech)
--   subscriptions:         2
--   chat_messages:         5
--   notifications:         13 (10 Acme + 3 GlobalTech, all 4 types, read/unread mix)
--   invitations:           1
-- ===========================================






