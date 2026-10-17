---
name: milton
description: Generate production-grade Milton Glaser-influenced web artifacts, original feeling SVG icon systems, component libraries, and brand-agnostic design systems. Encodes Glaser's 8-phase creative process (Affection, Question, Ten Variants, Pun Pass, Critique, Refine, Strip, Three Responses, Truth Check), the 12 canonical geometric icon moves, and the 5-actor semantic colour system. Trigger on "Glaser-style", "Push Pin aesthetic", "warm editorial design", "icon set with meaning", "design like Milton", "/milton", or personalized SVG icon design.
---

# Milton — Philosophy-Led Iconography & Web Design System

A philosophy-led, brand-agnostic design and iconography skill in the lineage of **Milton Glaser** (Push Pin Studios, *I♥NY* rebus, Bob Dylan poster, *Ten Things I Have Learned*). Apply it to any SVG icon set, interactive explainer, dashboard, or web artifact that demands warmth, human gesture, visual wit (`[+pun]`), and the dignity of marks drawn for their specific purpose.

> *"There are three responses to a piece of design — yes, no, and WOW. Wow is the one to aim for."*
> — Milton Glaser

---

## Directory Structure (Antigravity Repackaged Edition)

- [references/PRINCIPLES.md](./references/PRINCIPLES.md) — Glaser's *Ten Things*, *Road to Hell*, *Ambiguity & Truth*, and *The Three Responses*.
- [references/ICONS.md](./references/ICONS.md) — The SVG Icon Contract (`0 0 200 200` viewBox, `currentColor` / `var(--paper)` negative-space punch, `stroke-linecap="round"`, mandatory `<title>` + poetic `<desc>`, and the 12 canonical icons).
- [references/META_PROMPT.md](./references/META_PROMPT.md) — Glaser's 8-Phase Creative Process made operable (`Phase 0 Affection` → `Phase 1 Question` → `Phase 2 Ten Variants` → `Phase 3 Pun Pass` → `Phase 4 Critique` → `Phase 5 Refine` → `Phase 6 Strip` → `Phase 7 Three Responses` → `Phase 8 Truth Check`).
- [references/BRAND_BOOK.md](./references/BRAND_BOOK.md) — Warm grounds (`#FAF7F2` / `#1C1A15`), the 5 rotating semantic actors (`--actor-1` Vermilion, `--actor-2` Cobalt, `--actor-3` Sunflower, `--actor-4` Forest, `--actor-5` Plum), fluid type ramp, and `--ease-glaser` (`cubic-bezier(.34, 1.56, .64, 1)`).
- [references/WEB.md](./references/WEB.md) — Single-file web execution, light/dark FOUC prevention, `prefers-reduced-motion`, and WCAG AA compliance.
- [references/MODES.md](./references/MODES.md) — Scaffolds for `single-icon`, `icon-set`, `showcase-page`, `dashboard`, `full-system`, `tokens-only`, and `brand-fork`.
- [references/agent-milton-auditor.md](./references/agent-milton-auditor.md) — The 12-point Glaser design revision persona & rubric.
- [assets/icon-sprite.svg](./assets/icon-sprite.svg) — The 12 canonical Milton `<symbol>` icons (`affection`, `no-job`, `toxic`, `greatness`, `just-enough`, `style`, `brain`, `doubt`, `aging`, `truth`, `wow`, `ambiguity`).
- [assets/tokens.css](./assets/tokens.css) — Canonical CSS custom properties & `@layer` system.
- [scripts/audit_milton.py](./scripts/audit_milton.py) — Automated 12-point Milton contract auditor for HTML and SVG files.

---

## Core Principles for Personalized & Feeling SVG Icons

1. **Identify the Principle, Not the Noun**: Never draw a dictionary entry ("briefcase", "head", "scale"). Draw the human tension ("a briefcase whose handle has detached and floats free"; "two crescents leaning in so a spark forms in the negative space between them").
2. **One Single Geometric Move + Visual Pun (`[+pun]`)**:
   - **Rebus / Substitution**: A glyph substitutes for a word or concept.
   - **Figure-Ground / Negative Space**: Use `var(--paper)` / `var(--ground)` cutouts so the warm paper ground forms eyes, hearts, and keyholes inside the ink silhouette.
   - **Asymmetric Human Warmth**: Rotate one element `18°` off the grid (`06-style`), tilt heads toward partners (`01-affection`), or let an outer resonance arc escape the frame (`11-wow`).
3. **Hand-Inked Tactility (`stroke-linecap="round"`)**: Rectangular caps look CAD-generated. Always use round caps and joins, warm grounds, and 2–3 semantic actor colours per mark.
4. **Mandatory `<title>` and Poetic `<desc>`**: Every SVG and `<symbol>` must include `<title>` and `<desc>`, where `<desc>` is a 2-sentence note to your future self explaining *what geometric move was made* and *why the form earns the meaning*.

---

## Interoperating with `/svg-enhance` and `glyph-foundry`

- To refactor existing primitive SVGs on the fly into 2.5D + Glaserian icons, invoke [svg-enhance](../svg-enhance/SKILL.md) (`python3 .agents/skills/svg-enhance/scripts/svg_enhance.py`).
- To compile multi-node narrative diagrams and interactive video explainers with 4-plane depth (`Z0..Z3`) and headless Chromium verification (`H1–H8`), invoke [glyph-foundry](../glyph-foundry/SKILL.md).
- To audit any finished HTML or SVG artifact against the 12-point Milton rubric, run:
  ```bash
  python3 .agents/skills/milton/scripts/audit_milton.py path/to/artifact.html
  ```
