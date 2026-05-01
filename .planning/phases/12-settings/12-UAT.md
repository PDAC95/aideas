---
status: closed
phase: 12-settings
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md]
started: 2026-04-15T21:00:00Z
updated: 2026-04-15T21:45:00Z
closed: 2026-04-29T00:00:00Z
closed_by: [12-04-PLAN.md, 12-05-PLAN.md]
closure_evidence: 12-VERIFICATION.md
---

## Current Test

[testing complete]

## Tests

### 1. Settings Page Layout
expected: Navigate to /dashboard/settings. The page loads with a title "Settings" and three cards visible: Profile, Preferences, and Security. No errors in the browser console.
result: issue
reported: "Page loads with all 3 cards visible but has a hydration error — server renders 'Unknown browser' but client renders 'Microsoft Edge on Windows' in the Security card session display"
severity: major

### 2. Avatar Upload and Preview
expected: In the Profile card, click the avatar area or upload button. Select an image file (under 2MB). The avatar previews immediately. After saving, refreshing the page shows the uploaded avatar.
result: issue
reported: "si puedo seleccionar la foto pero al dar refresh no se queda guardada"
severity: major

### 3. Avatar Remove
expected: After uploading an avatar, click the remove/delete button. The avatar reverts to initials fallback. Change persists after page refresh.
result: issue
reported: "puedo cargar la foto si se ve, al dar refresh desaparece, si la vuelvo a guardar y luego quiero dar a remove photo no pasa nada. Sigue el error de hidratacion."
severity: major

### 4. Edit Name
expected: In the Profile card, edit the First Name and Last Name fields. Click Save. A success toast appears. Refreshing the page shows the updated name.
result: issue
reported: "cambia el nombre y el avatar en la card, pero el boton del user menu en el header sigue mostrando 'Bob' — no se actualiza"
severity: minor

### 5. Edit Company Name
expected: In the Profile card (if you are owner/admin), edit the Company Name field. Click Save. A success toast appears. Refreshing the page shows the updated company name.
result: issue
reported: "hice el cambio marca como exitoso pero al recargar no esta"
severity: major

### 6. Language Switch
expected: In the Preferences card, change the language dropdown from English to Espanol (or vice versa). The page refreshes and all UI text switches to the selected language instantly.
result: pass

### 7. Hourly Cost Setting
expected: In the Preferences card, enter a numeric value in the Hourly Cost field (e.g., 75). Click Save. A success toast appears. Refreshing the page shows the saved value.
result: issue
reported: "lo anoto doy save no sale ningun mensaje de exito hago reload y se borra lo que haya puesto"
severity: major

### 8. Change Password
expected: In the Security card, fill Current Password, New Password, and Confirm Password fields. A password strength bar appears below the new password field. Submit the form. A success toast appears if passwords are valid.
result: pass

### 9. Session Management Display
expected: In the Security card, a "Current Session" section shows your browser name, OS, and timezone.
result: pass

### 10. Sign Out Other Sessions
expected: In the Security card, click "Sign Out Other Sessions". A confirmation dialog appears. Clicking Confirm triggers the sign-out. A success toast appears.
result: pass

## Summary

total: 10
passed: 4
issues: 6
pending: 0
skipped: 0

## Gaps

- truth: "Settings page loads without console errors. Security card session info renders correctly on both server and client."
  status: failed
  reason: "User reported: Page loads with all 3 cards visible but has a hydration error — server renders 'Unknown browser' but client renders 'Microsoft Edge on Windows' in the Security card session display"
  severity: major
  test: 1
  root_cause: "detectBrowser() and detectOS() called directly in component body (line 146-147) use navigator.userAgent which returns fallback on server but real value on client. Intl.DateTimeFormat (line 148) has same issue."
  artifacts:
    - path: "web/src/components/dashboard/settings-security-card.tsx"
      issue: "Lines 146-148: browser/OS/timezone detection runs during SSR causing hydration mismatch"
  missing:
    - "Wrap detectBrowser/detectOS/timezone in useState+useEffect to defer to client-side only"
  debug_session: ""

