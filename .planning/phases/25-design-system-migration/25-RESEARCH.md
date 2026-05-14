# Phase 25: Design System Migration - Research

**Researched:** 2026-05-14
**Domain:** Design tokens / CSS / Tailwind v4 / shadcn-ui primitives
**Confidence:** HIGH (tokens), MEDIUM-HIGH (UAT surface map), MEDIUM (interim quality bar / dark-mode policy)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Visual reference (locked)**
- **Source of truth:** `factory.ai` live site is the visual reference. Research/plan agents must inspect the live site for typography, spacing, hover states, micro-interactions, and any detail not spelled out in the roadmap.
- **Fidelity target:** Pixel-perfect to `factory.ai` look-and-feel for shared primitives (buttons, cards, inputs, forms, tabs, badges). AIDEAS is a customer SaaS portal, not a marketing site, but the visual system must feel identical to a user landing on factory.ai.
- **Conflict resolution between `factory.ai` and roadmap tokens:** Claude's Discretion — evaluate case-by-case during plan. Roadmap tokens (`#eeeeee`, `#fafafa`, `#ef6f2e`, Geist, radii 4/6/0) are the starting contract; factory.ai is the visual ground-truth for everything else.

**Definition of done (locked)**
- **Verification method:** Manual UAT by the developer across every existing screen.
- **UAT scope:** Customer dashboard (7 sections), admin dashboard (5 sections + layout), auth pages (login/signup/verify-email/etc.). All ~40 screens must pass visual inspection.
- **What "done" means in UAT:** If a screen is visually broken (overflow, bad contrast, broken layout) — fix it inside Phase 25. The phase does not ship until every existing screen renders acceptably under the new tokens.
- **UAT matrix:** Claude's Discretion — plan should propose a manageable matrix (likely `EN×ES × light × mobile+desktop` for Phase 25, with full dark validation deferred to where toggles exist). Justify the trade-off in the plan.

### Claude's Discretion

- **OKLCH → Factory token swap mechanics:** big-bang vs parallel-layer migration based on risk assessment.
- **Hardcoded Tailwind classes** (`bg-zinc-900`, `text-white`, `border-gray-200`, etc.): convert to semantic tokens when it removes risk; leave alone when it would balloon scope.
- **Phase 25 scope vs Phase 32/33 reskin scope:** Default expectation: 25 touches tokens + primitives + auth pages; 32/33 touch composed components. UAT-blocking rule means 25 may overflow.
- **Interim quality bar for screens awaiting reskin (Phase 32/33).**
- **Dark-mode quality bar:** simple inversion vs custom dark palette. Roadmap criterion #4 only requires `.dark` produce a usable variant for shadcn primitives.
- **Accent in dark mode:** same `#ef6f2e` or adjusted variant. Validate AA contrast.
- **Where dark gets validated in Phase 25:** customer dashboard has a toggle, admin doesn't (Phase 33 will add it).
- **Default theme on first visit:** light-always vs respect `prefers-color-scheme`.
- **Missing primitives (badge, tabs):** Create now in Phase 25 with Factory tokens, OR defer to consuming phase.
- **App-level components (KpiCards, ActivityFeed, AdminSidebar, etc.).**
- **Recharts palette (`--chart-1..5`):** define Factory-derived chart tokens in Phase 25, or defer to Phase 32.
- **CVA variants on Button/Card.**
- **Shadows / gradients cleanup scope:** eliminate everywhere now vs primitives + auth pages only.
- **Replacement pattern when removing a shadow:** `border 1px` (Factory-classic) vs background-contrast (`#fafafa` on `#eeeeee`).
- **Functional overlays (modal, dialog, dropdown):** strict "no shadows" vs allow `shadow-sm` for floating overlays.
- **Focus rings:** keep `ring` (box-shadow) for accessibility vs migrate focus to `outline 2px`.

### Deferred Ideas (OUT OF SCOPE)

