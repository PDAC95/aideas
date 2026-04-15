# Phase 12: Settings - Research

**Researched:** 2026-04-15
**Domain:** Supabase Auth/Storage + Next.js Server Actions + next-intl cookie switching + RLS-aware writes
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page Structure**
- Single scrollable page with stacked cards (not tabs or sidebar)
- Three cards: Profile, Preferences, Security — all full width, same width
- Each card has its own Save button (independent form submissions)
- Toast notification (sonner/shadcn) on successful save
- Page title: simple "Settings" / "Configuracion" with subtitle — no user name in title

**Profile Card**
- Avatar displayed at top of card, form fields below
- Fields: Avatar upload area, Full Name (editable), Company Name (editable), Email (visible but not editable/disabled)
- Avatar click or "Change" button opens file picker
- Preview shown immediately after file selection, uploaded on card Save
- "Remove" button available to revert to default avatar
- Default avatar (no image): circle with user's initials on colored background
- File limits: 2MB max, JPG/PNG/WebP formats accepted

**Preferences Card**
- Language selector: dropdown/select (not toggle), options "English" and "Espanol"
- Language change applies instantly on selection (no Save needed) — updates next-intl cookie
- Hourly cost: numeric input with $ prefix, accepts decimals
- Hourly cost saved at organization level (organizations.settings JSONB)
- Only owner/admin roles can edit hourly cost
- Label explains: "Estimated hourly labor cost used to calculate automation value in Reports"

**Security Card**
- Single card with divider line between two sections: Change Password (top) and Active Sessions (bottom)
- Change Password: requires Current Password + New Password + Confirm New Password
- Password strength indicator bar (weak/medium/strong with red/yellow/green colors)
- OAuth users (Google login): hide Change Password section entirely, show only Active Sessions
- Active Sessions: show device/browser type, approximate location (country/city), last access time
- Current session marked with "Current" badge
- Single "Sign Out All Other Sessions" button (no per-session sign out)
- Confirmation modal before signing out all sessions (destructive action, red button)

### Claude's Discretion
- Toast library choice (sonner vs shadcn toast)
- Exact password strength algorithm/thresholds
- How to detect OAuth-only users vs email+password users
- Session geolocation data source (from Supabase Auth JWT or user-agent parsing)
- Avatar image compression/resizing before upload
- Exact responsive breakpoints for mobile layout

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETT-01 | User can upload and change profile avatar (Supabase Storage) | Storage upload via browser client + signed URL approach; bucket creation; `profiles.avatar_url` write via RLS-enabled authenticated UPDATE |
| SETT-02 | User can edit name and company name | `profiles` has `first_name`, `last_name`, `full_name` columns; `organizations.name` write requires service_role; server action pattern established |
| SETT-03 | User can switch language (Español/English) | `NEXT_LOCALE` cookie already drives next-intl; server action sets cookie + client calls `router.refresh()` |
| SETT-04 | User can set hourly cost for value estimation | `organizations.settings` JSONB; **no authenticated UPDATE policy** on `organizations` — must use service_role in server action |
| SETT-05 | User can change password | `supabase.auth.updateUser({ password, nonce })` with `supabase.auth.reauthenticate()` for current-password verification; detect OAuth via `user.identities` |
| SETT-06 | User can see active sessions and close all other sessions | `supabase.auth.signOut({ scope: 'others' })`; session list from `auth.sessions` requires service_role admin query or simplified approach |
</phase_requirements>

---

## Summary

Phase 12 builds a settings page with three independent card forms. All required capabilities are available through the existing tech stack: Supabase Auth (`updateUser`, `reauthenticate`, `signOut` with scopes), Supabase Storage (avatars bucket), and next-intl cookie-based locale. No new npm packages are required — the project already has React Hook Form, Zod, Lucide, and Radix UI.

The most significant architectural constraint is that `organizations` table has **no authenticated UPDATE RLS policy** — only service_role can write to it. This means the hourly cost save (SETT-04) and potentially the company name update (SETT-02) must go through a server action that uses `SUPABASE_SERVICE_ROLE_KEY`. The `profiles` table does have an authenticated UPDATE policy, so profile name and avatar_url updates can use the anon client from a server action.

