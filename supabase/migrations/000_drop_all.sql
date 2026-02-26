-- ===========================================
-- DROP ALL TABLES - Clean Start
-- ===========================================
-- WARNING: This will delete ALL data!
-- Run this before 001_initial_schema.sql
-- ===========================================

-- Drop policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON automation_templates;
DROP POLICY IF EXISTS "Users can view org automations" ON automations;
DROP POLICY IF EXISTS "Users can view org executions" ON automation_executions;
DROP POLICY IF EXISTS "Users can view org requests" ON automation_requests;
DROP POLICY IF EXISTS "Users can view org subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view org invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view org tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view ticket messages" ON support_messages;

-- Drop triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_org_members_updated_at ON organization_members;
DROP TRIGGER IF EXISTS update_templates_updated_at ON automation_templates;
DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
DROP TRIGGER IF EXISTS update_requests_updated_at ON automation_requests;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON support_tickets;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS automation_requests CASCADE;
DROP TABLE IF EXISTS automation_executions CASCADE;
DROP TABLE IF EXISTS automations CASCADE;
DROP TABLE IF EXISTS automation_templates CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ===========================================
-- DONE - Now run 001_initial_schema.sql
-- ===========================================
