#!/usr/bin/env node
/**
 * vbm.mjs — Visual Browser Monitor & Interactive Experience Recorder (VBM)
 *
 * Drives a real Chromium browser via native Chrome DevTools Protocol (CDP)
 * over Node 22 built-in WebSocket, steps through the entire user journey of
 * Universal Infographic & Motion Foundry Studio Pro and the Next-Gen Video
 * Explainer, captures @2x screenshots at every interaction state, measures
 * UX/DOM/BBox/Contrast ergonomics, and compiles an MP4 + GIF walkthrough
 * recording via ffmpeg.
 *
 * Usage:
 *   node vbm.mjs [--tag v9] [--out out/vbm]
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function parseArgs() {
  const args = process.argv.slice(2);
  let tag = 'v9';
  let outDir = path.join(__dirname, 'out', 'vbm');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag' && args[i + 1]) tag = args[++i];
    else if (args[i] === '--out' && args[i + 1]) outDir = path.resolve(args[++i]);
  }
  return { tag, outDir };
}

async function launchChromeWithCDP(width = 1720, height = 1040) {
  const userDataDir = fs.mkdtempSync('/tmp/vbm-chrome-');
  const proc = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    '--force-device-scale-factor=2',
    '--remote-debugging-port=0',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for Chrome DevTools WS URL')), 10000);
    let stderrBuf = '';
    proc.stderr.on('data', chunk => {
      stderrBuf += chunk.toString();
      const m = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited early with code ${code}`));
    });
  });

  // Get page target WebSocket URL
  const portMatch = wsUrl.match(/:(\d+)\//);
  const port = portMatch[1];
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  let msgId = 0;
  const pending = new Map();
  ws.addEventListener('message', ev => {
    const data = JSON.parse(ev.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(data.error.message));
      else resolve(data.result);
    }
  });

  function send(method, params = {}) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: false
  });

  async function evaluate(expr) {
    const trimmed = expr.trim();
    const wrapped = trimmed.startsWith('(() =>') ? trimmed : `(() => { ${trimmed} })()`;
    const res = await send('Runtime.evaluate', {
      expression: wrapped,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      const msg = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`JS Eval Error: ${msg}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async function screenshot(filePath) {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  }

  async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function close() {
    try { ws.close(); } catch {}
    try { proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }

  return { send, evaluate, screenshot, wait, close };
}

/**
 * In-browser UX & Visual Telemetry Probe executed at every recorded step
 */
