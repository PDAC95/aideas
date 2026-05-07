-- =============================================================================
-- Phase 19: Requests Inbox
-- ALTER: automations
-- Purpose: Add nullable setup_notes column so the approve-request server
--          action (Plan 19-03) can persist the customer's custom_requirements
--          text (which lives in automation_requests.description) onto the
--          newly-created automation row. Without this column the context is
--          lost the moment the request is later archived.
-- =============================================================================

-- Idempotent: ADD COLUMN IF NOT EXISTS so a re-run on an environment that
-- already has the column noops cleanly.
ALTER TABLE public.automations
    ADD COLUMN IF NOT EXISTS setup_notes TEXT;

-- No CHECK constraint, no default. NULL means "no operator notes yet" which
-- is the correct sentinel for automations not created via the approve path.
COMMENT ON COLUMN public.automations.setup_notes IS
    'Free-form operator notes attached at approval time, populated from the originating automation_request''s custom_requirements/description text. NULL for automations created outside the approve-request flow.';
