import json, sys
sys.path.insert(0, '.')
from foundry.harness import run, summarize
spec = json.load(open(sys.argv[1])); svg = open(sys.argv[2]).read(); st = json.load(open(sys.argv[3]))
src = open(spec['meta']['source']['file']).read()
F = run(spec, svg, st, src, png_dir='out')
json.dump(F, open(sys.argv[4], 'w'), indent=1, ensure_ascii=False)
print(summarize(F))
for f in F: print(f"{f['check']} {f['severity']:5} {f['anchor']:22} {f['msg']}")