const UX_PROBE_JS = `(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const docEl = document.documentElement;
  const chrome = docEl.dataset.chrome || 'explainer';

  // Check active panel visibility & bounding rect
  const visiblePanels = Array.from(document.querySelectorAll('.stage-card, .theatre-stage')).filter(el => {
    const st = getComputedStyle(el);
    return !el.hidden && st.display !== 'none' && st.visibility !== 'hidden' && el.getBoundingClientRect().height > 20;
  }).map(el => {
    const r = el.getBoundingClientRect();
    return {
      id: el.id || el.className,
      top: Math.round(r.top),
      left: Math.round(r.left),
      width: Math.round(r.width),
      height: Math.round(r.height),
      viewportCoveragePct: Number(((r.width * Math.min(r.height, vh - Math.max(0, r.top))) / (vw * vh) * 100).toFixed(1))
    };
  });

  // Check SVG mount health if visible
  let svgHealth = null;
  const activeSvg = Array.from(document.querySelectorAll('.svg-mount svg, #stage-svg-wrap svg')).find(s => {
    const r = s.getBoundingClientRect();
    return r.width > 50 && r.height > 50;
  });
  if (activeSvg) {
    const sr = activeSvg.getBoundingClientRect();
    const texts = Array.from(activeSvg.querySelectorAll('text'));
    let clippedTexts = 0;
    texts.forEach(t => {
      const tr = t.getBoundingClientRect();
      if (tr.width > 0 && (tr.right > sr.right + 4 || tr.left < sr.left - 4 || tr.bottom > sr.bottom + 4 || tr.top < sr.top - 4)) {
        clippedTexts++;
      }
    });
    const styleComp = getComputedStyle(activeSvg);
    svgHealth = {
      id: activeSvg.id || 'mounted-svg',
      width: Math.round(sr.width),
      height: Math.round(sr.height),
      textCount: texts.length,
      clippedTexts,
      zPlaneGroups: activeSvg.querySelectorAll('[data-z]').length,
      titleCount: activeSvg.querySelectorAll('title').length,
      descCount: activeSvg.querySelectorAll('desc').length,
      actorA: styleComp.getPropertyValue('--actor-a').trim(),
      ground: styleComp.getPropertyValue('--ground').trim()
    };
  }

  // Check Sprite Vault health if #panel-rsi is visible
  let spriteVaultHealth = null;
  const rsiPanel = document.querySelector('#panel-rsi');
  if (rsiPanel && !rsiPanel.hidden && getComputedStyle(rsiPanel).display !== 'none') {
    const uses = Array.from(rsiPanel.querySelectorAll('use'));
    const nonEmptySprites = uses.filter(u => {
      const r = u.getBoundingClientRect();
      return r.width > 5 && r.height > 5;
    }).length;
    spriteVaultHealth = {
      totalUseNodes: uses.length,
      renderedNonEmpty: nonEmptySprites
    };
  }

  // Check Canvas health if #panel-motion is visible
  let canvasHealth = null;
  const mCanvas = document.querySelector('#motion-canvas');
  if (mCanvas && mCanvas.getBoundingClientRect().height > 50) {
    const ctx = mCanvas.getContext('2d');
    const img = ctx.getImageData(0, 0, 120, 80).data;
    let nonBlank = 0;
    for (let i = 0; i < img.length; i += 16) {
      if (img[i] !== img[0] || img[i+1] !== img[1] || img[i+2] !== img[2]) nonBlank++;
    }
    canvasHealth = {
      width: mCanvas.width,
      height: mCanvas.height,
      nonBlankSamples: nonBlank
    };
  }

  // Scroll overflow ergonomics
  const leftDock = document.querySelector('.left-dock');
  const rightDock = document.querySelector('.right-dock');
  const centerStage = document.querySelector('.center-stage');

  return {
    chrome,
    viewport: { vw, vh },
    visiblePanels,
    svgHealth,
    spriteVaultHealth,
    canvasHealth,
    scrollMetrics: {
      leftDockOverflowPx: leftDock ? Math.max(0, leftDock.scrollHeight - leftDock.clientHeight) : 0,
      rightDockOverflowPx: rightDock ? Math.max(0, rightDock.scrollHeight - rightDock.clientHeight) : 0,
      centerStageOverflowPx: centerStage ? Math.max(0, centerStage.scrollHeight - centerStage.clientHeight) : 0
    }
  };
})()`;

