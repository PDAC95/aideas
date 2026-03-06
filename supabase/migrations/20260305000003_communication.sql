-- =============================================================================
-- Communication Migration
-- Phase 02: Database Schema
-- Tables: chat_messages, notifications, invitations
-- =============================================================================

-- ---------------------------------------------------------------------------
-- chat_messages
-- Client-to-AIDEAS support channel — one per organization
-- Hybrid write: client users can INSERT; AIDEAS side uses service_role
-- Realtime enabled for live chat experience
-- Immutable: no updated_at, no deleted_at (per CONTEXT.md v1 constraints)
-- ---------------------------------------------------------------------------

CREATE TABLE public.chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES public.profiles(id),  -- nullable (AIDEAS-side messages may not have a user id)
    sender_type     TEXT NOT NULL
                        CHECK (sender_type IN ('client', 'aideas')),
    content         TEXT NOT NULL,  -- text-only for v1 (no file attachments per CONTEXT.md)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No updated_at or deleted_at — chat messages are immutable (per CONTEXT.md)
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can read their org's chat messages
CREATE POLICY "chat_messages_select_org_members"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = chat_messages.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- INSERT: client users can send messages for their own org
-- WITH CHECK verifies: sender_type is 'client', sender_id matches auth.uid(), and user is org member
-- AIDEAS-side messages (sender_type = 'aideas') are sent via service_role
CREATE POLICY "chat_messages_insert_clients"
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_type = 'client'
        AND sender_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = chat_messages.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- No UPDATE/DELETE policies — messages are immutable

CREATE INDEX idx_chat_messages_organization_id ON public.chat_messages (organization_id);
CREATE INDEX idx_chat_messages_created_at      ON public.chat_messages (created_at);

-- ---------------------------------------------------------------------------
-- Enable Realtime on chat_messages
-- Per CONTEXT.md: Realtime enabled ONLY on chat_messages
-- Notifications and other changes via polling/page load
-- ---------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ---------------------------------------------------------------------------
-- notifications
-- User-scoped — created by service_role, read/updated by recipient user
-- No deleted_at — old notifications are marked read, never soft-deleted
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.profiles(id),  -- notification recipient
    type            TEXT NOT NULL
                        CHECK (type IN ('info', 'warning', 'success', 'action_required')),  -- per CONTEXT.md
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    link            TEXT,  -- optional URL to navigate to when notification is clicked
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No deleted_at — notifications are never soft-deleted; old ones are just marked read
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only see their own notifications
CREATE POLICY "notifications_select_own"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- UPDATE: users can mark their own notifications as read (update is_read and read_at)
CREATE POLICY "notifications_update_own"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- No INSERT/DELETE policies — service_role creates and manages notifications

CREATE INDEX idx_notifications_organization_id   ON public.notifications (organization_id);
CREATE INDEX idx_notifications_user_id           ON public.notifications (user_id);
CREATE INDEX idx_notifications_user_id_is_read   ON public.notifications (user_id, is_read);

-- ---------------------------------------------------------------------------
-- invitations
-- Org-scoped — created by service_role on behalf of admins
-- Token-based acceptance flow — expires after set duration (typically 7 days)
-- No deleted_at — invitations expire, not soft-deleted
-- ---------------------------------------------------------------------------

CREATE TABLE public.invitations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    role            TEXT NOT NULL DEFAULT 'viewer'
                        CHECK (role IN ('admin', 'operator', 'viewer')),
    token           TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),  -- 64-char hex token
    invited_by      UUID NOT NULL REFERENCES public.profiles(id),
    expires_at      TIMESTAMPTZ NOT NULL,  -- application sets, typically NOW() + INTERVAL '7 days'
    accepted_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No deleted_at — invitations expire, not soft-deleted
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can see pending invitations for their org
CREATE POLICY "invitations_select_org_members"
    ON public.invitations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = invitations.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );

-- No INSERT/UPDATE/DELETE policies — service_role manages all invitation lifecycle

CREATE INDEX idx_invitations_token           ON public.invitations (token);
CREATE INDEX idx_invitations_organization_id ON public.invitations (organization_id);
CREATE INDEX idx_invitations_email           ON public.invitations (email);
