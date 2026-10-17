#!/usr/bin/env python3
"""/svg-enhance CLI — Audit, Refactor, or Synthesize Personalized 2.5D & Glaserian SVGs on the fly.

Modes:
  1. Audit an existing .svg or .html file against the 8 svg-enhance gates:
     python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --audit path/to/file.svg [--chromium]

  2. Refactor a primitive .svg on the fly (tokenize hexes, add round caps, inject <title>/<desc>,
     add 2.5D Z0 litho shadow plinth + Z1..Z3 depth layers):
     python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --refactor in.svg -o out.svg \
       --title "..." --desc "..."

  3. Emit any of the 9 v8 2.5D volumetric idioms or 12 canonical Milton icons on the fly:
     python3 .agents/skills/svg-enhance/scripts/svg_enhance.py --emit balance -o balance.v8.svg [--preset milton-warm]
"""
import argparse, json, pathlib, re, sys

WORKSPACE_ROOT = pathlib.Path(__file__).resolve().parents[3]
GF_ROOT = WORKSPACE_ROOT / ".agents" / "skills" / "glyph-foundry"
if not (GF_ROOT / "foundry").exists():
    GF_ROOT = WORKSPACE_ROOT / "glyph-foundry-next"
sys.path.insert(0, str(GF_ROOT))