- Admin language switcher + dark-mode toggle — Phase 33.
- Full reskin of composed customer/admin components — Phases 32 and 33.
- Public landing visual identity — Phase 28.
- Lint-debt triage and removal of `console.log` / unused code — Phase 34.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DESIGN-01 | Replace OKLCH theme with Factory.ai token set in `globals.css` (light-mode default: #eeeeee bg, #fafafa cards, #ef6f2e Code Orange accent) | Exact Factory tokens harvested from live CSS — see "Verified Factory.ai Tokens" below. globals.css currently uses 18 OKLCH `--color-*` vars + `--radius` — full enumeration in "Files to Touch (globals.css)". |
| DESIGN-02 | Typography system uses Geist Sans + Geist Mono with Factory spacing/sizing scale | Geist already loaded via `next/font` in `web/src/app/layout.tsx` (lines 7-15). Factory uses Tailwind v4 default scale — `text-xs`..`text-7xl` from .75rem to 4.5rem, weights 400/500/600/700, leading scale tight 1.25 / snug 1.375 / relaxed 1.625 / loose 2, tracking -.025em..+.05em. Code/numbers use `--font-geist-mono`. |
| DESIGN-03 | Border-radius normalization (4px buttons, 6px cards, 0px headers); no shadows, no gradients across components | Inventory: 50 shadow occurrences (counted via Grep, NOT 26 as initial estimate suggested) across ~35 files; 1 gradient (`top-automation-card.tsx`). Radius-token enumeration: Factory ships `--radius-xs` through `--radius-3xl` (.125–1.5rem). Roadmap wants 4px/6px/0px which maps cleanly to `sm`/`md`/`none`. |
| DESIGN-04 | Update shadcn primitives (Button, Card, Input, Badge, Tabs) to consume new tokens with zero regressions on existing screens | Existing primitives in `web/src/components/ui/`: button.tsx, card.tsx, form.tsx, input.tsx, label.tsx (5 files). Badge and Tabs **do not exist** — confirmed via directory listing. Status pills are inline in `components/dashboard/status-badge.tsx` (custom CVA, not the shadcn Badge contract). Tabs are inline DOM `<div role="tablist">` in `automations-filter-tabs.tsx`, `admin-requests-tabs.tsx`, etc. (no Radix). Decision required (Discretion): scaffold Badge + Tabs now, or defer. |
| DESIGN-05 | Optional dark-mode tokens defined for the new palette so the existing `.dark` class continues to work without visual breakage | Factory ships a dark-first palette with a `[data-theme=light]` invert. Aideas needs the inverse: light-first with `.dark` invert. Recommended approach: derive `.dark` from Factory's neutral-100..1000 scale (`#d6d3d2` light → `#1f1d1c` near-black). Accent stays `#ef6f2e` in both modes (Factory does the same). |
</phase_requirements>

## Summary

Factory.ai is a **dark-first marketing site** built with Next.js 16 + Tailwind v4 + Geist that exposes a `[data-theme=light]` invert. Aideas needs to **invert the inversion**: ship light-first to match the roadmap (`#eeeeee` bg, `#fafafa` cards) and keep `.dark` as a usable variant. Every Factory token is HEX, not OKLCH — so the migration **fully replaces the existing OKLCH layer** in `web/src/app/globals.css` (no parallel-layer hybrid recommended; the OKLCH and Factory scales don't compose cleanly).

The hardcoded-Tailwind problem is **larger than it looks**: 700 occurrences of `text-{color}` literals across 91 files, 175 occurrences of `border-{color}-N` across 62 files, 134 occurrences of `purple/orange/emerald-N` across 56 files. The current "purple" brand color (`bg-purple-600`, `text-purple-600`, `border-purple-500`) is wired into 56 files and **must be the Phase 25 token-swap target** because every "branded" surface uses it. Touching all 91 files is out of scope for Phase 25 (UAT-blocking would balloon); the recommendation is to **swap globals.css + the 5 shadcn primitives + every `purple-*` literal** (the brand-mapping subset, ~56 files), defer the rest to Phases 32/33.

Shadows: 50 `shadow-*` occurrences (functional + decorative) across ~35 files; 1 gradient (`top-automation-card.tsx`). Removing shadows from primitives is cheap and on-charter; removing them from composed cards/modals creates layout work that should live in 32/33 — except where it breaks `#fafafa-on-#eeeeee` contrast (white card on white bg — see "Risks").

**Primary recommendation:** Big-bang `globals.css` rewrite + scaffold Badge + Tabs + Chart shadcn primitives + reskin the 5 existing primitives + brand-token swap (`purple-* → accent-*`) across the 56 brand-color files. Defer composed-component shadow/border refactors to 32/33 unless UAT flags them as broken.

## Verified Factory.ai Tokens (HIGH confidence — extracted from live `de50a359a1209834.css`)

### Color Palette (HEX, not OKLCH)

```css
/* Factory.ai exact tokens, harvested 2026-05-14 from production CSS */

/* Surface neutrals (warm grayscale, slight brown undertone) */
--neutral-100:  #d6d3d2;
--neutral-200:  #ccc9c7;
--neutral-300:  #b8b3b0;
--neutral-400:  #a49d9a;
--neutral-500:  #8a8380;
--neutral-600:  #5c5855;
--neutral-700:  #4d4947;
--neutral-800:  #3d3a39;
--neutral-900:  #2e2c2b;
--neutral-1000: #1f1d1c;

/* Brand: Code Orange */
--accent-100: #ef6f2e;   /* primary CTA / focus / active */
--accent-200: #ee6018;   /* hover */
--accent-300: #d15010;   /* pressed / dark variant */

/* Base surfaces */
--dark-base-primary:    #020202;   /* near-black page bg in dark mode */
--dark-base-secondary:  #101010;   /* elevated surface in dark mode */
--light-base-primary:   #eee;      /* page bg in light mode (matches roadmap #eeeeee) */
--light-base-secondary: #fafafa;   /* card surface in light mode (matches roadmap #fafafa) */
```

### Typography (Tailwind v4 default scale, retained)

```css
--text-xs:   .75rem;     /* 12px — captions, badges */
--text-sm:   .875rem;    /* 14px — body small, table cells */
--text-base: 1rem;       /* 16px — body */
--text-lg:   1.125rem;   /* 18px — emphasized body */
--text-xl:   1.25rem;    /* 20px — section subhead */
--text-2xl:  1.5rem;     /* 24px — h3 */
--text-3xl:  1.875rem;   /* 30px — h2 */
--text-4xl:  2.25rem;    /* 36px — h1 */
--text-5xl:  3rem;       /* 48px — hero */
--text-6xl:  3.75rem;    /* 60px — landing hero */
--text-7xl:  4.5rem;     /* 72px — landing display */

--font-weight-normal:   400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;

--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-relaxed: 1.625;
--leading-loose:   2;

--tracking-tight:  -.025em;
--tracking-normal: 0em;
--tracking-wide:   .025em;
--tracking-wider:  .05em;

--default-font-family:      var(--font-geist-sans);
--default-mono-font-family: var(--font-geist-mono);
```

### Border Radius

```css
--radius-xs:  .125rem;   /*  2px — tags, chips */
--radius-sm:  .25rem;    /*  4px — BUTTONS (per roadmap) */
--radius-md:  .375rem;   /*  6px — CARDS (per roadmap) */
--radius-lg:  .5rem;     /*  8px */
--radius-xl:  .75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
/* Headers per roadmap: explicit border-radius: 0 — no token needed */
```

### Focus Ring (Factory's actual implementation)

```css
:focus-visible {
  outline-offset: 2px;
  outline: 1px solid var(--color-light-base-secondary);
  border-radius: 2px;
}
```

Factory uses **`outline`**, not `box-shadow ring`. This is honest to the "no shadows" rule but breaks the existing shadcn `focus-visible:ring-[3px]` convention. Recommendation: keep shadcn's `ring-` (it's an accessibility shortcut and the rule applies to *decorative* shadows, not WCAG-required focus indicators). Plan should call this out as a deliberate divergence.

### Selection / Hover

```css
::selection {
  background-color: var(--color-accent-100);  /* #ef6f2e */
  color: var(--color-dark-base-primary);
}
```

### Where Code Orange is Applied (HIGH confidence from CSS classes seen)

- `.text-accent-100` — primary text accent
- `.bg-accent-100` — primary CTA background
- `.text-accent-200` — hover text
- `.text-accent-300` — pressed
- `::selection` background
- Border on focused inputs (inferred — Factory uses `--color-base-800` on default borders, accent on active)

**Aideas mapping:** every legacy `purple-600` becomes `accent-100` (`#ef6f2e`). Every legacy `purple-700` (hover) becomes `accent-200` (`#ee6018`). Every legacy `purple-100` (light tinted bg used for active-tab pill, ribbon) becomes `accent-100/10` or `accent-100/15` via `color-mix(in oklab, var(--color-accent-100) 10%, transparent)`.

## Standard Stack

### Core (already installed — versions verified from `web/package.json`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4 (`tailwindcss`, `@tailwindcss/postcss`) | Utility CSS + token engine | Phase 25 globals.css IS the Tailwind v4 `@theme` config — no `tailwind.config.js` |
| tw-animate-css | ^1.4.0 | Animation utilities | Already imported on line 2 of globals.css; replacement for deprecated `tailwindcss-animate` |
| Geist | via `next/font/google` | Sans + Mono fonts | Already wired in `web/src/app/layout.tsx`; matches Factory.ai exactly (same font, same weight range 100-900) |
| class-variance-authority | ^0.7.1 | Variant systems on primitives | Used today in button.tsx, status-badge.tsx |
| tailwind-merge | ^3.4.0 | `cn()` utility | Used today in `web/src/lib/utils.ts` |
| clsx | ^2.1.1 | Class composition | Used today |
| radix-ui | ^1.4.3 | Headless primitives (one-package umbrella) | Already used (Slot in button); needed for Tabs primitive (`@radix-ui/react-tabs` is shipped inside the umbrella `radix-ui` ^1.4 package) |

### Supporting (to add or scaffold during this phase)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn CLI | latest | Scaffold Badge, Tabs, Chart primitives | One-shot install (`pnpm dlx shadcn@latest add badge tabs chart`) — will overwrite `components/ui/*.tsx` and append to globals.css. **Risk:** the CLI will rewrite our globals.css on a fresh init unless we run only `add` commands |
| recharts | ^3.8.1 (already installed) | Chart rendering for shadcn `chart` primitive | Already a dependency — no install needed |

### Don't Install

- ❌ NO new color libraries (chroma-js, color2k, polished). Factory tokens are static HEX.
- ❌ NO `tailwind-variants` — keep `class-variance-authority` (already used, fewer dependencies).
- ❌ NO Framer Motion / GSAP for "no animations" Factory aesthetic. (`tw-animate-css` covers any micro-motion need.)

**Installation:**
```bash
# From web/ directory:
pnpm dlx shadcn@latest add badge tabs chart
# OR (npm equivalent):
npx shadcn@latest add badge tabs chart
# (Project doesn't use pnpm yet; npm scripts are in use per package.json)
```

## Architecture Patterns

### Token Layer (`web/src/app/globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Map tokens to Tailwind utility names */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);            /* = accent-100 */
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);              /* = accent-100 */
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);                  /* = accent-100 */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --radius-sm: 0.25rem;   /*  4px — buttons */
  --radius-md: 0.375rem;  /*  6px — cards */
  --radius-lg: 0.5rem;    /*  8px — modals/popovers */
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
}

