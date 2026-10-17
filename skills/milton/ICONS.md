# Milton — Icons

How to draw icons in this system. **Brand-agnostic.** The geometry is the principle; the colour is the brand. Read after `BRAND_BOOK.md`.

---

## 1 · Conventions (the contract)

Every Milton icon follows these rules without exception, in any brand fork:

| Rule                              | Why                                                    |
|-----------------------------------|--------------------------------------------------------|
| **viewBox `0 0 200 200`**         | One coordinate space; copy/paste between files works  |
| **`currentColor` on primary fills/strokes** | Adopts surrounding text colour; auto-flips in dark mode AND adapts to any brand fork |
| **`var(--paper)` for negative-space punch** | When the ground colour must show through (eyes, cutouts), use the var. Brand-fork–safe. |
| **`<title>` AND `<desc>` always** | Accessibility + acts as inline documentation         |
| **2–3 colours max**               | Glaser's Bob Dylan poster used black + 5 colours; icons should be quieter |
| **No gradients, no shadows**      | Silhouette + flat colour. The shape carries everything |
| **Stroke-width 3–6 px** at 200×200 | Reads cleanly at 24 px and 256 px both              |
| **`stroke-linecap="round"`** on open paths | Hand-drawn feel; rectangular caps look CAD-generated |
| **Geometric primitives preferred** | Circles, half-moons, triangles, rectangles. The Push Pin signature |
| **One name = one concept**         | An icon called `doubt` carries exactly one idea. If you need two, draw two icons |
| **No hardcoded hex** in the geometry | Use `currentColor`, `var(--paper)`, or `var(--actor-N)` so the icon themes per fork |

---

## 2 · The 12 canonical icons (default preset)

The reference set, mapped 1:1 to Glaser's Ten Things plus two foundational extras (`wow` and `ambiguity`). They live as standalone files in `/Users/manu/Documents/CETI/DESIGN/icons/` and as `<symbol>`s in `DESIGN/icons/sprite.svg`.

| File                  | Name         | Concept embodied                          | Form                                                |
|-----------------------|--------------|-------------------------------------------|-----------------------------------------------------|
| `01-affection.svg`    | Affection    | You can only work for people you like     | Two crescents leaning in — heart from negative space |
| `02-no-job.svg`       | No-job       | Never have a job                          | Briefcase whose handle has detached and floats free |
| `03-toxic.svg`        | Toxic        | Some people are toxic                     | Featureless head; inverted smile reads as a swirl   |
| `04-greatness.svg`    | Greatness    | Good is the enemy of great                | Three peaks — small finished, large outlined-dashed |
| `05-just-enough.svg`  | Just enough  | Just enough is more                       | Glass filled exactly to the centre line             |
| `06-style.svg`        | Style        | Style is not to be trusted                | 8 identical squares; one rotated off the grid       |
| `07-brain.svg`        | Brain        | How you live changes your brain           | Outward spiral from a single dot of attention       |
| `08-doubt.svg`        | Doubt        | Doubt > certainty                         | Two question marks — solid + mirrored outline       |
| `09-aging.svg`        | Aging        | On aging                                  | Tree rings, slightly off-centre core                |
| `10-truth.svg`        | Truth        | Tell the truth                            | A target the arrow has already passed through      |
| `11-wow.svg`          | Wow          | The third response                        | Concentric arcs; outer ring escapes the frame       |
| `12-ambiguity.svg`    | Ambiguity    | Ambiguity engages                         | The classic goblet ↔ two-faces rebus                |

Each is a study in **one geometric move**. The geometry is universal — these icons themselves work in any brand fork because they use `currentColor`. The icon-to-principle mapping above is **CETI's**; another brand maps the same geometries to its own principles or draws fresh icons for principles the canonical 12 don't cover.

---

## 3 · Designation system

