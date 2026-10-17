---
name: ceti-explainer
description: Build deterministic 4-panel HTML beat-player explainers, Argon 2.5D volumetric SVGs, WebAudio synthesis, and live What-If DOM simulations verified by gate.mjs.
---

# CETI Explainer — Argon 2.0 Beat Player, 2.5D Volumetric SVG & Live What-If Studio

Build self-contained, deterministic HTML video explainers where every narrative beat synchronizes five Argon-grade channels simultaneously:
1. **2.5D Volumetric SVG Architecture (`Z0..Z3`)** (`active`, `seen`, `edges`, and camera focus choreography)
2. **Code Walkthrough** (`activeLines`, `seenLines`)
3. **Monotonic Execution / Economics Trace Table** (`visibleRows`, `activeRow`)
4. **Live What-If DOM Parameter Sliders** (real-time causal equation recomputation without pre-rendered static frames)
5. **WebAudio Synthesizer & Caption Banner** (procedural voiceover/chime sync, `1×`/`1.5×`/`2×` speed, and `?beat=N` static snapshot export)

---

## 1. Progressive-Disclosure Architecture (L2 & L3)

- [references/argon-volumetric-and-whatif-spec.md](references/argon-volumetric-and-whatif-spec.md) — **L2 Deep Reference:** Complete Argon 2.0 specification covering 4-plane volumetric SVG (`Z0..Z3`), live What-If DOM simulation bindings, WebAudio procedural cues, and long-form editorial embedding (`LONGFORM`).
- [scripts/compile_symspec_episode.py](scripts/compile_symspec_episode.py) — **L3 Compiler:** Compiles a `SymSpec` JSON into a verified `episode.js` module.
- [assets/gate.mjs](assets/gate.mjs) — **L3 Quality Gate:** 9-gate static + geometric verifier (`6..10` beats, 4-panel binding, monotonic trace, zero node/edge overlap, WCAG AA contrast).
- [assets/build.py](assets/build.py) — **L3 Packager:** Compiles `episode.js` + `assets/shell.template.html` into a standalone single-file `.html` artifact.
- [assets/engine.js](assets/engine.js) — Deterministic `renderBeat(idx)` runtime, timeline scrubber, and `?beat=N` snapshot mode.
- [assets/ceti-tokens.css](assets/ceti-tokens.css) & [assets/ceti-motion.css](assets/ceti-motion.css) — Editorial palette and motion tokens.

---

## 2. Execution Workflow

### Step 1 — Author or Compile `episode.js`
Compile a grounded `SymSpec` JSON via:
```bash
python3 .agents/skills/ceti-explainer/scripts/compile_symspec_episode.py \
  path/to/spec.symspec.json -o path/to/episode.js
```

### Step 2 — Run the 9-Check Gate (`gate.mjs`)
```bash
node .agents/skills/ceti-explainer/assets/gate.mjs path/to/episode.js
```
Every check must report `PASS` before building HTML.

### Step 3 — Build the Standalone HTML Artifact
```bash
python3 .agents/skills/ceti-explainer/assets/build.py path/to/episode.js path/to/explainer.html
```
