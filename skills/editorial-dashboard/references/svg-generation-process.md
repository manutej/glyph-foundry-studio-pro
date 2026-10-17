# Custom SVG Generation — the process

The hardest move in this skill is **inventing a custom icon for a concept that has never been visualized before**. The icon catalog (`svg-icons.md`) has 16 idioms now, but for a fresh subject you'll always need to invent two or three new ones. This document is the explicit process — what to do when staring at a blank `<svg>` and a sentence like *"the physician must look at the wound without flinching."*

## Why this matters

The default LLM behavior, faced with a concept, is to reach for a metaphor that is *technically correct* but *visually generic*. "Compassion" → a heart icon. "Equality" → a scale. "Wisdom" → a book. These are correct in the way a stock photo of a handshake is correct: nothing is wrong with them, and nothing is in them.

The icons in editorial-dashboard work because they go one step past the obvious metaphor. Not "compassion = heart" but "compassion = an open eye whose iris is an open palm" (the gaze that does not flinch and the hand that receives). Not "equality = scale" but "equality = a noble silhouette and a beggar silhouette sharing one steaming bowl across a dotted divider" (the *medical* equality of one bowl, one rank).

Going one step past is a craft. This is the craft.

## The five-step process

### Step 1 — Restate the concept as a *scene*, not a noun

Look at the principle text. Strip out the abstract nouns. Translate it into a picture of something happening.

| Abstract concept | Scene |
|---|---|
| "Calm the mind first" | A still pond receiving one drop |
| "Treat all equally" | Two unequal people sharing one bowl |
| "Forget your own fortune" | One candle lighting another, and not diminishing |
| "Go through cold and heat" | A small lantern moving through a dark mountain pass |
| "Look without flinching" | An eye that doesn't close when something terrible enters its field |

Each scene contains a *verb*. "Receiving." "Sharing." "Lighting." "Moving." "Not closing." The verb is what the icon will animate, even if the SVG is static — the viewer's eye reads the implied action.

If you cannot turn the concept into a scene with a verb, the concept hasn't been understood yet. Go back and read the source text again.

### Step 2 — Identify which idiom from the catalog the scene wants

Open `svg-icons.md`. Walk down the choosing-an-idiom list at the bottom:

1. Two-object metaphor (relationship between things)
2. Surreal escape (freedom, breaking out)
3. Paired-state contrast (two states of one thing)
4. Status-juxtaposition (good vs great)
5. Concentrated-richness (density done right)
6. Witty animal (visual joke)
7. Anatomy-as-metaphor (one thing rendered as another)
8. Symbol-becomes-symbol (transformation)
9. Cyclical/infinity (recurrence, time)
10. Eye/instrument (perception)

The scene maps onto one of these. "Still pond receiving a drop" → anatomy-as-metaphor (the surface of attention rendered as water). "Sharing a bowl across a divider" → paired-state contrast. "Candle lighting a candle" → two-object metaphor with a connecting element. "Lantern in mountain pass" → concentrated-richness in a hostile setting.

**Rule:** if you've already used an idiom for an earlier card in the dashboard, *pick a different one for this card*. Variety across the set is the whole point.

### Step 3 — Sketch in words before drawing in SVG

Write a paragraph describing the icon at three levels:

