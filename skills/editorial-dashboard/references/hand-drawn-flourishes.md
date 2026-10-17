# Hand-Drawn Flourishes

The smallest details produce the biggest perceived-quality jump. These are micro-techniques that take 5 lines of code each and collectively turn a competent dashboard into one that feels like it was made by a human.

## The premise

Vector perfection signals "machine-made". That's fine for utility software. For editorial work, you want the page to feel like it passed through a pair of hands. These flourishes are how.

Use them sparingly. One marginalia per section is plenty. Three scribble underlines per dashboard is plenty. Restraint matters.

## 1. Caveat marginalia

A small hand-lettered note in the margin or beside a section, in the accent color, slightly rotated. Reads like the subject pencilled in a comment.

### CSS

```css
.marginalia {
  font-family: var(--hand);   /* Caveat */
  font-weight: 600;
  font-size: 1.15rem;
  color: var(--red);
  line-height: 1.1;
  display: inline-block;
  transform: rotate(-2.5deg);
}
.marginalia.blue { color: var(--blue); }
.marginalia.ink  { color: var(--ink); }
```

### Usage

```html
<p class="section-lede">
  Delivered to AIGA in London, 2001. Every line is a small protest.
</p>
<span class="marginalia">↳ none of these are slogans. he meant them.</span>
```

### Where to place

- Just below a section lede (a "PS" feeling)
- Next to a chart or interactive controlling element ("← move the weights")
- As an aside attached to a callout
- Inside an SVG icon as a tiny lettered caption (see svg-icons reference)

## 2. Scribble underline (on key emphasized phrases)

A wavy red line under a word, drawn as a tiny inline SVG. It's the digital equivalent of someone underlining a passage with a pen.

### CSS

```css
.scribble {
  position: relative;
  display: inline-block;
}
.scribble::after {
  content: "";
  position: absolute;
  left: -2%; right: -2%;
  bottom: -0.18em;
  height: 0.22em;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 8' preserveAspectRatio='none'><path d='M2,5 Q20,1 40,5 T80,5 T120,5 T160,5 T198,5' stroke='%23D62828' stroke-width='2.2' fill='none' stroke-linecap='round'/></svg>") center/100% 100% no-repeat;
}
.scribble.blue::after { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 8' preserveAspectRatio='none'><path d='M2,5 Q20,1 40,5 T80,5 T120,5 T160,5 T198,5' stroke='%231D3557' stroke-width='2.2' fill='none' stroke-linecap='round'/></svg>"); }
```

### Usage

```html
<blockquote>
  "The brain is the most <em><span class="scribble">responsive</span></em> organ of the body..."
</blockquote>
```

### Restraint

One or two scribbles per dashboard, max. They work best in:
- The most important quote
- The phrase you most want the reader to remember
- A word that's the *crux* of the whole page

Used too often, they become noise.

## 3. Hand-drawn wobble filter

An SVG `feTurbulence` + `feDisplacementMap` filter that adds tiny irregularity to vector lines, making them look hand-traced rather than computer-perfect.

### Definition (place inside any SVG that uses it)

```xml
<defs>
  <filter id="wobble" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3"/>
    <feDisplacementMap in="SourceGraphic" scale="1.6"/>
  </filter>
</defs>
```

### Usage

Wrap the *important* shapes (not all of them) in a `<g filter="url(#wobble)">`:

```xml
<g filter="url(#wobble)">
  <circle cx="115" cy="180" r="68" fill="#F1EBDD" stroke="#1A1612" stroke-width="6"/>
  <circle cx="245" cy="180" r="68" fill="#F1EBDD" stroke="#1A1612" stroke-width="6"/>
</g>
```

### Tuning

- `baseFrequency` 0.012–0.025 — lower = larger waves
- `numOctaves` 2 — more makes it fractal-noisy; 2 is right
- `scale` 1–3 — how much displacement; over 3 starts looking glitchy
- `seed` change to get different wobble patterns

Use sparingly: on the hero artifact, on a feature illustration. NOT on every icon — the wobble filter is computationally expensive *and* visually overwhelming if applied everywhere.

## 4. Fleurons between sections

Small hand-drawn ornaments that act as visual breathing space between major sections. Three classical patterns:

### Pattern A — Wave with a heart bead

```html
<div class="fleuron" aria-hidden="true">
  <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" fill="none"
       stroke="#1A1612" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 2,14 Q 8,8 14,14 Q 20,20 26,14"/>
    <circle cx="32" cy="14" r="2.4" fill="#D62828" stroke="#1A1612" stroke-width="1.4"/>
    <path d="M 38,14 Q 44,8 50,14 Q 56,20 62,14"/>
  </svg>
</div>
```

