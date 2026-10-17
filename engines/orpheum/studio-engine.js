// studio-engine.js — Unified Document, Asset Vault, True Region Sheaf, OKLab Chords,
// Direct Path2D Tiled & Streaming 900-DPI PNG Exporter, and Legacy (>100MB) Session Optimizer.

import {
  PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource,
  extractBands, extractForms, fourierRecutBands, scatterBands, rampColor,
  deriveLinead, deriveGesture, demoDrawing,
  SUBUNIT_KINDS, SYMBOLS, subunitThumb, subunitSVG, geomeBands,
  setCustomKinds, allKinds, pngWithDPI
} from './linead-engine.js';

import {
  fft2, filterSpectrum, radialSpectrum, spectrumGraphSVG,
  kspacePass, paintField, cropToSource, toSquare, PHI, GOLDEN_ANGLE
} from './kspace-engine.js';

import {
  plate, M, FORMATS, setPlate, live, refitTree, uid,
  BASE, ATOMS, makeAtom, makeOp, centroidOf, bboxOf, fourierTrunc,
  associahedron, OPS, OP_KEYS, evaluate, invalidate, evaluateRoot,
  ingestImage, retrace, flatten, walk, findParent, findNode,
  pathD, glue, buildPlate as buildOrpheumPlate, plateSVG as orpheumPlateSVG,
  convexSplit, traceSource, plateSpectrum, paintSpec, invertGround,
  serialize as serializeOrpheum, deserialize as deserializeOrpheum,
  thumbDataURL, renderPrintPNGStream, download
} from './orpheum-engine-v3.js';

export {
  PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource,
  extractBands, extractForms, fourierRecutBands, scatterBands, rampColor,
  deriveLinead, deriveGesture, demoDrawing,
  SUBUNIT_KINDS, SYMBOLS, subunitThumb, subunitSVG, geomeBands,
  setCustomKinds, allKinds, pngWithDPI,
  fft2, filterSpectrum, radialSpectrum, spectrumGraphSVG,
  kspacePass, paintField, cropToSource, toSquare, PHI, GOLDEN_ANGLE,
  plate, M, FORMATS, setPlate, live, refitTree, uid,
  BASE, ATOMS, makeAtom, makeOp, centroidOf, bboxOf, fourierTrunc,
  associahedron, OPS, OP_KEYS, evaluate, invalidate, evaluateRoot,
  ingestImage, retrace, flatten, walk, findParent, findNode,
  pathD, glue, buildOrpheumPlate, orpheumPlateSVG,
  convexSplit, traceSource, plateSpectrum, paintSpec, invertGround,
  serializeOrpheum, deserializeOrpheum,
  thumbDataURL, renderPrintPNGStream, download
};

const q = n => Math.round(n * 100) / 100;

// ── 1. Fast FNV-1a Hash & Content-Addressable Asset Vault ───────────────────
// Eliminates duplicate 50MB base64 strings and inline polygon duplication in >100MB JSON files.
export function fastHash(str) {
  let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
  const step = Math.max(1, Math.floor(str.length / 8192));
  for (let i = 0; i < str.length; i += step) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'a_' + (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}

// Downsamples massive 900-DPI uploaded PNGs (50+ MB) to a configurable working master
// (default 2800px WebP, up to 8192px or 0 = 1:1 Native, with optional lossless PNG & active ROI margin crop)
// so session JSON files stay compact while preserving maximum contour & FFT fidelity.
export function compressSourceDataURL(url, maxSide = 2800, quality = 0.92, { lossless = false, trimMargin = false, marginPad = 0.04 } = {}) {
  return new Promise((res) => {
    if (!url || !url.startsWith('data:image/')) return res(url);
    // If Native 1:1 (maxSide === 0) and lossless and no margin crop requested, preserve original dataURL directly
    if (maxSide === 0 && lossless && !trimMargin) return res(url);
    if (!trimMargin && maxSide >= 2800 && url.length < 450000) return res(url);
    const im = new Image();
    im.onload = () => {
      const nw = im.naturalWidth || im.width || 2, nh = im.naturalHeight || im.height || 2;
      let sx = 0, sy = 0, sw = nw, sh = nh;

      // Optional Active Pixel-Space Optimization: crop uniform background margins before downsampling
      // so 100% of the pixel budget is spent on the active artwork!
      if (trimMargin && nw > 64 && nh > 64) {
        const probeMax = 512, ps = Math.min(1, probeMax / Math.max(nw, nh));
        const pw = Math.max(8, Math.round(nw * ps)), ph = Math.max(8, Math.round(nh * ps));
        const pc = document.createElement('canvas'); pc.width = pw; pc.height = ph;
        const pctx = pc.getContext('2d', { willReadFrequently: true });
        pctx.drawImage(im, 0, 0, pw, ph);
        const pd = pctx.getImageData(0, 0, pw, ph).data;
        const lumAt = (x, y) => {
          const i = (y * pw + x) * 4;
          return pd[i + 3] < 16 ? 1 : (0.299 * pd[i] + 0.587 * pd[i + 1] + 0.114 * pd[i + 2]) / 255;
        };
        const corners = [lumAt(0, 0), lumAt(pw - 1, 0), lumAt(0, ph - 1), lumAt(pw - 1, ph - 1)].sort((a, b) => a - b);
        const bg = (corners[1] + corners[2]) * 0.5;
        let x0 = pw, y0 = ph, x1 = -1, y1 = -1;
        for (let y = 0; y < ph; y++) {
          for (let x = 0; x < pw; x++) {
            if (Math.abs(lumAt(x, y) - bg) > 0.045) {
              if (x < x0) x0 = x; if (x > x1) x1 = x;
              if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
          }
        }
        pc.width = pc.height = 0;
        if (x1 > x0 && y1 > y0) {
          const padX = Math.round((x1 - x0) * marginPad), padY = Math.round((y1 - y0) * marginPad);
          const cx0 = Math.max(0, x0 - padX), cy0 = Math.max(0, y0 - padY);
          const cx1 = Math.min(pw - 1, x1 + padX), cy1 = Math.min(ph - 1, y1 + padY);
          if ((cx1 - cx0) * (cy1 - cy0) < 0.90 * pw * ph) {
            sx = Math.floor(cx0 / ps); sy = Math.floor(cy0 / ps);
            sw = Math.min(nw - sx, Math.ceil((cx1 - cx0 + 1) / ps));
            sh = Math.min(nh - sy, Math.ceil((cy1 - cy0 + 1) / ps));
          }
        }
      }

      const cap = maxSide && maxSide > 0 ? maxSide : 8192;
      const s = Math.min(1, cap / Math.max(sw, sh));
      const w = Math.max(2, Math.round(sw * s));
      const h = Math.max(2, Math.round(sh * s));

      // Progressive 2x halving for ultra-sharp anti-aliased downsampling
      let curCanvas = document.createElement('canvas');
      let curW = sw, curH = sh;
      if (Math.max(sw, sh) > Math.max(w, h) * 2.2) {
        curW = Math.max(w, Math.round(sw * 0.5));
        curH = Math.max(h, Math.round(sh * 0.5));
        curCanvas.width = curW; curCanvas.height = curH;
        const cctx = curCanvas.getContext('2d');
        cctx.imageSmoothingEnabled = true;
        cctx.imageSmoothingQuality = 'high';
        cctx.drawImage(im, sx, sy, sw, sh, 0, 0, curW, curH);
        while (Math.max(curW, curH) > Math.max(w, h) * 2.2) {
          const nw2 = Math.max(w, Math.round(curW * 0.5)), nh2 = Math.max(h, Math.round(curH * 0.5));
          const nxt = document.createElement('canvas'); nxt.width = nw2; nxt.height = nh2;
          const nctx = nxt.getContext('2d');
          nctx.imageSmoothingEnabled = true;
          nctx.imageSmoothingQuality = 'high';
          nctx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nw2, nh2);
          curCanvas.width = curCanvas.height = 0;
          curCanvas = nxt; curW = nw2; curH = nh2;
        }
      } else {
        curCanvas = null;
      }

      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (curCanvas) {
        ctx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, w, h);
        curCanvas.width = curCanvas.height = 0;
      } else {
        ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
      }

      let out;
      if (lossless) {
        out = c.toDataURL('image/png');
      } else {
        out = c.toDataURL('image/webp', quality);
        if (out.length > url.length || !out.startsWith('data:image/webp')) {
          out = c.toDataURL('image/jpeg', quality);
        }
      }
      c.width = c.height = 0;
      res((trimMargin || out.length < url.length) ? out : url);
    };
    im.onerror = () => res(url);
    im.src = url;
  });
}

// Quantize polygon points to compact Int16 delta-encoded array or rounded 2-decimal pairs
export function packPts(pts) {
  if (!Array.isArray(pts)) return pts;
  return pts.map(p => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]);
}

