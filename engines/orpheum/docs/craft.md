# Craft constitution — Geome Maker v3 / Orphic Maker
Update 2026-08-02: TAROT-HERMETICO folder now uploaded and reviewed. v2 findings: palettes live in geome/geome-engine.js (Prism, Hermetic, Austere, Rouge, Cobalt + 6 Sanzo Wada sets); color math in geome-color.js (weighted-RGB distance, family windows); blending = per-layer SVG compositing (geome-layers.js) — the off-palette escape point. v3 now carries the authentic palettes as lyres (spectra, hermetic, wadaJewel, wadaAntique, wadaIndigo, wadaPastel) with the chord law replacing blend modes. Chord algebra generalized to n strings (5-8). Default lyre: Spectra, seed 1927 (v2's default seed).

## Rules (the ones that bite here)
1. Palette closure is a law, not a filter. Every visible color is a member of the chosen lyre (7 strings) or its single ground. Blends resolve through the chord table — closed by construction, verified by lint on every render.
2. Pure core. A work is a deterministic function of (seed, symbol, depth, density, lyre, ground, unity). Same inputs, same work. No hidden state.
3. Primary geometries only. Circle, rectangle, triangle — and forms derived from them (ring, vesica, bar, dot). New vocabulary must be a composition, never a new primitive.
4. The term is the truth. Every work prints as a composition term; if it cannot be printed, it cannot be rendered.
5. Chrome is CETI; the artwork is the lyre. App UI uses DS tokens, type, and motion only. The artwork palette is the selected lyre — also grounded in DS colors.
6. No decoration without meaning. Every symbol carries its tradition and a one-line meaning. No filler glyphs, no emoji, no gradients.
7. Do not destabilize the algebra. Any change to chord() or eval() ships only with all four conservation checks green.

## Slop vs craft
| Slop | Craft |
|---|---|
| Alpha-compositing overlaps into arbitrary RGB soup | Overlaps painted as chords — palette members by construction |
| Raster blending, fuzzy exports | Vector clip-intersections; SVG stays crisp at any scale |
| "Looks right" screenshot | Four conservation checks rendered green on the canvas itself |
| Random doodads for richness | Typed archetype recipes with named meanings |

## Definition of Done (evidence, not assertion)
- [ ] Conservation checks green across all 5 lyres x both grounds (spot-render each)
- [ ] Chord table view shows every pair resolving to a string (visual proof of closure)
- [ ] All 20 symbols render non-empty, distinct, and upright at default settings
- [ ] Seed reproducibility: same inputs re-render byte-identical term string
- [ ] SVG and PNG export download and open
- [ ] No console errors; verifier pass on the shipped file
