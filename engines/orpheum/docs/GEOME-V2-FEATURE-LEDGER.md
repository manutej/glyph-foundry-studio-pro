# Geome v2 Standalone — Feature Ledger & Operadic Review
Extracted 2026-08-02 from `uploads/Geome Maker v2 (standalone) (2).html` (unpacked at `docs/standalone-extracted.html`) + engine sources in `uploads/TAROT-HERMETICO (1)/geome/`.

## The operadic question tree — what did Adi Da accomplish? `() → capability-map`

**ROOT ★ — When a viewer stands in front of one of these plates, what operations must have happened for it to exist?** ▷ *composed from children below; compose rule: union of named operations in Q1–Q5, filtered by the doneness criterion Q6.*

- **Q1 ★ — What is the irreducible unit of the work?** `() → unit-type`
  ▷ The **subunit**: 3–4 flat geometric pieces stacked (ground / form / focal / emblem). Not a stage, not a story, not a symbol.
- **Q2 — By what operations does a unit become a plate?** `() → operation-list`
  ▷ Reflection + rotation across a symmetry group (dihedral Dn, cross D2, diagonal D4, wallpaper p6m/p4m); instancing across rings/sectors; layering with opaque overlap re-cut to palette; interference of two planes of view; slicing/shifting bands; multi-center fields on projected polyhedra.
- **Q3 ★ — What is a *linead*, operationally?** `() → definition`
  ▷ Adi Da's **second working principle**: a *linear* web referred over the *areal* geome — a second reading of the same field, drawn assertively above it with a knockout halo. It is derived FROM the geometry (centers, axes), never decorative.
- **Q4 ★ — Where does his imagery come from — invention or transformation?** `() → source-mode`
  ▷ **Transformation.** His digital period composited photographic/drawn sources: reduced to flat plates (posterize / threshold / channel assignment), geometrically abstracted, then re-entered into the symmetric field. v2 gestures at this (image layers, color extraction, plate filters) but never closes the loop: **image → geometric form extraction → vectorization → linead**. That is the missing capability.