// ── 2. Perceptual OKLab Chord Algebra (from Geome Maker v3) ─────────────────
// Computes closed-palette perceptual midpoint chords in OKLab space so two overlapping
// ranks resolve either by additive sheaf (a+b+1 mod m) OR by perceptual OKLab chord.
function hex2rgb01(h) {
  const s = String(h || '#000000').replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16) || 0;
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
export function rgbToOklab(rgb) {
  const f = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = f(rgb[0]), g = f(rgb[1]), b = f(rgb[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  ];
}
const _chordCache = new WeakMap();
export function buildChordTable(pal) {
  if (!pal || !pal.ramp) return [[0]];
  if (_chordCache.has(pal.ramp)) return _chordCache.get(pal.ramp);
  const labs = pal.ramp.map(hex => rgbToOklab(hex2rgb01(hex)));
  const m = labs.length, table = [];
  for (let i = 0; i < m; i++) {
    table[i] = [];
    for (let j = 0; j < m; j++) {
      if (i === j) { table[i][j] = (i + 1) % m; continue; }
      const mid = [(labs[i][0] + labs[j][0]) / 2, (labs[i][1] + labs[j][1]) / 2, (labs[i][2] + labs[j][2]) / 2];
      let best = (i + j + 1) % m, bestDist = 1e9;
      for (let k = 0; k < m; k++) {
        if (m >= 3 && (k === i || k === j)) continue; // Strictly exclude parents when m >= 3 so overlap boundary never vanishes
        const d = Math.hypot(labs[k][0] - mid[0], labs[k][1] - mid[1], labs[k][2] - mid[2]);
        if (d < bestDist) { bestDist = d; best = k; }
      }
      table[i][j] = best;
    }
  }
  _chordCache.set(pal.ramp, table);
  return table;
}
export function glueRank(a, b, m, pal, glueMode = 'sheaf') {
  const ra = ((a % m) + m) % m, rb = ((b % m) + m) % m;
  if (glueMode === 'chord' && pal) {
    const tbl = buildChordTable(pal);
    return tbl[ra] && tbl[ra][rb] != null ? tbl[ra][rb] : (((ra + rb + 1) % m));
  }
  if (glueMode === 'complement') {
    return (ra + Math.max(1, Math.floor(m / 2))) % m;
  }
  return (ra + rb + 1) % m; // Classic commutative sheaf
}

// ── 3. True Multi-Overlap Region Sheaf (Solves Review Ledger #3) ────────────
// When 3+ solids overlap, pairwise clips depend on draw order. True region gluing
// folds all overlapping solid ranks at each grid cell via the associative law
// (a + b + 1) mod m and traces the multi-overlap regions (stack depth >= 3) into exact vectors.
const MS_EDGES = {
  1:[['L','B']],2:[['B','R']],3:[['L','R']],4:[['T','R']],5:[['T','R'],['L','B']],
  6:[['T','B']],7:[['T','L']],8:[['T','L']],9:[['T','B']],10:[['T','L'],['B','R']],
  11:[['T','R']],12:[['L','R']],13:[['R','B']],14:[['L','B']]
};
function traceRankMask(inside, w, h) {
  const P = (cx, cy, e) => e === 'T' ? [cx + 0.5, cy] : e === 'B' ? [cx + 0.5, cy + 1] : e === 'L' ? [cx, cy + 0.5] : [cx + 1, cy + 0.5];
  const key = p => (p[0] * 2) + ',' + (p[1] * 2), start = {}, segs = [];
  for (let y = -1; y < h; y++) for (let x = -1; x < w; x++) {
    const c = (inside(x, y) << 3) | (inside(x + 1, y) << 2) | (inside(x + 1, y + 1) << 1) | inside(x, y + 1);
    if (!c || c === 15) continue;
    for (const [a, b] of MS_EDGES[c]) {
      const s = [P(x, y, a), P(x, y, b)];
      const i = segs.push(s) - 1;
      (start[key(s[0])] || (start[key(s[0])] = [])).push(i);
      (start[key(s[1])] || (start[key(s[1])] = [])).push(i);
    }
  }
  const used = new Uint8Array(segs.length), loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const lp = [segs[i][0]]; let cur = segs[i][1]; let guard = 0;
    while (guard++ < segs.length) {
      lp.push(cur);
      const cands = (start[key(cur)] || []).filter(j => !used[j]);
      if (!cands.length) break;
      const j = cands[0]; used[j] = 1;
      const s = segs[j];
      cur = key(s[0]) === key(cur) ? s[1] : s[0];
      if (key(cur) === key(lp[0])) break;
    }
    if (lp.length >= 4) loops.push(lp);
  }
  return loops;
}

function pipPoly(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi)) c = !c;
  }
  return c;
}

export function buildTrueTripleGlues(shapes, solItems, pal, W, H, glueMode = 'sheaf', N = 240) {
  const m = pal.ramp.length;
  const sc = N / Math.max(W, H), gw = Math.max(16, Math.round(W * sc)), gh = Math.max(16, Math.round(H * sc));
  const countGrid = new Uint16Array(gw * gh);
  const rankGrid = new Int16Array(gw * gh).fill(-1);
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    for (const it of solItems) {
      const s = shapes[it.i];
      const r = ((s.rank % m) + m) % m;
      ctx.clearRect(0, 0, gw, gh);
      ctx.beginPath();
      s.pts.forEach((pt, idx) => ctx[idx ? 'lineTo' : 'moveTo'](pt[0] * sc, pt[1] * sc));
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      const d = ctx.getImageData(0, 0, gw, gh).data;
      for (let p = 0, j = 3; p < countGrid.length; p++, j += 4) {
        if (d[j] > 127) {
          countGrid[p]++;
          rankGrid[p] = rankGrid[p] < 0 ? r : glueRank(rankGrid[p], r, m, pal, glueMode);
        }
      }
    }
  } else {
    const invSc = 1 / sc;
    for (const it of solItems) {
      const s = shapes[it.i];
      const r = ((s.rank % m) + m) % m;
      const bb = bboxOfPts(s.pts);
      const x0 = Math.max(0, Math.floor(bb.x0 * sc)), x1 = Math.min(gw - 1, Math.ceil(bb.x1 * sc));
      const y0 = Math.max(0, Math.floor(bb.y0 * sc)), y1 = Math.min(gh - 1, Math.ceil(bb.y1 * sc));
      for (let gy = y0; gy <= y1; gy++) {
        const py = (gy + 0.5) * invSc;
        for (let gx = x0; gx <= x1; gx++) {
          const px = (gx + 0.5) * invSc;
          if (pipPoly(px, py, s.pts)) {
            const p = gy * gw + gx;
            countGrid[p]++;
            rankGrid[p] = rankGrid[p] < 0 ? r : glueRank(rankGrid[p], r, m, pal, glueMode);
          }
        }
      }
    }
  }
  const tripleOvers = [];
  const invSc = 1 / sc;
  for (let rk = 0; rk < m; rk++) {
    const inside = (x, y) => (x < 0 || y < 0 || x >= gw || y >= gh) ? 0 : (countGrid[y * gw + x] >= 3 && rankGrid[y * gw + x] === rk ? 1 : 0);
    const loops = traceRankMask(inside, gw, gh);
    if (!loops.length) continue;
    const dStr = loops.map(lp => 'M' + lp.map(pt => q(pt[0] * invSc) + ' ' + q(pt[1] * invSc)).join('L') + 'Z').join('');
    if (dStr) tripleOvers.push({ d: dStr, clip: null, fill: pal.ramp[rk], rank: rk, triple: true });
  }
  return tripleOvers;
}

// ── 4. Enhanced Orpheum Plate Builder (with Chord Mode & True Region Glue) ──
const _bbPtsCache = new WeakMap();
function bboxOfPts(pts) {
  let b = _bbPtsCache.get(pts);
  if (!b) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) {
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    }
    b = { x0, y0, x1, y1 };
    _bbPtsCache.set(pts, b);
  }
  return b;
}

