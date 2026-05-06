-- =============================================================================
-- Fix organizations RLS SELECT policy
-- Bug: om.organization_id = id resolved to om.id (self-join) instead of
-- organizations.id, causing the policy to always return false for
-- authenticated users. The service_role client bypasses RLS, so writes
-- worked but reads through the authenticated client returned empty.
-- =============================================================================

DROP POLICY IF EXISTS "organizations_select_members" ON public.organizations;

CREATE POLICY "organizations_select_members"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organizations.id
              AND om.user_id = (SELECT auth.uid())
              AND om.is_active = true
        )
    );
