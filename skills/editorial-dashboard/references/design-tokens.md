# Design Tokens

The defaults below produce the cream-paper editorial feel that worked for the Glaser dashboard. Use them unless the user requests otherwise. They're tuned for warmth + readability + a slight feeling of *print*.

## Palette

```css
:root {
  /* Paper */
  --paper:       #F1EBDD;   /* cream, the dominant background */
  --paper-deep:  #E8DFC8;   /* slightly darker cream, for cards/sections */
  --ink:         #1A1612;   /* almost-black, never pure black */
  --ink-soft:    #4A4039;   /* soft ink for body copy */

  /* Jewels — used for accent + each principle gets one */
  --red:         #D62828;   /* the I♥NY heart red — primary accent */
  --blue:        #1D3557;   /* navy depth */
  --yellow:      #F4C430;   /* mustard, not lemon */
  --pink:        #F26A8D;   /* dusty rose, not millennial pink */
  --green:       #2D6A4F;   /* forest, not sage */
  --orange:      #E76F51;   /* warm earth */
}
```

**Why these specifically:**
- The cream paper avoids the "blank webapp" feel of pure white. It implies *physical paper*.
- The ink is `#1A1612` — never pure black, which feels harsh on cream. This pair has the contrast of a letterpress page.
- The accent jewels are saturated but slightly desaturated from web-default (e.g. `#D62828` not `#FF0000`). They look like *printed inks*, not RGB pixels.
- The palette has enough variety that you can give each of 6+ principles its own color without repetition.

**Don't use:** pure white, pure black, neon colors, gradients (except subtle radial halos). Stick to the inks above.

## Type stack

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
:root {
  --display: 'Fraunces', 'Times New Roman', serif;
  --body:    'DM Sans', system-ui, sans-serif;
  --mono:    'JetBrains Mono', ui-monospace, monospace;
  --hand:    'Caveat', cursive;
}
```

### Why these four

- **Fraunces** — a modern serif with extraordinary range. It has an `opsz` (optical size) axis for big-vs-small adaptation, a `SOFT` axis from sharp to rounded, and a `WONK` axis that adds quirk to italics. Use for all display titles and pull quotes.
- **DM Sans** — clean, optical-size aware, no character. That's the point. It carries body copy without competing with Fraunces.
- **JetBrains Mono** — for eyebrow labels ("§ One · A subtitle"), tag chips, captions, attribution lines. The mono gives the editorial newsprint feel.
- **Caveat** — the hand-lettering. Used SPARINGLY: marginalia, the occasional callout, hand-drawn labels inside icons. Too much Caveat ruins it.

### Type rules

```css
/* Display titles use Fraunces with SOFT axis pushed */
h1, h2, .display {
  font-family: var(--display);
  font-variation-settings: "opsz" 144, "SOFT" 60, "WONK" 0;
  font-weight: 700;
  letter-spacing: -0.025em;  /* tightened for display */
}

/* The italic emphasis word in display titles uses MORE wonk */
h1 em, h2 em, .display em {
  font-style: italic;
  font-variation-settings: "opsz" 144, "SOFT" 100, "WONK" 1;
  color: var(--red);  /* italic em words also get the accent color */
}

/* Body */
body, p {
  font-family: var(--body);
  font-size: 1rem;
  line-height: 1.55;
  color: var(--ink-soft);
}

/* Eyebrows and captions */
.eyebrow, .mono {
  font-family: var(--mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink);
}

/* Marginalia (hand-lettered) */
.marginalia {
  font-family: var(--hand);
  font-weight: 600;
  font-size: 1.15rem;
  color: var(--red);
  display: inline-block;
  transform: rotate(-2.5deg);
}
```

## Spacing scale

```css
:root {
  --section: clamp(4rem, 8vw, 7rem);   /* between major sections */
  --card-pad: clamp(1.2rem, 2.5vw, 2rem);
  --gap-tight: 0.6rem;
  --gap: 1.5rem;
  --gap-loose: 3rem;
}
```

Sections have generous breathing room — at least 4rem padding top/bottom. Cards inside grids can be denser.

## Layout containers

```css
.wrap {
  width: min(100% - 2rem, 1200px);
  margin: 0 auto;
}
.wrap-narrow {
  width: min(100% - 2rem, 760px);
  margin: 0 auto;
}
```

The narrow wrap is for quotes, finales, single-focus moments.

## Section eyebrow pattern

The signature opening-of-a-section pattern:

```html
<div class="section-head">
  <span class="section-eyebrow">§ One · A subtitle</span>
  <h2 class="section-title">The big idea, with one <em>italic word</em>.</h2>
  <p class="section-lede">
    Two-sentence introduction in body type.
  </p>
  <span class="marginalia">↳ optional hand-lettered aside</span>
</div>
```

```css
.section-eyebrow {
  font-family: var(--mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--red);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.section-eyebrow::before {
  content: ""; width: 24px; height: 1.5px;
  background: var(--red);
}
.section-title {
  font-family: var(--display);
  font-variation-settings: "opsz" 144, "SOFT" 50;
  font-weight: 700;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0.6rem 0 1rem;
  color: var(--ink);
}
.section-title em {
  font-style: italic;
  font-variation-settings: "opsz" 144, "SOFT" 100, "WONK" 1;
  color: var(--red);
}
.section-lede {
  font-family: var(--display);
  font-variation-settings: "opsz" 14, "SOFT" 30;
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--ink-soft);
  max-width: 56ch;
}
```

## Don't violate these defaults without reason

If the user doesn't specify otherwise, use exactly the tokens above. The reason is the palette and type pairing have been *tuned together* — swapping in a different serif or a brighter red breaks the unified feel. If a user wants a darker mode or a different palette, that's its own design pass; do it deliberately, not by accident.

## For non-Western subjects

The defaults above are tuned for a Western (broadly: 20th-century European/American editorial print) register. If the subject lives in a different cultural world, use the **palette-aliasing pattern** documented in `cultural-adaptation.md`. The short version:

```css
:root {
  /* Culturally-tuned tokens — these are the colors you'll think in */
  --vermilion: #B8312F;  --jade: #4F7A57;  --gold: #C8932F;
  --indigo:    #2A3A5A;  --plum: #7A3F4D;  --bone: #D6C9AA;

  /* Aliases — keep the icon catalog working unchanged */
  --red:   var(--vermilion);
  --green: var(--jade);
  --yellow: var(--gold);
  --blue:  var(--indigo);
  --pink:  var(--plum);
  --orange: var(--vermilion);
}
```

Plus an *additional* font for the script (Ma Shan Zheng for Chinese calligraphic, Noto Naskh for Arabic, etc.) — added alongside Fraunces, not replacing it. See `cultural-adaptation.md` for the full pattern.