async function main() {
  const { tag, outDir } = parseArgs();
  fs.mkdirSync(outDir, { recursive: true });

  const studioUrl = 'file://' + path.join(__dirname, 'index.html');
  const explainerUrl = 'file://' + path.join(__dirname, 'Next-Gen Video Explainer — Talent Accelerator Program (TAP).html');

  const cdp = await launchChromeWithCDP(1720, 1040);
  const steps = [];

  async function recordStep(id, label, actionFn) {
    await actionFn();
    await cdp.wait(350);
    const pngName = `${id}-${tag}.png`;
    const pngPath = path.join(outDir, pngName);
    await cdp.screenshot(pngPath);
    const probe = await cdp.evaluate(UX_PROBE_JS);
    steps.push({ id, label, screenshot: pngName, probe });
    console.log(`[VBM] Captured ${pngName} — ${label}`);
  }

  try {
    // STEP 01: Initial Studio Load (Motion Atlas Paper Chrome + Style 1 Milton 2.5D)
    await recordStep('01-motion-atlas-milton25d', 'Default Studio Load: Motion Atlas Chrome + Milton 2.5D Lithograph', async () => {
      await cdp.send('Page.navigate', { url: studioUrl });
      await cdp.wait(900);
    });

    // STEP 02: Switch to Orpheum Pro Dark-Gold Chrome + Style 4 Orpheum Operad
    await recordStep('02-orpheum-dark-operad', 'Orpheum Pro Obsidian-Gold Chrome + Double-Operad & Sheaf Field Plate', async () => {
      await cdp.evaluate(`
        const c = document.querySelector('#sel-chrome');
        c.value = 'orpheum-dark';
        c.dispatchEvent(new Event('change'));
        const s = document.querySelector('#sel-plate-style');
        s.value = 'orpheum-operad';
        s.dispatchEvent(new Event('change'));
      `);
    });

    // STEP 03: Switch to Hydrographic Bathysphere Chrome + Style 3 Kinetic Hydrography Survey
    await recordStep('03-hydrographic-survey', 'Hydrographic Bathysphere Chrome + 25-Ghost Bathymetric Survey Plate', async () => {
      await cdp.evaluate(`
        const c = document.querySelector('#sel-chrome');
        c.value = 'hydrographic';
        c.dispatchEvent(new Event('change'));
        const s = document.querySelector('#sel-plate-style');
        s.value = 'hydrographic-survey';
        s.dispatchEvent(new Event('change'));
      `);
    });

    // STEP 04: Switch to Push Pin / Milton Warm Chrome + Style 2 Saul Bass Cut-Paper
    await recordStep('04-milton-warm-saul-bass', 'Push Pin / Milton Warm Chrome + Saul Bass 3-Color Cut-Paper & 5-Rung Plate', async () => {
      await cdp.evaluate(`
        const c = document.querySelector('#sel-chrome');
        c.value = 'milton-warm';
        c.dispatchEvent(new Event('change'));
        document.querySelector('[data-quick-plate="saul-bass-cutout"]').click();
      `);
    });

    // STEP 05: Switch to DeepMind Iridescent Chrome + Style 6 Isometric Voxel 3D
    await recordStep('05-iridescent-voxel3d', 'DeepMind Frontier Iridescent Chrome + Isometric Voxel & 3D Massing Plate', async () => {
      await cdp.evaluate(`
        const c = document.querySelector('#sel-chrome');
        c.value = 'deepmind-iridescent';
        c.dispatchEvent(new Event('change'));
        document.querySelector('[data-quick-plate="isometric-voxel"]').click();
      `);
    });

    // STEP 06: Switch to Editorial Collage + Dynamic Sanzo Wada Palette Re-Theming
    await recordStep('06-editorial-collage-wada', 'Motion Atlas Chrome + Editorial Collage + Live Wada No. 126 Re-Theming', async () => {
      await cdp.evaluate(`
        const c = document.querySelector('#sel-chrome');
        c.value = 'motion-atlas';
        c.dispatchEvent(new Event('change'));
        document.querySelector('[data-quick-plate="editorial-collage"]').click();
        const w = document.querySelector('#sel-wada');
        w.value = '126';
        w.dispatchEvent(new Event('change'));
      `);
    });

    // STEP 07: Live Parametric 2.5D Tilt (14 deg) + 8:3 Catalyst Simulation on Milton 2.5D
    await recordStep('07-live-tweaks-catalyst', 'Live 2.5D Isometric Tilt (14°) + 8:3 Catalyst Simulation + Z-Plane Control', async () => {
      await cdp.evaluate(`
        document.querySelector('[data-quick-plate="milton-25d"]').click();
        const tilt = document.querySelector('#tw-tilt');
        tilt.value = '14';
        tilt.dispatchEvent(new Event('input'));
        document.querySelector('#btn-preset-catalyst').click();
      `);
    });

    // STEP 08: Tab II — Master Combined Programmatic Workflow Diagram (Tier I–III)
    await recordStep('08-tab-workflow-diagram', 'Tab II: Master Combined Programmatic Workflow Diagram (Tier I–III)', async () => {
      await cdp.evaluate(`
        const tilt = document.querySelector('#tw-tilt');
        tilt.value = '0';
        tilt.dispatchEvent(new Event('input'));
        document.querySelector('.surface-tab[data-tab="workflow"]').click();
      `);
    });

    // STEP 09: Tab III — Single-Clock Animation Engine & 5-Rung Saul Bass Rig Theatre
    await recordStep('09-tab-motion-theatre', 'Tab III: Single-Clock Animation (Hydrographic Phasor) + Saul Bass Rung 4 Severance', async () => {
      await cdp.evaluate(`
        document.querySelector('.surface-tab[data-tab="motion"]').click();
        document.querySelector('.mstyle-chip[data-mstyle="hydrographic"]').click();
        const r = document.querySelector('#tw-rung');
        r.value = '4';
        r.dispatchEvent(new Event('input'));
        document.querySelector('[data-compile-target="remotion"]').click();
      `);
      await cdp.wait(300);
    });

    // STEP 10: Tab IV — 4-Round RSI Telemetry & Core SVG <symbol> Sprite Vault
    await recordStep('10-tab-rsi-sprite-vault', 'Tab IV: 4-Round RSI Convergence Cards, 6 MOE Lenses & Core SVG Sprite Vault', async () => {
      await cdp.evaluate(`
        document.querySelector('.surface-tab[data-tab="rsi"]').click();
      `);
    });

    // STEP 11: Live Source Document Re-Compilation Test
    await recordStep('11-live-source-compile', 'Live Source Document Ingest & Re-Compilation into Infographic Plate', async () => {
      await cdp.evaluate(`
        document.querySelector('.surface-tab[data-tab="infographic"]').click();
        document.querySelector('[data-quick-plate="editorial-collage"]').click();
        document.querySelector('#inp-doc-title').value = 'Autonomous Agentic Foundry — Architecture & Telemetry';
        document.querySelector('#inp-doc-body').value = '# Autonomous Agentic Foundry\\n1. THESIS: Closed-loop visual & operadic synthesis.\\n2. POOL: 12 specialized red-team evaluators.\\n3. COHORT: 6 builders + 6 critics in lockstep.\\n4. YIELD: $2,400,000 verified annual throughput.';
        document.querySelector('#btn-compile-doc').click();
      `);
    });

    // STEP 12: Next-Gen Video Explainer Beat Walkthrough & Curtain Studio
    if (fs.existsSync(path.join(__dirname, 'Next-Gen Video Explainer — Talent Accelerator Program (TAP).html'))) {
      await recordStep('12-video-explainer-theatre', 'Next-Gen Video Explainer: Beat 7 Equation Focus + Interactive Camera Director', async () => {
        await cdp.send('Page.navigate', { url: explainerUrl });
        await cdp.wait(800);
        await cdp.evaluate(`
          const b7 = document.querySelectorAll('.beat-pill, [data-beat]')[6];
          if (b7) b7.click();
        `);
      });
    }
  } finally {
    cdp.close();
  }

  // Write VBM telemetry JSON
  const telemetryPath = path.join(outDir, `vbm-telemetry-${tag}.json`);
  fs.writeFileSync(telemetryPath, JSON.stringify({ tag, timestamp: new Date().toISOString(), steps }, null, 2));
  console.log(`[VBM] Wrote telemetry -> ${telemetryPath}`);

  // Assemble MP4 and GIF walkthrough recording via ffmpeg
  try {
    const listFile = path.join(outDir, `ffmpeg-frames-${tag}.txt`);
    const lines = [];
    for (const st of steps) {
      lines.push(`file '${ path.join(outDir, st.screenshot) }'`);
      lines.push(`duration 1.25`);
    }
    lines.push(`file '${ path.join(outDir, steps[steps.length - 1].screenshot) }'`);
    fs.writeFileSync(listFile, lines.join('\n'));

    const mp4Path = path.join(outDir, `vbm-walkthrough-${tag}.mp4`);
    execFileSync('/opt/homebrew/bin/ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
      '-vf', 'scale=1720:1040:force_original_aspect_ratio=decrease,pad=1720:1040:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
      '-r', '30', '-c:v', 'libx264', '-crf', '20', mp4Path
    ], { stdio: 'ignore' });

    const gifPath = path.join(outDir, `vbm-walkthrough-${tag}.gif`);
    execFileSync('/opt/homebrew/bin/ffmpeg', [
      '-y', '-i', mp4Path,
      '-vf', 'fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
      gifPath
    ], { stdio: 'ignore' });

    console.log(`[VBM] Recorded video walkthrough -> ${mp4Path} & ${gifPath}`);
  } catch (err) {
    console.warn(`[VBM] ffmpeg encoding warning:`, err.message);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
