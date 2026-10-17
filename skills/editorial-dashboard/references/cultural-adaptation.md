# Cultural Adaptation

The skill's defaults — cream paper, vermilion-and-jewel-tones, Fraunces serif, Caveat marginalia — were tuned on a Western subject (Milton Glaser, AIGA London, 1960s–2000s graphic design vocabulary). They produce a "warm modern editorial print" feel that suits *a lot* of subjects but not all of them.

This document is for when the subject lives in a different cultural register — Tang dynasty China, Edo Japan, the Mughal court, pre-Columbian Mexico, Yoruba philosophy, Sufi poetry. The goal is to adapt without abandoning the editorial discipline that makes the skill work.

## The first principle: discipline survives, surface adapts

The patterns that should NOT change for a different cultural subject:

- The **section eyebrow + display title with one italic emphasis word + lede** structure
- The **principle-card grid with numbered, iconic, openable cards**
- **At least one interactive enactment** of an idea
- The **hero as a symbol the subject would recognize**, not a portrait
- The **critique pass** ("what would the subject dismantle")
- **Hand-drawn warmth** somewhere on the page (Caveat, scribble, wobble, fleurons)
- **One file, no dependencies, vanilla JS**

What CAN and SHOULD change:

- The **palette** (with care)
- The **display font stack** (additively, not replacing)
- The **specific cultural artifacts** that appear as decorative motifs (seals, fleurons, marginalia symbols)
- The **closing inscription's visual treatment** (postcard for Glaser, temple-rubbing for Sun Simiao)

## The palette-aliasing pattern

The single most important technique. The default palette uses six jewel tones (`--red`, `--blue`, `--yellow`, `--pink`, `--green`, `--orange`) and the icon catalog references them by these semantic names. If you swap them out wholesale, every icon in the catalog breaks visually.

The fix: introduce *culturally-tuned* color tokens, then alias them to the semantic names.

```css
:root {
  /* Culturally-tuned tokens — these are what designers will actually choose */
  --vermilion:   #B8312F;  /* 朱砂 zhūshā — primary accent, deeper than Glaser red */
  --vermilion-d: #8E1F1D;  /* deepest seal-stamp red */
  --jade:        #4F7A57;  /* 青 — herb green, deeper than Glaser green */
  --gold:        #C8932F;  /* 金 — gold-leaf, warmer than Glaser yellow */
  --indigo:      #2A3A5A;  /* 靛青 dark scholarly blue */
  --plum:        #7A3F4D;  /* 紫 plum, supplementary */
  --bone:        #D6C9AA;  /* aged-paper highlight */

  /* Semantic aliases — keep the catalog working */
  --red:    var(--vermilion);
  --blue:   var(--indigo);
  --yellow: var(--gold);
  --pink:   var(--plum);
  --green:  var(--jade);
  --orange: var(--vermilion);  /* if no orange in cultural palette, alias to nearest */
}
```

Now every existing pattern from `svg-icons.md` works unchanged. The page reads as Tang dynasty in palette, but the hand-letting still uses `var(--red)` and gets the right color automatically.

### Choosing culturally-tuned colors

Don't pick by browsing color palettes labeled "Asian" or "Mexican." That's the tourist's mistake. Pick by:

1. **What pigments did the subject's era actually use?** Tang dynasty: vermilion (cinnabar/朱砂), malachite green, lead white, gold leaf, indigo. Edo Japan: indigo (藍), persimmon orange (柿色), sumi black, gold leaf, vermilion lacquer. Yoruba textile: indigo (adire), terra-cotta, white, occasional palm-oil yellow.
2. **Slightly desaturate from web-default.** Real pigments fade. `#B8312F` reads as 7th-century vermilion; `#FF0000` reads as a website. The cream paper background also requires slight desaturation — fully-saturated colors on cream feel discordant.
3. **Test on the cream paper.** Cream `#F2EAD3` is the default backdrop. A color that looks great on white may look anemic on cream. Boost contrast and warmth.

### Adapting the paper, too

The default paper `#F1EBDD` is "modern offset-printed cream." For a Tang dynasty subject, a slightly warmer tone (`#F2EAD3`) reads more as rice paper. For a Mughal subject, a slightly more golden tone (`#F4ECD0`) reads more as parchment. These are subtle moves — the paper should still feel *paper*, not background — but the warmth signals the era.