MILTON_12_ICONS = {
    "affection": {
        "title": "Affection — You can only work for people you like",
        "desc": "Two crescents leaning inward so a warm sunflower spark blooms in the negative space between them. Embodies Glaser's first principle: shared craft begins in affection.",
        "body": """
  <g class="z-layer" data-z="0" data-seq="0">
    <circle cx="103" cy="104" r="76" style="fill:var(--shadow);stroke:none"/>
    <circle cx="100" cy="100" r="76" style="fill:var(--elev);stroke:var(--line);stroke-width:2.2px"/>
  </g>
  <g class="z-layer" data-z="1" data-seq="1" style="fill:none;stroke:var(--accent);stroke-width:13px;stroke-linecap:round">
    <path d="M66 62 a38 48 0 0 1 0 76"/>
    <path d="M134 62 a38 48 0 0 0 0 76" style="stroke:var(--actor-a)"/>
  </g>
  <g class="z-layer" data-z="2" data-seq="2">
    <path d="M100 84 Q100 100 116 100 Q100 100 100 116 Q100 100 84 100 Q100 100 100 84 Z" style="fill:var(--sunflower);stroke:var(--line);stroke-width:1.5px"/>
  </g>
  <g class="z-layer" data-z="3" data-seq="3">
    <circle cx="100" cy="148" r="6" style="fill:var(--accent)"/>
  </g>"""
    },
    "doubt": {
        "title": "Doubt is better than certainty",
        "desc": "Two question marks—one solid cobalt facing forward, one vermilion mirrored in outline—joined by a sunflower hinge dot. Certainty is a closed door; doubt is the hinge.",
        "body": """
  <g class="z-layer" data-z="0" data-seq="0">
    <rect x="27" y="28" width="150" height="150" rx="18" style="fill:var(--shadow);stroke:none"/>
    <rect x="24" y="24" width="150" height="150" rx="18" style="fill:var(--elev);stroke:var(--line);stroke-width:2.2px"/>
  </g>
  <g class="z-layer" data-z="1" data-seq="1">
    <text x="80" y="144" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="118" text-anchor="middle" style="fill:var(--actor-a)">?</text>
  </g>
  <g class="z-layer" data-z="2" data-seq="2">
    <text x="122" y="144" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="118" text-anchor="middle" transform="scale(-1 1) translate(-244 0)" style="fill:none;stroke:var(--accent);stroke-width:3px">?</text>
  </g>
  <g class="z-layer" data-z="3" data-seq="3">
    <circle cx="100" cy="154" r="6.5" style="fill:var(--sunflower);stroke:var(--line);stroke-width:1.5px"/>
  </g>"""
    },
    "truth": {
        "title": "Tell the truth",
        "desc": "Three concentric target rings with a bold vermilion arrow that has already passed completely through the bullseye. Truth is not a wall you stop at, but a standard you pass through.",
        "body": """
  <g class="z-layer" data-z="0" data-seq="0">
    <circle cx="103" cy="104" r="64" style="fill:var(--shadow);stroke:none"/>
    <circle cx="100" cy="100" r="62" style="fill:var(--elev);stroke:var(--line);stroke-width:3px"/>
  </g>
  <g class="z-layer" data-z="1" data-seq="1">
    <circle cx="100" cy="100" r="42" style="fill:var(--panel);stroke:var(--actor-a);stroke-width:2.5px;stroke-dasharray:5 4"/>
    <circle cx="100" cy="100" r="22" style="fill:var(--sunflower-tint);stroke:var(--actor-b);stroke-width:2.5px"/>
    <circle cx="100" cy="100" r="8" style="fill:var(--sunflower);stroke:var(--line);stroke-width:1.8px"/>
  </g>
  <g class="z-layer" data-z="2" data-seq="2">
    <line x1="18" y1="100" x2="184" y2="100" style="stroke:var(--accent);stroke-width:4.5px;stroke-linecap:round"/>
    <polygon points="188,100 172,92 172,108" style="fill:var(--accent);stroke:var(--line);stroke-width:1.5px;stroke-linejoin:round"/>
  </g>
  <g class="z-layer" data-z="3" data-seq="3">
    <circle cx="100" cy="100" r="3.2" style="fill:var(--ground)"/>
  </g>"""
    },
    "wow": {
        "title": "WOW — The third response",
        "desc": "Concentric rising arcs of cobalt, vermilion, and sunflower whose outermost dashed ring bursts past the top of the frame. Yes is forgettable; WOW escapes the frame.",
        "body": """
  <g class="z-layer" data-z="0" data-seq="0">
    <rect x="27" y="39" width="150" height="136" rx="16" style="fill:var(--shadow);stroke:none"/>
    <rect x="24" y="36" width="150" height="136" rx="16" style="fill:var(--elev);stroke:var(--line);stroke-width:2.2px"/>
  </g>
  <g class="z-layer" data-z="1" data-seq="1" style="fill:none;stroke-linecap:round">
    <path d="M64 134 a36 36 0 0 1 72 0" style="stroke:var(--actor-a);stroke-width:5.5px"/>
    <path d="M44 134 a56 56 0 0 1 112 0" style="stroke:var(--accent);stroke-width:5.5px"/>
  </g>
  <g class="z-layer" data-z="2" data-seq="2">
    <circle cx="100" cy="134" r="13" style="fill:var(--sunflower);stroke:var(--line);stroke-width:2.5px"/>
  </g>
  <g class="z-layer" data-z="3" data-seq="3" style="fill:none;stroke-linecap:round">
    <path d="M16 134 a84 96 0 0 1 168 0" style="stroke:var(--sunflower);stroke-width:3.5px;stroke-dasharray:3 7"/>
  </g>"""
    },
}


