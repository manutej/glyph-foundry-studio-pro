#!/usr/bin/env python3
"""Emit Verified Visual Atoms (ADD_ICON / ADD_SYMSPEC_FIGURE) for artifact-chain.

Compiles a SymSpec JSON or a single v8 2.5D/Milton idiom into:
  1. Hex-resolved SVG (*.resolved.svg) with zero CSS variables (required by python-pptx / LibreOffice / ReportLab)
  2. High-DPI @2x PNG plate (*@2x.png) rendered via headless Chromium

Usage:
  # Emit a full SymSpec figure plate:
  python3 .agents/skills/artifact-chain/scripts/emit_visual_atom.py --spec path/to/tap.symspec.json --style milton-warm -o out/tap_plate

  # Emit a single ADD_ICON atom:
  python3 .agents/skills/artifact-chain/scripts/emit_visual_atom.py --icon balance --style milton-warm -o out/icon_balance
"""
import argparse, json, pathlib, sys

WORKSPACE_ROOT = pathlib.Path(__file__).resolve().parents[3]
GF_ROOT = WORKSPACE_ROOT / ".agents" / "skills" / "glyph-foundry"
if not (GF_ROOT / "foundry").exists():
    GF_ROOT = WORKSPACE_ROOT / "glyph-foundry-next"
sys.path.insert(0, str(GF_ROOT))

from foundry.compile import compile_svg, resolve
from foundry.measure import Measurer
from foundry.render import to_png


def main():
    ap = argparse.ArgumentParser(description="Emit hex-resolved SVG + @2x PNG visual atoms for artifact-chain.")
    ap.add_argument("--spec", help="Path to *.symspec.json for ADD_SYMSPEC_FIGURE")
    ap.add_argument("--icon", help="Idiom or Milton icon name for ADD_ICON (e.g. balance, cohort, affection, truth)")
    ap.add_argument("--style", default="milton-warm", help="Style skin (milton-warm, ceti-night, deepmind-iridescent)")
    ap.add_argument("-o", "--out-prefix", required=True, help="Output path prefix (writes <prefix>.resolved.svg and <prefix>@2x.png)")
    args = ap.parse_args()

    st = json.loads((GF_ROOT / "styles" / f"{args.style}.json").read_text())
    out_prefix = pathlib.Path(args.out_prefix)
    out_prefix.parent.mkdir(parents=True, exist_ok=True)
    svg_path = out_prefix.with_suffix(".svg")
    res_path = out_prefix.with_name(out_prefix.name + ".resolved.svg")
    png_path = out_prefix.with_name(out_prefix.name + "@2x.png")

    if args.spec:
        spec = json.loads(pathlib.Path(args.spec).read_text())
        M = Measurer()
        svg, _ = compile_svg(spec, st, M, fonts="embed")
        M.flush()
    elif args.icon:
        se_script = WORKSPACE_ROOT / ".agents" / "skills" / "svg-enhance" / "scripts"
        sys.path.insert(0, str(se_script))
        from svg_enhance import emit_v8
        svg = emit_v8(args.icon, preset=args.style)
    else:
        ap.error("Specify either --spec or --icon")
        return

    svg_path.write_text(svg, encoding="utf-8")
    res_svg = resolve(svg, st)
    res_path.write_text(res_svg, encoding="utf-8")
    to_png(str(svg_path), str(png_path), scale=2)
    print(f"[emit_visual_atom] Wrote {res_path} and {png_path}")


if __name__ == "__main__":
    main()
