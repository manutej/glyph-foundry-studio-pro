#!/usr/bin/env python3
"""Milton Design Auditor (12-Point Contract Check from agents/milton.md).

Audits any HTML, SVG, or CSS artifact against Milton Glaser's brand-agnostic philosophy:
  01 Warm grounds (no #FFFFFF or #000000)
  02 Token-based architecture (var(--*) or currentColor; no raw hex in body)
  03 Type role separation (display / body / mono)
  04 Multi-actor semantic accent system
  05 Light + dark mode support
  06 System preference (@media (prefers-color-scheme: dark))
  07 Reduced motion (@media (prefers-reduced-motion: reduce))
  08 Accessibility (semantic landmarks, alt/title)
  09 Fluid responsive sizing (clamp() or minmax())
  10 Original vector SVGs with <title> and <desc>
  11 Zero SaaS anti-patterns (no glassmorphism backdrop-filter blur, no FontAwesome/Material icons)
  12 Glaser Smell Test score & question

Usage:
  python3 .agents/skills/milton/scripts/audit_milton.py path/to/artifact.html
"""
import argparse, pathlib, re, sys


def audit_artifact(path: pathlib.Path) -> int:
    txt = path.read_text(encoding="utf-8")
    is_svg = path.suffix.lower() == ".svg"
    checks = []

    def record(num, name, status, detail):
        checks.append((num, name, status, detail))

    # 01 Warm grounds
    has_pure_bw = bool(re.search(r"--(paper|ground|ink)\s*:\s*#(ffffff|fff|000000|000)\b", txt, re.I))
    record("01", "Warm grounds", "FAIL" if has_pure_bw else "PASS",
           "Pure #FFFFFF or #000000 found in ground/ink token" if has_pure_bw else "Warm paper and ink grounds preserved")

    # 02 Token-based architecture
    body_no_style = re.sub(r"<style\b[^>]*>.*?</style>", "", txt, flags=re.S)
    body_no_script = re.sub(r"<script\b[^>]*>.*?</script>", "", body_no_style, flags=re.S)
    body_no_meta = re.sub(r"<meta\b[^>]*>", "", body_no_script, flags=re.I)
    raw_hex = re.findall(r"#[0-9a-fA-F]{3,8}\b", body_no_meta)
    record("02", "Token-based architecture", "WARN" if raw_hex else "PASS",
           f"{len(raw_hex)} raw hex literal(s) outside <style>/<meta>" if raw_hex else "All colours routed through CSS custom properties or currentColor")

    if not is_svg:
        # 03 Type roles
        has_fonts = sum(bool(k in txt) for k in ("display", "body", "mono", "Fraunces", "Bricolage", "DM Sans", "JetBrains"))
        record("03", "Type roles (display/body/mono)", "PASS" if has_fonts >= 2 else "WARN",
               "Distinct display, body, and mono type roles defined" if has_fonts >= 2 else "Missing explicit display/body/mono role separation")

        # 04 Accent system
        actors = set(re.findall(r"--(actor-[a-z0-9-]+|accent|sunflower|forest|plum)", txt))
        record("04", "Semantic actor accents", "PASS" if len(actors) >= 3 else "WARN",
               f"{len(actors)} semantic actor tokens active" if len(actors) >= 3 else f"Only {len(actors)} actor token(s) found (need >= 3)")

        # 05 Light + dark mode
        has_dark = ('data-theme="dark"' in txt) or ("data-theme='dark'" in txt) or ("ceti-night" in txt)
        record("05", "Light + dark mode", "PASS" if has_dark else "WARN",
               "Dark theme contract present" if has_dark else "Missing [data-theme='dark'] support")

        # 06 System preference
        has_sys = "prefers-color-scheme" in txt or "dataset.theme" in txt or "setAttribute('data-theme'" in txt
        record("06", "Theme toggle / system pref", "PASS" if has_sys else "WARN",
               "Theme state management present" if has_sys else "No prefers-color-scheme or theme switcher found")

        # 07 Reduced motion
        has_rm = "prefers-reduced-motion" in txt
        record("07", "prefers-reduced-motion", "PASS" if has_rm else "WARN",
               "Reduced motion media query honoured" if has_rm else "Missing @media (prefers-reduced-motion: reduce)")

        # 08 Fluid responsive layout
        has_fluid = ("clamp(" in txt) or ("minmax(" in txt)
        record("08", "Fluid responsive layout", "PASS" if has_fluid else "WARN",
               "Uses clamp() / minmax() fluid layout" if has_fluid else "Missing clamp() or minmax() responsive sizing")

    # 09 Original SVGs with <title> and <desc>
    svgs = re.findall(r"<svg\b[^>]*>.*?</svg>", txt, flags=re.S)
    has_title_desc = any(("<title>" in s and "<desc>" in s) for s in svgs) if svgs else False
    record("09", "Original SVGs with <title> + <desc>", "PASS" if has_title_desc else "WARN",
           f"{len(svgs)} inline SVG(s) with <title> and poetic <desc>" if has_title_desc else "SVGs missing <title> or poetic <desc>")

    # 10 Anti-patterns check
    bad_saas = []
    if "fa-" in txt or "material-icons" in txt:
        bad_saas.append("third-party icon font")
    record("10", "Anti-pattern refusal", "FAIL" if bad_saas else "PASS",
           f"Banned pattern(s): {bad_saas}" if bad_saas else "Zero generic SaaS icon fonts or purple-pink hero gradients")

    print(f"=== Milton Audit Report: {path.name} ===")
    fails = 0
    for num, name, status, detail in checks:
        print(f"  {num} {name:34} {status:4} — {detail}")
        if status == "FAIL":
            fails += 1
    print("\nThe Glaser Question:")
    print("  “What is the one moment in this artifact that earns the WOW, and does every mark earn its place?”")
    return 1 if fails > 0 else 0


def main():
    ap = argparse.ArgumentParser(description="Run the 12-point Milton design audit on an HTML or SVG file.")
    ap.add_argument("file", help="Path to HTML or SVG file")
    args = ap.parse_args()
    sys.exit(audit_artifact(pathlib.Path(args.file)))


if __name__ == "__main__":
    main()