def audit_svg_string(svg_text: str, label: str = "svg") -> dict:
    findings = []
    body = re.sub(r"<style\b[^>]*>.*?</style>", "", svg_text, flags=re.S)

    has_title = bool(re.search(r"<title\b[^>]*>[^<]+</title>", svg_text))
    has_desc = bool(re.search(r"<desc\b[^>]*>[^<]+</desc>", svg_text))
    if not has_title or not has_desc:
        findings.append(("G1_SOUL_META", "error", "Missing <title> or poetic <desc> (Milton ICONS.md §4 Step 5 contract)"))

    raw_hex = re.findall(r"#[0-9a-fA-F]{3,8}\b", body)
    if raw_hex:
        findings.append(("G2_TOKEN_PURITY", "warn", f"{len(raw_hex)} hardcoded hex literal(s) outside <style> (e.g. {raw_hex[:3]})"))

    for bad in ("<filter", "Gradient", "<image"):
        if bad in body:
            findings.append(("G3_NO_BLOAT", "error", f"Forbidden construct '{bad}' found; use flat litho plates & silhouette"))

    z_planes = set(re.findall(r'data-z="(\d+)"', svg_text))
    if len(z_planes) < 3:
        findings.append(("G4_DEPTH_PLANES", "warn", f"Only {len(z_planes)} data-z depth plane(s) (target >= 3 for 2.5D parallax & hierarchy)"))

    has_round_caps = "stroke-linecap" in svg_text
    if not has_round_caps:
        findings.append(("G5_HAND_CAPS", "warn", "Missing stroke-linecap='round' (rectangular caps look CAD-generated)"))

    neg_space = ("var(--ground)" in svg_text) or ("var(--paper)" in svg_text) or ("var(--gf-ground)" in svg_text)
    if not neg_space:
        findings.append(("G6_NEGATIVE_SPACE", "warn", "No negative-space ground cutouts (var(--ground) / var(--paper)) detected"))

    score = max(0, 100 - sum(22 if sev == "error" else 11 for _, sev, _ in findings))
    return {"label": label, "score": score, "z_planes": sorted(z_planes), "findings": findings}


def refactor_svg(svg_text: str, title: str, desc: str, preset: str = "milton-warm") -> str:
    style_path = GF_ROOT / "styles" / f"{preset}.json"
    st = json.loads(style_path.read_text())

    # 1. Strip <filter> and <linearGradient>/<radialGradient> blocks
    out = re.sub(r"<filter\b[^>]*>.*?</filter>", "", svg_text, flags=re.S)
    out = re.sub(r"<(linear|radial)Gradient\b[^>]*>.*?</\1Gradient>", "", out, flags=re.S)

    # 2. Map common hardcoded hexes to semantic CSS variables
    hex_map = {
        "#faf7f2": "var(--elev)", "#f5eedf": "var(--ground)", "#f1ebdd": "var(--ground)",
        "#1a1612": "var(--ink)", "#1a1916": "var(--ink)", "#000000": "var(--ink)", "#000": "var(--ink)",
        "#ffffff": "var(--elev)", "#fff": "var(--elev)",
        "#d1422a": "var(--accent)", "#c8322b": "var(--accent)", "#d62828": "var(--accent)",
        "#2d5ba9": "var(--actor-a)", "#1d3557": "var(--actor-a)", "#2f6f73": "var(--actor-a)",
        "#e8b53c": "var(--sunflower)", "#f4c430": "var(--sunflower)",
        "#3b6e47": "var(--forest)", "#2d6a4f": "var(--forest)",
        "#6b3f6e": "var(--plum)",
        "#d9822b": "var(--actor-b)", "#e76f51": "var(--actor-b)",
    }
    for hx, tok in hex_map.items():
        out = re.sub(re.escape(hx), tok, out, flags=re.I)

    # 3. Build :root style block with 5-actor tokens + round caps
    roles_css = ";".join(f"--{k}:{v}" for k, v in st["roles"].items())
    style_block = (
        f"<style>"
        f"svg{{{roles_css};--paper:var(--ground);stroke-linecap:round;stroke-linejoin:round}}"
        f"</style>"
    )

    # 4. Ensure <title> and <desc> exist right after <svg ...>
    m_svg = re.search(r"<svg\b[^>]*>", out)
    if not m_svg:
        raise ValueError("No <svg> root tag found")
    head_end = m_svg.end()
    inner = out[head_end:]
    inner = re.sub(r"<title\b[^>]*>.*?</title>", "", inner, flags=re.S)
    inner = re.sub(r"<desc\b[^>]*>.*?</desc>", "", inner, flags=re.S)
    m_end = re.rfind("</svg>")
    inner_body = inner[: inner.rfind("</svg>")] if "</svg>" in inner else inner

    # 5. If fewer than 3 data-z planes exist, wrap into Z0 (litho plinth) + Z1 + Z2 + Z3
    if len(set(re.findall(r'data-z="(\d+)"', inner_body))) < 3:
        vb_m = re.search(r'viewBox=["\']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s*["\']', m_svg.group(0))
        vw, vh = (float(vb_m.group(3)), float(vb_m.group(4))) if vb_m else (200.0, 200.0)
        px, py, pw, ph = vw * 0.06, vh * 0.06, vw * 0.88, vh * 0.88
        z0 = (
            f'<g class="z-layer enhanced-plinth" data-z="0" data-seq="0">'
            f'<rect x="{px+3.5:.1f}" y="{py+4.5:.1f}" width="{pw:.1f}" height="{ph:.1f}" rx="12" style="fill:var(--shadow);stroke:none"/>'
            f'<rect x="{px:.1f}" y="{py:.1f}" width="{pw:.1f}" height="{ph:.1f}" rx="12" style="fill:var(--elev);stroke:var(--line);stroke-width:1.5px"/>'
            f'</g>'
        )
        z1 = f'<g class="z-layer enhanced-mech" data-z="1" data-seq="1"><circle cx="{vw*0.86:.1f}" cy="{vh*0.14:.1f}" r="4.5" style="fill:var(--sunflower);stroke:var(--line);stroke-width:1.2px"/></g>'
        z2 = f'<g class="z-layer enhanced-core" data-z="2" data-seq="2">{inner_body.strip()}</g>'
        z3 = f'<g class="z-layer enhanced-rim" data-z="3" data-seq="3"><circle cx="{vw*0.86:.1f}" cy="{vh*0.14:.1f}" r="1.6" style="fill:var(--ground);stroke:none"/></g>'
        inner_body = f"\n  {z0}\n  {z1}\n  {z2}\n  {z3}\n"

    meta_block = f"\n  <title>{title}</title>\n  <desc>{desc}</desc>\n  {style_block}"
    return f"{m_svg.group(0)}{meta_block}{inner_body}</svg>\n"


