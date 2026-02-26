-- ===========================================
-- FIX RLS POLICIES - Remove infinite recursion
-- ===========================================
-- Run this in Supabase SQL Editor
-- ===========================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can view org automations" ON automations;
DROP POLICY IF EXISTS "Users can view org executions" ON automation_executions;
DROP POLICY IF EXISTS "Users can view org requests" ON automation_requests;
DROP POLICY IF EXISTS "Users can view org subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view org invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view org tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view ticket messages" ON support_messages;

-- ===========================================
-- RECREATE POLICIES WITHOUT RECURSION
-- ===========================================

-- Organization members - simple check, no subquery to self
CREATE POLICY "Members can view org members" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

-- Organizations - join through organization_members
CREATE POLICY "Members can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Automations
CREATE POLICY "Users can view org automations" ON automations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = automations.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Executions
CREATE POLICY "Users can view org executions" ON automation_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM automations
            JOIN organization_members ON organization_members.organization_id = automations.organization_id
            WHERE automations.id = automation_executions.automation_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Requests
CREATE POLICY "Users can view org requests" ON automation_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = automation_requests.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Subscriptions
CREATE POLICY "Users can view org subscription" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = subscriptions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Invoices
CREATE POLICY "Users can view org invoices" ON invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = invoices.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Support tickets
CREATE POLICY "Users can view org tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = support_tickets.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Support messages
CREATE POLICY "Users can view ticket messages" ON support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            JOIN organization_members ON organization_members.organization_id = support_tickets.organization_id
            WHERE support_tickets.id = support_messages.ticket_id
            AND organization_members.user_id = auth.uid()
            AND support_messages.is_internal = false
        )
    );

-- ===========================================
-- ADD INSERT/UPDATE POLICIES FOR USERS TABLE
-- ===========================================

-- Allow users to insert their own record
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- DONE
-- ===========================================
