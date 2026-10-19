# Milton — Modes

Output scaffolds per request type. Read after `BRAND_BOOK.md`, `WEB.md`, and `ICONS.md`.

Every mode honours the contract — the philosophy, the web standards, the anti-patterns. **The default brand preset is CETI**; substitute any other brand by overriding tokens at the top of the artifact (see `brand-fork` mode below).

---

## Mode summary

| Mode             | Output                                       | When                                                                    |
|------------------|----------------------------------------------|-------------------------------------------------------------------------|
| `single-icon`    | One `.svg` file                              | "draw an icon for X"                                                    |
| `icon-set`       | N `.svg` files + `sprite.svg`                | "make an icon set for these concepts: …"                               |
| `showcase-page`  | One self-contained `.html`                   | "Glaser-style page about X" / "single-page artifact for X"             |
| `dashboard`      | One self-contained `.html` + assets          | "build a dashboard / inspiration library / reference page for X"       |
| `full-system`    | Directory tree (tokens + icons + html + agent) | "build a design system for X" / "give me everything"                 |
| `tokens-only`    | One `.css` file                              | "give me the token CSS for this brand" / "just the tokens"             |
| `brand-fork`     | One `.css` overlay file + brand-book stub    | "fork milton for {brand} using these colours"                          |

---

## `single-icon`

**Input:** one concept name. Optional: target accent role, target use (UI vs poster).

**Output:** one `.svg` file in 200×200 viewBox with `<title>`, `<desc>`, and `currentColor` adaptive fills.

**Process:**
1. Apply the five-step icon design process from `ICONS.md` §4.
2. Use `references/icon-template.svg` as the starting point.
3. Pick the accent **role** by mapping the concept to one of the actor slots. The role is brand-agnostic — `actor-1` could be vermilion (CETI) or terracotta (a tea brand). Use `currentColor` so the icon adopts whatever the consumer's parent colour is.
4. Write the `<desc>` as the future-self note about why the form earns the meaning.

---

## `icon-set`

**Input:** list of concept names (typically 3–24).

**Output:**
- `NN-name.svg` standalone files
- `sprite.svg` containing all icons as `<symbol>` elements
- a registry table at the top of the response listing each icon with its name and role

**Process:**
1. For each concept, run `single-icon`.
2. Audit the **set as a whole** — at 24 px each icon must read as distinct from the others.
3. Distribute accent roles across the set so colour balance feels considered.
4. Build the sprite by stripping `<rect width="200" height="200" fill="..."/>` (the cream background) and wrapping each geometry in `<symbol id="name" viewBox="0 0 200 200">…</symbol>`.

---

## `showcase-page`

**Input:** topic, audience, optional anchor principle, optional brand fork (palette + type stack overrides).

**Output:** one self-contained `.html` ≤ 25 KB (excluding fonts).

**Process:**
1. Start from `references/page-template.html`.
2. Apply brand overrides at the top of `:root` if a fork is requested.
3. Pick **one** Glaser principle to anchor the page. The hero, accent rotation, and pull-quotes reinforce that principle.
4. Pick **one** SOTA web technique:
   - `animation-timeline: scroll()`
   - `animation-timeline: view()`
   - View Transitions API
   - `:has()` parent selectors
   - `@container` queries
   - `text-wrap: balance` / `pretty`
   - `color-mix(in oklab, …)`
   - Variable font axes (`opsz`, `wght`)
   - The `popover` attribute
   - Anchor positioning (`anchor-name` / `position-anchor`)
5. Include light + dark mode + FOUC init script.
6. Top bar with theme toggle. Mobile collapse at 520 px.
7. Footer linking back to source design system.

---

## `dashboard`

**Input:** a domain or library to surface. Examples: "Glaser principles", "monthly KPIs", "writing rules".

**Output:** one self-contained `.html` (50–80 KB) with the layered scroll structure:

1. **Hero** — eyebrow, mega heading, supporting paragraph, meta row.
2. **Section 01** — primary content explorer (filterable cards, grid).
3. **Section 02** — visual register (icon gallery, image set, chart strip).
4. **Section 03** — interactive control (slider, toggle, scrub-driven).
5. **Section 04** — quote / pull / call-out wall.
6. **Section 05** — live demos (2–4 small interactive widgets).
7. **Footer** — sources, system links, colophon.

**Process:**
1. Start from `references/page-template.html` and extend.
2. Section number eyebrow (`01`, `02`, …) in mono caps with a section title in display.
3. Reveal-on-scroll via IntersectionObserver. Stagger via `:nth-child` transition-delay.
4. Reference the gold standard: `~/Documents/CETI/DESIGN/index.html`.
5. Mandatory: light + dark, mobile menu, theme toggle.

---

## `full-system`

