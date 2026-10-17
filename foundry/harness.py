"""Deterministic gate — runs before any VLM critic and is cheap enough to run on every repair.

H1 refs        every id the spec mentions resolves; every leaf cites a concept; every edge a relation
H2 provenance  every span is verbatim in the source; every concept has spans; every number printed
               on the canvas or spoken in a beat is grounded in the spans cited for it (number words
               are normalised: "eight to eight" grounds "8 : 8")
H3 vocabulary  only allow-listed SVG tags; no filters, gradients, images, foreignObject; no color
               literal anywhere outside the style block
H4 geometry    measured in Chromium with the delivery fonts: text-text overlap, text crossing an edge,
               text outside the canvas, leaf spilling out of its layout box, edge passing through a
               leaf it doesn't connect
H5 contrast    WCAG ratio of each text role against the ground, from the style record
H6 floor       each selected claim keeps a minimum number of drawn elements (no fixing by deleting)
H7 beats       every claim is revealed by some beat; reveal targets exist
"""
import json, re, pathlib, itertools
from .chromium import run_in_chromium
from .pen import ALLOWED_TAGS

# "one" is excluded: in speech it is mostly an article ("one cohort"), not a quantity.
NUMWORDS = {"zero": 0, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8,
            "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "fifteen": 15, "sixteen": 16, "twenty": 20,
            "thirty": 30, "forty": 40, "fifty": 50, "hundred": 100, "thousand": 1000}


def numbers_in(text):
    """Set of numeric values mentioned in text, digits or words ('twenty-five' -> 25, '$400,000' -> 400000)."""
    t = text.lower().replace("–", " ").replace("-", " ").replace("/", " ").replace(":", " ")
    vals = {float(m.replace(",", "")) for m in re.findall(r"\d[\d,]*(?:\.\d+)?", t)}
    for m in re.findall(r"\$?(\d+)\s*k\b", t):
        vals.add(float(m) * 1000)
    toks = re.findall(r"[a-z]+", t)
    cur, acc = None, 0
    for tok in toks + ["_end"]:
        if tok in NUMWORDS:
            v = NUMWORDS[tok]
            if v in (100, 1000):
                cur = (cur or 1) * v
                if v == 1000:
                    acc += cur
                    cur = 0
            else:
                if cur is not None and cur % 100 != 0 and (v >= 10 or cur % 10 != 0 or cur < 10):
                    vals.add(float(acc + cur))  # "fifty fifty" is two numbers, not 100
                    cur, acc = None, 0
                cur = (cur or 0) + v
        else:
            if cur is not None:
                total = acc + cur
                vals.add(float(total))
                if acc and cur:
                    vals.add(float(cur))
            cur, acc = None, 0
    return vals


def norm(s):
    return re.sub(r"\s+", " ", s.replace("’", "'").replace("—", "-").replace("–", "-")).strip()


