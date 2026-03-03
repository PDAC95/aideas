# Feature Landscape

**Domain:** AI automation managed service marketing site (B2B SaaS, SMB/PyME target)
**Researched:** 2026-03-03
**Confidence:** MEDIUM-HIGH

---

## Page-by-Page Section Order

### Home Page (index.html)

1. **Navigation** — Logo + language selector + hamburger menu
2. **Hero** — Headline + subheadline + primary CTA + secondary CTA + social proof line
3. **Trust bar** — Animated logo strip of supported integrations
4. **Value proposition / Stats** — 4 stat counters: automations, categories, hours saved, rating
5. **How It Works** — 3 large numbered steps
6. **Category preview** — 8-10 service cards grid, dark background
7. **Before / After** — Left column manual pain, right column AIDEAS solution
8. **Testimonials** — Swiper carousel
9. **Final CTA** — "Start saving time today" + button
10. **Footer** — Navigation + social + language selector + legal

### Automations Catalog Page (automations.html)

1. **Page banner** — "Explore 150+ Automations" headline
2. **Search + Filter bar** — Text search input + category tabs (sticky)
3. **Results count** — "Showing 150 automations"
4. **Automation grid** — Cards in responsive 3-column grid
5. **"Can't find it?" CTA** — Below the grid, links to contact
6. **Footer**

### Pricing Page (pricing.html)

1. **Page banner** — "Simple, transparent pricing" headline
2. **Billing toggle** — Monthly / Annual switch
3. **Plan cards** — 3 columns: Starter / Professional (highlighted) / Business
4. **Feature comparison table** — Detailed checklist below cards
5. **ROI comparison** — "AIDEAS vs hiring a VA" table
6. **FAQ accordion** — 6-8 questions
7. **Final CTA** — "Get started" + "Talk to us for enterprise"
8. **Footer**

### Contact / Demo Page (contact.html)

1. **Page banner** — "Let's automate your business" headline
2. **What happens next** — 3-step process
3. **Contact form** — Left: form fields. Right: contact info + social proof
4. **Footer**

---

## Table Stakes (Must-Have)

### Home Page
- Hero with outcome-focused headline (visitors judge in 3 seconds)
- Subheadline: "150+ pre-built automations, managed by us"
- Primary CTA to app.aideas.com/signup
- How It Works (3-step): Describe → We Build → It Runs
- Category preview cards (8-10 tiles with icons)
- Value proposition with dollar figures ("Replace $2,000/month for $149/month")
- Testimonials carousel
- Integration logo strip
- Final CTA section

### Automations Catalog
- Category filter tabs (sticky horizontal)
- Search bar (client-side JS filter)
- Automation cards grid (icon + badge + name + description + CTA)
- Card count indicator
- Empty state for no-results

### Pricing
- Plan comparison (3 tiers)
- Monthly/Annual billing toggle
- Feature checklist per plan
- "Most Popular" badge on Professional
- FAQ accordion
- Custom/Enterprise escape valve

### Contact
- Lead capture form (Name, Company, Email, Phone, Message)
- Response time promise ("We respond within 24 hours")
- Multiple contact options (email + WhatsApp)

---

## Differentiators

- "Managed service" positioning (vs DIY tools like Zapier/Make)
- Cost savings comparison (before/after table)
- "150+ ready to deploy" catalog count
- Statistics strip with animated counters
- Fancybox detail modal on catalog cards
- Time-saved estimate per automation
- Setup fee + monthly model transparency
- Automation category selector in contact form
- WhatsApp CTA (critical for LATAM market)

---

## Anti-Features (Do NOT Build)

| Anti-Feature | Do Instead |
|--------------|-----------|
| Live chat widget | WhatsApp link + "24hr response" promise |
| Interactive ROI calculator | Static before/after comparison table |
| Video demo embed | Static screenshot or animated GIF |
| Individual automation detail pages | Fancybox modals from JSON data |
| Blog / content section | Defer entirely |
| Newsletter signup | Social media links instead |
| Comparison vs competitors | Handle in sales calls |
| Cookie consent with complex options | Minimal "Accept" bar |

---

## Feature Dependencies

```
Language selector → i18next translation JSON files
Category filter tabs → Automations data (JSON)
Search bar → Same automations dataset
Fancybox detail modal → Extended automation descriptions
Pricing toggle → JS price-swap logic
FAQ accordion → Ashley's .mil-accordion-group
Testimonials carousel → Ashley's Swiper .mil-reviews-slider
Partner logo strip → Ashley's Swiper .mil-infinite-show
Statistics counters → Ashley's GSAP ScrollTrigger
SWUP transitions → All pages share same nav/footer
```

---

## Mobile-First Considerations

| Section | Mobile Behavior |
|---------|----------------|
| Hero | Full-viewport height, headline wraps 2-3 lines |
| Category filter tabs | Horizontally scrollable strip |
| Automation cards | Single column, 2 cols on tablet |
| Pricing cards | Stack vertically, recommended plan first |
| Feature comparison | Accordion collapse per plan |
| Contact form | Single column, full-width submit |
| Language selector | In hamburger menu + footer |
| Navigation | Ashley's hamburger menu pattern |

---

## Trust Signals (ordered by impact)

1. Specific outcome numbers — "Save 15+ hours/week"
2. Integration logos — Gmail, Slack, HubSpot, Notion, etc.
3. Customer testimonials with name + company + use case
4. Catalog count — "150+ pre-built automations"
5. Response time promise — "We respond within 24 hours"
6. Money-back guarantee — "30-day satisfaction guarantee"
7. "Managed service" explicit language
