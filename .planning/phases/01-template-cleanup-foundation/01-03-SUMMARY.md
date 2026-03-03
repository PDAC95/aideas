---
phase: 01-template-cleanup-foundation
plan: 03
subsystem: ui
tags: [html, swup, navigation, branding, multi-page]

# Dependency graph
requires:
  - phase: 01-02
    provides: "home-1.html with AIDEAS branding: lang=en, preconnect hints, defer scripts, flat nav, AIDEAS preloader/footer/hero"
provides:
  - "index.html: renamed from home-1.html, Home nav active"
  - "automations.html: AIDEAS shell, placeholder content, Automations nav active"
  - "pricing.html: AIDEAS shell, placeholder content, Pricing nav active"
  - "contact.html: AIDEAS shell, placeholder content, Contact nav active"
  - "404.html: AIDEAS branding, no active nav state"
  - "All 5 pages: mil-hidden-elements block, defer scripts, AIDEAS footer"
  - "16 unused template pages deleted"
affects:
  - "02-i18next-integration"
  - "03-home-page"
  - "04-automations-catalog"
  - "05-pricing-page"
  - "06-contact-page"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Each page sets its own mil-active on the correct nav item — SWUP replaces #swupMenu on navigation"
    - "Placeholder pages use mil-dark-bg mil-p-120-60 section with h1 + phase note"
    - "404.html has no active nav item (none of the 4 pages is '404')"

key-files:
  created:
    - "landing/index.html"
    - "landing/automations.html"
    - "landing/pricing.html"
    - "landing/contact.html"
    - "landing/404.html"
  modified: []

key-decisions:
  - "contact.html replaced entirely — old shell had Ashley branding, dropdowns, agency footer; fresh write from AIDEAS shell"
  - "404.html: kept 404-specific content (mil-404-banner, h1 data-text=404), updated shell only; back-to-homepage link updated to index.html"
  - "ashley scss comment updated to aideas scss across all 5 pages — no Ashley text references remain"

patterns-established:
  - "Page shell pattern: copy index.html, change title, change active nav item, replace #swupMain content section"
  - "Placeholder content: mil-dark-bg mil-p-120-60 section with h1 mil-muted + p mil-light-soft + Phase N note"

requirements-completed: [FOUN-06, NAVL-05, PERF-02]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 01 Plan 03: Page Structure — 4 Pages + Cleanup Summary

**5 AIDEAS-branded HTML pages (index, automations, pricing, contact, 404) with SWUP nav shell; 16 agency template pages deleted, awaiting human SWUP verification**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-03T20:27:28Z
- **Completed:** 2026-03-03T20:32:00Z
- **Tasks:** 2/3 automated complete (Task 3 = human checkpoint)
- **Files modified:** 5

## Accomplishments

- Created index.html (renamed from home-1.html), automations.html, and pricing.html — each with AIDEAS shell and correct per-page nav active state
- Rewrote contact.html with full AIDEAS shell (replacing Ashley agency template entirely) and updated 404.html with AIDEAS branding
- Deleted all 16 unused template pages (blog, portfolio-1/2/3, project-1-6, service, services, team, home-2) — only 5 pages remain
- Updated all 5 pages: `<!-- ashley scss -->` comment changed to `<!-- aideas scss -->` — zero Ashley/agency references remain

## Task Commits

Each task was committed atomically:

1. **Task 1: Create index.html, automations.html, pricing.html** - `1ce17d6` (feat)
2. **Task 2: Adapt contact.html, update 404.html, delete unused pages** - `5b23618` (feat)
3. **Task 3: Visual verification checkpoint** - awaiting human approval

## Files Created/Modified

- `landing/index.html` - Renamed from home-1.html; Home nav active
- `landing/automations.html` - AIDEAS shell; Automations nav active; placeholder "Coming in Phase 4"
- `landing/pricing.html` - AIDEAS shell; Pricing nav active; placeholder "Coming in Phase 5"
- `landing/contact.html` - Full rewrite with AIDEAS shell; Contact nav active; placeholder "Coming in Phase 6"
- `landing/404.html` - AIDEAS shell; 404 content preserved; link updated to index.html

## Decisions Made

- Rewrote contact.html entirely rather than patching: old file had Ashley dropdowns, agency address blocks, template footer — too many layers to patch safely
- Kept 404 banner content (mil-404-banner structure, animated h1 with data-text="404") — it's template-agnostic HTML, no Ashley text
- Updated "Back to homepage" link in 404.html from `home-1.html` to `index.html`
- Updated `<!-- ashley scss -->` comment to `<!-- aideas scss -->` across all 5 pages — plan verification grep for "Ashley" would otherwise flag it

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated ashley scss comment to aideas scss across all pages**
- **Found during:** Task 2 verification (grep for Ashley references)
- **Issue:** `<!-- ashley scss -->` comment remained in all 5 pages, causing the "no Ashley references" verification to fail
- **Fix:** Updated comment to `<!-- aideas scss -->` in all 5 files
- **Files modified:** landing/index.html, landing/automations.html, landing/pricing.html, landing/contact.html, landing/404.html
- **Verification:** `grep -lin "Ashley" landing/*.html` returns no matches
- **Committed in:** 5b23618 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug/naming consistency)
**Impact on plan:** Necessary for clean verification. No scope creep.

## Issues Encountered

The 16 deleted template pages were untracked in git (were never committed), so `git rm` was not needed — files were deleted from filesystem only. Git only tracked the 5 new/modified pages.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 main pages (index, automations, pricing, contact) ready with AIDEAS shell
- SWUP navigation awaiting human verification (Task 3 checkpoint)
- Once verified, Phase 2 (i18next) can begin — footer already has language selector placeholder
- Pattern established: new pages copy index.html shell, change title + active state + #swupMain content

## Self-Check: PASSED

- FOUND: landing/index.html
- FOUND: landing/automations.html
- FOUND: landing/pricing.html
- FOUND: landing/contact.html
- FOUND: landing/404.html
- FOUND commit: 1ce17d6 (Task 1)
- FOUND commit: 5b23618 (Task 2)

---
*Phase: 01-template-cleanup-foundation*
*Completed: 2026-03-03*
