-- ===========================================
-- AIDEAS Seed Data
-- ===========================================
-- Run after initial migration to populate demo data

-- ===========================================
-- AUTOMATION TEMPLATES
-- ===========================================

INSERT INTO automation_templates (name, slug, description, category, icon, features, use_cases, pricing_tier, is_active, is_featured, sort_order)
VALUES
-- Customer Service
('AI Chatbot', 'ai-chatbot', 'Intelligent chatbot that handles customer inquiries 24/7', 'customer_service', 'message-circle',
 ARRAY['Natural language understanding', 'Multi-language support', 'Sentiment analysis', 'Escalation to humans'],
 ARRAY['Answer FAQs automatically', 'Qualify leads before handoff', 'Provide instant support'],
 'starter', true, true, 1),

('Auto-Response Email', 'auto-response-email', 'Automatically respond to common email inquiries', 'customer_service', 'mail',
 ARRAY['Template-based responses', 'Smart categorization', 'Follow-up scheduling'],
 ARRAY['Handle support emails', 'Acknowledge orders', 'Send confirmations'],
 'starter', true, false, 2),

('Ticket Classification', 'ticket-classification', 'Automatically classify and route support tickets', 'customer_service', 'tag',
 ARRAY['AI-powered categorization', 'Priority detection', 'Auto-assignment'],
 ARRAY['Route tickets to right team', 'Prioritize urgent issues', 'Reduce response time'],
 'pro', true, false, 3),

-- Documents
('Invoice Processing', 'invoice-processing', 'Extract data from invoices automatically', 'documents', 'file-text',
 ARRAY['OCR extraction', 'Data validation', 'ERP integration', 'Multi-format support'],
 ARRAY['Process vendor invoices', 'Reconcile payments', 'Automate data entry'],
 'pro', true, true, 4),

('Contract Analysis', 'contract-analysis', 'Analyze contracts and extract key terms', 'documents', 'file-search',
 ARRAY['Key term extraction', 'Risk identification', 'Comparison tools'],
 ARRAY['Review vendor contracts', 'Track renewal dates', 'Identify obligations'],
 'business', true, false, 5),

('Report Generation', 'report-generation', 'Generate reports from your data automatically', 'documents', 'bar-chart-2',
 ARRAY['Custom templates', 'Scheduled generation', 'Multiple formats'],
 ARRAY['Weekly sales reports', 'Monthly performance summaries', 'Executive dashboards'],
 'pro', true, false, 6),

-- Marketing
('Content Generation', 'content-generation', 'Generate marketing content with AI', 'marketing', 'edit-3',
 ARRAY['Blog posts', 'Social media content', 'Email campaigns', 'Brand voice matching'],
 ARRAY['Scale content production', 'Maintain consistency', 'Save writer time'],
 'pro', true, true, 7),

('Social Media Scheduler', 'social-media-scheduler', 'Automate social media posting', 'marketing', 'share-2',
 ARRAY['Multi-platform support', 'Best time optimization', 'Content calendar'],
 ARRAY['Consistent posting', 'Engage audience', 'Track performance'],
 'starter', true, false, 8),

('Lead Scoring', 'lead-scoring', 'Score and prioritize leads automatically', 'marketing', 'target',
 ARRAY['Behavior tracking', 'Demographic scoring', 'CRM integration'],
 ARRAY['Focus on hot leads', 'Improve conversion', 'Optimize sales time'],
 'pro', true, false, 9),

-- Sales
('Lead Follow-up', 'lead-follow-up', 'Automate lead nurturing sequences', 'sales', 'user-plus',
 ARRAY['Personalized sequences', 'A/B testing', 'Engagement tracking'],
 ARRAY['Never miss a follow-up', 'Nurture cold leads', 'Scale outreach'],
 'pro', true, true, 10),

('Proposal Generator', 'proposal-generator', 'Generate customized proposals automatically', 'sales', 'file-plus',
 ARRAY['Template library', 'Dynamic pricing', 'E-signature ready'],
 ARRAY['Speed up deal cycle', 'Ensure consistency', 'Track proposal status'],
 'business', true, false, 11),

('CRM Data Enrichment', 'crm-enrichment', 'Enrich CRM records with additional data', 'sales', 'database',
 ARRAY['Company data', 'Contact info', 'Social profiles'],
 ARRAY['Complete contact records', 'Better segmentation', 'Personalized outreach'],
 'pro', true, false, 12),

-- Operations
('Data Reconciliation', 'data-reconciliation', 'Reconcile data between systems automatically', 'operations', 'git-merge',
 ARRAY['Multi-source sync', 'Discrepancy detection', 'Auto-resolution'],
 ARRAY['Match bank statements', 'Sync inventories', 'Verify transactions'],
 'business', true, true, 13),

('Alert Monitoring', 'alert-monitoring', 'Monitor systems and send alerts', 'operations', 'bell',
 ARRAY['Custom thresholds', 'Multi-channel alerts', 'Escalation rules'],
 ARRAY['Prevent downtime', 'Catch anomalies early', 'Stay informed'],
 'starter', true, false, 14),

('Inventory Sync', 'inventory-sync', 'Sync inventory across multiple channels', 'operations', 'package',
 ARRAY['Real-time sync', 'Stock alerts', 'Multi-warehouse'],
 ARRAY['Prevent overselling', 'Optimize stock levels', 'Streamline fulfillment'],
 'pro', true, false, 15);

-- ===========================================
-- END OF SEED DATA
-- ===========================================
