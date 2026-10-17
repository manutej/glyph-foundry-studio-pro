#!/usr/bin/env python3
"""Recover embedded assets from a template BEFORE deleting its guideline slides.

Icon sheets and image libraries frequently sit on slides labelled "delete this
slide after following these guidelines." Deleting them destroys the only copy.
Brand icons are often SVG-only (embedded via the svgBlip extension with no
raster fallback), so python-pptx cannot place them — rasterize first.

    python extract_assets.py template.pptx [--out icons] [--slides 7,8]

Then rasterize (sharp / cairosvg / rsvg-convert) at 300dpi and LOOK at the
result: a silent rasterizer failure produces blank squares that no automated
check notices.
"""
import argparse, json, os, re, shutil, zipfile


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("template")
    ap.add_argument("--out", default="assets")
    ap.add_argument("--slides", default="", help="comma-separated slide numbers; default all")
    ap.add_argument("--work", default="_unpacked")
    a = ap.parse_args()

    shutil.rmtree(a.work, ignore_errors=True)
    zipfile.ZipFile(a.template).extractall(a.work)
    os.makedirs(a.out, exist_ok=True)

    slides = ([f"slide{n.strip()}" for n in a.slides.split(",") if n.strip()]
              or sorted(f[:-4] for f in os.listdir(f"{a.work}/ppt/slides")
                        if f.endswith(".xml")))

    found = {}
    for sn in slides:
        relp = f"{a.work}/ppt/slides/_rels/{sn}.xml.rels"
        xmlp = f"{a.work}/ppt/slides/{sn}.xml"
        if not (os.path.exists(relp) and os.path.exists(xmlp)):
            continue
        rels = open(relp, encoding="utf8").read()
        rmap = dict(re.findall(r'Id="([^"]+)"[^>]*Target="\.\./media/([^"]+)"', rels))
        xml = open(xmlp, encoding="utf8").read()
        for pic in re.findall(r"<p:pic>.*?</p:pic>", xml, re.S):
            descr = re.search(r'<p:cNvPr[^>]*descr="([^"]*)"', pic)
            name = re.search(r'<p:cNvPr[^>]*name="([^"]*)"', pic)
            label = (descr or name).group(1) if (descr or name) else "asset"
            key = re.sub(r"[^a-z0-9]", "", label.lower()) or f"asset{len(found)}"
            for rid in re.findall(r'r:(?:embed|link)="([^"]+)"', pic):
                fn = rmap.get(rid)
                if not fn:
                    continue
                src = f"{a.work}/ppt/media/{fn}"
                if os.path.exists(src):
                    ext = os.path.splitext(fn)[1]
                    dst = f"{a.out}/{key}{ext}"
                    shutil.copy(src, dst)
                    found.setdefault(key, []).append(dst)

    json.dump(found, open(f"{a.out}/map.json", "w"), indent=1)
    svg = sum(1 for v in found.values() for f in v if f.endswith(".svg"))
    print(f"recovered {len(found)} named assets ({svg} svg) -> {a.out}/")
    if svg:
        print("svg assets need rasterizing at 300dpi before python-pptx can place them")


if __name__ == "__main__":
    main()
