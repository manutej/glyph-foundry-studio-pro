# Milton — Brand Book

The visual contract. Read after `PRINCIPLES.md` and `WEB.md`. This file documents:

1. The **default preset** — the CETI brand: warm cream + five rotating accents + Bricolage type stack.
2. **What stays fixed** across all forks — token *names*, token *roles*, anti-patterns.
3. **How to fork** the preset for another brand without breaking the contract.

---

## A · The default preset (CETI)

### A.1 · Warm grounds

| Token       | Light       | Dark        | Role                                |
|-------------|-------------|-------------|-------------------------------------|
| `--paper`   | `#FAF7F2`   | `#1C1A15`   | Primary surface (cream / book leather) |
| `--ink`     | `#1A1916`   | `#F0EBDD`   | Primary text                        |
| `--ink-soft`| derived     | derived     | Secondary text (90% ink mix)        |
| `--ink-faint`| derived    | derived     | Tertiary / meta text (56% ink mix)  |
| `--rule`    | derived     | derived     | Light borders (14% ink mix)         |
| `--rule-strong`| derived  | derived     | Active borders (28% ink mix)        |

> **Never `#FFFFFF`. Never `#000000`.** Glaser worked on cream his whole life. Dark mode is warm leather, not a black hole. **A fork that picks a different warm is fine; a fork that picks pure white or pure black is a contract violation.**

### A.2 · The five rotating accents

These are **structural**, not decorative. Each carries a meaning. In the default preset, accents are mapped to Glaser's principle groups:

| Token       | Light       | Dark        | Default meaning                                    |
|-------------|-------------|-------------|-----------------------------------------------------|
| `--actor-1` | `#D1422A`   | `#EA5E40`   | **Vermilion** — boldness, the I♥NY heart, "no"     |
| `--actor-2` | `#2D5BA9`   | `#6F90D1`   | **Cobalt** — doubt, the question, cool counterweight|
| `--actor-3` | `#E8B53C`   | `#F0C34A`   | **Sunflower** — surprise, "wow", warm highlight    |
| `--actor-4` | `#3B6E47`   | `#79AC8A`   | **Forest** — affection, "yes", steady              |
| `--actor-5` | `#6B3F6E`   | `#B58FB7`   | **Plum** — ambiguity, the pause, mystery           |

All ten values pre-tuned for **WCAG AA** contrast on their respective grounds. Forks must re-test contrast for new accents.

### A.3 · Typography (default preset)

| Role     | Family                  | Weights        | Used for                             |
|----------|-------------------------|----------------|--------------------------------------|
| Display  | **Bricolage Grotesque** | 400 / 600 / 800 | Headings, hero glyphs, blockquotes  |
| Body     | **DM Sans**             | 400 / 500 / 700 | Paragraphs, UI labels                |
| Mono     | **JetBrains Mono**      | 400 / 500       | Code, eyebrows, meta, time stamps    |

The **type *roles*** (display / body / mono) are fixed. The **typefaces** filling those roles are overridable per brand. Variable-font support and the same opsz / wght axes the defaults use are recommended.

### A.4 · Type ramp (fluid — fixed across forks)

```css
--t-xs:   clamp(.75rem,  .71rem + .20vw, .875rem);
--t-sm:   clamp(.875rem, .83rem + .22vw, 1rem);
--t-base: clamp(1rem,    .94rem + .28vw, 1.125rem);
--t-lg:   clamp(1.125rem, 1.04rem + .42vw, 1.375rem);
--t-xl:   clamp(1.5rem,   1.35rem + .75vw, 2rem);
--t-2xl:  clamp(2rem,     1.75rem + 1.25vw, 2.875rem);
--t-3xl:  clamp(2.75rem,  2.25rem + 2.5vw, 4.5rem);
--t-4xl:  clamp(3.75rem,  2.75rem + 5vw,   7rem);
--t-mega: clamp(5rem,     3rem + 10vw,     12rem);
```

The ramp values are tuned for legibility from 320 px to 1920 px viewports. Don't change them per fork unless you've re-tuned for an unusual viewport range.

### A.5 · Spacing tokens (fixed)

```
--s-1: 4px    --s-7:  48px
--s-2: 8px    --s-8:  64px
--s-3: 12px   --s-9:  96px
--s-4: 16px   --s-10: 144px
--s-5: 24px   --s-11: 192px
--s-6: 32px
```

8-point base. Same across all forks.

### A.6 · Radii (fixed)

```
--r-1:    2px       sharp UI
--r-2:    6px       inputs
--r-3:    12px      cards
--r-4:    24px      hero containers
--r-pill: 999px     chips, pills, toggles
```

Glaser used circles and half-moons. Rectangles get **small** radii — never the iOS 18px reflex.

### A.7 · Motion (fixed — see WEB.md §4)

```
--ease-out:    cubic-bezier(.16, 1, .3, 1)
--ease-in-out: cubic-bezier(.65, 0, .35, 1)
--ease-glaser: cubic-bezier(.34, 1.56, .64, 1)   /* slight overshoot */
```

`--ease-glaser` is named for him because the small overshoot has the *feel* of a brushstroke landing — not a clinical lerp.

---

## B · The CETI legacy palette (separate from the actor system)

For continuity with cetiai.co and existing CETI proposal decks, these named tokens are kept available. They are **not used as accents**; they're available when a brief explicitly says "match cetiai.co".

```css
--olive:  #262721;
--slate:  #324555;
--sage:   #C7D8B9;
--cream:  #E7E1D7;
--camel:  #A67756;
```

