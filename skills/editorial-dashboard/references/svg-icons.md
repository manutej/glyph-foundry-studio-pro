# Custom Inline SVG Icons

The single biggest visual quality jump in the v2 pass came from replacing uniform-style icons with **deliberately varied visual idioms** — each icon solves its concept's problem differently. This document catalogs the idioms that worked, with copy-pasteable code.

## The core principle

Glaser's "don't trust style" applied directly to dashboard icons. If all your icons use the same visual idiom — same line weight, same flat colors, same level of abstraction — you're imposing *your* style on each idea, instead of letting each idea find its own visual solution.

When you have 8–12 ideas to illustrate, plan for 8–12 *different* idioms. They should still feel like they belong together (consistent palette, consistent ~3px stroke-weight, consistent ink color) but each should be its own thing.

## Setup

All icons are inline `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` — square, 100×100, no external assets. Stroke uses `#1A1612` (ink). Each icon picks 2–3 colors from the palette.

The container CSS:

```css
.principle-icon {
  width: 64px; height: 64px;
  flex-shrink: 0;
}
.principle-icon svg {
  width: 100%; height: 100%; display: block;
}
```

## The idioms

### 1. Two-object metaphor with connecting element

**Use when:** the concept is about *relationship* between two things — affection, contrast, dialogue.

