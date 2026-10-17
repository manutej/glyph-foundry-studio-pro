# Reference: SymSpec Schema, 4-Plane Z-Architecture & Volumetric Idiom Catalog

## 1. The 4-Plane Volumetric Architecture (`Z0`–`Z3`)

Every non-title glyph in `glyph-foundry` MUST emit primitives across 4 explicit depth planes using `with P.layer(z=..., seq=..., cls=...)`:

| Plane | Role | Typical Primitives |
|---|---|---|
| `Z0` (`data-z="0"`) | **Architectural Plinths, Blueprint Grids & Cast Shadows** | `P.plinth(...)`, cast drop-shadows (`dx=2.5, dy=3.5`), blueprint baselines, calibration ticks |
| `Z1` (`data-z="1"`) | **Structural Mechanisms & Connectors** | Sieve mesh, seating bench, contract seal frame, axonometric stratum columns, torsion beam |
| `Z2` (`data-z="2"`) | **Primary Sculpted 2.5D Actors & Hero Artifacts** | Sculpted `P.person(...)` actors with chest emblems, 3D isometric profit ingot (`P.iso_block(...)`), Vesica Piscis crucible |
| `Z3` (`data-z="3"`) | **Specular Rim Highlights, Precision Calipers & Callouts** | `P.caliper(...)`, Caveat handwritten synthesis notes (`role="hand"`), JetBrains Mono badges (`role="num"`) |

Additionally, `data-seq="0..N"` controls sub-glyph reveal order during each narrative beat in the interactive video explainer.

---

## 2. The 9 Canonical Volumetric Symbolic Idioms (`foundry/glyphs.py`)

| Idiom Key | Visual Metaphor | Key `params` |
|---|---|---|
| `crowd` | **2.5D Sculpted Actor Array & Capacity Blueprint** — Elevated plinth, filled actors with domain chest emblems (diamond for `client`, chevron for `pursuit`), and CAD crosshair target slots for variable bounds (`6–8`). | `n`, `min_n`, `role` (`"actor-a"` / `"actor-b"`), `cols`, `caption`, `note` |
| `gate` | **Multi-Stage Metrological Sieve** — 3-stage vertical filter (`Domain Craft`, `Paired Fit`, `Day-1 Bar`), raw candidate silhouettes on left, rejected deflection trajectory, and verified crown pass badge on right. | `in_n`, `label`, `caption` |
| `cohort` | **Unified Crucible Amphitheatre** — Shared double-walled crucible table with central pairing table (`8 × 2`) and alternating client/Pursuit dyads connected by collaboration arcs. | `left_n`, `right_n`, `left_role`, `right_role`, `caption`, `sub` |
| `contract` | **Stamped Enterprise Ledger & Reserve Hangar** — Left: sealed SOW ledger with 8 active client desks (`40 h/wk`) and verified checkmark stamp. Right: dashed unbilled reserve hangar holding 8 matched Pursuit engineers. | `billed_n`, `shadow_n`, `caption`, `sub` |
| `taper` | **3D Axonometric Coaching Strata & Autonomy Horizon** — 3D isometric columns (`P.iso_block`) stepping down `[5, 3, 1, 0.35]` across `5 d/wk → 3 d/wk → 1 h/day → taper` with descending coach trajectory and rising autonomy curve. | `bars` (`[[label, height], ...]`), `coach` (`bool`), `caption` |
| `fork` | **Switching-Yard Junction & Dual Career Termini** — Track switch blades (`s10` vs `s11`), upper Client Conversion Vault (`hire / convert · zero fee`), lower Pursuit Deployment Pod (`keep & deploy`). | `upper` (`{tag, label}`), `lower` (`{tag, label}`) |
| `equation` | **4-Stage Dimensional Multiplier & 3D Profit Ingot** — 4 instrument modules encoding 1D rate (`$25/h`), 2D week grid (`40 h/wk`), 3D cohort (`8 people`), and 4D timeline (`50 wk`) feeding a 3D isometric `$400,000` ingot + 10-cohort stack (`$4M/yr`). | `terms` (`[str, ...]`), `result` (`str`), `after` (`str`) |
| `balance` | **Precision Torsion Scale (`8:8`) vs. Molecular Catalyst Cell (`8:2–4`)** — Left: over-torqued torsion beam with degree protractor dial (`8:8 too much?`). Right: molecular catalyst cell with 8 client nodes orbiting a 2–4 Pursuit core (`8:2–4`). | `left`, `right`, `pod`, `pod_left`, `tilt`, `note_left`, `note_right` |
| `venn` | **Resonance Crucible Lens (Vesica Piscis)** — Optical interference of `staffing` (`actor-a`) and `training` (`actor-b`) with hatched Vesica Piscis core (`TAP`) and pointer ticks. | `a`, `b`, `mid` |

---

## 3. Style Record Tokens (`styles/*.json`)

Every style record defines CSS custom properties (`--gf-*`) so a single SVG adapts across light, dark, and iridescent skins without recompiling coordinates:
- **Surfaces**: `ground`, `panel`, `soft`, `elev`, `shadow`, `rim`, `grid`
- **Typography & Ink**: `ink`, `muted`, `line`
- **Semantic Actors**: `actor-a`, `actor-a-tint`, `actor-a-deep`, `actor-b`, `actor-b-tint`, `actor-b-deep`, `accent`, `accent-tint`, `accent-deep`
- **Stroke Hierarchy**: `frame` (`1.6px`), `glyph` (`2.0px`), `edge` (`1.75px`), `hair` (`1.0px`)
