---
name: glyph-foundry
description: Compile grounded symbolic specifications (SymSpec JSON) into verified 2.5D volumetric SVGs, @2x PNG plates, reusable <symbol> sprites, and interactive video explainers with cinematic camera choreography, WebAudio synthesis, and live What-If DOM simulation. Use when creating bespoke technical diagrams, system architectures, economic models, or video explainers from transcripts, specs, or briefs where generic icons fail and zero-overlap mathematical verification (H1–H8) is required.
---

# Glyph Foundry — 2.5D Volumetric & Symbolic Diagram Compiler

**Glyph Foundry** solves the entire category of bespoke symbolic diagrams and interactive video explainers by separating **what a claim means** (`SymSpec` JSON) from **how its visual metaphor is drawn** (the 2.5D Volumetric Pen + 9 Semiotic Idioms) and **how it is verified** (an 8-gate headless Chromium + `getBBox()` + pixel-alpha harness).

Instead of hand-coding brittle coordinates or pasting generic flat icons, an agent authors a declarative `*.symspec.json` file grounded in verbatim source spans (`s1..sN`), compiles it through the FigTree constraint solver and 4-plane (`Z0..Z3`) volumetric pen, verifies `0 errors, 0 warnings` across all 8 gates (`H1`–`H8`), and emits:
1. **Multi-Skin Volumetric SVGs** (`milton-warm`, `deepmind-iridescent`, `ceti-night`) with CSS custom-property theming (`--gf-*`).
2. **Hex-Resolved Standalone SVGs & `@2x.png` Plates (`2560×1440`)** for direct ingestion into `artifact-chain` (`PPTX`, `DOCX`, `PDF`).
3. **Reusable `<symbol>` Sprite Sheet** (`*.glyphs.sprite.svg`) for `editorial-dashboard` and `ceti-explainer`.
4. **Next-Gen Interactive Video Explainer (`glyph-foundry.html`)** featuring a spring-damped **Cinematic Camera Director**, **2.5D Interactive Parallax Tilt**, **Sub-Glyph Staged Choreography (`data-seq`)**, **Live Bezier Flow Particles**, **Procedural WebAudio Synthesizer**, **Interactive What-If Simulator**, and **Before/After Curtain Studio**.

---

## Directory Structure

- [scripts/emit.py](./scripts/emit.py) — End-to-end build pipeline: runs `H1`–`H8` across all style skins, emits `.svg`, `.resolved.svg`, `@2x.png`, `.glyphs.sprite.svg`, and `.beats.json`.
- [scripts/compile_infographic.py](./scripts/compile_infographic.py) — Universal Source-to-Infographic, Core SVG, and Combined Workflow Diagram compiler with 4-Round Recursive Self-Improvement (`R0 → R1 → R2 → R3`, `52/52 Gates PASS` across `H1–H8`, `G01–G20`, `P1–P8`). Emits all 6 SVG infographic archetypes (`milton-25d`, `saul-bass-cutout`, `hydrographic-survey`, `orpheum-operad`, `editorial-collage`, `isometric-voxel`) + `combined-workflow-diagram.svg` + `rsi-ledger.json` from any `--source <doc.md|txt|json>`.
- [scripts/build_universal_studio.py](./scripts/build_universal_studio.py) — Compiles the standalone multi-chrome interactive workbench (`Universal Infographic & Motion Foundry Studio Pro.html`) uniting 5 switchable UI chromes, 18 tweakable infographic & single-clock animation styles, 348 Sanzo Wada combinations + OKLab $4\times 4$ chord matrix, 8 character rigs $\times$ 5 Saul Bass reduction rungs, and live source re-compilation.
- [scripts/run_harness.py](./scripts/run_harness.py) — Standalone CLI gate runner (`H1`–`H8`) for any `SymSpec` JSON and style skin.
- [scripts/build_page.py](./scripts/build_page.py) — Compiles the self-contained Next-Gen Video Explainer HTML from `assets/page.template.html` and the emitted artifacts.
- [foundry/pen.py](./foundry/pen.py) — 2.5D Volumetric Pen with `P.layer(z, seq, cls)`, `P.plinth(...)`, `P.iso_block(...)`, `P.caliper(...)`, and sculpted 2.5D `P.person(...)` with domain chest emblems (`client`, `pursuit`, `coach`, `candidate`).
- [foundry/glyphs.py](./foundry/glyphs.py) — The 9 canonical 2.5D symbolic idioms (`crowd`, `gate`, `cohort`, `contract`, `taper`, `fork`, `equation`, `balance`, `venn`).
- [foundry/solver.py](./foundry/solver.py) — Bottom-up / top-down FigTree layout solver (`row`, `col`, `stack`, `grid`) with deterministic port coordinates (`n`, `s`, `e`, `w`).
- [foundry/compile.py](./foundry/compile.py) — SVG + self-contained `@font-face` (`Fraunces`, `DM Sans`, `Caveat`, `JetBrains Mono`) compiler and obstacle-aware cubic Bezier edge router.
- [foundry/harness.py](./foundry/harness.py) — 8-gate headless Chromium verification suite (`H1`–`H8`).
- [styles/](./styles/) — Style token records: [milton-warm.json](./styles/milton-warm.json), [deepmind-iridescent.json](./styles/deepmind-iridescent.json), and [ceti-night.json](./styles/ceti-night.json).
- [references/symspec-and-volumetric-catalog.md](./references/symspec-and-volumetric-catalog.md) — Complete `SymSpec` JSON schema, 4-plane Z-architecture (`Z0..Z3`), and catalog of the 9 volumetric idioms.