The avatar upload (SETT-01) requires creating a Storage bucket named `avatars` via SQL migration, then uploading directly from the browser client (not through a server action) to avoid Next.js's 1MB server action body size limit. The browser client uploads to Storage, the server action only saves the resulting public URL back to `profiles.avatar_url`.

**Primary recommendation:** Use three independent server actions (one per card), browser-client storage upload for avatar, service_role for org writes, and the existing custom toast pattern (useState/useEffect already established in billing-summary-card.tsx — no sonner needed).

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.95.0 | Auth (updateUser, reauthenticate, signOut) + Storage upload | Project standard |
| @supabase/ssr | ^0.8.0 | Server-side Supabase client | Project standard |
| react-hook-form | ^7.71.1 | Form state (all 3 cards) | Project standard |
| @hookform/resolvers | ^5.2.2 | Zod adapter for RHF | Project standard |
| zod | ^4.3.6 | Input validation schemas | Project standard |
| next-intl | ^4.8.3 | Locale cookie read/write | Project standard |
| radix-ui | ^1.4.3 | AlertDialog for session sign-out confirmation modal | Project standard |
| lucide-react | ^0.563.0 | Icons | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SUPABASE_SERVICE_ROLE_KEY | env var | Write to `organizations` (no authenticated UPDATE policy) | hourly_cost save, company name save |
| `cookies()` from next/headers | built-in | Set NEXT_LOCALE cookie in server action | Language switcher |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom useState toast | sonner | Sonner not installed; existing billing card pattern works fine |
| Custom useState toast | shadcn Toast | Not installed either; would require adding new component |
| Browser-side upload | Server action upload | Server actions have 1MB body limit; browser client avoids it |
| Service-role for org writes | Authenticated UPDATE policy | No policy exists; adding one is a schema change that needs a migration |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended File Structure
```
web/src/
├── app/(dashboard)/dashboard/settings/
│   └── page.tsx                         # RSC — fetches profile + org + session data
├── components/dashboard/
│   ├── settings-profile-card.tsx        # "use client" — avatar preview + name form
│   ├── settings-preferences-card.tsx    # "use client" — language select + hourly cost form
│   └── settings-security-card.tsx       # "use client" — password change + sessions
├── lib/
│   ├── actions/
│   │   └── settings.ts                  # 'use server' — all settings mutations
│   └── validations/
│       └── settings.ts                  # Zod schemas for each form
```

### Pattern 1: RSC Fetches Data, Passes to Client Cards

The page.tsx (RSC) fetches all data in parallel then passes it as props to each client card. This mirrors the existing reports/billing pattern.

```typescript
// Source: existing pattern from reports/page.tsx and billing/page.tsx
export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgId = await getOrgId(user.id)
  const [profileData, orgData, sessionData, t] = await Promise.all([
    fetchProfileData(user.id),
    fetchOrgData(orgId!),
    fetchSessionData(user.id),  // via service role
    getTranslations('dashboard.settings'),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1>{t('title')}</h1>
      <SettingsProfileCard user={user} profile={profileData} translations={...} />
      <SettingsPreferencesCard org={orgData} role={memberRole} translations={...} />
      <SettingsSecurityCard sessions={sessionData} isOAuthOnly={...} translations={...} />
    </div>
  )
}
```

### Pattern 2: Service Role for Organization Writes

`organizations` has no authenticated UPDATE policy. Use the admin client (service_role) in server actions for org writes.

```typescript
// Source: established pattern from lib/actions/auth.ts getAdminClient()
'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function saveHourlyCost(orgId: string, hourlyCost: number) {
  const supabase = await createClient() // anon client for auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }
  
  // Verify org membership + role (owner/admin only)
  const admin = getAdminClient()
  const { error } = await admin
    .from('organizations')
    .update({ settings: admin.rpc('jsonb_set_key', ...) })  // or JS-side merge
    .eq('id', orgId)
  
  return error ? { error: error.message } : { success: true }
}
```

**JSONB merge pattern:** Fetch current settings, merge in JavaScript, update:
```typescript
const { data: org } = await admin.from('organizations').select('settings').eq('id', orgId).single()
const newSettings = { ...(org?.settings ?? {}), hourly_cost: hourlyCost }
await admin.from('organizations').update({ settings: newSettings }).eq('id', orgId)
```

