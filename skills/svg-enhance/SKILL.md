---
name: svg-enhance
description: On-the-fly SVG refactoring and enhancement pipeline (/svg-enhance). Transforms primitive, flat, or CAD-like SVGs (standalone .svg files or inline <svg> inside HTML) into personalized, feeling, 2.5D lithographic & Glaserian SVGs with <title> + poetic <desc>, 5-actor semantic CSS tokens, negative-space var(--paper) cutouts, round hand-drawn stroke caps, 4-plane Z-depth (Z0..Z3), and headless Chromium verification. Trigger on "/svg-enhance", "enhance this SVG", "refactor primitive SVGs", or when upgrading flat icons/diagrams to WOW quality.
---

# `/svg-enhance` — On-the-Fly Primitive SVG Refactoring & Soul Pipeline

When an agent or designer produces a primitive SVG, it almost always suffers from the same seven failure modes:
1. **Literal Noun Illustration**: Drawing a dictionary noun (a generic person peg, a plain box, a standard arrow) instead of the **principle** at stake.
2. **Cold CAD Geometry**: Rectangular stroke caps (`stroke-linecap="butt"`), rigid un-tilted postures, and zero human warmth.
3. **Flat 1-Plane Surface**: Everything sits on a single undifferentiated plane with no lithographic offset plinth (`Z0`), no mechanism layer (`Z1`), no primary actor plane (`Z2`), and no callout rim (`Z3`).
4. **No Negative-Space Punch**: Missing `var(--ground)` / `var(--paper)` cutouts (eyes, keyholes, figure-ground hearts) where the warm paper ground breathes through the ink.
5. **Hardcoded Hex Lock-In**: Raw `#hex` values baked into geometry instead of `currentColor` or semantic CSS custom properties (`--ink`, `--paper`, `--actor-1..5`, `--sunflower`, `--forest`, `--plum`).
6. **Silent Anonymous Markup**: Missing `<title>` and poetic `<desc>` (*"The `<desc>` is mandatory. It's the difference between an icon and a glyph."* — Milton Glaser).
7. **Unverified Text & Box Collisions**: Labels overlapping strokes or spilling outside the `viewBox` because nobody measured real fonts in headless Chromium.

**`svg-enhance`** fixes all seven—either by mechanically refactoring existing SVG DOM trees via [scripts/svg_enhance.py](./scripts/svg_enhance.py) OR by guiding a 5-phase Glaserian + 2.5D Volumetric redraw Verified in Headless Chromium.

---

## Directory Structure

- [scripts/svg_enhance.py](./scripts/svg_enhance.py) — Executable CLI tool with three modes:
  - `--audit <file.svg|file.html>`: Audits standalone or inline SVGs against the 8 `svg-enhance` quality gates and outputs a structured score and fix list.
  - `--refactor <in.svg> -o <out.svg>`: Automatically upgrades a primitive SVG (tokenizes hexes to CSS vars, adds `stroke-linecap="round"`, injects `<title>`/`<desc>`, synthesizes a `Z0` lithographic offset shadow plane + `Z1..Z3` `data-z` hierarchy, and verifies in Chromium).
  - `--emit <idiom_or_icon> -o <out.svg>`: Emits any of the 9 `v8` 2.5D volumetric idioms (`crowd`, `gate`, `cohort`, `contract`, `taper`, `fork`, `equation`, `balance`, `venn`) or the 12 canonical Milton icons (`affection`, `no-job`, `toxic`, `greatness`, `just-enough`, `style`, `brain`, `doubt`, `aging`, `truth`, `wow`, `ambiguity`) on the fly.
- [references/glaser-12-moves-and-puns.md](./references/glaser-12-moves-and-puns.md) — The 12 canonical geometric moves, visual pun (`[+pun]`) patterns, and 5-actor semantic color contract.

---

## The `/svg-enhance` 5-Step Workflow

### Step 1 — Audit the Primitive SVG
Run the auditor on the target `.svg` or `.html` file:
```bash
python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --audit path/to/target.svg
```

### Step 2 — Run the Poetic Semiotic Upgrade (The Milton Pass)
Before touching coordinates, answer three questions from [references/glaser-12-moves-and-puns.md](./references/glaser-12-moves-and-puns.md):
1. **Principle over Noun**: What is the human truth or tension inside this graphic?
2. **One Geometric Move + Visual Pun (`[+pun]`)**:
   - *Need partnership / pairing?* → **Leaning crescents + negative-space sunflower spark** (`01-affection`).
   - *Need potential / elastic capacity?* → **Solid baseline + tall dashed peak / dashed silhouette with heart spark** (`04-greatness`).
   - *Need a threshold / vetting bar?* → **The arrow that has already passed through the target** (`10-truth`).
   - *Need a trade-off / doubt?* → **Mirrored question marks (`? ?`) at the hinge + 18°-rotated catalyst square** (`08-doubt` × `06-style`).
   - *Need time / compounding?* → **Off-centre accumulating tree rings** (`09-aging`).
   - *Need a synthesis / hero mark?* → **Vesica Piscis crucible with an outer resonance arc escaping the frame** (`12-ambiguity` × `11-wow`).
3. **Mandatory `<title>` and `<desc>`**: Write a 1-sentence `<title>` and a 2-sentence `<desc>` (Sentence 1: the geometric move; Sentence 2: why the form earns the meaning).

### Step 3 — Apply 4-Plane 2.5D Lithographic Depth (`Z0`–`Z3`)
Organize every `<svg>` into explicit `<g class="z-layer" data-z="0..3" data-seq="0..k">` planes:
- **`Z0` (`data-z="0"`)**: Offset lithographic plinth shadow (`dx=3.0, dy=4.0`, `fill="var(--shadow)"`), warm elevated card (`fill="var(--elev)"`), and horizon gridlines.
- **`Z1` (`data-z="1"`)**: Structural mechanisms, connectors, and 5-actor semantic accents (`--actor-a` Cobalt, `--actor-b` Amber, `--accent` Vermilion, `--sunflower` `#E8B53C`, `--forest` `#3B6E47`, `--plum` `#6B3F6E`).
- **`Z2` (`data-z="2"`)**: Expressive 2.5D figures (`lean` head tilt toward partners, extruded torso bevel, `var(--ground)` negative-space chest/eye cutouts) or 3D axonometric blocks (`P.iso_block`).
- **`Z3` (`data-z="3"`)**: Hand-inked calipers, sunflower affection sparks, and `Caveat` / `Fraunces` / `JetBrains Mono` labels.

### Step 4 — Execute Automatic or Programmatic Refactor
- To mechanically upgrade an existing SVG file:
  ```bash
  python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --refactor input.svg -o enhanced.svg \
    --title "The Ratio Hinge" \
    --desc "An over-torqued 8:8 scale paired with an 18-degree rotated catalyst cell. Doubt is the hinge that opens a lighter ratio."
  ```
- To emit a parametrized 2.5D volumetric idiom or canonical Milton icon directly:
  ```bash
  python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --emit balance -o balance.v8.svg
  ```

### Step 5 — Verify in Headless Chromium
```bash
python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --audit enhanced.svg --chromium
```
Confirm `0 errors` across token purity, `<title>`/`<desc>` presence, `data-z` depth planes, and Chromium `getBBox()` text collision checks.
