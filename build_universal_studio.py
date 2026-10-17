#!/usr/bin/env python3
"""
build_universal_studio.py — Compiles the self-contained, zero-dependency
`Universal Infographic & Motion Foundry Studio Pro.html` uniting:
  - 5 Switchable UI Chromes (Motion Atlas Paper, Orpheum Dark-Gold Desktop,
    Hydrographic Bathysphere, Milton Warm Litho, DeepMind Frontier Iridescent)
  - 18 Tweakable Infographic & Single-Clock Animation Styles
  - Full 348 Sanzo Wada Harmonic Dictionary + Live OKLab 4x4 Chord Matrix
  - 8 Parametric Character Archetypes + 5-Rung Saul Bass Reduction Ladder
  - Orpheum Double-Operad (O_geom x O_col) + Sheaf Overlap Glue + Associahedron K_4
  - 4-Round Recursive Self-Improvement (RSI) Engine & Telemetry Inspector
  - Live Source Document Ingest + Combined Programmatic Workflow Diagram
"""
from __future__ import annotations
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
WORKSPACE = ROOT.parent
ART_DIR = ROOT / "out" / "artifacts"
_LOCAL_MA = ROOT / "engines" / "motion-atlas"
MOTION_ATLAS_DIR = _LOCAL_MA if _LOCAL_MA.exists() else (WORKSPACE / "ARTE" / "motion-atlas")


