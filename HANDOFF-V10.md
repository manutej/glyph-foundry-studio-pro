# HANDOFF-V10 — Visual Browser Monitor (`vbm`) Audit, Adversarial UX/Design Review & `v10` Upgrade Specification

- **Repository**: `https://github.com/manutej/glyph-foundry-studio-pro`
- **Local Workspace**: `/Users/cairo/Documents/CETI/ACCENTURE/content-factory v2/glyph-foundry-next/`
- **VBM CLI**: `/Users/cairo/.local/bin/vbm` (`vbm.mjs`)
- **VBM v9 Captures**: `out/vbm/01..12-*-v9.png`, `out/vbm/vbm-walkthrough-v9.mp4`, `out/vbm/vbm-walkthrough-v9.gif`, `out/vbm/vbm-telemetry-v9.json`

---

## 1. Executive Summary of VBM (`v9`) Live Recording & Adversarial Review

Using our custom **Visual Browser Monitor (`vbm`)** powered by Chrome DevTools Protocol (CDP) and `ffmpeg`, we recorded a 12-step interactive walkthrough across **Universal Infographic & Motion Foundry Studio Pro (`v9`)** and **Next-Gen Video Explainer (`v9`)**, paired with two independent adversarial review subagents:
1. **Principal UX & Interaction Architect** (Figma / Linear / Bret Victor Dynamicland lens)
2. **Master Graphic & Semiotic Director** (Milton Glaser / Saul Bass / Sanzo Wada / Edward Tufte lens)

While standalone SVG compilation passed 52/52 structural gates, **live browser telemetry (`vbm-telemetry-v9.json`) and `@2x` VBM screenshots exposed 5 P0 browser-integration bugs and 5 P1 visual/semiotic density opportunities**:

| ID | Severity | Surface | Finding Discovered by VBM + Adversarial Review | Status in `v10` |
|---|---|---|---|---|
| **P0-1** | **CRITICAL** | `#svg-plate-mount` vs `#svg-workflow-mount` | **Global `<style> svg { ... }</style>` CSS Cascade Clobbering**: Mounting `#combined-workflow-svg` and `#core-sprite` in the DOM injected unscoped `svg { --ground: #F5EEDF; ... }` and `.t-h { fill: var(--ink); }` rules into the page. This forced all 3 dark plates (`orpheum-operad`, `hydrographic-survey`, `isometric-voxel`) to render with light `#F5EEDF` backgrounds (`vbm-telemetry-v9.json` Steps 02, 03, 05) and turned Saul Bass headers black-on-black (`04-milton-warm-saul-bass-v9.png`). | **FIXED IN v10** |
| **P0-2** | **CRITICAL** | Tab IV (`#panel-rsi` Sprite Vault) | **Core SVG Sprite Vault 0/9 Rendered (`renderedNonEmpty: 0` in Step 10)**: `#sprite-preview-grid` referenced `#glyph-venn`, `#glyph-crowd`, etc., whereas `core-svg-artifacts-sprite.svg` used `id="tap-2026-10-09-venn"`, had a truncated `viewBox="0 0 320 180"` on `math` (`665×150`), and lacked scoped CSS custom properties (`--actor-a`, `--sw-frame`, etc.). | **FIXED IN v10** |
| **P0-3** | **CRITICAL** | Tab III (`#panel-motion` Single-Clock Theatre) | **Motion Canvas Blank (`nonBlankSamples: 0` in Step 09)**: `renderMotionFrame()` mutated `MA.O.charId` (`undefined` on `window.MA`, throwing a `TypeError` every frame) and called `MA.draw(cv, style, pal, t)` with reversed arguments instead of `MA.render(cv, style, pal, feel, t, opts)` and `MA.renderReductionRung(...)`. | **FIXED IN v10** |
| **P0-4** | **CRITICAL** | Left Dock (`#btn-compile-doc` & Sliders) | **Live Source-to-Infographic Synthesis Gap (`11-live-source-compile-v9.png`)**: Clicking `⚡ Compile Source → Graphics, SVG & Workflow` only updated `.t-title` while ignoring `#inp-doc-body`, and quantitative sliders only updated `milton-25d`. | **FIXED IN v10** |
| **P0-5** | **HIGH** | Video Explainer (`12-video-explainer-theatre-v9.png`) | **Candidate Idiom `undefined` in Sidebar**: `page.template.html` accessed `win.encoding` and `c.rejected` instead of `win.scores` and `c.reject` from `tap.symspec.json`. | **FIXED IN v10** |
| **P1-1** | **HIGH** | Wada 348 Re-Theming (`06-editorial-collage-wada-v9.png`) | **Luminance Mismatch on Wada Swatch Injection**: `applyWadaToSVGRoot` assigned `sw[0]` (`#ebd3a2` light cream in Wada No. 126) directly to `--actor-a`, reducing `.t-kpi` and `.t-badge` contrast to `1.26:1`. Now luminance-sorted and contrast-guarded (`≥ 4.8:1`) against dark vs. light plate grounds. | **FIXED IN v10** |
| **P1-2** | **HIGH** | Style 5 (`infographic-editorial-collage.svg`) | **Sparse Spotlight Frames (`ed-spot-0..3`) & Storyboard Strip**: Upgraded the 4 `210px` spotlight boxes into rich multi-part editorial illustrations (8-candidate pool + gate + arrow; 8+8 studio table + taper bars; 4-term equation + tree rings + 3D ingots; tilted torsion scale + 18° catalyst pod) plus causal beat arrows and progress bars in `B1..B8`. | **FIXED IN v10** |
| **P1-3** | **HIGH** | Style 6 (`infographic-isometric-voxel.svg`) | **Bottom Register Void (`y = 735..905`) Across Columns I–III**: Added 3 axonometric telemetry & cross-section cards at `y = 732..890` plus the rising `INVERSE AUTONOMY RAMP` curve and callout card in Column II (`y = 252..344`). | **FIXED IN v10** |
| **P1-4** | **HIGH** | Style 3 (`infographic-hydrographic-survey.svg`) & Style 4 (`infographic-orpheum-operad.svg`) | **Bathymetric Depth Contours & Operadic $K_4$ Coherence**: Added `0m..1000m` vertical depth-sounding scales + 4 bathymetric isolines (`100m`, `250m`, `500m`, `1000m`) + de-collided `ST-20`/`ST-23`/`ST-25` in Hydrography; added $C^1$ Bézier tangent handles, 3-way `A∩B∩C` overlap legend, Catalan `μ₁..μ₅` edge labels, and Mac Lane Pentagon Identity footer in Orpheum. | **FIXED IN v10** |
| **P1-5** | **MEDIUM** | Studio Ergonomics & Direct Manipulation | **Node Click-to-Inspect, Pan/Zoom, Split Compare & Shortcuts**: Added delegated click-to-inspect on any SVG glyph/station/card, drag-to-pan & wheel-zoom, `⇄ Split Compare` 2-up mode, and keyboard shortcuts (`1..6`, `W`, `M`, `R`, `Space`, `C`, `[`/`]`). | **FIXED IN v10** |

