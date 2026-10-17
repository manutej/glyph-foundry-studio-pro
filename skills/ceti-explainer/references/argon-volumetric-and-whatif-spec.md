# CETI Explainer v2.0 — Argon-Level Volumetric, Sheaf & What-If Upgrade Specification

**Skill:** `ceti-explainer` (`U_09` · `ch-4-explainer-media`)  
**Absorbed Skills:** `ceti-explainer`, `glyph-foundry`, `svg-enhance`, `motion-media-l2`  
**Verification Gate:** `node .agents/skills/ceti-explainer/scripts/gate.mjs <episode.html>`

---

## 1. Architectural Overview: From Static Clock (`v1.0`) to Argon Volumetric Stage (`v2.0`)

`ceti-explainer v2.0` unites four capabilities into a single zero-dependency, self-contained HTML artifact:
1. **Deterministic Clock Engine (`ceti-explainer`):** Every visual property on stage is a pure mathematical function of time $t \in [0, T]$ (`render(t)`), enabling instant scrubbing, frame-exact replay, and automated headless Chromium verification.
2. **2.5D Volumetric Symbolic Plates (`glyph-foundry`):** Replaces flat rectangular flowcharts with axonometric multi-plane SVG architecture diagrams verified for zero bounding-box collision (`H1–H8`).
3. **2.5D Lithographic & Glaserian Ink Craft (`svg-enhance`):** Applies 5-actor semantic CSS tokens, hand-drawn round stroke caps (`stroke-linecap="round"`), negative-space paper cutouts (`var(--paper)`), and `<title>` + `<desc>` accessibility metadata.
4. **Live What-If Parameter & Cohomology Simulation (`Argon v2.0`):** Couples time $t$ with an interactive parameter vector $\theta \in \Theta$ so viewers can perturb temperatures, weights, or restriction thresholds live while watching commutative diagrams and numerical traces update in real time.

---

## 2. The 4 Argon Explainer Upgrades (`v2.0` Contract)

### Upgrade 1: Pure Clock $\times$ Live Parameter Space (`render(t, params)`)
In v1.0, `render(t)` operated over one static dataset. In **Argon v2.0**, stage state is a pure function of both deterministic time $t \in [0, T]$ and an interactive parameter vector $\theta \in \Theta$:
$$\mathrm{Stage}(t, \theta) = \mathrm{render}\big(t,\; \mathrm{deriveModel}(\theta)\big)$$

```javascript
const DEFAULT_PARAMS = { tau: 0.7, threshold: 0.82, queryIdx: 0 };
let PARAMS = { ...DEFAULT_PARAMS };
let DATA = deriveModel(PARAMS);

function setParam(key, value) {
  PARAMS[key] = value;
  DATA = deriveModel(PARAMS);
  render(currentTime); // Instant deterministic re-projection at current timestamp t
}
```
- **UI Requirement:** Expose 1–3 compact parameter sliders or preset pills in the control bar (`Temperature τ`, `Restriction Threshold ε`, `Input Scenario`). Changing any parameter must recompute `DATA` and re-render the current frame `t` with zero animation glitches.

### Upgrade 2: 2.5D Volumetric Symbolic Plates (`glyph-foundry` Integration)
When illustrating system architectures, compilers, or sheaf topologies, structure the primary SVG stage into **3 Axonometric Depth Planes (`Z0..Z2` + `Z3` HUD)**:
- **`Z0` Base Substrate Plane:** Raw corpus fibers, memory blocks, or hardware nodes (`p⁻¹(Uᵢ)`).
- **`Z1` Middle Morphism Plane:** Restriction arrows $\rho_{U,V}$, attention weights, or message-passing channels rendered with animated `stroke-dashoffset` flow pulses.
- **`Z2` Top Global Section Plane:** Glued synthesis $\mathcal{O}(\bigcup U_i)$, routed master skill, or output tensor.
- **`Z3` Orthographic HUD Overlay:** Crisp screen-space callout badges, equation ribbons, and non-color-alone status stamps (`◆`, `⚖`, `⊘`).

### Upgrade 3: Commutative Diagram & Cohomology Witness Beat
For algorithmic, mathematical, or sheaf/operad explainers, dedicate a **Commutativity Witness Beat** (typically Beat 6 or Beat 7 of an 8-beat arc):
1. Animate two distinct composition paths $p_1 = \rho_{V,W} \circ \rho_{U,V}$ and $p_2 = \rho_{U,W}$ (or decomposed operad tree $\mathcal{T}$ vs. collapsed specification $\mathrm{collapse}(\mathcal{T})$) traversing the stage simultaneously.
2. Render a live **Cohomology / Residual Meter** showing $\|\delta^0 s\|_{ij}$ and holonomy $\|\delta^1 \omega\|_{ijk}$ converging to `0.000` (`◆ H⁰ Exact Gluing`).