### Pattern 3: Browser Client Avatar Upload (bypass 1MB limit)

Next.js server actions have a 1MB body limit. Avatar upload goes browser-client → Supabase Storage directly. The server action only saves the resulting URL.

```typescript
// In settings-profile-card.tsx ("use client")
import { createClient } from '@/lib/supabase/client'

async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`  // user-scoped path
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  
  if (error) throw error
  
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

// Then call server action to persist URL:
const publicUrl = await uploadAvatar(file, user.id)
await saveAvatarUrl(publicUrl)  // server action → profiles.avatar_url
```

### Pattern 4: Language Switch — Cookie + Router Refresh

The existing `i18n/request.ts` reads `NEXT_LOCALE` cookie. A server action sets the cookie; the client component calls `router.refresh()` to re-render with new locale.

```typescript
// lib/actions/settings.ts
'use server'
import { cookies } from 'next/headers'

export async function switchLocale(locale: 'en' | 'es') {
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    httpOnly: false,  // client-readable for language selector initial state
    maxAge: 60 * 60 * 24 * 365,  // 1 year
    sameSite: 'lax',
  })
}

// In settings-preferences-card.tsx ("use client")
import { useRouter } from 'next/navigation'
const router = useRouter()

async function handleLocaleChange(locale: string) {
  await switchLocale(locale as 'en' | 'es')
  router.refresh()  // re-renders RSC tree with new locale
}
```

### Pattern 5: Password Change with Current Password Verification

`supabase.auth.updateUser({ password })` accepts `nonce` for reauthentication. The flow is:
1. Call `supabase.auth.reauthenticate()` → sends OTP to user's email
2. OR use `supabase.auth.updateUser({ password: newPassword, nonce: currentPassword })` directly

**Simpler approach available:** `supabase-js` v2.102.0+ supports `currentPassword` parameter directly. Our project uses `@supabase/supabase-js ^2.95.0`. Need to verify exact version in lockfile.

**Reliable approach (verified):** Sign in with current password first, then update:
```typescript
// Pattern: verify current password by attempting signInWithPassword
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'no_session' }
  
  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'wrong_current_password' }
  
  // Update to new password
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: 'update_failed' }
  
  return { success: true }
}
```

### Pattern 6: Detect OAuth-Only Users

Hide the Change Password section if user has no email identity.

```typescript
// Source: Supabase docs on identities
// user.identities is available from supabase.auth.getUser() server-side
const isOAuthOnly = !user.identities?.some(id => id.provider === 'email')

// Pass as prop to SecurityCard:
<SettingsSecurityCard isOAuthOnly={isOAuthOnly} ... />
```

### Pattern 7: Sessions — Sign Out Others

Supabase Auth supports `signOut({ scope: 'others' })` which terminates all sessions except the current one. The `auth.sessions` table is not directly queryable without service_role.

**Session listing approach:** The Auth API does not expose a public `listSessions()` method. Options:
1. Use service_role to query `auth.sessions` directly (requires raw SQL via `admin.rpc()` or `admin.from('auth.sessions')`)
2. Show a simplified UI: "You have an active session on this device" with just the sign-out-others button, without listing individual sessions
3. Use `supabase.auth.getSession()` to show current session info only

**Recommended:** Option 2 (simplified) for v1.1. Session listing requires querying internal `auth.sessions` which is not exposed via the JS client without raw SQL. Show current session data from JWT (user-agent, approximate time) and a single "Sign Out All Other Sessions" button.

```typescript
// Sign out all other sessions — browser client action
import { createClient } from '@/lib/supabase/client'

async function signOutOtherSessions() {
  const supabase = createClient()
  await supabase.auth.signOut({ scope: 'others' })
}
```

### Pattern 8: Confirmation Modal for Destructive Action

Use `radix-ui` AlertDialog (already in the project — used in Phase 9 for cancel automation).

```typescript
// Source: existing pattern from web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx
import * as AlertDialog from 'radix-ui/react-alert-dialog'
```

### Pattern 9: Custom Toast (no new library)

The project uses a `useState/useEffect` toast already in `billing-summary-card.tsx`. Replicate the same pattern for settings cards.

```typescript
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

