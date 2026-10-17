---
name: editorial-dashboard
description: Create bold, tactile, print-inspired interactive HTML dashboards and visual reports styled after Push Pin Studios (Milton Glaser, Seymour Chwast), New York Magazine feature spreads, and mid-century editorial illustration. Use when building single-file HTML dashboards, analytical briefings, executive digests, or visual explainers that pair interactive Chart.js data visualization with bespoke ink-outlined SVG spot illustrations and 2.5D volumetric symbolic idioms.
---

# Editorial Dashboard — Push Pin Studios × Interactive Data Journalism

Build single-file interactive HTML dashboards that look and feel like a curated print feature spread from *New York Magazine* or *Push Pin Graphic*—combining warm cream stock (`#F1EBDD`), thick ink contour borders (`#1A1612`), offset litho drop-shadows, `Fraunces` display typography, interactive Chart.js canvases, and bespoke SVG spot illustrations.

---

## Directory Structure

- [scripts/validate_dashboard.py](./scripts/validate_dashboard.py) — Automated HTML tag balance, anchor link (`href="#id"`), JS selector (`getElementById` / `querySelector`), and SVG CSS-variable validator.
- [references/svg-icons.md](./references/svg-icons.md) — Copy-ready catalog of 24+ CSS-variable-parameterized (`var(--ink)`, `var(--red)`, etc.) Push Pin SVG spot icons, dividers, and badges, plus integration with the 9 volumetric 2.5D symbolic idioms from [glyph-foundry](../glyph-foundry/SKILL.md).
- [references/chart-recipes.md](./references/chart-recipes.md) — Editorial Chart.js configurations (ink-bordered bars, zero-gridline radar, custom HTML legend pills, and warm cream tooltips).
- [references/cultural-adaptation.md](./references/cultural-adaptation.md) — Palette aliasing (`:root` CSS variable overrides), localized typography stacks, and vernacular motif swaps.

---

## Workflow

### Step 1 — Establish the Editorial Spine & Palette Aliasing
Define your `:root` CSS custom properties first (`--paper`, `--paper-deep`, `--ink`, `--ink-soft`, `--red`, `--orange`, `--yellow`, `--teal`, `--blue`, `--pink`, `--rule`). If adapting to a regional or domain aesthetic (e.g., Japanese Mingei, Bauhaus, or DeepMind Iridescent), alias those variables at `:root` per [references/cultural-adaptation.md](./references/cultural-adaptation.md).

### Step 2 — Compose the Print-Spread Layout
Structure the page as an editorial feature:
1. **Masthead (`<header>`)**: Issue/volume metadata, display headline (`Fraunces` 900 italic accents), deck paragraph, and a hero SVG emblem (`140×140` or a `glyph-foundry` `<symbol>` crucible).
2. **Sticky Section Navigation (`<nav>`)**: Pill links with `IntersectionObserver` scroll-spy.
3. **Numbered Editorial Sections (`01`–`06`)**: Alternate grid densities (`4-col KPI strip`, `2-col asymmetric 1.3fr/1fr`, `3-col catalog cards`, `dark ink #1A1612 contrast band`).

### Step 3 — Embed Bespoke SVG Spot Art & 2.5D Volumetric Idioms
- Never use emoji or generic icon fonts as section headers or KPI badges.
- For spot icons, dividers, and stamps, use the CSS-variable-parameterized SVGs in [references/svg-icons.md](./references/svg-icons.md).
- When a section requires deeper symbolic architecture (e.g., an intake sieve, paired cohort crucible, coaching taper, unit-economics multiplier, or torsion balance), compile a `SymSpec` via [glyph-foundry](../glyph-foundry/SKILL.md) and embed its `<symbol>` sprite or full multi-plane SVG.

### Step 4 — Wire Interactive Filtering & Editorial Charts
- Pair every Chart.js canvas with interactive filter pills or parameter sliders that recompute the dataset and call `chart.update()`.
- Apply the global Chart.js defaults from [references/chart-recipes.md](./references/chart-recipes.md) (`borderColor: '#1A1612'`, `borderWidth: 2`, custom HTML legend pills).

### Step 5 — Validate Before Delivery
Always run the validation script before finishing:
```bash
python3 .agents/skills/editorial-dashboard/scripts/validate_dashboard.py path/to/dashboard.html
```
Verify `0 errors` (all tags balanced, all `#anchor` links and JS DOM IDs resolved).