Icons are named `NN-name.svg` where:
- `NN` is a two-digit sequence number, **never reused** (so links don't break when icons get deprecated)
- `name` is a single hyphen-separated lowercase concept word

When extending the set, the **next** icon is `13-{name}.svg`. Even if `12-ambiguity.svg` is later retired, the next addition is still `13`. The number is permanent.

The `<symbol id="...">` in the sprite uses just `name` (no number). Consume via:

```html
<svg class="icon" viewBox="0 0 200 200" aria-hidden="true">
  <use href="/path/to/sprite.svg#wow"/>
</svg>
```

Set the colour via `color: var(--actor-3)` on a parent. **In a fork, `--actor-3` resolves to whatever the fork sets — the icon adapts automatically.**

---

## 4 · How to design a new icon

Five-step process, used to design the canonical 12 and any new ones for forks.

### Step 1 — Identify the principle, not the noun

Bad: "draw an icon for *speed*."
Good: "draw an icon for the principle that *speed without direction is just noise.*"

The icon represents the **idea**, not the dictionary entry.

### Step 2 — Pick the geometric move

What single shape-relationship carries this idea? Examples from the canonical set:
- Doubt → mirrored question marks (the form turning back on itself)
- Aging → concentric circles, off-centre (accumulation around a moving core)
- Truth → arrow through target (passes through, doesn't stop)

If you can't articulate the move in one sentence, the idea isn't sharp enough. Go back to step 1.

### Step 3 — Sketch in 200×200

Open `references/icon-template.svg`. Place primitives. Resist the urge to add detail.

### Step 4 — Test at extremes

Render at 24 px (favicon scale) and at 256 px (poster scale). If it doesn't read at both, adjust.

**Also test with a brand fork.** Wrap the icon in `<div style="color: red;">`. Does it still read? It should. If hardcoded hex break the icon under a fork, fix the icon, not the fork.

### Step 5 — Write `<title>` and `<desc>`

The `<title>` is the screen-reader name. The `<desc>` is your future self's note about why the form earns the meaning. Example:

```xml
<title>Doubt is better than certainty</title>
<desc>Two question marks, one in cobalt facing forward and one in outline, mirrored. Certainty is a closed door. Doubt is the hinge.</desc>
```

**The `<desc>` is mandatory.** It's the difference between an icon and a glyph.

---

## 5 · Adding to the sprite

Once the standalone `NN-name.svg` is finalized:

1. Open `/Users/manu/Documents/CETI/DESIGN/icons/sprite.svg` (or your fork's equivalent).
2. Append `<symbol id="{name}" viewBox="0 0 200 200">…</symbol>` with the geometry.
3. **Strip the `<rect width="200" height="200" fill="..."/>`** — sprites should be transparent so they adopt parent backgrounds.
4. Keep `currentColor` on every fill/stroke that should adapt to context.
5. Update any consuming dashboard's `ICONS` array.

---

## 6 · Anti-patterns for icons

| Don't                                          | Do instead                                 |
|------------------------------------------------|--------------------------------------------|
| Hardcode `#FAF7F2` for negative space          | Use `var(--paper)`                         |
| Hardcode any of the actor hexes                | Use `var(--actor-N)` or `currentColor`     |
| Add a drop shadow filter                       | The form should carry weight, not the shadow |
| Use `<image>` to embed a raster                | Vector or it doesn't ship                  |
| Reach 8+ colours                               | Cap at 3                                   |
| Build complex paths from imported SVG          | Hand-place primitives                      |
| Skip the `<title>`/`<desc>`                    | Always include both                        |
| Reuse a number for a different concept         | Numbers are permanent; deprecate, don't reuse |
| Bake brand colours into the icon file          | Use `currentColor` so forks reuse the geometry |

---

## 7 · Forking the icon set

A brand fork can:

- **Reuse** the canonical 12 verbatim — they themselves work in any fork because they use `currentColor`. The icon-to-principle mapping in the brand book is what changes.
- **Extend** with new icons (sequential numbering: 13, 14, …) for principles the canonical set doesn't cover.
- **Replace** specific icons whose meaning doesn't translate. (Rare. Most Glaser principles translate.)

**A fork should not** rename the canonical 12 or change their geometries. If a brand needs a different visual for "doubt," draw a new icon at the next sequence number and document the substitution in the fork's brand book.

---

## 8 · One worked example (brand-agnostic)

You're asked to design an icon for **patience** for a tea-brand fork.

**Step 1 — principle.** Patience isn't *waiting* — it's *holding attention* without acting.

**Step 2 — move.** A small dot, a much larger empty circle around it, with a single line drawn through both at the same angle — but the line stops at the inner dot, not the outer ring. The line would *like* to keep going. It's not.

**Step 3 — sketch.**

```xml
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width="3"/>
  <line x1="40" y1="100" x2="100" y2="100" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="6" fill="currentColor"/>
</svg>
```

**Step 4 — test at extremes.** At 24 px the dot disappears; the ring + line still read. At 256 px the relationship between the line's stop and the dot's centre is the whole image. Both work. Wrap in `<div style="color: #B45D2C;">` (the tea brand's terracotta) — still reads. Good.

**Step 5 — `<desc>`.** *"A line that wanted to keep going and chose not to. The dot is where attention rests. The empty ring is the room patience makes."*

That's a Milton-system icon. It works in CETI's vermilion. It works in tea-brand terracotta. It works in any fork that respects the contract.