useEffect(() => {
  if (!toast) return
  const timer = setTimeout(() => setToast(null), 3000)
  return () => clearTimeout(timer)
}, [toast])
```

### Pattern 10: Supabase Storage Bucket (Migration)

A new migration file must create the `avatars` bucket with proper RLS policies.

```sql
-- New migration: 20260415000001_avatars_storage.sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own avatar (path starts with their user_id)
CREATE POLICY "avatars_upload_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update their own avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read access (avatars are public URLs)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Anti-Patterns to Avoid

- **Server action avatar upload:** Body limit is 1MB. Upload must happen from browser client.
- **Direct authenticated write to `organizations`:** No RLS policy exists. Will silently fail or error. Must use service_role.
- **Calling `useTranslations` in client components:** Project pattern is to pass translation objects as props from RSC. Follow the same approach.
- **Setting `NEXT_LOCALE` without `router.refresh()`:** Cookie is set server-side but the page won't re-render until router.refresh() is called client-side.
- **Using `supabase.auth.admin` namespace from browser:** Admin methods require service_role key, which must never be exposed client-side. Session queries must be in server actions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password strength bar | Custom scoring logic | Reuse existing `PasswordStrengthBar` component from `@/components/auth/password-strength-bar` | Already built with weak/medium/strong thresholds |
| File type validation | Custom MIME check | Native `<input accept="image/jpeg,image/png,image/webp">` + Zod `.refine()` | Browser handles picker filtering; Zod catches edge cases |
| Confirmation modal | Custom dialog | `radix-ui/react-alert-dialog` (already in project, used in Phase 9) | Accessible, project standard |
| Toast notification | New library | Existing `useState/useEffect` pattern from `billing-summary-card.tsx` | No new dependency needed |
| Org-scoped auth check | Custom role fetcher | Reuse `getOrgId()` from `@/lib/dashboard/queries` + `organization_members` role query | Already established |
| Avatar URL generation | Custom URL building | `supabase.storage.from('avatars').getPublicUrl(path)` | Official SDK method |

**Key insight:** The project already has all building blocks. This phase is integration, not invention.

---

## Common Pitfalls

### Pitfall 1: Organization Write Silently Failing
**What goes wrong:** Developer uses anon Supabase client to update `organizations.settings`. The operation returns no error on the client but no rows are updated (RLS policy rejects it).
**Why it happens:** `organizations` has no authenticated UPDATE or INSERT policy — only SELECT. Writes are service_role only (documented in the migration file).
**How to avoid:** Always use `getAdminClient()` (service_role) for org writes in server actions. Check with `{ count: 'exact' }` to verify the update actually affected a row.
**Warning signs:** Settings save says "success" but hourly cost doesn't change on reports page.

### Pitfall 2: Server Action Avatar Upload Fails Over 1MB
**What goes wrong:** Avatar upload through server action fails or is rejected for files approaching the limit.
**Why it happens:** Next.js server actions have a 1MB body size limit by default.
**How to avoid:** Upload directly from browser client (`createClient()` from `@/lib/supabase/client`). Only send the resulting public URL to a server action.
**Warning signs:** Upload succeeds for small files but fails for realistic photos.

### Pitfall 3: Language Switch Doesn't Reflect Until Full Reload
**What goes wrong:** User selects language, cookie is set, but UI still shows old language.
**Why it happens:** Server Components don't re-execute until the router triggers a fresh render.
**How to avoid:** After the server action sets the cookie, call `router.refresh()` on the client. This triggers Next.js to re-fetch all RSC data including re-reading the locale cookie.
**Warning signs:** Language change works after hard reload but not immediately.

### Pitfall 4: Password Change for OAuth Users
**What goes wrong:** Google OAuth users see and attempt to use the Change Password form; operation fails confusingly.
**Why it happens:** OAuth users may not have an email identity in `user.identities`.
**How to avoid:** Check `user.identities?.some(id => id.provider === 'email')` server-side. Pass `isOAuthOnly` prop to the Security card; render only the Active Sessions section.
**Warning signs:** OAuth users get cryptic error when trying to change password.

