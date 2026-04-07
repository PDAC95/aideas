---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/public/landing/ (directory - images, video, fonts)
  - web/src/app/page.tsx
  - web/src/components/landing/landing-page.tsx
  - web/src/components/landing/landing-page.css
autonomous: true
requirements: [QUICK-3]

must_haves:
  truths:
    - "Root page shows the full branded landing page with magenta/purple gradient design"
    - "Hero section displays background video with overlay text and CTA buttons"
    - "All sections render: About, Process, Services, Facts, Testimonials, Works, News, Contact"
    - "All CTA buttons (Get Started, etc.) link to /login or /signup"
    - "Logged-in users are redirected to /dashboard (existing behavior preserved)"
    - "Dark theme renders by default with proper CSS variable colors"
  artifacts:
    - path: "web/public/landing/img/"
      provides: "All landing page images and video"
    - path: "web/src/components/landing/landing-page.tsx"
      provides: "Main landing page React component"
      min_lines: 400
    - path: "web/src/components/landing/landing-page.css"
      provides: "All landing page styles (design tokens, section styles, responsive)"
      min_lines: 200
    - path: "web/src/app/page.tsx"
      provides: "Root page importing LandingPage component with auth redirect"
  key_links:
    - from: "web/src/app/page.tsx"
      to: "web/src/components/landing/landing-page.tsx"
      via: "import and render"
      pattern: "import.*LandingPage"
    - from: "web/src/components/landing/landing-page.tsx"
      to: "/login"
      via: "Link href"
      pattern: "href.*login"
---

<objective>
Replace the simple placeholder root page with the full AIDEAS branded landing page from the /landing folder. Convert the static HTML/CSS/JS landing site into a Next.js React component while preserving the sophisticated design (magenta/purple gradient branding, dark mode, animations, video hero, all sections).

Purpose: Give the app a professional, branded first impression instead of the current placeholder page.
Output: Full landing page at root URL with all visual sections, assets served from web/public/landing/.
</objective>

<execution_context>
@C:/Users/patri/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/patri/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@landing/index.html (source HTML - the full landing page to convert)
@landing/css/style.css (source CSS - template base styles)
@web/src/app/page.tsx (current simple page to replace)
@web/src/app/layout.tsx (root layout - uses Geist font, next-intl)

