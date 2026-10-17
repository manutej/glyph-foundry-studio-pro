# SOURCE OF TRUTH — Orpheum Studio Pro (v4 Unified Engine)

**Canonical Workspace:** `/Users/cairo/Documents/ARTE/orpheum`  
**Mirrored Workspace:** `/Users/cairo/Documents/CETI/ACCENTURE/content-factory v2/ARTE/orpheum`  
**Dev Preview URL:** `https://orpheum-dev-preview.vercel.app`  
**Local Dev Preview:** `http://localhost:8787`  
**Production URL (Protected):** `https://orpheum-omega.vercel.app`  
**Verification Gate:** `node scripts/adversarial-verify.mjs` (**24 / 24 PASS**)

---

## 1. Architectural Spine & Core Modules

| File | Role | Key Exports & Responsibilities |
|---|---|---|
| `Orpheum Studio Pro.dc.html` (`index.html`) | Unified Studio Application | 8-Menu Desktop Bar (`File`, `Edit`, `Select`, `Transform`, `Algebra`, `Layer`, `View`, `Help`), On-Canvas Transform Gizmo (`V`/`M`/`E`/`R`/`S`), Repeated Motion Hotkeys, Collapsible Operad Tree, Stasheff Associahedron $K_n$ Widget, K-Space 4-Up Lab, Step-by-Step Reveal, `⌘K` Command Palette. |
| `studio-engine.js` | Multi-Layer Compositor, Sheaf & Export Engine | Content-Addressable Asset Vault (`fastHash`), OKLab Chord Table (`buildChordTable`), True 3-Way Associative Region Gluing (`buildTrueTripleGlues`), Unified Plate Builder (`composeStudioPlate`), Direct `Path2D` Streaming 900-DPI PNG Encoder (`renderStudioPrintPNGStream`), IndexedDB Persistence (`idbPut`/`idbRead`). |
| `orpheum-engine-v3.js` | Double Operad Engine ($\mathcal{O}_{\text{geom}} \times \mathcal{O}_{\text{col}}$) | 3 Generators (`circle`, `square`, `triangle` at $M=144$ vertices), 16 Operadic Operations (`OPS`), Memoized Subtree Evaluation (`evaluate`, `invalidate`), Catalan Bracketings & Stasheff Associahedron $K_n$ (`associahedron`), Convex Hertel–Mehlhorn Split (`convexSplit`), Subpixel Image Tracing (`ingestImage`, `retrace`). |
| `linead-engine.js` | Luminance Quantization, Curves & Palettes | 16 Curated Studio Palettes + Sanzo Wada 159-combination catalog (`wada-palettes.js`), Corner-Preserving Chord-Normalized $C^1$ Cubic Bézier Splines (`loopToPath`), Subpixel Marching Squares (`traceMask`), Seeded Geome Generator (`geomeBands`). |
| `kspace-engine.js` | 2D Spectral Calculus | Radix-2 2D FFT/IFFT (`fft2`), Spectral Filter (`filterSpectrum`: $1/f^\beta$, $\varphi$-rings, dihedral sectors, golden-angle echoes, phase quantization), Radial Power Spectrum & Hausdorff $D \approx (8-\beta)/2$ (`radialSpectrum`, `spectrumGraphSVG`). |
| `scripts/adversarial-verify.mjs` | 24-Gate Adversarial MOE Verification Suite | Automated verification of `P1`–`P8` (`docs/ORPHIC-META-SPEC.md`), `docs/Orpheum Review Ledger.md` (`#1`–`#39`), and Rounds 1–3 A1–A4 adversarial gates. |

---

## 2. Mathematical Laws & Invariants (`P1`–`P8`)

1. **`P1` — Closed Palette & Zero Black-Crush (`GATE-06`, `GATE-23`)**:
   - Every rendered fill and stroke belongs strictly to $P = \{\text{ground}, \text{ink}, c_0, \dots, c_{m-1}\}$. Verified live on every frame (`stats.closurePass`).
2. **`P2` — Commutative Sheaf & Perceptual OKLab Chord Gluing (`GATE-07`, `GATE-08`)**:
   - **Sheaf mode**: $\text{glue}(a, b) = (a + b + 1) \bmod m$.
   - **OKLab Chord mode**: $\text{chord}(a, b) = \arg\min_{k \notin \{a,b\}} \|\text{OKLab}(c_k) - \tfrac{1}{2}(\text{OKLab}(c_a) + \text{OKLab}(c_b))\|_2$ (strictly excluding parents $a, b$ when $m \ge 3$ so overlap boundaries never vanish).
   - **Associative 3-Way Region Gluing**: When `tripleGlue` is enabled, regions of stack depth $\ge 3$ ($A \cap B \cap C$) are folded across all overlapping stalks and traced into exact vector overlays.
3. **`P3` — Dual-Domain Spectral Duality (`GATE-20`, `GATE-21`)**:
   - Forward 2D FFT ($\mathcal{F}$), spectral filtering ($1/f^\beta$, $\varphi$-ladder rings, dihedral sectors, golden-angle echoes), inverse 2D FFT ($\mathcal{F}^{-1}$), and re-contouring back into Operad Tree units (`btn-k-send-operad`).
