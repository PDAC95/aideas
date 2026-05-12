-- =============================================================================
-- Phase 21: Clients Admin (gap closure)
-- ALTER FK: organization_notes.author_id → auth.users(id)
--
-- Purpose: organization_notes.author_id originally pointed to public.profiles(id),
--          but profiles is a customer-facing table. Platform staff users (like
--          super_admins) do not necessarily have a row in profiles, so the FK
--          insert fails for staff-authored notes. Author of an internal note is
--          a staff member, not a customer — the correct reference is auth.users.
--
-- Side effect: A SECURITY DEFINER RPC `get_admin_note_authors(uuid[])` is added
--              so the admin client detail query can resolve author email +
--              display name from auth.users without granting the admin client
--              direct read access to the auth schema.
--
-- Idempotency: Both the FK swap and the RPC creation are idempotent. The FK
--              constraint name is checked-then-dropped via DO block so re-runs
--              are safe even if the original constraint is already gone.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: Swap FK from public.profiles → auth.users
-- ---------------------------------------------------------------------------
-- The original CREATE TABLE inlined a FK with auto-generated name
-- (organization_notes_author_id_fkey). Drop whatever FK exists on author_id and
-- recreate against auth.users(id).
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    SELECT tc.constraint_name
      INTO fk_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = 'organization_notes'
       AND kcu.column_name = 'author_id'
     LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.organization_notes DROP CONSTRAINT %I', fk_name);
    END IF;
END$$;

ALTER TABLE public.organization_notes
    ADD CONSTRAINT organization_notes_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES auth.users(id)
    ON DELETE RESTRICT;

COMMENT ON COLUMN public.organization_notes.author_id IS
    'Staff user (auth.users.id) who authored the note. Not a profile — staff users do not necessarily have a public.profiles row.';

-- ---------------------------------------------------------------------------
-- Section 2: SECURITY DEFINER RPC to resolve author email/display name
-- ---------------------------------------------------------------------------
-- The /admin/clients/[id] Notes tab needs to display author email + display
-- name per note. Granting the admin client direct SELECT on auth.users is
-- excessive — instead, expose a narrow SECURITY DEFINER function that returns
-- only the fields needed and is gated by is_platform_staff.
DROP FUNCTION IF EXISTS public.get_admin_note_authors(UUID[]);

CREATE OR REPLACE FUNCTION public.get_admin_note_authors(
    p_user_ids UUID[]
)
RETURNS TABLE (
    user_id   UUID,
    email     TEXT,
    full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Gate on platform_staff. Anyone else gets an empty result set.
    IF NOT public.is_platform_staff(auth.uid()) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.email::TEXT AS email,
        COALESCE(
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'name',
            p.full_name
        ) AS full_name
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.id = ANY(p_user_ids);
END;
$$;

COMMENT ON FUNCTION public.get_admin_note_authors(UUID[]) IS
    'Resolve note authors (auth.users) to email + display name for the admin Notes tab. Gated by is_platform_staff; returns empty for non-staff callers.';

GRANT EXECUTE ON FUNCTION public.get_admin_note_authors(UUID[]) TO authenticated;

-- =============================================================================
-- End of organization_notes author FK swap migration
-- =============================================================================
