# Milton — Web & Interactive Design Standards

The web-specific contract. Read after `PRINCIPLES.md`. These standards are **fixed** — they do not vary by brand. Whatever palette, typeface, or icon family a fork uses, the web behaviour below is constant.

---

## 1 · Single-file production artifacts

Every Milton output that targets the web is a **self-contained HTML artifact** — inlined CSS, inlined JS (vanilla unless explicitly otherwise), no build step, no external dependencies beyond Google Fonts.

| Mode             | Single-file ceiling | Notes                                                |
|------------------|---------------------|------------------------------------------------------|
| `single-icon`    | n/a (one .svg)      |                                                      |
| `icon-set`       | n/a (per-icon files + sprite) |                                            |
| `showcase-page`  | ≤ 25 KB             | Excluding fonts. Inline everything. No CSS files.   |
| `dashboard`      | 50–80 KB            | Acceptable to be larger; data + interactivity earn it |
| `full-system`    | per-file caps apply | Each file follows its own mode's cap                |

If your output exceeds the cap, the response is too rich. Compress, defer, or split into multiple modes.

---

## 2 · Responsive layout

| Rule                                                  | Implementation                                                |
|-------------------------------------------------------|---------------------------------------------------------------|
| Type scales fluidly                                   | `clamp(min, vw-base, max)` on every text size                  |
| Grids fill, never overflow                            | `display: grid; grid-template-columns: repeat(auto-fill, minmax(<cap>, 1fr));` |
| Mobile breakpoint                                     | `max-width: 720px` for navigation collapse; `max-width: 520px` for ultra-narrow tweaks |
| Touch targets                                         | ≥ 40 px for secondary, ≥ 44 px for primary CTAs              |
| Container queries where structure permits             | `container-type: inline-size; @container (min-width: …)`      |
| No fixed pixel widths                                 | Use `max-inline-size` / `max-width` on containers, %/vw/ch elsewhere |

**Mobile-first vs desktop-first:** Milton uses **`@media (min-width: …)`** ladders. The base styles render correctly on mobile; breakpoints upgrade for larger viewports.

---

## 3 · Interactivity

The default preset includes these interactive elements; every fork should provide them too unless the brief explicitly excludes one.

- **Theme toggle** — sun/moon icon in the top bar (≥40px). Cycles light → dark → system. Persists in `localStorage`. Page-color meta tag updates on toggle.
- **Hover & focus states** — every interactive element has both. `:focus-visible` for keyboard.
- **Mobile menu** — hamburger reveal under 720 px. Closes on link click and on Escape.
- **Filter chips, slider controls, expandable cards** — built with `aria-pressed`, `aria-expanded`, `role="button"` where semantic HTML can't carry it.
- **Copy-to-clipboard** for any code, SVG, or token snippet the user might want.
- **Reveal-on-scroll** — IntersectionObserver, with stagger via `:nth-child` transition-delay. Always honour `prefers-reduced-motion`.
- **View Transitions API** where browser support exists, behind `if (document.startViewTransition)`.

Interactions should feel **drawn**, not engineered. The micro-animations carry the brand's voice — surprise on the WOW moment, restraint on the ordinary moments.

---

## 4 · Motion

| Token            | Curve                                          | Used for                            |
|------------------|------------------------------------------------|-------------------------------------|
| `--ease-out`     | `cubic-bezier(.16, 1, .3, 1)`                  | Most transitions                    |
| `--ease-in-out`  | `cubic-bezier(.65, 0, .35, 1)`                 | Two-way transitions                 |
| `--ease-glaser`  | `cubic-bezier(.34, 1.56, .64, 1)` (overshoot)  | Card lifts, theme toggle, "wow" moments |

Durations: **120 ms** hover, **200 ms** state, **320 ms** card lift, **520 ms** view transition, **820 ms** narrative reveal. Use the canonical tokens; don't invent durations.

`prefers-reduced-motion: reduce` is **mandatory**:

```css
@media (prefers-reduced-motion: reduce){
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5 · Theme system (light + dark)

The contract every web output must satisfy:

```html
<!-- 1. Theme-color meta for OS chrome -->
<meta name="theme-color" content="#FAF7F2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1C1A15" media="(prefers-color-scheme: dark)">