def run(spec, svg_text, style, source_text, png_dir=None):
    F = []  # findings: dict(check, severity, anchor, msg)
    add = lambda c, sev, a, m: F.append({"check": c, "severity": sev, "anchor": a, "msg": m})

    spans = {s["id"]: s for s in spec["spans"]}
    concepts = {c["id"]: c for c in spec["concepts"]}
    relations = {r["id"]: r for r in spec["relations"]}
    claims = {k["id"]: k for k in spec["claims"]}

    def walk(n):
        yield n
        for k in n.get("children", []):
            yield from walk(k)
    nodes = {n["id"]: n for n in walk(spec["layout"])}
    edges = {e["id"]: e for n in nodes.values() for e in n.get("edges", [])}

    # ---------------- H1 refs
    for n in nodes.values():
        if "leaf" in n:
            if n.get("concept") not in concepts:
                add("H1", "error", n["id"], f"leaf cites unknown concept {n.get('concept')}")
            for b in n.get("params", {}).get("branches", []):
                if b.get("concept") not in concepts:
                    add("H1", "error", n["id"], f"branch cites unknown concept {b.get('concept')}")
    for e in edges.values():
        if e["relation"] not in relations:
            add("H1", "error", e["id"], "edge cites unknown relation")
        for end in (e["from"], e["to"]):
            if end.split(".")[0] not in nodes:
                add("H1", "error", e["id"], f"edge endpoint {end} missing")
    for r in relations.values():
        for c in ([r["from"]] if isinstance(r["from"], str) else r["from"]) + ([r["to"]] if isinstance(r["to"], str) else r["to"]):
            if c not in concepts:
                add("H1", "error", r["id"], f"relation endpoint {c} unknown")
    used = {n.get("concept") for n in nodes.values()} | {c for n in nodes.values() for c in n.get("cites", [])} | {b["concept"] for n in nodes.values() for b in n.get("params", {}).get("branches", [])}
    for c in concepts:
        if c not in used:
            add("H1", "warn", c, "concept never drawn")

    # ---------------- H2 provenance
    src = norm(source_text)
    for s in spans.values():
        if norm(s["quote"]) not in src:
            add("H2", "error", s["id"], "quote is not verbatim in source")
    for c in concepts.values():
        if not c.get("spans"):
            add("H2", "error", c["id"], "concept has no evidence span")
        for sid in c.get("spans", []):
            if sid not in spans:
                add("H2", "error", c["id"], f"unknown span {sid}")

    def grounded_numbers(span_ids):
        v = set()
        for sid in span_ids:
            v |= numbers_in(spans[sid]["quote"]) if sid in spans else set()
        return v

    def node_spans(nid):
        n = nodes.get(nid) or edges.get(nid)
        ids = set()
        if n is None:
            return ids
        if "relation" in n:
            return set(relations[n["relation"]]["spans"])
        for cid in [n.get("concept")] + n.get("cites", []):
            ids |= set(concepts.get(cid, {}).get("spans", []))
        for b in n.get("params", {}).get("branches", []):
            ids |= set(concepts[b["concept"]]["spans"])
        for rid in claims.get(n.get("claim"), {}).get("relations", []):
            ids |= set(relations[rid]["spans"])
        return ids

    meta_numbers = numbers_in("Oct 9")  # title may cite the meeting date
    for m in re.finditer(r'<text[^>]*data-src="([^"]+)"[^>]*>([^<]*)</text>', svg_text):
        nid, txt = m.group(1), m.group(2).replace("&amp;", "&")
        printed = numbers_in(txt)
        ok = grounded_numbers(node_spans(nid)) | (meta_numbers if nodes.get(nid, {}).get("leaf") == "title" else set())
        bad = {x for x in printed if x not in ok}
        if bad:
            add("H2", "error", nid, f"number(s) {sorted(int(b) if b.is_integer() else b for b in bad)} in “{txt}” not found in cited spans")
    for b in spec["beats"]:
        bad = numbers_in(b["caption"]) - grounded_numbers(b["spans"])
        if bad:
            add("H2", "error", b["id"], f"narration number(s) {sorted(bad)} not in beat spans")

    # ---------------- H3 vocabulary
    body = re.sub(r"<style>.*?</style>", "", svg_text, flags=re.S)
    for tag in set(re.findall(r"<([a-zA-Z]+)[\s>/]", body)):
        if tag not in ALLOWED_TAGS:
            add("H3", "error", tag, f"tag <{tag}> not in vocabulary")
    for bad in ("filter", "Gradient", "<image", "foreignObject"):
        if bad in body:
            add("H3", "error", bad, f"forbidden construct {bad}")
    lits = re.findall(r"#[0-9a-fA-F]{3,8}\b|rgba?\(", body)
    if lits:
        add("H3", "error", "svg", f"{len(lits)} color literal(s) outside the style block, e.g. {lits[:3]}")

    # ---------------- H4 geometry (Chromium, real fonts)
    W, H = spec["meta"]["canvas"]
    tmp = pathlib.Path(png_dir or "/tmp") / "_harness.svg"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(svg_text)
    js_geo = """() => {
      const abs = el => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
      const texts = [...document.querySelectorAll('text')].map((t,i) => ({i, src: t.dataset.src||'', s: t.textContent, bb: abs(t)}));
      const leaves = [...document.querySelectorAll('g.leaf')].map(g => ({id: g.id.slice(2), bb: abs(g)}));
      const edges = [...document.querySelectorAll('g.edge')].map(g => {
         const p = g.querySelector('path.edge-path') || g.querySelector('path');
         const id = g.id.slice(2), L = p.getTotalLength(), pts = [];
         for (let k=1;k<40;k++){ const q = p.getPointAtLength(L*k/40); pts.push([q.x,q.y]); }
         return {id, pts};
      });
      return {texts, leaves, edges};
    }"""
    geo = run_in_chromium(tmp.resolve().as_uri(), viewport_w=W, viewport_h=H, js_eval=js_geo)["result"]

    def inter(a, b_):
        return max(0, min(a[2], b_[2]) - max(a[0], b_[0])) * max(0, min(a[3], b_[3]) - max(a[1], b_[1]))

    T = geo["texts"]
    for a, c in itertools.combinations(T, 2):
        ov = inter(a["bb"], c["bb"])
        if ov > 4:
            add("H4", "error", f'{a["src"]}|{c["src"]}', f'text overlap {ov:.0f}px²: “{a["s"]}” × “{c["s"]}”')
    for t in T:
        x0, y0, x1, y1 = t["bb"]
        if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
            add("H4", "error", t["src"], f'text “{t["s"]}” leaves the canvas')
    for e in geo["edges"]:
        eobj = edges[e["id"]]
        ends = {eobj["from"].split(".")[0], eobj["to"].split(".")[0]}
        for t in T:
            if t["src"] == e["id"]:
                continue
            x0, y0, x1, y1 = t["bb"]
            if any(x0 - 2 <= px <= x1 + 2 and y0 - 2 <= py <= y1 + 2 for px, py in e["pts"]):
                add("H4", "error", f'{e["id"]}|{t["src"]}', f'edge crosses text “{t["s"]}”')
        for lf in geo["leaves"]:
            if lf["id"] in ends:
                continue
            x0, y0, x1, y1 = lf["bb"]
            hits = sum(x0 + 4 <= px <= x1 - 4 and y0 + 4 <= py <= y1 - 4 for px, py in e["pts"])
            if hits >= 3:
                add("H4", "warn", f'{e["id"]}|{lf["id"]}', f"edge runs through leaf {lf['id']}")
    from .compile import Ctx, solve  # layout boxes for spill check
    ctx = Ctx(spec, style, None)
    solve(spec["layout"], 0, 0, W, H, ctx)
    for lf in geo["leaves"]:
        x, y, w, h = ctx.boxes[lf["id"]]
        x0, y0, x1, y1 = lf["bb"]
        spill = max(x - x0, y - y0, x1 - (x + w), y1 - (y + h))
        if spill > 3:
            add("H4", "warn", lf["id"], f"drawing spills {spill:.0f}px outside its layout box")

    # ---------------- H5 contrast
    def lum(hx):
        hx = hx.lstrip("#")
        rgb = [int(hx[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]

    def ratio(a, b_):
        la, lb = sorted([lum(a), lum(b_)], reverse=True)
        return (la + 0.05) / (lb + 0.05)
    R = style["roles"]
    used_fills = set(re.findall(r'<text[^>]*style="fill:var\(--([a-z\-]+)\)', svg_text))
    for f in used_fills:
        bg = "accent" if f == "ground" else "ground"  # ground-coloured text only sits on accent chips
        r_ = ratio(R[f], R[bg])
        need = 4.5
        if r_ < need:
            add("H5", "error" if r_ < 3 else "warn", f"text:{f}", f"contrast {r_:.2f}:1 on {bg} (need {need})")

    # ---------------- H6 complexity floor & H8 volumetric depth planes
    def extract_leaf_svg(svg_s, leaf_id):
        m = re.search(rf'<g id="n-{re.escape(leaf_id)}"[^>]*>', svg_s)
        if not m:
            return ""
        pos = m.end()
        depth = 1
        tag_re = re.compile(r'<(/?)g(?:\s[^>]*)?>')
        while depth > 0:
            tm = tag_re.search(svg_s, pos)
            if not tm:
                break
            if tm.group(0).endswith("/>"):
                pos = tm.end()
                continue
            depth += -1 if tm.group(1) == "/" else 1
            pos = tm.end()
        return svg_s[m.start():pos]

    for lf in [n for n in nodes.values() if n.get("leaf") == "glyph"]:
        g_txt = extract_leaf_svg(svg_text, lf["id"])
        cnt = len(re.findall(r"<(path|rect|circle|ellipse|polygon|line)\b", g_txt))
        from .glyphs import REGISTRY
        floor = REGISTRY.get(lf["glyph"], {}).get("floor", 4)
        if cnt < floor:
            add("H6", "error", lf["id"], f"only {cnt} drawn elements (need >= {floor})")
        z_planes = set(re.findall(r'data-z="(\d+)"', g_txt))
        if len(z_planes) < 3:
            add("H8", "warn", lf["id"], f"only {len(z_planes)} depth plane(s) (need >= 3 for volumetric 2.5D hierarchy)")
        if "<title>" not in g_txt or "<desc>" not in g_txt:
            add("H8", "warn", lf["id"], "missing <title> or poetic <desc> (Milton ICONS.md §4 Step 5 contract)")

    # ---------------- H7 beats
    revealed = set()
    for bt in spec["beats"]:
        for r in bt["reveal"]:
            if r not in nodes and r not in edges:
                add("H7", "error", bt["id"], f"reveal target {r} missing")
        revealed |= {nodes[r].get("claim") for r in bt["reveal"] if r in nodes}
    for k in claims:
        if k not in revealed:
            add("H7", "error", k, "claim never revealed by a beat")

    return F


def summarize(F):
    by = {}
    for f in F:
        by.setdefault(f["check"], {"error": 0, "warn": 0})[f["severity"]] += 1
    return by