```css
/* Tang/Sun Simiao */
--paper:      #F2EAD3;   /* rice paper, slightly warmer */
--paper-deep: #E8DCC0;
--paper-warm: #F5EFDF;

/* Mughal — TODO if you do this build */
--paper:      #F4ECD0;   /* parchment, slightly golden */

/* Default Glaser */
--paper:      #F1EBDD;   /* offset-printed cream */
```

## Multi-script typography

When the subject's language uses a non-Latin script, you'll want to integrate that script into the page. Two principles:

### 1. Add a script-specific font stack alongside the defaults — don't replace

```css
:root {
  --display: 'Fraunces', 'Noto Serif SC', 'Times New Roman', serif;
  --body:    'DM Sans', system-ui, sans-serif;
  --mono:    'JetBrains Mono', ui-monospace, monospace;
  --hand:    'Caveat', cursive;

  /* Script-specific additions */
  --cn:       'Ma Shan Zheng', 'Noto Serif SC', serif;  /* Chinese calligraphic */
  --cn-serif: 'Noto Serif SC', serif;                    /* Chinese serif */
}
```

Fraunces is still the display face. The Chinese fonts are added *for Chinese characters specifically*. This means English headings still get Fraunces (which has a print-serif quality that pairs well with Chinese characters), and Chinese characters get a font that knows how to render them properly.

For the Google Fonts URL, just append the additional families:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:...&family=DM+Sans:...&family=JetBrains+Mono:...&family=Caveat:...&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
```

### 2. Foreign-language characters must *earn* their place

The single biggest mistake when adapting cross-culturally: using foreign-language characters as decoration. A page about Sun Simiao that scatters random Chinese characters across the layout is the cultural equivalent of stock-photo "globalization."

**Earn it when:**
- The character/phrase is *quoted from the subject's own writing* (普同一等 from On the Absolute Sincerity)
- The character *names something the visual depicts* (命 inside a life-cycle loop)
- The character is *the subject's signature/seal* (藥王 in the corner stamp)
- A bilingual inscription card lets the original text breathe alongside the translation

**Don't use it when:**
- The page just needs "more decoration"
- The character looks pretty in a typeface
- You can't say specifically *why this character is here, in this place, on this page*

The test: if you removed the character, would the page lose meaning? If yes, keep it. If no, remove it.

### 3. Inscription pattern — bilingual closing card

The strongest move for honoring the source language is the closing inscription card with both scripts:

```html
<div class="inscription-card">
  <p class="inscription-cn">凡大醫治病…若有疾厄來求救者，<br>
                            不得問其貴賤貧富，長幼妍媸，<br>
                            怨親善友，華夷愚智，<br>
                            普同一等，皆如至親之想。</p>
  <blockquote class="inscription-q">
    "If any person comes seeking help, he must not ask their <em>status</em>,
    their <em>wealth</em>, their <em>age</em>… All are to be treated as one rank
    — as if each were a close and beloved relative."
  </blockquote>
  <p class="inscription-attribution">Sun Simiao · 652 CE</p>
</div>
```

Original on top, translation below, attribution at the bottom. The original is presented as the primary text — it's the canonical version — and the English is the gloss. This is the inverse of the polite Western pattern (English first, translation in italics). For a non-Western subject, give the source language structural primacy.

## Cultural artifacts as decorative motifs

Different cultures have different *recurring visual objects* that read instantly as "this register, not that one." For each subject, pick one or two and use them sparingly:

| Subject world | Iconic objects to consider |
|---|---|
| Imperial China | Red seal stamps (印章), gourd, scroll, brush, hanging tassel, lantern, jade glyph |
| Edo Japan | Hanko stamp, fan, ink-painting brush stroke, persimmon, paper crane folded once |
| Mughal India | Cypress-tree marginalia, illuminated capitals, jali screen pattern, lotus glyph |
| Pre-Columbian | Step-fret motif, jade bead, codex panel divider, single feather |
| Sufi/Persian | Geometric tile, single line of nasta'liq, the rose-and-nightingale motif |
| Bauhaus | Primary-color circles, hand-set type specimens, isometric rule lines |
| Italian Renaissance | Marble wash backdrop, gold-leaf accent, illuminated initial |

The **seal stamp** is one of the highest-leverage motifs because it can appear at any scale: a tiny corner-stamp on the hero, a 64-pixel artifact next to a quote, a watermark behind the inscription card.

```html
<!-- Inline seal-stamp -->
<g transform="translate(298, 130) rotate(-5)">
  <rect x="0" y="0" width="44" height="44" fill="#8E1F1D" stroke="#1F1A14" stroke-width="1.2"/>
  <text x="22" y="18" font-family="Ma Shan Zheng, serif" font-size="14"
        fill="#F2EAD3" text-anchor="middle">藥</text>
  <text x="22" y="36" font-family="Ma Shan Zheng, serif" font-size="14"
        fill="#F2EAD3" text-anchor="middle">王</text>
