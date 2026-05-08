-- =============================================================================
-- Phase 21: Clients Admin
-- RPC: get_admin_org_members(p_organization_id UUID)
-- Purpose: Surface auth.users.last_sign_in_at alongside organization_members +
--          profiles fields so the admin /admin/clients/[id] Members tab can
--          render Email / Full name / Role / Last login / Joined in a single
--          Supabase JS RPC call.
--
-- Strategy: SECURITY DEFINER so the function can read auth.users (which is
--           normally not RLS-readable from authenticated callers). Inside the
--           function we explicitly check is_platform_staff(auth.uid()) — only
--           platform_staff can invoke this; non-staff get an empty result set.
--           STABLE so the planner can hoist within a query. SET search_path=''
--           prevents schema-hijack attacks.
--
-- Idempotency: CREATE OR REPLACE FUNCTION + DROP FUNCTION IF EXISTS for any
--              prior signature mismatch.
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_admin_org_members(UUID);

CREATE OR REPLACE FUNCTION public.get_admin_org_members(p_organization_id UUID)
RETURNS TABLE (
    user_id          UUID,
    email            TEXT,
    full_name        TEXT,
    role             TEXT,
    is_active        BOOLEAN,
    joined_at        TIMESTAMPTZ,
    last_sign_in_at  TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT
        om.user_id,
        p.email,
        p.full_name,
        om.role,
        om.is_active,
        om.joined_at,
        u.last_sign_in_at
    FROM public.organization_members om
    INNER JOIN public.profiles p ON p.id = om.user_id
    INNER JOIN auth.users u       ON u.id = om.user_id
    WHERE om.organization_id = p_organization_id
      AND public.is_platform_staff((SELECT auth.uid()))
    ORDER BY om.is_active DESC, om.joined_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_org_members(UUID) TO authenticated;

-- =============================================================================
-- End of admin org members view migration
-- =============================================================================