def emit_v8(name: str, preset: str = "milton-warm", params_json: str = None) -> str:
    from foundry.glyphs import GLYPHS
    from foundry.pen import Pen
    from foundry.measure import Measurer

    st = json.loads((GF_ROOT / "styles" / f"{preset}.json").read_text())
    roles_css = ";".join(f"--{k}:{v}" for k, v in st["roles"].items())
    sw_css = ";".join(f"--sw-{k}:{v}px" for k, v in st["stroke"].items())

    if name in MILTON_12_ICONS:
        ic = MILTON_12_ICONS[name]
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">\n'
            f'  <title>{ic["title"]}</title>\n'
            f'  <desc>{ic["desc"]}</desc>\n'
            f'  <style>svg{{{roles_css};{sw_css};--paper:var(--ground);background:var(--ground)}}</style>'
            f'{ic["body"]}\n</svg>\n'
        )

    if name not in GLYPHS:
        raise ValueError(f"Unknown idiom/icon '{name}'. Available: {sorted(list(GLYPHS.keys()) + list(MILTON_12_ICONS.keys()))}")

    default_params = {
        "crowd": {"n": 8, "solid": 6, "roles": ["actor-a"]},
        "gate": {"label": "same prerequisites"},
        "cohort": {"n": 16, "roles": ["actor-a", "actor-b"]},
        "contract": {"people": 8},
        "taper": {"levels": [5, 3, 1.4, 0.6], "ticks": ["5 d/wk", "3 d/wk", "1 h/day", "tapering"], "dashed_last": True, "actor": "coach"},
        "fork": {"branches": [{"label": "hire direct", "concept": "c_hire", "icon": "check"}, {"label": "dismiss", "concept": "c_dismiss", "icon": "exit"}, {"label": "extend · higher rate", "concept": "c_extend", "icon": "loop"}]},
        "equation": {"terms": ["$25/h margin", "40 h/wk", "8 people", "50 wk"], "result": "= $400,000", "after": "profit per cohort · could run 10 a year"},
        "balance": {"left": 8, "right": 8, "pod_left": 8, "pod": 3, "tilt": 7, "note_left": "8 : 8 too much?", "note_right": "try 8 : 2–4"},
        "venn": {"a": "staffing", "b": "training", "mid": "TAP"},
    }
    prm = json.loads(params_json) if params_json else default_params[name]
    w, h = (720, 150) if name == "equation" else ((440, 150) if name == "balance" else (340, 190))
    M = Measurer()
    P = Pen(st, seed=name, measure=lambda s, r: M.width(s, *{"caption": ("DM Sans", 14.5, 500), "tick": ("DM Sans", 12.5, 500), "num": ("JetBrains Mono", 15.5, 400), "hand": ("Caveat", 20, 500), "title": ("Fraunces", 30, 600)}[r]))
    GLYPHS[name](P, w, h, prm, name)
    M.flush()
    style_tag = (
        f"<style>"
        f"svg{{{roles_css};{sw_css};background:var(--ground)}}"
        f".t-title{{font:600 30px Fraunces,Georgia,serif}}"
        f".t-caption{{font:500 14.5px 'DM Sans',system-ui,sans-serif}}"
        f".t-tick{{font:500 12.5px 'DM Sans',system-ui,sans-serif}}"
        f".t-hand{{font:500 20px Caveat,cursive}}"
        f".t-num{{font:400 15.5px 'JetBrains Mono',monospace}}"
        f".t-strong{{font-weight:700}}"
        f"</style>"
    )
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img">\n{style_tag}\n{P.svg()}\n</svg>\n'