### Pitfall 5: `full_name` vs `first_name`/`last_name` Mismatch
**What goes wrong:** Profile name update sets `full_name` but leaves `first_name`/`last_name` stale (or vice versa), causing inconsistent display across the dashboard.
**Why it happens:** `profiles` has both `full_name` TEXT and `first_name`/`last_name` TEXT columns (added in Phase 4 migration). The dashboard header uses `first_name` from user metadata.
**How to avoid:** When saving name, update both `full_name = first_name + ' ' + last_name` AND `first_name`, `last_name` individually in the same UPDATE.
**Warning signs:** Settings shows "John Doe" but dashboard header shows "John" from a stale field.

### Pitfall 6: Avatar URL Cache Busting
**What goes wrong:** User uploads new avatar, old image still shows (browser cache).
**Why it happens:** Same file path (`userId/avatar.ext`) is reused; browser caches by URL.
**How to avoid:** Append a timestamp or version query param to the public URL when displaying: `avatarUrl + '?v=' + Date.now()`. Or use a unique filename per upload (include timestamp in path).
**Warning signs:** Avatar preview updates but sidebar/header still shows old image.

### Pitfall 7: Hourly Cost Role Guard Not Enforced Server-Side
**What goes wrong:** A viewer-role user modifies the hourly cost via the form (bypassing disabled UI).
**Why it happens:** Role guard only in UI (input disabled). Server action doesn't verify role.
**How to avoid:** In the `saveHourlyCost` server action, fetch the user's role from `organization_members` and return `{ error: 'unauthorized' }` if role is not `owner` or `admin`.

---

## Code Examples

### Profile Data Fetch (Server)
```typescript
// Source: existing queries.ts pattern + profile schema from migrations
async function fetchProfileData(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, full_name, avatar_url, email')
    .eq('id', userId)
    .single()
  return data
}
```

### Org Data Fetch + Role Check (Server)
```typescript
async function fetchOrgAndRole(userId: string, orgId: string) {
  const supabase = await createClient()
  const [orgResult, memberResult] = await Promise.all([
    supabase.from('organizations').select('name, settings').eq('id', orgId).single(),
    supabase.from('organization_members').select('role').eq('user_id', userId).eq('organization_id', orgId).single(),
  ])
  return {
    org: orgResult.data,
    role: memberResult.data?.role ?? 'viewer',
  }
}
```

### Profile Name Save (Server Action)
```typescript
// profiles table has authenticated UPDATE policy — use anon client
export async function saveProfileName(firstName: string, lastName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }
  
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, full_name: fullName })
    .eq('id', user.id)
  
  return error ? { error: error.message } : { success: true }
}
```

### Hourly Cost Save (Server Action — requires service_role)
```typescript
export async function saveHourlyCost(orgId: string, hourlyCost: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  // Role check
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()
  
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return { error: 'unauthorized' }
  }
  
  // Use admin client — no authenticated UPDATE policy on organizations
  const admin = getAdminClient()
  const { data: org } = await admin.from('organizations').select('settings').eq('id', orgId).single()
  const newSettings = { ...(org?.settings ?? {}), hourly_cost: hourlyCost }
  const { error } = await admin.from('organizations').update({ settings: newSettings }).eq('id', orgId)
  
  return error ? { error: error.message } : { success: true }
}
```

### Save Avatar URL (Server Action — after browser upload)
```typescript
export async function saveAvatarUrl(avatarUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }
  
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)
  
  return error ? { error: error.message } : { success: true }
}
```

### Sign Out Other Sessions (Browser Client)
```typescript
// Source: https://supabase.com/docs/guides/auth/signout
// scope: 'others' — terminates all sessions except current one
import { createClient } from '@/lib/supabase/client'

async function signOutOtherSessions() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut({ scope: 'others' })
  if (error) throw error
}
```