<!-- 2. FOUC-prevention init script — FIRST in <head>, before any styles render -->
<script>
(function(){
  try{
    var p = localStorage.getItem('ceti-theme');
    var s = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = p || s;
  }catch(e){}
})();
</script>
```

```css
/* 3. CSS contract */
:root { /* light tokens */ }
:root[data-theme="dark"] { /* dark overrides */ color-scheme: dark; }
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]):not([data-theme="dark"]){
    /* mirror the dark overrides — applied only when user hasn't picked */
  }
}
```

The `localStorage` key (`ceti-theme` in the default preset) **may be renamed per brand** — pick `<brand>-theme`. The mechanism stays.

---

## 6 · Accessibility (WCAG AA minimum)

| Axis                 | Requirement                                                              |
|----------------------|--------------------------------------------------------------------------|
| Body text contrast   | ≥ 4.5:1 against background                                              |
| Large text contrast  | ≥ 3:1                                                                   |
| Interactive contrast | ≥ 3:1 for borders, focus rings, icons                                   |
| Semantic HTML        | `<main>`, `<header>`, `<footer>`, `<nav>`, `<article>`, `<section>` — used per their semantic role, not for visual grouping |
| Headings             | One `<h1>` per page; never skip levels                                  |
| Forms                | `<label>` always, even if visually hidden via `.sr-only`                |
| Focus order          | Tab order matches visual order; never `tabindex` > 0                    |
| Focus indicator      | `:focus-visible { outline: 2px solid var(--actor-2); outline-offset: 3px; }` |
| ARIA                 | Use only when semantic HTML can't carry the meaning                     |
| `<svg>`              | `<title>` for accessible name; `<desc>` for description; `aria-hidden="true"` only when purely decorative |
| Image alt            | Mandatory on every `<img>`; empty string only when truly decorative     |
| Reduced motion       | Honoured globally (see §4)                                              |
| Keyboard navigation  | Every interactive element reachable via Tab; Escape closes overlays     |

If a finding fails any of the above, the milton agent will FAIL it.

---

## 7 · Performance

- **Single file, single trip.** Inline CSS, inline JS, inline SVG. No external CSS files. No bundlers.
- **Fonts** — load via Google Fonts with `<link rel="preconnect">` to both `fonts.googleapis.com` and `fonts.gstatic.com` (with `crossorigin`). Use `display=swap`.
- **JS** — vanilla ES2020. No frameworks. No transpilers. If a brief asks for React, treat that as a separate mode (not part of `showcase-page`).
- **Critical render path** — the FOUC-prevention init script runs before any external font loads. The page's first paint is in the correct theme.
- **Total weight target** — under 100 KB (excluding fonts) for a `dashboard`; under 30 KB for a `showcase-page`.

---

## 8 · The interactive vocabulary (default kit)

Every full-system or dashboard output ships these by default. Forks may rename them but should provide the same affordances.

- **Top bar** — sticky, blur-backdrop, brand mark left, nav middle, theme toggle + mobile menu right.
- **Hero** — eyebrow + mega heading + supporting paragraph + meta row. One animated element (pulse, drift, or scroll-driven).
- **Filterable cards** — chips at top with `aria-pressed`. Cards are `<article role="button">` with `aria-expanded`.
- **Slider-controlled detail panel** — range input, live readout, list highlights as the slider moves.
- **Quote / pull wall** — `<figure>` + `<blockquote>` + `<cite>`. Five rotating accents in default preset.
- **Demo widgets** — small interactive controls illustrating one concept each. Variable-font slider, figure-ground toggle, three-option chooser, etc.
- **Footer** — three-column: about, sources, system. Colophon at bottom.

The interactive vocabulary is the **rhythm** of a Milton page. Forks may swap colours and copy. The rhythm stays.

---

## 9 · Anti-patterns (web edition)

In addition to the brand-book anti-patterns:

- ❌ Loading entire UI frameworks (React, Vue) for a single static page
- ❌ Adding 5 npm dependencies to compute what `clamp()` already does
- ❌ Using `<div>` and `<span>` where `<button>`, `<nav>`, `<article>` exist
- ❌ Hover-only interactions with no keyboard equivalent
- ❌ Animations that don't respect `prefers-reduced-motion`
- ❌ Splash screens or "loading" overlays for content that's already in the HTML
- ❌ Cookie banners that block content for compliance theatre
- ❌ Auto-playing video / audio
- ❌ Fixed-position overlays that follow the user as they scroll
- ❌ "Subscribe to our newsletter" modals that fire on first paint
- ❌ Disabling browser zoom (`maximum-scale=1` on `<meta viewport>`)
- ❌ `position: fixed` on mobile without keyboard-aware repositioning

---

## 10 · The web compliance checklist

Before delivery, every web artifact passes all twelve:

```
□ Single self-contained HTML file (or directory tree per mode)
□ Type loads from Google Fonts with preconnect
□ Tokens inlined; no hex outside :root or theme-color meta
□ Light + dark modes both rendered correctly
□ FOUC-prevention init script in <head>
□ System preference respected when no explicit choice
□ Theme choice persists in localStorage
□ Mobile nav collapses under 720px
□ Touch targets ≥ 40px
□ prefers-reduced-motion honoured
□ WCAG AA on body + large text
□ All SVGs original, with <title> + <desc>
```

If any fail, revise before shipping. The milton agent runs this checklist on review.
