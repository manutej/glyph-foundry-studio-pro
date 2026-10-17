"""Real font metrics via headless Chromium, so layout never guesses text widths.

The layout solver asks for widths of (text, font-role) pairs; this module renders them
once with the actual delivery fonts (Fraunces / DM Sans / Caveat / JetBrains Mono from
@fontsource) and caches the result. The model never hand-computes coordinates.
"""
import json, hashlib, os, pathlib
from .chromium import run_in_chromium

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "fonts" / "node_modules" / "@fontsource"
CACHE = ROOT / "out" / ".measure-cache.json"

FONT_FACES = [
    ("Fraunces", 400, "fraunces/files/fraunces-latin-400-normal.woff2"),
    ("Fraunces", 600, "fraunces/files/fraunces-latin-600-normal.woff2"),
    ("DM Sans", 400, "dm-sans/files/dm-sans-latin-400-normal.woff2"),
    ("DM Sans", 500, "dm-sans/files/dm-sans-latin-500-normal.woff2"),
    ("Caveat", 500, "caveat/files/caveat-latin-500-normal.woff2"),
    ("JetBrains Mono", 400, "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2"),
]


def font_face_css(embed=False):
    """@font-face rules. embed=True inlines woff2 as data URIs (for standalone artifacts)."""
    import base64
    rules = []
    for fam, wt, rel in FONT_FACES:
        p = FONT_DIR / rel
        if embed:
            src = "data:font/woff2;base64," + base64.b64encode(p.read_bytes()).decode()
        else:
            src = p.as_uri()
        rules.append(f"@font-face{{font-family:'{fam}';font-weight:{wt};font-style:normal;src:url({src}) format('woff2');}}")
    return "\n".join(rules)


class Measurer:
    def __init__(self):
        self.cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
        self.pending = {}

    @staticmethod
    def key(text, family, size, weight):
        return hashlib.sha1(f"{text}|{family}|{size}|{weight}".encode()).hexdigest()[:16]

    def width(self, text, family, size, weight):
        k = self.key(text, family, size, weight)
        if k in self.cache:
            return self.cache[k]
        self.pending[k] = (text, family, size, weight)
        return None

    def flush(self):
        if not self.pending:
            return
        items = list(self.pending.items())
        spans = "".join(
            f'<span id="m{i}" style="font-family:{fam};font-size:{sz}px;font-weight:{wt};white-space:pre">'
            f'{txt.replace("&", "&amp;").replace("<", "&lt;")}</span><br>'
            for i, (k, (txt, fam, sz, wt)) in enumerate(items)
        )
        html = f"<style>{font_face_css()}</style><body>{spans}</body>"
        tmp = CACHE.parent / "_measure.html"  # file:// page so the local font files load
        tmp.parent.mkdir(parents=True, exist_ok=True)
        tmp.write_text(html)
        fams = sorted({(fam, wt) for _, (_, fam, _, wt) in items})
        res = run_in_chromium(
            tmp.resolve().as_uri(),
            viewport_w=1280,
            viewport_h=720,
            check_fonts=fams,
            js_eval=f"() => [...Array({len(items)}).keys()].map(i=>document.getElementById('m'+i).getBoundingClientRect().width)"
        )
        assert not res.get("missing"), f"delivery fonts not loaded: {res.get('missing')}"
        widths = res["result"]
        for (k, _), w in zip(items, widths):
            self.cache[k] = round(w, 2)
        self.pending = {}
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps(self.cache))

    def measure_all(self, requests):
        """requests: list of (text, family, size, weight). Returns list of widths."""
        for r in requests:
            self.width(*r)
        self.flush()
        return [self.width(*r) for r in requests]
