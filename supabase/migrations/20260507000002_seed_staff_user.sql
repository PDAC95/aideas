-- =============================================================================
-- Dev-only seed: create a dedicated staff user (ops@aideas.com) and grant
-- super_admin platform_staff. Kept separate from customer demo users so
-- staff and customer auth are not conflated during testing.
--
-- Credentials (DEV ONLY): ops@aideas.com / Password123
--
-- Idempotent: ON CONFLICT DO NOTHING on every insert.
-- =============================================================================

-- 1. Create the auth.users row
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'ops@aideas.com',
    crypt('Password123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Ops Admin", "first_name": "Ops", "last_name": "Admin"}'::jsonb,
    NOW(), NOW(), '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the auth.identities row so the email/password provider works
INSERT INTO auth.identities (
    provider_id, user_id, id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '{"sub":"b0000000-0000-0000-0000-000000000001","email":"ops@aideas.com"}'::jsonb,
    'email',
    NOW(), NOW(), NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- 3. Grant platform_staff super_admin (the actual gate that lets /admin/* load)
INSERT INTO public.platform_staff (user_id, role)
VALUES ('b0000000-0000-0000-0000-000000000001'::uuid, 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- Note: We deliberately do NOT create a profile or organization_member row
-- for this user. Staff users don't belong to a customer org — they have
-- cross-org bypass via is_platform_staff(auth.uid()) instead.