Key facts about the landing page:
- 1750 lines of HTML with ~800 lines of inline CSS in a <style> block
- Uses CSS custom properties: --ai-magenta (#c73586), --ai-purple (#7b2d8e), --ai-navy (#1a2744), etc.
- Has dark/light theme via body class (body-dark / body-light)
- Uses Google Fonts: Oswald (headings) and Raleway (body text)
- Sections: Home (video hero), About, Skills/Process, Services, Facts, Testimonials, Works, News, Contact
- Uses jQuery plugins for video background (YTPlayer), scrolling, navigation
- Has i18n via data-i18n attributes (we will use static English text for now, i18n integration deferred)
- Assets: ~33MB images/video in landing/img/, ionicons fonts in landing/fonts/

Conversion strategy:
- Extract ALL inline CSS from the <style> block into landing-page.css
- Convert HTML to JSX in a client component (needs useEffect for scroll animations)
- Replace jQuery-dependent features with React equivalents or CSS-only
- Video background: use native HTML5 <video> tag (drop YTPlayer jQuery dependency)
- Navigation: simplify to a fixed header with anchor links + Login/Signup CTAs
- Scroll animations: use IntersectionObserver in useEffect (replace jQuery waypoints)
- Drop jQuery entirely - no plugins.js or oneex.js dependencies
- Keep ALL visual design: colors, gradients, typography, spacing, animations
</context>

<tasks>

<task type="auto">
  <name>Task 1: Copy static assets and create landing page styles</name>
  <files>
    web/public/landing/img/ (all images and video)
    web/public/landing/fonts/ (ionicons)
    web/src/components/landing/landing-page.css
  </files>
  <action>
1. Copy all static assets from landing/ to web/public/landing/:
   ```
   cp -r landing/img web/public/landing/img
   cp -r landing/fonts web/public/landing/fonts
   ```

2. Create web/src/components/landing/landing-page.css containing:
   - ALL CSS from the inline <style> block in landing/index.html (lines ~19-1037). This is the AIDEAS design system with CSS variables, animations, section styles, responsive breakpoints.
   - Key CSS from landing/css/style.css that the sections depend on (navigation, layout grid, general typography). Do NOT include the full 4343-line file -- only extract what the converted sections actually use.
   - The @font-face declarations for ionicons from landing/css/plugins.css (needed for icon classes like .ion-ios-*)
   - Google Fonts import for Oswald and Raleway: @import url for both families
   - Scope all styles under a `.landing-page` wrapper class to avoid leaking into the rest of the app
   - Update all asset paths: `img/` becomes `/landing/img/`, `../fonts/` becomes `/landing/fonts/`
   - Keep ALL responsive breakpoints (@media queries) from the inline styles

Key CSS sections to include (all from the inline <style> block):
   - Design system tokens (:root variables)
   - .body-light overrides
   - Animation keyframes (ai-fadeUp, ai-fadeIn, ai-pulse-glow, ai-orbit-spin, ai-float, etc.)
   - .ai-reveal scroll animation classes
   - .ai-section, .ai-container, .ai-section-header shared layout
   - .ai-btn, .ai-btn-outline button styles
   - .ai-about-* (about section styles)
   - .ai-process-* (process/skills section)
   - .ai-services-* (services section)
   - .ai-facts-* (facts/stats section)
   - .ai-testimonials-* (testimonials section)
   - .ai-works-* (works/portfolio section)
   - .ai-news-* (news/use cases section)
   - .ai-contact-* (contact section)
   - .ai-footer-* (footer styles)
   - All responsive @media blocks

Do NOT include: jQuery plugin CSS (YTPlayer, photoswipe), toolbar styles that were display:none.
  </action>
  <verify>
    ls web/public/landing/img/home/main_video.mp4 && ls web/public/landing/fonts/ionicons.woff && ls web/src/components/landing/landing-page.css && wc -l web/src/components/landing/landing-page.css
  </verify>
  <done>All landing assets copied to web/public/landing/, CSS file created with all design tokens and section styles, paths updated to /landing/ prefix</done>
</task>

<task type="auto">
  <name>Task 2: Convert landing HTML to React component</name>
  <files>
    web/src/components/landing/landing-page.tsx
  </files>
  <action>
Create a "use client" React component that renders the full landing page. This is the core conversion task.

Structure:
```tsx
"use client";
import "./landing-page.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
```

Component must implement:

**1. Scroll reveal animation (replace jQuery waypoints):**
- useEffect with IntersectionObserver targeting all `.ai-reveal` elements
- When element enters viewport (threshold: 0.15), add `.is-visible` class
- This drives the opacity/transform transition defined in CSS

**2. Navigation header:**
- Fixed position nav bar with AIDEAS logo (use text, not image)
- Anchor links to sections: #home, #about, #skills, #services, #facts, #testimonials, #works, #news, #contact
- "Login" link to /login and "Get Started" link to /signup (use next/link)
- Mobile-responsive hamburger menu (CSS-only toggle or useState)
- Style: transparent on top, solid background on scroll (use useState + scroll listener)

**3. Hero section (#home):**
- HTML5 `<video>` element with autoPlay, muted, loop, playsInline for background
- Source: /landing/img/home/main_video.mp4
- Dark overlay gradient on top of video
- Hero text: "AI Automation" headline, subtitle text, two CTA buttons (Get Started -> /signup, Learn More -> #about)
- Match the original layout with centered text over video

**4. About section (#about):**
- Convert the ai-about-grid layout (2 columns: content + visual)
- Left side: title "About AIDEAS", role subtitle, bio text, detail pills (Founded, Focus, Team Size, etc.), stats number
- Right side: abstract visual with orbiting dots animation (CSS-only, already in the CSS)
- Include the floating stat cards (ai-about-visual-stat)

**5. Process/Skills section (#skills):**
- "Our Process" subsection: 4 numbered steps in a grid
- "What We Use" subsection: technology/tool tags
- Use the ai-process-step and ai-tech-tag styles

**6. Services section (#services):**
- Grid of service cards with icon, title, description
- Use ai-services-card styles
- Each card has a magenta accent on hover

**7. Facts section (#facts):**
- Stats grid with large numbers (counter animation optional -- static numbers fine for now)
- Background surface variant

**8. Testimonials section (#testimonials):**
- Testimonial cards with quote, name, role
- Simple grid layout (no carousel needed)

**9. Works section (#works):**
- Portfolio grid showing automation examples
- Images from /landing/img/works/1-8.jpg
- Use next/image is NOT required here -- standard img tags with /landing/img/ paths are fine for static landing assets
- Hover overlay with title

**10. News/Use Cases section (#news):**
- Card grid with featured image, date, title, excerpt
- Images from /landing/img/news/1-4.jpg

**11. Contact section (#contact):**
- Contact info (email, location) + contact form
- Form: name, email, message fields with ai-form styles
- Form submit: for now, just preventDefault and console.log (no backend)
- Include a "Get Started" CTA button linking to /signup

**12. Footer:**
- Simple footer with copyright, social links (as icons), back-to-top button
- Year: 2026

Content conversion rules:
- Copy ALL text content from landing/index.html exactly (section titles, descriptions, stats numbers, testimonial quotes, etc.)
- Convert HTML attributes: class -> className, for -> htmlFor, etc.
- Self-close void elements: <br>, <img>, <input>, <hr>
- Convert inline style strings to React style objects where used
- Replace all `href="#"` CTAs with `href="/signup"` or `href="/login"` as appropriate
- Keep data-i18n attributes as comments for future i18n integration
- Anchor links (#about, #services, etc.) use smooth scroll behavior

Do NOT:
- Import or use any jQuery
- Use YTPlayer -- use native <video> tag
- Import plugins.js or oneex.js
- Add photoswipe/lightbox (defer)
- Implement dark/light theme toggle (default to dark theme for now)
  </action>
  <verify>
    npx tsc --noEmit --project web/tsconfig.json 2>&1 | head -20
  </verify>
  <done>LandingPage component compiles without TypeScript errors, renders all 10+ sections with proper structure and styling classes</done>
</task>

<task type="auto">
  <name>Task 3: Wire landing page into root route and verify</name>
  <files>
    web/src/app/page.tsx
  </files>
  <action>
Replace web/src/app/page.tsx with:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
```

Key points:
- Keep the Server Component wrapper for auth check (existing pattern)
- Import and render the client LandingPage component
- Preserve the exact same auth redirect logic from the current page.tsx
- The page itself stays a Server Component; LandingPage is the "use client" child

After writing, run the dev server build check:
```bash
cd web && npx next build 2>&1 | tail -30
```
If build fails, diagnose and fix. Common issues:
- Missing CSS import paths
- JSX conversion errors (unclosed tags, className typos)
- Image/asset 404s (wrong paths)
  </action>
  <verify>
    cd web && npx next build 2>&1 | tail -5
  </verify>
  <done>Root page renders the full branded landing page, build succeeds, auth redirect preserved for logged-in users, all CTAs point to /login or /signup</done>
</task>

</tasks>

<verification>
1. `cd web && npx next build` completes without errors
2. `cd web && npx next dev` and visit http://localhost:3000 shows the branded landing page
3. All sections visible: hero with video, about, process, services, facts, testimonials, works, news, contact
4. CTA buttons link to /login or /signup
5. Scroll reveal animations trigger as user scrolls down
</verification>

<success_criteria>
- Root page displays the full AIDEAS branded landing page with magenta/purple design system
- Hero section shows background video with overlay and CTA buttons
- All 10 sections render with proper styling and layout
- All "Get Started" / CTA buttons route to /login or /signup
- Auth redirect to /dashboard preserved for logged-in users
- `next build` succeeds without errors
</success_criteria>

<output>
After completion, create `.planning/quick/3-replace-main-page-with-landing-page-and-/3-SUMMARY.md`
</output>