:root {
  /* Light mode = Factory's [data-theme=light] inverted to default */
  --background: #eeeeee;          /* light-base-primary */
  --foreground: #1f1d1c;          /* neutral-1000 — body text */
  --card: #fafafa;                /* light-base-secondary */
  --card-foreground: #1f1d1c;
  --popover: #fafafa;
  --popover-foreground: #1f1d1c;
  --primary: #ef6f2e;             /* accent-100 */
  --primary-foreground: #ffffff;
  --secondary: #d6d3d2;           /* neutral-100 */
  --secondary-foreground: #1f1d1c;
  --muted: #d6d3d2;
  --muted-foreground: #5c5855;    /* neutral-600 */
  --accent: #ef6f2e;
  --accent-foreground: #ffffff;
  --destructive: #d15010;         /* accent-300 — re-use, no new red token unless plan adds */
  --border: #d6d3d2;              /* neutral-100 — 1px borders replace shadows */
  --input: #d6d3d2;
  --ring: #ef6f2e;                /* accent on focus */

  /* Chart palette derived from Factory neutrals + accent */
  --chart-1: #ef6f2e;
  --chart-2: #5c5855;
  --chart-3: #8a8380;
  --chart-4: #b8b3b0;
  --chart-5: #ee6018;

  /* Sidebar (customer dashboard nav, admin sidebar) */
  --sidebar: #fafafa;
  --sidebar-foreground: #1f1d1c;
  --sidebar-primary: #ef6f2e;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #d6d3d2;
  --sidebar-accent-foreground: #1f1d1c;
  --sidebar-border: #d6d3d2;
  --sidebar-ring: #ef6f2e;

  --radius: 0.375rem;             /* card default; buttons override to 0.25rem; headers to 0 */
}

.dark {
  /* Dark mode = Factory's default dark palette */
  --background: #020202;          /* dark-base-primary */
  --foreground: #d6d3d2;          /* neutral-100 — body text on dark */
  --card: #101010;                /* dark-base-secondary */
  --card-foreground: #d6d3d2;
  --popover: #101010;
  --popover-foreground: #d6d3d2;
  --primary: #ef6f2e;             /* accent unchanged in dark mode (Factory does the same) */
  --primary-foreground: #020202;
  --secondary: #2e2c2b;           /* neutral-900 */
  --secondary-foreground: #d6d3d2;
  --muted: #2e2c2b;
  --muted-foreground: #a49d9a;    /* neutral-400 */
  --accent: #ef6f2e;
  --accent-foreground: #020202;
  --destructive: #ee6018;         /* accent-200 brighter on dark */
  --border: #3d3a39;              /* neutral-800 */
  --input: #3d3a39;
  --ring: #ef6f2e;

  --chart-1: #ef6f2e;
  --chart-2: #a49d9a;
  --chart-3: #8a8380;
  --chart-4: #5c5855;
  --chart-5: #ee6018;

  --sidebar: #101010;
  --sidebar-foreground: #d6d3d2;
  --sidebar-primary: #ef6f2e;
  --sidebar-primary-foreground: #020202;
  --sidebar-accent: #2e2c2b;
  --sidebar-accent-foreground: #d6d3d2;
  --sidebar-border: #3d3a39;
  --sidebar-ring: #ef6f2e;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";  /* Geist character variants — optional */
  }
}
```

### Pattern: Primitive Reskin (Button)

**What:** keep CVA structure, swap variant classes from current OKLCH-mapped tokens to Factory tokens. Drop `shadow-xs` from `outline` variant, swap `rounded-md` for explicit `rounded-sm` (4px per roadmap).

**Example (Button — recommended after migration):**
```tsx
// web/src/components/ui/button.tsx — buttonVariants base
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap " +
  "rounded-sm text-sm font-medium transition-colors " +  // rounded-sm = 4px (was rounded-md)
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +  // accent ring
  "aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",  // accent CTA
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent/10 hover:text-foreground",  // no shadow
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: { /* unchanged from current button.tsx */ },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

### Pattern: Card (Reskin)