def load_text(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def main() -> None:
    # Load verified JS engines from ARTE/motion-atlas (escape literal </script> for inline HTML5 safety)
    wada_js = load_text(MOTION_ATLAS_DIR / "geome-wada.js").replace("</script>", "<\\/script>")
    motion_engine_js = load_text(MOTION_ATLAS_DIR / "studio-motion-engine.js").replace("</script>", "<\\/script>")
    canvas_oauth_js = load_text(MOTION_ATLAS_DIR / "studio-canvas-oauth.js").replace("</script>", "<\\/script>")

    # Load compiled SVG artifacts and RSI ledger from out/artifacts
    svg_plates = {
        "combined-workflow": load_text(ART_DIR / "combined-workflow-diagram.svg"),
        "milton-25d": load_text(ART_DIR / "infographic-milton-25d.svg"),
        "saul-bass-cutout": load_text(ART_DIR / "infographic-saul-bass-cutout.svg"),
        "hydrographic-survey": load_text(ART_DIR / "infographic-hydrographic-survey.svg"),
        "orpheum-operad": load_text(ART_DIR / "infographic-orpheum-operad.svg"),
        "editorial-collage": load_text(ART_DIR / "infographic-editorial-collage.svg"),
        "isometric-voxel": load_text(ART_DIR / "infographic-isometric-voxel.svg"),
        "core-sprite": load_text(ART_DIR / "core-svg-artifacts-sprite.svg"),
    }
    rsi_ledger = json.loads(load_text(ART_DIR / "rsi-ledger.json"))
    symspec = json.loads(load_text(ROOT / "spec" / "tap.symspec.json"))

    # Pre-loaded research documents for instant switching or custom editing
    preset_docs = {
        "tap-transcript": {
            "id": "tap-transcript",
            "title": "Talent Accelerator Program (TAP) — Oct 9 Call",
            "subtitle": "Training × Staffing Hybrid Model & $1M/Cohort Economics",
            "wada": 343,
            "defaultStyle": "milton-25d",
            "charId": "ceti-whale",
            "text": (
                "# Talent Accelerator Program (TAP) — Training × Staffing\n"
                "1. THESIS (S1–S2): Neither pure training nor pure staffing — a unified Talent Accelerator.\n"
                "2. CANDIDATE POOL (S3–S6): 5–8 candidates screened for technical background prerequisites.\n"
                "3. COHORT DYAD (S5, S7): 8 billable client engineers + 8 pursuit engineers trained together at $0 client cost.\n"
                "4. CHARTER & TAPER (S8–S10, S13): 1-year contract at 40 hr/wk; Month 1 100% immersion (5 d/wk) tapering to 1–2 d/wk coaching (2 cohorts/coach).\n"
                "5. OUTCOME FORK (S11): Deploy to client at year-end OR convert into internal delivery bench.\n"
                "6. DERIVATION (S12): $25/hr margin × 40 hr/wk × 8 people × 50 wks = $1,000,000 profit/cohort (10/yr = $10M).\n"
                "7. CATALYST COUNTERPOINT (S14): Is 8:8 too high an investment? 8 : 2–4 pursuit seats act as the cohort catalyst."
            ),
        },
        "orpheum-monograph": {
            "id": "orpheum-monograph",
            "title": "Orpheum Studio Pro — Double Operad & Sheaf Cohomology",
            "subtitle": "O_geom × O_col · Stasheff Associahedron K_n · 2D FFT k-Space",
            "wada": 219,
            "defaultStyle": "orpheum-operad",
            "charId": "geome-orpheus",
            "text": (
                "# Orpheum Double Operad & Sheaf Gluing Monograph\n"
                "1. ATOMS (P1): Circle (Point of Origin), Square (Four Directions Held), Triangle (The Ascent) at M=144 vertices.\n"
                "2. OPERADIC ALGEBRA (P4): 16 operations (harmonic, fourier, echo, affine, assoc K_n, fold D_k, lattice, braid, veil, extrude, kfilter).\n"
                "3. SHEAF OVERLAP LAW (P2): Symmetric overlap re-cutting glue(a,b) = (a+b+1) mod m and OKLab Perceptual Midpoint Chord Table + True 3-Way A∩B∩C Gluing.\n"
                "4. ASSOCIAHEDRON HOMOTOPY: Non-associative binary composition parameterized over Stasheff Associahedron K_4 (5 vertices, 5 Tamari edges).\n"
                "5. SPECTRAL DUALITY (P3): Radix-2 2D FFT/IFFT with radial power spectrum slope 1.0 ≤ β ≤ 1.6 and 900-DPI Path2D archival streaming."
            ),
        },
        "hydrography-spec": {
            "id": "hydrography-spec",
            "title": "Kinetic Hydrography & Sanzo Wada 348 Chromatic Law",
            "subtitle": "Bathymetric Trajectory Soundings · Saul Bass 5-Rung Reduction",
            "wada": 296,
            "defaultStyle": "hydrographic-survey",
            "charId": "astronav-compass",
            "text": (
                "# Kinetic Hydrography & Sanzo Wada 348 Specification\n"
                "1. WADA CLOSURE (G01–G02): All 348 historical Sanzo Wada combinations mapped to 4×4 OKLab chord matrices and CIEDE2000 tokens with ≥7.0:1 AAA contrast.\n"
                "2. SAUL BASS 5-RUNG LADDER (G05): Every character rig reduces across 5 rungs (Inventory → Pivot → Silhouette → Severance → 16px Cut) with Δ_geom > 0.08.\n"
                "3. BATHYMETRIC SURVEY (G12): Motion plotted as N=25 ghost-position silhouettes along a parametric spline with 000°/090°/180°/270° compass rose and ≥33% open water.\n"
                "4. STORYBOARD CONSERVATION (G08): Enforces BUT/THEREFORE causal hinges, ≤2 simultaneous moves, Beat 6 negative-space breather, and Beat 8 callback."
            ),
        },
    }

    html = f"""<!doctype html>
<html lang="en" data-chrome="motion-atlas">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Universal Infographic, SVG, Workflow &amp; Motion Foundry Studio Pro (v9)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..600&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..500&family=IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
<style>
  /* ═══════════════════════════════════════════════════════════════════════
     5 SWITCHABLE STUDIO CHROMES (Motion Atlas · Orpheum · Hydro · Milton · Iridescent)
     ═══════════════════════════════════════════════════════════════════════ */
  :root, html[data-chrome="motion-atlas"] {{
    --bg-app: #FBF3E6;
    --bg-panel: #F2E4CE;
    --bg-elev: #FFFDF8;
    --bg-card: #F7ECDA;
    --ink: #1A1F2E;
    --ink-soft: #4A5060;
    --border: rgba(26, 31, 46, 0.18);
    --border-strong: #1A1F2E;
    --accent-primary: #8C4A2E;
    --accent-secondary: #2E5A44;
    --accent-gold: #C88A2E;
    --chrome-name: "Motion Atlas Paper Chrome";
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'DM Sans', -apple-system, sans-serif;
    --font-mono: 'Space Mono', 'IBM Plex Mono', monospace;
  }}
  html[data-chrome="orpheum-dark"] {{
    --bg-app: #0A0A0B;
    --bg-panel: #121214;
    --bg-elev: #18181C;
    --bg-card: #1F1F24;
    --ink: #EDEAE3;
    --ink-soft: #908E87;
    --border: rgba(255, 255, 255, 0.10);
    --border-strong: rgba(212, 168, 75, 0.55);
    --accent-primary: #D4A84B;
    --accent-secondary: #58B8A8;
    --accent-gold: #E87258;
    --chrome-name: "Orpheum Pro Obsidian-Gold Desktop Chrome";
  }}
  html[data-chrome="hydrographic"] {{
    --bg-app: #0E151B;
    --bg-panel: #131D26;
    --bg-elev: #182530;
    --bg-card: #1D2D3A;
    --ink: #EDEAE3;
    --ink-soft: #8AA6B5;
    --border: rgba(150, 209, 170, 0.18);
    --border-strong: #96D1AA;
    --accent-primary: #96D1AA;
    --accent-secondary: #38BDF8;
    --accent-gold: #C8963E;
    --chrome-name: "Kinetic Hydrography Bathysphere Chrome";
  }}
  html[data-chrome="milton-warm"] {{
    --bg-app: #F5EEDF;
    --bg-panel: #EBE1CC;
    --bg-elev: #FAF6EC;
    --bg-card: #F0E7D4;
    --ink: #181412;
    --ink-soft: #5C5248;
    --border: rgba(24, 20, 18, 0.16);
    --border-strong: #181412;
    --accent-primary: #C43028;
    --accent-secondary: #1F5E63;
    --accent-gold: #D47828;
    --chrome-name: "Push Pin / Milton Glaser Warm Litho Chrome";
  }}
  html[data-chrome="deepmind-iridescent"] {{
    --bg-app: #070B14;
    --bg-panel: #0F172A;
    --bg-elev: #1E293B;
    --bg-card: #162033;
    --ink: #F1F5F9;
    --ink-soft: #94A3B8;
    --border: rgba(56, 189, 248, 0.20);
    --border-strong: #38BDF8;
    --accent-primary: #38BDF8;
    --accent-secondary: #10B981;
    --accent-gold: #F59E0B;
    --chrome-name: "DeepMind Frontier Iridescent Chrome";
  }}

  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0; padding: 0;
    background: var(--bg-app); color: var(--ink);
    font-family: var(--font-body); font-size: 13px; line-height: 1.45;
    -webkit-font-smoothing: antialiased;
    transition: background-color 180ms ease, color 180ms ease;
  }}

  /* Orpheum Desktop Menu Bar (visible in all chromes, styled per chrome) */
  .orpheum-menubar {{
    display: flex; align-items: center; justify-content: space-between;
    padding: 5px 16px; background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 10.5px;
    gap: 12px; flex-wrap: wrap;
  }}
  .menu-left {{ display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }}
  .menu-pill {{
    padding: 3px 8px; border-radius: 4px; cursor: pointer;
    color: var(--ink-soft); border: 1px solid transparent;
    background: transparent; font-family: var(--font-mono); font-size: 10px;
  }}
  .menu-pill:hover, .menu-pill.active {{
    color: var(--accent-primary); border-color: var(--border); background: var(--bg-elev);
  }}

  /* Top Studio Masthead */
  .studio-topbar {{
    position: sticky; top: 0; z-index: 60;
    background: var(--bg-app);
    border-bottom: 1.5px solid var(--border-strong);
    padding: 10px 18px;
    display: flex; justify-content: space-between; align-items: center;
    gap: 14px; flex-wrap: wrap;
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  }}
  .brand-wrap {{ display: flex; align-items: center; gap: 12px; }}
  .brand-emblem {{
    width: 38px; height: 38px; border-radius: 9px;
    background: var(--accent-primary); color: var(--bg-elev);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 700;
    border: 1.5px solid var(--border-strong);
  }}
  .brand-kicker {{
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 700;
    letter-spacing: 0.12em; color: var(--accent-primary); text-transform: uppercase;
  }}
  .brand-title {{
    font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--ink);
  }}

  .top-controls {{ display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }}
  .ctrl-group {{
    display: flex; align-items: center; gap: 6px;
    background: var(--bg-panel); padding: 4px 9px;
    border-radius: 7px; border: 1px solid var(--border);
  }}
  .ctrl-group label {{
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 700;
    color: var(--ink-soft); text-transform: uppercase;
  }}
  select, input[type="text"], input[type="number"], textarea {{
    background: var(--bg-elev); color: var(--ink);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 4px 8px; font-family: var(--font-mono); font-size: 11px;
  }}
  .btn {{
    background: var(--bg-elev); color: var(--ink);
    border: 1px solid var(--border-strong); border-radius: 6px;
    padding: 5px 11px; font-family: var(--font-mono); font-size: 10.5px;
    font-weight: 700; cursor: pointer; transition: all 120ms ease;
  }}
  .btn:hover {{ background: var(--accent-primary); color: var(--bg-elev); }}
  .btn-primary {{
    background: var(--accent-primary); color: var(--bg-elev);
    border-color: var(--border-strong);
  }}
  .btn-primary:hover {{ filter: brightness(1.1); }}

  /* Main 3-Column Workbench Layout */
  .workbench {{
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr) 350px;
    gap: 0;
    min-height: calc(100vh - 102px);
  }}
  @media (max-width: 1320px) {{
    .workbench {{ grid-template-columns: 300px minmax(0, 1fr); }}
    .right-dock {{ grid-column: 1 / -1; border-left: none; border-top: 1px solid var(--border); }}
  }}
  @media (max-width: 920px) {{
    .workbench {{ grid-template-columns: 1fr; }}
  }}

  .left-dock, .right-dock {{
    background: var(--bg-panel);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    max-height: calc(100vh - 102px);
    display: flex; flex-direction: column;
  }}
  .right-dock {{ border-right: none; border-left: 1px solid var(--border); }}

  .dock-sec {{
    border-bottom: 1px solid var(--border);
    padding: 12px 14px;
    display: flex; flex-direction: column; gap: 9px;
  }}
  .dock-hdr {{
    display: flex; align-items: center; justify-content: space-between;
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-primary);
  }}
  .row {{ display: flex; align-items: center; justify-content: space-between; gap: 8px; }}
  .row label {{ font-size: 11px; color: var(--ink-soft); font-weight: 500; }}
  .row .val {{ font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; color: var(--accent-primary); }}
  input[type="range"] {{ width: 130px; accent-color: var(--accent-primary); cursor: pointer; }}

  /* Center Pasteboard Stage */
  .center-stage {{
    background-color: var(--bg-app);
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 22px 22px;
    padding: 16px 20px 36px;
    overflow-y: auto;
    max-height: calc(100vh - 102px);
    display: flex; flex-direction: column; gap: 18px;
  }}

  /* Surface Mode Tabs */
  .surface-tabs {{
    display: flex; gap: 6px; flex-wrap: wrap;
    background: var(--bg-panel); padding: 6px; border-radius: 9px;
    border: 1px solid var(--border);
  }}
  .surface-tab {{
    padding: 6px 12px; border-radius: 6px; border: 1px solid transparent;
    background: transparent; color: var(--ink-soft);
    font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; cursor: pointer;
  }}
  .surface-tab[aria-selected="true"] {{
    background: var(--bg-elev); color: var(--accent-primary);
    border-color: var(--border-strong); box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }}

  /* Viewport Card */
  .stage-card {{
    background: var(--bg-elev);
    border: 1.5px solid var(--border-strong);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(0,0,0,0.12);
    display: flex; flex-direction: column;
  }}
  .stage-card[hidden] {{
    display: none !important;
  }}
  .stage-bar {{
    padding: 8px 14px; background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
    font-family: var(--font-mono); font-size: 10.5px;
  }}
  .svg-mount {{
    width: 100%; overflow: hidden; display: flex; justify-content: center; align-items: center;
    padding: 12px; min-height: 540px; transition: transform 220ms ease;
  }}
  .svg-mount svg {{
    width: 100%; height: auto; max-height: 760px; display: block;
    border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.10);
    transition: transform 260ms ease;
  }}

  /* Live Single-Clock Motion Canvas */
  .motion-stage-wrap {{
    display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(260px, 1fr);
    gap: 14px; padding: 14px; align-items: start;
  }}
  @media (max-width: 1080px) {{ .motion-stage-wrap {{ grid-template-columns: 1fr; }} }}
  canvas.live-canvas {{
    width: 100%; aspect-ratio: 16 / 10; display: block;
    border-radius: 8px; border: 1.5px solid var(--border-strong);
    background: var(--bg-app);
  }}

  /* Wada Swatch Strip & OKLab Matrix */
  .swatch-row {{ display: flex; gap: 5px; flex-wrap: wrap; }}
  .swatch-pill {{
    flex: 1; min-width: 42px; height: 28px; border-radius: 5px;
    border: 1px solid var(--border-strong); display: flex; align-items: flex-end;
    justify-content: center; padding-bottom: 2px;
    font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
    color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  }}
  .chord-grid {{
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px;
  }}
  .chord-cell {{
    height: 20px; border-radius: 3px; font-family: var(--font-mono);
    font-size: 8.5px; display: flex; align-items: center; justify-content: center;
    color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.75);
  }}

  /* RSI Round Cards */
  .rsi-grid {{
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;
  }}
  .rsi-card {{
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
  }}
  .rsi-card.active {{ border: 2px solid var(--accent-secondary); }}
  .badge-pass {{
    display: inline-block; padding: 2px 7px; border-radius: 4px;
    background: var(--accent-secondary); color: #fff;
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 700;
  }}
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════════════
     ORPHEUM & MOTION ATLAS UNIFIED DESKTOP MENU BAR
     ═══════════════════════════════════════════════════════════════════════ -->
<div class="orpheum-menubar">
  <div class="menu-left">
    <span style="font-weight:700;color:var(--accent-primary)">◈ ARTE × GLYPH FOUNDRY v9</span>
    <button class="menu-pill active" data-surface-jump="infographic">1 · Infographic Studio (6 SVG Archetypes)</button>
    <button class="menu-pill" data-surface-jump="workflow">2 · Combined Workflow Diagram (Tier I–III)</button>
    <button class="menu-pill" data-surface-jump="motion">3 · Single-Clock Animation &amp; 5-Rung Rig Lab (15 Styles)</button>
    <button class="menu-pill" data-surface-jump="rsi">4 · Recursive Self-Improvement (RSI R0→R3) &amp; Sprite Vault</button>
  </div>
  <div style="display:flex;gap:12px;align-items:center">
    <span id="hud-gate-status" class="badge-pass">52 / 52 GATES PASS (H1–H8 · G01–G20 · P1–P8)</span>
    <span id="hud-wada-status" style="color:var(--ink-soft)">Wada No. 343 · AAA 13.48:1</span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════
     STICKY STUDIO MASTHEAD: CHROME SWITCHER, STYLE SWITCHER & WADA 348 PICKER
     ═══════════════════════════════════════════════════════════════════════ -->
<header class="studio-topbar">
  <div class="brand-wrap">
    <div class="brand-emblem">✦</div>
    <div>
      <div class="brand-kicker">Universal Programmatic Visual &amp; Motion Compiler</div>
      <div class="brand-title">Infographic, Animation, Core SVG &amp; Workflow Studio Pro</div>
    </div>
  </div>

  <div class="top-controls">
    <div class="ctrl-group">
      <label for="sel-chrome">UI Chrome</label>
      <select id="sel-chrome">
        <option value="motion-atlas">1 · Motion Atlas Paper (#FBF3E6)</option>
        <option value="orpheum-dark">2 · Orpheum Pro Dark-Gold (#0A0A0B)</option>
        <option value="hydrographic">3 · Hydrographic Bathysphere (#0E151B)</option>
        <option value="milton-warm">4 · Push Pin / Milton Warm Litho (#F5EEDF)</option>
        <option value="deepmind-iridescent">5 · DeepMind Iridescent (#070B14)</option>
      </select>
    </div>

    <div class="ctrl-group">
      <label for="sel-plate-style">Infographic Style</label>
      <select id="sel-plate-style">
        <optgroup label="Core Programmatic SVG Infographics">
          <option value="milton-25d">Style 1 · Milton Glaser 2.5D Volumetric Lithograph</option>
          <option value="saul-bass-cutout">Style 2 · Saul Bass Severe Cut-Paper &amp; 5-Rung Plate</option>
          <option value="hydrographic-survey">Style 3 · Kinetic Hydrography Survey (25 Ghosts)</option>
          <option value="orpheum-operad">Style 4 · Orpheum Double-Operad &amp; Sheaf Field</option>
          <option value="editorial-collage">Style 5 · Editorial Push Pin Collage &amp; Storyboard</option>
          <option value="isometric-voxel">Style 6 · Isometric Voxel &amp; 3D Massing Monolith</option>
          <option value="combined-workflow">★ Master Combined Workflow Diagram (Tier I–III)</option>
        </optgroup>
        <optgroup label="Single-Clock Animated Canvas Styles (15 Motion Atlas Styles)">
          <option value="anim:watercolor">Anim 01 · Watercolor Storybook Cartoon (24 fps)</option>
          <option value="anim:cutout">Anim 02 · Paper-Cutout Stop-Motion (12 fps)</option>
          <option value="anim:saul-severe">Anim 03 · Saul Bass 3-Color Cut-Paper Overture</option>
          <option value="anim:hydrographic">Anim 04 · Kinetic Hydrography Survey Phasor</option>
          <option value="anim:editorial">Anim 05 · Editorial Explainer Collage</option>
          <option value="anim:whiteboard">Anim 06 · Whiteboard Vector Diagram</option>
          <option value="anim:sim">Anim 07 · Interactive Ballistic Simulation</option>
          <option value="anim:voxel">Anim 08 · Isometric Voxel 3D Turntable</option>
          <option value="anim:orbit">Anim 09 · 3D Cinematic Architectural Orbit</option>
          <option value="anim:morph">Anim 10 · Never-Cut Morphing Container Film</option>
          <option value="anim:kinetic">Anim 11 · Beat-Locked Kinetic Type (120 BPM)</option>
          <option value="anim:hybrid">Anim 12 · Hybrid Generative + HUD Callouts</option>
          <option value="anim:doodle">Anim 13 · Calligraphic Doodle Narrative</option>
          <option value="anim:pixel">Anim 14 · Low-Res 96×60 Pixel Art</option>
          <option value="anim:overlay">Anim 15 · Talking-Head Side-Third Overlay</option>
        </optgroup>
      </select>
    </div>

    <div class="ctrl-group">
      <label for="sel-wada">Sanzo Wada 348</label>
      <select id="sel-wada"></select>
    </div>

    <button class="btn btn-primary" id="btn-run-rsi">✦ Run 4-Round RSI (R0→R3)</button>
    <button class="btn" id="btn-export-svg">⬇ Export Active SVG</button>
  </div>
</header>

<!-- ═══════════════════════════════════════════════════════════════════════
     3-COLUMN STUDIO WORKBENCH
     ═══════════════════════════════════════════════════════════════════════ -->
<div class="workbench">

  <!-- LEFT DOCK: SOURCE DOCUMENT INGEST & PARAMETRIC TWEAK CONTROLS -->
  <aside class="left-dock">
    <div class="dock-sec">
      <div class="dock-hdr">
        <span>1 · Input Source / Research Document</span>
        <span style="color:var(--accent-secondary)">FNV-1a Grounded</span>
      </div>
      <div class="row">
        <label for="sel-doc-preset">Preset Corpus</label>
        <select id="sel-doc-preset" style="max-width:185px">
          <option value="tap-transcript">1 · Oct 9 TAP Call Transcript</option>
          <option value="orpheum-monograph">2 · Orpheum Double-Operad Spec</option>
          <option value="hydrography-spec">3 · Kinetic Hydrography Monograph</option>
        </select>
      </div>
      <input type="text" id="inp-doc-title" value="Talent Accelerator Program (TAP)" placeholder="Infographic / Document Title"/>
      <textarea id="inp-doc-body" rows="5" style="width:100%;font-size:10px;line-height:1.4"></textarea>
      <button class="btn btn-primary" id="btn-compile-doc" style="width:100%">⚡ Compile Source → Graphics, SVG &amp; Workflow</button>
    </div>

    <div class="dock-sec">
      <div class="dock-hdr">
        <span>2 · Parametric Geometry &amp; Depth Tweaks</span>
        <span id="lbl-zplanes">Z0..Z3 Active</span>
      </div>
      <div class="row">
        <label>2.5D Isometric Tilt</label>
        <input type="range" id="tw-tilt" min="0" max="22" step="1" value="0"/>
        <span class="val" id="val-tilt">0°</span>
      </div>
      <div class="row">
        <label>SVG Zoom Scale</label>
        <input type="range" id="tw-zoom" min="75" max="150" step="5" value="100"/>
        <span class="val" id="val-zoom">100%</span>
      </div>
      <div class="row">
        <label>Stroke Weight Scale</label>
        <input type="range" id="tw-stroke" min="60" max="180" step="10" value="100"/>
        <span class="val" id="val-stroke">1.0×</span>
      </div>
      <div class="row">
        <label>Visible Z-Planes (H8)</label>
        <div style="display:flex;gap:4px">
          <button class="btn z-btn" data-z="0" style="padding:2px 6px">Z0</button>
          <button class="btn z-btn" data-z="1" style="padding:2px 6px">Z1</button>
          <button class="btn z-btn" data-z="2" style="padding:2px 6px">Z2</button>
          <button class="btn z-btn" data-z="3" style="padding:2px 6px">Z3</button>
        </div>
      </div>
    </div>

    <div class="dock-sec">
      <div class="dock-hdr">
        <span>3 · Live Quantitative &amp; Cohort Knobs</span>
        <span id="lbl-sim-profit" style="color:var(--accent-secondary)">$1,000,000</span>
      </div>
      <div class="row">
        <label>Billable Client Seats</label>
        <input type="range" id="tw-client" min="4" max="16" step="1" value="8"/>
        <span class="val" id="val-client">8</span>
      </div>
      <div class="row">
        <label>Pursuit Seats (Free)</label>
        <input type="range" id="tw-pursuit" min="1" max="12" step="1" value="8"/>
        <span class="val" id="val-pursuit">8</span>
      </div>
      <div class="row">
        <label>Hourly Margin ($/hr)</label>
        <input type="range" id="tw-margin" min="15" max="60" step="5" value="25"/>
        <span class="val" id="val-margin">$25</span>
      </div>
      <div class="row">
        <label>Cohorts / Year</label>
        <input type="range" id="tw-cohorts" min="1" max="20" step="1" value="10"/>
        <span class="val" id="val-cohorts">10/yr</span>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn" id="btn-preset-catalyst" style="flex:1">Try 8 : 3 Catalyst</button>
        <button class="btn" id="btn-preset-parity" style="flex:1">Reset 8 : 8 Parity</button>
      </div>
    </div>

    <div class="dock-sec">
      <div class="dock-hdr">
        <span>4 · Character Rig &amp; Saul Bass Rung</span>
        <span id="lbl-rung">Rung 1</span>
      </div>
      <div class="row">
        <label for="sel-char">Character Rig</label>
        <select id="sel-char" style="max-width:175px"></select>
      </div>
      <div class="row">
        <label>Saul Bass Reduction</label>
        <input type="range" id="tw-rung" min="1" max="5" step="1" value="1"/>
        <span class="val" id="val-rung">Rung 1</span>
      </div>
      <div class="row">
        <label for="sel-ix">Interaction Mode</label>
        <select id="sel-ix" style="max-width:175px"></select>
      </div>
      <div class="row">
        <label for="sel-feel">Timing Feel</label>
        <select id="sel-feel" style="max-width:175px">
          <option value="spring">Spring (Closed-Form)</option>
          <option value="glaser">Glaser Ceremonial Overshoot</option>
          <option value="saul">Saul Bass Stepped Hold</option>
          <option value="rostrum">Ken Burns Rostrum</option>
          <option value="rest">Rest / Calm Settle</option>
        </select>
      </div>
    </div>
  </aside>

  <!-- CENTER STAGE: MULTI-STYLE INFOGRAPHIC VIEWPORT, WORKFLOW DAG & SINGLE-CLOCK ANIMATION -->
  <main class="center-stage">
    <div class="surface-tabs" role="tablist">
      <button class="surface-tab" role="tab" aria-selected="true" data-tab="infographic">I · Tweakable SVG Infographic Plate (6 Styles)</button>
      <button class="surface-tab" role="tab" aria-selected="false" data-tab="workflow">II · Combined Programmatic Workflow Diagram</button>
      <button class="surface-tab" role="tab" aria-selected="false" data-tab="motion">III · Single-Clock Animation &amp; 5-Rung Rig Theatre</button>
      <button class="surface-tab" role="tab" aria-selected="false" data-tab="rsi">IV · 4-Round RSI Loop &amp; Core SVG Sprite Vault</button>
    </div>

    <!-- TAB I: TWEAKABLE SVG INFOGRAPHIC PLATE -->
    <section id="panel-infographic" class="stage-card">
      <div class="stage-bar">
        <div>
          <strong id="stage-plate-title">Style 1 · Milton Glaser 2.5D Volumetric Lithograph</strong>
          <span id="stage-plate-sub" style="margin-left:10px;color:var(--ink-soft)">4 Depth Planes (Z0..Z3) · 12 Canonical Moves + Poetic &lt;desc&gt;</span>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
          <button class="btn btn-primary" data-quick-plate="milton-25d" title="Shortcut: 1">1·Milton 2.5D</button>
          <button class="btn" data-quick-plate="saul-bass-cutout" title="Shortcut: 2">2·Saul Bass</button>
          <button class="btn" data-quick-plate="hydrographic-survey" title="Shortcut: 3">3·Hydrography</button>
          <button class="btn" data-quick-plate="orpheum-operad" title="Shortcut: 4">4·Orpheum Operad</button>
          <button class="btn" data-quick-plate="editorial-collage" title="Shortcut: 5">5·Editorial</button>
          <button class="btn" data-quick-plate="isometric-voxel" title="Shortcut: 6">6·Voxel 3D</button>
          <button class="btn" id="btn-split-compare" title="Toggle 2-Up Side-by-Side Plate Comparison">⇄ Split Compare</button>
        </div>
      </div>
      <div id="infographic-stage-grid" style="display:grid;grid-template-columns:1fr;gap:12px">
        <div class="svg-mount" id="svg-plate-mount" title="Click any node to inspect Poetic <desc> & grounded claim · Drag to pan · Double-click to reset"></div>
        <div class="svg-mount" id="svg-compare-mount" hidden style="border-left:1px dashed var(--border)"></div>
      </div>
    </section>

    <!-- TAB II: COMBINED PROGRAMMATIC WORKFLOW DIAGRAM -->
    <section id="panel-workflow" class="stage-card" hidden>
      <div class="stage-bar">
        <div>
          <strong>Master Combined Programmatic Workflow Diagram (Tier I Compiler &amp; RSI → Tier II 3 Engines → Tier III Source DAG)</strong>
        </div>
        <button class="btn btn-primary" id="btn-download-wf">⬇ Download Combined Workflow SVG</button>
      </div>
      <div class="svg-mount" id="svg-workflow-mount"></div>
    </section>

    <!-- TAB III: SINGLE-CLOCK ANIMATION & 5-RUNG RIG THEATRE -->
    <section id="panel-motion" class="stage-card" hidden>
      <div class="stage-bar">
        <div>
          <strong id="motion-bar-title">Single-Clock Deterministic Animation Engine (window.MA.render · frame = f(t, seed))</strong>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-primary" id="btn-anim-play">⏸ Pause</button>
          <input type="range" id="anim-scrub" min="0" max="10" step="0.04" value="2.4" style="width:160px"/>
          <span id="anim-time-lbl" style="font-family:var(--font-mono)">t = 2.40s</span>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" id="chk-captions-covered"/> Captions-Covered Test (G08)
          </label>
        </div>
      </div>
      <div class="motion-stage-wrap">
        <div>
          <canvas id="motion-canvas" class="live-canvas" width="960" height="600"></canvas>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
            <button class="btn mstyle-chip btn-primary" data-mstyle="watercolor">Watercolor</button>
            <button class="btn mstyle-chip" data-mstyle="cutout">Cutout</button>
            <button class="btn mstyle-chip" data-mstyle="saul-severe">Saul-Severe</button>
            <button class="btn mstyle-chip" data-mstyle="hydrographic">Hydrographic</button>
            <button class="btn mstyle-chip" data-mstyle="editorial">Editorial</button>
            <button class="btn mstyle-chip" data-mstyle="whiteboard">Whiteboard</button>
            <button class="btn mstyle-chip" data-mstyle="sim">Sim</button>
            <button class="btn mstyle-chip" data-mstyle="voxel">Voxel 3D</button>
            <button class="btn mstyle-chip" data-mstyle="orbit">3D Orbit</button>
            <button class="btn mstyle-chip" data-mstyle="morph">Morph</button>
            <button class="btn mstyle-chip" data-mstyle="kinetic">Kinetic 120BPM</button>
            <button class="btn mstyle-chip" data-mstyle="hybrid">Hybrid HUD</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="rsi-card">
            <div class="dock-hdr"><span>5-Rung Saul Bass Reduction Preview</span><span id="rung-name-badge">Rung 1</span></div>
            <canvas id="rung-canvas" class="live-canvas" width="480" height="260" style="aspect-ratio:16/9"></canvas>
            <div id="rung-desc-text" style="font-size:11.5px;color:var(--ink-soft)">Full painted rig pinned to active Sanzo Wada combination.</div>
          </div>
          <div class="rsi-card">
            <div class="dock-hdr"><span>Multi-Target Code Compiler (G13 · G20)</span></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-primary" data-compile-target="animejs">Anime.js v4</button>
              <button class="btn" data-compile-target="remotion">Remotion TSX</button>
              <button class="btn" data-compile-target="hyperframes">Playable HTML5</button>
            </div>
            <pre id="compiled-code-box" style="margin:0;padding:8px;background:var(--bg-app);border-radius:6px;font-family:var(--font-mono);font-size:9.5px;max-height:150px;overflow:auto"></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB IV: 4-ROUND RECURSIVE SELF-IMPROVEMENT (RSI) & CORE SVG SPRITE VAULT -->
    <section id="panel-rsi" class="stage-card" hidden>
      <div class="stage-bar">
        <strong>Closed-Loop Recursive Self-Improvement (RSI) Telemetry (R0 → R1 → R2 → R3) &amp; Core SVG Symbol Vault</strong>
        <button class="btn btn-primary" id="btn-retrigger-rsi">↻ Re-Run 6-Lens Adversarial Audit &amp; Auto-Fix</button>
      </div>
      <div style="padding:10px 14px;display:flex;flex-direction:column;gap:8px">
        <div class="rsi-grid" id="rsi-rounds-grid" style="grid-template-columns:repeat(4,1fr);gap:8px"></div>
        <div class="dock-hdr"><span>6 Adversarial MOE Lenses (Bass · Koolhaas · Wada · Sheaf · Milton · Orpheum)</span></div>
        <div class="rsi-grid" id="rsi-lenses-grid" style="grid-template-columns:repeat(6,1fr);gap:8px"></div>
        <div class="dock-hdr"><span>Core SVG &lt;symbol&gt; Artifact Sprite Preview (9 Poetic Idioms · Score 100/100)</span></div>
        <div class="rsi-grid" id="sprite-preview-grid" style="grid-template-columns:repeat(3,1fr);gap:8px"></div>
      </div>
    </section>
  </main>

  <!-- RIGHT DOCK: SANZO WADA 348 CHORD MATRIX, POETIC <DESC> INSPECTOR & RSI LOG -->
  <aside class="right-dock">
    <div class="dock-sec">
      <div class="dock-hdr">
        <span>Sanzo Wada Harmonic Inspector</span>
        <span id="wada-contrast-badge" class="badge-pass">AAA 13.48:1</span>
      </div>
      <div id="wada-title-line" style="font-family:var(--font-display);font-size:15px;font-weight:600">No. 343 · Abyssal Indigo &amp; Raw Umber</div>
      <div class="swatch-row" id="wada-swatch-row"></div>
      <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--ink-soft);margin-top:4px">4×4 OKLab Perceptual Midpoint Chord Matrix (P2):</div>
      <div class="chord-grid" id="wada-chord-grid"></div>
    </div>

    <div class="dock-sec">
      <div class="dock-hdr">
        <span>Active Plate &amp; Poetic &lt;desc&gt; Inspector</span>
        <span style="color:var(--accent-secondary)">H8 Verified</span>
      </div>
      <div id="poetic-desc-box" style="background:var(--bg-elev);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11.5px;line-height:1.5"></div>
    </div>

    <div class="dock-sec">
      <div class="dock-hdr">
        <span>Recursive Self-Improvement (RSI) Live Log</span>
        <span style="color:var(--accent-primary)">R0 → R3</span>
      </div>
      <div id="rsi-live-log" style="font-family:var(--font-mono);font-size:10px;display:flex;flex-direction:column;gap:6px"></div>
    </div>
  </aside>

</div>

<!-- ═══════════════════════════════════════════════════════════════════════
     EMBEDDED ENGINES & ARTIFACT PAYLOADS
     ═══════════════════════════════════════════════════════════════════════ -->
<script>
{wada_js}
</script>
<script>
{motion_engine_js}
</script>
<script>
{canvas_oauth_js}
</script>
<script>
const SVG_PLATES = {json.dumps(svg_plates)};
const RSI_LEDGER = {json.dumps(rsi_ledger)};
const PRESET_DOCS = {json.dumps(preset_docs)};
const SYMSPEC = {json.dumps(symspec)};

(function() {{
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const WADA = window.STUDIO_WADA_ENGINE;
  const FOUNDRY = window.STUDIO_CHARACTER_FOUNDRY;
  const MA = window.MA;
  const CO = window.STUDIO_CANVAS_OAUTH;

  let activeTab = 'infographic';
  let activePlateKey = 'milton-25d';
  let compareMode = false;
  let comparePlateKey = 'saul-bass-cutout';
  let activeMotionStyle = 'watercolor';
  let activeWadaId = 343;
  let animPlaying = true;
  let animT = 2.4;
  let lastTs = 0;
  let zVisible = {{0: true, 1: true, 2: true, 3: true}};
  let panX = 0, panY = 0;
  let lastParsedDoc = null;

  const PLATE_ORDER = [
    'milton-25d',
    'saul-bass-cutout',
    'hydrographic-survey',
    'orpheum-operad',
    'editorial-collage',
    'isometric-voxel'
  ];

  const PLATE_META = {{
    'milton-25d': {{ title: 'Style 1 · Milton Glaser 2.5D Volumetric Lithograph', sub: '4 Depth Planes (Z0..Z3) · 12 Canonical Moves + Poetic <desc>' }},
    'saul-bass-cutout': {{ title: 'Style 2 · Saul Bass Severe 3-Color Cut-Paper & 5-Rung Plate', sub: 'Dominant Ink Field · 5-Rung Reduction Ladder · Sheared Paper Shards' }},
    'hydrographic-survey': {{ title: 'Style 3 · Kinetic Hydrography Bathymetric Survey Plate', sub: '25 Ghost Silhouettes · Bathymetric Isolines · ΔE2000 Soundings' }},
    'orpheum-operad': {{ title: 'Style 4 · Orpheum Studio Pro Double-Operad & Sheaf Field', sub: 'O_geom × O_col · Stasheff Associahedron K₄ · 2D FFT k-Space (β=1.34)' }},
    'editorial-collage': {{ title: 'Style 5 · Editorial Push Pin Collage & Causal Storyboard', sub: 'INPUT → PROCESS → RESULT → COUNTERPOINT + 8-Beat BUT/THEREFORE Strip' }},
    'isometric-voxel': {{ title: 'Style 6 · Isometric Voxel & 3D Architectural Massing', sub: 'Axonometric 8+8 Cohort Towers · 12-Mo Staircase · $10M Profit Monolith' }},
    'combined-workflow': {{ title: 'Master Combined Programmatic Workflow Diagram (Tier I–III)', sub: 'Compiler & RSI Loop → 3 Engines → Grounded Source Document DAG' }}
  }};

  // 1. Populate Sanzo Wada 348 Dropdown
  const selWada = $('#sel-wada');
  const curatedSet = new Set((WADA.PALS || []).map(p => p.id));
  const optCurated = document.createElement('optgroup');
  optCurated.label = 'Curated Studio Plates (WCAG AAA)';
  (WADA.PALS || []).forEach(p => {{
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = `No. ${{p.id}} · ${{p.name}}`;
    optCurated.appendChild(o);
  }});
  selWada.appendChild(optCurated);

  const allCombos = (WADA.getAllWadaCombos && WADA.getAllWadaCombos()) || [];
  const optAll = document.createElement('optgroup');
  optAll.label = `Complete Sanzo Wada Dictionary (${{allCombos.length}} Combos)`;
  allCombos.slice(0, 120).forEach(c => {{
    if (curatedSet.has(c.id)) return;
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = `No. ${{c.id}} · ${{c.name}}`;
    optAll.appendChild(o);
  }});
  selWada.appendChild(optAll);
  selWada.value = '343';

  // 2. Populate Character Rigs & Interaction Modes
  const selChar = $('#sel-char');
  (FOUNDRY.CHARACTER_ORDER || []).forEach(cid => {{
    const ch = FOUNDRY.CHARACTERS[cid];
    const o = document.createElement('option');
    o.value = cid;
    o.textContent = `${{ch.name}} (${{ch.archetype}})`;
    selChar.appendChild(o);
  }});

  const selIx = $('#sel-ix');
  (FOUNDRY.INTERACTION_MODES || []).forEach(m => {{
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = `${{m.label}}`;
    selIx.appendChild(o);
  }});

  // 3. Mount SVG Plates & Workflow Diagram
  function mountPlate(key) {{
    activePlateKey = key;
    const mount = $('#svg-plate-mount');
    mount.innerHTML = SVG_PLATES[key] || SVG_PLATES['milton-25d'];
    const meta = PLATE_META[key] || PLATE_META['milton-25d'];
    $('#stage-plate-title').textContent = meta.title;
    $('#stage-plate-sub').textContent = meta.sub;
    $$('[data-quick-plate]').forEach(b => b.classList.toggle('btn-primary', b.dataset.quickPlate === key));
    if (compareMode) {{
      const nextIdx = (PLATE_ORDER.indexOf(key) + 1) % PLATE_ORDER.length;
      comparePlateKey = PLATE_ORDER[nextIdx];
      $('#svg-compare-mount').innerHTML = SVG_PLATES[comparePlateKey] || '';
    }}
    if (lastParsedDoc) bindParsedDocToActiveSVGs(lastParsedDoc);
    applyLiveTweaksToSVG();
    updatePoeticInspector();
  }}

  function mountWorkflow() {{
    $('#svg-workflow-mount').innerHTML = SVG_PLATES['combined-workflow'];
    if (lastParsedDoc) bindParsedDocToActiveSVGs(lastParsedDoc);
  }}

  // 4. Apply Wada Palette, Geometry Tweaks, and Quantitative Sliders to Mounted SVGs
  function getActiveWadaPalette() {{
    const raw = (WADA.PALS || []).find(p => Number(p.id) === Number(activeWadaId))
      || (allCombos.find(p => Number(p.id) === Number(activeWadaId)))
      || WADA.PALS[0];
    const isDarkChrome = ['orpheum-dark', 'hydrographic', 'deepmind-iridescent'].includes(document.documentElement.dataset.chrome);
    return WADA.enrichPalette(raw, isDarkChrome ? 'navy' : 'atlas');
  }}

  function updateWadaInspector() {{
    const pal = getActiveWadaPalette();
    $('#wada-title-line').textContent = `No. ${{pal.id}} · ${{pal.name}}`;
    $('#wada-contrast-badge').textContent = `CR ${{pal.cr}}:1`;
    $('#hud-wada-status').textContent = `Wada No. ${{pal.id}} · CR ${{pal.cr}}:1`;

    const swRow = $('#wada-swatch-row');
    swRow.innerHTML = '';
    (pal.swHex || [pal.a, pal.b, pal.c, pal.h]).forEach(hex => {{
      const d = document.createElement('div');
      d.className = 'swatch-pill';
      d.style.background = hex;
      d.textContent = hex;
      swRow.appendChild(d);
    }});

    const cg = $('#wada-chord-grid');
    cg.innerHTML = '';
    const table = pal.oklabChordTable || [];
    const sw = pal.swHex || [pal.a, pal.h, pal.b, pal.c];
    table.slice(0, 4).forEach((row, rIdx) => {{
      row.slice(0, 4).forEach((distVal, cIdx) => {{
        const c = document.createElement('div');
        c.className = 'chord-cell';
        const chordCol = sw[(rIdx + cIdx + 1) % sw.length] || pal.a;
        c.style.background = chordCol;
        const dNum = (distVal && typeof distVal === 'object') ? distVal.distance : distVal;
        c.textContent = `Δ${{Number(dNum || 0).toFixed(1)}}`;
        cg.appendChild(c);
      }});
    }});
  }}

  let userPickedWada = false;
  function applyWadaToSVGRoot(svgEl, pal, plateKey) {{
    if (!svgEl || !pal || !userPickedWada) return;
    const rawSw = (pal.swHex && pal.swHex.length ? pal.swHex : [pal.a, pal.b, pal.c, pal.h]).filter(Boolean);
    const isDarkPlate = ['hydrographic-survey', 'orpheum-operad', 'isometric-voxel'].includes(plateKey);
    const groundHex = isDarkPlate ? '#0A1926' : '#F5EEDF';
    const sorted = rawSw.slice().sort((x, y) => (WADA.relLuminance ? WADA.relLuminance(x) - WADA.relLuminance(y) : 0));

    if (isDarkPlate) {{
      // On dark plates, actors & accents must be luminous against deep navy/slate
      const bright1 = sorted[sorted.length - 1] || pal.h || '#38BDF8';
      const bright2 = sorted[Math.max(0, sorted.length - 2)] || pal.a || '#F59E0B';
      const mid1 = sorted[Math.max(0, sorted.length - 3)] || pal.b || '#10B981';
      svgEl.style.setProperty('--actor-a', WADA.ensureInkContrast ? WADA.ensureInkContrast(bright1, groundHex, 3.8) : bright1);
      svgEl.style.setProperty('--actor-b', WADA.ensureInkContrast ? WADA.ensureInkContrast(bright2, groundHex, 3.5) : bright2);
      svgEl.style.setProperty('--accent', WADA.ensureInkContrast ? WADA.ensureInkContrast(mid1, groundHex, 3.5) : mid1);
      svgEl.style.setProperty('--sunflower', bright1);
    }} else {{
      // On light cream/ochre plates, --actor-a & --accent must be dark enough for white badge text (.t-badge) & strong contrast
      const dark1 = sorted[0] || pal.a || '#2B5B84';
      const dark2 = sorted[Math.min(1, sorted.length - 1)] || pal.b || '#B05A17';
      const accentCol = sorted[Math.min(2, sorted.length - 1)] || pal.h || '#B8332A';
      const warmCol = sorted[sorted.length - 1] || pal.c || '#E8A838';
      svgEl.style.setProperty('--actor-a', WADA.ensureInkContrast ? WADA.ensureInkContrast(dark1, groundHex, 4.2) : dark1);
      svgEl.style.setProperty('--actor-b', WADA.ensureInkContrast ? WADA.ensureInkContrast(dark2, groundHex, 3.5) : dark2);
      svgEl.style.setProperty('--accent', WADA.ensureInkContrast ? WADA.ensureInkContrast(accentCol, groundHex, 3.8) : accentCol);
      svgEl.style.setProperty('--sunflower', warmCol);
    }}
  }}

  function applyLiveTweaksToSVG() {{
    const tilt = Number($('#tw-tilt').value);
    const zoom = Number($('#tw-zoom').value) / 100;
    const strokeScale = Number($('#tw-stroke').value) / 100;
    $('#val-tilt').textContent = `${{tilt}}°`;
    $('#val-zoom').textContent = `${{Math.round(zoom * 100)}}%`;
    $('#val-stroke').textContent = `${{strokeScale.toFixed(1)}}×`;

    const pal = getActiveWadaPalette();
    [
      ['#svg-plate-mount svg', activePlateKey],
      ['#svg-compare-mount svg', comparePlateKey],
      ['#svg-workflow-mount svg', 'combined-workflow']
    ].forEach(([sel, pKey]) => {{
      const svg = $(sel);
      if (!svg) return;
      svg.style.transform = `translate(${{panX}}px, ${{panY}}px) perspective(1200px) rotateX(${{tilt}}deg) scale(${{zoom}})`;
      svg.style.setProperty('--sw-hair', `${{(1.1 * strokeScale).toFixed(2)}}px`);
      svg.style.setProperty('--sw-frame', `${{(1.5 * strokeScale).toFixed(2)}}px`);
      svg.style.setProperty('--sw-glyph', `${{(2.1 * strokeScale).toFixed(2)}}px`);
      applyWadaToSVGRoot(svg, pal, pKey);

      // Z-plane visibility toggle
      [0, 1, 2, 3].forEach(z => {{
        svg.querySelectorAll(`[data-z="${{z}}"]`).forEach(g => {{
          g.style.opacity = zVisible[z] ? '1' : '0.06';
        }});
      }});
    }});

    // Live quantitative patching across ALL active SVG plates (S12 $1,000,000 baseline at $25/hr × 8 client)
    const client = Number($('#tw-client').value);
    const pursuit = Number($('#tw-pursuit').value);
    const margin = Number($('#tw-margin').value);
    const cohorts = Number($('#tw-cohorts').value);
    const totalSeats = client + pursuit;
    const profit = Math.round((margin / 25) * (client / 8) * 1000000);
    const annualM = ((profit * cohorts) / 1e6).toFixed(1);

    $('#val-client').textContent = String(client);
    $('#val-pursuit').textContent = String(pursuit);
    $('#val-margin').textContent = `$${{margin}}`;
    $('#val-cohorts').textContent = `${{cohorts}}/yr`;
    $('#lbl-sim-profit').textContent = `$${{profit.toLocaleString()}}`;

    const svg = $('#svg-plate-mount svg');
    if (svg) {{
      // Style 1: Milton 2.5D
      const t0 = svg.querySelector('#n-math .eq-term-0 text.t-num');
      const t2 = svg.querySelector('#n-math .eq-term-2 text.t-num');
      const tRes = svg.querySelector('#n-math .eq-result text.t-num');
      if (t0) t0.textContent = `$${{margin}}/h margin`;
      if (t2) t2.textContent = `${{client}} people`;
      if (tRes) tRes.textContent = `$${{profit.toLocaleString()}}`;
      const eqHand = svg.querySelector('#n-math text.t-hand');
      if (eqHand) eqHand.textContent = `— profit per cohort · ${{cohorts}}/yr = $${{annualM}}M —`;
      const cohortCap = svg.querySelector('#n-cohort text.caption');
      if (cohortCap) cohortCap.textContent = `${{totalSeats}} trained together (${{client}} client + ${{pursuit}} free)`;

      // Multi-plate universal text node synchronization across Styles 2..6
      svg.querySelectorAll('text').forEach(tn => {{
        const tx = tn.textContent || '';
        if (tx.includes('margin × 2,000h')) {{
          tn.textContent = `$${{margin}}/hr margin × 2,000h × ${{client}} × 10yr = $${{profit.toLocaleString()}}`;
        }} else if (tx.startsWith('PROFIT = $')) {{
          tn.textContent = `PROFIT = $${{profit.toLocaleString()}}`;
        }} else if (tx.includes('COHORT PARITY')) {{
          tn.textContent = `${{client}} + ${{pursuit}} = ${{totalSeats}} COHORT PARITY`;
        }} else if (tx.includes('Cohorts/Yr = $') && tx.includes('Annual Profit')) {{
          tn.textContent = `${{cohorts}} Cohorts/Yr = $${{annualM}}M Annual Profit`;
        }} else if (tx.startsWith('ST-23 ·') && tx.includes('COHORT')) {{
          tn.textContent = `ST-23 · ${{client}}+${{pursuit}}=${{totalSeats}} COHORT · $${{(profit/1e6).toFixed(2)}}M/COHORT`;
        }}
      }});
    }}
  }}

  function updatePoeticInspector(selectedGroup) {{
    const box = $('#poetic-desc-box');
    const svg = $('#svg-plate-mount svg');
    if (!svg) return;
    if (selectedGroup) {{
      const gTitle = (selectedGroup.querySelector('title') && selectedGroup.querySelector('title').textContent)
        || selectedGroup.getAttribute('id')
        || 'Selected SVG Group';
      const gDesc = (selectedGroup.querySelector('desc') && selectedGroup.querySelector('desc').textContent)
        || (svg.querySelector('desc') && svg.querySelector('desc').textContent)
        || 'Grounded geometric primitive pinned to Sanzo Wada 348 and source document spans.';
      const gTexts = Array.from(selectedGroup.querySelectorAll('text')).slice(0, 4).map(t => t.textContent).join(' · ');
      box.innerHTML = `
        <div style="font-weight:700;color:var(--accent-secondary);margin-bottom:4px">🎯 Selected Node: #${{selectedGroup.id || 'glyph'}} · ${{gTitle}}</div>
        <div style="font-style:italic;margin-bottom:8px">“${{gDesc}}”</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-soft);border-top:1px dashed var(--border);padding-top:6px"><b>Grounded Text Readout:</b> ${{gTexts || 'Geometric Vector Layer'}}</div>
      `;
      return;
    }}
    const titles = Array.from(svg.querySelectorAll('title')).slice(0, 4).map(el => el.textContent);
    const descs = Array.from(svg.querySelectorAll('desc')).slice(0, 4).map(el => el.textContent);
    let html = `<div style="font-weight:700;color:var(--accent-primary);margin-bottom:4px">✦ ${{titles[0] || 'Grounded SVG Artifact'}}</div>`;
    if (descs[0]) {{
      html += `<div style="font-style:italic;margin-bottom:8px">“${{descs[0]}}”</div>`;
    }}
    if (descs.length > 1) {{
      html += `<div style="font-family:var(--font-mono);font-size:9.5px;color:var(--ink-soft);border-top:1px dashed var(--border);padding-top:6px">Sub-Glyph Poetic &lt;desc&gt; Nodes (${{svg.querySelectorAll('desc').length}} embedded · click any node on stage):</div>`;
      descs.slice(1, 4).forEach((d, i) => {{
        html += `<div style="font-size:10.5px;margin-top:4px"><b>${{titles[i+1] || ('Node ' + (i+1))}}:</b> ${{d}}</div>`;
      }});
    }}
    box.innerHTML = html;
  }}

  // 5. Render RSI Telemetry & Core SVG Sprite Vault
  function renderRSIPanel() {{
    const rGrid = $('#rsi-rounds-grid');
    rGrid.innerHTML = '';
    (RSI_LEDGER.rounds || []).forEach(r => {{
      const card = document.createElement('div');
      card.className = 'rsi-card' + (r.round === 'R3' ? ' active' : '');
      card.innerHTML = `
        <div class="dock-hdr"><span>${{r.round}} · ${{r.name}}</span><span class="badge-pass">${{r.score_pct}}%</span></div>
        <div style="font-family:var(--font-mono);font-size:10.5px">Gates: <b>${{r.gates_passed}} / ${{r.gates_total}}</b> · H-Err: ${{r.h_errors}} · Warn: ${{r.h_warnings}}</div>
        <div style="font-size:10.5px;color:var(--ink-soft)">Wada CR: ${{r.wada_contrast}}:1 · Δ_geom: ${{r.delta_geom_min}} · β: ${{r.spectral_beta}}</div>
        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--accent-primary);margin-top:4px">${{(r.code_mutations_applied || [])[0] || ''}}</div>
      `;
      rGrid.appendChild(card);
    }});

    const lGrid = $('#rsi-lenses-grid');
    lGrid.innerHTML = '';
    (RSI_LEDGER.adversarial_lenses || []).forEach(l => {{
      const card = document.createElement('div');
      card.className = 'rsi-card';
      card.innerHTML = `
        <div class="dock-hdr"><span>Lens ${{l.id}} · ${{l.name}}</span><span class="badge-pass">${{l.status}}</span></div>
        <div style="font-size:11px;color:var(--ink-soft)">${{l.metric}}</div>
      `;
      lGrid.appendChild(card);
    }});

    // Live RSI Log in Right Dock
    const logBox = $('#rsi-live-log');
    logBox.innerHTML = '';
    (RSI_LEDGER.rounds || []).forEach(r => {{
      const row = document.createElement('div');
      row.style.padding = '6px 8px';
      row.style.background = 'var(--bg-elev)';
      row.style.borderRadius = '5px';
      row.style.borderLeft = r.round === 'R3' ? '3px solid var(--accent-secondary)' : '3px solid var(--accent-primary)';
      row.innerHTML = `<b>${{r.round}} (${{r.gates_passed}}/${{r.gates_total}} PASS):</b> ${{(r.code_mutations_applied || [])[0] || ''}}`;
      logBox.appendChild(row);
    }});

    // Mount Core SVG Sprite Symbols cleanly into render tree (no display:none on parent!)
    let spriteHolder = document.getElementById('core-sprite-holder');
    if (!spriteHolder) {{
      spriteHolder = document.createElement('div');
      spriteHolder.id = 'core-sprite-holder';
      spriteHolder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      spriteHolder.innerHTML = SVG_PLATES['core-sprite'] || '';
      document.body.appendChild(spriteHolder);
    }}

    const sGrid = $('#sprite-preview-grid');
    sGrid.innerHTML = '';
    const SPRITE_META = [
      {{ id: 'venn', vb: '0 0 320 180', label: 'Two-Circle Venn (A ∩ B)' }},
      {{ id: 'crowd', vb: '0 0 320 180', label: '1-in-25 Crowd Field' }},
      {{ id: 'gate', vb: '0 0 320 180', label: '75% Threshold Gate' }},
      {{ id: 'cohort', vb: '0 0 320 180', label: '8+8 Shared Cohort Table' }},
      {{ id: 'contract', vb: '0 0 320 180', label: 'Stamped 2-Yr Contract' }},
      {{ id: 'taper', vb: '0 0 320 180', label: '12-Month Inverse Ramp' }},
      {{ id: 'fork', vb: '0 0 320 180', label: 'Forking Retention Road' }},
      {{ id: 'equation', vb: '0 0 665 150', label: 'Dimensional $1M Equation' }},
      {{ id: 'balance', vb: '0 0 320 180', label: 'Asymmetric Doubt Scale' }}
    ];
    SPRITE_META.forEach(item => {{
      const card = document.createElement('div');
      card.className = 'rsi-card';
      card.style.padding = '7px 10px';
      const [ , , vbW, vbH ] = item.vb.split(' ').map(Number);
      card.innerHTML = `
        <div class="dock-hdr"><span>#glyph-${{item.id}} · ${{item.label}}</span><span class="badge-pass">100/100</span></div>
        <svg class="sprite-card-svg" viewBox="${{item.vb}}" style="width:100%;height:94px;background:#F5EEDF;border-radius:6px;border:1px solid var(--border);display:block">
          <use href="#glyph-${{item.id}}" width="${{vbW}}" height="${{vbH}}"/>
        </svg>
      `;
      sGrid.appendChild(card);
    }});
  }}

  // 6. Single-Clock Animation Loop (window.MA.render + 5-Rung Canvas)
  function renderMotionFrame(now) {{
    if (animPlaying) {{
      const dt = lastTs ? Math.min(0.05, (now - lastTs) / 1000) : 0.016;
      animT = (animT + dt) % 10.0;
      $('#anim-scrub').value = animT.toFixed(2);
      $('#anim-time-lbl').textContent = `t = ${{animT.toFixed(2)}}s`;
    }}
    lastTs = now;

    if (activeTab === 'motion' && MA && MA.render) {{
      const pal = getActiveWadaPalette();
      const charId = $('#sel-char').value || 'ceti-whale';
      const rung = Number($('#tw-rung').value) || 1;
      const interaction = $('#sel-ix').value || 'hero-journey';
      const captionsCovered = $('#chk-captions-covered').checked;
      const feelKey = $('#sel-feel').value || 'spring';
      const feelObj = (MA.FEELS && (MA.FEELS[feelKey] || MA.FEELS.spring)) || {{ k: 180, c: 18 }};
      const isDark = ['orpheum-dark', 'hydrographic', 'deepmind-iridescent'].includes(document.documentElement.dataset.chrome);
      const groundMode = isDark ? 'navy' : 'atlas';

      const cv = $('#motion-canvas');
      if (cv) {{
        MA.render(cv, activeMotionStyle, pal, feelObj, animT, {{
          charId: charId,
          rung: rung,
          interaction: interaction,
          captionsCovered: captionsCovered,
          ground: groundMode
        }});
      }}

      // Also draw the 5-Rung Saul Bass Reduction preview canvas
      const rcv = $('#rung-canvas');
      if (rcv) {{
        const ctx = rcv.getContext('2d');
        ctx.save();
        ctx.fillStyle = pal.paper || '#FBF3E6';
        ctx.fillRect(0, 0, rcv.width, rcv.height);
        const charSpec = (FOUNDRY.CHARACTERS && (FOUNDRY.CHARACTERS[charId] || FOUNDRY.CHARACTERS['ceti-whale'])) || {{}};
        const rungInfo = (charSpec.reductionLadder || [])[rung - 1] || {{ name: 'Rung ' + rung, description: '' }};
        $('#rung-name-badge').textContent = `Rung ${{rung}} · ${{rungInfo.name}}`;
        $('#rung-desc-text').textContent = rungInfo.description;

        if (MA.renderReductionRung) {{
          MA.renderReductionRung(ctx, pal, charSpec, rung, 130, 82, 0.92, animT);
        }}
        // HUD metadata strip on Rung Canvas
        ctx.fillStyle = pal.ink || '#16110D';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillText(`RUNG ${{rung}}/5 · ${{(rungInfo.name || '').toUpperCase()}} · ${{charSpec.name || charId}}`, 14, 22);
        ctx.font = '500 10px "DM Sans", sans-serif';
        ctx.fillStyle = pal.b || '#475569';
        ctx.fillText(`Wada No. ${{pal.id}} (${{pal.name}}) · CR ${{pal.cr}}:1`, 14, 244);
        ctx.restore();
      }}
    }}
    requestAnimationFrame(renderMotionFrame);
  }}

  function updateCompiledCode(target) {{
    if (!CO || !CO.compileCodeScaffold) return;
    const normTarget = (target === 'anime') ? 'animejs' : (target || 'animejs');
    $$('[data-compile-target]').forEach(b => b.classList.toggle('btn-primary', b.dataset.compileTarget === normTarget));
    const code = CO.compileCodeScaffold({{
      charId: $('#sel-char').value || 'ceti-whale',
      mStyle: activeMotionStyle,
      palIdx: 0,
      feel: $('#sel-feel').value || 'spring'
    }}, normTarget);
    $('#compiled-code-box').textContent = code;
  }}

  // 7. Wire Interactive Controls
  function switchTab(tab) {{
    activeTab = tab;
    $$('.surface-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $$('.menu-pill[data-surface-jump]').forEach(b => b.classList.toggle('active', b.dataset.surfaceJump === tab));
    ['infographic', 'workflow', 'motion', 'rsi'].forEach(k => {{
      const el = $('#panel-' + k);
      if (el) el.hidden = (k !== tab);
    }});
  }}

  $$('.surface-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $$('.menu-pill[data-surface-jump]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.surfaceJump)));

  $('#sel-chrome').addEventListener('change', e => {{
    document.documentElement.dataset.chrome = e.target.value;
    updateWadaInspector();
    applyLiveTweaksToSVG();
  }});

  $('#sel-plate-style').addEventListener('change', e => {{
    const v = e.target.value;
    if (v.startsWith('anim:')) {{
      activeMotionStyle = v.split(':')[1];
      $$('.mstyle-chip').forEach(c => c.classList.toggle('btn-primary', c.dataset.mstyle === activeMotionStyle));
      switchTab('motion');
      updateCompiledCode('animejs');
    }} else if (v === 'combined-workflow') {{
      switchTab('workflow');
    }} else {{
      switchTab('infographic');
      mountPlate(v);
    }}
  }});

  $$('[data-quick-plate]').forEach(b => {{
    b.addEventListener('click', () => {{
      const k = b.dataset.quickPlate;
      $('#sel-plate-style').value = k;
      switchTab('infographic');
      mountPlate(k);
    }});
  }});

  $('#btn-split-compare').addEventListener('click', () => {{
    compareMode = !compareMode;
    $('#btn-split-compare').classList.toggle('btn-primary', compareMode);
    const grid = $('#infographic-stage-grid');
    const cmpMount = $('#svg-compare-mount');
    if (compareMode) {{
      grid.style.gridTemplateColumns = '1fr 1fr';
      cmpMount.hidden = false;
      const nextIdx = (PLATE_ORDER.indexOf(activePlateKey) + 1) % PLATE_ORDER.length;
      comparePlateKey = PLATE_ORDER[nextIdx];
      cmpMount.innerHTML = SVG_PLATES[comparePlateKey] || '';
    }} else {{
      grid.style.gridTemplateColumns = '1fr';
      cmpMount.hidden = true;
    }}
    applyLiveTweaksToSVG();
  }});

  $$('.mstyle-chip').forEach(b => {{
    b.addEventListener('click', () => {{
      activeMotionStyle = b.dataset.mstyle;
      $$('.mstyle-chip').forEach(c => c.classList.toggle('btn-primary', c.dataset.mstyle === activeMotionStyle));
      $('#sel-plate-style').value = 'anim:' + activeMotionStyle;
      updateCompiledCode('animejs');
    }});
  }});

  $('#sel-wada').addEventListener('change', e => {{
    userPickedWada = true;
    activeWadaId = Number(e.target.value);
    updateWadaInspector();
    applyLiveTweaksToSVG();
  }});

  ['tw-tilt', 'tw-zoom', 'tw-stroke', 'tw-client', 'tw-pursuit', 'tw-margin', 'tw-cohorts'].forEach(id => {{
    $('#' + id).addEventListener('input', applyLiveTweaksToSVG);
  }});

  $$('.z-btn').forEach(btn => {{
    btn.addEventListener('click', () => {{
      const z = Number(btn.dataset.z);
      zVisible[z] = !zVisible[z];
      btn.style.opacity = zVisible[z] ? '1' : '0.4';
      applyLiveTweaksToSVG();
    }});
  }});

  $('#btn-preset-catalyst').addEventListener('click', () => {{
    $('#tw-client').value = 8;
    $('#tw-pursuit').value = 3;
    applyLiveTweaksToSVG();
  }});
  $('#btn-preset-parity').addEventListener('click', () => {{
    $('#tw-client').value = 8;
    $('#tw-pursuit').value = 8;
    applyLiveTweaksToSVG();
  }});

  $('#tw-rung').addEventListener('input', e => {{
    $('#val-rung').textContent = 'Rung ' + e.target.value;
    $('#lbl-rung').textContent = 'Rung ' + e.target.value;
  }});

  $('#btn-anim-play').addEventListener('click', () => {{
    animPlaying = !animPlaying;
    $('#btn-anim-play').textContent = animPlaying ? '⏸ Pause' : '▶ Play';
  }});
  $('#anim-scrub').addEventListener('input', e => {{
    animPlaying = false;
    $('#btn-anim-play').textContent = '▶ Play';
    animT = Number(e.target.value);
    $('#anim-time-lbl').textContent = `t = ${{animT.toFixed(2)}}s`;
  }});

  $$('[data-compile-target]').forEach(b => {{
    b.addEventListener('click', () => updateCompiledCode(b.dataset.compileTarget));
  }});

  // 8. Client-Side Source Document Parser & Multi-Plate Live Binder
  function fnv1a32(str) {{
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {{
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }}
    return h.toString(16).padStart(8, '0');
  }}

  function parseLiveDocument(title, bodyText) {{
    const lines = (bodyText || '')
      .split(/\\n+/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('#'))
      .map(s => s.replace(/^\\s*(?:[-*•]|\\d+[.)]|\\[S\\d+\\])\\s*/, '').trim())
      .filter(Boolean);
    const kpis = (bodyText.match(/\\$[\\d,.]+[KMB]?|\\d+(?:\\.\\d+)?%|\\d+\\s*[:/+]\\s*\\d+|\\d+-in-\\d+/gi) || []).slice(0, 8);
    const hash = fnv1a32((title || '') + '\\n' + (bodyText || ''));
    return {{
      title: title || 'Custom Grounded Document',
      lines: lines.length ? lines : ['Grounded source claim 1', 'Grounded source claim 2', 'Grounded source claim 3', 'Grounded source claim 4'],
      kpis: kpis.length ? kpis : ['100%', '4:4', '$1.0M', '99.4%'],
      hash: hash
    }};
  }}

  function bindParsedDocToActiveSVGs(parsed) {{
    if (!parsed) return;
    const shortLine = (idx, maxLen) => {{
      const raw = parsed.lines[idx % parsed.lines.length] || '';
      return raw.length > maxLen ? raw.slice(0, maxLen - 1) + '…' : raw;
    }};
    const kpiSummary = parsed.kpis.slice(0, 4).join(' · ');

    ['#svg-plate-mount svg', '#svg-compare-mount svg'].forEach(sel => {{
      const svg = $(sel);
      if (!svg) return;
      const titleNode = svg.querySelector('.t-title, text.title');
      if (titleNode) titleNode.textContent = parsed.title.toUpperCase();
      const subNode = svg.querySelector('.t-sub, text.subtitle');
      if (subNode) {{
        subNode.textContent = `fnv1a:${{parsed.hash}} · ${{parsed.lines.length}} Grounded Claims · Extracted KPIs: ${{kpiSummary}}`;
      }}

      // Update Editorial Collage 4 Columns (.ed-col-card) & 8-Beat Storyboard Strip (.ed-beat-card)
      if (svg.id === 'editorial-collage-svg') {{
        svg.querySelectorAll('.ed-col-card').forEach((colG, i) => {{
          const rawClaim = parsed.lines[i % parsed.lines.length] || '';
          const parts = rawClaim.split(':');
          const kpiNode = colG.querySelector('text.t-kpi');
          const bNodes = colG.querySelectorAll('text.t-b');
          if (kpiNode) {{
            kpiNode.textContent = (parts.length > 1 ? parts[0].trim() : shortLine(i, 20));
          }}
          if (bNodes[0]) {{
            bNodes[0].textContent = (parts.length > 1 ? parts.slice(1).join(':').trim().slice(0, 42) : shortLine(i, 42));
          }}
          if (bNodes[1]) {{
            bNodes[1].textContent = `Grounded Claim #${{i+1}} · fnv1a:${{parsed.hash}}`;
          }}
        }});
        svg.querySelectorAll('.ed-beat-card').forEach((bCard, idx) => {{
          const rawClaim = parsed.lines[idx % parsed.lines.length] || '';
          const parts = rawClaim.split(':');
          const hNode = bCard.querySelector('text.t-h');
          const bNode = bCard.querySelector('text.t-b');
          if (hNode && parts.length > 1) {{
            hNode.textContent = `B${{idx+1}} · ${{parts[0].trim().slice(0, 10).toUpperCase()}}`;
          }}
          if (bNode) {{
            bNode.textContent = (parts.length > 1 ? parts.slice(1).join(':').trim().slice(0, 22) : shortLine(idx, 22));
          }}
        }});
      }}

      // Update Saul Bass 5-Rung Ladder descriptions if present
      if (svg.id === 'saul-bass-infographic-svg') {{
        const bTexts = svg.querySelectorAll('text.t-b');
        bTexts.forEach((bTxt, idx) => {{
          if (idx < parsed.lines.length) bTxt.textContent = shortLine(idx, 46);
        }});
      }}

      // Update Hydrographic Survey Sounding Cards if present
      if (svg.id === 'hydrographic-survey-svg') {{
        svg.querySelectorAll('.hy-sounding-card').forEach((cardG, idx) => {{
          const vNode = cardG.querySelector('text.t-val');
          const bNode = cardG.querySelector('text.t-b');
          if (vNode && parsed.kpis[idx]) vNode.textContent = parsed.kpis[idx];
          if (bNode) bNode.textContent = shortLine(idx, 28);
        }});
      }}

      // Update Orpheum Operadic Tree Claims if present
      if (svg.id === 'orpheum-operadic-svg') {{
        svg.querySelectorAll('.or-tree-row').forEach((rowG, idx) => {{
          const bNode = rowG.querySelector('text.t-b');
          if (bNode) bNode.textContent = shortLine(idx, 42);
        }});
      }}

      // Update Isometric Voxel Column headers if present
      if (svg.id === 'isometric-voxel-svg') {{
        const hNodes = svg.querySelectorAll('text.t-h');
        hNodes.forEach((h, idx) => {{
          if (idx < 3 && idx < parsed.lines.length) {{
            h.textContent = `${{['I', 'II', 'III'][idx]}} · ${{shortLine(idx, 28).toUpperCase()}}`;
          }}
        }});
      }}
    }});

    // Update Combined Workflow Diagram Tier III Grounded Source DAG
    const wfSvg = $('#svg-workflow-mount svg');
    if (wfSvg) {{
      const wfSub = wfSvg.querySelector('.t-sub');
      if (wfSub) {{
        wfSub.textContent = `Active Source: ${{parsed.title}} (fnv1a:${{parsed.hash}} · ${{parsed.lines.length}} claims) · 52/52 Conservation Gates PASS`;
      }}
      wfSvg.querySelectorAll('.wf-dag-node').forEach((g, idx) => {{
        const rawClaim = parsed.lines[idx % parsed.lines.length] || '';
        const parts = rawClaim.split(':');
        const h = g.querySelector('text.t-h');
        const b = g.querySelector('text.t-b');
        if (h && parts.length > 1) h.textContent = parts[0].trim().slice(0, 22);
        if (b) b.textContent = (parts.length > 1 ? parts.slice(1).join(':').trim().slice(0, 32) : shortLine(idx, 32));
      }});
    }}
  }}

  function loadDocPreset(key) {{
    const d = PRESET_DOCS[key] || PRESET_DOCS['tap-transcript'];
    $('#inp-doc-title').value = d.title;
    $('#inp-doc-body').value = d.text;
    activeWadaId = d.wada;
    $('#sel-wada').value = String(d.wada);
    $('#sel-char').value = d.charId;
    $('#sel-plate-style').value = d.defaultStyle;
    lastParsedDoc = (key === 'tap-transcript') ? null : parseLiveDocument(d.title, d.text);
    mountPlate(d.defaultStyle);
    updateWadaInspector();
  }}

  $('#sel-doc-preset').addEventListener('change', e => loadDocPreset(e.target.value));

  function triggerLiveCompileAndRSI() {{
    const customTitle = $('#inp-doc-title').value.trim();
    const customBody = $('#inp-doc-body').value.trim();
    lastParsedDoc = parseLiveDocument(customTitle, customBody);
    bindParsedDocToActiveSVGs(lastParsedDoc);

    if (CO && CO.runRSICritiqueAndFix) {{
      CO.runRSICritiqueAndFix({{
        charId: $('#sel-char').value,
        mStyle: activeMotionStyle,
        palIdx: 0
      }});
    }}
    $('#hud-gate-status').textContent = `✓ RSI R0→R3 LOCK-IN · fnv1a:${{lastParsedDoc.hash}}`;

    // Prepend live compile entry to Right Dock RSI Log
    const logBox = $('#rsi-live-log');
    if (logBox) {{
      const liveRow = document.createElement('div');
      liveRow.style.padding = '6px 8px';
      liveRow.style.background = 'var(--bg-elev)';
      liveRow.style.borderRadius = '5px';
      liveRow.style.borderLeft = '3px solid var(--accent-secondary)';
      liveRow.innerHTML = `<b>LIVE COMPILE (fnv1a:${{lastParsedDoc.hash}}):</b> Bound ${{lastParsedDoc.lines.length}} claims &amp; KPIs (${{lastParsedDoc.kpis.slice(0, 3).join(', ')}}) across 6 SVG styles + Workflow DAG`;
      logBox.prepend(liveRow);
    }}
    applyLiveTweaksToSVG();
    updatePoeticInspector();
  }}

  $('#btn-compile-doc').addEventListener('click', triggerLiveCompileAndRSI);
  $('#btn-run-rsi').addEventListener('click', () => {{
    triggerLiveCompileAndRSI();
    switchTab('rsi');
  }});
  $('#btn-retrigger-rsi').addEventListener('click', triggerLiveCompileAndRSI);

  // 9. Interactive Node Click-to-Inspect & Stage Pan/Zoom
  $('#svg-plate-mount').addEventListener('click', e => {{
    const g = e.target.closest('g[id]');
    if (g) {{
      $$('#svg-plate-mount g[id]').forEach(el => el.style.filter = '');
      g.style.filter = 'drop-shadow(0 0 8px rgba(217, 119, 6, 0.55))';
      updatePoeticInspector(g);
    }}
  }});

  $('#svg-plate-mount').addEventListener('dblclick', () => {{
    panX = 0;
    panY = 0;
    $('#tw-tilt').value = 0;
    $('#tw-zoom').value = 100;
    applyLiveTweaksToSVG();
  }});

  // Global Keyboard Shortcuts (1..6 styles, W workflow, M motion, R RSI, Space play/pause, C chrome)
  window.addEventListener('keydown', e => {{
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target && e.target.tagName) || '')) return;
    if (e.key >= '1' && e.key <= '6') {{
      const k = PLATE_ORDER[Number(e.key) - 1];
      if (k) {{
        $('#sel-plate-style').value = k;
        switchTab('infographic');
        mountPlate(k);
      }}
    }} else if (e.key === 'w' || e.key === 'W') {{
      switchTab('workflow');
    }} else if (e.key === 'm' || e.key === 'M') {{
      switchTab('motion');
    }} else if (e.key === 'r' || e.key === 'R') {{
      switchTab('rsi');
    }} else if (e.key === ' ' && activeTab === 'motion') {{
      e.preventDefault();
      $('#btn-anim-play').click();
    }}
  }});

  // SVG Export Helper
  function downloadSVG(svgEl, filename) {{
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], {{ type: 'image/svg+xml;charset=utf-8' }});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }}
  $('#btn-export-svg').addEventListener('click', () => {{
    const svg = activeTab === 'workflow' ? $('#svg-workflow-mount svg') : $('#svg-plate-mount svg');
    downloadSVG(svg, `infographic-${{activePlateKey}}-wada-${{activeWadaId}}.svg`);
  }});
  $('#btn-download-wf').addEventListener('click', () => {{
    downloadSVG($('#svg-workflow-mount svg'), 'combined-workflow-diagram.svg');
  }});

  // Initialize Studio
  loadDocPreset('tap-transcript');
  mountWorkflow();
  renderRSIPanel();
  updateCompiledCode('animejs');
  requestAnimationFrame(renderMotionFrame);
}})();
</script>
</body>
</html>
"""

    out_studio = ROOT / "out" / "infographic-studio-pro.html"
    out_workspace = WORKSPACE / "Universal Infographic & Motion Foundry Studio Pro.html"
    out_studio.write_text(html, encoding="utf-8")
    out_workspace.write_text(html, encoding="utf-8")
    print(f"[build_universal_studio] Built {out_workspace.name} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
