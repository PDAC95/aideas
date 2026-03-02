# AIDEAS Landing Page

## What This Is

A multi-page marketing website for AIDEAS — an AI automation managed service for small and medium businesses (PyMEs/SMBs). The landing page communicates AIDEAS's value proposition, showcases a catalog of 150+ pre-designed automations organized by category, presents pricing plans, and drives visitors to sign up or request a demo. Built by adapting the existing "Ashley" HTML template in `landing/` with i18next multi-language support (Spanish, English, Portuguese, French).

## Core Value

Visitors immediately understand that AIDEAS saves them money by replacing expensive manual tasks with affordable AI automations — and can browse the full catalog, see pricing, and sign up in minutes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Home page with hero, value proposition, how-it-works, category preview, and CTAs
- [ ] Automations catalog page with 150+ automations organized by 8-10 categories with search/filter
- [ ] Pricing page with plan comparison (Starter/Pro/Business) and monthly/annual toggle
- [ ] Contact/Demo page with lead capture form
- [ ] Multi-language support via i18next (ES, EN, PT, FR) with language selector
- [ ] All CTAs link to app.aideas.com/signup
- [ ] Dark + orange aesthetic adapted from Ashley template
- [ ] SWUP page transitions between pages
- [ ] GSAP scroll animations (fade-up, parallax, custom cursor)
- [ ] Mobile responsive design
- [ ] SEO meta tags and Open Graph for all pages and languages

### Out of Scope

- Blog/newsletter section — defer to future milestone, not core to conversion
- Team page — not relevant for service company landing
- Portfolio/case studies — no real client data yet for launch
- Backend integration — landing is static HTML, no server-side rendering
- User authentication on landing — authentication lives at app.aideas.com
- Payment processing on landing — handled in the app portal

## Context

**Existing codebase:** AIDEAS is a monorepo with a Next.js portal (`web/`), FastAPI backend (`api/`), and Supabase database. The landing page (`landing/`) is a separate static site deployed independently to Vercel at `aideas.com`.

**Template base:** The Ashley template (by millerDigitalDesign) is a premium creative agency HTML template featuring:
- Bootstrap Grid (no Bootstrap components) + custom SCSS with `mil-` prefix namespace
- GSAP + ScrollTrigger for scroll animations, parallax, and custom cursor
- SWUP for SPA-like page transitions
- Swiper.js for carousels/sliders
- Outfit font (Google Fonts), weights 100-900
- Dark/light section alternation with orange accent (`rgba(255,152,0,1)`)

**Automation reference:** Categories and automations inspired by the awesome-n8n-templates repository, covering: email/Gmail, documents/PDF, customer service, marketing/social media, sales/CRM, HR/recruitment, DevOps, database, analytics, and more.

**Business model:** AIDEAS is a managed service — customers describe their problem, AIDEAS builds and maintains the automation. No self-service builder. Dual revenue: one-time setup fee + recurring monthly subscription.

**Target markets:** Phase 1: US/Canada (EN). Phase 2: Latin America (ES), Brazil (PT), Europe (FR).

## Constraints

- **Tech stack**: Static HTML + SCSS + JS only. No frameworks (React, Vue). Must work with the existing Ashley template foundation.
- **Hosting**: Vercel free tier (or Cloudflare Pages). No server required.
- **i18n**: i18next library for client-side translation switching. All 4 languages must share the same HTML structure.
- **Performance**: Target Lighthouse score 90+ on mobile. Optimize images, minimize JS bundles.
- **Browser support**: Modern browsers (Chrome, Firefox, Safari, Edge). No IE11.
- **Accessibility**: Basic WCAG 2.1 AA compliance (alt texts, color contrast, keyboard nav).
- **SEO**: Proper meta tags, hreflang tags for multi-language, semantic HTML.
- **Dependencies**: Must use existing template's JS libraries (jQuery, GSAP, Swiper, SWUP, Fancybox).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-page over single-page | Better SEO, matches template structure, cleaner navigation | — Pending |
| i18next for translations | Industry standard, scalable, separation of content from markup | — Pending |
| Keep dark + orange aesthetic | Sophisticated tech feel matches AI/automation brand positioning | — Pending |
| 8-10 automation categories | Balanced: impressive catalog without overwhelming visitors | — Pending |
| CTAs → app.aideas.com/signup | Consistent with PRD architecture, single registration flow | — Pending |
| Static site (no SSR) | Fast loading, free hosting, simple deployment, template compatibility | — Pending |

---
*Last updated: 2026-03-02 after initialization*