- truth: "Avatar uploads to Supabase Storage and persists after page refresh"
  status: failed
  reason: "User reported: si puedo seleccionar la foto pero al dar refresh no se queda guardada"
  severity: major
  test: 2
  root_cause: "Supabase .update() with RLS returns {data:null, error:null} when 0 rows affected (auth.uid() doesn't match seed profile ID). Server action returns success:true without verifying rows were actually updated. Also missing revalidatePath to refresh SSR data."
  artifacts:
    - path: "web/src/lib/actions/settings.ts"
      issue: "saveAvatarUrl (line 98): update returns no error when 0 rows match RLS, no revalidatePath call"
    - path: "web/src/components/dashboard/settings-profile-card.tsx"
      issue: "Avatar upload logic (line 152-184): calls saveAvatarUrl but can't verify DB persistence"
  missing:
    - "Add revalidatePath('/dashboard') after successful update in all server actions"
    - "Check .update() result count or use .select().single() to verify row was updated"
  debug_session: ""

- truth: "Remove avatar button clears avatar and reverts to initials fallback"
  status: failed
  reason: "User reported: puedo cargar la foto si se ve, al dar refresh desaparece, si la vuelvo a guardar y luego quiero dar a remove photo no pasa nada"
  severity: major
  test: 3
  root_cause: "Same RLS issue as test 2. Additionally, handleRemoveAvatar (line 120) checks 'if (!currentAvatarUrl) return' — if avatar_url was never persisted to DB, currentAvatarUrl is null after refresh, so remove button may be hidden or return early."
  artifacts:
    - path: "web/src/components/dashboard/settings-profile-card.tsx"
      issue: "handleRemoveAvatar (line 121): early return when currentAvatarUrl is null; avatar state derived from DB which never got updated"
    - path: "web/src/lib/actions/settings.ts"
      issue: "saveAvatarUrl: same RLS/revalidate issue as test 2"
  missing:
    - "Fix avatar persistence first (test 2 fix), remove will work as consequence"
  debug_session: ""

- truth: "After saving name changes, the header user menu reflects the updated name"
  status: failed
  reason: "User reported: cambia el nombre y el avatar en la card pero el boton del user menu en el header sigue mostrando 'Bob' — no se actualiza"
  severity: minor
  test: 4
  root_cause: "Header reads name from user.user_metadata.first_name (auth metadata) but saveProfileName only updates the profiles table. Also no revalidatePath('/dashboard') to refresh the layout's server-fetched data."
  artifacts:
    - path: "web/src/components/dashboard/dashboard-header.tsx"
      issue: "Line 22: reads user.user_metadata.first_name instead of profiles table"
    - path: "web/src/lib/actions/settings.ts"
      issue: "saveProfileName (line 27-48): updates profiles table but not auth user_metadata, no revalidatePath"
  missing:
    - "Add supabase.auth.updateUser({ data: { first_name, last_name } }) in saveProfileName"
    - "Add revalidatePath('/dashboard') to refresh layout data"
  debug_session: ""

- truth: "Company name saves to database and persists after page refresh"
  status: failed
  reason: "User reported: hice el cambio marca como exitoso pero al recargar no esta"
  severity: major
  test: 5
  root_cause: "saveCompanyName uses admin client correctly but has no revalidatePath. The admin client bypasses RLS so the write likely succeeds, but Next.js serves stale cached SSR data on refresh. Need revalidatePath('/dashboard/settings')."
  artifacts:
    - path: "web/src/lib/actions/settings.ts"
      issue: "saveCompanyName (line 54-85): no revalidatePath after successful update"
  missing:
    - "Add revalidatePath('/dashboard/settings') after successful company name save"
  debug_session: ""

- truth: "Hourly cost saves to database, shows success toast, and persists after refresh"
  status: failed
  reason: "User reported: lo anoto doy save no sale ningun mensaje de exito hago reload y se borra lo que haya puesto"
  severity: major
  test: 7
  root_cause: "Same as test 5 — saveHourlyCost uses admin client (likely writes succeed) but no revalidatePath. Also, user reported no toast: the form may have a validation issue with hourlyCostSchema requiring orgId but the Zod resolver may fail silently if orgId hidden field has issues."
  artifacts:
    - path: "web/src/lib/actions/settings.ts"
      issue: "saveHourlyCost (line 115-159): no revalidatePath after successful update"
    - path: "web/src/components/dashboard/settings-preferences-card.tsx"
      issue: "Form submission (line 92-99): check if Zod validation passes and toast fires correctly"
  missing:
    - "Add revalidatePath('/dashboard/settings') after successful hourly cost save"
    - "Verify hidden orgId field is correctly registered and passes Zod UUID validation"
  debug_session: ""
