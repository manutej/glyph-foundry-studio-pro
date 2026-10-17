# The Orphic Lexicon — compositional pieces, named
The operadic pass on the studio's compositional algebra: every technical piece carries its name in the orphic register, and the UI speaks both. Engine source of truth: `linead-engine.js` (`SUBUNIT_KINDS`, `SYMBOLS`).

## Question tree · `() → piece-lexicon`
**ROOT — What are the composable pieces of a plate, and what does each mean?** compose rule: union of leaf vocabularies; a symbol = an ordered recipe over the piece vocabulary.

- **Q1 — What is the smallest piece?** ▷ the ring-element: annulus, disc, petal, bar, diamond, spoke, crescent (`SUBUNIT_KINDS`).
- **Q2 — How do pieces carry meaning?** ▷ by name and position, not decoration: Ring = boundary of the Self · Disc = point of origin · Petal = anima opening outward · Bar = threshold · Diamond = shadow · Spoke = linead seed · Crescent = Luna, the receptive arc.
- **Q3 — What is a symbol, operationally?** ▷ a *recipe*: an ordered subunit sequence + a symmetry order (`SYMBOLS` — 7 Jungian archetypes, 4 Hermetic majors). Choosing "The Self" IS choosing `[annulus, disc, petal, annulus] × D8`.
- **Q4 — How do pieces compose upward?** ▷ ring-element → ring (replicated ×N dihedral) → construction (rings + core) → layer → plate (layers with overlap re-cut, stencil cuts, blends, linead web).
- **Q5 — What survives export?** ▷ every level: subunit SVGs (per ring slot), tone-plate SVGs (per band), the whole plate as SVG or tiled PNG to 900 DPI.

## Context index
- `docs/GEOME-V2-FEATURE-LEDGER.md` — v2 feature extraction + the founding operadic tree (what Adi Da accomplished).
- `docs/ORPHIC-LEXICON.md` — this file: piece vocabulary + symbol recipes.
- `linead-engine.js` — all geometry: tracing, Fourier, `geomeBands`, `SYMBOLS`, compositor, 900-DPI exporter.
- `Linead Studio.dc.html` — the instrument.
- `docs/standalone-extracted.html` — unpacked v2 reference.

New pieces or symbols: add to `SUBUNIT_KINDS` / `SYMBOLS` in the engine and record the name here — one line each.