Forks for non-CETI brands should remove these or replace with their own brand-legacy tokens.

---

## C · How to fork for another brand

The default preset is one application of the contract. Other brands apply it differently. Here's the override pattern.

### C.1 · Choose the warm

Pick `--paper` and `--ink` for both light and dark. The constraint: both grounds must read as *warm*. Examples:

| Brand vibe          | `--paper` (light) | `--ink` (light) | `--paper` (dark) | `--ink` (dark) |
|---------------------|-------------------|-----------------|------------------|----------------|
| CETI (default)      | `#FAF7F2`         | `#1A1916`       | `#1C1A15`        | `#F0EBDD`      |
| Tea / parchment     | `#F4ECDC`         | `#2A1F12`       | `#1F1810`        | `#EFE2C8`      |
| Bone / clinical-warm| `#F6F1EB`         | `#22201E`       | `#1B1815`        | `#EDE6DC`      |
| Terracotta-near-black | `#F8EDE2`       | `#2A1A12`       | `#1F140E`        | `#F1E0CC`      |

### C.2 · Choose the actor count

Default is **five**. Some brands want **three** (a tighter palette), some want **seven** (more sectional variety). Pick a number, name them `--actor-1` through `--actor-N`. Each must:

- Pass WCAG AA on both `--paper` (light) and `--paper` (dark).
- Carry a meaning. Document the meaning in your fork's brand book.
- Be visually distinct from the others at 24 px (the smallest icon scale).

### C.3 · Choose the typefaces

The roles are fixed: **display · body · mono**. Pick faces. Constraints:

- The display face should have a usable italic, weight range 400–800, and ideally variable-font axes.
- The body face should have a comfortable reading weight (400) and a clear bold (700). Optical-size axis preferred.
- The mono face is for labels and code; pick something that reads at 12 px.

If the brand is a typographic match for the defaults, keep them. Many brands are.

### C.4 · Override via CSS custom properties

In any artifact, override by setting variables on `:root`:

```css
:root {
  --paper: #F4ECDC;             /* parchment */
  --ink:   #2A1F12;             /* burnt umber */
  --actor-1: #B45D2C;           /* terracotta */
  --actor-2: #3F6155;           /* moss */
  --actor-3: #C49A3F;           /* dried-leaf gold */
  --actor-4: #5A7A52;           /* sage-deeper */
  --actor-5: #7A4F36;           /* root */
  --font-display: 'Eb Garamond', serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}
:root[data-theme="dark"] {
  --paper: #1F1810;
  --ink:   #EFE2C8;
  --actor-1: #DD7E48;
  --actor-2: #6E948A;
  --actor-3: #E2BB66;
  --actor-4: #87A77E;
  --actor-5: #A57D60;
}
```

That's the entire fork. The rest of the system — type ramp, spacing, motion, anti-patterns, web standards — stays.

### C.5 · Document the fork

A forked brand needs:

1. A short brand book section (~10 lines) explaining the meaning attached to each accent in this brand.
2. The override block above, copy-pasteable.
3. Optional: a custom icon set whose geometry maps to *this brand's* principles (see `ICONS.md` for how to design new icons).

Name the fork `milton-{brand}` if you publish it as its own skill. Otherwise it's just a configuration of Milton.

---

## D · What stays fixed (do not override)

These hold across every fork. Any deviation is a contract violation.

- ✗ Pure `#FFFFFF` background or pure `#000000` text — both grounds must have temperature.
- ✗ Removing `<title>` / `<desc>` from SVGs.
- ✗ Skipping the FOUC-prevention init script.
- ✗ Skipping the dark-mode override block.
- ✗ Skipping `prefers-reduced-motion` honouring.
- ✗ Token *renaming* — `--actor-1` is `--actor-1` everywhere, even if your brand calls it "rust" internally.
- ✗ The five rules from SKILL.md.

---

## E · Anti-patterns

Forbidden in any output, default or forked:

| Anti-pattern                              | Why it's banned                             |
|-------------------------------------------|---------------------------------------------|
| Purple → pink hero gradients              | The 2018–2024 SaaS uniform                  |
| Glassmorphism (frosted blurred panels)    | Form should reveal, not obscure             |
| Emoji used as icons                       | Third-party platform art; not yours         |
| Stock isometric illustrations             | Flatter without saying anything             |
| "Three feature cards with tiny icon" grid | The page has nothing to say                 |
| Mid-grey `#666`-on-white body text        | Cold + low contrast; use `--ink-soft`       |
| Animated gradient backgrounds             | Movement without meaning                    |
| Drop shadows from neutral grey            | Use warm-tinted shadows from `oklab` mixes  |
| Pure white background `#FFFFFF`           | Glaser worked on cream                      |
| Pure black ink `#000000`                  | Too cold; pick a warm near-black            |
| Font Awesome / Material icons             | Draw the icon for the specific concept      |
| All-caps body copy for "elegance"         | Capitals are a cost, not a virtue           |
| Centred body paragraphs > 4 lines         | Glaser left-aligned long copy. So do you   |
| Loading spinners on pre-rendered content  | The content is already in the HTML          |

---

## F · The single test

Before shipping, ask:

> *"Would Milton keep this in the Push Pin studio?"*

If you can't answer, the milton agent (`agents/milton.md`) will run the audit for you. The audit is the same regardless of which brand the fork is for — the test is whether the **philosophy** is honoured, not whether the colours match a specific reference.