def main():
    ap = argparse.ArgumentParser(description="/svg-enhance CLI pipeline")
    ap.add_argument("--audit", help="Audit an .svg or .html file")
    ap.add_argument("--refactor", help="Input .svg file to refactor on the fly")
    ap.add_argument("--emit", help="Emit a v8 2.5D idiom or canonical Milton icon by name")
    ap.add_argument("-o", "--output", help="Output .svg path")
    ap.add_argument("--title", default="Enhanced Symbolic Glyph", help="<title> for refactored SVG")
    ap.add_argument("--desc", default="Refactored into 4 depth planes with warm lithographic plinth, round hand-inked caps, and negative-space paper cutouts.", help="Poetic <desc> for refactored SVG")
    ap.add_argument("--preset", default="milton-warm", help="Style preset (milton-warm, ceti-night, deepmind-iridescent)")
    ap.add_argument("--params", default=None, help="Optional JSON params for --emit")
    args = ap.parse_args()

    if args.audit:
        p = pathlib.Path(args.audit)
        txt = p.read_text(encoding="utf-8")
        svgs = re.findall(r"<svg\b[^>]*>.*?</svg>", txt, flags=re.S) if p.suffix == ".html" else [txt]
        for idx, s in enumerate(svgs):
            res = audit_svg_string(s, f"{p.name}[svg#{idx}]" if len(svgs) > 1 else p.name)
            print(f"[svg-enhance audit] {res['label']} -> Score: {res['score']}/100 · Z-planes: {res['z_planes']}")
            for code, sev, msg in res["findings"]:
                print(f"  [{sev.upper():5}] {code}: {msg}")
        return

    if args.refactor:
        src = pathlib.Path(args.refactor).read_text(encoding="utf-8")
        before = audit_svg_string(src, "BEFORE")
        enhanced = refactor_svg(src, args.title, args.desc, args.preset)
        after = audit_svg_string(enhanced, "AFTER")
        out_p = pathlib.Path(args.output or args.refactor)
        out_p.write_text(enhanced, encoding="utf-8")
        print(f"[svg-enhance refactor] {args.refactor} -> {out_p} | Score: {before['score']}/100 -> {after['score']}/100 | Z-planes: {after['z_planes']}")
        return

    if args.emit:
        svg_out = emit_v8(args.emit, args.preset, args.params)
        out_p = pathlib.Path(args.output or f"{args.emit}.v8.svg")
        out_p.write_text(svg_out, encoding="utf-8")
        audit = audit_svg_string(svg_out, out_p.name)
        print(f"[svg-enhance emit] Wrote {out_p} ({len(svg_out)} bytes) | Score: {audit['score']}/100 | Z-planes: {audit['z_planes']}")
        return

    ap.print_help()


if __name__ == "__main__":
    main()
