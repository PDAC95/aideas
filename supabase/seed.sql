-- =============================================================================
-- AIDEAS Seed Data
-- Phase 02: Database Schema
-- =============================================================================
-- Coverage: 2 orgs, 5 users (4 seed + 1 dev), varied automation states,
--           chat messages, notifications, invitations
-- FK order: auth.users -> organizations -> organization_members ->
--           automation_templates -> automations -> automation_executions ->
--           automation_requests -> subscriptions -> chat_messages ->
--           notifications -> invitations
-- Usage: Applied automatically by `supabase db reset`
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. auth.users (5 users: 4 seed + 1 dev user)
-- =============================================================================
-- The on_auth_user_created trigger will auto-create matching profiles rows.
-- Fixed UUIDs for reproducibility across resets.

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
     NOW(), '{"full_name": "Alice Johnson"}'::jsonb,
     NOW(), NOW(), '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'a2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'bob@acmecorp.com',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Bob Martinez"}'::jsonb,
     NOW(), NOW(), '', ''),

    -- GlobalTech users
    ('00000000-0000-0000-0000-000000000000',
     'b1111111-1111-1111-1111-111111111111',
     'authenticated', 'authenticated',
     'carol@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Carol Chen"}'::jsonb,
     NOW(), NOW(), '', ''),

    ('00000000-0000-0000-0000-000000000000',
     'b2222222-2222-2222-2222-222222222222',
     'authenticated', 'authenticated',
     'dave@globaltech.io',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dave Wilson"}'::jsonb,
     NOW(), NOW(), '', ''),

    -- Dev user (from project instructions: dev@jappi.ca / Password123)
    ('00000000-0000-0000-0000-000000000000',
     'de000000-0000-0000-0000-000000000001',
     'authenticated', 'authenticated',
     'dev@jappi.ca',
     crypt('Password123', gen_salt('bf')),
     NOW(), '{"full_name": "Dev User"}'::jsonb,
     NOW(), NOW(), '', '')

ON CONFLICT (id) DO NOTHING;

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
     'email', NOW(), NOW(), NOW())

ON CONFLICT (id, provider) DO NOTHING;

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
     '{"timezone": "America/Vancouver", "industry": "tech_consulting"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. organization_members (5 members: 4 seed users + dev user)
-- =============================================================================

