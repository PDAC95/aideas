---
phase: 25-design-system-migration
plan: 05
subsystem: ui
tags: [shadcn, tailwind-v4, design-tokens, factory-ai, auth, admin-login, legal-pages]

# Dependency graph
requires:
  - phase: 25-design-system-migration
    provides: Factory token palette + Code Orange CTAs from Plan 25-01 (globals.css)
  - phase: 25-design-system-migration
    provides: Reskinned Button/Card/Input/Form/Label primitives from Plan 25-02 (auto-inherited by auth forms)
provides:
  - Customer auth pages (login, signup, verify-email, forgot-password, reset-password, complete-registration) rendering against Factory light tokens
  - Legal pages (/terms, /privacy) using bordered Card pattern (no shadow-sm)
  - Admin login page preserving intentional dark context via Factory dark-base HEX (#020202 / #101010 / #d6d3d2 / #3d3a39) — research Open Question 1 honored
  - Password strength bar using --destructive (weak) / --muted-foreground (medium) / --primary (strong) — no green/yellow/red HEX literals
  - Pattern: success states use bg-primary/10 + text-primary in v1.3 (no green-success token until later phase)
affects: [25-06-composed-component-triage, 25-07-uat-pass, 28-public-landing-page, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Card wrapper canonical class set: rounded-md border border-border bg-card text-card-foreground p-8 — Phase 25 Card primitive baseline applied inline to non-shadcn-Card wrappers in auth/legal pages"
    - "Admin context preservation: Factory dark-base HEX (#020202/#101010/#d6d3d2/#3d3a39) used inline on /admin/login because semantic tokens (bg-background, bg-card) would force light mode and erase admin/customer visual distinction"
    - "Success-as-primary pattern: v1.3 reuses --primary (Code Orange) for success states (verified banners, check icons, strong password) — deliberate deferral of a dedicated --success token to a future phase"

key-files:
  created: []
  modified:
    - web/src/app/(auth)/forgot-password/page.tsx
    - web/src/app/(auth)/reset-password/page.tsx
    - web/src/app/(auth)/verify-email/page.tsx
    - web/src/app/(legal)/terms/page.tsx
    - web/src/app/(legal)/privacy/page.tsx
    - web/src/components/auth/login-form.tsx
    - web/src/components/auth/reset-password-form.tsx
    - web/src/components/auth/password-strength-bar.tsx
    - web/src/app/(admin-auth)/admin/login/page.tsx
    - web/src/components/admin/admin-login-form.tsx

key-decisions:
  - "Admin login intentionally uses inline Factory dark-base HEX (#020202 page, #101010 card, #d6d3d2 body, #3d3a39 border, #a49d9a muted) instead of semantic tokens — research Open Question 1 recommendation honored to preserve admin/customer visual distinction in both light and dark mode"
  - "Success states (verified email banner, reset-password success check icon, strong password bar) use bg-primary/10 + text-primary (Code Orange) — v1.3 has no green-success token; deferred to a future phase that explicitly adds --success / --success-foreground"
  - "Session-expired banner swapped from bg-blue-50 + text-blue-700 to bg-muted + text-muted-foreground (neutral info) — differentiates from error (destructive) and success (primary) without introducing a new info token"
  - "admin-login-form.tsx added to Plan 25-05 scope as Rule 2 auto-fix — the form renders inside the dark admin/login page, so leaving gray-800/orange-500/red-400 literals would break the page's intentional dark aesthetic. Per Phase 25 plan intent (admin context preserved), the form was swept in the same commit as the page"
  - "login.tsx + signup.tsx left-branding-panel (bg-[#111] text-white) preserved — that surface is an intentional dark hero matching the admin pattern; bg-white/10 and text-white are deliberate translucent accents on the dark surface, NOT stale gray literals to swap"
  - "verify-email, forgot-password, reset-password, terms, privacy: dropped `shadow-sm rounded-xl` from inline Card-like wrappers, replaced with `rounded-md border border-border` — matches Phase 25-02 Card primitive baseline"

patterns-established:
  - "Inline Card-like wrappers in auth/legal pages mirror the reskinned shadcn Card primitive (rounded-md, border-border, no shadow) without converting them to <Card> JSX — preserves backward-compatible structure while picking up Factory tokens"
  - "Dark admin context lives on Factory's dark-base HEX (not semantic tokens) and stays orthogonal to the .dark theme toggle — admin pages render the same in light or dark user preference"

requirements-completed: [DESIGN-03, DESIGN-04]

# Metrics
duration: 5 min
completed: 2026-05-15
---

# Phase 25 Plan 05: Auth + Legal + Admin Login Reskin Summary

**5 customer auth/legal page wrappers swept clean of shadow-sm/rounded-xl, login-form + reset-password-form success banners swapped to --primary (no green token in v1.3), password-strength-bar uses --destructive/--muted-foreground/--primary, admin login + form kept intentionally dark via Factory dark-base HEX (#020202/#101010/#d6d3d2/#3d3a39) per research Open Question 1 — 10 files delivered, build + targeted lint clean.**

## Performance

- **Duration:** 5 min
- **Tasks completed:** 2 / 2
- **Files modified:** 10
- **Lines changed:** 46 (+, − combined across two commits)
- **Build:** exit 0 (`npm run build` compiled successfully in 8.8s)
- **Lint:** pre-existing 103 errors unchanged; no NEW errors introduced in the 10 touched files

## Per-File Change List

### Customer Auth & Legal (Task 1, commit `4dcba17`)

1. **`web/src/app/(auth)/forgot-password/page.tsx`** — Card wrapper `rounded-xl border bg-card text-card-foreground shadow-sm` → `rounded-md border border-border bg-card text-card-foreground`.
2. **`web/src/app/(auth)/reset-password/page.tsx`** — Same Card wrapper swap.
3. **`web/src/app/(auth)/verify-email/page.tsx`** — Same Card wrapper swap.
4. **`web/src/app/(legal)/terms/page.tsx`** — Same Card wrapper swap.
5. **`web/src/app/(legal)/privacy/page.tsx`** — Same Card wrapper swap.
6. **`web/src/components/auth/login-form.tsx`** —
   - Verified-email banner: `bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300` → `bg-primary/10 text-primary` (+ dismiss button `text-green-500` → `text-primary/70`).
   - Session-expired banner: `bg-blue-50 border-blue-200 text-blue-700` → `bg-muted border-border text-muted-foreground` (+ dismiss button colors).
7. **`web/src/components/auth/reset-password-form.tsx`** — Success state check icon: `bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400` → `bg-primary/10 text-primary`.
8. **`web/src/components/auth/password-strength-bar.tsx`** —
   - Weak segments/label: `bg-red-500`, `text-red-500` → `bg-destructive`, `text-destructive`.
   - Medium: `bg-yellow-500`, `text-yellow-600` → `bg-muted-foreground`, `text-muted-foreground`.
   - Strong: `bg-green-500`, `text-green-600` → `bg-primary`, `text-primary`.
   - Removed per-segment `color` keys (logic now derives from `activeColor` only).

### Pages already token-clean (no edits required)

- `web/src/app/(auth)/login/page.tsx` — Right-side form panel was already on neutral tokens. Left-side branding panel (`bg-[#111] text-white`) is intentionally dark and preserved.
- `web/src/app/(auth)/signup/page.tsx` — Same pattern as login.
- `web/src/app/(auth)/complete-registration/page.tsx` — No Card wrapper, only uses primitive imports (already reskinned by Plan 25-02).
- `web/src/components/auth/forgot-password-form.tsx`, `signup-form.tsx`, `complete-registration-form.tsx` — Grep confirmed zero stale gray/red/green/yellow/blue literals; auto-inherit Factory tokens from reskinned primitives.

### Admin Login (Task 2, commit `77c4fca`)

9. **`web/src/app/(admin-auth)/admin/login/page.tsx`** —
   - Page bg: `bg-[#111]` → `bg-[#020202]` (Factory dark-base-primary).
   - Card: `bg-gray-900 rounded-2xl border-gray-800` → `bg-[#101010] rounded-md border-[#3d3a39]`.
   - Body text: `text-white` → `text-[#d6d3d2]`.
   - Muted subtitle: `text-white/60` → `text-[#a49d9a]`.
   - Badge: `bg-orange-500 text-white` → `bg-primary text-primary-foreground` (semantic — Code Orange is exactly orange-500, no visual change).
   - Error banner: `bg-red-500/10 border-red-500/30 text-red-300` → `bg-destructive/10 border-destructive/30 text-destructive`.
   - Added a 6-line JSDoc block documenting the intentional-dark decision and pointing at Phase 25 RESEARCH Open Question 1.
10. **`web/src/components/admin/admin-login-form.tsx`** (added as Rule 2 auto-fix to keep the page coherent) —
    - Input bg: `bg-gray-800 border-gray-700 text-white` → `bg-[#101010] border-[#3d3a39] text-[#d6d3d2]`.
    - Input focus ring: `focus:ring-orange-500` → `focus:ring-primary`.
    - Label muted: `text-white/80` → `text-[#d6d3d2]/80`.
    - Error: `text-red-400` → `text-destructive`.
    - Submit button: `bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white` → `bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground`.
    - Radius `rounded-md` on inputs/button → `rounded-sm` (Factory 4px form-element rhythm from Plan 25-02).
    - Added 3-line code comment pointing back at the admin/login page for the dark-context rationale.

## Decisions Made

1. **Admin context preserved via inline Factory dark-base HEX** — semantic tokens (`bg-background`, `bg-card`) would force the admin login into light mode, erasing the admin/customer visual distinction. Research Open Question 1 explicitly recommended keeping the dark aesthetic; this plan honors that by using Factory's dark-base palette HEX values directly. The decision is documented in the page's JSDoc block and the form's inline comment so future maintainers see the "why" before they "fix" the literals.

2. **Success state = --primary (Code Orange), not a new --success token** — Phase 25 deliberately does not introduce a green-success token in v1.3. All success affordances (verified-email banner, reset-password success check, password-strength "strong" state) reuse `--primary`. This matches Factory's reduced-palette discipline and keeps the token surface area small. If UAT in Plan 25-07 reveals a UX gap where users can't distinguish "success" from "primary action", we can revisit in v1.4 by adding `--success` / `--success-foreground` to globals.css.

3. **admin-login-form.tsx added as Rule 2 auto-fix** — the plan listed only the page file, but the form renders inside the page and shared the same `bg-gray-800/text-white/text-red-400/bg-orange-500` literals. Leaving the form unchanged would have produced a visually broken dark page (form bg `gray-800 = #1f2937` clashing with page bg `#020202` and the new card bg `#101010`). Per Phase 25 must_haves ("Admin login page keeps its intentionally-dark look"), sweeping the form was required to honor the truth statement.

4. **login.tsx + signup.tsx left-branding-panel preserved** — those `bg-[#111] text-white` surfaces are intentional dark marketing-hero panels (logo + benefit list + grid pattern). The `bg-white/10` accents and `text-white` body inside them are deliberate translucent design tokens on a dark surface, not stale gray literals. Removing them would have broken the page's hero design without any token-discipline gain.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added admin-login-form.tsx to scope**
- **Found during:** Task 2 verification (after reskinning the admin/login page wrapper)
- **Issue:** The page now uses `bg-[#020202]` + `bg-[#101010]`, but the form inputs inside it were still `bg-gray-800 border-gray-700 text-white` — visually broken. The plan listed only the page file under `<files>`, but the page renders the form via `<AdminLoginForm>` and the dark aesthetic only holds if both pieces use Factory dark-base tokens.
- **Fix:** Swept `web/src/components/admin/admin-login-form.tsx` with the same Factory dark-base HEX pattern: `bg-[#101010] border-[#3d3a39] text-[#d6d3d2]`, focus-ring `--primary`, error `--destructive`, button `--primary`/`--primary-foreground`. Added a 3-line code comment pointing at the page JSDoc for context.
- **Files modified:** `web/src/components/admin/admin-login-form.tsx`
- **Commit:** `77c4fca` (rolled into the Task 2 commit since both files share the same admin-dark rationale)

### Scope Deferred

- **3 dashboard/admin files showed as modified in `git status` before this plan ran** (e.g., `web/src/app/(dashboard)/dashboard/page.tsx` with `bg-purple-600 → bg-primary` swaps). Those changes belong to Plan 25-04 (Brand Color Literals Swap, files_modified lists confirm) which has NOT been completed yet. This plan left them unstaged and uncommitted — Plan 25-04 is responsible for committing those, not 25-05.

## Authentication Gates

None — no auth-protected operations performed during this plan.

## Verification Results

### Automated (Task 1)

```
cd web && grep -rn "shadow-sm|rounded-xl|text-gray-9|text-gray-7|text-gray-5|bg-red-5|bg-green-5|bg-yellow-5|bg-blue-5|border-gray-2|border-gray-3" "src/app/(auth)" "src/app/(legal)" "src/components/auth" --include="*.tsx"
→ ZERO matches
```

```
cd web && grep -rn "text-red-|text-green-|text-blue-|text-yellow-" "src/components/auth" --include="*.tsx"
→ ZERO matches
```

### Automated (Task 2)

```
cd web && grep -E "#020202|#101010|#d6d3d2|#3d3a39" "src/app/(admin-auth)/admin/login/page.tsx"
→ 4 matches (page bg, card bg, body text, border)
```

```
cd web && grep -nE "bg-gray-9|bg-zinc-9|bg-slate-9|text-white\b" "src/app/(admin-auth)/admin/login/page.tsx"
→ ZERO matches
```

### Build

```
cd web && npm run build
→ ✓ Compiled successfully in 8.8s, exit 0
```

### Lint

```
cd web && npm run lint
→ 1692 problems (103 errors, 1589 warnings) — UNCHANGED from baseline (Phase 24 documented carry-over)
→ No NEW errors introduced in the 10 files touched by this plan
→ Pre-existing errors in login-form.tsx (Date.now purity) and signup-form.tsx (react-hook-form watch memoization) are out of scope per Phase 24 precedent
```

## Note for Plan 25-06

Customer auth + legal surfaces are clean after this plan. If UAT in Plan 25-07 reveals a dashboard-side surface broken by token swap (especially success-green ↔ primary-orange mismatch in dashboard/billing or dashboard/reports), triage it in Plan 25-06 (composed-component triage). The pattern established here — "success = bg-primary/10 + text-primary, no green token in v1.3" — should be applied uniformly across the dashboard reskin in Phases 32/33.

## Self-Check

Verification commands run:

- `git log --oneline --all | grep "4dcba17"` → FOUND
- `git log --oneline --all | grep "77c4fca"` → FOUND
- `test -f web/src/app/(auth)/forgot-password/page.tsx` → FOUND
- `test -f web/src/app/(auth)/reset-password/page.tsx` → FOUND
- `test -f web/src/app/(auth)/verify-email/page.tsx` → FOUND
- `test -f web/src/app/(legal)/terms/page.tsx` → FOUND
- `test -f web/src/app/(legal)/privacy/page.tsx` → FOUND
- `test -f web/src/components/auth/login-form.tsx` → FOUND
- `test -f web/src/components/auth/reset-password-form.tsx` → FOUND
- `test -f web/src/components/auth/password-strength-bar.tsx` → FOUND
- `test -f web/src/app/(admin-auth)/admin/login/page.tsx` → FOUND
- `test -f web/src/components/admin/admin-login-form.tsx` → FOUND

## Self-Check: PASSED
