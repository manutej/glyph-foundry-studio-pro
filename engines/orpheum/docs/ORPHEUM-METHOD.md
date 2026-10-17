# Orpheum — method and reference

How a plate is made, operator by operator, and the file that stores it. Engine: `orpheum-engine-v3.js`; instrument: `Orpheum v3.dc.html`.

## The pipeline

```
source image ──ingest──▶ poly atoms ─┐
circle · square · triangle (atoms) ──┼──▶ composition tree ──evaluate──▶ forms (pts, rank, mode)
                                     │          ▲                              │
                     operators (n in, 1 out) ───┘                              ▼
                                                        buildPlate: sort · glue overlaps · veils · relief
                                                                               │
                                              ┌────────────────────────────────┼─────────────────┐
                                              ▼                                ▼                 ▼
                                      SVG (vector)              PNG 300/600/900 dpi      k-space (β, D)
```

Everything left of `evaluate` is *structure* and is what the `.orpheum.json` stores. Everything right of it is derived and can be thrown away.

## Atoms

`makeAtom(shape, x, y, rank, size)` — `shape ∈ {circle, square, triangle, poly}`. Unit outline of 96 points (`M`), transformed by `t = {x, y, s, r}` and `size`. `poly` atoms carry their own normalised points (from *flatten* or *ingest*).

## Operators

All operators take n child units and return one. `rankStep` is the colour-operad action.

| Op | Glyph | What it does | Key params |
|---|---|---|---|
| Harmonic series | 1 ½ ⅓ | copies at amplitudes 1/k (or 1/φ^k, 1/√k, 1/k²), placed nested / ring / row / spiral | n, law, mode, phase |
| Fourier recut | ∑ eⁱᵏᶿ | resynthesise each outline from K kept terms on a ladder; *bloom* injects golden-phased partials | K, basis, bloom |
| φ echo | 137.5° | n copies scaled 1/φ per step, turned by the golden angle, about self or plate | n, gain, about |
| Affine series | Tⁿ | iterate scale · turn · step | copies, s, r, dx, dy |
| Associate | Kₙ | bind n children two at a time with a non-associative law; vertex picks the bracketing; walk interpolates to a neighbour | law, vertex, toward, walk |
| Group | ( ) | parenthesis; identity on geometry | rankStep |
| Veil | α | mark the unit translucent: opacity + blend; never re-cut | alpha, blend |
| Convexity split | ⟡⟡ | cut each form at reflex vertices along shortest safe chords into near-convex parts | eps, maxParts |
| Fourier split | ∑\|r | low-K solid body + the full form over it as a veil | K, alpha, blend |
| Depth | ▱ | stacked offset copies along a light angle: ink / ground shadow or rank extrusion | depth, angle, steps, shade |
| Ingest | ⇪ | traced source image; sliders re-trace live | levels, minArea, eps, adapt, invert, nest |
| k-space return | ℱ⁻¹ | rasterise → FFT → filter → IFFT → threshold → trace back | beta, echoes, sectorN, ringStr, levels |

Structural actions on a selection: **Flatten** (evaluate to poly atoms — the forgetful map), **Ungroup** (peel one level), **Duplicate**, **Delete**.

## Colour law

```
col(rank)      = ramp[rank mod m]
glue(a, b)     = (a + b + 1) mod m          // solid ∩ solid
veil           = fill-opacity α, mix-blend-mode ∈ {multiply, screen, normal}
shadow (Depth) = ink or ground at α, or rank + step (solid)
```

Paint order: ground → solids (with depth shadows beneath their own form) → glued overlaps → veils. Relief (Tweaks) is a plate-wide `feDropShadow` on solids.

## Plate and formats

`plate = {W, H}` is a frame, not a coordinate system. Changing format re-fits the tree about centre so the old inscribed square sits inside the new frame. k-space letter-boxes the frame into N×N so β and D compare across formats.

| key | size | ratio |
|---|---|---|
| square | 1000×1000 | 1:1 |
| portrait | 1000×1414 | 1:√2 |
| card | 700×1200 | 7:12 |
| wide | 1600×1000 | 16:10 |
| exh | 1920×1080 | 16:9 |
| ultra | 2560×1080 | 21:9 |

## The composition file — `.orpheum.json`

```json
{
  "kind": "orpheum", "version": 3, "saved": "ISO-8601",
  "plate": {"W": 1000, "H": 1000}, "format": "square",
  "palKey": "lin:orpheum",
  "imgPals": [ {"label": "...", "ground": "#…", "ink": "#…", "ramp": ["#…"]} ],
  "root": { "id": "root", "kind": "op", "op": null, "children": [ NODE… ] },
  "svg": "<svg …>…</svg>"            // courtesy render; ignored on open
}

NODE (atom) = { "id", "kind": "atom", "shape", "t": {"x","y","s","r"}, "size", "rank", "pts"? }
NODE (op)   = { "id", "kind": "op", "op", "p": {…}, "t", "rank", "label"?, "img"?, "children": [NODE…] }
```

`img` on an Ingest node is a JPEG data-URL (≤ 900 px) of the source so re-trace works after reopening. Keys beginning with `_` are runtime caches and are never written. Ids are regenerated on open so a file can be merged onto a plate already in progress.

Autosave: the same document (without `svg`) is written to `localStorage` under `orpheum-v3-autosave` ~0.9 s after each change; **Restore session** appears on load when one exists.

## Export

- **SVG** — exact vector, clip-paths for glue, `fill-opacity` + `mix-blend-mode` for veils, `feDropShadow` for relief.
- **PNG** — 300 / 600 / 900 dpi, print width 4–24 in on the long side, tiled 1:1 raster with pHYs metadata. Long side clamps at 16 000 px (Apple canvases at 16 Mpx) and the effective dpi is reported.
- **Spectrum PNG** — the k-space magnitude image at the Tweaks grid size.

## Keys

`1 2 3` add atoms · `U` upload drawing · `⌘S` save · `⌘O` open · `⌘Z` undo · `⌘D` duplicate · `⌘A` select all · `Backspace` delete · `Esc` clear · click select · shift-click add · alt-click reach into a unit · drag move.

## Performance

Measured on a 120-atom × harmonic-4 plate (480 forms): first evaluation 22 ms; unchanged re-render 2.8 ms; after moving one atom 1.2 ms. Mechanisms — memoised evaluation (same-key subtrees return the same arrays), cached path strings and bounding boxes, one clip-path per solid, grid-bucketed overlap search, rAF-coalesced renders, vector level-of-detail while dragging, IndexedDB autosave, and a streaming PNG encoder whose peak memory is one 256-px strip. The status line shows the live budget (forms · glued · clips · eval ms). Full plan and open items: `Orpheum Review Ledger.md` §Performance.

## Known limits (see `Orpheum Review Ledger.md`)

Pairwise gluing only (#3) · K₅ drawn in projection, some vertices overlap (#12) · spectrum PNG not at print dpi (#13) · ingest lands in the current format rather than offering a fit (#26).
