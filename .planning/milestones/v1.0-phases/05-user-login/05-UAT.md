---
status: complete
phase: 05-user-login
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: 2026-04-01
updated: 2026-04-01
---

## Tests

### 1. Login Page Layout
expected: Navigate to /login. Split layout with dark left panel (branding) and right side with login form, matching signup page design.
result: pass

### 2. Login Form Fields
expected: The login form shows email input, password input with show/hide toggle, "Remember me" checkbox, "Forgot password?" link, a "Sign in" submit button, Google OAuth button, and a "Sign up" link at the bottom.
result: pass

### 3. Login Form Validation
expected: Submit the form with empty fields or invalid email. Validation errors appear inline. Password field requires input.
result: pass

### 4. Language Switching on Login
expected: Switch language to Spanish (ES). All login form labels, placeholders, error messages, and branding text change to Spanish. Switch back to English — everything reverts.
result: pass

### 5. Login With Valid Credentials
expected: Enter valid email/password and submit. On success, redirected to /dashboard.
result: pass

### 6. Login With Invalid Credentials
expected: Enter wrong email or password and submit. Error message appears. Password field cleared. Stay on /login.
result: pass

### 7. Rate Limiting After Failed Attempts
expected: Fail login 5 times. Form locks with countdown timer (~10 minutes). Submit button disabled during lockout.
result: pass

### 8. Session-Expired Banner
expected: Navigate to /login?reason=expired. Blue dismissible banner appears. Auto-dismisses after ~5 seconds.
result: pass (note: URL is ?reason=expired, not ?expired=true — UAT description corrected)

### 9. Dashboard Greeting After Login
expected: /dashboard shows greeting with name + sign-out button. Minimal page.
result: pass

### 10. Dashboard Sign Out
expected: Sign out redirects to /login. Navigating to /dashboard redirects back to /login (protected route).
result: pass

## Summary

total: 10
passed: 10
issues: 1 (fixed during testing)
pending: 0
skipped: 0

## Gaps

### GAP-01: Sign-out button not navigating after signOut() [FIXED]
- **Found in:** Test 10 (initially discovered before Test 7)
- **Symptom:** Clicking Sign out cleared the session but stayed on /dashboard. Manual refresh then showed /login.
- **Root cause:** `router.push('/login')` + `router.refresh()` after async `supabase.auth.signOut()` caused navigation to hang in Next.js 16.
- **Fix:** Replaced `router.push` + `router.refresh` with `window.location.href = '/login'` in both `nav.tsx` and `sign-out.tsx`.
- **Files modified:** `web/src/components/dashboard/nav.tsx`, `web/src/components/dashboard/sign-out.tsx`
- **Status:** FIXED — verified working during Test 10.