export function buildOperadLayerPlate(shapes, pal, {
  recut = true, stroke = 0, maxPairs = 1200, relief = null,
  glueMode = 'sheaf', tripleGlue = false, W = plate.W, H = plate.H
} = {}) {
  const m = pal.ramp.length, col = r => pal.ramp[((r % m) + m) % m];
  const order = shapes.map((s, i) => i).sort((a, b) => ((shapes[a].mode === 'veil') ? 1 : 0) - ((shapes[b].mode === 'veil') ? 1 : 0));
  const lum = h => { const n = parseInt(String(h).slice(1), 16); return isNaN(n) ? 0.5 : (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  const darkGround = lum(pal.ground) < 0.5;
  const all = pal.ramp.concat([pal.ink]);
  const darkest = all.slice().sort((a, b) => lum(a) - lum(b))[0];
  const lightest = all.slice().sort((a, b) => lum(b) - lum(a))[0];

  const items = order.map(i => {
    const s = shapes[i];
    const veil = s.mode === 'veil', shadow = s.mode === 'shadow';
    let fill = col(s.rank), blend = veil ? (s.blend || 'multiply') : 'normal';
    if (shadow) {
      if (s.shade === 'ground') { fill = darkGround ? lightest : darkest; blend = 'normal'; }
      else { fill = darkGround ? lightest : darkest; blend = (s.blend && s.blend !== 'multiply') ? s.blend : (darkGround ? 'screen' : 'multiply'); }
    }
    const bb = bboxOfPts(s.pts);
    return { d: pathD(s.pts), fill, i, veil, shadow, op: (veil || shadow) ? s.alpha : 1, blend, bb, rank: s.rank, unit: s.unit, leaf: s.leaf };
  });

  const clips = [], overs = [];
  let capped = false;
  if (recut && !live.drag) {
    const sol = items.filter(it => !it.veil && !it.shadow);
    const bb = sol.map(it => it.bb);
    let np = 0;
    const cell = Math.max(40, Math.min(W, H) / 12), grid = new Map();
    const used = new Set();
    for (let j = 0; j < sol.length; j++) {
      const B = bb[j];
      const cx0 = Math.floor(B.x0 / cell), cx1 = Math.floor(B.x1 / cell);
      const cy0 = Math.floor(B.y0 / cell), cy1 = Math.floor(B.y1 / cell);
      for (let gy = cy0; gy <= cy1; gy++) for (let gx = cx0; gx <= cx1; gx++) {
        const k = gx + ',' + gy;
        const bucket = grid.get(k);
        if (bucket) {
          for (const i of bucket) {
            const A = bb[i];
            if (A.x1 < B.x0 || B.x1 < A.x0 || A.y1 < B.y0 || B.y1 < A.y0) continue;
            const pk = i * 65536 + j;
            if (used.has(pk)) continue;
            used.add(pk);
            if (np >= maxPairs) { capped = true; continue; }
            if (!used.has('c' + i)) {
              used.add('c' + i);
              clips.push({ id: 'c' + sol[i].i, d: sol[i].d, bb: A });
            }
            const ibb = {
              x0: Math.max(A.x0, B.x0), y0: Math.max(A.y0, B.y0),
              x1: Math.min(A.x1, B.x1), y1: Math.min(A.y1, B.y1)
            };
            const gRank = glueRank(shapes[sol[i].i].rank, shapes[sol[j].i].rank, m, pal, glueMode);
            overs.push({ d: sol[j].d, clip: 'url(#c' + sol[i].i + ')', clipD: sol[i].d, fill: col(gRank), rank: gRank, bb: ibb });
            np++;
          }
          bucket.push(j);
        } else grid.set(k, [j]);
      }
    }
    if (tripleGlue && sol.length >= 3) {
      const triples = buildTrueTripleGlues(shapes, sol, pal, W, H, glueMode);
      overs.push(...triples);
    }
  }
  const veils = items.filter(it => it.veil);
  return { items, clips, overs, veils, capped, ground: pal.ground, ink: pal.ink, stroke, relief };
}

// ── 5. Unified Multi-Layer Compositor (Operadic Trees + Linead Image/Geome) ─
export function resolveStudioPalette(key, docState = {}) {
  const k = key || docState.palKey || 'orpheum';
  if (k === 'custom' && docState.customPal) return docState.customPal;
  if (k.startsWith('wada:') && typeof window !== 'undefined' && window.GEOME_WADA && window.GEOME_WADA[k]) {
    return wadaToPalette(window.GEOME_WADA[k]);
  }
  if (k.startsWith('img:') && Array.isArray(docState.imgPals)) {
    const idx = parseInt(k.slice(4), 10);
    if (docState.imgPals[idx]) return docState.imgPals[idx];
  }
  const byId = (docState.imgPals || []).find(p => p && p.id === k);
  if (byId) return byId;
  return PALETTES[k] || PALETTES.orpheum || PALETTES.spectraPaper;
}

export function bandsForStudioLayer(ly, lumas = [], cache = {}, ckv = 0, subpixelDefault = true, bezierDefault = true) {
  if (!ly || ly.kind === 'operad') return [];
  const useBez = ly.bezier != null ? !!ly.bezier : bezierDefault;
  if (ly.kind === 'geome') {
    const rov = ly.ringOver || {};
    const rtMap = Object.assign({}, ly.ringTones || {}, ly.ringRanks || {});
    const rrk = Object.keys(rtMap).map(k => k + ':' + rtMap[k]).join(',');
    const rok = Object.keys(rov).map(k => k + ':' + rov[k]).join(',');
    const cmp = ly.comp || 'radial', jit = ly.jitter == null ? 0.35 : ly.jitter, aq = ly.angleQ == null ? 45 : ly.angleQ;
    const armP = {
      scale: ly.aScale == null ? 1 : ly.aScale,
      spread: ly.aSpread == null ? 0.5 : ly.aSpread,
      stagger: ly.aStagger == null ? 0.5 : ly.aStagger,
      axis: ly.aAxis || 0
    };
    const gb = ly.basis || 'all';
    const gk = ['g', ckv, ly.seed, ly.order, ly.rings, ly.levels, (ly.recipe || []).join(','), rrk, rok, cmp, jit, aq, armP.scale, armP.spread, armP.stagger, armP.axis, gb, ly.harm, useBez ? 1 : 0].join('|');
    if (!cache[gk]) {
      let bb = geomeBands(ly.seed || 1927, {
        order: ly.order || 8, rings: ly.rings || 5, levels: ly.levels || 4,
        recipe: ly.recipe, ringRanks: Object.keys(rtMap).length ? rtMap : null,
        ringOver: Array.from({ length: ly.rings || 5 }, (_, i) => rov[i] || null),
        comp: cmp, jitter: jit, angleQ: aq, armP
      });
      if (ly.harm > 0) bb = fourierRecutBands(bb, { harmonics: ly.harm, basis: gb, bezier: useBez });
      cache[gk] = bb;
    }
    return cache[gk];
  }
  const srcLuma = lumas[ly.src || 0] || lumas[0];
  if (!srcLuma) return [];
  const useSub = ly.subpixel != null ? !!ly.subpixel : subpixelDefault;
  const exOpts = {
    levels: ly.levels || 4, minArea: ly.minArea || 80, invert: !!ly.invert,
    eps: ly.eps == null ? 1.0 : ly.eps, harmonics: ly.harm || 0,
    adapt: ly.adapt || 0, basis: ly.basis || 'all', subpixel: useSub, bezier: useBez
  };
  const plc = ly.place || 'trace';
  if (plc !== 'trace') {
    const armP = {
      scale: ly.aScale == null ? 1 : ly.aScale,
      spread: ly.aSpread == null ? 0.5 : ly.aSpread,
      stagger: ly.aStagger == null ? 0.5 : ly.aStagger,
      axis: ly.aAxis || 0
    };
    const jit = ly.jitter == null ? 0.35 : ly.jitter, aq = ly.angleQ == null ? 45 : ly.angleQ;
    const sk = ['s', ckv, ly.src || 0, srcLuma.w, srcLuma.h, exOpts.levels, exOpts.minArea, exOpts.invert ? 1 : 0, exOpts.eps, exOpts.harmonics, exOpts.adapt, exOpts.basis, useSub ? 1 : 0, useBez ? 1 : 0, plc, ly.seed || 1927, ly.order || 8, jit, aq, armP.scale, armP.spread, armP.stagger, armP.axis].join('|');
    if (!cache[sk]) {
      cache[sk] = scatterBands(srcLuma, exOpts, { seed: ly.seed || 1927, comp: plc, order: ly.order || 8, jitter: jit, angleQ: aq, armP, bezier: useBez });
    }
    return cache[sk];
  }
  const key = ['i', ly.src || 0, srcLuma.w, srcLuma.h, exOpts.levels, exOpts.minArea, exOpts.invert ? 1 : 0, exOpts.eps, exOpts.harmonics, exOpts.adapt, exOpts.basis, useSub ? 1 : 0, useBez ? 1 : 0].join('|');
  if (!cache[key]) cache[key] = extractBands(srcLuma, exOpts);
  return cache[key];
}

// Composes any mix of Orpheum Operadic Tree layers, Linead Image/Scatter layers,
// Seeded Geome/Symbolarium layers, K-Space spectral layers, and Linead Web/Gesture poles.
export function composeStudioPlate(docState, { forExport = false, bandCache = {}, ckv = 0, maxPairsOverride = null } = {}) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const W = docState.W || 1000, H = docState.H || 1000;
  const pal = docState.pal || resolveStudioPalette(docState.palKey, docState);
  const allowedColors = new Set([pal.ground, pal.ink, ...(pal.ramp || []), '#fff', '#000', 'none'].map(c => String(c).toLowerCase()));
  const {
    ground = true, layers = [],
    linead = 'none', lineadW = 1.6, ghost = null,
    glueMode = 'sheaf', tripleGlue = false, relief = null, stroke = 0, recut = true
  } = docState;
  const useBezier = docState.bezierCurves !== false && (forExport || !live.drag);
  live.bezier = useBezier;

  let defs = '', body = '';
  if (ground) body += `<rect x="0" y="0" width="${W}" height="${H}" fill="${pal.ground}" data-bg="1"/>`;
  if (ghost && ghost.href && ghost.opacity > 0) {
    body += `<image href="${ghost.href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" opacity="${ghost.opacity}" style="pointer-events:none;"/>`;
  }

  if (relief && relief.dist > 0 && !live.drag) {
    defs += `<filter id="studioRelief" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="${q(relief.dx)}" dy="${q(relief.dy)}" stdDeviation="${q(relief.blur)}" flood-color="${pal.ink}" flood-opacity="${relief.alpha}"/></filter>`;
  }

  const vis = layers.filter(l => l.visible !== false);
  const anchors = [];
  const drawCommands = []; // Structured commands for direct Path2D high-DPI tile rasterizer!
  const steps = []; // Paint-order sequence for Reveal & Black-Crush Diagnostics
  if (ground) drawCommands.push({ kind: 'ground', fill: pal.ground, W, H });

  let totalForms = 0, totalOvers = 0, totalClips = 0, totalVeils = 0, anyCapped = false;

  vis.forEach((ly, li) => {
    const layerIdx = layers.indexOf(ly);
    const lp = ly.pal || (ly.lyPal ? resolveStudioPalette(ly.lyPal, docState) : pal);
    [lp.ground, lp.ink, ...(lp.ramp || [])].forEach(c => { if (c) allowedColors.add(String(c).toLowerCase()); });
    if (ly.lineColor) allowedColors.add(String(ly.lineColor).toLowerCase());
    const mR = lp.ramp.length;
    const pfx = `L${li}_`;

    // CASE A: Operadic Tree Layer (Orpheum v3)
    if (ly.kind === 'operad') {
      setPlate(W, H);
      const shapes = ly.shapes || evaluateRoot(ly.root);
      const maxPairs = maxPairsOverride != null ? maxPairsOverride : (forExport ? 6000 : (docState.maxPairs || 1200));
      const P = buildOperadLayerPlate(shapes, lp, {
        recut: ly.recut != null ? ly.recut : recut,
        stroke: ly.stroke != null ? ly.stroke : stroke,
        maxPairs,
        relief: (relief && relief.dist > 0 && !live.drag) ? relief : null,
        glueMode: ly.glueMode || glueMode,
        tripleGlue: Boolean(ly.tripleGlue || tripleGlue),
        W, H
      });
      totalForms += shapes.length;
      totalOvers += P.overs.length;
      totalClips += P.clips.length;
      totalVeils += P.veils.length;
      if (P.capped) anyCapped = true;

      // Collect anchors for global Linead web/gesture
      if (ly.lineadContrib !== false) {
        shapes.forEach(s => {
          if (s.mode === 'veil' || s.mode === 'shadow') return;
          const c = centroidOf([s]);
          anchors.push({ x: c.x, y: c.y, area: Math.PI * c.r * c.r });
        });
      }

      // Namespace clip IDs per layer
      P.clips.forEach(c => {
        defs += `<clipPath id="${pfx}${c.id}"><path d="${c.d}"/></clipPath>`;
      });
      const txAttr = (ly.dx || ly.dy || ly.rot || (ly.scale && ly.scale !== 1))
        ? ` transform="translate(${q(W / 2 + (ly.dx || 0) * W)} ${q(H / 2 + (ly.dy || 0) * H)}) rotate(${q(ly.rot || 0)}) scale(${q(ly.scale || 1)}) translate(${q(-W / 2)} ${q(-H / 2)})"`
        : '';
      const blendAttr = (ly.blend && ly.blend !== 'normal') ? ` style="mix-blend-mode:${ly.blend}"` : '';
      let g = `<g opacity="${ly.opacity == null ? 1 : ly.opacity}"${txAttr}${blendAttr}>`;
      const sw = P.stroke ? ` stroke="${lp.ink}" stroke-width="${P.stroke}" stroke-linejoin="round"` : '';
      const rf = (relief && relief.dist > 0 && !live.drag) ? ` filter="url(#studioRelief)"` : '';

      const solids = P.items.filter(s => !s.veil);
      solids.forEach((s, si) => {
        if (s.shadow) {
          g += `<path d="${s.d}" fill="${s.fill}" fill-opacity="${s.op}" style="mix-blend-mode:${s.blend};pointer-events:none;"/>`;
          steps.push({ d: s.d, fill: s.fill, phase: 'shadow', label: `${ly.name} · Shadow #${si + 1}`, rule: 'nonzero' });
        } else {
          const hitAttr = forExport ? '' : ` data-layer="${layerIdx}" data-unit="${s.unit || ''}" data-leaf="${s.leaf || ''}" style="cursor:move;"`;
          g += `<path d="${s.d}" fill="${s.fill}"${sw}${rf}${hitAttr}/>`;
          steps.push({ d: s.d, fill: s.fill, phase: 'solid', label: `${ly.name} · Solid R${(s.rank || 0) + 1}`, rule: 'nonzero' });
        }
      });
      P.overs.forEach((o, oi) => {
        const clipRef = o.clip ? ` clip-path="url(#${pfx}${o.clip.slice(5, -1)})"` : '';
        g += `<path d="${o.d}" fill="${o.fill}"${clipRef} style="pointer-events:none;"/>`;
        steps.push({ d: o.d, fill: o.fill, phase: o.triple ? 'triple-glue' : 'glue', label: `${ly.name} · ${o.triple ? '3-Way ' : ''}Glue R${(o.rank || 0) + 1}`, rule: 'nonzero' });
      });
      P.veils.forEach((v, vi) => {
        const hitAttr = forExport ? ` style="mix-blend-mode:${v.blend}"` : ` data-layer="${layerIdx}" data-unit="${v.unit || ''}" data-leaf="${v.leaf || ''}" style="mix-blend-mode:${v.blend};cursor:move;"`;
        g += `<path d="${v.d}" fill="${v.fill}" fill-opacity="${v.op}"${hitAttr}/>`;
        steps.push({ d: v.d, fill: v.fill, phase: 'veil', label: `${ly.name} · Veil #${vi + 1}`, rule: 'nonzero' });
      });
      g += `</g>`;
      body += g;

      drawCommands.push({
        kind: 'operadLayer',
        opacity: ly.opacity == null ? 1 : ly.opacity,
        blend: ly.blend || 'normal',
        tx: { dx: ly.dx || 0, dy: ly.dy || 0, rot: ly.rot || 0, scale: ly.scale || 1 },
        P, shapes, lp
      });
      return;
    }

    // CASE B: Linead Image / Scatter / Geome / K-Space Layer
    const bands = ly.bands || bandsForStudioLayer(ly, docState.lumas || [], bandCache, ckv, docState.subpixelTrace !== false, useBezier);
    const lumaRef = (docState.lumas || [])[ly.src || 0];
    const srcW = ly.srcW || (ly.kind === 'geome' ? 1000 : (lumaRef && lumaRef.w) || 1000);
    const srcH = ly.srcH || (ly.kind === 'geome' ? 1000 : (lumaRef && lumaRef.h) || 1000);
    const s = Math.min(W / srcW, H / srcH) * ((ly.tx && ly.tx.scale) || ly.scale || 1);
    const dx = (ly.tx ? ly.tx.dx : ly.dx) || 0;
    const dy = (ly.tx ? ly.tx.dy : ly.dy) || 0;
    const rot = (ly.tx ? ly.tx.rot : ly.rot) || 0;
    const cx = W / 2 + dx * W, cy = H / 2 + dy * H;
    const T = `translate(${q(cx)} ${q(cy)}) rotate(${q(rot)}) scale(${q(s)}) translate(${q(-srcW / 2)} ${q(-srcH / 2)})`;

    const cutSet = ly.bandsCut || {};
    const offSet = ly.bandsOff || {};
    const shown = bands.filter(b => !offSet[b.rank] && !cutSet[b.rank]);
    const cuts = bands.filter(b => cutSet[b.rank] && !offSet[b.rank]);

    totalForms += shown.reduce((n, b) => n + (b.loops || 1), 0);

    if (cuts.length) {
      defs += `<mask id="lmask${li}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`
        + cuts.map(b => (b.d ? `<path d="${b.d}" transform="${T}" fill="#000" fill-rule="evenodd"/>` : '')
          + (b.dnz ? `<path d="${b.dnz}" transform="${T}" fill="#000"/>` : '')).join('')
        + `</mask>`;
    }
    defs += `<clipPath id="lsil${li}">`
      + shown.map(b => (b.d ? `<path d="${b.d}" transform="${T}"/>` : '')
        + (b.dnz ? `<path d="${b.dnz}" transform="${T}"/>` : '')).join('')
      + `</clipPath>`;

    let g = `<g opacity="${ly.opacity == null ? 1 : ly.opacity}"${cuts.length ? ` mask="url(#lmask${li})"` : ''}${ly.blend && ly.blend !== 'normal' ? ` style="mix-blend-mode:${ly.blend}"` : ''}>`;
    const draw = shown.slice().sort((a, b) => b.rank - a.rank);

    const echoes = ly.echoes || ly.echo || 0;
    if (echoes > 0 && ly.mode !== 'lines') {
      const GPHI = 1.6180339887, GAE = 137.50776405;
      const estr = ly.echoStrength == null ? (ly.echoStr == null ? 0.85 : ly.echoStr) : ly.echoStrength;
      for (let e = echoes; e >= 1; e--) {
        const esc = Math.pow(GPHI, -e / 3), eop = Math.max(0.1, estr * Math.pow(GPHI, -(e - 1) / 4));
        const ET = `translate(${q(W / 2)} ${q(H / 2)}) rotate(${q(e * GAE)}) scale(${q(esc)}) translate(${q(-W / 2)} ${q(-H / 2)}) `;
        g += `<g opacity="${q(eop)}" style="pointer-events:none;">`;
        draw.forEach(b => {
          const col = rampColor(lp, b.rank, ly.levels || 4, (ly.palRoll || 0) + e);
          if (b.d) g += `<path d="${b.d}" transform="${ET + T}" fill="${col}" fill-rule="evenodd"/>`;
          if (b.dnz) g += `<path d="${b.dnz}" transform="${ET + T}" fill="${col}" fill-rule="nonzero"/>`;
        });
        g += `</g>`;
      }
    }

    const bHit = b => forExport ? '' : ` data-layer="${layerIdx}" data-band="${b.rank}" style="cursor:move;"`;
    draw.forEach(b => {
      const ovc = ly.bandColors ? ly.bandColors[b.rank] : null;
      const col = ovc == null ? rampColor(lp, b.rank, ly.levels || 4, ly.palRoll || 0) : lp.ramp[((ovc % mR) + mR) % mR];
      if (ly.mode !== 'lines') {
        if (b.d) {
          g += `<path d="${b.d}" transform="${T}" fill="${col}" fill-rule="evenodd"${bHit(b)}/>`;
          steps.push({ d: b.d, fill: col, phase: 'plate', label: `${ly.name} · Plate P${b.rank + 1}`, rule: 'evenodd' });
        }
        if (b.dnz) {
          g += `<path d="${b.dnz}" transform="${T}" fill="${col}" fill-rule="nonzero"${bHit(b)}/>`;
          steps.push({ d: b.dnz, fill: col, phase: 'plate-merge', label: `${ly.name} · Merge Plate P${b.rank + 1}`, rule: 'nonzero' });
        }
      }
      if (ly.mode !== 'fills') {
        const fs = s || 1, sc = ly.lineColor || (ly.mode === 'lines' ? col : lp.ink), sw = (ly.lineW || 2) * Math.min(W, H) / 800 / fs;
        if (b.d) g += `<path d="${b.d}" transform="${T}" fill="none" stroke="${sc}" stroke-width="${q(sw)}" stroke-linejoin="round" fill-rule="evenodd" style="pointer-events:none;"/>`;
        if (b.dnz) g += `<path d="${b.dnz}" transform="${T}" fill="none" stroke="${sc}" stroke-width="${q(sw)}" stroke-linejoin="round" style="pointer-events:none;"/>`;
      }
    });

    if (ly.pb && ly.pb !== 'off' && ly.mode !== 'lines') {
      const m = lp.ramp.length;
      const behind = vis.slice(0, li).filter(bl => bl.kind !== 'operad').slice(-2);
      behind.forEach((bl, bi) => {
        const j = vis.indexOf(bl);
        const shift = ly.pb === 'complement' ? Math.max(1, Math.floor(m / 2)) : (ly.pb === 'cycle2' ? 2 : 1) + bi;
        draw.forEach(b => {
          const ovc = ly.bandColors ? ly.bandColors[b.rank] : null;
          const baseIdx = ovc == null ? (Math.round(b.rank * (m - 1) / Math.max(1, (ly.levels || 4) - 2)) + (ly.palRoll || 0)) % m : ovc;
          const col = lp.ramp[((baseIdx + shift) % m + m) % m];
          if (b.d) g += `<path d="${b.d}" transform="${T}" fill="${col}" fill-rule="evenodd" clip-path="url(#lsil${j})" style="pointer-events:none;"/>`;
          if (b.dnz) g += `<path d="${b.dnz}" transform="${T}" fill="${col}" fill-rule="nonzero" clip-path="url(#lsil${j})" style="pointer-events:none;"/>`;
          totalOvers++;
        });
      });
    }
    g += `</g>`;
    body += g;

    if (ly.lineadContrib !== false) {
      const rad = rot * Math.PI / 180, cr = Math.cos(rad), sr = Math.sin(rad);
      shown.forEach(b => (b.anchors || []).forEach(a => {
        const x0 = (a.x - srcW / 2) * s, y0 = (a.y - srcH / 2) * s;
        anchors.push({ x: cx + x0 * cr - y0 * sr, y: cy + x0 * sr + y0 * cr, area: a.area * s * s });
      }));
    }

    drawCommands.push({
      kind: 'bandLayer',
      li, shown: draw, cuts, srcW, srcH, cx, cy, rot, s,
      opacity: ly.opacity == null ? 1 : ly.opacity,
      blend: ly.blend || 'normal',
      mode: ly.mode || 'fills',
      levels: ly.levels || 4,
      palRoll: ly.palRoll || 0,
      bandColors: ly.bandColors || {},
      lineColor: ly.lineColor,
      lineW: ly.lineW || 2,
      echoes, echoStrength: ly.echoStrength == null ? (ly.echoStr == null ? 0.85 : ly.echoStr) : ly.echoStrength,
      lp
    });
  });

  // Global Linead Overlay (Adi Da's second working principle)
  const lineadPaths = [];
  if (linead === 'gesture') {
    deriveGesture(anchors, W, H).forEach(st => {
      const hw = q(lineadW * 3.4 * st.w), iw = q(lineadW * st.w);
      body += `<path d="${st.d}" fill="none" stroke="${pal.ground}" stroke-width="${hw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" style="pointer-events:none;"/>`;
      body += `<path d="${st.d}" fill="none" stroke="${pal.ink}" stroke-width="${iw}" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"/>`;
      lineadPaths.push({ d: st.d, stroke: pal.ground, sw: hw, op: 0.85 }, { d: st.d, stroke: pal.ink, sw: iw, op: 1 });
      steps.push({ d: st.d, fill: 'none', stroke: pal.ink, strokeWidth: iw, phase: 'gesture', label: 'Linead Gesture Stroke' });
    });
  } else if (linead && linead !== 'none') {
    const segs = deriveLinead(anchors, W, H, linead);
    if (segs.length) {
      const d = segs.map(s => `M${q(s[0])} ${q(s[1])}L${q(s[2])} ${q(s[3])}`).join('');
      const hw = q(lineadW * 3.2), iw = q(lineadW);
      body += `<path d="${d}" fill="none" stroke="${pal.ground}" stroke-width="${hw}" stroke-linecap="round" opacity="0.85" style="pointer-events:none;"/>`;
      body += `<path d="${d}" fill="none" stroke="${pal.ink}" stroke-width="${iw}" stroke-linecap="round" style="pointer-events:none;"/>`;
      lineadPaths.push({ d, stroke: pal.ground, sw: hw, op: 0.85 }, { d, stroke: pal.ink, sw: iw, op: 1 });
      steps.push({ d, fill: 'none', stroke: pal.ink, strokeWidth: iw, phase: 'linead', label: `Linead ${linead} Web` });
    }
  }
  if (lineadPaths.length) drawCommands.push({ kind: 'linead', paths: lineadPaths });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${body}</svg>`;
  const evalMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  let closurePass = true;
  const colorMatches = body.match(/(?:fill|stroke)="([^"]+)"/g) || [];
  for (let i = 0; i < colorMatches.length; i++) {
    const val = colorMatches[i].slice(colorMatches[i].indexOf('"') + 1, -1).toLowerCase();
    if (!allowedColors.has(val) && !val.startsWith('url(')) {
      closurePass = false;
      break;
    }
  }
  return {
    svg, defs, body, drawCommands, commands: drawCommands, steps, anchors,
    stats: {
      forms: totalForms, overs: totalOvers, clips: totalClips, veils: totalVeils, capped: anyCapped,
      units: totalForms, glues: totalOvers, plates: vis.length, pts: totalForms * 64,
      evalMs, closurePass
    }
  };
}

// ── 6. Convert Any Linead Layer into an Operadic Tree Unit ──────────────────
// Bridges Linead Studio and Orpheum v3: turns extracted image bands or a seeded geome
// construction directly into editable Orpheum `poly` atoms grouped by tone band!
export function convertBandsToOperadNode(bands, srcW, srcH, plateW, plateH, label = 'Converted layer') {
  const s = Math.min(plateW / srcW, plateH / srcH);
  const ox = (plateW - srcW * s) / 2, oy = (plateH - srcH * s) / 2;
  const groups = [];
  for (const b of bands) {
    const dStr = (b.d || '') + (b.dnz || '');
    const subs = dStr.match(/M[^MZ]+Z?/gi) || [];
    const atoms = [];
    for (const sd of subs) {
      const nums = (sd.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
      if (nums.length < 6) continue;
      const rawPts = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        rawPts.push([ox + nums[i] * s, oy + nums[i + 1] * s]);
      }
      const c = centroidOf([{ pts: rawPts }]);
      const R = Math.max(1, c.r);
      // Resample to M=96 points for operadic homotopy compatibility
      const L = [0]; let tot = 0;
      for (let i = 0; i < rawPts.length; i++) {
        const p0 = rawPts[i], p1 = rawPts[(i + 1) % rawPts.length];
        tot += Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); L.push(tot);
      }
      if (tot < 2) continue;
      const rs = []; let seg = 0;
      for (let j = 0; j < M; j++) {
        const t = tot * j / M;
        while (seg < rawPts.length - 1 && L[seg + 1] < t) seg++;
        const p0 = rawPts[seg % rawPts.length], p1 = rawPts[(seg + 1) % rawPts.length];
        const f = (t - L[seg]) / Math.max(1e-9, L[seg + 1] - L[seg]);
        rs.push([
          (p0[0] + (p1[0] - p0[0]) * f - c.x) / R,
          (p0[1] + (p1[1] - p0[1]) * f - c.y) / R
        ]);
      }
      atoms.push({
        id: uid(), kind: 'atom', shape: 'poly',
        pts: packPts(rs),
        t: { x: q(c.x), y: q(c.y), s: 1, r: 0 },
        size: q(R), rank: b.rank, children: []
      });
      if (atoms.length >= 48) break;
    }
    if (atoms.length) {
      const grp = makeOp('group', atoms);
      grp.label = `plate P${b.rank + 1}`;
      groups.push(grp);
    }
  }
  const top = makeOp('group', groups);
  top.label = label;
  return top;
}

// ── 7. Direct Path2D + Streaming Deflate 900-DPI PNG Exporter ───────────────
// Solves the 81,438-path 123MB XML SVG decoder bottleneck by painting Path2D objects
// directly onto 256px canvas strips with spatial bounding-box culling!
function crc32Buf(b) {
  let c, t = crc32Buf.t;
  if (!t) {
    t = crc32Buf.t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcBuf = new Uint8Array(4 + data.length);
  crcBuf.set(out.subarray(4, 8));
  crcBuf.set(data, 4);
  dv.setUint32(8 + data.length, crc32Buf(crcBuf));
  return out;
}

const _p2dCache = new Map();
function getPath2D(d) {
  if (!d) return null;
  let p = _p2dCache.get(d);
  if (!p) {
    if (_p2dCache.size > 12000) _p2dCache.clear();
    p = new Path2D(d);
    _p2dCache.set(d, p);
  }
  return p;
}

export function renderCommandsToContext(ctx, drawCommands, W, H, scale, viewBoxY0, viewBoxH) {
  const yMin = viewBoxY0 / scale - 60, yMax = (viewBoxY0 + viewBoxH) / scale + 60;
  ctx.save();
  ctx.translate(0, -viewBoxY0);
  ctx.scale(scale, scale);

  for (const cmd of drawCommands) {
    if (cmd.kind === 'ground') {
      ctx.fillStyle = cmd.fill;
      ctx.fillRect(0, 0, W, H);
    } else if (cmd.kind === 'operadLayer') {
      const { P, lp, tx } = cmd;
      ctx.save();
      ctx.globalAlpha = cmd.opacity;
      if (tx && (tx.dx || tx.dy || tx.rot || (tx.scale && tx.scale !== 1))) {
        ctx.translate(W / 2 + tx.dx * W, H / 2 + tx.dy * H);
        ctx.rotate((tx.rot || 0) * Math.PI / 180);
        ctx.scale(tx.scale || 1, tx.scale || 1);
        ctx.translate(-W / 2, -H / 2);
      }
      const noTx = !tx || (!tx.dx && !tx.dy && !tx.rot && (!tx.scale || tx.scale === 1));
      const solids = P.items.filter(s => !s.veil);
      for (const s of solids) {
        if (noTx && s.bb && (s.bb.y1 < yMin || s.bb.y0 > yMax)) continue;
        const p2d = getPath2D(s.d);
        if (!p2d) continue;
        ctx.save();
        ctx.globalAlpha = cmd.opacity * (s.op == null ? 1 : s.op);
        ctx.globalCompositeOperation = (s.shadow && s.blend && s.blend !== 'normal') ? s.blend : (cmd.blend !== 'normal' ? cmd.blend : 'source-over');
        ctx.fillStyle = s.fill;
        ctx.fill(p2d);
        if (P.stroke && !s.shadow) {
          ctx.strokeStyle = lp.ink;
          ctx.lineWidth = P.stroke;
          ctx.lineJoin = 'round';
          ctx.stroke(p2d);
        }
        ctx.restore();
      }
      for (const o of P.overs) {
        if (noTx && o.bb && (o.bb.y1 < yMin || o.bb.y0 > yMax)) continue;
        const p2d = getPath2D(o.d);
        if (!p2d) continue;
        ctx.save();
        ctx.globalAlpha = cmd.opacity;
        if (o.clipD) {
          const cp = getPath2D(o.clipD);
          if (cp) ctx.clip(cp);
        }
        ctx.fillStyle = o.fill;
        ctx.fill(p2d);
        ctx.restore();
      }
      for (const v of P.veils) {
        if (noTx && v.bb && (v.bb.y1 < yMin || v.bb.y0 > yMax)) continue;
        const p2d = getPath2D(v.d);
        if (!p2d) continue;
        ctx.save();
        ctx.globalAlpha = cmd.opacity * (v.op == null ? 0.55 : v.op);
        ctx.globalCompositeOperation = (v.blend && v.blend !== 'normal') ? v.blend : 'source-over';
        ctx.fillStyle = v.fill;
        ctx.fill(p2d);
        ctx.restore();
      }
      ctx.restore();
    } else if (cmd.kind === 'bandLayer') {
      ctx.save();
      ctx.globalAlpha = cmd.opacity;
      ctx.globalCompositeOperation = (cmd.blend && cmd.blend !== 'normal') ? cmd.blend : 'source-over';
      const applyLayerTx = (c) => {
        c.translate(cmd.cx, cmd.cy);
        c.rotate(cmd.rot * Math.PI / 180);
        c.scale(cmd.s, cmd.s);
        c.translate(-cmd.srcW / 2, -cmd.srcH / 2);
      };
      if (cmd.echoes > 0 && cmd.mode !== 'lines') {
        const GPHI = 1.6180339887, GAE = 137.50776405 * Math.PI / 180;
        for (let e = cmd.echoes; e >= 1; e--) {
          const esc = Math.pow(GPHI, -e / 3), eop = Math.max(0.1, cmd.echoStrength * Math.pow(GPHI, -(e - 1) / 4));
          ctx.save();
          ctx.globalAlpha = cmd.opacity * eop;
          ctx.translate(W / 2, H / 2);
          ctx.rotate(e * GAE);
          ctx.scale(esc, esc);
          ctx.translate(-W / 2, -H / 2);
          applyLayerTx(ctx);
          for (const b of cmd.shown) {
            const col = rampColor(cmd.lp, b.rank, cmd.levels, cmd.palRoll + e);
            ctx.fillStyle = col;
            if (b.d) ctx.fill(getPath2D(b.d), 'evenodd');
            if (b.dnz) ctx.fill(getPath2D(b.dnz), 'nonzero');
          }
          ctx.restore();
        }
      }
      ctx.save();
      applyLayerTx(ctx);
      const mR = cmd.lp.ramp.length;
      for (const b of cmd.shown) {
        const ovc = cmd.bandColors ? cmd.bandColors[b.rank] : null;
        const col = ovc == null ? rampColor(cmd.lp, b.rank, cmd.levels, cmd.palRoll) : cmd.lp.ramp[((ovc % mR) + mR) % mR];
        if (cmd.mode !== 'lines') {
          ctx.fillStyle = col;
          if (b.d) ctx.fill(getPath2D(b.d), 'evenodd');
          if (b.dnz) ctx.fill(getPath2D(b.dnz), 'nonzero');
        }
        if (cmd.mode !== 'fills') {
          const fs = cmd.s || 1, sc = cmd.lineColor || (cmd.mode === 'lines' ? col : cmd.lp.ink);
          ctx.strokeStyle = sc;
          ctx.lineWidth = cmd.lineW * Math.min(W, H) / 800 / fs;
          ctx.lineJoin = 'round';
          if (b.d) ctx.stroke(getPath2D(b.d));
          if (b.dnz) ctx.stroke(getPath2D(b.dnz));
        }
      }
      ctx.restore();
      ctx.restore();
    } else if (cmd.kind === 'linead') {
      for (const lp of cmd.paths) {
        const p2d = getPath2D(lp.d);
        if (!p2d) continue;
        ctx.save();
        ctx.globalAlpha = lp.op == null ? 1 : lp.op;
        ctx.strokeStyle = lp.stroke;
        ctx.lineWidth = +lp.sw;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(p2d);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

export async function exportHighDPI_PNG(composed, W, H, longPx, dpi, onProgress) {
  // Use direct Path2D strip renderer if no complex SVG masks/pb are needed, or fallback to SVG strip tiler
  const hasComplexSVGFeatures = composed.svg.includes('<mask ') || composed.svg.includes('clip-path="url(#lsil') || composed.svg.includes('filter="url(#studioRelief)"') || composed.svg.includes('<image ');
  if (hasComplexSVGFeatures && composed.svg.length < 18 * 1024 * 1024) {
    return renderPrintPNGStream(composed.svg, W, H, longPx, dpi, onProgress);
  }
  // Direct Path2D Streaming Strip Encoder: handles 100,000+ paths with zero XML parsing overhead!
  if (typeof CompressionStream === 'undefined') {
    return renderPrintPNG(composed.svg, W, H, longPx, dpi, onProgress);
  }
  const s = longPx / Math.max(W, H), tw = Math.round(W * s), th = Math.round(H * s);
  const STRIP = 256, strips = Math.ceil(th / STRIP);
  const cv = document.createElement('canvas'); cv.width = tw; cv.height = STRIP;
  const x = cv.getContext('2d', { willReadFrequently: true });
  const cs = new CompressionStream('deflate');
  const wr = cs.writable.getWriter();
  const parts = [];
  const reader = cs.readable.getReader();
  const pump = (async () => {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      parts.push(value);
    }
  })();
  const row = new Uint8Array(1 + tw * 4);
  for (let sIdx = 0; sIdx < strips; sIdx++) {
    const y0 = sIdx * STRIP, h = Math.min(STRIP, th - y0);
    x.clearRect(0, 0, tw, STRIP);
    renderCommandsToContext(x, composed.drawCommands, W, H, s, y0, h);
    const d = x.getImageData(0, 0, tw, h).data;
    for (let yy = 0; yy < h; yy++) {
      row[0] = 0;
      row.set(d.subarray(yy * tw * 4, (yy + 1) * tw * 4), 1);
      await wr.write(row.slice());
    }
    if (onProgress) onProgress(sIdx + 1, strips);
    await new Promise(z => setTimeout(z, 0));
  }
  await wr.close();
  await pump;
  cv.width = cv.height = 0;
  const ihdr = new Uint8Array(13), dv = new DataView(ihdr.buffer);
  dv.setUint32(0, tw); dv.setUint32(4, th);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const ppm = Math.round(dpi / 0.0254), phys = new Uint8Array(9), pv = new DataView(phys.buffer);
  pv.setUint32(0, ppm); pv.setUint32(4, ppm); phys[8] = 1;
  let zlen = 0;
  for (const p of parts) zlen += p.length;
  const z = new Uint8Array(zlen);
  let o = 0;
  for (const p of parts) { z.set(p, o); o += p.length; }
  return new Blob([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('pHYs', phys),
    pngChunk('IDAT', z),
    pngChunk('IEND', new Uint8Array(0))
  ], { type: 'image/png' });
}

// ── 8. Compact Unified Serialization & >100MB Legacy Session Importer ───────
// Guarantees:
// 1. NEVER writes the derived `svg` string (saves 123+ MB on Orpheum files).
// 2. Deduplicates all image sources and polygon arrays into a top-level `assets` vault.
// 3. Automatically compacts oversized 900-DPI base64 PNGs down to working resolution.
// 4. Deduplicates `imgPals` palette swaps.
// 5. Supports optional GZIP compression (.orpheum.gz).

export function deduplicatePalettes(imgPals = [], palKey = '') {
  const seen = new Map(), out = [];
  let newPalKey = palKey;
  imgPals.forEach((p, idx) => {
    if (!p || !p.ramp) return;
    const sig = `${p.ground}|${p.ink}|${p.ramp.join(',')}`;
    let targetIdx = seen.get(sig);
    if (targetIdx == null) {
      targetIdx = out.length;
      // Clean up "Orpheum · light · dark · light · dark..." label bloat
      const cleanLabel = String(p.label || 'Custom').replace(/(?: · (?:light|dark)){2,}/g, m => {
        const parts = m.trim().split(' · ').filter(Boolean);
        return ' · ' + parts[parts.length - 1];
      });
      out.push({ ...p, label: cleanLabel });
      seen.set(sig, targetIdx);
    }
    if (palKey === 'img:' + idx) newPalKey = 'img:' + targetIdx;
  });
  return { imgPals: out, palKey: newPalKey };
}

export async function serializeStudioDocument(state, { compressSources = true } = {}) {
  const assets = {}; // hash -> { kind: 'image'|'pts', data, w?, h?, name? }
  const { imgPals, palKey } = deduplicatePalettes(state.imgPals || [], state.palKey);
  const maxSide = state.sourceMaxSide != null ? state.sourceMaxSide : 2800;
  const lossless = !!state.losslessSources;

  // 1. Deduplicate Linead sources
  const srcRefs = [];
  for (const src of (state.sources || [])) {
    let href = src.href || '';
    if (compressSources && !lossless && maxSide > 0 && href.length > 450000) {
      href = await compressSourceDataURL(href, maxSide, 0.92, { lossless, trimMargin: false });
    }
    const id = fastHash(href);
    if (!assets[id]) {
      assets[id] = {
        kind: 'image',
        name: src.name || 'source',
        w: src.w || 1000,
        h: src.h || 1000,
        naturalW: src.naturalW || src.w || 1000,
        naturalH: src.naturalH || src.h || 1000,
        activePixelRatio: src.activePixelRatio || 1,
        href
      };
    }
    srcRefs.push({
      assetId: id,
      name: src.name || 'source',
      w: src.w || 1000,
      h: src.h || 1000,
      naturalW: src.naturalW || src.w || 1000,
      naturalH: src.naturalH || src.h || 1000,
      activePixelRatio: src.activePixelRatio || 1
    });
  }

  // 2. Serialize layers (both operad and linead/geome) with asset references
  const serializeTree = async (node) => {
    const copy = JSON.parse(JSON.stringify(node, (k, v) => k[0] === '_' ? undefined : v));
    const jobs = [];
    walk(copy, n => {
      if (n.pts && Array.isArray(n.pts)) {
        const packed = packPts(n.pts);
        const s = JSON.stringify(packed);
        const pid = fastHash(s);
        if (!assets[pid]) assets[pid] = { kind: 'pts', pts: packed };
        n.ptsRef = pid;
        delete n.pts;
      }
      if (n.img && typeof n.img === 'string') {
        jobs.push((async () => {
          const compact = (compressSources && !lossless && maxSide > 0)
            ? await compressSourceDataURL(n.img, Math.max(1600, maxSide), 0.90, { lossless })
            : n.img;
          const iid = fastHash(compact);
          if (!assets[iid]) assets[iid] = { kind: 'image', href: compact };
          n.imgRef = iid;
          delete n.img;
        })());
      }
    });
    await Promise.all(jobs);
    return copy;
  };

  const outLayers = [];
  for (const ly of (state.layers || [])) {
    if (ly.kind === 'operad') {
      const rootCopy = await serializeTree(ly.root);
      outLayers.push({
        id: ly.id || uid(),
        kind: 'operad',
        name: ly.name || 'Operad Layer',
        visible: ly.visible !== false,
        opacity: ly.opacity == null ? 1 : ly.opacity,
        blend: ly.blend || 'normal',
        dx: ly.dx || 0, dy: ly.dy || 0, rot: ly.rot || 0, scale: ly.scale || 1,
        lyPal: ly.lyPal || null,
        recut: ly.recut != null ? ly.recut : true,
        glueMode: ly.glueMode || 'sheaf',
        tripleGlue: !!ly.tripleGlue,
        stroke: ly.stroke || 0,
        lineadContrib: ly.lineadContrib !== false,
        root: rootCopy
      });
    } else {
      const clean = { ...ly };
      delete clean.bands;
      delete clean.pal;
      delete clean._cache;
      outLayers.push(clean);
    }
  }

  const doc = {
    kind: 'orpheum-studio',
    version: 4,
    saved: new Date().toISOString(),
    plate: { W: state.W || plate.W, H: state.H || plate.H },
    format: state.format || 'square',
    palKey,
    customPal: state.customPal || null,
    imgPals,
    ground: state.ground !== false,
    linead: state.linead || 'none',
    lineadW: state.lineadW || 1.6,
    ghost: state.ghost || 0,
    glueMode: state.glueMode || 'sheaf',
    tripleGlue: !!state.tripleGlue,
    recut: state.recut !== false,
    stroke: state.stroke || 0,
    relief: state.relief || 0,
    reliefAngle: state.reliefAngle || 135,
    reliefAlpha: state.reliefAlpha || 0.45,
    inches: state.inches || 12,
    dpi: state.dpi || 900,
    sourceMaxSide: state.sourceMaxSide != null ? state.sourceMaxSide : 2800,
    lumaRes: state.lumaRes || 2048,
    ingestGrid: state.ingestGrid || 1200,
    subpixelTrace: state.subpixelTrace !== false,
    bezierCurves: state.bezierCurves !== false,
    autoLOD: state.autoLOD !== false,
    trimMargin: state.trimMargin !== false,
    losslessSources: !!state.losslessSources,
    activeLayer: state.activeLayer || 0,
    customKinds: state.customKinds || [],
    sources: srcRefs,
    layers: outLayers,
    assets
  };
  return JSON.stringify(doc);
}

// Re-samples and re-traces all loaded Linead sources and Operad Ingest nodes using the current
// document fidelity settings (doc.lumaRes, doc.ingestGrid, doc.trimMargin, doc.subpixelTrace)
export async function resampleStudioSources(doc) {
  const lumaRes = doc.lumaRes != null ? doc.lumaRes : 2048;
  const ingestGrid = doc.ingestGrid || 1200;
  const trimMargin = doc.trimMargin !== false;
  const subpixel = doc.subpixelTrace !== false ? 1 : 0;

  // 1. Re-sample Linead sources
  const newLumas = [];
  for (let i = 0; i < (doc.sources || []).length; i++) {
    const src = doc.sources[i];
    const masterHref = src.rawHref || src.href || demoDrawing();
    const lumaObj = await loadImageLuma(masterHref, lumaRes, { trimMargin });
    src.w = lumaObj.w;
    src.h = lumaObj.h;
    src.naturalW = lumaObj.naturalW || lumaObj.w;
    src.naturalH = lumaObj.naturalH || lumaObj.h;
    src.activePixelRatio = lumaObj.activePixelRatio || 1;
    newLumas.push(lumaObj);
  }
  doc.lumas = newLumas;

  // 2. Re-sample & re-trace any Operad Ingest nodes
  const jobs = [];
  for (const ly of (doc.layers || [])) {
    if (ly.kind === 'operad' && ly.root) {
      walk(ly.root, n => {
        if (n.kind === 'op' && n.op === 'ingest' && (n._rawImg || n.img)) {
          jobs.push((async () => {
            const master = n._rawImg || n.img;
            n._src = await loadImageLuma(master, lumaRes, { trimMargin });
            n.p = Object.assign({}, OPS.ingest.defaults, n.p || {}, { grid: ingestGrid, subpixel });
            retrace(n);
          })().catch(() => {}));
        }
      });
      invalidate(ly.root);
    } else if (ly.kind === 'image') {
      ly.subpixel = doc.subpixelTrace !== false;
    }
  }
  await Promise.all(jobs);
  return doc;
}

// Universal Importer: Seamlessly loads:
// - New v4 `.orpheum-studio.json` (and `.gz`)
// - Legacy v1/v2/v3 `.orpheum.json` (even >130MB files with bloated `"svg"` strings!)
// - Legacy v2 `.linead.json` (even >250MB files with duplicate 900-DPI PNGs!)
export async function deserializeStudioDocument(rawTextOrObj, {
  workingRes = null,
  sourceMaxSide = null,
  ingestGrid = null,
  trimMargin = null,
  subpixelTrace = null,
  lossless = null,
  compactOnLoad = true,
  retraceOnLoad = false
} = {}) {
  let d = rawTextOrObj;
  if (typeof d === 'string') {
    if (d.length > 5 * 1024 * 1024 && d.includes('"svg":"<svg')) {
      d = d.replace(/,\s*"svg"\s*:\s*"<svg[\s\S]*?<\/svg>"\s*(?=\})\s*$/, '');
    }
    d = JSON.parse(d);
  }

  // Case 1: Unified Studio v4 Document
  if (d && d.kind === 'orpheum-studio') {
    const effLumaRes = workingRes != null ? workingRes : (d.lumaRes != null ? d.lumaRes : 2048);
    const effMaxSide = sourceMaxSide != null ? sourceMaxSide : (d.sourceMaxSide != null ? d.sourceMaxSide : 2800);
    const effIngestGrid = ingestGrid != null ? ingestGrid : (d.ingestGrid || 1200);
    const effTrim = trimMargin != null ? trimMargin : (d.trimMargin !== false);
    const effSubpixel = subpixelTrace != null ? subpixelTrace : (d.subpixelTrace !== false);
    const effLossless = lossless != null ? lossless : !!d.losslessSources;

    const assets = d.assets || {};
    const sources = [];
    const lumas = [];
    for (const sRef of (d.sources || [])) {
      const a = assets[sRef.assetId];
      const href = a ? a.href : (sRef.href || '');
      const srcObj = href
        ? await loadImageLuma(href, effLumaRes, { trimMargin: effTrim })
        : await loadImageLuma(demoDrawing(), effLumaRes, { trimMargin: false });
      sources.push({
        name: sRef.name || 'source',
        href,
        rawHref: href,
        w: srcObj.w,
        h: srcObj.h,
        naturalW: srcObj.naturalW || sRef.naturalW || srcObj.w,
        naturalH: srcObj.naturalH || sRef.naturalH || srcObj.h,
        activePixelRatio: srcObj.activePixelRatio || sRef.activePixelRatio || 1
      });
      lumas.push(srcObj);
    }
    setCustomKinds(d.customKinds || []);
    const layers = [];
    for (const ly of (d.layers || [])) {
      if (ly.kind === 'operad' && ly.root) {
        const jobs = [];
        walk(ly.root, n => {
          if (n.id !== 'root') n.id = uid();
          if (n.ptsRef && assets[n.ptsRef]) {
            n.pts = assets[n.ptsRef].pts.map(p => [p[0], p[1]]);
            delete n.ptsRef;
          }
          if (n.imgRef && assets[n.imgRef]) {
            n.img = assets[n.imgRef].href;
            n._rawImg = n.img;
            delete n.imgRef;
          }
          if (n.kind === 'op' && n.op === 'ingest' && n.img) {
            jobs.push(loadImageLuma(n.img, effLumaRes, { trimMargin: effTrim }).then(src => {
              n._src = src;
              if (retraceOnLoad) {
                n.p = Object.assign({}, OPS.ingest.defaults, n.p || {}, { grid: effIngestGrid, subpixel: effSubpixel ? 1 : 0 });
                retrace(n);
              }
            }).catch(() => {}));
          }
        });
        await Promise.all(jobs);
        layers.push(ly);
      } else {
        layers.push(ly);
      }
    }
    if (d.plate) setPlate(d.plate.W, d.plate.H);
    return {
      W: (d.plate && d.plate.W) || 1000,
      H: (d.plate && d.plate.H) || 1000,
      format: d.format || 'square',
      palKey: d.palKey || 'orpheum',
      customPal: d.customPal || null,
      imgPals: d.imgPals || [],
      ground: d.ground !== false,
      linead: d.linead || 'none',
      lineadW: d.lineadW || 1.6,
      ghost: d.ghost || 0,
      glueMode: d.glueMode || 'sheaf',
      tripleGlue: !!d.tripleGlue,
      recut: d.recut !== false,
      stroke: d.stroke || 0,
      relief: d.relief || 0,
      reliefAngle: d.reliefAngle || 135,
      reliefAlpha: d.reliefAlpha || 0.45,
      inches: d.inches || 12,
      dpi: d.dpi || 900,
      sourceMaxSide: effMaxSide,
      lumaRes: effLumaRes,
      ingestGrid: effIngestGrid,
      subpixelTrace: effSubpixel,
      trimMargin: effTrim,
      losslessSources: effLossless,
      activeLayer: Math.min(d.activeLayer || 0, Math.max(0, layers.length - 1)),
      customKinds: d.customKinds || [],
      sources,
      lumas,
      layers
    };
  }

  // Case 2: Legacy Orpheum v1/v2/v3 (.orpheum.json)
  if (d && d.kind === 'orpheum' && d.root) {
    delete d.svg; // Immediately discard any 123MB courtesy SVG string
    const effLumaRes = workingRes != null ? workingRes : 2048;
    const effMaxSide = sourceMaxSide != null ? sourceMaxSide : 2800;
    const effIngestGrid = ingestGrid != null ? ingestGrid : 1200;
    const effTrim = trimMargin != null ? trimMargin : true;
    const effSubpixel = subpixelTrace != null ? subpixelTrace : true;
    const effLossless = lossless != null ? lossless : false;

    const W = (d.plate && d.plate.W) || 1000;
    const H = (d.plate && d.plate.H) || 1000;
    setPlate(W, H);
    const jobs = [];
    walk(d.root, n => {
      if (n.id !== 'root') n.id = uid();
      if (n.kind === 'op' && n.op === 'ingest' && n.img) {
        jobs.push((async () => {
          n._rawImg = n.img;
          n._src = await loadImageLuma(n.img, effLumaRes, { trimMargin: effTrim });
          if (compactOnLoad && !effLossless && effMaxSide > 0 && n.img.length > 450000) {
            n.img = await compressSourceDataURL(n.img, effMaxSide, 0.90, { lossless: effLossless });
          }
          if (retraceOnLoad) {
            n.p = Object.assign({}, OPS.ingest.defaults, n.p || {}, { grid: effIngestGrid, subpixel: effSubpixel ? 1 : 0 });
            retrace(n);
          }
        })().catch(() => {}));
      }
    });
    await Promise.all(jobs);
    const { imgPals, palKey } = deduplicatePalettes(d.imgPals || [], d.palKey || 'lin:orpheum');
    const cleanPalKey = palKey.startsWith('lin:') ? palKey.slice(4) : palKey;
    const operadLayer = {
      id: uid(),
      kind: 'operad',
      name: 'Operadic Composition',
      visible: true,
      opacity: 1,
      blend: 'normal',
      dx: 0, dy: 0, rot: 0, scale: 1,
      recut: true,
      glueMode: 'sheaf',
      tripleGlue: false,
      stroke: 1,
      lineadContrib: true,
      root: d.root
    };
    return {
      W, H,
      format: d.format || 'square',
      palKey: cleanPalKey,
      customPal: null,
      imgPals,
      ground: true,
      linead: 'none',
      lineadW: 1.6,
      ghost: 0,
      glueMode: 'sheaf',
      tripleGlue: false,
      recut: true,
      stroke: 1,
      relief: 5,
      reliefAngle: 135,
      reliefAlpha: 0.5,
      inches: 12,
      dpi: 900,
      sourceMaxSide: effMaxSide,
      lumaRes: effLumaRes,
      ingestGrid: effIngestGrid,
      subpixelTrace: effSubpixel,
      trimMargin: effTrim,
      losslessSources: effLossless,
      activeLayer: 0,
      customKinds: [],
      sources: [],
      lumas: [],
      layers: [operadLayer]
    };
  }

  // Case 3: Legacy Linead Studio v2 (.linead.json)
  if (d && d.v === 2 && Array.isArray(d.layers)) {
    const effLumaRes = workingRes != null ? workingRes : 2048;
    const effMaxSide = sourceMaxSide != null ? sourceMaxSide : 2800;
    const effIngestGrid = ingestGrid != null ? ingestGrid : 1200;
    const effTrim = trimMargin != null ? trimMargin : true;
    const effSubpixel = subpixelTrace != null ? subpixelTrace : true;
    const effLossless = lossless != null ? lossless : false;

    // Deduplicate identical source dataURLs on import — sample luminance BEFORE compressing so full scan fidelity is captured!
    const uniqueMap = new Map(); // hash -> newIndex
    const srcRemap = {}; // oldIndex -> newIndex
    const sources = [];
    const lumas = [];
    for (let i = 0; i < (d.sources || []).length; i++) {
      const rawSrc = d.sources[i];
      const origHref = rawSrc.href || '';
      const h = fastHash(origHref);
      if (uniqueMap.has(h)) {
        srcRemap[i] = uniqueMap.get(h);
        continue;
      }
      // Sample luma from the full-resolution original before optional WebP compaction!
      const lumaObj = await loadImageLuma(origHref, effLumaRes, { trimMargin: effTrim });
      let href = origHref;
      if (compactOnLoad && !effLossless && effMaxSide > 0 && href.length > 450000) {
        href = await compressSourceDataURL(href, effMaxSide, 0.92, { lossless: effLossless, trimMargin: false });
      }
      const newIdx = sources.length;
      uniqueMap.set(h, newIdx);
      srcRemap[i] = newIdx;
      sources.push({
        name: rawSrc.name || ('Source ' + (newIdx + 1)),
        href,
        rawHref: origHref,
        w: lumaObj.w,
        h: lumaObj.h,
        naturalW: lumaObj.naturalW || lumaObj.w,
        naturalH: lumaObj.naturalH || lumaObj.h,
        activePixelRatio: lumaObj.activePixelRatio || 1
      });
      lumas.push(lumaObj);
    }
    setCustomKinds(d.customKinds || []);
    const layers = d.layers.map((ly, idx) => ({
      ...ly,
      id: ly.id || uid(),
      kind: ly.kind || 'image',
      name: ly.name || ('Layer ' + (idx + 1)),
      subpixel: effSubpixel,
      src: srcRemap[ly.src || 0] != null ? srcRemap[ly.src || 0] : 0
    }));
    const F = { square: [1000, 1000], portrait: [1000, 1414], card: [700, 1200], wide: [1600, 1000], exh: [1920, 1080], ultra: [2560, 1080] }[d.format];
    let W = 1000, H = 1000;
    if (F) { W = F[0]; H = F[1]; }
    else if (sources[0]) {
      const s0 = sources[0], long = 1200;
      W = s0.w >= s0.h ? long : Math.round(long * s0.w / s0.h);
      H = s0.h > s0.w ? long : Math.round(long * s0.h / s0.w);
    }
    setPlate(W, H);
    return {
      W, H,
      format: d.format || 'source',
      palKey: d.palKey || 'spectraPaper',
      customPal: d.customPal || null,
      imgPals: [],
      ground: d.ground !== false,
      linead: d.linead || 'web',
      lineadW: d.lineadW || 1.6,
      ghost: d.ghost || 0,
      glueMode: 'sheaf',
      tripleGlue: false,
      recut: true,
      stroke: 0,
      relief: 0,
      reliefAngle: 135,
      reliefAlpha: 0.45,
      inches: d.inches || 12,
      dpi: d.dpi || 900,
      sourceMaxSide: effMaxSide,
      lumaRes: effLumaRes,
      ingestGrid: effIngestGrid,
      subpixelTrace: effSubpixel,
      trimMargin: effTrim,
      losslessSources: effLossless,
      activeLayer: Math.min(d.active || 0, Math.max(0, layers.length - 1)),
      customKinds: d.customKinds || [],
      sources,
      lumas,
      layers
    };
  }

  throw new Error('Unrecognized session file format (expected .orpheum.json, .linead.json, or .orpheum-studio.json)');
}

// GZIP Compression / Decompression helpers for ultra-compact file downloads
export async function gzipString(str) {
  if (typeof CompressionStream === 'undefined') return new Blob([str], { type: 'application/json' });
  const cs = new CompressionStream('gzip');
  const wr = cs.writable.getWriter();
  wr.write(new TextEncoder().encode(str));
  wr.close();
  return new Response(cs.readable).blob();
}

export async function readFileTextOrGzip(file) {
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf);
  if (u8.length >= 2 && u8[0] === 0x1f && u8[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip');
    const wr = ds.writable.getWriter();
    wr.write(u8);
    wr.close();
    return await new Response(ds.readable).text();
  }
  return new TextDecoder().decode(u8);
}

// ── 9. IndexedDB Async Storage (Replaces 5MB Synchronous localStorage) ──────
export function openStudioDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('orpheumStudioPro', 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function idbPut(key, val) {
  try {
    const db = await openStudioDB();
    await new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(val, key);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    db.close();
    return true;
  } catch (e) {
    return false;
  }
}
export async function idbRead(key) {
  try {
    const db = await openStudioDB();
    const v = await new Promise((res, rej) => {
      const rq = db.transaction('kv', 'readonly').objectStore('kv').get(key);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
    db.close();
    return v;
  } catch (e) {
    return null;
  }
}

// ── 10. Studio Layer & Preset Factories ─────────────────────────────────────
export function presetTree(kind = 'stasheff') {
  const cx = plate.W / 2, cy = plate.H / 2;
  if (kind === 'mandala') {
    const c1 = makeAtom('circle', cx, cy, 0, 180);
    const s1 = makeAtom('square', cx, cy, 1, 135);
    const t1 = makeAtom('triangle', cx, cy, 2, 105);
    const h = makeOp('harmonic', [c1, s1, t1], { n: 6, law: '1/φ^k', mode: 'ring', phase: 0, rankStep: 1 });
    return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [h] };
  }
  if (kind === 'echoTower') {
    const sq = makeAtom('square', cx - 60, cy + 40, 0, 190);
    const tr = makeAtom('triangle', cx + 50, cy - 30, 2, 150);
    const ec = makeOp('echo', [sq, tr], { n: 6, gain: 1.05, about: 'plate', rankStep: 1 });
    return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [ec] };
  }
  if (kind === 'fourierBloom') {
    const sq = makeAtom('square', cx, cy, 1, 230);
    const fb = makeOp('fourier', [sq], { K: 7, basis: 'phi', bloom: 0.65 });
    const hm = makeOp('harmonic', [fb], { n: 5, law: '1/k', mode: 'nested', phase: 15, rankStep: 1 });
    return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [hm] };
  }
  if (kind === 'cathedral') {
    const a = makeAtom('circle', cx, cy - 80, 0, 170);
    const b = makeAtom('square', cx - 90, cy + 70, 1, 155);
    const c = makeAtom('triangle', cx + 90, cy + 70, 2, 160);
    const ex = makeOp('extrude', [a, b, c], { depth: 48, angle: 135, steps: 6, shade: 'rank', alpha: 0.35, blend: 'multiply', rankStep: 1 });
    return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [ex] };
  }
  if (kind === 'krystals') {
    const a = makeAtom('triangle', cx, cy, 0, 220);
    const b = makeAtom('square', cx, cy, 2, 180);
    const kf = makeOp('kfilter', [a, b], { N: 128, beta: 0.6, echoes: 2, echoGain: 0.75, echoRot: 1, sectorN: 6, sectorStr: 0.6, ringStr: 0.5, ringWidth: 0.18, ringK0: 0.1, phaseQ: 0, whiten: 0, lo: 0, hi: 1, levels: 4, minArea: 14 });
    return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [kf] };
  }
  // Default: Stasheff Associahedron K_4 composition + Harmonic Ring
  const a1 = makeAtom('circle', cx - 120, cy - 60, 0, 165);
  const a2 = makeAtom('square', cx + 90, cy - 50, 1, 140);
  const a3 = makeAtom('triangle', cx - 40, cy + 110, 2, 150);
  const a4 = makeAtom('circle', cx + 110, cy + 100, 3, 120);
  const asc = makeOp('assoc', [a1, a2, a3, a4], { law: '1/φ', vertex: 1, walk: 0.25, toward: 2, rankStep: 1 });
  asc.label = 'Stasheff K₄ Unit';
  const cInner = makeAtom('triangle', cx, cy, 1, 120);
  const harm = makeOp('harmonic', [cInner], { n: 5, law: '1/φ^k', mode: 'ring', phase: 18, rankStep: 1 });
  harm.label = 'Harmonic Ring';
  return { id: 'root', kind: 'op', op: 'group', p: { rankStep: 0 }, t: { x: 0, y: 0, s: 1, r: 0 }, rank: 0, children: [asc, harm] };
}

export function mkOperadLayer(name = 'Operad Layer', root = null) {
  return {
    id: uid(),
    kind: 'operad',
    name,
    visible: true,
    opacity: 1,
    blend: 'normal',
    dx: 0, dy: 0, rot: 0, scale: 1,
    lyPal: null,
    recut: true,
    glueMode: 'sheaf',
    tripleGlue: false,
    stroke: 1,
    lineadContrib: true,
    root: root || presetTree('stasheff')
  };
}

export function mkImageLayer(src = 0, name = 'Image Layer') {
  return {
    id: uid(),
    kind: 'image',
    src,
    name,
    levels: 4,
    minArea: 80,
    invert: false,
    eps: 1.0,
    harm: 14,
    adapt: 0.25,
    basis: 'all',
    subpixel: true,
    place: 'trace',
    mode: 'fills',
    opacity: 1,
    palRoll: 0,
    pb: 'cycle1',
    blend: 'normal',
    dx: 0, dy: 0, rot: 0, scale: 1,
    lyPal: null,
    lineColor: null,
    visible: true,
    bandsOff: {},
    bandsCut: {},
    bandColors: {},
    ringRanks: {},
    ringOver: {},
    seed: 1927,
    order: 8,
    rings: 5,
    symbol: 'self',
    recipe: ['annulus', 'disc', 'petal', 'annulus'],
    comp: 'radial',
    jitter: 0.35,
    angleQ: 45,
    aScale: 1,
    aSpread: 0.5,
    aStagger: 0.5,
    aAxis: 0,
    echo: 0,
    echoStr: 0.85,
    lineadContrib: true
  };
}

export function mkGeomeLayer(name = 'Seeded Geome', seed = 1927) {
  const sym = SYMBOLS[0];
  return Object.assign(mkImageLayer(0, name), {
    kind: 'geome',
    seed,
    levels: 5,
    harm: 0,
    symbol: sym.key,
    recipe: sym.recipe.slice(),
    order: sym.order,
    rings: 5,
    comp: 'radial',
    pb: 'cycle1'
  });
}

export function createDefaultStudioDocument() {
  setPlate(1000, 1000);
  return {
    W: 1000,
    H: 1000,
    format: 'square',
    palKey: 'orpheum',
    customPal: null,
    imgPals: [],
    ground: true,
    linead: 'none',
    lineadW: 1.4,
    ghost: 0,
    glueMode: 'sheaf',
    tripleGlue: false,
    recut: true,
    stroke: 1,
    relief: 4,
    reliefAngle: 135,
    reliefAlpha: 0.45,
    inches: 12,
    dpi: 900,
    sourceMaxSide: 2800,
    lumaRes: 2048,
    ingestGrid: 1200,
    subpixelTrace: true,
    bezierCurves: true,
    autoLOD: true,
    trimMargin: true,
    losslessSources: false,
    activeLayer: 0,
    customKinds: [],
    sources: [],
    lumas: [],
    layers: [
      mkOperadLayer('Operadic Tree · K₄ & Harmonic')
    ]
  };
}

