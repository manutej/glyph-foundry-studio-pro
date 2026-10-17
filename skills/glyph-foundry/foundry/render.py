"""Rasterize SVGs in headless Chromium (same engine the artifacts run in)."""
import pathlib, sys, re
from .chromium import run_in_chromium


def to_png(svg_path, png_path=None, scale=1):
    svg_path = pathlib.Path(svg_path)
    png_path = pathlib.Path(png_path or svg_path.with_suffix(".png"))
    svg = svg_path.read_text()
    m = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
    w, h = int(m.group(1)), int(m.group(2))
    run_in_chromium(svg_path.resolve().as_uri(), viewport_w=w, viewport_h=h, scale=scale, screenshot_path=str(png_path.resolve()))
    return png_path


if __name__ == "__main__":
    for a in sys.argv[1:]:
        print(to_png(a))
