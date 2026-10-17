"""Emitters: one SymSpec -> the forms each skill consumes."""
import json, os, shutil, sys, re
sys.path.insert(0, '.')
from foundry.compile import compile_svg, resolve, beat_timeline, Ctx, solve
from foundry.render import to_png
from foundry.pen import Pen
from foundry.glyphs import GLYPHS
from foundry.measure import Measurer

os.makedirs('out/final', exist_ok=True)
spec = json.load(open('spec/tap.symspec.json'))
styles = {s: json.load(open(f'styles/{s}.json')) for s in ['milton-warm', 'ceti-night', 'deepmind-iridescent']}
M = Measurer()
for sid, st in styles.items():
    # standalone, fonts embedded: for /milton pages, editorial-dashboard, sharing
    svg, _ = compile_svg(spec, st, M, fonts='embed')
    open(f'out/final/tap.{sid}.svg', 'w').write(svg)
    open(f'out/tap.{sid}.svg', 'w').write(svg)
    # resolved hex, no CSS vars: for /artifact-chain (pptx) and raster pipelines
    open(f'out/final/tap.{sid}.resolved.svg', 'w').write(resolve(svg, st))
    open(f'out/tap.{sid}.resolved.svg', 'w').write(resolve(svg, st))
    to_png(f'out/final/tap.{sid}.svg', f'out/final/tap.{sid}@2x.png', scale=2)
    shutil.copyfile(f'out/final/tap.{sid}@2x.png', f'out/tap.{sid}@2x.png')
    shutil.copyfile(f'out/final/tap.{sid}@2x.png', f'out/tap.{sid}.v7@2x.png')

# glyph sprite: every leaf as a reusable <symbol> (icon slots, editorial-dashboard spots)
st = styles['milton-warm']
syms = []
def walk(n):
    yield n
    for k in n.get('children', []): yield from walk(k)
for n in walk(spec['layout']):
    if n.get('leaf') != 'glyph': continue
    P = Pen(st, seed=n['id'], measure=lambda s, r: M.width(s, *{'caption':('DM Sans',15,500),'tick':('DM Sans',13,400),'num':('JetBrains Mono',16,400),'hand':('Caveat',21,500),'title':('Fraunces',30,600)}[r]))
    w, h = 320, 180
    GLYPHS[n['glyph']](P, w, h, n.get('params', {}), n['id'])
    syms.append(f'<symbol id="{spec["meta"]["id"]}-{n["id"]}" viewBox="0 0 {w} {h}" data-glyph="{n["glyph"]}" data-concept="{n["concept"]}">'
                f'<title>{n["concept"]}</title>{P.svg()}</symbol>')
M.flush()
sprite_svg = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' + '\n'.join(syms) + '\n</svg>'
open('out/final/tap.glyphs.sprite.svg', 'w').write(sprite_svg)
open('out/tap.glyphs.sprite.svg', 'w').write(sprite_svg)
beats, total = beat_timeline(spec)
json.dump({'beats': beats, 'total': total}, open('out/final/tap.beats.json', 'w'), indent=1)
json.dump({'beats': beats, 'total': total}, open('out/tap.beats.json', 'w'), indent=1)
print('emitted', total, 's')