**Input:** brand name + scope. Examples: "build a design system for the Raven cargo brand", "give me a CETI client deliverable kit".

**Output:** directory tree:

```
{brand}-system/
├── index.html              ← dashboard (entry point)
├── pages/
│   ├── 01-{principle}.html ← showcase pages
│   ├── 02-{principle}.html
│   └── 03-{principle}.html
├── icons/
│   ├── 01-{name}.svg       ← 8–12 standalone icons
│   ├── …
│   └── sprite.svg
├── tokens/
│   └── tokens.css          ← brand tokens (the fork)
├── research/
│   └── notes.md            ← source attribution, paraphrases
└── README.md               ← usage, attribution, override notes
```

**Process:**
1. Run `tokens-only` first — establish the colour and type contract for this brand.
2. Run `icon-set` for the chosen concepts.
3. Run `dashboard` for `index.html`.
4. Run `showcase-page` three times for the three anchor principles.
5. Write the README documenting the system, how to extend, source attribution, and the brand fork.

---

## `tokens-only`

**Input:** light + dark palette overrides (optional). Otherwise output the canonical token file.

**Output:** one `.css` file using CSS layers (`@layer reset, tokens, components, utilities;`).

**Process:**
1. Copy `references/tokens.css` verbatim if no overrides requested.
2. If the brief overrides the accent palette, override **only** `--actor-1` through `--actor-N` (and dark variants). Leave type ramp, motion, warm grounds alone.
3. If the brief overrides the warm grounds (rare — only for genuinely different brands), document the change in the file's header comment.

---

## `brand-fork` (NEW)

The dedicated mode for cleanly forking the default preset for a new brand.

**Input:**
- Brand name
- Brand palette: light/dark `--paper`, light/dark `--ink`, N actor colours (light + dark)
- Type stack (optional — defaults to Bricolage / DM Sans / JetBrains Mono if unspecified)
- Storage key (optional — defaults to `<brand>-theme`)

**Output:** two files
1. `tokens-{brand}.css` — overrides only. Designed to be loaded *after* the canonical `tokens.css`.
2. `BRAND_BOOK-{brand}.md` — short brand book documenting accent meanings, fork rationale, override block.

**Process:**
1. Validate every accent against `--paper` for both modes — must pass WCAG AA.
2. Validate `--paper` and `--ink` pairs as warm grounds (not pure white / pure black).
3. Generate the override CSS with both `:root` and `:root[data-theme="dark"]` blocks.
4. Generate a `<meta name="theme-color">` snippet for the brand's light + dark hex.
5. Generate a brand book stub with:
   - Accent meanings (one line each)
   - Override block (copy-paste-ready)
   - Storage-key change instruction
   - Reference back to the parent `BRAND_BOOK.md` for everything else

**Example call:**

> *"Fork Milton for Raven Cargo. Brand colours: deep slate `#1A2B3A`, signal orange `#E55A1F`, ivory `#F2EBDB`. Three actors only — slate, orange, deep-leaf-green `#3D5C3F`. Use 'Tiempos Headline' for display, 'Inter' for body."*

Output:

```css
/* tokens-raven.css — applied after canonical tokens.css */
:root {
  --paper:    #F2EBDB;
  --ink:      #1A2B3A;
  --actor-1:  #1A2B3A;   /* slate — primary, gravitas */
  --actor-2:  #E55A1F;   /* signal — warning, alert */
  --actor-3:  #3D5C3F;   /* deep-leaf — confirmation */
  --font-display: 'Tiempos Headline', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;
}
:root[data-theme="dark"] {
  --paper: #14202B;
  --ink:   #F2EBDB;
  --actor-1: #5C7A92;
  --actor-2: #FF7A40;
  --actor-3: #6F8F70;
}
```

Plus the matching brand book stub.

---

## Cross-mode rules

These apply to every mode (default preset *or* fork):

- ✓ Tokens inlined or imported.
- ✓ Type stack loaded (default or fork).
- ✓ Light + dark mode with FOUC init.
- ✓ Mobile-ready — `clamp()`, `auto-fill minmax()`, ≥40 px touch targets.
- ✓ WCAG AA contrast.
- ✓ `prefers-reduced-motion` honoured.
- ✓ Original SVGs only.
- ✓ Anti-patterns from `BRAND_BOOK.md` §E avoided.
- ✓ `<title>` and `<desc>` on every SVG.

The milton agent runs these checks regardless of which preset the artifact uses.

---

## When to invoke the milton agent

After producing any artifact, if the user asks "how does this look?" or "review this" — hand off to `agents/milton.md`. The agent runs the full audit checklist and reports findings against the **philosophy**, not against a specific palette.

The skill produces. The agent reviews. They are designed to be paired.
