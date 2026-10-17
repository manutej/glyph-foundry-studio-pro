# Orphic Meta-Spec — the schema that generates the studio
Derived 2026-08-10 by the meta-design discipline: brief → typed schema → executed instrument → audit.
This file is the LAW for every maker in this project (Linead Studio, Geome Maker v3, Orphic Maker).
It specifies MEANS only: the tool never interprets the art — it exposes operations. Meanings live in
`docs/ORPHIC-LEXICON.md` as names a user may choose; they are never applied automatically.

## Source grounding (checked against the artist's own account)
- **Geome** = the primary geometries — circle, square/rectangle, triangle — replicated and composed.
- **Linead** = the gestural pole: lines freely drawn by hand — the balancing polar opposite of the geome,
  referred over it, never decorative.
- **Orphic font** = a root alphabet prior to geome and linead — in the studio: symbol recipes as root-system.
- The images are **aperspectival, anegoic, aniconic**; colour is flat, bold, and relational (palette-true,
  emotional force by relation, never wash); fabrication is monumental and archival — hence the 900-DPI contract.
- Sources: *Transcendental Realism* (2010) — "Geome and Linead: my working-principles of image-art";
  theascentoforpheus.org (geometric & gestural abstraction); acsforum.org "Beyond Modernism";
  adidaupclose.org (Free Light-Imagery); `docs/GEOME-V2-FEATURE-LEDGER.md` (the extracted v2 capability map).

## The typed schema
```
Piece         := annulus | disc | petal | bar | diamond | spoke | crescent | triangle | square
Ring          := Piece × count(Dn) × phase × size × ToneRank?
Construction  := seed × order(3–16) × rings(2–9) × recipe[Ring] × core
ImageBands    := luma strata → marching-squares trace → simplify(ε) → Fourier(H 0–64)
Layer         := (ImageBands | Construction) × Transform(dx,dy,rot,scale) × Blend × OverlapReCut
                 × StencilCuts × ToneOverrides × Opacity
Plate         := ground? × Layer* × Linead? × Ghost?
ColorLaw      := every fill ∈ Palette.ramp ∪ {ground, ink}; overlap re-cut to NEW palette members; no washes
LineadMode    := none | web | dense (referential straight web) | gesture (freely-curving strokes, knockout halo)
PrintContract := SVG-first; tiled 1:1 raster; user-space rewrite; pHYs CRC; 300–900 DPI
```

## Acceptance predicates (computed, never estimated)
- **P1 Palette closure** — no fill outside the palette. All fills route through `rampColor` or ramp-index
  overrides (pins are stored as ramp indices, so palette swaps stay lawful). PASS by construction.
- **P2 Symmetry exactness** — dihedral replication is analytic (one path replayed at k·2π/N). PASS.
- **P3 Vector persistence** — nothing after the trace is raster; Fourier resynthesis is analytic geometry. PASS.
- **P4 Print contract** — every tile rasterised 1:1 at target resolution; pHYs chunk CRC-correct. PASS (ported v2).
- **P5 Granular addressability** — every plate, ring, piece and colour addressable in ≤ 2 gestures:
  chip click = distill · shift = stencil window · alt = pin colour; card click = cycle piece · shift = pin tone. PASS.
- **P6 Non-interpretation** — no meaning applied automatically; symbol recipes are opt-in names only. PASS.
- **P7 Parity floor** — no capability of the previous build removed; the geome vocabulary is a strict
  superset of the prior release. PASS (all v1 features intact + triangle, square).
- **P8 Persistence** — the construction survives reload (autosave/resume) and travels (portable ·json). PASS.

## Refinement log (this pass)
- σ1 **AlignVocabulary**: + triangle, + square — the primary geometries named by the source spec.
- σ2 **AlignLinead**: + gesture mode — deterministic freely-curving strokes (splines through the field's
  weighted centers, ends released past the border, knockout halo) beside the straight referential web.
- σ3 **GranularColor**: per-plate colour pinning (alt-click a chip, ramp-indexed); per-ring tone-plate
  pinning on geome constructions (shift-click a subunit card).
- σ4 **WadaPalettes**: ten Sanzo-Wada-drawn combination palettes join the six studio palettes.
- σ5 **Sessions**: autosave + resume + portable ·json save/load (v2 parity).
- σ6 **WadaDictionary**: the FULL 348-combination dictionary (`geome-wada.js`, ported v2 data) with
  search by colour name / number and size filter (2/3/4), mapped losslessly into the palette law
  via `wadaToPalette` (bg→ground, roles→ramp). Selecting a combination IS selecting a palette — P1 holds.
- σ7 **Eyedropper**: `paletteFromSource` — median-cut extraction from the uploaded source's own colours
  into a lawful custom palette (lightest→ground, darkest→ink, boxes→ramp). The image's colour world
  re-enters the plate only through the ramp, so closure is preserved by construction.
- σ8 **StudioWiring**: σ2/σ3/σ5 fully surfaced in the instrument — 4-mode linead segment, pin badges
  (✦ colour, ·T tone) on chips and cards, session save/load buttons, keyboard map rows, W cycles 4 modes.

## Open (next σ)
Per-piece colour roles (ground/form/focal/emblem per subunit) · gesture lineads in the Geome Maker v3
maker tab (it runs its own internal engine — port `deriveGesture` over its anchor set) · Wada dictionary
surfaced in Orphic Maker.

## Doneness
A build ships only when P1–P8 pass and the verifier confirms the instrument renders clean at load.
