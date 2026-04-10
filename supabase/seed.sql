-- =============================================================================
-- AIDEAS Seed Data
-- Phase 07-02: Expanded Automation Templates (66+ templates with i18n keys)
-- =============================================================================
-- Coverage: 2 orgs, 5 users (4 seed + 1 dev), 66+ automation templates,
--           varied automation states, chat messages, notifications, invitations
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

ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
)
VALUES
    -- Acme Corp users
    ('00000000-0000-0000-0000-000000000000',
     'a1111111-1111-1111-1111-111111111111',
     'authenticated', 'authenticated',
     'alice@acmecorp.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Alice Johnson", "first_name": "Alice", "last_name": "Johnson"}'::jsonb,
     NOW(), NOW(), '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'a2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'bob@acmecorp.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Bob Martinez", "first_name": "Bob", "last_name": "Martinez"}'::jsonb,
     NOW(), NOW(), '', ''),

    -- GlobalTech users
    ('00000000-0000-0000-0000-000000000000',
     'b1111111-1111-1111-1111-111111111111',
     'authenticated', 'authenticated',
     'carol@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Carol Chen", "first_name": "Carol", "last_name": "Chen"}'::jsonb,
     NOW(), NOW(), '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'b2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'dave@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dave Wilson", "first_name": "Dave", "last_name": "Wilson"}'::jsonb,
     NOW(), NOW(), '', ''),

    -- Dev user (from project instructions: dev@jappi.ca / Password123)
    ('00000000-0000-0000-0000-000000000000',
     'de000000-0000-0000-0000-000000000001',
     'authenticated', 'authenticated',
     'dev@jappi.ca',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dev User", "first_name": "Dev", "last_name": "User"}'::jsonb,
     NOW(), NOW(), '', '');

ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

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
     'email', NOW(), NOW(), NOW());

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
    ('mm111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'owner', true),

    ('mm111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'operator', true),

    ('mm222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'owner', true),

    ('mm222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b2222222-2222-2222-2222-222222222222',
     'viewer', true),

    ('mm111111-0000-0000-0000-000000000003',
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

    ('tt0101-0000-0000-0000-000000000001',
     'templates.lead_followup_email.name',
     'lead-followup-email',
     'templates.lead_followup_email.description',
     'sales', 'user-plus',
     19900, 4900, 2,
     ARRAY['retail', 'agencias', 'inmobiliaria'],
     ARRAY['HubSpot', 'Mailchimp', 'Google Workspace'],
     'templates.lead_followup_email.impact',
     8, 'templates.lead_followup_email.metric_label',
     ARRAY['Personalized email sequences', 'A/B testing support', 'Engagement tracking', 'Auto-pause on reply'],
     ARRAY['Nurture cold leads', 'Follow up after trade shows', 'Re-engage inactive prospects'],
     '{}'::jsonb, 'pro', true, true, 1),

    ('tt0102-0000-0000-0000-000000000001',
     'templates.crm_data_sync.name',
     'crm-data-sync',
     'templates.crm_data_sync.description',
     'sales', 'git-merge',
     29900, 7900, 3,
     ARRAY['agencias', 'retail'],
     ARRAY['HubSpot', 'Salesforce', 'Google Workspace'],
     'templates.crm_data_sync.impact',
     15, 'templates.crm_data_sync.metric_label',
     ARRAY['Bi-directional sync', 'Conflict resolution rules', 'Audit trail logging', 'Field mapping'],
     ARRAY['Keep CRM and ERP in sync', 'Eliminate duplicate entries', 'Real-time data updates'],
     '{}'::jsonb, 'business', true, false, 2),

    ('tt0103-0000-0000-0000-000000000001',
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

    ('tt0104-0000-0000-0000-000000000001',
     'templates.quote_builder.name',
     'quote-builder',
     'templates.quote_builder.description',
     'sales', 'calculator',
     19900, 4900, 2,
     ARRAY['retail', 'inmobiliaria'],
     ARRAY['HubSpot', 'QuickBooks', 'Google Workspace'],
     'templates.quote_builder.impact',
     12, 'templates.quote_builder.metric_label',
     ARRAY['Dynamic pricing rules', 'Product catalog integration', 'Auto-expiry reminders', 'One-click to invoice'],
     ARRAY['Quote products and services quickly', 'Handle volume discounts', 'Track quote acceptance rates'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('tt0105-0000-0000-0000-000000000001',
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

    ('tt0106-0000-0000-0000-000000000001',
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

    ('tt0107-0000-0000-0000-000000000001',
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

    ('tt0108-0000-0000-0000-000000000001',
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

    ('tt0201-0000-0000-0000-000000000001',
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

    ('tt0202-0000-0000-0000-000000000001',
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

    ('tt0203-0000-0000-0000-000000000001',
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

    ('tt0204-0000-0000-0000-000000000001',
     'templates.email_campaigns.name',
     'email-campaigns',
     'templates.email_campaigns.description',
     'marketing', 'mail',
     19900, 4900, 2,
     ARRAY['retail', 'agencias', 'restaurantes'],
     ARRAY['Mailchimp', 'HubSpot', 'Google Workspace'],
     'templates.email_campaigns.impact',
     8, 'templates.email_campaigns.metric_label',
     ARRAY['Segmented audience targeting', 'Drip sequences', 'Open/click tracking', 'Automated list hygiene'],
     ARRAY['Nurture subscribers to buyers', 'Announce product launches', 'Recover abandoned carts'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('tt0205-0000-0000-0000-000000000001',
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

    ('tt0206-0000-0000-0000-000000000001',
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

    ('tt0207-0000-0000-0000-000000000001',
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
     ARRAY['Personalize campaigns by segment', 'Identify high-value customer groups', 'Automate list management'],
     '{}'::jsonb, 'business', true, false, 7),

    ('tt0208-0000-0000-0000-000000000001',
     'templates.newsletter_automation.name',
     'newsletter-automation',
     'templates.newsletter_automation.description',
     'marketing', 'send',
     9900, 2900, 1,
     ARRAY['agencias', 'retail'],
     ARRAY['Mailchimp', 'Google Workspace', 'Notion'],
     'templates.newsletter_automation.impact',
     8, 'templates.newsletter_automation.metric_label',
     ARRAY['Content curation from RSS/blog', 'Personalized subject lines', 'Subscriber health monitoring', 'Unsubscribe handling'],
     ARRAY['Send weekly newsletters automatically', 'Curate relevant industry news', 'Maintain subscriber engagement'],
     '{}'::jsonb, 'starter', true, false, 8),

-- ==================== CUSTOMER SERVICE (cat 03, 9 templates) ====================

    ('tt0301-0000-0000-0000-000000000001',
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

    ('tt0302-0000-0000-0000-000000000001',
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

    ('tt0303-0000-0000-0000-000000000001',
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

    ('tt0304-0000-0000-0000-000000000001',
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

    ('tt0305-0000-0000-0000-000000000001',
     'templates.sla_monitoring.name',
     'sla-monitoring',
     'templates.sla_monitoring.description',
     'customer_service', 'clock',
     19900, 4900, 2,
     ARRAY['salud', 'legal', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.sla_monitoring.impact',
     8, 'templates.sla_monitoring.metric_label',
     ARRAY['Breach prediction alerts', 'Auto-escalation rules', 'SLA compliance reporting', 'Priority queue management'],
     ARRAY['Prevent SLA breaches', 'Auto-escalate at-risk tickets', 'Prove compliance to clients'],
     '{}'::jsonb, 'pro', true, false, 5),

    ('tt0306-0000-0000-0000-000000000001',
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

    ('tt0307-0000-0000-0000-000000000001',
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

    ('tt0308-0000-0000-0000-000000000001',
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

    ('tt0309-0000-0000-0000-000000000001',
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

    ('tt0401-0000-0000-0000-000000000001',
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
     ARRAY['Process vendor invoices', 'Automate accounts payable', 'Reconcile against POs'],
     '{}'::jsonb, 'business', true, true, 1),

    ('tt0402-0000-0000-0000-000000000001',
     'templates.report_generation.name',
     'report-generation',
     'templates.report_generation.description',
     'documents', 'bar-chart-2',
     19900, 4900, 2,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Notion', 'Slack'],
     'templates.report_generation.impact',
     25, 'templates.report_generation.metric_label',
     ARRAY['Custom report templates', 'Scheduled generation', 'PDF and Excel export', 'Auto-distribution'],
     ARRAY['Generate weekly sales reports', 'Produce client-facing summaries', 'Automate board reports'],
     '{}'::jsonb, 'pro', true, false, 2),

    ('tt0403-0000-0000-0000-000000000001',
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

    ('tt0404-0000-0000-0000-000000000001',
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

    ('tt0405-0000-0000-0000-000000000001',
     'templates.document_approval.name',
     'document-approval',
     'templates.document_approval.description',
     'documents', 'check-circle',
     19900, 4900, 2,
     ARRAY['legal', 'inmobiliaria', 'agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.document_approval.impact',
     15, 'templates.document_approval.metric_label',
     ARRAY['Multi-stage approval workflows', 'Deadline reminders', 'Audit trail', 'e-Signature integration'],
     ARRAY['Route documents for sign-off', 'Track approval status', 'Enforce compliance workflows'],
     '{}'::jsonb, 'pro', true, false, 5),

    ('tt0406-0000-0000-0000-000000000001',
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
     ARRAY['Auto-fill NDAs and contracts', 'Generate personalized letters', 'Produce onboarding documents'],
     '{}'::jsonb, 'starter', true, false, 6),

    ('tt0407-0000-0000-0000-000000000001',
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
     ARRAY['Digitize expense receipts', 'Auto-categorize business expenses', 'Speed up reimbursements'],
     '{}'::jsonb, 'starter', true, false, 7),

    ('tt0408-0000-0000-0000-000000000001',
     'templates.compliance_checker.name',
     'compliance-checker',
     'templates.compliance_checker.description',
     'documents', 'shield-check',
     49900, 14900, 5,
     ARRAY['legal', 'salud', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.compliance_checker.impact',
     30, 'templates.compliance_checker.metric_label',
     ARRAY['Regulatory rule library', 'Document gap analysis', 'Remediation workflow', 'Audit report generation'],
     ARRAY['Check documents for compliance', 'Identify regulatory gaps', 'Prepare audit documentation'],
     '{}'::jsonb, 'business', true, false, 8),

-- ==================== OPERATIONS (cat 05, 8 templates) ====================

    ('tt0501-0000-0000-0000-000000000001',
     'templates.data_reconciliation.name',
     'data-reconciliation',
     'templates.data_reconciliation.description',
     'operations', 'git-merge',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'agencias'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.data_reconciliation.impact',
     30, 'templates.data_reconciliation.metric_label',
     ARRAY['Multi-source comparison', 'Discrepancy detection', 'Auto-resolution rules', 'Exception reporting'],
     ARRAY['Match bank statements', 'Reconcile inventory counts', 'Verify transaction records'],
     '{}'::jsonb, 'business', true, true, 1),

    ('tt0502-0000-0000-0000-000000000001',
     'templates.inventory_sync.name',
     'inventory-sync',
     'templates.inventory_sync.description',
     'operations', 'package',
     19900, 4900, 2,
     ARRAY['retail', 'restaurantes'],
     ARRAY['Shopify', 'QuickBooks', 'Google Workspace'],
     'templates.inventory_sync.impact',
     20, 'templates.inventory_sync.metric_label',
     ARRAY['Real-time stock updates', 'Multi-location tracking', 'Reorder point alerts', 'Supplier order automation'],
     ARRAY['Keep all systems in sync', 'Prevent overselling', 'Automate purchase orders'],
     '{}'::jsonb, 'pro', true, true, 2),

    ('tt0503-0000-0000-0000-000000000001',
     'templates.shift_scheduling.name',
     'shift-scheduling',
     'templates.shift_scheduling.description',
     'operations', 'calendar',
     19900, 4900, 2,
     ARRAY['restaurantes', 'retail', 'salud'],
     ARRAY['Google Workspace', 'Slack', 'Zoom'],
     'templates.shift_scheduling.impact',
     15, 'templates.shift_scheduling.metric_label',
     ARRAY['Availability-based scheduling', 'Coverage gap detection', 'Automated shift reminders', 'Swap request handling'],
     ARRAY['Build weekly schedules automatically', 'Prevent understaffing', 'Notify staff of shifts'],
     '{}'::jsonb, 'pro', true, false, 3),

    ('tt0504-0000-0000-0000-000000000001',
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
     ARRAY['Track vendor contract renewals', 'Monitor supplier performance', 'Automate vendor payments'],
     '{}'::jsonb, 'business', true, false, 4),

    ('tt0505-0000-0000-0000-000000000001',
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

    ('tt0506-0000-0000-0000-000000000001',
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
     ARRAY['Automate multi-step business processes', 'Connect siloed systems', 'Replace manual handoffs'],
     '{}'::jsonb, 'business', true, true, 6),

    ('tt0507-0000-0000-0000-000000000001',
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

    ('tt0508-0000-0000-0000-000000000001',
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

    ('tt0601-0000-0000-0000-000000000001',
     'templates.meeting_notes_ai.name',
     'meeting-notes-ai',
     'templates.meeting_notes_ai.description',
     'productivity', 'mic',
     9900, 2900, 1,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Zoom', 'Google Workspace', 'Notion'],
     'templates.meeting_notes_ai.impact',
     20, 'templates.meeting_notes_ai.metric_label',
     ARRAY['Auto-transcription', 'Action item extraction', 'Summary email generation', 'CRM note sync'],
     ARRAY['Capture meeting decisions automatically', 'Distribute meeting summaries', 'Track action items'],
     '{}'::jsonb, 'starter', true, true, 1),

    ('tt0602-0000-0000-0000-000000000001',
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
     ARRAY['Auto-create tasks from emails', 'Assign based on workload', 'Track task completion rates'],
     '{}'::jsonb, 'starter', true, false, 2),

    ('tt0603-0000-0000-0000-000000000001',
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
     ARRAY['Auto-generate client invoices from time', 'Track billable vs non-billable', 'Produce payroll data'],
     '{}'::jsonb, 'starter', true, false, 3),

    ('tt0604-0000-0000-0000-000000000001',
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

    ('tt0605-0000-0000-0000-000000000001',
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
     ARRAY['Catch up on missed messages fast', 'Surface important decisions', 'Reduce notification fatigue'],
     '{}'::jsonb, 'starter', true, false, 5),

    ('tt0606-0000-0000-0000-000000000001',
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
     ARRAY['Auto-generate weekly status reports', 'Keep stakeholders informed', 'Escalate at-risk projects'],
     '{}'::jsonb, 'pro', true, true, 6),

    ('tt0607-0000-0000-0000-000000000001',
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
     ARRAY['Run remote standups async', 'Surface team blockers early', 'Reduce sync meeting time'],
     '{}'::jsonb, 'starter', true, false, 7),

    ('tt0608-0000-0000-0000-000000000001',
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

    ('tt0701-0000-0000-0000-000000000001',
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

    ('tt0702-0000-0000-0000-000000000001',
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

    ('tt0703-0000-0000-0000-000000000001',
     'templates.financial_summary.name',
     'financial-summary',
     'templates.financial_summary.description',
     'reports', 'dollar-sign',
     29900, 7900, 3,
     ARRAY['retail', 'legal', 'inmobiliaria'],
     ARRAY['QuickBooks', 'Google Workspace', 'Slack'],
     'templates.financial_summary.impact',
     35, 'templates.financial_summary.metric_label',
     ARRAY['P&L, balance sheet, cash flow', 'Budget vs actual comparison', 'Trend analysis', 'Automated distribution'],
     ARRAY['Produce monthly financial reports', 'Share with board and investors', 'Track budget adherence'],
     '{}'::jsonb, 'business', true, false, 3),

    ('tt0704-0000-0000-0000-000000000001',
     'templates.client_performance.name',
     'client-performance',
     'templates.client_performance.description',
     'reports', 'user-check',
     19900, 4900, 2,
     ARRAY['agencias', 'legal', 'inmobiliaria'],
     ARRAY['Google Workspace', 'HubSpot', 'Slack'],
     'templates.client_performance.impact',
     20, 'templates.client_performance.metric_label',
     ARRAY['Per-client KPI tracking', 'SLA compliance reporting', 'Health score calculation', 'Automated client delivery'],
     ARRAY['Send clients automated performance reports', 'Track deliverables by client', 'Prove ROI to clients'],
     '{}'::jsonb, 'pro', true, false, 4),

    ('tt0705-0000-0000-0000-000000000001',
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

    ('tt0706-0000-0000-0000-000000000001',
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

    ('tt0707-0000-0000-0000-000000000001',
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

    ('tt0708-0000-0000-0000-000000000001',
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

    ('tt0801-0000-0000-0000-000000000001',
     'templates.multichannel_support_agent.name',
     'multichannel-support-agent',
     'templates.multichannel_support_agent.description',
     'ai_agents', 'brain',
     49900, 14900, 5,
     ARRAY['retail', 'salud', 'agencias'],
     ARRAY['Zendesk', 'Slack', 'Google Workspace'],
     'templates.multichannel_support_agent.impact',
     5, 'templates.multichannel_support_agent.metric_label',
     ARRAY['Email, chat, SMS unification', 'AI intent classification', 'Auto-resolution for common issues', 'Seamless human handoff'],
     ARRAY['Handle support across all channels', 'Reduce agent handling time', 'Provide consistent service experience'],
     '{}'::jsonb, 'business', true, true, 1),

    ('tt0802-0000-0000-0000-000000000001',
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

    ('tt0803-0000-0000-0000-000000000001',
     'templates.data_analyst_agent.name',
     'data-analyst-agent',
     'templates.data_analyst_agent.description',
     'ai_agents', 'bar-chart-2',
     49900, 14900, 5,
     ARRAY['retail', 'agencias', 'salud'],
     ARRAY['Google Workspace', 'QuickBooks', 'Notion'],
     'templates.data_analyst_agent.impact',
     40, 'templates.data_analyst_agent.metric_label',
     ARRAY['Natural language data queries', 'Automated visualization', 'Anomaly detection', 'Insight narration'],
     ARRAY['Ask questions of your business data', 'Detect unusual patterns', 'Generate analytical reports on demand'],
     '{}'::jsonb, 'business', true, true, 3),

    ('tt0804-0000-0000-0000-000000000001',
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

    ('tt0805-0000-0000-0000-000000000001',
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

    ('tt0806-0000-0000-0000-000000000001',
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

    ('tt0807-0000-0000-0000-000000000001',
     'templates.code_review_agent.name',
     'code-review-agent',
     'templates.code_review_agent.description',
     'ai_agents', 'code',
     29900, 9900, 3,
     ARRAY['agencias'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.code_review_agent.impact',
     30, 'templates.code_review_agent.metric_label',
     ARRAY['Automated PR analysis', 'Security vulnerability scanning', 'Code quality scoring', 'Inline review comments'],
     ARRAY['Speed up code review cycles', 'Catch security issues early', 'Enforce coding standards'],
     '{}'::jsonb, 'business', true, false, 7),

    ('tt0808-0000-0000-0000-000000000001',
     'templates.compliance_agent.name',
     'compliance-agent',
     'templates.compliance_agent.description',
     'ai_agents', 'shield-check',
     49900, 14900, 5,
     ARRAY['legal', 'salud', 'inmobiliaria'],
     ARRAY['Google Workspace', 'Slack', 'Notion'],
     'templates.compliance_agent.impact',
     35, 'templates.compliance_agent.metric_label',
     ARRAY['Regulation monitoring', 'Policy gap detection', 'Audit preparation workflows', 'Remediation tracking'],
     ARRAY['Monitor regulatory changes', 'Ensure policy documents are current', 'Prepare for audits automatically'],
     '{}'::jsonb, 'business', true, false, 8),

    ('tt0809-0000-0000-0000-000000000001',
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
-- 7. automations (6 automations across both orgs — Plan 03 will expand)
-- =============================================================================

INSERT INTO public.automations (
    id, organization_id, template_id, name, description, status, config, last_run_at, error_message
)
VALUES
    ('au111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt0301-0000-0000-0000-000000000001',
     'Acme Customer Support Chatbot',
     'Handles incoming customer inquiries on our website 24/7',
     'active',
     '{"webhook_url": "https://acmecorp.com/chatbot", "escalation_email": "support@acmecorp.com"}'::jsonb,
     NOW() - INTERVAL '2 hours',
     NULL),

    ('au111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt0201-0000-0000-0000-000000000001',
     'Acme Content Pipeline',
     'Weekly blog post and social media content generation for marketing team',
     'paused',
     '{"frequency": "weekly", "topics": ["marketing", "automation", "AI"]}'::jsonb,
     NOW() - INTERVAL '5 days',
     NULL),

    ('au111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt0101-0000-0000-0000-000000000001',
     'Acme Lead Nurture Sequence',
     'Automated follow-up emails for prospects from the website lead form',
     'draft',
     '{}'::jsonb,
     NULL,
     NULL),

    ('au222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt0401-0000-0000-0000-000000000001',
     'GlobalTech Invoice Processor',
     'Processes vendor invoices from email attachments and posts to accounting',
     'active',
     '{"email_inbox": "invoices@globaltech.io", "erp_endpoint": "https://erp.globaltech.io/api"}'::jsonb,
     NOW() - INTERVAL '30 minutes',
     NULL),

    ('au222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt0501-0000-0000-0000-000000000001',
     'GlobalTech Data Sync',
     'Nightly reconciliation between CRM and billing system',
     'failed',
     '{"crm_url": "https://crm.globaltech.io", "billing_url": "https://billing.globaltech.io"}'::jsonb,
     NOW() - INTERVAL '8 hours',
     'Connection timeout to billing API after 3 retries. Last attempt: rate limit exceeded.'),

    ('au222222-0000-0000-0000-000000000003',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt0402-0000-0000-0000-000000000001',
     'GlobalTech Monthly Reporting',
     'Auto-generate monthly performance reports for executive team',
     'pending_review',
     '{"recipients": ["ceo@globaltech.io", "cfo@globaltech.io"], "format": "pdf"}'::jsonb,
     NULL,
     NULL);

-- =============================================================================
-- 8. automation_executions (4 executions — Plan 03 will expand)
-- =============================================================================

INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
VALUES
    ('ex111111-0000-0000-0000-000000000001',
     'au111111-0000-0000-0000-000000000001',
     'success',
     NOW() - INTERVAL '2 hours',
     NOW() - INTERVAL '2 hours' + INTERVAL '4 seconds',
     4023,
     '{"messages_received": 12}'::jsonb,
     '{"messages_handled": 12, "escalated": 1}'::jsonb,
     NULL,
     'schedule'),

    ('ex111111-0000-0000-0000-000000000002',
     'au111111-0000-0000-0000-000000000001',
     'success',
     NOW() - INTERVAL '14 hours',
     NOW() - INTERVAL '14 hours' + INTERVAL '3 seconds',
     3217,
     '{"messages_received": 8}'::jsonb,
     '{"messages_handled": 8, "escalated": 0}'::jsonb,
     NULL,
     'schedule'),

    ('ex222222-0000-0000-0000-000000000001',
     'au222222-0000-0000-0000-000000000001',
     'success',
     NOW() - INTERVAL '30 minutes',
     NOW() - INTERVAL '30 minutes' + INTERVAL '12 seconds',
     11854,
     '{"invoices_received": 5}'::jsonb,
     '{"invoices_processed": 5, "total_amount": 48320.00}'::jsonb,
     NULL,
     'schedule'),

    ('ex222222-0000-0000-0000-000000000002',
     'au222222-0000-0000-0000-000000000002',
     'error',
     NOW() - INTERVAL '8 hours',
     NOW() - INTERVAL '8 hours' + INTERVAL '35 seconds',
     35000,
     '{"records_to_sync": 843}'::jsonb,
     NULL,
     'Connection timeout to billing API after 3 retries. Last attempt: rate limit exceeded.',
     'schedule');

-- =============================================================================
-- 9. automation_requests (3 requests — Plan 03 will expand)
-- =============================================================================

INSERT INTO public.automation_requests (
    id, organization_id, template_id, user_id,
    title, description, urgency, status, notes
)
VALUES
    ('rq111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt0203-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'Lead Scoring for Website Visitors',
     'We want to automatically score leads that fill out our contact form based on company size, industry, and behavior on the site. Currently doing this manually and it takes 2 hours per week.',
     'normal',
     'pending',
     NULL),

    ('rq111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt0302-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'Email Auto-Responder for Support',
     'Set up auto-responses for our support@acmecorp.com inbox with acknowledgment and estimated response times.',
     'low',
     'completed',
     'Implemented and deployed. Auto-responder live as of last week.'),

    ('rq222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     NULL,
     'b1111111-1111-1111-1111-111111111111',
     'Emergency Alert System for API Downtime',
     'Our main product API goes down occasionally and we only find out when customers complain. We need real-time monitoring with alerts to Slack and PagerDuty when downtime is detected. This is costing us SLA credits.',
     'urgent',
     'in_review',
     'Customer flagged this as blocking a contract renewal.');

-- =============================================================================
-- 10. subscriptions (1 per org)
-- =============================================================================

INSERT INTO public.subscriptions (
    id, organization_id, plan, status, billing_cycle,
    current_period_start, current_period_end
)
VALUES
    ('su111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'pro', 'active', 'monthly',
     NOW() - INTERVAL '15 days',
     NOW() + INTERVAL '15 days'),

    ('su222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'starter', 'active', 'monthly',
     NOW() - INTERVAL '8 days',
     NOW() + INTERVAL '22 days');

-- =============================================================================
-- 11. chat_messages (5 messages: client-AIDEAS conversations in both orgs)
-- =============================================================================

INSERT INTO public.chat_messages (id, organization_id, sender_id, sender_type, content, created_at)
VALUES
    ('cm111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'client',
     'Hi! Our chatbot stopped responding this morning around 9 AM. Is everything okay on your end?',
     NOW() - INTERVAL '3 hours'),

    ('cm111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     NULL,
     'aideas',
     'Hello Alice! We''ve identified a brief connectivity issue that was resolved at 9:15 AM. Your chatbot is fully operational now and we''re monitoring it closely. We''ll send a full incident report by end of day.',
     NOW() - INTERVAL '2 hours 45 minutes'),

    ('cm111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'client',
     'Thanks for the quick response! Looking forward to the report. Can you also check if the escalation emails are working properly?',
     NOW() - INTERVAL '2 hours 30 minutes'),

    ('cm222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'client',
     'The data sync failed again last night. We''re getting pressure from the finance team — this is the third time this month. What''s the root cause?',
     NOW() - INTERVAL '7 hours'),

    ('cm222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     NULL,
     'aideas',
     'Hi Carol, we''ve investigated and the root cause is rate limiting on your billing API — it''s rejecting bulk sync requests after midnight. We''re implementing exponential backoff and splitting the sync into smaller batches. Fix will be deployed tonight. We''ll monitor the next run personally.',
     NOW() - INTERVAL '6 hours 30 minutes');

-- =============================================================================
-- 12. notifications (4 notifications — Plan 03 will expand)
-- =============================================================================

INSERT INTO public.notifications (
    id, organization_id, user_id, type, title, message, is_read, read_at, link, created_at
)
VALUES
    ('nt111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'action_required',
     'Chatbot Incident Report Ready',
     'The incident report for this morning''s chatbot connectivity issue is ready for your review.',
     false, NULL,
     '/dashboard/chat',
     NOW() - INTERVAL '1 hour'),

    ('nt111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'success',
     'Subscription Upgraded to Pro',
     'Your organization has been upgraded to the Pro plan. New automation slots are now available.',
     true, NOW() - INTERVAL '14 days',
     '/dashboard/billing',
     NOW() - INTERVAL '15 days'),

    ('nt222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'warning',
     'Data Sync Failed — Action Required',
     'The GlobalTech Data Sync automation failed during last night''s run. Our team is investigating. Check the chat for updates.',
     false, NULL,
     '/dashboard/automations',
     NOW() - INTERVAL '7 hours 30 minutes'),

    ('nt222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'info',
     'Dave Wilson Joined Your Organization',
     'Dave Wilson has accepted the invitation and joined GlobalTech as a viewer.',
     true, NOW() - INTERVAL '6 days',
     '/dashboard/team',
     NOW() - INTERVAL '7 days');

-- =============================================================================
-- 13. invitations (1 pending invitation for Acme Corp)
-- =============================================================================

INSERT INTO public.invitations (
    id, organization_id, email, role, token, invited_by, expires_at, accepted_at
)
VALUES
    ('iv111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'charlie@acmecorp.com',
     'operator',
     'a8f3b2e1d4c7960f5e2b8a3d1c4e7f0b9a6d3c2e5b8f1a4d7c0e3b6f9a2d5c8',
     'a1111111-1111-1111-1111-111111111111',
     NOW() + INTERVAL '7 days',
     NULL);

COMMIT;

-- ===========================================
-- END OF SEED DATA
-- ===========================================
-- Summary:
--   auth.users:            5 (Alice, Bob, Carol, Dave, Dev)
--   auth.identities:       5
--   organizations:         2 (Acme Corp, GlobalTech)
--   profiles:              5 (with first_name, last_name, org_id)
--   organization_members:  5 (Alice+Carol as owner, others unchanged)
--   automation_templates:  66 (8 categories, ~8-9 per category, i18n keys)
--   automations:           6 (active/paused/draft/active/failed/pending_review)
--   automation_executions: 4 (2 success, 1 success, 1 error)
--   automation_requests:   3 (pending/completed/in_review)
--   subscriptions:         2
--   chat_messages:         5
--   notifications:         4
--   invitations:           1
-- ===========================================