---

## 2. Verification Protocol for `v10`

1. Recompile all SVG plates, enriched sprite, and workflow diagram via `python3 compile_infographic.py`.
2. Recompile both standalone HTML applications via `python3 build_universal_studio.py` and `python3 build_page.py`.
3. Run `vbm --tag v10 --out out/vbm` to capture all 12 `@2x` screenshots, `.mp4` + `.gif` recordings, and `vbm-telemetry-v10.json`.
4. Verify in `vbm-telemetry-v10.json`:
   - Step 02 (`orpheum-operadic-svg`): `ground` is `#0A0A0B` (dark obsidian, NOT `#F5EEDF`).
   - Step 03 (`hydrographic-survey-svg`): `ground` is `#0E151B` (bathysphere navy, NOT `#F5EEDF`).
   - Step 05 (`isometric-voxel-svg`): `ground` is `#070B14` (iridescent dark, NOT `#F5EEDF`).
   - Step 06 (`editorial-collage-svg` + Wada No. 126): `actorA` has high contrast against `#FAF6EC` (no cream-on-cream text).
   - Step 08 (`combined-workflow-svg`): `clippedTexts === 0`.
   - Step 09 (`#panel-motion`): `canvasHealth.nonBlankSamples > 0` (both `#motion-canvas` and `#rung-canvas` actively rendering).
   - Step 10 (`#panel-rsi`): `spriteVaultHealth.renderedNonEmpty === 9` (all 9 `<use href="#glyph-...">` symbols visibly rendered).
   - Step 11 (`11-live-source-compile-v10.png`): Custom document claims & KPIs dynamically populate the infographic cards and storyboard beats.
   - Step 12 (`12-video-explainer-theatre-v10.png`): Candidate idiom box shows 4-axis scores and rejected candidates with zero `undefined`.