4. **`P4` — Non-Associative Operadic Composition & Stasheff Associahedron $K_n$ (`GATE-01`, `GATE-04`)**:
   - All **16 operators** in `OPS`: `harmonic` ($\mathcal{H}$), `fourier` ($\mathcal{F}$), `echo` ($\mathcal{E}$), `affine` ($\mathcal{T}$), `assoc` ($K_n$), `group` ($\cup$), `fold` ($D_k$), `mirror` ($\leftrightarrow$), `lattice` ($\boxplus$), `braid` ($\bowtie$), `veil` ($\mathcal{V}$), `convex` ($\triangle$), `fsplit` ($\mathcal{F}_\Delta$), `ingest` ($\odot$), `extrude` ($\$), and `kfilter` ($k$).
   - Stasheff Associahedron $K_n$ ($K_3 = 2$ vertices, $K_4 = 5$ vertices / 5 edges, $K_5 = 14$ vertices / 21 edges) with straight-line edge homotopy and clickable Tamari neighbor buttons.
5. **`P5` — Granular Addressability (`GATE-05`, `GATE-11`, `GATE-13`)**:
   - Every layer, operator unit, leaf atom, tone band, and Geome ring (`Shift+Click` per-ring tone pinning with `·T` badge) is individually addressable and inspectable.
   - Leaf atoms inside rotated, scaled, or flipped parent operator units track pointer movement 1:1 via `plateDeltaToLocal()`.
6. **`P6` — Zero-Bloat Content-Addressable Persistence (`GATE-22`)**:
   - `.orpheum-studio.json` (and `.json.gz`) stores procedural parameter state and deduplicated FNV-1a asset vaults (`assets.polys`, `assets.images`), never embedding rendered `<svg>` strings (`< 10 KB` for procedural plates).
7. **`P7` — Subpixel $C^1$ Cubic Bézier Vector Fidelity & 900-DPI Streaming Export (`GATE-17`, `GATE-18`, `GATE-19`)**:
   - Corner-preserving chord-normalized $C^1$ Cubic Bézier splines (`loopToPath`) eliminate polygon faceting at any print scale.
   - `exportHighDPI()` enforces browser/Safari canvas ceilings (`16,000px` long side, Apple `16 Mpx` area) with effective DPI reporting, forces `live.drag = false`, and raises `maxPairs` to `6000`.
8. **`P8` — Compositional Linead (`GATE-09`)**:
   - Default `linead` mode is strictly `'none'` on cold start, preset reset, and legacy autosave migration so compositions open cleanly without unwanted web lines.

---

## 3. Direct Manipulation & Keyboard Ergonomics

| Action | Shortcut / Gesture |
|---|---|
| **Select / Move / Rotate / Scale Tool** | `V` / `M` / `E` / `R` / `S` |
| **Grab & Move Any Shape** | Click and drag directly on canvas (auto-selects on pointerdown; `Shift+Drag` locks axis) |
| **Scale / Rotate Selected Shape** | Drag corner handles (`□`) or top rotation stem (`⟳`) on selection bounding box (`Shift` snaps $15^\circ$) |
| **Select Leaf Atom vs Parent Unit** | `Alt+Click` on canvas cycles Leaf Atom $\leftrightarrow$ Parent Unit; `Double-Click` drills into Leaf Atom |
| **Release Selection** | `Esc` or click empty canvas / margin |
| **Nudge Position** | `Arrow Keys` (`10px`), `Shift+Arrow` (`50px`), `Alt+Arrow` (`1px`) |
| **Rotate Selection (Tap-to-Repeat)** | `[` / `]` ($\pm 15^\circ$), `Shift+[` / `Shift+]` ($\pm 45^\circ$), `Alt+[` / `Alt+]` ($\pm 1^\circ$) |
| **Scale Selection (Tap-to-Repeat)** | `-` / `=` ($\mp 10\% / \pm 10\%$), `Shift+-` / `Shift+=` ($\mp 25\% / \pm 25\%$) |
| **Flip / Reset Transform** | `H` (Flip Horizontal), `Shift+H` (Flip Vertical), `0` (Reset Transform) |
| **Cycle Palette Tone Rank** | `1`–`8` (set rank directly), `,` / `.` (cycle rank $-1 / +1$) |
| **Duplicate / Delete** | `⌘D` (or `Alt+Drag` on canvas), `⌫` / `Delete` |
| **Group / Unwrap Operator** | `⌘G` (Group), `⌘⇧G` (Unwrap operator, keeping children) |
| **Fold / Expand Operad Tree Node** | Click `▸`/`▾` caret or `Alt+Click` tree row (`Fold All / Expand` in tree header) |
| **Command Palette / Shortcuts** | `⌘K` (Fuzzy Command Palette), `?` (Keyboard Shortcuts Modal) |
