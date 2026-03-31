-- =============================================================================
-- User Registration Migration
-- Phase 04: User Registration
-- Extends profiles, adds owner role, rewrites handle_new_user trigger for
-- atomic org creation on every signup (email and OAuth).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add columns to profiles
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name  TEXT,
    ADD COLUMN IF NOT EXISTS org_id     UUID REFERENCES public.organizations(id);

-- ---------------------------------------------------------------------------
-- 2. Update organization_members role CHECK constraint to include 'owner'
-- ---------------------------------------------------------------------------

ALTER TABLE public.organization_members
    DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_role_check
        CHECK (role IN ('owner', 'admin', 'operator', 'viewer'));

-- ---------------------------------------------------------------------------
-- 3. Slug generation function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_org_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    candidate TEXT;
    counter   INT := 0;
BEGIN
    -- Convert to lowercase, replace non-alphanumeric with hyphens, trim
    base_slug := LOWER(name);
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);

    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'org';
    END IF;

    -- Truncate to 80 chars to leave room for counter suffix
    base_slug := LEFT(base_slug, 80);

    candidate := base_slug;

    -- Deduplicate: loop until unique
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug = candidate) THEN
            RETURN candidate;
        END IF;
        counter := counter + 1;
        candidate := base_slug || '-' || counter;
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Replace handle_new_user trigger function
--    Atomically creates org + profile + membership on every auth.users INSERT
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_company_name  TEXT;
    v_first_name    TEXT;
    v_last_name     TEXT;
    v_full_name     TEXT;
    v_slug          TEXT;
    v_org_id        UUID;
BEGIN
    -- Extract metadata with safe fallbacks
    v_company_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data ->> 'company_name'), ''),
        'My Organization'
    );
    v_first_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '')), '');
    v_last_name  := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')), '');

    -- Build full_name from parts, falling back to raw full_name metadata (OAuth)
    v_full_name := NULLIF(TRIM(CONCAT_WS(' ', v_first_name, v_last_name)), '');
    IF v_full_name IS NULL THEN
        v_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '');
    END IF;

    -- Generate unique slug for the new organization
    v_slug := public.generate_org_slug(v_company_name);

    -- Create the organization
    INSERT INTO public.organizations (name, slug)
    VALUES (v_company_name, v_slug)
    RETURNING id INTO v_org_id;

    -- Create the profile
    INSERT INTO public.profiles (id, email, full_name, first_name, last_name, org_id)
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_first_name,
        v_last_name,
        v_org_id
    );

    -- Create the membership with owner role
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, NEW.id, 'owner');

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: % %',
        NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

-- Note: seed data updates (profiles first_name/last_name/org_id and
-- organization_members owner role) are handled in supabase/seed.sql
-- since migrations run before seed data is inserted.
