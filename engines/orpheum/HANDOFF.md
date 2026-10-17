# HANDOFF — Orpheum Studio Pro (Cold-Resume & Production Promotion Guide)

**Last Updated:** 2026-10-16  
**Current Version:** Orpheum Studio Pro v4 (Adversarial Lock-In + Mobile Ready)  
**Verification Status:** `25 / 25 GATES PASSED` (`node scripts/adversarial-verify.mjs`)

---

## 1. Cold-Resume Quickstart

1. **Read First**:
   - `SOURCE-OF-TRUTH-ORPHEUM-STUDIO.md` — Architecture, `P1`–`P8` invariants, 16 operators, keyboard shortcuts.
   - `STATUS.md` — Completed Adversarial MOE Rounds 1–4 and deployment status.
   - `docs/ORPHIC-META-SPEC.md` & `docs/Orpheum Review Ledger.md` — Mathematical specification and full `#1`–`#39` defect closure table.
2. **Run the 25-Gate Verification Suite**:
   ```bash
   cd /Users/cairo/Documents/ARTE/orpheum
   node scripts/adversarial-verify.mjs
   ```
3. **Preview Locally**:
   - Local HTTP server is running on port `8787`:
     - `http://localhost:8787/Orpheum%20Studio%20Pro.dc.html`
     - `http://localhost:8787/`
   - If restarting from cold boot:
     ```bash
     cd /Users/cairo/Documents/ARTE/orpheum && python3 -m http.server 8787
     ```

---

## 2. Promoting Dev Preview to Production (When Approved)

- **Current Cloud Dev Preview**: `https://orpheum-dev-preview.vercel.app`
- **Protected Production URL**: `https://orpheum-omega.vercel.app`
- **To promote to production once the user signs off**:
  ```bash
  cd /Users/cairo/Documents/ARTE/orpheum
  node scripts/adversarial-verify.mjs
  cp "Orpheum Studio Pro.dc.html" index.html
  vercel deploy --prod --yes
  ```
- **Mirror Synchronization Command** (always keep both trees identical):
  ```bash
  rsync -av --exclude='.git' --exclude='.vercel' /Users/cairo/Documents/ARTE/orpheum/ "/Users/cairo/Documents/CETI/ACCENTURE/content-factory v2/ARTE/orpheum/"
  ```

---

## 3. Next-Horizon Roadmap (Post-v4 Opportunities)

All core specifications (`P1`–`P8`) and critical/major items in `docs/Orpheum Review Ledger.md` (`#1`–`#33`, `#35`, `#36`) are closed and verified. Future enhancements if desired:
1. **Web Worker Offload (`Review Ledger #34`)**:
   - Move `kspace-engine.js` 2D FFT/IFFT (`N=256`) and high-res `ingest` marching-squares tracing into an inline `Blob` Web Worker with `Float32Array` transferable buffers so heavy spectral recomputes run off the main UI thread.
2. **Adaptive Hardware Budget (`Review Ledger #37`)**:
   - Seed live `maxPairs` and K-Space `N` automatically from `navigator.hardwareConcurrency` and `navigator.deviceMemory` (`auto | low | high`), while keeping export locked at full fidelity (`maxPairs = 6000`).
3. **Standalone Single-File Offline Bundle (`Review Ledger #39`)**:
   - Optional build script (`scripts/bundle-standalone.mjs`) that inlines `studio-engine.js`, `orpheum-engine-v3.js`, `linead-engine.js`, `kspace-engine.js`, and `wada-palettes.js` into a single zero-dependency `.html` file that runs directly from `file://` without a local HTTP server.