1. **The frame** — what fills the viewBox? (oval pond, two silhouettes with a divider, two candles)
2. **The action** — what verb is implied? (a drop falling, steam rising between two silhouettes, a flame-arc connecting two wicks)
3. **The grounding** — what gives the icon a baseline? (a reed at the pond's edge, saucers under the candles, a mountain horizon line)

Then add the **earned text label**. One short hand-lettered phrase in Caveat that lands the meaning the visual alone cannot. "be still first" under the pond. "no flame is lost" under the candles. "offer, don't perform" under the teacups. Or — in a cross-cultural build — a 4-character phrase in the subject's script (普同一等, 皆如至親).

If the text would be redundant ("a candle" under a drawing of a candle), skip it. Text inside icons is for the *joke*, the *ethic*, or the *idiom*, not the *label*.

### Step 4 — Build the SVG in layers

Order matters. Build back-to-front:

```
1. Halo / glow (radial gradient circle, opacity 0.25-0.45)
2. Backdrop element (mountain horizon, branch, ground line, frame)
3. Main shape outline (the gourd, the eye, the brain) — usually the largest stroke-width
4. Main shape fill (color from the palette)
5. Internal details (stripes, segments, decoration)
6. Highlight (small ellipse with paper-color, opacity 0.5-0.8, off-center)
7. Connecting elements (steam wisps, dotted lines, transformation arrows)
8. The "joke" element (the heart-as-iris, the strikethrough, the lightbulb-as-dot)
9. Hand-lettered text in Caveat (one line, color-matched to the accent)
10. Tiny technical labels in JetBrains Mono (only if they earn it)
```

This order is for legibility, not just z-order. If you build the joke before the main shape, you'll over-design the joke and under-design the foundation. Build the icon as if you're *describing* it to someone who can't see it — frame, then subject, then detail, then punch.

### Step 5 — Audit against the variety rule

Before declaring an icon done, look at it next to the icons you've already built for this dashboard. Ask:

- **Color check:** does this icon use 2-3 palette colors, and are they a different combo than the last 3 icons?
- **Shape check:** is the dominant geometry different? (last icon was a circle; this one should be a triangle or asymmetric blob)
- **Density check:** if the last icon had a lot going on, this one should breathe more. If the last was sparse, this one can be richer.
- **Joke check:** does this icon need a visual joke? (Some don't. Some do. Audit deliberately.)

If the icon fails any of these, it's not bad — it's just *the same flavor as the last one*. Editorial design is a *set* of decisions, not a single decision. The set must vary.

## The dimensional choices

For a principle card, use `viewBox="0 0 100 100"`. This is the size the catalog uses, and it composes well at 64-80px display.

For the hero, go larger — `viewBox="0 0 360 460"` or similar. The hero is the only icon that gets to be detailed. It's the only one with room for marginalia, seal stamps, multiple text annotations.

For interactive elements (the five-element pentagon, an ethics triad), use a square viewBox like `0 0 380 380` and let CSS scale it. SVG inside `display: block; width: 100%` will fluid-size perfectly.

## Hand-drawn warmth — the wobble filter

Every dashboard's hero benefits from one of these in its `<defs>`:

```xml
<filter id="wobble" x="-2%" y="-2%" width="104%" height="104%">
  <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="5"/>
  <feDisplacementMap in="SourceGraphic" scale="1.4"/>
</filter>
```

Apply it selectively — `<g filter="url(#wobble)">` around the *main subject*, not around text or fine details. A wobbled gourd looks hand-drawn; wobbled text looks broken. The displacement scale should be 1.0–1.8; higher numbers make the icon look corrupted, not warm.

Don't apply wobble to icons used at small sizes. The visual noise becomes pixel noise.

## The "earned hand-lettered text" rule

Inside an icon, hand-lettered text is one of the highest-leverage moves the catalog teaches. Used poorly it's clutter. Used well it's the punch line.

**Earn it when:**
- The visual carries 80% of the meaning and one short phrase carries the last 20%
- The phrase is part of a *joke* (e.g. "style is / a costume" with the second line struck through)
- The phrase is in the subject's own voice (a quoted fragment)
- A foreign-language phrase carries the cultural register (普同一等, 皆如至親)

**Don't earn it when:**
- The phrase just labels what the icon already shows
- The icon is at small display size (text becomes unreadable)
- The icon is in a dense grid where text-noise piles up

Use `font-family="Caveat, cursive"`, `font-size="9-12"` for icon-internal labels, color matched to the accent (`#B8312F` in the Sun Simiao palette, `#D62828` in the Glaser palette).

## Iteration — when an icon doesn't work

If you've built an icon and it feels generic, the fix is rarely "add more detail." It's usually one of these:

1. **The metaphor is too obvious.** Pick a different scene. "Compassion" → not a heart; an eye that doesn't close.
2. **The composition is too symmetric.** Tilt one element. Move the focal point off-center. Asymmetry implies a hand made this.
3. **The colors are wrong.** Palette colors only. Check that this icon's combination differs from the last three icons.
4. **There's no verb.** The icon is depicting a state, not an action. Add a connecting element — steam, an arrow, a flame-arc, a falling drop, a sound wave.
5. **It looks like a sticker.** Add the wobble filter. Or remove the rounded corners. Or switch to stroke-only with the fill color appearing only inside one element.

Most v1 icons need 2–3 of these passes. Build all ten cards in v1 first, then loop back. The variety rule is easier to enforce when you can see all icons together.

## A worked example: the candle pair (Sun Simiao card 4)

The principle: *"I shall not worry about my own life or fortune. My single purpose is to preserve the life of the other."*

**Step 1 — scene with a verb:** One candle lighting another. The flame transfers without diminishing. The verb is *lighting*.

**Step 2 — idiom:** Two-object metaphor with a connecting element (idiom 1 in the catalog, but reused with a different connecting element — a flame-arc instead of steam).

**Step 3 — sketch in words:**
- Frame: two candles in saucers, side by side, mid-icon height
- Action: left flame leans right, right flame just-catching, a small flame-arc connects them in the air
- Grounding: oval saucer outlines under each candle
- Earned text: "no flame is lost" — gold color, opacity 0.7, very small

**Step 4 — layered build:**
```
1. (no halo for this one — the flame-arc is the connection, doesn't need a glow)
2. (no separate backdrop — the saucers serve)
3-5. Two candle bodies, gold fill, ink stroke, with wicks
6. (no highlight — the flames are the highlight)
7. Connecting flame-arc — a stroke-only path from one flame-tip to the other, gold + vermilion overlay
8. Each flame leaning toward the other — the joke is in the lean, not in any explicit gesture
9. Hand-lettered "no flame is lost" centered below
10. (no technical label needed)
```

**Step 5 — audit:**
- Colors: gold + vermilion (different from card 3's vermilion-only and card 5's gold+indigo) ✓
- Shape: vertical pair (different from card 3's left-right transformation and card 5's enclosed mountain composition) ✓
- Density: medium (intentional — neither sparse like card 1's pond nor dense like card 5's mountain pass) ✓
- Joke check: the lean of the flames toward each other *is* the joke. The text underneath lands it. ✓

The whole process for this icon, from concept to finished SVG: about 6 minutes of thinking, 10 minutes of code. The SVG itself is ~30 lines.

## The deeper move

The reason this process works isn't that it produces "nicer" icons. It's that **each icon is solved freshly, with attention to the specific concept it carries**. That attention is invisible in any single icon. Across a set of ten, it's the difference between *editorial design* and *iconography that reads as automated*.

When the user opens a card and sees an eye whose iris is an open palm — and then opens the next card and sees a stranger silhouette transforming into a kin silhouette via a heart on an arrow — they don't articulate "ah, varied visual idioms." They feel: *someone was thinking when they made this*. That feeling is the entire point.