**Example concept:** "Work for people you like" → two coffee cups, a steam-heart rising between them.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- The connection: a heart formed by mingled steam -->
  <path d="M 50,38 C 50,38 38,28 38,18 C 38,10 44,7 48,12 C 49,13 50,15 50,17
           C 50,15 51,13 52,12 C 56,7 62,10 62,18 C 62,28 50,38 50,38 Z"
        fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2.2"/>
  <!-- Steam wisps from each cup -->
  <path d="M 26,58 Q 24,52 28,48 Q 32,44 30,38" stroke="var(--ink, #1A1612)" stroke-width="2"
        fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M 74,58 Q 76,52 72,48 Q 68,44 70,38" stroke="var(--ink, #1A1612)" stroke-width="2"
        fill="none" stroke-linecap="round" opacity="0.6"/>
  <!-- Left cup (one color) -->
  <path d="M 14,62 L 18,86 Q 18,90 22,90 L 36,90 Q 40,90 40,86 L 44,62 Z"
        fill="var(--orange, #E76F51)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <ellipse cx="29" cy="62" rx="15" ry="3" fill="var(--ink, #1A1612)"/>  <!-- coffee -->
  <!-- Right cup (different color, mirrors left) -->
  <path d="M 56,62 L 60,86 Q 60,90 64,90 L 78,90 Q 82,90 82,86 L 86,62 Z"
        fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <ellipse cx="71" cy="62" rx="15" ry="3" fill="var(--ink, #1A1612)"/>
  <!-- Saucers — open ellipses suggest depth -->
  <ellipse cx="29" cy="92" rx="20" ry="3" fill="none" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <ellipse cx="71" cy="92" rx="20" ry="3" fill="none" stroke="var(--ink, #1A1612)" stroke-width="2"/>
</svg>
```

### 2. Surreal escape (Magritte-feel)

**Use when:** the concept is about *agency, freedom, refusal of containment*.

**Example concept:** "Never have a job" → a bird breaking out of a picture frame.

The frame contains the bird's body partially; the head and wing are *outside* the frame. This breaks the visual containment as it breaks the conceptual one.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Frame -->
  <rect x="14" y="22" width="52" height="60" fill="var(--yellow, #F4C430)"
        stroke="var(--ink, #1A1612)" stroke-width="3"/>
  <rect x="20" y="28" width="40" height="48" fill="var(--blue, #1D3557)"/>
  <!-- Sky details inside frame -->
  <circle cx="40" cy="44" r="3" fill="var(--paper, #F1EBDD)" opacity="0.5"/>
  <circle cx="50" cy="38" r="2" fill="var(--paper, #F1EBDD)" opacity="0.4"/>
  <!-- Bird body extends OUTSIDE the frame -->
  <ellipse cx="74" cy="36" rx="14" ry="8" fill="var(--ink, #1A1612)"
           transform="rotate(-22 74 36)"/>
  <circle cx="84" cy="29" r="6" fill="var(--ink, #1A1612)"/>  <!-- head -->
  <path d="M 89,29 L 96,30 L 89,32 Z" fill="var(--orange, #E76F51)"/>  <!-- beak -->
  <circle cx="85" cy="28" r="1.2" fill="var(--paper, #F1EBDD)"/>  <!-- eye -->
  <!-- Wing raised mid-flap -->
  <path d="M 70,32 Q 64,16 78,18 Q 82,22 76,32 Z" fill="var(--ink, #1A1612)"/>
  <!-- Hand-lettered "free" -->
  <text x="14" y="92" font-family="Caveat, cursive" font-size="11"
        font-weight="700" fill="var(--red, #D62828)">free</text>
</svg>
```

### 3. Paired-state contrast (split metaphor)

**Use when:** the concept is about *two states of the same thing* — toxic vs nourishing, before vs after, true vs false.

**Example concept:** "Toxic people" → ONE flower, vertically split: blooming half / wilted half.

The trick is using *one* object to show both states, rather than two separate objects. A vertical dotted divider helps.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Vertical divider -->
  <line x1="50" y1="14" x2="50" y2="92" stroke="var(--ink, #1A1612)"
        stroke-width="1" stroke-dasharray="2,3" opacity="0.4"/>
  <!-- LEFT HALF: blooming -->
  <path d="M 50,30 Q 28,22 22,38 Q 30,42 50,38 Z"
        fill="var(--pink, #F26A8D)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <path d="M 50,40 Q 24,46 24,56 Q 32,58 50,52 Z"
        fill="var(--pink, #F26A8D)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <path d="M 50,52 Q 30,60 32,70 Q 40,68 50,62 Z"
        fill="var(--pink, #F26A8D)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <path d="M 50,62 Q 48,76 46,90" stroke="var(--green, #2D6A4F)" stroke-width="3"
        fill="none" stroke-linecap="round"/>
  <!-- RIGHT HALF: wilted (same shape, darker, lower opacity) -->
  <path d="M 50,30 Q 64,30 64,42 Q 60,46 50,42 Z"
        fill="var(--ink, #1A1612)" opacity="0.55"/>
  <path d="M 50,42 Q 66,52 60,60 Q 54,58 50,52 Z"
        fill="var(--ink, #1A1612)" opacity="0.4"/>
  <path d="M 60,72 Q 70,76 68,82 Q 60,82 56,76 Z"
        fill="var(--ink, #1A1612)" opacity="0.35" transform="rotate(20 62 78)"/>
  <path d="M 50,62 Q 56,72 60,72" stroke="var(--green, #2D6A4F)" stroke-width="3"
        fill="none" stroke-linecap="round" opacity="0.5"/>
  <!-- Center pollen (the connecting jewel) -->
  <circle cx="50" cy="46" r="4" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
</svg>
```

### 4. Status-juxtaposition (medal vs star)

**Use when:** the concept is about *good vs great, sufficient vs exceptional*.

**Example concept:** "Professionalism is not enough" → polished gold medal next to a brighter hand-drawn star, with `>` between them.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Medal: precise, official-looking -->
  <path d="M 24,8 L 30,8 L 36,36 L 22,36 L 16,8 L 22,8 Z"
        fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2"/>  <!-- ribbon -->
  <circle cx="26" cy="56" r="22" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <text x="26" y="62" font-family="Fraunces, serif" font-size="14"
        font-weight="900" fill="var(--ink, #1A1612)" text-anchor="middle">A+</text>
  <text x="26" y="92" font-family="JetBrains Mono, monospace" font-size="6"
        fill="var(--ink, #1A1612)" text-anchor="middle" opacity="0.6">PRO</text>

  <!-- Star: hand-drawn, slightly tilted, with glow -->
  <g transform="translate(72,42) rotate(-8)">
    <circle cx="0" cy="0" r="22" fill="var(--yellow, #F4C430)" opacity="0.25"/>
    <path d="M 0,-18 L 5,-5 L 18,-5 L 7,3 L 12,16 L 0,8 L -12,16 L -7,3 L -18,-5 L -5,-5 Z"
          fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Sparkle marks -->
    <line x1="-22" y1="-14" x2="-19" y2="-12" stroke="var(--ink, #1A1612)" stroke-width="1.4"/>
    <line x1="22" y1="14" x2="19" y2="12" stroke="var(--ink, #1A1612)" stroke-width="1.4"/>
  </g>
  <!-- Comparison operator -->
  <text x="50" y="60" font-family="Fraunces, serif" font-size="14" font-weight="900"
        fill="var(--ink, #1A1612)" text-anchor="middle" font-style="italic">&gt;</text>
  <text x="72" y="86" font-family="Caveat, cursive" font-size="11" font-weight="700"
        fill="var(--red, #D62828)" text-anchor="middle">great</text>
</svg>
```

### 5. Concentrated-richness ornament

**Use when:** the concept is about *density done right, the maximalist case, the right amount of detail*.

**Example concept:** "Just enough is more" → an ornate jeweled medallion with rays, ring, rosette, jewel, and a hand-lettered "just enough" caption.

The icon itself is *demonstrating* the concept — a compact moment of dense ornament that's purposeful, not arbitrary.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer rays (sun-like) -->
  <g stroke="var(--yellow, #F4C430)" stroke-width="2" stroke-linecap="round" fill="none">
    <line x1="50" y1="6"  x2="50" y2="14"/>
    <line x1="50" y1="86" x2="50" y2="94"/>
    <line x1="6"  y1="50" x2="14" y2="50"/>
    <line x1="86" y1="50" x2="94" y2="50"/>
    <line x1="18" y1="18" x2="24" y2="24"/>
    <line x1="76" y1="24" x2="82" y2="18"/>
    <line x1="18" y1="82" x2="24" y2="76"/>
    <line x1="76" y1="76" x2="82" y2="82"/>
  </g>
  <!-- Outer ring -->
  <circle cx="50" cy="50" r="36" fill="var(--blue, #1D3557)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Decorative ring with dots -->
  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--yellow, #F4C430)"
          stroke-width="1.5" stroke-dasharray="2,2.5"/>
  <!-- 8-petal rosette -->
  <g fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="1.2">
    <ellipse cx="50" cy="32" rx="6" ry="10"/>
    <ellipse cx="50" cy="68" rx="6" ry="10"/>
    <ellipse cx="32" cy="50" rx="10" ry="6"/>
    <ellipse cx="68" cy="50" rx="10" ry="6"/>
  </g>
  <g fill="var(--pink, #F26A8D)" stroke="var(--ink, #1A1612)" stroke-width="1.2" transform="rotate(45 50 50)">
    <ellipse cx="50" cy="36" rx="4" ry="8"/>
    <ellipse cx="50" cy="64" rx="4" ry="8"/>
    <ellipse cx="36" cy="50" rx="8" ry="4"/>
    <ellipse cx="64" cy="50" rx="8" ry="4"/>
  </g>
  <!-- Center jewel -->
  <circle cx="50" cy="50" r="8" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.8"/>
  <circle cx="50" cy="50" r="4" fill="var(--green, #2D6A4F)"/>
  <ellipse cx="47" cy="47" rx="1.5" ry="1" fill="var(--paper, #F1EBDD)" opacity="0.9"/>  <!-- highlight -->
  <!-- Hand-lettered caption -->
  <text x="50" y="98" font-family="Caveat, cursive" font-size="9" font-weight="700"
        fill="var(--ink, #1A1612)" text-anchor="middle" opacity="0.6">just enough</text>
</svg>
```

### 6. Witty animal as concept-carrier

**Use when:** the concept needs a *visual joke*. Animals carry meaning compactly and disarmingly.

**Example concept:** "Style is not to be trusted" → a chameleon striped with three palette colors, with a hand-lettered "style is / a costume" (the second line struck through). The animal *is* the joke.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Branch -->
  <line x1="6" y1="78" x2="94" y2="78" stroke="var(--green, #2D6A4F)" stroke-width="3" stroke-linecap="round"/>
  <!-- Body -->
  <path d="M 22,62 Q 22,48 38,46 L 56,46 Q 78,46 78,62 L 76,68 L 22,68 Z"
        fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Three palette-color stripes (the joke: it's "trying on" colors) -->
  <path d="M 32,46 Q 32,58 32,68" stroke="var(--red, #D62828)" stroke-width="3" fill="none"/>
  <path d="M 46,46 Q 46,58 46,68" stroke="var(--blue, #1D3557)" stroke-width="3" fill="none"/>
  <path d="M 60,46 Q 60,58 60,68" stroke="var(--pink, #F26A8D)" stroke-width="3" fill="none"/>
  <!-- Crest -->
  <path d="M 22,46 L 18,38 L 22,42 L 22,46 Z M 26,44 L 22,36 L 26,40 Z"
        fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
  <!-- Eye -->
  <circle cx="26" cy="54" r="4" fill="var(--paper, #F1EBDD)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
  <circle cx="26" cy="54" r="1.6" fill="var(--ink, #1A1612)"/>
  <!-- Tongue -->
  <path d="M 22,60 L 12,52" stroke="var(--red, #D62828)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="11" cy="51" r="2" fill="var(--red, #D62828)"/>
  <!-- Curled tail -->
  <path d="M 78,62 Q 90,60 88,72 Q 80,76 82,68"
        fill="none" stroke="var(--ink, #1A1612)" stroke-width="2" stroke-linecap="round"/>
  <!-- Legs gripping branch -->
  <path d="M 36,68 L 36,78 M 32,76 L 36,78 L 40,76"
        stroke="var(--ink, #1A1612)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 64,68 L 64,78 M 60,76 L 64,78 L 68,76"
        stroke="var(--ink, #1A1612)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- The hand-lettered joke (with strikethrough on second line) -->
  <text x="50" y="14" font-family="Caveat, cursive" font-size="11" font-weight="700"
        fill="var(--ink, #1A1612)" text-anchor="middle">style is</text>
  <text x="50" y="24" font-family="Caveat, cursive" font-size="11" font-weight="700"
        fill="var(--red, #D62828)" text-anchor="middle" text-decoration="line-through">a costume</text>
</svg>
```

### 7. Anatomy-as-metaphor

**Use when:** the concept describes something organic in terms of a built thing, or vice versa.

**Example concept:** "The brain is a garden, not a computer" → a brain shape *literally rendered as a tilled garden plot*, with sprouts growing up out of the top.

The trick: take the silhouette of one thing and render its *interior* as the metaphorical thing.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Brain silhouette filled with pink -->
  <path d="M 30,55 Q 22,55 22,45 Q 18,42 22,36 Q 24,28 32,28 Q 36,22 44,24
           Q 50,18 58,24 Q 66,22 70,28 Q 78,28 80,36 Q 84,42 80,46
           Q 80,55 72,56 Q 70,64 60,64 L 60,72 L 40,72 L 40,64 Q 30,64 30,55 Z"
        fill="var(--pink, #F26A8D)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Garden furrows INSIDE the brain shape (the conceptual move) -->
  <g stroke="var(--ink, #1A1612)" stroke-width="1" fill="none" opacity="0.7">
    <path d="M 30,38 Q 42,36 54,38 Q 66,36 76,38" stroke-dasharray="2,1.5"/>
    <path d="M 28,46 Q 42,44 54,46 Q 68,44 78,46" stroke-dasharray="2,1.5"/>
    <path d="M 28,54 Q 42,52 54,54 Q 68,52 78,54" stroke-dasharray="2,1.5"/>
    <path d="M 32,62 Q 42,60 54,62 Q 64,60 70,62" stroke-dasharray="2,1.5"/>
  </g>
  <!-- Sprouts growing UP out of the brain -->
  <line x1="38" y1="28" x2="38" y2="22" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
  <ellipse cx="36" cy="22" rx="3" ry="1.5" fill="var(--green, #2D6A4F)" transform="rotate(-30 36 22)"/>
  <ellipse cx="40" cy="22" rx="3" ry="1.5" fill="var(--green, #2D6A4F)" transform="rotate(30 40 22)"/>
  <line x1="50" y1="22" x2="50" y2="10" stroke="var(--green, #2D6A4F)" stroke-width="1.8"/>
  <circle cx="50" cy="8" r="4" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.3"/>
  <line x1="64" y1="24" x2="64" y2="14" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
  <circle cx="64" cy="13" r="3" fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="1.2"/>
  <!-- Worm wiggle in the soil -->
  <path d="M 38,80 Q 42,82 46,80 Q 50,78 54,80" stroke="var(--ink, #1A1612)"
        stroke-width="1.2" fill="none" opacity="0.5"/>
  <text x="50" y="96" font-family="Caveat, cursive" font-size="10" font-weight="700"
        fill="var(--green, #2D6A4F)" text-anchor="middle">tend it daily</text>
</svg>
```

### 8. Symbol-becomes-symbol (transformation)

**Use when:** the concept is about *one thing leading to another* — doubt becomes insight, problem becomes solution.

**Example concept:** "Doubt is better than certainty" → a question mark whose dot has bloomed into a glowing lightbulb.

The trick: take a glyph (?, !, …) and replace one of its parts with a different symbol that represents the *outcome* of the original.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Halo glow -->
  <circle cx="50" cy="78" r="20" fill="var(--yellow, #F4C430)" opacity="0.25"/>
  <circle cx="50" cy="78" r="14" fill="var(--yellow, #F4C430)" opacity="0.30"/>
  <!-- Question mark hook (the dot will be replaced) -->
  <path d="M 30,32 Q 30,14 50,14 Q 70,14 70,30 Q 70,44 54,52 Q 50,54 50,60"
        fill="none" stroke="var(--ink, #1A1612)" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round"/>
  <!-- LIGHTBULB instead of the dot -->
  <path d="M 42,72 Q 42,62 50,62 Q 58,62 58,72 Q 58,78 54,82 L 46,82 Q 42,78 42,72 Z"
        fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2.2"/>
  <!-- Filament -->
  <path d="M 46,72 Q 48,76 50,72 Q 52,76 54,72"
        stroke="var(--red, #D62828)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Threaded base -->
  <line x1="46" y1="84" x2="54" y2="84" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <line x1="47" y1="87" x2="53" y2="87" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <line x1="48" y1="90" x2="52" y2="90" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <!-- Light rays -->
  <line x1="34" y1="74" x2="38" y2="74" stroke="var(--ink, #1A1612)" stroke-width="1.6"/>
  <line x1="62" y1="74" x2="66" y2="74" stroke="var(--ink, #1A1612)" stroke-width="1.6"/>
  <line x1="36" y1="66" x2="40" y2="68" stroke="var(--ink, #1A1612)" stroke-width="1.6"/>
  <line x1="60" y1="68" x2="64" y2="66" stroke="var(--ink, #1A1612)" stroke-width="1.6"/>
</svg>
```

### 9. Cyclical / infinity composition

**Use when:** the concept is about *recurrence, time, age, seasons*.

**Example concept:** "On ageing — it doesn't matter" → two leaves curving into an infinity sign.

The shape carries the meaning. Two organic forms that lean on each other to form a closed loop — naturalist take on cyclicality, vs sterile mathematical infinity.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Left leaf loop (one color) -->
  <path d="M 50,50 Q 30,30 16,50 Q 30,70 50,50 Z"
        fill="var(--green, #2D6A4F)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Right leaf loop (different color) -->
  <path d="M 50,50 Q 70,30 84,50 Q 70,70 50,50 Z"
        fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Veins -->
  <path d="M 18,50 L 48,50" stroke="var(--ink, #1A1612)" stroke-width="1" opacity="0.5"/>
  <path d="M 26,42 Q 30,46 32,50 M 30,58 Q 32,54 34,50" stroke="var(--ink, #1A1612)"
        stroke-width="0.8" fill="none" opacity="0.5"/>
  <path d="M 52,50 L 82,50" stroke="var(--ink, #1A1612)" stroke-width="1" opacity="0.5"/>
  <!-- Center crossing knot -->
  <circle cx="50" cy="50" r="3" fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
  <!-- A small falling leaf to one side (suggests passage of time) -->
  <g transform="translate(18,18) rotate(-25)">
    <path d="M 0,0 Q 6,-4 6,4 Q 0,8 0,0 Z" fill="var(--orange, #E76F51)" stroke="var(--ink, #1A1612)" stroke-width="1"/>
  </g>
  <!-- Small new leaf on the other side -->
  <g transform="translate(78,18) rotate(15)">
    <path d="M 0,0 Q 5,-3 5,3 Q 0,6 0,0 Z" fill="var(--green, #2D6A4F)" stroke="var(--ink, #1A1612)" stroke-width="1"/>
  </g>
  <text x="50" y="92" font-family="Caveat, cursive" font-style="italic" font-size="13"
        text-anchor="middle" fill="var(--green, #2D6A4F)" font-weight="600">it doesn't matter</text>
</svg>
```

### 10. Eye / instrument with symbol-as-feature

**Use when:** the concept is about *seeing, perception, judgment, truth*.

**Example concept:** "Tell the truth" → a hand-drawn eye whose iris is a heart (truth = seeing + love).

The trick: take an instrument-of-perception (eye, ear, hand, lens) and replace its functional part with a symbol that represents the *quality* the concept demands.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Eye outline (slightly asymmetric for hand-drawn feel) -->
  <path d="M 8,52 Q 30,20 50,22 Q 72,24 92,52 Q 70,80 50,78 Q 28,76 8,52 Z"
        fill="var(--paper, #F1EBDD)" stroke="var(--ink, #1A1612)" stroke-width="3.5"/>
  <!-- HEART instead of an iris -->
  <g transform="translate(50,52)">
    <path d="M 0,18 C 0,18 -22,2 -22,-12 C -22,-20 -14,-24 -8,-20
             C -4,-17 0,-12 0,-8 C 0,-12 4,-17 8,-20
             C 14,-24 22,-20 22,-12 C 22,2 0,18 0,18 Z"
          fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
    <ellipse cx="-8" cy="-8" rx="3" ry="2" fill="var(--paper, #F1EBDD)" opacity="0.7"
             transform="rotate(-30 -8 -8)"/>
  </g>
  <!-- Lashes (different lengths, hand-drawn feel) -->
  <line x1="20" y1="32" x2="16" y2="22" stroke="var(--ink, #1A1612)" stroke-width="2.4"
        stroke-linecap="round"/>
  <line x1="33" y1="24" x2="32" y2="14" stroke="var(--ink, #1A1612)" stroke-width="2.4"
        stroke-linecap="round"/>
  <line x1="48" y1="20" x2="48" y2="10" stroke="var(--ink, #1A1612)" stroke-width="2.4"
        stroke-linecap="round"/>
  <line x1="63" y1="24" x2="65" y2="14" stroke="var(--ink, #1A1612)" stroke-width="2.4"
        stroke-linecap="round"/>
  <line x1="78" y1="32" x2="82" y2="22" stroke="var(--ink, #1A1612)" stroke-width="2.4"
        stroke-linecap="round"/>
  <!-- Eye fold above (subtle) -->
  <path d="M 14,48 Q 30,30 50,28" stroke="var(--ink, #1A1612)" stroke-width="1"
        fill="none" opacity="0.4"/>
</svg>
```

## Choosing an idiom for a new concept

When facing a new concept, work through these prompts:

1. **Is it about a relationship?** → idiom 1 (two-object metaphor)
2. **Is it about freedom or breaking out?** → idiom 2 (surreal escape)
3. **Is it about contrast or two states?** → idiom 3 (split metaphor)
4. **Is it about good vs great?** → idiom 4 (status juxtaposition)
5. **Is it about density/richness done right?** → idiom 5 (concentrated ornament)
6. **Does it want a visual joke?** → idiom 6 (witty animal)
7. **Does it describe one thing as another?** → idiom 7 (anatomy as metaphor)
8. **Is it about transformation, emergence?** → idiom 8 (symbol becomes symbol)
9. **Is it about cycles, time, age?** → idiom 9 (cyclical composition)
10. **Is it about seeing or perceiving?** → idiom 10 (eye/instrument with symbol-feature)

If two concepts in the same dashboard map to the same idiom — pick a different idiom for the second one. Variety is the principle.

## What makes an icon "great" vs "fine"

| Fine | Great |
|---|---|
| Generic line-icon set | Each icon a different visual idiom |
| Single accent color | 2–3 palette colors per icon, varied across the set |
| All vector-perfect | Slight asymmetry, hand-drawn feel where appropriate |
| Pure illustration | Often includes a tiny hand-lettered caption (Caveat) |
| Floats in space | Often grounded by a baseline, branch, frame, or ground line |
| Only depicts the concept | Sometimes carries a *visual joke* about the concept |

## Hand-lettered labels inside icons

Several of the idioms above include a small `<text>` element with `font-family="Caveat, cursive"`. This is one of the highest-leverage moves — it adds humanity to the icon at almost no cost. Use it when:

- The icon needs a tiny verbal caption to land the joke
- A single word (color-matched to an accent) would clarify the metaphor
- You want to add a strikethrough as part of the joke (idiom 6)

Don't use it when the icon already carries the meaning visually — too much text in icons makes them feel like infographics.

---

## Additional idioms — extracted from the Sun Simiao build

The following six idioms emerged when the catalog above wasn't quite right for a Tang dynasty subject. They generalize beyond that specific build — use them whenever the named situation appears.

### 11. Single-element + one ripple (still surface, focal disturbance)

**Use when:** the concept is about *attention itself, focus, the quality of perception before action*.

**Example concept:** "Calm the mind first" → a still pond receiving one drop, with concentric ripples.

The trick: the icon shows a *receptive* surface (water, a sand garden, a clean page) and one disturbance from above. Concentric rings tell the eye that the surface was previously still. The drop in the air implies imminence.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Surface (oval, slightly hand-drawn) -->
  <ellipse cx="50" cy="64" rx="38" ry="22" fill="#88A98E" opacity="0.35"
           stroke="var(--ink, #1A1612)" stroke-width="2.5"/>
  <!-- Concentric ripples from one drop -->
  <ellipse cx="50" cy="64" rx="6"  ry="3.5" fill="none" stroke="var(--green, #2D6A4F)" stroke-width="1.6"/>
  <ellipse cx="50" cy="64" rx="14" ry="7"   fill="none" stroke="var(--green, #2D6A4F)" stroke-width="1.2" opacity="0.8"/>
  <ellipse cx="50" cy="64" rx="22" ry="11"  fill="none" stroke="var(--green, #2D6A4F)" stroke-width="0.9" opacity="0.55"/>
  <ellipse cx="50" cy="64" rx="30" ry="15"  fill="none" stroke="var(--green, #2D6A4F)" stroke-width="0.7" opacity="0.35"/>
  <!-- The single drop falling -->
  <path d="M 50,28 Q 47,40 50,46 Q 53,40 50,28 Z"
        fill="var(--blue, #1D3557)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
  <!-- An edge marker (reed) -->
  <line x1="20" y1="50" x2="22" y2="74" stroke="var(--green, #2D6A4F)" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="20" cy="48" rx="2" ry="4" fill="var(--green, #2D6A4F)"/>
  <text x="50" y="96" font-family="Caveat, cursive" font-size="9" font-weight="700"
        fill="var(--blue, #1D3557)" text-anchor="middle">be still first</text>
</svg>
```

### 12. Two-silhouettes-sharing-one-object (paired-state with shared center)

**Use when:** the concept is about *unequal parties brought to equality through a shared act*.

**Example concept:** "Treat all equally" → a noble silhouette and a beggar silhouette on either side of a divider, sharing one steaming bowl that crosses the divider.

This is a variant of paired-state contrast (idiom 3) but with a *shared object* connecting the two states rather than the same object split. The shared object is the icon's emotional center — bowl, scroll, hand, breath.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Vertical dotted divider -->
  <line x1="50" y1="14" x2="50" y2="86" stroke="var(--ink, #1A1612)"
        stroke-width="1" stroke-dasharray="2,3" opacity="0.4"/>
  <!-- LEFT: noble silhouette (broad, structured) -->
  <path d="M 30,80 L 30,42 Q 30,32 22,30 Q 26,22 32,22 Q 32,16 36,16
           Q 40,16 40,22 Q 40,28 38,32 L 38,42 L 42,42 L 42,80 Z"
        fill="var(--blue, #1D3557)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <circle cx="36" cy="14" r="5" fill="var(--blue, #1D3557)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <!-- RIGHT: humble silhouette (smaller, leaning) -->
  <path d="M 60,80 L 60,46 Q 60,38 64,36 L 64,30 Q 66,28 68,28
           Q 70,28 72,30 L 72,36 Q 76,38 76,46 L 76,80 Z"
        fill="#7A3F4D" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <circle cx="68" cy="22" r="5" fill="#7A3F4D" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <!-- THE SHARED BOWL between them, sitting at the divider -->
  <path d="M 38,68 Q 50,80 62,68 L 60,72 Q 50,82 40,72 Z"
        fill="#C8932F" stroke="var(--ink, #1A1612)" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="50" cy="68" rx="13" ry="2" fill="var(--ink, #1A1612)"/>
  <!-- Steam rising through the divider -->
  <path d="M 47,66 Q 45,60 49,56 Q 53,52 51,46" stroke="var(--green, #2D6A4F)"
        stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M 53,66 Q 55,60 51,56 Q 47,52 49,46" stroke="var(--green, #2D6A4F)"
        stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <text x="50" y="96" font-family="Caveat, cursive" font-size="10"
        font-weight="700" fill="var(--red, #D62828)" text-anchor="middle">one bowl</text>
</svg>
```

### 13. Object-passing-fire (transfer without diminishment)

**Use when:** the concept is about *generosity, teaching, transmission* — giving something away without losing it.

**Example concept:** "Forget your own fortune" → one candle lighting another, both flames present, an arc of flame between them.

The trick: two like objects in identical posture, with a *connecting transfer element* (flame-arc, a thread of light, a stream of water). Both objects must read as undiminished — that's the conceptual move.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Left candle -->
  <rect x="22" y="46" width="14" height="36" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <line x1="29" y1="32" x2="29" y2="46" stroke="var(--ink, #1A1612)" stroke-width="1.2"/>
  <!-- Left flame, leaning right (giving direction) -->
  <path d="M 29,32 Q 38,26 36,18 Q 32,22 30,18 Q 28,26 29,32 Z"
        fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="1.8" stroke-linejoin="round"/>
  <ellipse cx="33" cy="24" rx="1.5" ry="2" fill="var(--yellow, #F4C430)" opacity="0.85"/>
  <!-- Right candle -->
  <rect x="64" y="46" width="14" height="36" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <line x1="71" y1="32" x2="71" y2="46" stroke="var(--ink, #1A1612)" stroke-width="1.2"/>
  <!-- Right flame, just catching, leaning left (receiving direction) -->
  <path d="M 71,32 Q 64,26 65,20 Q 69,22 71,18 Q 73,26 71,32 Z"
        fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="1.8" stroke-linejoin="round"/>
  <ellipse cx="68" cy="24" rx="1.5" ry="2" fill="var(--yellow, #F4C430)" opacity="0.85"/>
  <!-- The arc of flame transferring -->
  <path d="M 38,22 Q 50,16 62,22" stroke="var(--yellow, #F4C430)" stroke-width="2.5"
        fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M 38,22 Q 50,18 62,22" stroke="var(--red, #D62828)" stroke-width="1.5"
        fill="none" stroke-linecap="round"/>
  <!-- Saucers for grounding -->
  <ellipse cx="29" cy="84" rx="12" ry="2.5" fill="none" stroke="var(--ink, #1A1612)" stroke-width="1.8"/>
  <ellipse cx="71" cy="84" rx="12" ry="2.5" fill="none" stroke="var(--ink, #1A1612)" stroke-width="1.8"/>
  <text x="50" y="96" font-family="Caveat, cursive" font-size="9" font-weight="700"
        fill="var(--ink, #1A1612)" text-anchor="middle" opacity="0.7">no flame is lost</text>
</svg>
```

### 14. Single-light-in-hostile-setting (concentrated richness, surrounded)

**Use when:** the concept is about *commitment in adversity, going anyway, the small thing that holds*.

**Example concept:** "Go through cold and heat" → a single lit lantern in a dark mountain pass, with a tiny figure walking past it.

Different from idiom 5 (concentrated richness as ornament) — this is concentrated richness *under threat*. The icon needs:
- A dark, layered backdrop (mountain silhouettes, storm, urban canyon)
- A single bright concentration (lantern, candle, hearth, lighthouse)
- A glow halo around the bright point (radial gradient, opacity 0.35-0.45)
- A *tiny* figure or object that grounds the scale (matchstick person, walking stick, bag)

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Layered dark mountain silhouettes -->
  <path d="M 0,80 L 18,52 L 32,68 L 48,42 L 64,62 L 78,48 L 100,76 L 100,100 L 0,100 Z"
        fill="var(--blue, #1D3557)" opacity="0.85"/>
  <path d="M 0,90 L 26,72 L 44,84 L 62,72 L 84,86 L 100,80 L 100,100 L 0,100 Z"
        fill="var(--ink, #1A1612)"/>
  <!-- Glow halo behind the bright point -->
  <circle cx="50" cy="50" r="22" fill="var(--yellow, #F4C430)" opacity="0.35"/>
  <circle cx="50" cy="50" r="14" fill="var(--yellow, #F4C430)" opacity="0.45"/>
  <!-- Lantern body -->
  <rect x="42" y="40" width="16" height="22" rx="2" fill="var(--yellow, #F4C430)"
        stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <line x1="42" y1="48" x2="58" y2="48" stroke="var(--ink, #1A1612)" stroke-width="1"/>
  <line x1="42" y1="54" x2="58" y2="54" stroke="var(--ink, #1A1612)" stroke-width="1"/>
  <path d="M 40,40 L 60,40 L 56,34 L 44,34 Z" fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <path d="M 50,34 Q 48,28 50,22" stroke="var(--ink, #1A1612)" stroke-width="1.5" fill="none"/>
  <path d="M 40,62 L 60,62 L 56,68 L 44,68 Z" fill="var(--red, #D62828)" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  <!-- Tiny grounding figure -->
  <g transform="translate(76, 80)">
    <circle cx="0" cy="-6" r="2" fill="var(--paper, #F1EBDD)"/>
    <line x1="0" y1="-4" x2="0" y2="2" stroke="var(--paper, #F1EBDD)" stroke-width="1.5"/>
    <line x1="0" y1="-2" x2="-3" y2="0" stroke="var(--paper, #F1EBDD)" stroke-width="1.2"/>
    <line x1="0" y1="2" x2="-2" y2="6" stroke="var(--paper, #F1EBDD)" stroke-width="1.2"/>
    <line x1="0" y1="2" x2="2" y2="6" stroke="var(--paper, #F1EBDD)" stroke-width="1.2"/>
    <rect x="2" y="-1" width="4" height="3" fill="var(--yellow, #F4C430)"/>
  </g>
</svg>
```

### 15. Linked-living-forms loop (cyclical, life-as-procession)

**Use when:** the concept is about *interconnection across kinds* — humans and animals, generations, the food chain, ecosystems.

**Example concept:** "Equal regard for all life" → a leaf, a butterfly, a hand, a small animal arranged in a closed loop with a central character/glyph.

Different from idiom 9 (cyclical/infinity, which uses two leaves). This idiom uses *four or more dissimilar living forms*, all rendered to the same size/style scale to assert their equality. The center holds a small focal element (a character, a single jewel, a Latin technical label).

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer dotted guide circle -->
  <circle cx="50" cy="52" r="34" fill="none" stroke="var(--green, #2D6A4F)"
          stroke-width="1.5" stroke-dasharray="2,3" opacity="0.5"/>
  <!-- LEAF (top) -->
  <g transform="translate(50, 18)">
    <path d="M 0,0 Q -8,-6 -8,4 Q 0,10 0,0 Z"
          fill="var(--green, #2D6A4F)" stroke="var(--ink, #1A1612)" stroke-width="1.8"/>
  </g>
  <!-- BUTTERFLY (right) -->
  <g transform="translate(82, 50)">
    <ellipse cx="0" cy="0" rx="1.5" ry="5" fill="var(--ink, #1A1612)"/>
    <path d="M 0,-3 Q -8,-10 -10,-2 Q -6,2 0,0 Z" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
    <path d="M 0,-3 Q 8,-10 10,-2 Q 6,2 0,0 Z" fill="var(--yellow, #F4C430)" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
  </g>
  <!-- OPEN HAND (bottom) -->
  <g transform="translate(50, 84)">
    <path d="M -5,4 L -5,-3 Q -5,-5 -3,-5 L -3,-7 Q -3,-9 -1,-9 L -1,-6
             Q -1,-9 1,-9 L 1,-6 Q 1,-9 3,-9 L 3,-6 Q 3,-7 5,-7 L 5,-2
             Q 5,2 5,4 Z"
          fill="var(--orange, #E76F51)" stroke="var(--ink, #1A1612)" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
  <!-- SMALL ANIMAL (left) -->
  <g transform="translate(18, 50)">
    <ellipse cx="0" cy="0" rx="6" ry="4" fill="#7A3F4D" stroke="var(--ink, #1A1612)" stroke-width="1.5"/>
    <circle cx="-4" cy="-2" r="2.5" fill="#7A3F4D" stroke="var(--ink, #1A1612)" stroke-width="1.2"/>
    <circle cx="-5" cy="-4" r="1.5" fill="#7A3F4D"/>
    <circle cx="-3" cy="-4" r="1.5" fill="#7A3F4D"/>
    <circle cx="-6" cy="-2" r="0.5" fill="var(--ink, #1A1612)"/>
  </g>
  <!-- Center focal: a glyph or single character -->
  <text x="50" y="56" font-family="Fraunces, serif" font-size="14" font-style="italic"
        fill="var(--red, #D62828)" text-anchor="middle" font-weight="700">life</text>
</svg>
```

### 16. Thread-into-tapestry (unfinished, ongoing-work)

**Use when:** the concept is about *continuing a vow, a lineage, an unfinished work, a life still in progress*.

**Example concept:** "Until I no longer can" → a single colored thread emerging from the left, being woven into a larger cloth on the right.

The trick: the icon shows *a process mid-state*. Most of the cloth is complete. One row is in progress. The thread that is currently being woven is colored differently — usually with the page's primary accent — to mark it as the *active line*. A loose end on the left implies "still going."

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Loose thread emerging from the left -->
  <path d="M 8,50 Q 16,46 24,52 Q 32,58 40,50"
        stroke="var(--red, #D62828)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Cloth weave (right side) -->
  <g transform="translate(46, 22)">
    <!-- Vertical warp threads -->
    <line x1="2"  y1="0" x2="2"  y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <line x1="10" y1="0" x2="10" y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <line x1="18" y1="0" x2="18" y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <line x1="26" y1="0" x2="26" y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <line x1="34" y1="0" x2="34" y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <line x1="42" y1="0" x2="42" y2="56" stroke="var(--yellow, #F4C430)" stroke-width="1.5"/>
    <!-- Existing horizontal weft threads (jade/green) -->
    <line x1="-2" y1="6"  x2="46" y2="6"  stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <line x1="-2" y1="12" x2="46" y2="12" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <line x1="-2" y1="18" x2="46" y2="18" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <line x1="-2" y1="24" x2="46" y2="24" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <!-- The new red thread, mid-weave -->
    <line x1="-6" y1="30" x2="46" y2="30" stroke="var(--red, #D62828)" stroke-width="2.2"/>
    <!-- More existing threads below -->
    <line x1="-2" y1="36" x2="46" y2="36" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <line x1="-2" y1="42" x2="46" y2="42" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <line x1="-2" y1="48" x2="46" y2="48" stroke="var(--green, #2D6A4F)" stroke-width="1.5"/>
    <!-- Cloth border -->
    <rect x="-2" y="0" width="48" height="56" fill="none" stroke="var(--ink, #1A1612)" stroke-width="2"/>
  </g>
  <!-- Tiny shuttle below, with implied trail -->
  <ellipse cx="20" cy="80" rx="10" ry="3" fill="var(--ink, #1A1612)"/>
  <line x1="14" y1="80" x2="20" y2="50" stroke="var(--red, #D62828)" stroke-width="1" opacity="0.5" stroke-dasharray="2,2"/>
  <text x="50" y="96" font-family="Caveat, cursive" font-size="9" font-weight="700"
        fill="var(--ink, #1A1612)" text-anchor="middle" opacity="0.7">until the thread runs out</text>
</svg>
```

## Updated choosing-an-idiom list

1. Two-object metaphor (relationship between things)
2. Surreal escape (freedom, breaking out)
3. Paired-state contrast (two states of one thing)
4. Status-juxtaposition (good vs great)
5. Concentrated-richness (density done right)
6. Witty animal (visual joke)
7. Anatomy-as-metaphor (one thing rendered as another)
8. Symbol-becomes-symbol (transformation)
9. Cyclical/infinity (recurrence, time, two organic forms)
10. Eye/instrument with symbol-feature (perception)
11. **Single-element + ripple** (attention itself, focal disturbance)
12. **Two-silhouettes-sharing-one-object** (unequal parties brought to equality through a shared act)
13. **Object-passing-fire** (transfer without diminishment, generosity)
14. **Single-light-in-hostile-setting** (commitment in adversity)
15. **Linked-living-forms loop** (interconnection across kinds)
16. **Thread-into-tapestry** (unfinished ongoing work)

For a 10-card dashboard, you'll typically use 8–10 different idioms. Repetition is allowed only when the second use *serves a different conceptual register* (e.g. two-object metaphor with steam connecting in card 4 versus two-object metaphor with flame-arc connecting in card 8 — the connecting element is what carries the new meaning).


---

## 6. Volumetric 2.5D Symbolic Idioms (`glyph-foundry` Integration)

When a dashboard section needs deeper semiotic architecture than a flat spot icon (e.g., an intake sieve, paired cohort crucible, coaching taper, economic multiplier, or torsion balance), consume the 4-plane (`Z0..Z3`) volumetric `<symbol>` sprite emitted by [glyph-foundry](../../glyph-foundry/SKILL.md):

| Idiom ID | Metaphor | Recommended Slot |
|---|---|---|
| `crowd` | Sculpted 2.5D actor array with domain chest emblems + CAD capacity slots | KPI card / Staffing intake |
| `gate` | 3-stage metrological sieve (`Domain Craft` → `Paired Fit` → `Day-1 Bar`) | Vetting & selection pipeline |
| `cohort` | Unified crucible amphitheatre with paired client/Pursuit dyads | Training & pairing section |
| `contract` | Stamped SOW ledger (`8 billable`) + dashed unbilled reserve hangar | Commercial structure |
| `taper` | 3D axonometric coaching strata (`5 d/wk → 3 d/wk → 1 h/day → taper`) | Enablement & autonomy timeline |
| `fork` | Switching-yard junction into Client Conversion Vault vs. Pursuit Pod | Post-cohort career pathways |
| `equation` | 4-stage dimensional multiplier (`1D..4D`) + 3D isometric profit ingot | Unit economics callout |
| `balance` | Precision torsion scale (`8:8`) vs. molecular catalyst cell (`8:2–4`) | Counterpoint / trade-off card |
| `venn` | Resonance crucible lens (Vesica Piscis intersection with hatch) | Hero masthead emblem |

### Embedding a Volumetric `<symbol>` in an Editorial Dashboard
```html
<!-- 1. Inline the sprite sheet once at the top of <body> -->
<!-- (Generated via: python3 .agents/skills/glyph-foundry/scripts/emit.py) -->
<svg class="editorial-svg" viewBox="0 0 320 180" role="img" aria-label="Unit Economics Multiplier">
  <use href="#tap-math"/>
</svg>
```
