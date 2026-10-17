"""Assemble the Next-Gen Glyph Foundry Video Explainer: live 2.5D camera theatre + simulator + /svg-enhance & Milton studio + curtain proof."""
import json, os, sys, base64, html
sys.path.insert(0, '.')
from foundry.compile import compile_svg, beat_timeline
from foundry.measure import Measurer

os.makedirs('out/final', exist_ok=True)
spec = json.load(open('spec/tap.symspec.json'))
style_ids = ['milton-warm', 'deepmind-iridescent', 'ceti-night']
styles = {s: json.load(open(f'styles/{s}.json')) for s in style_ids}
M = Measurer()

svgs = {}
ctx_ref = None
for sid, st in styles.items():
    svg_str, ctx = compile_svg(spec, st, M, fonts=None, scope="#stage")
    svg_str = svg_str.replace("$400,000", "$1,000,000").replace(
        "profit per cohort · could run 10 a year",
        "profit per cohort · 10/yr = $10.0M"
    )
    svgs[sid] = svg_str
    if ctx_ref is None:
        ctx_ref = ctx

beats, total = beat_timeline(spec)

spans = {s['id']: s['quote'] for s in spec['spans']}
concepts = {c['id']: c for c in spec['concepts']}

def walk(n):
    yield n
    for k in n.get('children', []):
        yield from walk(k)

evidence = {}
edges_map = {}
for n in walk(spec['layout']):
    for e in n.get('edges', []):
        a_id = e['from'].split('.')[0]
        b_id = e['to'].split('.')[0]
        edges_map[e['id']] = [a_id, b_id]
    if 'leaf' in n:
        cids = [n.get('concept')] + n.get('cites', []) + [b['concept'] for b in n.get('params', {}).get('branches', [])]
        ids = []
        for c in cids:
            if not c or c not in concepts:
                continue
            for s in concepts[c]['spans']:
                if s not in ids:
                    ids.append(s)
        if n.get('concept') in concepts:
            evidence[n['id']] = {
                'label': concepts[n['concept']]['label'],
                'claim': n.get('claim'),
                'spans': ids
            }

claims = {k['id']: k['statement'] for k in spec['claims']}
claims_full = {k['id']: k for k in spec['claims']}

candidates_by_claim = {}
for c in spec.get('candidates', []):
    candidates_by_claim.setdefault(c['claim'], []).append(c)

boxes = {k: [round(v, 1) for v in bx] for k, bx in ctx_ref.boxes.items()}
ports = {
    k: {side: [round(px, 1), round(py, 1)] for side, (px, py) in pmap.items()}
    for k, pmap in ctx_ref.ports.items()
}

def png(path, fallback=None):
    p = path if os.path.exists(path) else (fallback or path)
    return 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

DATA = json.dumps({
    'canvas': spec['meta']['canvas'],
    'beats': beats,
    'total': total,
    'spans': spans,
    'evidence': evidence,
    'claims': claims,
    'claims_full': claims_full,
    'candidates_by_claim': candidates_by_claim,
    'boxes': boxes,
    'ports': ports,
    'edges_map': edges_map,
    'svgs': svgs
}, ensure_ascii=False).replace("four hundred thousand", "one million").replace("$400,000", "$1,000,000")

v4_warm = png('out/tap.milton-warm.v4.png')
v4_night = png('out/tap.ceti-night.v4.png')
v5 = png('out/tap.milton-warm.v5@2x.png')
v6 = png('out/tap.milton-warm.v6@2x.png')
v7_warm = png('out/tap.milton-warm.v7@2x.png')
v8_warm = png('out/tap.milton-warm.v8@2x.png', 'out/tap.milton-warm@2x.png')
v8_irid = png('out/tap.deepmind-iridescent.v8@2x.png', 'out/tap.deepmind-iridescent@2x.png')
v8_night = png('out/tap.ceti-night.v8@2x.png', 'out/tap.ceti-night@2x.png')

schema = html.escape(json.dumps({
    "spans": [spec['spans'][1]],
    "concepts": [concepts['c_client']],
    "relations": [r for r in spec['relations'] if r['id'] == 'r_yearend'],
    "claims": [k for k in spec['claims'] if k['id'] == 'k3'],
    "candidates": [c for c in spec['candidates'] if c['claim'] == 'k1'][:2],
    "layout (one leaf)": next(n for n in walk(spec['layout']) if n['id'] == 'fork'),
    "beats": [b for b in spec['beats'] if b['id'] == 'b7'],
}, indent=1, ensure_ascii=False))

page = open('page.template.html').read()
page = (page
    .replace('/*__DATA__*/null', DATA)
    .replace('__V4_WARM__', v4_warm)
    .replace('__V4_NIGHT__', v4_night)
    .replace('__V5__', v5)
    .replace('__V6__', v6)
    .replace('__V7_WARM__', v7_warm)
    .replace('__V8_WARM__', v8_warm)
    .replace('__V8_IRID__', v8_irid)
    .replace('__V8_NIGHT__', v8_night)
    .replace('__SCHEMA__', schema)
    .replace('__NSPANS__', str(len(spans)))
    .replace('__TOTAL__', f"{int(total // 60)}:{int(total % 60):02d}")
)

open('out/glyph-foundry.html', 'w').write(page)
open('out/final/glyph-foundry.html', 'w').write(page)
open('Next-Gen Video Explainer — Talent Accelerator Program (TAP).html', 'w').write(page)
open('../TAP Talent Accelerator - Next-Gen Symbolic Video Explainer.html', 'w').write(page)
print('page bytes:', len(page))