</g>
```

The slight rotation, the imperfect stamp-impression feel — these are what makes a 44px element read as "seal" rather than "red square." The CSS-only version with the imperfection-pseudo-elements is in the Sun Simiao build for reference.

## The cross-cultural hero — choosing the right symbol

The "hero is a symbol, not a portrait" rule from `SKILL.md` applies even more strongly cross-culturally. A photograph or rendered portrait of a non-Western subject risks reading as either *exoticizing* or *generic ethnic illustration* — both lose the dignity of a real symbolic anchor.

Better: the *object the subject would carry*.

| Subject | Bad hero | Good hero |
|---|---|---|
| Sun Simiao | Stylized portrait of a Tang scholar | His medicine gourd with rising qi and a 千金 inscription |
| Hokusai | A self-portrait | A single wave from "The Great Wave" with marginalia |
| Rumi | A whirling dervish illustration | A reed flute (نای) with one tear of ink at the mouthpiece |
| Frida Kahlo | A stylized portrait | A single hand-painted milagro charm — the thing a real Frida would have known |
| Hildegard of Bingen | An abbess illustration | A single illuminated capital "H" with a vine breaking through it |

The test: would the subject *recognize* this object as belonging to them, or would they recognize this image as someone else's idea of *them*?

## Pitfalls to actively avoid

When adapting cross-culturally, the failure modes are predictable:

1. **Decorative-only foreign characters.** The single most common mistake. Apply the earn-it test ruthlessly.
2. **The "Asian-themed" palette of red+gold-on-black with brushstroke fonts.** Reads as restaurant menu, not editorial. Use real cultural pigments instead.
3. **A portrait or "ethnic illustration" as hero.** Use an object instead.
4. **English-first bilingual inscriptions.** Give the source language primacy.
5. **Reverence as the only register.** Sun Simiao made one joke ("all physicians are evidently incurable") and it's the most human moment in the Oath. Find the subject's wit. Reverence without wit is mausoleum, not page.
6. **Hand-lettered marginalia in Caveat for non-Western quotes.** Caveat is a *Western informal hand*. For a quoted phrase in Chinese, use the cultural script (Ma Shan Zheng, Noto Serif SC) — not Caveat trying to render Chinese.

## When NOT to adapt

If the subject is a non-Western *idea* rather than a non-Western *person* — e.g., "Stoic disciplines" rendered for a Western reader, or "Confucian ethics in the modern workplace" for a business-book audience — the default Western palette may actually be the right move. Adaptation should serve the subject's home register, not virtue-signal a multicultural design choice.

The question to ask: **whose home is this page?** If the home is the subject's, adapt fully. If the home is a Western reader getting an introduction, the default palette with selected cultural anchors (the gourd, the seal, one quoted phrase) may be enough.

## A short adaptation checklist

Before declaring v2 done on a cross-cultural build:

- [ ] Palette uses culturally-grounded pigments, aliased to the semantic tokens
- [ ] Paper warmth tuned to the era (rice paper / parchment / etc.)
- [ ] Display font stack adds the cultural script alongside Fraunces
- [ ] Every foreign-script character on the page passes the earn-it test
- [ ] Closing inscription card gives the source language structural primacy
- [ ] Hero is an object the subject would carry, not a portrait
- [ ] One culturally-resonant decorative motif (seal stamp, fan, jali screen) appears 2–3 times across the page as a visual through-line
- [ ] One moment of the subject's *wit* survives, not just their gravitas
