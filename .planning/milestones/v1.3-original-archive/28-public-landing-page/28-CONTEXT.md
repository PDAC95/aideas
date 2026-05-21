# Phase 28: Public Landing Page - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a public, SSR-rendered landing page at `/` that introduces AIDEAS to anonymous Ontario SMB visitors and routes them into the catalog funnel. Six sections (Hero, Working Process, Services, Pricing, FAQ, CTA) plus SEO essentials and EN/ES parity via next-intl. Replaces the current root redirect for unauthenticated users.

Scope is fixed by LAND-01..LAND-09. Lead capture, catalog browsing, ROI calculator, and pre-call form all belong to later phases (29, 30, 31).

</domain>

<decisions>
## Implementation Decisions

### Hero
- Tone: **pain-first directo** — open with the SMB owner's pain, not the product category or outcome promise
- Visual: **stylized mockup of the dashboard/catalog** alongside the headline (proves the product exists, builds trust)
- CTAs: **single primary CTA** only ("Ver qué puedo automatizar" → `/catalog`) — no secondary CTA, maximum funnel focus
- Geographic focus: **explicit Ontario** in copy (qualifies leads early, signals local relevance)

### Pricing
- Layout: **single block / one card** (not 2-tier or 3-tier SaaS-style) — avoids self-serve SaaS framing that conflicts with the managed-service model
- Price display: **"desde X CAD" ranges** (e.g., "Setup desde $500 CAD — Monthly desde $200 CAD") — honest about variance while still inviting the call
- Currency: **explicit "CAD"** on every figure to avoid USD confusion for Ontario visitors
- Setup fee covers: **Discovery + build + deploy** (initial call, workflow design, n8n build, testing, production cutover)
- Monthly fee covers: **Hosting + monitoring + minor changes** (infra, fixes, small monthly adjustments — structural rebuilds billed separately)
- "No DIY" framing: **explicit message** in the pricing section (e.g., "No es software para que tú construyas — nosotros lo hacemos por ti.") to differentiate from n8n / Zapier
- Cancel anytime: **subtle subtitle** under the price block ("Cancela cuando quieras — sin contratos largos"), not a loud badge
- Guarantee: **30-day money-back** mentioned as risk-reducer

### Services / Functional Areas
- Layout: **4×2 grid of cards** for the 8 functional areas (seeded in Phase 27) — 4 cols desktop, 2 mobile, 1 on very small screens
- Per-card content: **icon + area name + 1 pain-language example sentence** (scannable, mirrors the catalog seed copy)
- Card interaction: **entire card is clickable** → routes to `/catalog/[area]` (large click target, low friction)
- Section CTA: **"Ver catálogo completo" button at the end of the grid** → `/catalog` (captures visitors who want to see everything in one place)

### Working Process
- Step count: **4 steps** (Discovery → Design → Build & Deploy → Ongoing Support) — balances simplicity with covering the managed-service model end to end
- Visual: **horizontal numbered timeline** — numbers connected by a line, each step with icon + title + short description; standard, scannable, works in both locales

### FAQ
- Question count: **6–8 questions** targeting top Ontario SMB objections (cost, timeline, what-if-it-fails, data security, integration with existing software, contract terms, ongoing support, how it differs from DIY tools)
- Format: **accordion, collapsed by default** — compact and scannable; expanded answers still indexable for SEO

### Claude's Discretion
- Exact iconography choice for each of the 8 functional areas (must respect Factory tokens — Code Orange accent, neutral palette)
- Mockup composition for the Hero visual (which dashboard screen to render, how stylized)
- Order of the 8 area cards inside the grid (visual rhythm + pain priority)
- Exact wording of the 6–8 FAQ questions and answers, in both EN and ES
- Final CTA section copy and visual treatment (LAND-07 — points back to `/catalog`)
- Sub-copy / supporting line under the Hero headline
- Spacing, typography sizing, and motion choices, within the Factory design system (Geist Sans/Mono, 4px/6px radii, no shadows, #eeeeee bg / #fafafa cards / #ef6f2e accent)
- SEO meta copy, OG image composition, structured data schema selection (Organization vs. Service vs. FAQPage)

</decisions>

<specifics>
## Specific Ideas

- Tonally pain-first: lead with the SMB owner's frustration before naming the product
- The 8 functional areas already exist with EN/ES pain copy in the `scenarios` / `functional_areas` seed from Phase 27 — landing should pull from that data model rather than hardcode area names
- Pricing block must read as a service quote, not a SaaS pricing page — single block over multi-tier SaaS framing
- Explicit "Ontario" in Hero copy is intentional: descalifies out-of-territory leads early and signals local fit
- Working Process and FAQ together carry the "managed service, not DIY" message that pricing also reinforces — same narrative across three sections

</specifics>

<deferred>
## Deferred Ideas

- Lead capture / email gate / pre-call form — Phase 31 (LeadCapture)
- ROI calculator / scenario selection state — Phase 30
- Scenario detail pages and functional-area landing pages — Phase 29 (Phase 28 only links into them)
- Testimonials / case studies / customer logos — not in v1.3 scope; future phase
- Blog / content marketing surfaces — not in v1.3 scope
- Analytics event wiring and Lighthouse hardening — Phase 34 (Launch Polish)

</deferred>

---

*Phase: 28-public-landing-page*
*Context gathered: 2026-05-19*