### Upgrade 4: Extended `window.__AUDIT()` & `gate.mjs` 9-Check Verification
Every episode must expose `window.__AUDIT()`, `window.__TIMELINE()`, `window.__LAYOUT()`, and `window.__REGIONS()` for automated verification by `scripts/gate.mjs`:

| Check ID | Gate Name | Invariant Verified |
|---|---|---|
| `G1` | **Numerical Identity** | `window.__AUDIT().ok === true`; all displayed equations match `deriveModel(PARAMS)` to $10^{-6}$ |
| `G2` | **Time Scrub Determinism** | `render(t1); render(t2); render(t1)` matches cold-start `render(t1)` across all DOM attributes |
| `G3` | **Zero Bounding-Box Overlap (`__LAYOUT`)** | Across 40 sampled timestamps $t_k \in [0, T]$, zero visible `<g>` labels/boxes intersect |
| `G4` | **Region Exclusivity (`__REGIONS`)** | At most one scene group per shared region has `opacity > 0.05` (use `ex.seg`, never `ex.pulse`) |
| `G5` | **Viewport Containment** | All visible SVG elements stay strictly inside the `viewBox` (`1280 x 720` or `960 x 540`) |
| `G6` | **4-Panel Beat Synchronization** | Active beat index updates SVG stage, code highlight, live execution trace, and takeaway card in lockstep |
| `G7` | **5-Actor Semantic Token Compliance** | Uses semantic CSS variables (`--paper`, `--ink`, `--actor-1..5`), zero raw unstyled browser defaults |
| `G8` | **Accessibility Metadata (`svg-enhance`)** | Primary `<svg>` contains `<title>` and `<desc>` elements and non-color-alone status glyphs |
| `G9` | **Zero Console / Page Errors** | Zero uncaught exceptions, missing assets, or raw LaTeX backslashes during full timeline sweep |

---

## 3. Canonical 8-Beat Narrative Arc for Technical Explainers

| Beat | Time Span | Narrative Role | Visual Stage Action |
|---|---|---|---|
| **Beat 1** | `0% – 12%` | **Concrete Failure / Hook** | Show the naive baseline failing (e.g., `16,848` L0 tokens overflowing the context window) |
| **Beat 2** | `12% – 25%` | **Structural Decomposition** | Partition the monolithic input into typed open sets / stalks $U_1, \dots, U_m$ |
| **Beat 3** | `25% – 38%` | **Core Mechanism (Step 1)** | Animate local section extraction $\mathcal{F}(U_i)$ and L0/L1 progressive disclosure routing |
| **Beat 4** | `38% – 52%` | **Core Mechanism (Step 2)** | Animate pairwise restriction morphisms $\rho_{U_i, U_j}$ and overlap vocabulary gluing |
| **Beat 5** | `52% – 66%` | **Live Numerical Trace** | Step through concrete numbers (`f_ij = 0.91`, token savings `-98.3%`) synchronized with code lines |
| **Beat 6** | `66% – 78%` | **Commutativity / 2-Simplex Proof** | Prove $\|\delta^1 \omega\|_{ijk} = 0.000$ across a 3-stalk triangle $[U_i, U_j, U_k]$ |
| **Beat 7** | `78% – 90%` | **Interactive What-If Exploration** | Highlight the live parameter pills ($\tau, \epsilon$) so the user can test boundary regimes |
| **Beat 8** | `90% – 100%` | **Global Section Synthesis** | Zoom out to the complete 2.5D volumetric architecture with `26/26 GATES CLEARED` |


---

## 4. Reference `window.__AUDIT()` & `window.__LAYOUT()` Implementation Template

Include this deterministic verification harness at the bottom of every `ceti-explainer v2.0` episode so `node .agents/skills/ceti-explainer/scripts/gate.mjs` can verify mathematical identity, region exclusivity, and zero bounding-box collision automatically:

```javascript
window.__TIMELINE = () => ({
  duration: TOTAL_DURATION,
  beats: BEATS.map((b, idx) => ({ index: idx, id: b.id, t0: b.t0, t1: b.t1, title: b.title }))
});

window.__LAYOUT = () => {
  const boxes = [];
  document.querySelectorAll('svg [data-layout-box]').forEach((el) => {
    const style = window.getComputedStyle(el);
    if (parseFloat(style.opacity || '1') <= 0.05 || style.display === 'none') return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      boxes.push({ id: el.id || el.dataset.layoutBox, x: r.x, y: r.y, w: r.width, h: r.height });
    }
  });
  return boxes;
};

window.__AUDIT = () => {
  const model = deriveModel(PARAMS);
  const probSum = model.weights.reduce((acc, w) => acc + w, 0);
  const identityOk = Math.abs(probSum - 1.0) < 1e-6;
  return {
    ok: identityOk,
    params: { ...PARAMS },
    invariants: { probabilitySimplexExact: identityOk, cochainDefect: model.maxDefect }
  };
};
```