---

## Workflow

### Step 1 — Ground the Source & Author `SymSpec` JSON
Read [references/symspec-and-volumetric-catalog.md](./references/symspec-and-volumetric-catalog.md). Segment the user's source transcript or brief into numbered spans (`S1..SN`) and author a `SymSpec` JSON file containing:
- `canvas`: `{"width": 1280, "height": 720, "pad": 28}`
- `source_spans`: dictionary mapping `"S1"`..`"SN"` to verbatim quotes.
- `root`: nested layout tree (`row`, `col`, `stack`) whose leaves specify `glyph` (`crowd`, `gate`, `cohort`, `contract`, `taper`, `fork`, `equation`, `balance`, `venn`), `params`, `grounds` (`["S3"]`), and `candidates` (3 metaphor candidates considered, 1 winner + rationale).
- `edges`: directed connections (`from: "node.e"`, `to: "target.w"`, `kind`: `"flow"` | `"select"` | `"taper"` | `"feed"`).
- `beats`: narrative timeline beats (`b1..bN`) binding `start`, `end`, `focus` leaf IDs, `edges`, `spans`, and `caption`.

### Step 2 — Run the 8-Gate Harness (`H1`–`H8`)
```bash
python3 .agents/leaf-skills/glyph-foundry/scripts/run_harness.py path/to/spec.symspec.json
```
All 8 gates must report **`0 errors, 0 warnings`**:
- **H1 (`text_overlap`)**: Real Chromium `getBBox()` pairwise text collision check.
- **H2 (`text_clip`)**: Every `<text>` node fits inside the canvas and its parent leaf box.
- **H3 (`edge_cross_text`)**: No connector path passes through a non-endpoint text label's bounding box.
- **H4 (`port_land`)**: Every connector endpoint lands within `2px` of its declared port.
- **H5 (`contrast`)**: Every `<text>` vs. background luminance ratio meets WCAG AA (`>= 4.5:1`).
- **H6 (`grounding`)**: Every non-title leaf and every beat cites `>= 1` valid `source_spans` key, and every leaf records 3 metaphor `candidates`.
- **H7 (`spill`)**: Pixel-alpha tight bounding box of every isolated `<g id="n-*">` leaf fits within `6px` of its solver box (`0.0px` target).
- **H8 (`depth_layers`)**: Every non-title glyph emits at least 3 distinct `data-z` planes (`Z0..Z3`) and `>= 2` staged `data-seq` choreography sub-groups.

### Step 3 — Emit Multi-Skin SVGs, `@2x.png` Plates, Multi-Chrome Infographics & Workflow Diagram
```bash
python3 .agents/leaf-skills/glyph-foundry/scripts/emit.py
python3 .agents/leaf-skills/glyph-foundry/scripts/compile_infographic.py --source path/to/doc.md
```

### Step 4 — Compile the Interactive Next-Gen Video Explainer & Multi-Chrome Studio Pro
```bash
python3 .agents/leaf-skills/glyph-foundry/scripts/build_page.py
python3 .agents/leaf-skills/glyph-foundry/scripts/build_universal_studio.py
```

---

## Interoperating with Peer Skills

- **`editorial-dashboard` & `editorial-design-studio`**: Inline `out/*.glyphs.sprite.svg` at the top of `<body>` and instantiate any volumetric glyph via `<svg viewBox="0 0 W H"><use href="#glyph-ID"/></svg>`, or launch `Universal Infographic & Motion Foundry Studio Pro.html` to switch across all 5 studio chromes and 348 Sanzo Wada combinations.
- **`artifact-chain`**: Use `out/*.resolved.svg` or `out/artifacts/*@2x.png` inside `ADD_ICON` / `ADD_SYMSPEC_FIGURE` atoms when mutating `PPTX`, `DOCX`, or `PDF` artifacts.
- **`ceti-explainer`**: Run `.agents/skills/ceti-explainer/scripts/compile_symspec_episode.py` to compile any `SymSpec` JSON into a 4-panel `ceti-explainer` episode module (`episode.js`) that passes `gate.mjs`.
