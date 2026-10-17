#!/usr/bin/env python3
"""Standalone CLI gate runner (H1-H8) for any SymSpec JSON and style skin.

Usage:
  1. Auto-compile and test against all styles (or a single style):
     python3 scripts/run_harness.py path/to/spec.symspec.json [--style milton-warm]
  2. Test an already-compiled SVG:
     python3 scripts/run_harness.py spec.symspec.json rendered.svg style.json report.json
"""
import argparse, json, os, pathlib, sys

SKILL_ROOT = pathlib.Path(__file__).resolve().parent.parent
if not (SKILL_ROOT / "foundry").exists():
    SKILL_ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SKILL_ROOT))

from foundry.compile import compile_svg
from foundry.harness import run, summarize
from foundry.measure import Measurer


def main():
    if len(sys.argv) == 5 and not sys.argv[1].startswith("-"):
        spec = json.load(open(sys.argv[1]))
        svg = open(sys.argv[2]).read()
        st = json.load(open(sys.argv[3]))
        src_path = pathlib.Path(spec["meta"]["source"]["file"])
        if not src_path.is_absolute() and not src_path.exists():
            src_path = SKILL_ROOT / src_path
        src = open(src_path).read()
        out_dir = str(pathlib.Path(sys.argv[4]).parent or "out")
        os.makedirs(out_dir, exist_ok=True)
        F = run(spec, svg, st, src, png_dir=out_dir)
        json.dump(F, open(sys.argv[4], "w"), indent=1, ensure_ascii=False)
        print(summarize(F))
        for f in F:
            print(f"{f['check']} {f['severity']:5} {f['anchor']:22} {f['msg']}")
        return

    ap = argparse.ArgumentParser(description="Run H1-H8 verification gates on a SymSpec JSON.")
    ap.add_argument("spec", help="Path to *.symspec.json")
    ap.add_argument("--style", default="all", help="Style skin name or 'all' (default: all)")
    ap.add_argument("--out-dir", default="out", help="Directory for rendered PNGs and reports")
    args = ap.parse_args()

    os.chdir(SKILL_ROOT)
    spec_path = pathlib.Path(args.spec)
    if not spec_path.is_absolute() and not spec_path.exists():
        spec_path = SKILL_ROOT / spec_path
    spec = json.load(open(spec_path))
    src_path = pathlib.Path(spec["meta"]["source"]["file"])
    if not src_path.is_absolute() and not src_path.exists():
        src_path = SKILL_ROOT / src_path
    src = open(src_path).read()

    style_ids = ["milton-warm", "deepmind-iridescent", "ceti-night"] if args.style == "all" else [args.style]
    os.makedirs(args.out_dir, exist_ok=True)
    M = Measurer()
    exit_code = 0
    for sid in style_ids:
        st = json.load(open(SKILL_ROOT / "styles" / f"{sid}.json"))
        svg, _ = compile_svg(spec, st, M, fonts="embed")
        F = run(spec, svg, st, src, png_dir=args.out_dir)
        summary = summarize(F)
        print(f"[{sid}] {summary}")
        for f in F:
            print(f"  {f['check']} {f['severity']:5} {f['anchor']:22} {f['msg']}")
        if summary["errors"] > 0:
            exit_code = 1
    M.flush()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
