# Interactive Patterns

The difference between a v1 dashboard and a great one is whether the reader can *enact* an idea, not just read it. This document catalogs four reusable interactive section patterns.

## Pattern 1 — The Stripping Slider (subtractive demonstration)

**When to use:** the concept is "less of X is worse, not better" — meaning the reader should drag a slider and *feel* something good getting destroyed.

**Concept this fits:** "Just enough is more" (the original use), "abundance vs minimalism", "complexity vs simplicity", "tradition vs modernization", "diversity vs monoculture".

### How it works

A complex SVG (a Persian rug, a stained-glass window, a city skyline, a coral reef — anything richly detailed) has its layers tagged with classes. As the user drags a slider 0→100, layers fade out in order of "ornament-ness". At 100% the SVG is reduced to a flat shape. A label updates: "just enough" → "less detail" → "less still" → "sparse" → "a solid blue rug."

A "sweet-spot" tick on the slider track shows where *just enough* lives — visual anchor for the philosophical point.

### CSS

```css
.rug-track {
  position: relative;
  flex: 1;
}
.rug-track input[type="range"] {
  width: 100%;
  -webkit-appearance: none; appearance: none;
  height: 4px;
  background: var(--ink);
  border-radius: 2px;
  cursor: pointer;
}
/* The sweet-spot indicator above the track */
.rug-sweet {
  position: absolute;
  top: -22px;
  left: 0%;          /* 0% because dragging RIGHT removes detail */
  transform: translateX(-50%);
  pointer-events: none;
}
.rug-sweet::before {
  content: "";
  position: absolute;
  top: 18px; left: 50%;
  transform: translateX(-50%);
  width: 2px; height: 12px;
  background: var(--red);
}
.rug-sweet span {
  font-family: var(--hand);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--red);
  white-space: nowrap;
  display: block;
  transform: rotate(-2deg);
}
```

### HTML

```html
<div class="rug-controls">
  <span>Soul ↓</span>
  <div class="rug-track">
    <span class="rug-sweet"><span>just enough</span></span>
    <input type="range" id="rug-slider" min="0" max="100" value="0">
  </div>
  <span id="rug-status">Just enough</span>
</div>
```

### JS

```js
var rugSlider = document.getElementById('rug-slider');
var rugStatus = document.getElementById('rug-status');
var rugLayers = document.querySelectorAll('#rug-svg .ornament');

function updateRug(pct) {
  // Each layer has a data-rank attribute; higher rank = stripped earlier
  rugLayers.forEach(function(layer){
    var rank = +layer.dataset.rank;
    var threshold = (rank / rugLayers.length) * 100;
    layer.style.opacity = pct > threshold ? 0 : 1;
  });

  var label = 'Just enough';
  if (pct >= 20 && pct < 40)      label = 'Less detail';
  else if (pct >= 40 && pct < 65) label = 'Less still';
  else if (pct >= 65 && pct < 90) label = 'Sparse';
  else if (pct >= 90)             label = 'A solid blue rug.';
  rugStatus.textContent = label;
}

rugSlider.addEventListener('input', function(e){ updateRug(e.target.value); });
```

### Why it works

- The reader physically *destroys ornament* with their hand. The visceral point lands.
- The sweet-spot tick at 0% with hand-lettered "just enough" is the philosophical anchor.
- The status labels evolve as the slider moves, paying off the gesture verbally.

## Pattern 2 — The Drawing Canvas (enacted principle)

**When to use:** the concept is about *making* — drawing, writing, marking, building. The reader should pick up a finger (or mouse) and DO the thing.

**Concept this fits:** "Drawing changes the brain" (original use), "writing IS thinking", "the only way out is through", "practice creates the practitioner".

### How it works

A `<canvas>` element with mouse + touch handlers. As the user draws, the total stroke distance accumulates. Crossing distance thresholds rolls out a sequence of *affirmations* — short Glaserian observations that follow the arc:

