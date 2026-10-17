# Orpheum Studio Pro (v4)

**Unified Mathematical Art, Operadic Composition, Spectral $k$-Space & Archival Print Environment**

Orpheum Studio Pro integrates the complete suite of mathematical art engines into a single Photoshop/Figma-grade dark-chrome workspace while maintaining 100% compatibility with the standalone surfaces:

- **`Orpheum Studio Pro.dc.html` / `index.html`** — Unified multi-layer flagship studio combining **Operad Tree Layers**, **Linead Image/Trace Layers**, **Seeded Geome/Symbolarium Layers**, **2D FFT $k$-Space 4-Up Lab**, **Paint-Order Reveal & Black-Crush QC**, and **OKLab Perceptual Chord Matrix & Subunit Foundry**.
- **`Orpheum v3.dc.html`** — Standalone Operadic Tree & Associahedron $K_n$ surface (`orpheum-engine-v3.js`).
- **`Linead Studio Phi.dc.html` & `Linead Studio.dc.html`** — Standalone multi-layer contour resynthesis, $\varphi$-harmonic basis, and seeded geome studio (`linead-engine.js`).
- **`K-Space Lab.dc.html`** — Standalone 2D Radix-2 FFT spectral painting & fractal dimension $D$ workbench.
- **`Geome Maker v3.dc.html`** — Standalone OKLab chord matrix, 20 Jungian/Hermetic symbolarium recipes, and 348 Wada Sanzo dictionary (`geome-engine.js`, `geome-wada.js`).
- **`Orpheum Reveal.dc.html`** — Standalone paint-order timeline & black-crush audit.

---

## Key Architectural Upgrades in v4

### 1. >100 MB Session Optimization (`99%+` Footprint Reduction)
- **Zero Derived SVG Bloat**: `.orpheum.json` and `.orpheum.studio.json` files omit the derived `<svg>` string on save and strip any trailing `"svg"` string before `JSON.parse` when loading legacy `>120 MB` files (`124.55 MB` $\to$ `0.91 MB`).
- **Content-Addressable Asset Vault (`assets.byId`)**: Uploaded images and ingested polygon contours are hashed (`fastHash`) and stored once in `assets.byId`.
- **Automatic Working-Master Compression**: Uploading a `50+ MB` 900-DPI PNG automatically stores a `1400px` high-bit-depth WebP/JPEG working master in the session while extracting the exact `1000px` luminance grid (`249.45 MB` `.linead.json` $\to$ `< 1.2 MB` with **100% identical mathematical output**).
- **Gzip Session Export (`.orpheum.studio.json.gz`)**: Built-in `CompressionStream('gzip')` and `DecompressionStream('gzip')` support reduces complex sessions to `80–250 KB`.
- **IndexedDB Autosave**: Replaces synchronous `localStorage` autosave so large sessions never hit the 5 MB browser quota or freeze the UI thread.

### 2. Direct `Path2D` 900-DPI Archival PNG Streaming (`exportHighDPI_PNG`)
- Renders vector commands (`Path2D`) directly onto a reusable `tw × 256` strip canvas with spatial bounding-box culling (`~35x` faster than decoding multi-megabyte XML SVG strings per strip).
- Streams raw scanlines with PNG `Up` filter (`2`) through `CompressionStream('deflate')` into `IDAT` chunks with an embedded `pHYs` DPI chunk (`300–900 DPI`, up to `48"` long edge, bypassing the browser 256 MP canvas limit).

### 3. Unified Mathematical Engine (`studio-engine.js`)
- **Layer Interoperability**: Combine Orpheum Operad Trees, Linead Image/Scatter layers, and Seeded Geome layers on one plate, or click **"⇄ Convert Bands → Operad Tree"** to turn any traced/seeded layer into individually editable Orpheum polygons.
- **Dual Glue Laws + True Triple-Overlap Glue**: Switch between Orpheum's additive sheaf law `(a + b + 1) mod m`, Geome's **OKLab Perceptual Midpoint Chord Table**, or Complement `(m - 1 - a)`, plus enable **True Triple-Overlap Region Glue** ($A \cap B \cap C$) via associative raster rank folding + marching-squares contour tracing.

---

## Quick Start

Serve the directory with any static HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080/Orpheum%20Studio%20Pro.dc.html` (or `http://localhost:8080/`).

### CLI Batch Session Optimizer
To compact existing `>100 MB` `.orpheum.json` or `.linead.json` files from the command line:

```bash
node scripts/optimize-sessions.mjs path/to/file.orpheum.json --gzip
```
