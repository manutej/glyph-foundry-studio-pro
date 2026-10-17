"""SymSpec + style record  ->  SVG (static) and explainer HTML (beat-driven).

Layout is deterministic: the spec gives a box tree with flex weights; this solver assigns every
coordinate. Leaves draw glyph programs in local space; parents own every edge that crosses a
child boundary (FigTree's rule), routed between named ports.
"""
import json, pathlib, re
from .pen import Pen, esc
from .glyphs import GLYPHS
from .measure import Measurer, font_face_css

ROOT = pathlib.Path(__file__).resolve().parent.parent
FAMILY = lambda css: css.split(",")[0].strip().strip("'\"")


class Ctx:
    def __init__(self, spec, style, measurer):
        self.spec, self.S, self.M = spec, style, measurer
        self.boxes, self.ports, self.leaves = {}, {}, []

    def font(self, role):
        fam_role = {"title": "display", "sub": "body", "caption": "body", "tick": "body",
                    "hand": "hand", "num": "mono", "edge": self.S.get("edge_label_font", "hand")}[role]
        size, weight = self.S["type"][role]
        return FAMILY(self.S["fonts"][fam_role]), size, weight

    def tw(self, text, role):
        fam, size, wt = self.font(role)
        return self.M.width(text, fam, size, wt)


# ---------------------------------------------------------------- layout solver
def solve(node, x, y, w, h, ctx):
    ctx.boxes[node["id"]] = (x, y, w, h)
    if "leaf" in node:
        ctx.leaves.append(node)
        return
    kids = node.get("children", [])
    pad, gap = node.get("pad", 0), node.get("gap", 0)
    x, y, w, h = x + pad, y + pad, w - 2 * pad, h - 2 * pad
    horiz = node["dir"] == "row"
    total = (w if horiz else h) - gap * (len(kids) - 1)
    fixed = sum(k.get("w" if horiz else "h", 0) for k in kids)
    flex = sum(k.get("flex", 0) for k in kids if ("w" if horiz else "h") not in k) or 1
    cur = x if horiz else y
    for k in kids:
        size = k.get("w" if horiz else "h") or (total - fixed) * k.get("flex", 0) / flex
        if horiz:
            solve(k, cur, y, size, h, ctx)
        else:
            solve(k, x, cur, w, size, ctx)
        cur += size + gap


def wrap(text, role, maxw, ctx):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if cur and ctx.tw(t, role) and ctx.tw(t, role) > maxw:
            lines.append(cur)
            cur = wd
        else:
            cur = t
    lines.append(cur)
    return lines


# ---------------------------------------------------------------- rendering
def render_leaf(node, ctx):
    x, y, w, h = ctx.boxes[node["id"]]
    P = Pen(ctx.S, seed=node["id"], measure=ctx.tw)
    cap_lines = []
    if node.get("caption"):
        cap_lines = wrap(node["caption"], "caption", w, ctx)
    cap_h = len(cap_lines) * 19 + (6 if cap_lines else 0)
    gh = h - cap_h
    top_cap = node.get("caption_pos") == "top"
    gy_off = cap_h if top_cap else 0
    if node["leaf"] == "title":
        t = node["text"]
        with P.layer(z=1, seq=0, cls="title-block"):
            P.rect(0, 10, 4.5, 56, rx=2, fill="accent", stroke=None)
            P.text(16, 36, t[0], role="title", src=node["id"])
            if len(t) > 1:
                P.text(16, 61, t[1], role="sub", fill="muted", src=node["id"])
            P.line(16, 74, min(w * 0.78, 520), 74, stroke="grid", sw="hair")
        bb = (0, 0, w, h)
    else:
        if gy_off:
            P.raw(f'<g transform="translate(0,{gy_off:.1f})">')
        bb = GLYPHS[node["glyph"]](P, w, gh, node.get("params", {}), node["id"])
        if gy_off:
            P.raw("</g>")
            bb = (bb[0], bb[1] + gy_off, bb[2], bb[3] + gy_off)
    for i, ln in enumerate(cap_lines):
        cy_ = (15 + i * 19) if top_cap else (gh + 6 + 15 + i * 19)
        P.text(w / 2, cy_, ln, role="caption", anchor="middle", src=node["id"], cls="caption")
    gx0, gy0, gx1, gy1 = bb
    full_bottom = gy1 if top_cap or not cap_lines else gh + cap_h
    ctx.ports[node["id"]] = {
        "top": (x + (gx0 + gx1) / 2, y + gy0 - 2),
        "topleft": (x + gx0 + (gx1 - gx0) * 0.28, y + gy0 - 2),
        "topright": (x + gx0 + (gx1 - gx0) * 0.72, y + gy0 - 2),
        "bottom": (x + (gx0 + gx1) / 2, y + full_bottom + 3),
        "left": (x + gx0 - 2, y + (gy0 + gy1) / 2),
        "right": (x + gx1 + 6, y + (gy0 + gy1) / 2),
    }
    attrs = f'id="n-{node["id"]}" class="leaf" data-concept="{node.get("concept", "")}" data-claim="{node.get("claim", "")}"'
    return (f'<g {attrs} transform="translate({x:.1f},{y:.1f})">\n'
            f'<title>{esc(node.get("caption") or node.get("concept"))}</title>\n'
            f'<desc>concept={node.get("concept")} spans={",".join(span_ids(ctx.spec, node.get("concept")))}</desc>\n'
            f'{P.svg()}\n</g>')


def span_ids(spec, cid):
    for c in spec["concepts"]:
        if c["id"] == cid:
            return c["spans"]
    return []


