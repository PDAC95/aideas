# Phase 4: User Registration - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

A new visitor can create an account using email/password or Google OAuth, land on the verify-email holding page, and find their organization automatically created. This phase covers signup form, registration logic, org creation, email verification sending, and the verify-email waiting page.

</domain>

<decisions>
## Implementation Decisions

### Signup form layout
- Split layout: left panel with branding, right panel with form
- On mobile: left panel hidden, only form shown centered with logo above
- Name and surname as separate fields (not a single "full name" field)
- Company name field is mandatory (used to create organization)
- Password strength indicator: visual color bar (red/yellow/green) with text labels (Weak/Medium/Strong)
- Password requirements: minimum 8 characters, at least one uppercase letter, one number

### Google OAuth position and flow
- Claude's Discretion: position of Google button relative to form fields (above or below)
- After Google OAuth: additional step asking only for company name before completing registration (name already comes from Google)

### Branding panel (left side)
- Claude's Discretion: content of the left branding panel (logo + benefits, testimonial, etc.)

### Validation and error handling
- Validation triggers on blur (when user leaves a field)
- Email already registered: inline error under email field with text "This email is already registered. Want to log in?" with link to /login
- Submit button disabled while validation errors exist
- Submit button shows spinner and text changes to "Creating account..." while processing (prevents double-click)
- Google OAuth errors: toast notification at the top that disappears in 5 seconds

### Post-registration flow (verify-email page)
- Page shows illustration/icon of envelope + instructions
- Displays the email address where verification was sent
- "Resend email" button with 60-second cooldown (shows countdown timer)
- Page is a "waiting room": user can only resend email, logout (change account), or read tips
- Tip text below resend button: "Can't find it? Check your spam or junk folder"
- No access to dashboard until email is verified

### Organization creation
- Organization name = exact value from the company name field
- Auto-generated URL-friendly slug: "Acme Corp" → "acme-corp"
- Slug duplicates handled with incremental numbers: "acme-corp-2", "acme-corp-3"
- Profile stores: first name, last name, email, org_id
- Creator gets "owner" role (full permissions including transfer and delete)
- If org creation fails after auth user exists: silent retry up to 3 times, then redirect to /verify-email with "We're setting up your account" message

### Internationalization (i18n)
- Bilingual interface: Spanish and English with language selector
- Default language: auto-detect from browser language (Spanish if browser is Spanish, English otherwise)
- Language selector: small "ES | EN" button in top-right corner of the page
- Verification emails sent in the language the user had selected at signup time

### Verification email
- Branded email with AIDEAS logo in header
- Personalized greeting: "Hola, [First Name]" / "Hi, [First Name]"
- Large CTA button "Verify your email" / "Verifica tu email"
- Footer with company info
- Sender: AIDEAS <noreply@aideas.com>
- Subject: "Verifica tu email en AIDEAS" (ES) / "Verify your email on AIDEAS" (EN)
- Link expiration: 1 hour

### Terms and privacy
- Mandatory checkbox: "I accept the Terms of Service and Privacy Policy" with links to /terms and /privacy
- /terms and /privacy pages are placeholder content for now (filled later)
- Links open in new tab so user doesn't lose form progress
- Timestamp of terms acceptance saved (date/time when user checked the box) for compliance audit

### Signup security
- Google reCAPTCHA v3 (invisible) — evaluates in background, only shows challenge if bot detected
- Rate limiting: 5 signup attempts per IP per 15 minutes
- Email normalization: lowercase and trim before processing (prevents duplicates from case variations)
- Block disposable email domains (mailinator, tempmail, etc.) with error: "Please use a work or personal email"

### Claude's Discretion
- Google OAuth button position (above or below form fields)
- Left branding panel content and design
- Initial subscription plan for new organizations (free/trial)
- Loading skeleton designs
- Exact spacing, typography, and color choices

</decisions>

<specifics>
## Specific Ideas

- Split page layout inspired by modern SaaS signup pages (Clerk, Linear, Vercel style)
- Password strength bar should feel responsive and encouraging, not punitive
- The verify-email page should feel welcoming, not like a dead end
- Google OAuth should feel like a first-class option, not an afterthought

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-user-registration*
*Context gathered: 2026-03-31*