```
"a blank page is also a beginning" (start)
↓
"you just made a mark. that's not nothing."
↓
"these strokes are new neural connections."
↓
"drawing IS thinking. you're thinking."
↓
"every line slightly rewires your brain."
↓
"good. now stop reading and look at what you made." (last)
```

A reset button clears the canvas and restarts the affirmation sequence.

### HTML

```html
<div class="canvas-wrap">
  <canvas id="brain-canvas" width="1200" height="900" aria-label="Drawing surface"></canvas>
  <div class="canvas-hint" id="canvas-hint">draw here →</div>
</div>
<div class="canvas-controls">
  <span class="canvas-affirm" id="canvas-affirm">— a blank page is also a beginning</span>
  <button class="canvas-reset" id="canvas-reset" type="button">reset</button>
</div>
```

### CSS

```css
.canvas-wrap {
  position: relative;
  border: 2px solid var(--paper);
  background: var(--paper);
  aspect-ratio: 4 / 3;
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.4);
  overflow: hidden;
}
.canvas-wrap canvas {
  display: block; width: 100%; height: 100%;
  cursor: crosshair;
  touch-action: none;
}
.canvas-hint {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  pointer-events: none;
  font-family: var(--hand);
  font-weight: 600; font-size: 1.5rem;
  color: var(--ink);
  opacity: 0.4;
  transition: opacity 200ms;
}
.canvas-hint.hidden { opacity: 0; }
.canvas-affirm {
  font-family: var(--display);
  font-variation-settings: "opsz" 14, "SOFT" 60, "WONK" 1;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--yellow);
  transition: opacity 250ms;
}
.canvas-reset {
  border: 1px solid var(--paper-deep);
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### JS

```js
(function(){
  var canvas = document.getElementById('brain-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var hint = document.getElementById('canvas-hint');
  var affirmEl = document.getElementById('canvas-affirm');
  var resetBtn = document.getElementById('canvas-reset');

  var affirmations = [
    '— a blank page is also a beginning',
    'you just made a mark. that\'s not nothing.',
    'these strokes are new neural connections.',
    'drawing IS thinking. you\'re thinking.',
    'every line slightly rewires your brain.',
    'good. now stop reading and look at what you made.'
  ];

  var stroked = 0;       // accumulated path distance
  var lastIdx = -1;
  function pickAffirmation(){
    var idx = Math.min(affirmations.length - 1, Math.floor(stroked / 220));
    if (idx !== lastIdx) {
      lastIdx = idx;
      affirmEl.style.opacity = '0';
      setTimeout(function(){
        affirmEl.textContent = affirmations[idx];
        affirmEl.style.opacity = '1';
      }, 180);
    }
  }

  function setupBrush(){
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1A1612'; ctx.lineWidth = 4;
  }
  setupBrush();

  var drawing = false, lastX = 0, lastY = 0, hintHidden = false;

  function getPos(e){
    var rect = canvas.getBoundingClientRect();
    var sx = canvas.width / rect.width;
    var sy = canvas.height / rect.height;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }
  function start(e){
    e.preventDefault(); drawing = true;
    var p = getPos(e); lastX = p.x; lastY = p.y;
    if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
  }
  function move(e){
    if (!drawing) return;
    e.preventDefault();
    var p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    var dx = p.x - lastX, dy = p.y - lastY;
    stroked += Math.sqrt(dx*dx + dy*dy);
    lastX = p.x; lastY = p.y;
    pickAffirmation();
  }
  function end(){ drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove',  move,  { passive: false });
  window.addEventListener('touchend', end);

  resetBtn.addEventListener('click', function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupBrush();
    stroked = 0; lastIdx = -1;
    affirmEl.style.opacity = '0';
    setTimeout(function(){
      affirmEl.textContent = affirmations[0];
      affirmEl.style.opacity = '1';
    }, 180);
    hint.classList.remove('hidden');
    hintHidden = false;
  });
})();
```

### Why it works

- The principle becomes a verb. The reader makes marks; the affirmations roll out *only as they accumulate distance*; the experience pays off the action.
- The hand-lettered hint "draw here →" disappears on first stroke — no clumsy onboarding text remaining.
- Touch events handled, so it works on phones.

## Pattern 3 — The Three-Axis Dial (interactive ethics)

**When to use:** the concept is a *tradeoff between three forces*, where any extreme is wrong and balance is the lesson.

**Concept this fits:** Glaser's triad — Client/Audience/You (original use), but also: Speed/Quality/Cost (the project triangle), Body/Mind/Spirit, Past/Present/Future, Self/Family/Community, Truth/Beauty/Goodness.

### How it works

Three sliders that always sum to 100 (changing one redistributes the others proportionally). A triangular SVG with three labeled vertices, and an indicator (knot) that moves to the *barycentric* position weighted by the three values. A live verdict text below updates based on the distribution:

- All-one-vertex (>70%) → "you become a propagandist", "you make art not design", etc.
- Balanced (max-min ≤ 18) → "this is what [subject] called ethics"
- One-vertex-ignored (<12%) → "someone's missing"
- Tilted → "tilted toward X — most real commissions live here"

### HTML

```html
<div class="triad-stage">
  <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" id="triad-svg">
    <polygon points="110,28 28,170 192,170" fill="rgba(241,235,221,0.6)"
             stroke="#1A1612" stroke-width="2" stroke-dasharray="3,4"/>
    <circle cx="110" cy="28" r="22" fill="#D62828" stroke="#1A1612" stroke-width="2.5"/>
    <text x="110" y="32" font-family="JetBrains Mono" font-size="9"
          fill="#F1EBDD" text-anchor="middle" font-weight="700">CLIENT</text>
    <circle cx="28" cy="170" r="22" fill="#1D3557" stroke="#1A1612" stroke-width="2.5"/>
    <text x="28" y="173" font-family="JetBrains Mono" font-size="8"
          fill="#F1EBDD" text-anchor="middle" font-weight="700">AUDIENCE</text>
    <circle cx="192" cy="170" r="22" fill="#F4C430" stroke="#1A1612" stroke-width="2.5"/>
    <text x="192" y="174" font-family="JetBrains Mono" font-size="11"
          fill="#1A1612" text-anchor="middle" font-weight="700">YOU</text>
    <!-- The knot — moves to the weighted center -->
    <g id="triad-knot" class="triad-knot">
      <circle cx="0" cy="0" r="14" fill="#F1EBDD" stroke="#1A1612" stroke-width="2"/>
      <circle cx="0" cy="0" r="6" fill="#1A1612"/>
    </g>
  </svg>
</div>

<div class="triad-sliders">
  <div class="triad-slider-row">
    <span><span class="swatch" style="background:#D62828"></span> Client</span>
    <input type="range" id="t-client" min="0" max="100" value="33">
    <span class="pct" id="t-client-pct">33</span>
  </div>
  <!-- repeat for audience and you -->
</div>

<div class="triad-verdict balanced" id="triad-verdict">
  <span class="label">balanced</span>
  This is what [subject] called <em>ethics</em>.
</div>
```

### JS

```js
(function(){
  var c = document.getElementById('t-client');
  var a = document.getElementById('t-audience');
  var y = document.getElementById('t-you');
  var knot = document.getElementById('triad-knot');
  var verdict = document.getElementById('triad-verdict');
  if (!c || !a || !y || !knot || !verdict) return;

  // Triangle vertex positions in SVG coords (must match the polygon points)
  var V_CLIENT   = { x: 110, y: 28  };
  var V_AUDIENCE = { x: 28,  y: 170 };
  var V_YOU      = { x: 192, y: 170 };

  function normalize(changed){
    var vc = +c.value, va = +a.value, vy = +y.value;
    var keepVal = (changed === 'c' ? vc : changed === 'a' ? va : vy);
    keepVal = Math.max(0, Math.min(100, keepVal));
    var remain = 100 - keepVal;
    var others = ['c','a','y'].filter(function(k){ return k !== changed; });
    var o1Val = (others[0] === 'c' ? vc : others[0] === 'a' ? va : vy);
    var o2Val = (others[1] === 'c' ? vc : others[1] === 'a' ? va : vy);
    var oSum = o1Val + o2Val;
    var o1New, o2New;
    if (oSum <= 0) { o1New = remain / 2; o2New = remain / 2; }
    else { o1New = remain * (o1Val / oSum); o2New = remain * (o2Val / oSum); }
    o1New = Math.round(o1New); o2New = Math.round(o2New);
    var drift = 100 - (keepVal + o1New + o2New);
    o1New += drift;
    function setSlider(k, v){
      if (k === 'c') c.value = v;
      else if (k === 'a') a.value = v;
      else y.value = v;
    }
    setSlider(changed, keepVal);
    setSlider(others[0], o1New);
    setSlider(others[1], o2New);
  }

  function update(){
    var vc = +c.value, va = +a.value, vy = +y.value;
    document.getElementById('t-client-pct').textContent = vc;
    document.getElementById('t-audience-pct').textContent = va;
    document.getElementById('t-you-pct').textContent = vy;

    // Barycentric position
    var total = vc + va + vy || 1;
    var x = (V_CLIENT.x*vc + V_AUDIENCE.x*va + V_YOU.x*vy) / total;
    var py = (V_CLIENT.y*vc + V_AUDIENCE.y*va + V_YOU.y*vy) / total;
    knot.setAttribute('transform', 'translate(' + x.toFixed(2) + ',' + py.toFixed(2) + ')');

    // Verdict logic
    var max = Math.max(vc, va, vy);
    var min = Math.min(vc, va, vy);
    var label, body, balanced = false;

    if (max >= 70) {
      if (vc === max)      { label = 'all client';   body = 'You serve. Be careful what you serve.'; }
      else if (va === max) { label = 'all audience'; body = 'You become a propagandist.'; }
      else                 { label = 'all you';      body = 'You make art, not design. Beautiful — but is it the work?'; }
    } else if (min < 12) {
      label = 'someone\'s missing';
      body = 'You\'ve dropped a party from the triad.';
    } else if (max - min <= 18) {
      label = 'balanced';
      body = 'This is what [subject] called <em>ethics</em>.';
      balanced = true;
    } else {
      label = 'tilted';
      body = 'A working compromise — most real commissions live here.';
    }
    verdict.classList.toggle('balanced', balanced);
    verdict.innerHTML = '<span class="label">' + label + '</span>' + body;
  }

  [['c', c], ['a', a], ['y', y]].forEach(function(pair){
    pair[1].addEventListener('input', function(){
      normalize(pair[0]);
      update();
    });
  });
  update();
})();
```

### Why it works

- The slider redistribution preserves the conservation law (sum = 100). The reader can't cheat.
- The barycentric indicator gives instant geometric feedback for any distribution.
- The verdict text reads like the *subject's* judgment, not a tooltip — that's the editorial move.

## Pattern 4 — The Hover-to-Reveal Grid (multiple-cases-of-one-thing)

**When to use:** the concept is "the same thing rendered N ways" — Picasso's bull, Bach's variations, color theory, six grandmother stews.

**Concept this fits:** "Same bull, six styles" (original Glaser use), comparison of approaches, exploration of variations.

### How it works

A grid of N cells, each containing the same conceptual object rendered in a different idiom. On hover, the cell scales slightly, label fades in. Optional: a single label below the grid summarizes the lesson.

### HTML

```html
<div class="bull-grid">
  <div class="bull-cell" data-stage="1">
    <svg viewBox="0 0 100 100">...</svg>
    <span class="stage-label">I · Realism</span>
  </div>
  <div class="bull-cell" data-stage="2">
    <svg viewBox="0 0 100 100">...</svg>
    <span class="stage-label">II · Stylized</span>
  </div>
  <!-- ...etc -->
</div>
<p class="bull-coda">→ Same animal. Six logics. Each complete in itself.</p>
```

### CSS

```css
.bull-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
}
.bull-cell {
  border: 1.5px solid var(--ink);
  padding: 1rem;
  background: var(--paper);
  transition: transform 220ms ease;
  cursor: default;
}
.bull-cell:hover {
  transform: translateY(-2px) scale(1.015);
  box-shadow: 4px 4px 0 var(--ink);
}
.bull-cell .stage-label {
  font-family: var(--mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  display: block;
  margin-top: 0.6rem;
  opacity: 0.7;
  transition: opacity 220ms;
}
.bull-cell:hover .stage-label {
  opacity: 1;
  color: var(--red);
}
```

### Why it works

- No JS needed (pure CSS hover).
- The grid format itself communicates "all of these are equally valid".
- The hover acts as a soft invitation to look at one closely.

## Choosing a pattern

| Concept type | Pattern |
|---|---|
| Less of X is worse | 1 — Stripping slider |
| The principle should be DOable | 2 — Drawing canvas (or other enacting widget) |
| Tradeoff between 3 forces | 3 — Three-axis dial |
| Same thing, N ways | 4 — Hover grid |

Each dashboard usually has 1–2 interactive sections, not more. The rest is text + icons.
Don't make every section interactive — the eye needs rest, and the interactive moments need to feel earned.

---

## Pattern 5 — N-Axis Cycle Dial (mutual generation/restraint)

**When to use:** the concept is a *system of N elements with mutual relationships* — Five Elements (Wood/Fire/Earth/Metal/Water), seven chakras, the four humors, an ecosystem food web, a balance-sheet of any sort with N>3 axes.

This generalizes Pattern 3 (the 3-axis triad) to any N. Where the triad uses barycentric coordinates inside a triangle, the cycle dial uses *element radii* on a regular polygon, with two overlaid relationship cycles (one positive — generates / nourishes / supports — and one negative — restrains / destroys / consumes).

### Concept this fits

- Five Elements (五行) — Tang medicine, generation/destruction cycles
- The four humors — sanguine/choleric/melancholic/phlegmatic, with Galenic correspondences
- A six-character cast (each character empowers two others, antagonizes two others)
- Any "this kind of energy nourishes that one and chokes off this third one" diagnostic system

### How it works

A regular N-pointed polygon. Each vertex is an element-circle whose *radius* scales with that element's slider value (0..100 → 14..36 px). Two cycles drawn through the vertices:

- **Generation cycle** (Sheng / supportive): a polygon connecting each element to the next, drawn dashed in the page's positive accent color (jade/green/blue).
- **Restraint cycle** (Ke / antagonistic): a star polygon (skipping one) drawn dashed in the page's negative accent color (vermilion/red).

A live verdict text below updates based on the slider distribution. Crucially, the verdict is *diagnostic prose* in the subject's domain language, not a generic balance score:

- Balanced (max−min ≤ 12) → "the five organs in concert; qi flows, blood follows"
- One element overflows (max ≥ 70) → "wood overflows: liver wind rises, the eyes are red"
- One element depleted (min < 8) → "metal depleted: the breath is shallow, grief lingers"
- Tilted → "tilted toward fire — heart is generating earth too eagerly, check the spleen"

### HTML

```html
<div class="elements-grid">
  <!-- The pentagonal star with Sheng (generation) and Ke (destruction) cycles -->
  <div class="elements-stage">
    <svg viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer pentagon (Sheng/generation cycle) -->
      <polygon points="190,40 322,140 272,290 108,290 58,140"
               fill="none" stroke="#4F7A57" stroke-width="2.5"
               stroke-dasharray="6,4" opacity="0.55"/>
      <!-- Inner star (Ke/destruction cycle, lighter) -->
      <polygon points="190,40 272,290 58,140 322,140 108,290"
               fill="none" stroke="#B8312F" stroke-width="1.4"
               stroke-dasharray="3,4" opacity="0.40"/>

      <!-- Five element nodes — circles whose radii update with sliders -->
      <g class="element-node">
        <circle id="org-wood" class="org" cx="190" cy="40" r="32"
                fill="#4F7A57" stroke="#1A1612" stroke-width="2.5"/>
        <text x="190" y="38" font-family="Ma Shan Zheng, serif" font-size="22"
              fill="#F2EAD3" text-anchor="middle">木</text>
      </g>
      <!-- ... repeat for fire, earth, metal, water at the other 4 vertices -->
    </svg>
  </div>

  <!-- Sliders + verdict (one row per element) -->
  <div>
    <div class="elements-sliders">
      <div class="element-row">
        <span class="name"><span class="swatch" style="background:#4F7A57"></span> Wood</span>
        <input type="range" id="el-wood" min="0" max="100" value="20"/>
        <span class="pct" id="el-wood-pct">20</span>
      </div>
      <!-- ... fire, earth, metal, water -->
    </div>
    <div class="elements-verdict balanced" id="elements-verdict">
      <span class="label">balanced · 平衡</span>
      The five organs in concert. Qi flows, blood follows.
    </div>
    <button class="elements-reset" id="elements-reset" type="button">restore balance</button>
  </div>
</div>
```

### JS

```js
(function(){
  var ids = ['wood','fire','earth','metal','water'];
  var sliders = {}, pcts = {}, orbs = {};
  ids.forEach(function(id){
    sliders[id] = document.getElementById('el-' + id);
    pcts[id]    = document.getElementById('el-' + id + '-pct');
    orbs[id]    = document.getElementById('org-' + id);
  });
  var verdict = document.getElementById('elements-verdict');
  if (!verdict) return;

  // Mutual relationship maps — each element generates the NEXT and restrains another
  var SHENG = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
  var KE    = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };
  var CN_NAMES = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  var ORGAN    = { wood: 'liver', fire: 'heart', earth: 'spleen', metal: 'lung', water: 'kidney' };

  function update(){
    var v = {};
    ids.forEach(function(id){ v[id] = +sliders[id].value; });
    ids.forEach(function(id){
      pcts[id].textContent = v[id];
      // Orb radius scales 14..36 with value 0..100
      orbs[id].setAttribute('r', (14 + (v[id] / 100) * 22).toFixed(1));
    });

    var values = ids.map(function(id){ return v[id]; });
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    var maxEl = ids.find(function(id){ return v[id] === max; });
    var minEl = ids.find(function(id){ return v[id] === min; });

    var label, body, balanced = false;

    if (max - min <= 12) {
      label = 'balanced · 平衡';
      body  = 'The five organs in concert. <em>Qi flows, blood follows.</em>';
      balanced = true;
    } else if (max >= 70) {
      label = CN_NAMES[maxEl] + ' overflows · ' + maxEl;
      var diagnosis = {
        wood:  'Liver wind rises. The patient is irritable, the eyes red...',
        fire:  'Heart fire blazes. Sleep is broken, the tongue red...',
        earth: 'Earth dampness pools. Digestion stagnates...',
        metal: 'Metal hardens. The lungs grip, grief lingers...',
        water: 'Water floods. Cold settles in the bones...'
      };
      body = diagnosis[maxEl];
    } else if (min < 8) {
      label = CN_NAMES[minEl] + ' depleted · ' + minEl;
      // ... element-specific deficiency prose
    } else {
      var generates = SHENG[maxEl];
      label = 'tilted toward ' + maxEl;
      body  = 'A working imbalance — the body is compensating. ' +
              maxEl[0].toUpperCase() + maxEl.slice(1) + ' is generating ' + generates +
              ' too eagerly, so check the ' + ORGAN[generates] + '.';
    }

    verdict.classList.toggle('balanced', balanced);
    verdict.innerHTML = '<span class="label">' + label + '</span>' + body;
  }

  ids.forEach(function(id){ sliders[id].addEventListener('input', update); });
  document.getElementById('elements-reset').addEventListener('click', function(){
    ids.forEach(function(id){ sliders[id].value = 20; });
    update();
  });
  update();
})();
```

### Why it works

- **The orb-radius mechanic is geometrically intuitive.** When the user moves a slider, the corresponding circle visibly grows or shrinks. The visual feedback is *immediate* and *organic-looking* (not a bar chart).
- **Two overlaid cycles teach the system.** The dashed jade pentagon teaches "this generates that." The dashed vermilion star teaches "this restrains that." Without the user reading any text, they absorb the structure.
- **The verdict in domain language.** "Liver wind rises" is *diagnostic*, not gamified. This is the move that lifts the widget from "interactive infographic" to "page that takes the subject seriously."
- **Sliders independent, not normalized.** Unlike the triad (Pattern 3), the elements don't sum to 100 — each is its own axis. This matters: in the Five Elements system, you can have *too much of everything at once* (excess) or *not enough of everything at once* (depletion). Forcing a sum-to-100 would lose those diagnostic states.

### Adapting to other systems

- **Four humors** — square instead of pentagon. Sanguine/choleric/melancholic/phlegmatic. Generation cycle = the natural seasonal sequence; restraint cycle = the diagonal opposites.
- **Seven chakras** — heptagon. Generation cycle = root-up. Restraint relationships from the kundalini system.
- **A cast of characters** — N-gon where each vertex is a character. Generation cycle = "X empowers Y." Restraint cycle = "X antagonizes Z." Verdict text reads like a story-arc diagnosis.

The math (radii on regular polygons, dashed cycle overlays, slider→radius mapping, verdict by max/min/range) stays identical.


## Pattern 6 — Embodied Checklist with Progress Thresholds

**When to use:** the concept is *an enumerable set of small practices, habits, exercises, or rules* that work *only when done together, daily, for a long time*. The principle is that **doing matters more than knowing**.

### Concept this fits

- Sun Simiao's Thirteen Practices to Keep Health (original use)
- A daily-rituals checklist (the eight Stoic disciplines, the seven daily prayers)
- A morning routine, a meditation sequence, a strength-training set
- The "twelve rules for life" type list — but rendered as *do, not understand*
- A habit tracker for any aphoristic source

### How it differs from a static checklist

The reader doesn't tap to *commit* to doing the practices later. They tap to *do them now, in this moment, on this page*. Each card has a custom animated icon that activates on tap (the eyes rotate, the teeth click, the breath wisps rise). The page is *enacting* the practice in cartoon form — a tiny ritual stand-in.

A progress threshold system reads the user's current count and updates a verdict block: "none yet" → "one drop" → "three branches" → "half the way" → "most days" → "a steady rhythm" → "a full set."

### HTML

```html
<section id="practices" class="practices-section">
  <div class="wrap">
    <div class="section-head">
      <span class="section-eyebrow">§ Three · the practices</span>
      <h2 class="section-title">Small habits, <em>large lifetime.</em></h2>
      <p class="section-lede">Tap each practice to enact it.</p>
    </div>

    <div class="practices-grid" id="practices-grid">
      <button class="practice" data-id="pr1" type="button">
        <span class="practice-num">一</span>
        <div class="practice-icon">
          <svg viewBox="0 0 60 60">
            <g class="icon-bob">
              <!-- a custom icon for this practice; the .icon-bob class hooks the animation -->
            </g>
          </svg>
        </div>
        <span class="practice-name">Comb the hair</span>
        <span class="practice-count">100 strokes</span>
      </button>

      <!-- repeat for pr2 ... pr13 -->
    </div>

    <div class="practices-progress" id="practices-progress">
      <span class="label">none yet</span>
      <span class="body" id="practices-body">A long life is built from short rituals. Begin with one.</span>
    </div>
  </div>