def render_edges(node, ctx, out):
    for e in node.get("edges", []):
        a_id, a_side = e["from"].split(".")
        b_id, b_side = e["to"].split(".")
        (x1, y1), (x2, y2) = ctx.ports[a_id][a_side], ctx.ports[b_id][b_side]
        if a_side in ("bottom", "top"):
            ey2 = y2 - 2.5
            cy1 = y1 + (ey2 - y1) * 0.42
            cy2 = ey2 - max((ey2 - y1) * 0.52, 12.0)
            d = f"M{x1:.1f},{y1:.1f} C{x1:.1f},{cy1:.1f} {x2:.1f},{cy2:.1f} {x2:.1f},{ey2:.1f}"
        else:
            mx = (x1 + x2) / 2
            d = f"M{x1:.1f},{y1:.1f} C{mx:.1f},{y1:.1f} {mx:.1f},{y2:.1f} {x2 - 6:.1f},{y2:.1f}"
        lab = ""
        if e.get("label"):
            lx, ly = (x1 + x2) / 2, (y1 + y2) / 2
            if a_side in ("left", "right"):  # label on the convex side, away from neighbours
                if y2 < y1:
                    lx, ly, anc = lx - 10, ly - 6, "end"
                else:
                    lx, ly, anc = lx + 10, ly - 10, "start"
            else:
                lx, anc = lx + 12, "start"
            lab = (f'<text class="t-edge" x="{lx:.1f}" y="{ly:.1f}" text-anchor="{anc}" '
                   f'style="fill:var(--ink);paint-order:stroke;stroke:var(--ground);stroke-width:4px;stroke-linejoin:round" '
                   f'data-src="{e["id"]}">{esc(e["label"])}</text>')
        bed = (f'<path class="edge-bed" d="{d}" pathLength="1" '
               f'style="fill:none;stroke:var(--soft);stroke-width:var(--sw-glyph);stroke-linecap:round"/>')
        sock = (f'<circle cx="{x1:.1f}" cy="{y1:.1f}" r="3.0" '
                f'style="fill:var(--elev);stroke:var(--line);stroke-width:var(--sw-hair)"/>')
        out.append(f'<g id="n-{e["id"]}" class="edge" data-relation="{e["relation"]}">'
                   f'{bed}<path class="edge-path" d="{d}" pathLength="1" marker-end="url(#arrow)" '
                   f'style="fill:none;stroke:var(--line);stroke-width:var(--sw-edge);stroke-linecap:round"/>{sock}{lab}</g>')
    for k in node.get("children", []):
        render_edges(k, ctx, out)


def style_block(S, fonts=None, scope=":root"):
    """fonts: None (rely on page), 'file' (local file:// faces, for the harness), 'embed' (data URIs)."""
    r = S["roles"]
    vars_ = ";".join(f"--{k}:{v}" for k, v in r.items())
    sw = ";".join(f"--sw-{k}:{v}" for k, v in S["stroke"].items())
    rules = []
    fam = {"title": "display", "sub": "body", "caption": "body", "tick": "body", "hand": "hand",
           "num": "mono", "edge": S.get("edge_label_font", "hand")}
    for role, (size, wt) in S["type"].items():
        rules.append(f"{scope} .t-{role}{{font-family:{S['fonts'][fam[role]]};font-size:{size}px;font-weight:{wt}}}")
    rules.append(f"{scope} .t-strong{{font-weight:700}}")
    css = f"{scope}{{{vars_};{sw}}}\n" + "\n".join(rules)
    if fonts:
        css = font_face_css(embed=(fonts == "embed")) + "\n" + css
    return css


def compile_svg(spec, style, measurer=None, fonts="file", scope="svg"):
    M = measurer or Measurer()
    for _pass in range(2):  # pass 1 collects text to measure, pass 2 lays out with real widths
        ctx = Ctx(spec, style, M)
        W, H = spec["meta"]["canvas"]
        solve(spec["layout"], 0, 0, W, H, ctx)
        leaves = [render_leaf(n, ctx) for n in ctx.leaves]
        edges = []
        render_edges(spec["layout"], ctx, edges)
        if not M.pending:
            break
        M.flush()
    css = style_block(style, fonts=fonts, scope=scope)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
           f'data-symspec="{spec["meta"]["id"]}" data-style="{style["id"]}">\n'
           f'<title>{esc(spec["meta"]["title"])}</title>\n<style>{css}</style>\n'
           f'<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
           f'<path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--line);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>\n'
           f'<rect id="ground" x="0" y="0" width="{W}" height="{H}" style="fill:var(--ground)"/>\n'
           + "\n".join(leaves) + "\n" + "\n".join(edges) + "\n</svg>")
    return svg, ctx


# ---------------------------------------------------------------- explainer (beat-driven)
WPS = 2.7  # narration pace for durations derived from caption text (DVSpec: duration from narration)


def beat_timeline(spec):
    t, out = 0.0, []
    for b in spec["beats"]:
        d = round(len(b["caption"].split()) / WPS + 1.6, 2)
        out.append({**b, "start": round(t, 2), "end": round(t + d, 2)})
        t += d
    return out, round(t + 1.5, 2)


def compile_explainer(spec, styles, measurer=None):
    """One HTML: the same spec under each style record, driven by render(t) over beats."""
    M = measurer or Measurer()
    beats, total = beat_timeline(spec)
    svgs = {s["id"]: compile_svg(spec, s, M, fonts=None)[0] for s in styles}
    return beats, total, svgs


def resolve(svg, style):
    """Emit-time resolution for targets without CSS variables (pptx, raster pipelines)."""
    import re as _re
    R = dict(style["roles"])
    R.update({f"sw-{k}": str(v) for k, v in style["stroke"].items()})
    return _re.sub(r"var\(--([a-z\-]+)\)", lambda m: R.get(m.group(1), m.group(0)), svg)