### Pattern B — Line with center asterisk-mark

```html
<div class="fleuron dark" aria-hidden="true">
  <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" fill="none"
       stroke="#F1EBDD" stroke-width="1.6" stroke-linecap="round">
    <path d="M 2,14 L 22,14"/>
    <path d="M 28,7 L 32,21 M 36,7 L 32,21"/>
    <path d="M 42,14 L 62,14"/>
  </svg>
</div>
```

(Use `dark` modifier when the fleuron sits on the dark inverted section.)

### Pattern C — Three diamonds

```html
<div class="fleuron" aria-hidden="true">
  <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" fill="#1A1612" stroke="#1A1612">
    <path d="M 16,8 L 24,14 L 16,20 L 8,14 Z"/>
    <path d="M 32,4 L 42,14 L 32,24 L 22,14 Z" fill="#D62828"/>
    <path d="M 48,8 L 56,14 L 48,20 L 40,14 Z"/>
  </svg>
</div>
```

### CSS

```css
.fleuron {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--ink);
  background: var(--paper);
}
.fleuron svg { width: 64px; height: 28px; opacity: 0.7; }
.fleuron.dark { background: var(--ink); }
.fleuron.dark svg { opacity: 0.55; }
```

### Where to place

Between *thematically distinct* sections — especially around an inverted-color (dark) section, where a fleuron above marks the entry and one below marks the exit. Don't fleuron every section transition; that becomes wallpaper.

## 5. Slightly rotated cards / postcards

Anything that should feel *physical* — a postcard, a stamp, a sticker, a clipping — gets a tiny rotation. The Murdoch finale used this to convert a saturated red "billboard" into a tilted "printed postcard".

### CSS

```css
.murdoch-card {
  transform: rotate(-0.6deg);
  box-shadow: 6px 8px 0 rgba(26,22,18,0.85);  /* hard-edged shadow, like a card on paper */
  border: 2px solid var(--ink);
}
```

### Subtlety matters

- `-0.5deg` to `-1deg` — anything more becomes cute and breaks the trust
- Pair with a hard-edged shadow (no blur, just an offset) — that's the "card sitting on a table" look
- Pair with a paper-grain or noise overlay (see below)

## 6. Paper grain / noise overlay (subtle)

A tiny SVG noise pattern overlaid on a saturated color to make it feel like printed ink rather than RGB.

### CSS

```css
.murdoch-card {
  background: var(--red);
  background-image:
    radial-gradient(ellipse 120% 80% at 50% 0%, rgba(244,196,48,0.18), transparent 60%),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}
```

The `0.06` alpha makes the noise barely perceptible but enough to break the flat-color RGB feel.

## 7. Corner stamps & marks

Small marks on cards/postcards that imply a printed artifact — a star in one corner, a date stamp in another.

### CSS

```css
.murdoch-card::before {
  content: "★";
  position: absolute;
  top: 14px; left: 18px;
  font-family: var(--display);
  font-size: 1.1rem;
  color: var(--paper);
  opacity: 0.55;
}
.murdoch-card::after {
  content: "MG · 2001";
  position: absolute;
  bottom: 14px; right: 18px;
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--paper);
  letter-spacing: 0.18em;
  opacity: 0.55;
}
```

The pseudo-elements make this zero-markup additions.

## 8. The hand-drawn coda line

A single short hand-lettered line *outside* the postcard, breaking the fourth wall slightly. The Murdoch section closed with: "— and the work begins there." in Caveat, slightly rotated, paper-color.

```html
<div class="murdoch-card">...</div>
<span class="murdoch-coda">— and the work begins there.</span>
```

```css
.murdoch-coda {
  margin-top: 2.2rem;
  font-family: var(--hand);
  font-weight: 600;
  font-size: 1.55rem;
  color: var(--ink);
  text-align: center;
  transform: rotate(-1deg);
  display: block;
}
```

## When NOT to use these

- Utility software (forms, dashboards for data entry, admin tools)
- Highly serious topics where wit would feel disrespectful
- Pages with very dense data tables — flourishes compete with information

The flourishes are an *editorial* choice. Save them for editorial moments.

## Restraint summary

| Element | Per-page max |
|---|---|
| Marginalia | 4–5 |
| Scribble underlines | 2–3 |
| Wobble filter | 1 (the hero) |
| Fleurons | 2–3 (between major sections) |
| Rotated postcards | 1 (the finale) |
| Paper grain | 1–2 surfaces |

A page that uses all of these once is dense with handcraft. A page that uses each three times is a craft-shop.