</section>
```

### CSS — animation hooks

The trick that makes this widget feel embodied: each icon has one of three animation classes (`.icon-spin`, `.icon-bob`, `.icon-pulse`). The animation is *off* in the default state, *on* when the practice is `.done`. This way the page is *quiet* until the user starts tapping, then comes alive as they complete practices.

```css
.practice .practice-icon { width: 56px; height: 56px; }
.practice .practice-icon svg { width: 100%; height: 100%; }
.practice.done {
  background: var(--gold);
  border-color: var(--gold);
}
.practice.done .practice-num { color: var(--vermilion-d); }

/* Animation hooks — only active when .done is applied */
.practice.done .icon-spin  { animation: gentleSpin  4s   linear infinite; transform-origin: center; }
.practice.done .icon-bob   { animation: gentleBob   1.6s ease-in-out infinite; transform-origin: center; }
.practice.done .icon-pulse { animation: gentlePulse 1.4s ease-in-out infinite; transform-origin: center; }
@keyframes gentleSpin  { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes gentleBob   { 0%,100% { transform: translateY(0); }    50% { transform: translateY(-3px); } }
@keyframes gentlePulse { 0%,100% { transform: scale(1); }         50% { transform: scale(1.08); } }
```

### JS

```js
(function(){
  var practices = document.querySelectorAll('.practice');
  var label = document.querySelector('.practices-progress .label');
  var body  = document.getElementById('practices-body');
  if (!practices.length || !body) return;

  // Threshold-driven verdicts. Tune the thresholds and prose to your subject.
  var thresholds = [
    { n: 0,  label: 'none yet',          body: 'A long life is built from short rituals. Begin with one.' },
    { n: 1,  label: 'one drop',          body: 'You have begun. The first practice opens the door to the others.' },
    { n: 3,  label: 'three branches',    body: 'Three habits, done daily, change the body more than one effort done once.' },
    { n: 5,  label: 'half the way',      body: 'Halfway. The body is responding to the regularity, not the heroism.' },
    { n: 8,  label: 'most days',         body: 'Eight of thirteen. This is what daily yangsheng actually feels like.' },
    { n: 11, label: 'a steady rhythm',   body: 'You are nearly inside the practice itself.' },
    { n: 13, label: 'a full set · 十三', body: 'All thirteen. <em>This is how he lived past one hundred.</em>' }
  ];

  function refresh(){
    var done = document.querySelectorAll('.practice.done').length;
    var current = thresholds[0];
    thresholds.forEach(function(t){ if (done >= t.n) current = t; });
    label.textContent = current.label;
    body.innerHTML = current.body;
  }

  practices.forEach(function(p){
    p.addEventListener('click', function(){
      p.classList.toggle('done');
      refresh();
    });
  });
  refresh();
})();
```

### Why it works

- **The page enacts what it teaches.** Reading "tap each practice to enact it" *and then tapping* is the principle being absorbed. Same logic as the Glaser drawing canvas — doing replaces describing.
- **Animation gated on completion** keeps the page quiet by default. A grid where every icon was already animating would feel like a video game; here, the icons earn their motion by being chosen.
- **Threshold prose, not a percentage.** The verdict block uses qualitative labels ("one drop," "three branches," "a steady rhythm") rather than "3/13." The labels carry the subject's voice, which is the editorial move.
- **Counted in the subject's numerals/scripts** when relevant. The card numbers in the Sun Simiao build use Chinese numerals (一, 二, … 十三). The threshold labels echo the source language. This is the *earned-foreign-script* rule from `cultural-adaptation.md`.

### Adapting to other subjects

- **Stoic disciplines** — the threshold labels could be in Latin/Greek phrases ("una virtus," "tres officia," "totum munus").
- **Twelve-step or recovery practices** — labels mark the experiential states ("first day," "first week," "first month," "a year").
- **Daily exercises (yoga, qigong, calisthenics)** — labels track endurance ("just begun," "warming up," "in the flow," "morning complete").

The pattern is invariant: *enumerable practices + tap-to-enact + threshold prose in the subject's voice*.


## Pattern selection guide — updated

| If your concept is... | Use pattern |
|---|---|
| Less of X is worse / strip-away reveal | 1 — Stripping slider |
| The principle should be DOable / leave a mark | 2 — Drawing canvas |
| Tradeoff between 3 forces | 3 — Three-axis dial |
| Same thing, N ways / variations of one form | 4 — Hover grid |
| Mutual generation/restraint among N elements | 5 — N-axis cycle dial |
| An enumerable set of practices that must be done | 6 — Embodied checklist with thresholds |

A dashboard usually has 1–2 interactive sections, not more. Choose the pattern whose *mechanic teaches the principle*, not the pattern that's flashiest.