**What:** drop `shadow-sm`, drop `rounded-xl`, drop `gap-6 py-6` (Factory cards are tighter). Use `rounded-md` (6px per roadmap) and rely on `border` + `bg-card` (`#fafafa`) on `#eeeeee` page bg for separation.

```tsx
// web/src/components/ui/card.tsx — Card root after migration
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-md border border-border " +  // 6px, no shadow
        "flex flex-col gap-4 p-6",                                          // tighter than current gap-6
        className
      )}
      {...props}
    />
  );
}
```

### Pattern: Badge (Scaffold — Factory variant)

**What:** scaffold via `npx shadcn@latest add badge`, then swap variant classes to use Factory accent + neutral. Keep the existing inline `status-badge.tsx` until Phase 32 (don't refactor 30+ call sites here).

### Pattern: Tabs (Scaffold — Factory line variant)

**What:** scaffold via `npx shadcn@latest add tabs`, prefer the `line` variant (`underline-from-bottom` style) which matches Factory's tab interaction. Keep the inline `automations-filter-tabs.tsx`, `admin-requests-tabs.tsx`, etc. until Phase 32/33 — they will be refactored to use the new primitive then.

### Pattern: Chart (Scaffold)

**What:** scaffold via `npx shadcn@latest add chart`, exposing `<ChartContainer>`, `<ChartTooltip>`, `<ChartTooltipContent>`. Phase 32 will refactor `reports-weekly-chart.tsx`, `weekly-bar-chart.tsx`, `automation-success-rate.tsx`, `automation-performance.tsx` to use it. **Phase 25 deliverable:** the primitive lives in `components/ui/chart.tsx` and the `--chart-1..5` tokens exist; Phase 32 does the consumption.

### Anti-Patterns to Avoid

- **Don't keep both OKLCH and HEX tokens side-by-side.** They will drift. Big-bang the swap.
- **Don't introduce a new "purple" token.** The brand is Code Orange now. Every `purple-600` literal is a brand-color leak that must become `accent` / `primary` / `ring` (token, not literal).
- **Don't refactor every `text-gray-X`/`bg-gray-X`/`border-gray-X` to tokens in this phase.** Scope creep. Only swap when the file is also being touched for primitive reasons.
- **Don't write a custom `ThemeProvider`.** The `.dark` class on `<html>` toggle (already wired via shadcn convention) is sufficient. Customer dashboard already has the toggle; admin gets it in Phase 33.
- **Don't add box-shadow back as "subtle elevation".** Factory's discipline is the differentiator; if a card looks lost on the page, increase border contrast or use `bg-card` lift, not shadow.
- **Don't run `npx shadcn@latest init`** — it will rewrite globals.css. Run only `add` commands.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Light/dark theme toggle | Custom React context + localStorage | shadcn convention — `.dark` class on `<html>`, toggled by a small client component | Already supported by `@custom-variant dark (&:is(.dark *))` in globals.css; no provider needed |
| Color palette tools | `chroma.js`, runtime color-mixing | Static HEX tokens + `color-mix(in oklab, ...)` in CSS | Factory uses `color-mix` for `/80` `/95` opacity utilities — pure Tailwind v4 native |
| Tabs (Radix-based) | DOM `role="tablist"` divs (current pattern) | shadcn `Tabs` primitive (Radix under the hood) | Keyboard a11y, `aria-selected`, focus management, RTL support all free |
| Badges | Custom CVA per surface | shadcn `Badge` primitive | Variant system unified across customer + admin |
| Chart styling | Hardcoded hex in Recharts components (`fill="#a855f7"`) | shadcn `chart` primitive with `--chart-1..5` CSS vars | Theme-aware (auto switches in `.dark`), no hardcoded colors |
| Focus indicators | Custom outline math | Tailwind `focus-visible:ring-N` driven by `--ring` token | WCAG-compliant, theme-aware |
| Border vs shadow for elevation | Re-introduce `shadow-sm` because card looks flat | `border border-border` + `bg-card` contrast against `bg-background` | Honors Factory's "no shadows" rule; design discipline |

**Key insight:** the entire migration is a *token swap + primitive reskin*. There is no novel logic to write. Every "design problem" has a known answer in the shadcn/Tailwind v4 stack — the work is wiring, not invention.

## Common Pitfalls

### Pitfall 1: White Card on White Background

**What goes wrong:** `bg-card` (`#fafafa`) on `bg-background` (`#eeeeee`) is only ~2% luminance contrast. Cards become invisible without a border.
**Why it happens:** Roadmap mandates these specific values; they're tighter than typical "white-on-gray" contrast (which is ~10%).
**How to avoid:** Every card MUST have `border border-border` (`#d6d3d2`). The `Card` primitive bakes this in; any composed card built without `<Card>` (e.g. inline `<div>` with `bg-white rounded-xl shadow-sm`) needs the border added when the shadow is removed. Audit checklist: every removed `shadow-sm` ↔ added `border`.
**Warning signs:** UAT screenshots where a card disappears into the page; reviewer says "I can't tell where the card ends."

### Pitfall 2: `purple-600` Survives the Swap

**What goes wrong:** brand color leak — surfaces still show purple where Code Orange was expected (active tab underline, focused input ring, primary CTA).
**Why it happens:** `purple-*` literals in 56 files, easy to miss without grep automation.
**How to avoid:** Plan must include a Wave that does a global find-replace pass: `bg-purple-600` → `bg-primary`, `text-purple-600` → `text-primary`, `border-purple-500` → `border-primary`, `hover:bg-purple-700` → `hover:bg-primary/90`, `focus:ring-purple-500` → `focus:ring-primary`. The `bg-purple-100` (light tinted bg for active tab pill) → `bg-primary/10`.
**Warning signs:** anything purple in the UAT screenshots after migration.

### Pitfall 3: shadcn CLI overwrites globals.css on init

**What goes wrong:** running `npx shadcn@latest init` regenerates globals.css with the default Tailwind v4 theme, wiping the Factory tokens.
**Why it happens:** the CLI's init flow assumes a fresh project; it doesn't merge.
**How to avoid:** never run `init`. Only run `npx shadcn@latest add badge tabs chart`. If `components.json` is missing, hand-write it (template at https://ui.shadcn.com/docs/installation/manual) BEFORE running `add`.
**Warning signs:** globals.css has more than ~150 lines after a CLI command, or your Factory tokens are gone.

### Pitfall 4: `tw-animate-css` enter/exit animations conflict with "no motion" policy

**What goes wrong:** Factory's discipline is "no shadows, no gradients" — but Phase 25 doesn't explicitly forbid animation. shadcn primitives use `data-[state=open]:animate-in fade-in-0 zoom-in-95` — which is fine, but if Factory feels totally static and you want fidelity, drop them.
**Why it happens:** shadcn defaults include enter/exit animations.
**How to avoid:** Decision (Discretion): keep the default tw-animate-css behavior (matches modern UI; users expect dropdowns to fade in). Document this as an explicit divergence from "Factory feels static" if a stakeholder asks.
**Warning signs:** UAT feedback "feels too animated."

### Pitfall 5: `outline-ring/50` global selector breaks contrast on dark mode

**What goes wrong:** `* { outline-color: var(--ring) / 50% }` makes every focusable element show a translucent orange ring that may fail AA contrast in dark mode (orange on near-black is ~4:1 — borderline).
**Why it happens:** Current `globals.css` line 121: `* { @apply border-border outline-ring/50; }` applies globally.
**How to avoid:** Verify orange-on-dark ring contrast in UAT; if it fails, increase to `outline-ring/70` or use a lighter border-only outline in dark mode.
**Warning signs:** focus rings look "muddy" or hard to see in dark mode.

### Pitfall 6: Modal/dropdown shadow removal makes overlays look flat

**What goes wrong:** a modal at z-50 with no shadow looks pasted onto the page; users lose the "this is a layer above" cue.
**Why it happens:** "no shadows" applied literally to overlays.
**How to avoid:** Decision (Discretion): keep `shadow-lg` ONLY on `radix-dialog-content`, `radix-popover-content`, `radix-dropdown-menu-content`, `radix-tooltip-content`. Document as "functional shadows for overlays — not decorative." Justify in the plan.
**Warning signs:** UAT feedback "the modal blends into the page."

### Pitfall 7: Recharts `fill` prop doesn't read CSS variables

**What goes wrong:** `<Bar fill="var(--color-chart-1)" />` does NOT work — Recharts needs computed values, not CSS-var strings, for SVG fill in some versions.
**Why it happens:** SVG attribute parsing.
**How to avoid:** If migrating any chart in Phase 25 (recommend: defer to Phase 32), wrap with shadcn's `ChartContainer` which uses inline `style={{ "--color-name": "..." }}` injection. Chart primitive scaffolding alone is fine; consumption happens later.
**Warning signs:** chart bars render black or transparent after migration.

### Pitfall 8: Geist character variants disabled

**What goes wrong:** Geist looks slightly off compared to Factory because `font-feature-settings` aren't set.
**Why it happens:** Factory uses `cv02 cv03 cv04 cv11` (curly tails on `g`, `l`, alternative `0`).
**How to avoid:** add `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` to `body` in globals.css (optional polish — verify via side-by-side screenshot before deciding).
**Warning signs:** typography "looks" right but doesn't match Factory in detailed comparison.

## Code Examples

### Verified Factory.ai globals.css fragment (extracted from production CSS)

```css
/* Source: https://factory.ai/_next/static/css/de50a359a1209834.css */
@layer theme {
  :host, :root {
    /* Surface neutrals */
    --neutral-100:#d6d3d2; --neutral-200:#ccc9c7; --neutral-300:#b8b3b0;
    --neutral-400:#a49d9a; --neutral-500:#8a8380; --neutral-600:#5c5855;
    --neutral-700:#4d4947; --neutral-800:#3d3a39; --neutral-900:#2e2c2b;
    --neutral-1000:#1f1d1c;

    /* Brand */
    --accent-100:#ef6f2e; --accent-200:#ee6018; --accent-300:#d15010;

    /* Base */
    --dark-base-primary:#020202; --dark-base-secondary:#101010;
    --light-base-primary:#eee;   --light-base-secondary:#fafafa;

    /* Tailwind v4 theme map */
    --color-background: var(--dark-base-primary);    /* DARK is default for factory.ai */
    --color-foreground: var(--light-base-primary);
    --color-accent-100: var(--accent-100);
    --color-base-100:   var(--neutral-100);
    /* ...neutrals 100..1000 mapped... */
  }
}

/* Light invert */
.invert-color-scheme, [data-theme=light] {
  --color-background: var(--light-base-primary);
  --color-foreground: var(--dark-base-primary);
  /* ...neutrals reversed... */
}

/* Global focus (no shadow) */
:focus-visible {
  outline-offset: 2px;
  outline: 1px solid var(--color-light-base-secondary);
  border-radius: 2px;
}
```

### Aideas globals.css (full target — see Architecture Patterns section above)

(Already shown in Architecture Patterns → Token Layer.)

### Brand-color literal swap regex (for the Wave doing global find-replace)

```bash
# Run from web/src — preview only (no -i):
grep -rn "purple-\(50\|100\|200\|300\|400\|500\|600\|700\|800\|900\|950\)" .

# Common substitution patterns (apply per-file, NOT blind sed):
#   bg-purple-600         → bg-primary
#   bg-purple-700         → bg-primary
#   hover:bg-purple-700   → hover:bg-primary/90
#   text-purple-600       → text-primary
#   text-purple-700       → text-primary
#   text-purple-400       → text-primary  (dark variant; ok because --primary stable across themes)
#   border-purple-500     → border-primary
#   border-purple-600     → border-primary
#   focus:ring-purple-500 → focus:ring-primary  (ring-2 if currently ring-1)
#   bg-purple-100         → bg-primary/10
#   bg-purple-900/40      → bg-primary/15
#   text-purple-300       → text-primary
```

## State of the Art

| Old Approach (current Aideas) | New Approach (Factory + this phase) | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OKLCH custom palette in globals.css (18 vars) | Static HEX Factory palette (10 neutrals + 3 accents + 4 base surfaces) | This phase | All surfaces re-render in Factory grayscale + Code Orange |
| `purple-600` as de-facto brand color | `--primary: #ef6f2e` (Code Orange) via token | This phase | Brand identity changes; 56 files need literal-to-token swap |
| `shadow-sm` for card elevation | `border border-border` for card separation | This phase (primitives + auth pages) / Phase 32-33 (composed) | Flatter, more disciplined visual; risk of low contrast (see pitfall 1) |
| `rounded-xl` (12px) for cards | `rounded-md` (6px) for cards | This phase | Cards look less "soft", more business-like |
| Recharts hardcoded `fill="#a855f7"` | shadcn `chart` primitive + `--chart-1..5` tokens | Primitive scaffolded this phase; consumed in Phase 32 | Charts will be theme-aware after Phase 32 |
| Inline `<div role="tablist">` tabs | shadcn `Tabs` primitive (Radix) | Primitive scaffolded this phase; consumed in Phase 32-33 | Better keyboard a11y |
| Inline status-badge.tsx with Tailwind colors | Keep status-badge.tsx + add shadcn `Badge` primitive | This phase | Two coexist (different purposes — status colors vs neutral badge) |
| `tailwindcss-animate` (deprecated) | `tw-animate-css` (already installed v1.4.0) | Already done pre-phase | No action |

**Deprecated/outdated:**
- OKLCH theme: not deprecated upstream (shadcn defaults still ship OKLCH), but **deprecated for Aideas** as of this phase.
- `tailwindcss-animate`: deprecated upstream Q4 2025; replaced by `tw-animate-css`. Aideas already migrated.

## Files to Touch (Inventory)

### Tier 1 — Must touch (Phase 25 core scope)

| File | Reason | Effort |
|------|--------|--------|
| `web/src/app/globals.css` | Token rewrite (the entire CSS block from line 49 onward) | M |
| `web/src/components/ui/button.tsx` | Variant reskin: rounded-sm, drop shadow, accent primary | S |
| `web/src/components/ui/card.tsx` | Drop shadow, rounded-md, tighter padding | S |
| `web/src/components/ui/input.tsx` | Drop shadow, rounded-sm, ring uses --ring | S |
| `web/src/components/ui/form.tsx` | Verify focus + error states match new tokens | XS |
| `web/src/components/ui/label.tsx` | Verify text-foreground works | XS |
| `web/src/components/ui/badge.tsx` | **NEW** — scaffold via shadcn CLI, then reskin variants | S |
| `web/src/components/ui/tabs.tsx` | **NEW** — scaffold via shadcn CLI, then reskin variants | S |
| `web/src/components/ui/chart.tsx` | **NEW** — scaffold via shadcn CLI (no consumption in 25; Phase 32 wires it) | S |

### Tier 2 — Auth pages (Phase 25 scope per CONTEXT.md)

| File | Reason | Effort |
|------|--------|--------|
| `web/src/app/(auth)/login/page.tsx` | Auth surface scoped to Phase 25 | S |
| `web/src/app/(auth)/signup/page.tsx` | Same | S |
| `web/src/app/(auth)/verify-email/page.tsx` | Same; uses `shadow-sm rounded-xl` card pattern | S |
| `web/src/app/(auth)/forgot-password/page.tsx` | Same | S |
| `web/src/app/(auth)/reset-password/page.tsx` | Same | S |
| `web/src/app/(auth)/complete-registration/page.tsx` | Same | S |
| `web/src/components/auth/login-form.tsx` | Uses primitives; auto-reskinned + remove hardcoded purple | S |
| `web/src/components/auth/reset-password-form.tsx` | Same | S |
| `web/src/components/auth/password-strength-bar.tsx` | Hardcoded green/red literals — verify | XS |
| `web/src/app/(legal)/terms/page.tsx` | Uses Card pattern with shadow-sm | XS |
| `web/src/app/(legal)/privacy/page.tsx` | Same | XS |

### Tier 3 — Brand-color literal swap pass (mandatory in Phase 25 per "no purple survives")

56 files containing `purple-*` literals. Plan should batch into 1-2 Waves doing per-file regex-driven swap. **Top 10 by occurrence count (highest leverage):**

| File | Purple count | Action |
|------|------|--------|
| `web/src/components/admin/catalog/admin-template-form.tsx` | 9 | Inputs use `focus:ring-purple-500` — swap to `focus:ring-primary` |
| `web/src/components/admin/clients/admin-client-detail.tsx` (and tabs) | ~10 | Likely active-tab indicators — swap to `border-primary text-primary` |
| `web/src/components/dashboard/settings-profile-card.tsx` | 6 | Form ring + active state |
| `web/src/components/dashboard/nav.tsx` | 5 | Active-link indicator (sidebar) |
| `web/src/components/admin/catalog/admin-catalog-client.tsx` | 6 | Active filter chip |
| `web/src/components/admin/automations/admin-automation-detail.tsx` | 5 | Tab/active indicators |
| `web/src/app/(dashboard)/dashboard/billing/page.tsx` | 3 | CTAs |
| `web/src/components/dashboard/automation-list.tsx` | 3 | Filter active state |
| `web/src/components/dashboard/dashboard-header.tsx` | 1 | CTA accent |
| `web/src/components/dashboard/automations-filter-tabs.tsx` | 2 | Active tab underline + count pill |

(Full 56-file list lives in the grep output run during planning; planner can re-run `grep -rln "purple-" web/src` to enumerate.)

### Tier 4 — Defer to Phase 32 (Customer Reskin)

All `web/src/components/dashboard/*.tsx` files NOT in Tier 3 (composed cards using `bg-white shadow-sm rounded-xl border-gray-200` patterns). ~25 files. The shadow-on-white-card pattern needs decisions per-component (border-only vs background-contrast lift).

### Tier 5 — Defer to Phase 33 (Admin Reskin)

All `web/src/components/admin/*.tsx` files NOT in Tier 3, plus `web/src/app/(admin)/admin/layout.tsx`, admin-sidebar, admin-header. AdminLayout currently uses `bg-gray-100 dark:bg-gray-950` literal — survive into 33.

### Tier 6 — Hardcoded color hex inside JS (not CSS) — must address

| File | Line | Hardcoded value | Replacement strategy |
|------|------|-----------------|---------------------|
| `web/src/components/dashboard/reports-weekly-chart.tsx` | 65 | `fill="#a855f7"` | Defer to Phase 32 (chart primitive consumption); for Phase 25, change to `fill="#ef6f2e"` to keep the bar visible without breaking the chart |
| `web/src/components/dashboard/reports-weekly-chart.tsx` | 61 | `border: "1px solid #e5e7eb"` (Tooltip style) | Same — defer or temporarily change to `#d6d3d2` |
| `web/src/components/dashboard/weekly-bar-chart.tsx` | (similar pattern) | Verify | Same |
| `web/src/components/dashboard/automation-success-rate.tsx` | (Recharts) | Verify | Same |
| `web/src/components/dashboard/automation-performance.tsx` | (Recharts) | Verify | Same |

### Tier 7 — Gradient cleanup (1 file)

| File | Pattern | Action |
|------|---------|--------|
| `web/src/components/dashboard/top-automation-card.tsx:23` | `bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-400/80 dark:to-pink-400/80` | Replace with `bg-primary text-primary-foreground` (solid Code Orange card). Verify via UAT — this is a hero-style call-out and may need a different solution if the visual emphasis is lost |

## UAT Surface Map (~40 routes)

### Customer dashboard (`(dashboard)` group, locale × theme × viewport matrix)

| Route | Component file | Notes |
|-------|---------------|-------|
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | KpiCards, ActivityFeed, AutomationList, weekly-bar-chart |
| `/dashboard/automations` | `(dashboard)/dashboard/automations/page.tsx` | filter tabs (purple), table |
| `/dashboard/automations/[id]` | `(dashboard)/dashboard/automations/[id]/page.tsx` | detail header + execution timeline |
| `/dashboard/catalog` | `(dashboard)/dashboard/catalog/page.tsx` | catalog-client + filters |
| `/dashboard/catalog/[slug]` | `(dashboard)/dashboard/catalog/[slug]/page.tsx` | template detail + request CTA (purple) |
| `/dashboard/reports` | `(dashboard)/dashboard/reports/page.tsx` | charts (Recharts hardcoded), KPI cards, breakdown table |
| `/dashboard/billing` | `(dashboard)/dashboard/billing/page.tsx` | summary card, payments history, charges table |
| `/dashboard/settings` | `(dashboard)/dashboard/settings/page.tsx` | profile, preferences, security cards |
| `/dashboard/notifications` | `(dashboard)/dashboard/notifications/page.tsx` | list with shadow-sm wrapper |

### Admin dashboard (`(admin)` group)

| Route | Component file | Notes |
|-------|---------------|-------|
| `/admin` | `(admin)/admin/page.tsx` | KPIs, quick links, activity feed |
| `/admin/catalog` | `(admin)/admin/catalog/page.tsx` | template list (purple CTA) |
| `/admin/catalog/new` | `(admin)/admin/catalog/new/page.tsx` | form (purple ring) |
| `/admin/catalog/[slug]/edit` | `(admin)/admin/catalog/[slug]/edit/page.tsx` | same |
| `/admin/requests` | `(admin)/admin/requests/page.tsx` | tabs + table |
| `/admin/requests/[id]` | `(admin)/admin/requests/[id]/page.tsx` | detail + approve/reject modals |
| `/admin/automations` | `(admin)/admin/automations/page.tsx` | tabs + filters + table |
| `/admin/automations/[id]` | `(admin)/admin/automations/[id]/page.tsx` | detail + KPIs + timeline |
| `/admin/clients` | `(admin)/admin/clients/page.tsx` | search + table |
| `/admin/clients/[id]` | `(admin)/admin/clients/[id]/page.tsx` | client detail + 4 tabs |

### Auth surfaces (`(auth)` group + `(admin-auth)` group)

| Route | File |
|-------|------|
| `/login` | `(auth)/login/page.tsx` |
| `/signup` | `(auth)/signup/page.tsx` |
| `/verify-email` | `(auth)/verify-email/page.tsx` |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` |
| `/reset-password` | `(auth)/reset-password/page.tsx` |
| `/complete-registration` | `(auth)/complete-registration/page.tsx` |
| `/admin/login` | `(admin-auth)/admin/login/page.tsx` (currently `bg-gray-900` dark-themed login — decide: keep dark-only OR convert to light) |

### Legal pages

| Route | File |
|-------|------|
| `/terms` | `(legal)/terms/page.tsx` |
| `/privacy` | `(legal)/privacy/page.tsx` |

### Recommended UAT matrix

**Tight (recommended for Phase 25):** every route × `EN` × `ES` × `light` × `desktop (≥1024px) + mobile (375px)` = 26 routes × 2 locales × 1 theme × 2 viewports = **104 visual checks**.

**Dark validation (subset — only where toggle exists):** ~9 customer dashboard routes × `light` `+` `dark` = +9 checks. Admin dark deferred to Phase 33 (no toggle yet).

**Total Phase 25 UAT: ~113 visual checks.** Manageable in a 2-4 hour focused UAT pass.

## Open Questions

1. **Should the admin login page (`/admin/login`) keep its current dark-themed look (`bg-gray-900`)?**
   - What we know: it's intentionally distinct from customer login; visually signals "admin context"
   - What's unclear: does Factory tokens preserve this distinction? (yes — `bg-dark-base-primary` is `#020202`, even darker than current `gray-900`)
   - Recommendation: **keep dark-themed** but swap literal grays for `bg-dark-base-primary` / `bg-dark-base-secondary` tokens; orange accent stays. Document as "admin-login is intentionally dark in both light- and dark-mode."

2. **Should Phase 25 swap chart hardcoded colors (`#a855f7`)?**
   - What we know: 4 chart components use hardcoded purple/gray hex; defer-vs-now is discretionary per CONTEXT.md
   - What's unclear: would a half-fix (orange bar but purple-styled tooltip) look worse than waiting for Phase 32?
   - Recommendation: **swap the bar fill to `#ef6f2e` in this phase** (one-line change per file, brand consistency); leave tooltip styling for Phase 32 when the chart primitive is consumed. Total: ~5 single-line edits.

3. **Should the gradient on `top-automation-card.tsx` become a solid Code Orange card or stay decorative with a different non-gradient solution?**
   - What we know: gradient is the only "decorative" gradient in the codebase
   - What's unclear: does the dashboard "top automation" callout need visual prominence beyond `bg-primary`?
   - Recommendation: **try `bg-primary` first**; if UAT says it's too loud (orange takes the eye away from primary CTAs), switch to `bg-card border-2 border-primary` (highlighted card pattern).

4. **Should we adopt Geist's character variants (`cv02`, `cv03`, `cv04`, `cv11`)?**
   - What we know: Factory uses them; pixel-perfect fidelity is the locked target
   - What's unclear: do they meaningfully change AIDEAS appearance, or are they cosmetic?
   - Recommendation: **add them in body styles** in globals.css. Cost is zero; matches Factory exactly.

5. **Default theme on first visit — light always, or `prefers-color-scheme`?**
   - What we know: Factory.ai is dark-first; their site auto-detects and shows dark for users with dark OS preference
   - What's unclear: is AIDEAS targeted as a light-first product (per roadmap "light-mode default") or should we honor user preference?
   - Recommendation: **light always** for Phase 25 (matches roadmap literal wording). If Phase 32 user testing shows demand, add `prefers-color-scheme` honor in a Phase 32 sub-plan.

## Risks

1. **Card-on-page contrast (HIGH):** `#fafafa` on `#eeeeee` is only ~2% luminance difference. Without `border` discipline, every card disappears. Mitigation: bake border into primitive; sweep auth pages explicitly.
2. **Brand identity perception change:** customers used to purple may find Code Orange jarring. Mitigation: it's a deliberate strategic move per v1.3; not a research concern.
3. **shadcn CLI hazards:** running `init` instead of `add` will wipe globals.css. Mitigation: explicit "DO NOT run init" instruction in plan; prefer manual `components.json` if needed.
4. **Phase 25 scope creep:** UAT-blocking rule means a single broken composed card forces a Phase 32 task into Phase 25. Mitigation: define a clear "interim quality bar" (e.g., "screen renders without overflow + text is legible at AA contrast" = passes; "looks unpolished" = defer to 32). Plan must spell this out.
5. **Recharts SVG fill quirks:** chart primitive scaffold is safe; consumption is risky (see Pitfall 7). Defer consumption to Phase 32.
6. **Modal/dropdown elevation loss:** removing all shadows literally makes overlays look pasted on. Mitigation: keep `shadow-lg` on radix overlay primitives ONLY (functional shadow exception, not decorative).
7. **Dark-mode contrast on accent ring:** `#ef6f2e` on `#020202` background may fail AA. Mitigation: verify in UAT; if it fails, use `#ef6f2e` outline + `#fff` inner ring (compound focus indicator).

## Recommended Migration Strategy: Big-Bang globals.css + Targeted Sweeps

**Rationale (vs parallel-layer):**
- Tailwind v4 `@theme` is a single config; running two themes side-by-side requires either two `:root` selectors (which the last one wins) or namespaced vars (which doubles every utility name). Either way, more risk than just rewriting.
- Token names (`--primary`, `--background`, `--ring`, etc.) stay the same — only their VALUES change. Most code paths transparently pick up new colors with no edits.
- The risk surface is "components with hardcoded literals," and that's grep-able and addressable in a follow-on Wave.

**Wave structure (planner can refine):**

- **Wave 0** — `globals.css` rewrite + verify build still compiles + spot-check 3 reference pages
- **Wave 1** — Reskin 5 existing primitives (button, card, input, form, label)
- **Wave 2** — Scaffold 3 new primitives (badge, tabs, chart) — no consumption, just installation
- **Wave 3** — Auth pages reskin + brand-color literal swap on auth pages
- **Wave 4** — Brand-color literal global swap (`purple-*` → `primary` token) across the 56 files
- **Wave 5** — Hardcoded chart fill colors swap (Recharts `fill="#a855f7"` → `fill="#ef6f2e"`)
- **Wave 6** — Gradient removal in `top-automation-card.tsx`
- **Wave 7** — UAT pass (104+ visual checks); fix per checklist; loop until clean

## Sources

### Primary (HIGH confidence)
- **Factory.ai production CSS** (`https://factory.ai/_next/static/css/de50a359a1209834.css`) — extracted exact tokens for `--neutral-100..1000`, `--accent-100..300`, `--dark-base-primary/secondary`, `--light-base-primary/secondary`, radius scale, typography scale, focus-ring approach, color-mix usage. Saved locally for verification at `C:/Users/patri/factory.css`.
- **Factory.ai Geist font CSS** (`https://factory.ai/_next/static/css/de70bee13400563f.css`) — verified Geist Sans + Geist Mono with full weight range 100-900.
- **Aideas codebase** — direct source inspection: `web/src/app/globals.css` (current OKLCH theme), `web/src/components/ui/*.tsx` (5 existing primitives), `web/package.json` (versions), `web/src/app/layout.tsx` (Geist font loading).
- **Project conventions** — `c:/dev/12ai/CLAUDE.md` (Tailwind v4 + shadcn + Geist + i18n EN/ES + dark mode + Spanish dev communication).
- **CONTEXT.md** — `c:/dev/12ai/.planning/phases/25-design-system-migration/25-CONTEXT.md` (locked decisions + Discretion list).

### Secondary (MEDIUM confidence)
- **shadcn/ui Badge docs** — confirmed `pnpm dlx shadcn@latest add badge` install command, Radix-based, ships variants `default | secondary | destructive | outline | ghost`.
- **shadcn/ui Tabs docs** — confirmed `pnpm dlx shadcn@latest add tabs` install command, parts: `Tabs / TabsList / TabsTrigger / TabsContent`, `line` variant available.
- **shadcn/ui Chart docs** — confirmed `pnpm dlx shadcn@latest add chart` install command, parts: `ChartContainer / ChartTooltip / ChartTooltipContent / ChartLegend`, integrates with Recharts via `--chart-1..N` CSS vars and `chartConfig` object.
- **Tailwind v4 + shadcn compatibility** — confirmed shadcn supports Tailwind v4, uses `tw-animate-css` (replacing `tailwindcss-animate`), already installed in Aideas.

### Tertiary (LOW confidence — flagged for plan-time validation)
- **Factory.ai dark-mode dual-theme presence:** confirmed via `[data-theme=light]` selector existing in their CSS (LOW: didn't browser-test the toggle, but the CSS proves both modes exist).
- **Code Orange exact RGB-equivalent (`#ef6f2e`):** matches roadmap value EXACTLY (HIGH; downgraded to TERTIARY only because we didn't pixel-color-pick from a screenshot; the CSS is authoritative).
- **Negative claim "Badge and Tabs do not exist as shadcn primitives in the repo":** verified by `ls web/src/components/ui/` (HIGH); listed as tertiary only because semantically there ARE inline badge/tab components (status-badge.tsx, automations-filter-tabs.tsx) which the planner may want to be aware of.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified from `package.json`, install commands confirmed via shadcn docs
- Token values: HIGH — extracted directly from Factory.ai production CSS, not training data
- Architecture / migration strategy: MEDIUM-HIGH — recommendation is opinionated; alternatives deliberately rejected with rationale
- File inventory: MEDIUM — counts from grep are accurate; per-file edit estimates are heuristic
- Dark-mode policy: MEDIUM — recommendation uses Factory's actual dark palette; AA contrast on accent ring needs UAT validation
- Pitfalls: HIGH — derived from concrete code reads, not generic advice
- UAT matrix: HIGH — 28 routes enumerated from filesystem (`find page.tsx` returned 28 unique pages + 1 root)

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (Tailwind v4, shadcn-ui, Factory.ai are all stable; tokens unlikely to drift in 30 days. Re-verify if Factory site visibly redesigns.)
