import json, sys
sys.path.insert(0, '.')
from foundry.compile import compile_svg
from foundry.render import to_png
v = sys.argv[1]
spec = json.load(open('spec/tap.symspec.json'))
for sid in ['milton-warm', 'ceti-night']:
    st = json.load(open(f'styles/{sid}.json'))
    svg, _ = compile_svg(spec, st)
    open(f'out/tap.{sid}.{v}.svg', 'w').write(svg)
    to_png(f'out/tap.{sid}.{v}.svg')
print('built', v)