INSERT INTO public.organization_members (id, organization_id, user_id, role, is_active)
VALUES
    -- Acme Corp members
    ('mm111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'admin', true),    -- Alice: admin

    ('mm111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a2222222-2222-2222-2222-222222222222',
     'operator', true), -- Bob: operator

    -- GlobalTech members
    ('mm222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'admin', true),    -- Carol: admin

    ('mm222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b2222222-2222-2222-2222-222222222222',
     'viewer', true),   -- Dave: viewer

    -- Dev user: admin of Acme Corp (for development testing)
    ('mm111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'de000000-0000-0000-0000-000000000001',
     'admin', true)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. automation_templates (~8 templates reflecting real AIDEAS services)
-- =============================================================================

INSERT INTO public.automation_templates (
    id, name, slug, description, category, icon,
    features, use_cases, config_schema, pricing_tier, is_active, is_featured, sort_order
)
VALUES
    -- Customer Service
    ('tt000001-0000-0000-0000-000000000001',
     'AI Chatbot', 'ai-chatbot',
     'Intelligent chatbot that handles customer inquiries 24/7',
     'customer_service', 'message-circle',
     ARRAY['Natural language understanding', 'Multi-language support', 'Sentiment analysis', 'Escalation to humans'],
     ARRAY['Answer FAQs automatically', 'Qualify leads before handoff', 'Provide instant support'],
     '{}'::jsonb, 'starter', true, true, 1),

    ('tt000001-0000-0000-0000-000000000002',
     'Auto-Response Email', 'auto-response-email',
     'Automatically respond to common email inquiries',
     'customer_service', 'mail',
     ARRAY['Template-based responses', 'Smart categorization', 'Follow-up scheduling'],
     ARRAY['Handle support emails', 'Acknowledge orders', 'Send confirmations'],
     '{}'::jsonb, 'starter', true, false, 2),

    -- Documents
    ('tt000002-0000-0000-0000-000000000001',
     'Invoice Processing', 'invoice-processing',
     'Extract data from invoices automatically',
     'documents', 'file-text',
     ARRAY['OCR extraction', 'Data validation', 'ERP integration', 'Multi-format support'],
     ARRAY['Process vendor invoices', 'Reconcile payments', 'Automate data entry'],
     '{}'::jsonb, 'pro', true, true, 3),

    ('tt000002-0000-0000-0000-000000000002',
     'Report Generation', 'report-generation',
     'Generate reports from your data automatically',
     'documents', 'bar-chart-2',
     ARRAY['Custom templates', 'Scheduled generation', 'Multiple formats'],
     ARRAY['Weekly sales reports', 'Monthly performance summaries', 'Executive dashboards'],
     '{}'::jsonb, 'pro', true, false, 4),

    -- Marketing
    ('tt000003-0000-0000-0000-000000000001',
     'Content Generation', 'content-generation',
     'Generate marketing content with AI',
     'marketing', 'edit-3',
     ARRAY['Blog posts', 'Social media content', 'Email campaigns', 'Brand voice matching'],
     ARRAY['Scale content production', 'Maintain consistency', 'Save writer time'],
     '{}'::jsonb, 'pro', true, true, 5),

    ('tt000003-0000-0000-0000-000000000002',
     'Lead Scoring', 'lead-scoring',
     'Score and prioritize leads automatically',
     'marketing', 'target',
     ARRAY['Behavior tracking', 'Demographic scoring', 'CRM integration'],
     ARRAY['Focus on hot leads', 'Improve conversion', 'Optimize sales time'],
     '{}'::jsonb, 'pro', true, false, 6),

    -- Sales
    ('tt000004-0000-0000-0000-000000000001',
     'Lead Follow-up', 'lead-follow-up',
     'Automate lead nurturing sequences',
     'sales', 'user-plus',
     ARRAY['Personalized sequences', 'A/B testing', 'Engagement tracking'],
     ARRAY['Never miss a follow-up', 'Nurture cold leads', 'Scale outreach'],
     '{}'::jsonb, 'pro', true, true, 7),

    -- Operations
    ('tt000005-0000-0000-0000-000000000001',
     'Data Reconciliation', 'data-reconciliation',
     'Reconcile data between systems automatically',
     'operations', 'git-merge',
     ARRAY['Multi-source sync', 'Discrepancy detection', 'Auto-resolution'],
     ARRAY['Match bank statements', 'Sync inventories', 'Verify transactions'],
     '{}'::jsonb, 'business', true, true, 8)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. automations (6 automations across both orgs, various lifecycle states)
-- =============================================================================
-- Acme: AI Chatbot (active), Content Generation (paused), Lead Follow-up (draft)
-- GlobalTech: Invoice Processing (active), Data Reconciliation (failed), Report Generation (pending_review)

INSERT INTO public.automations (
    id, organization_id, template_id, name, description, status, config, last_run_at, error_message
)
VALUES
    -- Acme Corp automations
    ('au111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt000001-0000-0000-0000-000000000001',
     'Acme Customer Support Chatbot',
     'Handles incoming customer inquiries on our website 24/7',
     'active',
     '{"webhook_url": "https://acmecorp.com/chatbot", "escalation_email": "support@acmecorp.com"}'::jsonb,
     NOW() - INTERVAL '2 hours',
     NULL),

    ('au111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt000003-0000-0000-0000-000000000001',
     'Acme Content Pipeline',
     'Weekly blog post and social media content generation for marketing team',
     'paused',
     '{"frequency": "weekly", "topics": ["marketing", "automation", "AI"]}'::jsonb,
     NOW() - INTERVAL '5 days',
     NULL),

    ('au111111-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt000004-0000-0000-0000-000000000001',
     'Acme Lead Nurture Sequence',
     'Automated follow-up emails for prospects from the website lead form',
     'draft',
     '{}'::jsonb,
     NULL,
     NULL),

    -- GlobalTech automations
    ('au222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt000002-0000-0000-0000-000000000001',
     'GlobalTech Invoice Processor',
     'Processes vendor invoices from email attachments and posts to accounting',
     'active',
     '{"email_inbox": "invoices@globaltech.io", "erp_endpoint": "https://erp.globaltech.io/api"}'::jsonb,
     NOW() - INTERVAL '30 minutes',
     NULL),

    ('au222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt000005-0000-0000-0000-000000000001',
     'GlobalTech Data Sync',
     'Nightly reconciliation between CRM and billing system',
     'failed',
     '{"crm_url": "https://crm.globaltech.io", "billing_url": "https://billing.globaltech.io"}'::jsonb,
     NOW() - INTERVAL '8 hours',
     'Connection timeout to billing API after 3 retries. Last attempt: rate limit exceeded.'),

    ('au222222-0000-0000-0000-000000000003',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'tt000002-0000-0000-0000-000000000002',
     'GlobalTech Monthly Reporting',
     'Auto-generate monthly performance reports for executive team',
     'pending_review',
     '{"recipients": ["ceo@globaltech.io", "cfo@globaltech.io"], "format": "pdf"}'::jsonb,
     NULL,
     NULL)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. automation_executions (4 executions mixing success and error)
-- =============================================================================

INSERT INTO public.automation_executions (
    id, automation_id, status, started_at, completed_at, duration_ms,
    input_data, output_data, error_message, triggered_by
)
VALUES
    -- Acme Chatbot: successful run
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

    -- Acme Chatbot: previous successful run
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

    -- GlobalTech Invoice Processor: successful run
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

    -- GlobalTech Data Sync: failed run
    ('ex222222-0000-0000-0000-000000000002',
     'au222222-0000-0000-0000-000000000002',
     'error',
     NOW() - INTERVAL '8 hours',
     NOW() - INTERVAL '8 hours' + INTERVAL '35 seconds',
     35000,
     '{"records_to_sync": 843}'::jsonb,
     NULL,
     'Connection timeout to billing API after 3 retries. Last attempt: rate limit exceeded.',
     'schedule')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. automation_requests (3 requests: various urgencies and statuses)
-- =============================================================================

INSERT INTO public.automation_requests (
    id, organization_id, template_id, user_id,
    title, description, urgency, status, notes
)
VALUES
    -- Acme: pending normal urgency request
    ('rq111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt000003-0000-0000-0000-000000000002',
     'a1111111-1111-1111-1111-111111111111',
     'Lead Scoring for Website Visitors',
     'We want to automatically score leads that fill out our contact form based on company size, industry, and behavior on the site. Currently doing this manually and it takes 2 hours per week.',
     'normal',
     'pending',
     NULL),

    -- Acme: completed request
    ('rq111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'tt000001-0000-0000-0000-000000000002',
     'a2222222-2222-2222-2222-222222222222',
     'Email Auto-Responder for Support',
     'Set up auto-responses for our support@acmecorp.com inbox with acknowledgment and estimated response times.',
     'low',
     'completed',
     'Implemented and deployed. Auto-responder live as of last week.'),

    -- GlobalTech: urgent request
    ('rq222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     NULL,
     'b1111111-1111-1111-1111-111111111111',
     'Emergency Alert System for API Downtime',
     'Our main product API goes down occasionally and we only find out when customers complain. We need real-time monitoring with alerts to Slack and PagerDuty when downtime is detected. This is costing us SLA credits.',
     'urgent',
     'in_review',
     'Customer flagged this as blocking a contract renewal.')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 9. subscriptions (1 per org)
-- =============================================================================

INSERT INTO public.subscriptions (
    id, organization_id, plan, status, billing_cycle,
    current_period_start, current_period_end
)
VALUES
    -- Acme Corp: pro plan
    ('su111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'pro', 'active', 'monthly',
     NOW() - INTERVAL '15 days',
     NOW() + INTERVAL '15 days'),

    -- GlobalTech: starter plan
    ('su222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'starter', 'active', 'monthly',
     NOW() - INTERVAL '8 days',
     NOW() + INTERVAL '22 days')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. chat_messages (5 messages: client-AIDEAS conversations in both orgs)
-- =============================================================================

INSERT INTO public.chat_messages (id, organization_id, sender_id, sender_type, content, created_at)
VALUES
    -- Acme Corp conversation: 3 messages
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

    -- GlobalTech conversation: 2 messages
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
     NOW() - INTERVAL '6 hours 30 minutes')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 11. notifications (4 notifications: mixed types and read/unread)
-- =============================================================================

INSERT INTO public.notifications (
    id, organization_id, user_id, type, title, message, is_read, read_at, link, created_at
)
VALUES
    -- Alice: action_required (unread) — chatbot incident
    ('nt111111-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'action_required',
     'Chatbot Incident Report Ready',
     'The incident report for this morning''s chatbot connectivity issue is ready for your review.',
     false, NULL,
     '/dashboard/chat',
     NOW() - INTERVAL '1 hour'),

    -- Alice: success (read) — subscription upgraded
    ('nt111111-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'a1111111-1111-1111-1111-111111111111',
     'success',
     'Subscription Upgraded to Pro',
     'Your organization has been upgraded to the Pro plan. New automation slots are now available.',
     true, NOW() - INTERVAL '14 days',
     '/dashboard/billing',
     NOW() - INTERVAL '15 days'),

    -- Carol: warning (unread) — data sync failure
    ('nt222222-0000-0000-0000-000000000001',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'warning',
     'Data Sync Failed — Action Required',
     'The GlobalTech Data Sync automation failed during last night''s run. Our team is investigating. Check the chat for updates.',
     false, NULL,
     '/dashboard/automations',
     NOW() - INTERVAL '7 hours 30 minutes'),

    -- Carol: info (read) — new team member
    ('nt222222-0000-0000-0000-000000000002',
     'bbbbbbbb-0000-0000-0000-000000000001',
     'b1111111-1111-1111-1111-111111111111',
     'info',
     'Dave Wilson Joined Your Organization',
     'Dave Wilson has accepted the invitation and joined GlobalTech as a viewer.',
     true, NOW() - INTERVAL '6 days',
     '/dashboard/team',
     NOW() - INTERVAL '7 days')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 12. invitations (1 pending invitation for Acme Corp)
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
     NULL)

ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ===========================================
-- END OF SEED DATA
-- ===========================================
-- Summary:
--   auth.users:            5 (Alice, Bob, Carol, Dave, Dev)
--   auth.identities:       5
--   organizations:         2 (Acme Corp, GlobalTech)
--   organization_members:  5
--   automation_templates:  8
--   automations:           6 (active/paused/draft/active/failed/pending_review)
--   automation_executions: 4 (2 success, 1 success, 1 error)
--   automation_requests:   3 (pending/completed/in_review)
--   subscriptions:         2
--   chat_messages:         5
--   notifications:         4
--   invitations:           1
-- ===========================================
