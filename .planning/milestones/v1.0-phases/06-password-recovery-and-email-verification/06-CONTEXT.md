# Phase 6: Password Recovery and Email Verification - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

A user who forgot their password can reset it via email link, and a newly registered user can verify their email and gain access to the portal. Two dedicated flows: forgot/reset password and email verification gate. Both use Supabase Auth email delivery.

</domain>

<decisions>
## Implementation Decisions

### Forgot/Reset Password Flow
- `/forgot-password` is a dedicated page (not a modal), same auth layout as `/login` and `/register`
- After submitting email: generic message always ("Si el email existe, recibirás un enlace") — never reveal if account exists
- Success state replaces the form entirely: envelope icon + "Revisa tu correo" + link back to login
- `/reset-password` has a single password field with show/hide toggle (no confirm field)
- After successful reset: check icon (animated) + "Contraseña actualizada" + button to login — replaces the form
- User clicks button to go to `/login` manually (no auto-redirect, no auto-login)
- Both pages use subtle icons above the title (lock icon for reset, envelope for forgot)

### Email Verification Gate
- Unverified users CAN log in, but are redirected to `/verify-email` instead of `/dashboard`
- `/verify-email` page shows: envelope icon, "Revisa tu correo", partially masked email (p***@gmail.com), "Reenviar email" button, and "Volver a login" link
- "Reenviar email" button has 60-second cooldown with visible countdown timer ("Reenviar en 45s")
- Clicking verification link in email: verifies account and redirects to `/login` with success banner "Email verificado, inicia sesión"
- Already-verified link: shows "Tu email ya está verificado" + button to login
- Invalid/expired verification link: error message + option to resend

### Password Strength
- Strength bar with color progression: red → yellow → green, with text label "Débil/Media/Fuerte"
- Minimum requirements: 8+ characters, 1 uppercase letter, 1 number
- Validation in real-time as the user types (bar updates with each keystroke)
- Apply to BOTH reset password form AND registration form (Phase 4 retrofit) for consistency

### Email Delivery & Edge Cases
- Expired reset link: "Este enlace ha expirado" + button "Solicitar nuevo enlace" → navigates to `/forgot-password`
- Both resend buttons (forgot-password and verify-email) have identical 60s cooldown with timer
- Subtle help text below email-sent messages: "¿No lo ves? Revisa tu carpeta de spam"
- Invalid/expired verification link: detect state and show appropriate message (already verified vs. truly invalid)

### Claude's Discretion
- Exact animations and transitions
- Specific icon choices (from project's icon library)
- Spacing, typography, and responsive breakpoints
- Error message wording for edge cases not explicitly discussed
- How Supabase Auth callback URLs are structured

</decisions>

<specifics>
## Specific Ideas

- All auth pages (forgot, reset, verify) must share the same centered-card layout with AIDEAS logo — consistent with existing `/login` and `/register`
- The "success" states (email sent, password changed) should replace the form entirely rather than showing banners above disabled forms
- Cooldown timer is visual and real-time (counts down second by second)
- Email masking on verify page: show first letter + *** + @domain.com

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-password-recovery-and-email-verification*
*Context gathered: 2026-04-01*