### PasswordStrengthBar Reuse (existing component)
```typescript
// Source: web/src/components/auth/password-strength-bar.tsx (already exists)
// Import directly — no new component needed
import { PasswordStrengthBar } from '@/components/auth/password-strength-bar'

// Usage in settings-security-card.tsx:
<PasswordStrengthBar password={watchedNewPassword} />
// Note: uses useTranslations('signup.passwordStrength') internally
// Translation keys 'weak', 'medium', 'strong' already in both en.json and es.json
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual JWT parsing for session info | `supabase.auth.getSession()` for current session | supabase-js v2 | Cleaner, avoids manual decode |
| Locale in URL path (`/en/dashboard`) | Cookie-based locale (`NEXT_LOCALE`) | Project design | No URL changes needed for locale switch |
| Image upload via API route | Direct browser → Supabase Storage | Next.js App Router | Avoids 1MB server action limit |
| Separate update for each profile field | Single UPDATE with all changed fields | Always | Fewer DB round-trips |

**No deprecated patterns identified** in this phase's scope.

---

## Open Questions

1. **Session listing detail level**
   - What we know: `supabase.auth.signOut({ scope: 'others' })` is confirmed. The `auth.sessions` table exists but requires raw SQL via service_role to query.
   - What's unclear: Whether the CONTEXT.md requirement ("show device/browser type, approximate location, last access time") is feasible without significant complexity (querying internal Supabase tables).
   - Recommendation: Implement simplified session UI for v1.1 — show current session from JWT claims (user-agent parsed in browser via `navigator.userAgent`, approx location via `Intl.DateTimeFormat().resolvedOptions().timeZone`) and the sign-out-others button. If the planner wants full session list, it requires a DB function + service_role query.

2. **`currentPassword` param availability in installed version**
   - What we know: `supabase-js ^2.95.0` is installed. The `currentPassword` param was added in v2.102.0+.
   - What's unclear: The exact installed patch version (^2.95.0 could resolve to any 2.x.x).
   - Recommendation: Use the verified signIn-then-updateUser pattern (sign in with current password first to verify it, then call updateUser). This works on any version and is explicitly reliable.

3. **Company name update on `organizations` vs `profiles`**
   - What we know: `organizations.name` holds the company name. `profiles` has no `company_name` column. The CONTEXT says "Company Name (editable)" in the Profile card.
   - What's unclear: Should company name edit update `organizations.name` (which could affect org slug and other members) or just a local display field?
   - Recommendation: Update `organizations.name` via service_role server action. Do NOT regenerate the slug (slug is for routing, changing it would break URLs). Include a note to the user that company name is shared with all org members.

---

## Sources

### Primary (HIGH confidence)
- Supabase RLS migration files (`/supabase/migrations/*.sql`) — confirmed `organizations` has no authenticated UPDATE policy
- `web/src/i18n/request.ts` — confirmed `NEXT_LOCALE` cookie drives locale
- `web/src/components/auth/password-strength-bar.tsx` — confirmed reusable component exists
- `web/src/lib/actions/auth.ts` — confirmed `getAdminClient()` service_role pattern
- [Supabase signOut docs](https://supabase.com/docs/guides/auth/signout) — confirmed `scope: 'others'` terminates all other sessions

### Secondary (MEDIUM confidence)
- [Supabase updateUser docs](https://supabase.com/docs/reference/javascript/auth-updateuser) — password update via updateUser confirmed; `currentPassword` param availability in v2.102.0+ noted
- [next-intl configuration docs](https://next-intl.dev/docs/usage/configuration) — cookie-based locale switching via server action confirmed
- [Supabase Storage upload guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) — browser client upload pattern confirmed; bucket creation via SQL confirmed

### Tertiary (LOW confidence — validate before implementing)
- [Next.js server action body size](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions) — 1MB default limit confirmed in docs; reported inconsistencies in production (LOW: validate with a test upload)
- Session listing simplification — recommendation to use simplified UI is based on inability to find public `listSessions()` API (LOW: verify whether `auth.sessions` is queryable via service_role `admin.from('auth.sessions')`)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed and in use
- Architecture: HIGH — patterns derived from existing working code in the same codebase
- RLS constraint: HIGH — confirmed directly in migration SQL files
- Pitfalls: HIGH — derived from schema + established project patterns
- Session listing: LOW — Supabase doesn't publicly document a JS API for listing user sessions; simplified approach recommended

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (Supabase and next-intl APIs are stable; 30-day window)