- **Q5 — What must the color do?** `() → color-law`
  ▷ Flat, opaque, palette-true. Overlaps are re-cut as NEW palette colors (v2's `pb:*` blends) — never a transparency wash. Nothing off-palette can sound.
- **Q6 — What is the criterion of doneness?** `() → predicate`
  ▷ Aperspectival (no single point of view survives), anegoic, aniconic; symmetry holds exactly; and the plate **prints at archival scale** — the physical print IS the artwork, hence the 900 DPI contract.

**FINDING (composed vs. collapsed):** Orphic Maker's direct answer was "the work is a myth told in stages." The composed answer from Q1–Q6 is "the work is a set of operations on flat geometric matter." The stages were a collapsed answer contradicted by the details — the details win. The tool must expose *operations*, not narrate.

## v2 feature extraction (the compounding asset — do not re-derive)

**Architecture** · single `params` state tree; `render() → GeomeBack.svg(params)` pure string renderer; active-layer snapshot/load buffer; rAF-debounced renders with an expensive-path fast mode (`_pbFast`); whole-tree session serialization with version + migrations (round-trip byte-equality contract); debounced autosave + resume toast; error bar surfacing uncaught exceptions.

**Nine panels (keys 1–9)**
1. **Generate** — seed, prev/next/random, method note.
2. **Subunits** — up to 8 subunits; piece alphabet grouped Ground/Form/Focal/Emblem/Texture; per-piece 2 color roles from {ink,disc,fA,fB,accent,bg,tint}; fractalize 0/1/2; reorder (ring assignment = order); upload own tile image.
3. **Centers** — multi-center: **Polyhedron field** (tetra/VE/octa/icosa/cube projected down a 2/3/4/5-fold axis; spacing, coverage, per-vertex rotation, armature; interference source twin/grow/dual; channel pairs; plate intensity; blend) · **Tiled wallpaper** (p6m/p4m, centers-across, decomposition depth/k/rule/jitter/inward-density, double-plane interference) · **Orbiting** (orbit/orbits/polygon/solid/recursive/phyllotaxis/frieze layouts, D/C global symmetry, satellite order/scale/facing/clip, referential armature) · **Two planes of view** (counter-rotation, opacity, blend, mix) · per-center-class rotation · transform-only animation (freeze = publishable still).
4. **Layers** — stack ≤9, back→front; lock/hide/reorder/delete; layer kinds **field / single motif / tile / image**; palette-true overlap blends `pb:multiply|screen|average|difference|exclusion|rotate` with overlap matrix UI, distinct-guarantee, bg participation, mask budget; **stencil knockout** by subunit, ring, palette role, color family, or eyedropper-picked hex + tolerance; keep/cut invert; window shape cell/silhouette; per-layer palette cycle (roll/swap/invert/hue); per-layer filters (posterize/threshold/duotone/complement/channel-swap/RGB light plates); composite whole-render filter; image layers with zoom/crop-aspect/fit/reposition/perspective tilt; image palette extraction + color-key drop/isolate; vector geome-bed layer.
5. **Slice shift** — per-layer row/column band cuts; on-plate editor (click to cut, drag to move, Alt-click remove, Shift-drag to slide); snap grid; wrap/gap; even/stagger/zero/clear; arrow-key nudges.
6. **Surface** — 5 formats (card 700×1200 → exhibition 2560×1080); radial/grid; dihedral/cross/diagonal symmetry; order 3–16; rings 3–14; concentric-only; **moiré**; **linead web none/on/dense**; core radiance; Platonic core + projection axis; features 1–6; line weight.
7. **Color** — 14 named palettes + **348 Sanzo Wada combinations** (search by name/number, filter by size).
8. **Export** — SVG; PNG 4×; print PNG with inch presets (A4/A3/A2/24″/36″) + 4K/8K pixel masters; **DPI 300/450/600/900**.
9. **Sessions** — named slots w/ thumbnails, rename/duplicate/delete; portable `.geome.json` export/import; autosave/resume.

**The 900-DPI export contract (port verbatim)** · (a) target px = inches × DPI computed from the plate's own aspect; (b) **user-space rewrite** — viewBox becomes the pixel box wrapped in `scale(s)` so SVG filters/patterns/nested crops rasterize 1:1 at print res, not at browser default buffers; (c) **tiling** ≤3072px (halved when mask-heavy), each tile a fresh rasterization of its viewBox window, stitched; (d) **pHYs chunk rewrite** with CRC so pre-flight readers see true physical size; (e) raster-layer warnings (source pixels cap detail); (f) memory warnings >200MP.

**Keyboard system** · 1–9 panels · ⌘K/⁄ command palette · ? map overlay · **Alt-hold surfaces key badges on the controls themselves** · C collapse all · M drawer · [ ] seed · R random · G reroll · Space play/freeze · F fullscreen (fit/fill/100%, wheel zoom, drag pan) · B borders · K background (off = transparent export) · D/L/Z jump-to-section with flash · X stencil toggle · , . palette roll · I invert · S SVG · P PNG · arrows nudge slice bands · Esc. Plus pop-out standalone viewer (own tab, real Fullscreen API, all 5 formats embedded).

## Gap → build: Linead Studio
The one capability chain v2 lacks, and the one that closes Q4: **upload a drawing/photo → extract geometric forms (luminance band decomposition) → vectorize (marching-squares contour tracing → simplification → Fourier-descriptor resynthesis, the abstraction dial) → flat palette plates + a derived linead web → export SVG / PNG at up to 900 DPI** via the ported tiled exporter. Resolution is maintained because everything after tracing is analytic vector geometry; the Fourier truncation IS the geometric-abstraction control (2 harmonics ≈ ellipse … 64 ≈ faithful).

Shared module: `linead-engine.js` (tracing, Fourier, linead derivation, pHYs/tiled print export) — wire the same exporter into the other makers so *every* piece exports at 900 DPI.
