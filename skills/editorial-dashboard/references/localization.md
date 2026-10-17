# Localization

When localizing an editorial dashboard, voice and aphorism cadence matter more than literal accuracy. This document captures the discipline.

## The philosophy

Editorial work depends on voice. The subject's voice is what makes the dashboard feel like editorial design instead of a generic info-page. Translation is the moment when voice can disappear — *if* you treat translation as word-substitution.

The discipline: translate the *intent and rhythm* of each phrase, not the words.

## Two-pass approach

### Pass 1 — Map the voice

Before touching the HTML, write a small markdown file capturing strategic decisions:

```
# Spanish translation strategy

## Voice rules
- tú (familiar — matches the lecturer's warmth, not usted)
- Iberian-leaning vocabulary that travels well to LatAm
- Aphorisms short and rhythmic — translate the *meaning* not the *words*
- Hand-lettered marginalia keep their playfulness

## Principle title translations (locked-in)
1. "You can only work for people you LIKE"
   → "Sólo puedes trabajar con gente que te CAIGA bien"
   (caer bien = to be liked, the genuine warm idiom — "amar/querer" is too much)

2. "If you have a choice, NEVER have a job"
   → "Si puedes elegir, NUNCA tengas un empleo"
   (empleo > trabajo here — "empleo" is the salaried-job sense)
```

Lock in the canonical translation for every titled phrase, every key aphorism, every UI string with personality. This becomes the source-of-truth that protects against drift while you edit.

### Pass 2 — Apply mechanically

With the strategy doc as your reference, do a top-down pass through the HTML. The order:

1. `<html lang="...">` attribute, `<title>`, meta description
2. Top nav links
3. Hero copy (heading, kicker, lede, stats labels)
4. SVG `<text>` elements *inside* the hero artifact (marginalia, monogram)
5. Section eyebrows ("§ One · ...", "§ Two · ...", etc.)
6. For each section: heading, lede, body copy, blockquotes
7. SVG `<text>` elements inside icons (one per icon — "free", "great", "just enough", "tend it daily", etc.)
8. Interactive control labels (slider labels, button text, status text)
9. JS-driven dynamic strings (verdict logic, affirmation arrays, status labels)
10. Footer columns, footer-bottom strings
11. All `aria-label` attributes for accessibility

## What NOT to translate

- Proper nouns (Picasso, Edelman, Murdoch, AIGA, Ageing Gracefully)
- Technical/established terms ("MIT", "CEO" — stay in English in most contexts)
- Brand names and product names
- The original quote in its original language *if* the original language carries the work
- Code, IDs, class names, data attributes

## Idiom translation patterns

The hardest part. Some examples:

| English (literal) | Wrong Spanish (literal) | Right Spanish (idiomatic) |
|---|---|---|
| Work for people you LIKE | trabajar con personas que te GUSTEN | trabajar con gente que te CAIGA bien |
| Just enough is more | Sólo suficiente es más | Lo justo es más |
| Style is a costume | El estilo es un traje | El estilo es un disfraz |
| Tend it daily | Atiéndelo diariamente | Cuídalo cada día |
| It doesn't matter | No es importante | No importa |
| You serve | Tú sirves | Estás sirviendo |
| Where do you stand? | ¿Dónde paras? | ¿Dónde te ubicas? |
| Move the weights | Mover los pesos | Mueve las cargas |

Notice the right column always reaches for the natural phrase a native speaker would actually use, even when it strays from the literal English.

## Quoted material in another language

Iris Murdoch's "Love is the extremely difficult realization that something other than oneself is real" has a standard Spanish rendering: *"El amor es la dificilísima comprensión de que algo distinto a uno mismo es real."*

When localizing a dashboard that quotes a third-party author, **research whether a canonical translation exists first**. Reach for that. Don't invent your own.

For Murdoch in Spanish, "dificilísima" carries her emphatic "extremely difficult" in one elegant superlative — a literal "extremadamente difícil" loses the rhythm.

## Translating dynamic UI text (the hardest case)

The triad's live verdict updates as the user drags sliders. The verdict strings live in JS:

```js
if (max >= 70) {
  if (vc === max)      { label = 'all client';   body = 'You serve. Be careful what you serve.'; }
  else if (va === max) { label = 'all audience'; body = 'You become a propagandist.'; }
  else                 { label = 'all you';      body = 'You make art, not design.'; }
}
```

Spanish version:

```js
if (max >= 70) {
  if (vc === max)      { label = 'sólo el cliente';  body = 'Estás sirviendo. Cuidado con lo que sirves — y a quién.'; }
  else if (va === max) { label = 'sólo el público';  body = 'Te conviertes en propagandista.'; }
  else                 { label = 'sólo tú';          body = 'Haces arte, no diseño. Hermoso — pero ¿es éste el trabajo?'; }
}
```

Watch for cases where the JS *concatenates* strings — these are landmines. English:

```js
var leader = (vc === max ? 'client' : va === max ? 'audience' : 'self');
label = 'tilted toward ' + leader;
```

Spanish needs gendered articles, so the leader strings include them:

```js
var leader = (vc === max ? 'el cliente' : va === max ? 'el público' : 'ti mismo');
label = 'inclinado hacia ' + leader;
```

Same for the "ignored" variable in the missing-party verdict.

## Validation after localization

Run a sweep for English fragments that slipped through:

```python
import re
with open('output-es.html') as f: s = f.read()
visible = re.sub(r'<!--.*?-->', '', s, flags=re.DOTALL)
visible = re.sub(r'<style>.*?</style>', '', visible, flags=re.DOTALL)
text_only = re.sub(r'<[^>]+>', ' ', visible)

# Phrases that MUST not appear in any user-visible text
suspects = ['You serve', 'You become', 'tilted', 'someone', 'just enough',
            'tend it daily', 'where do you stand', 'free', 'a costume',
            'reset', 'draw here', 'blank page', 'AUDIENCE',
            'Sources', 'Read', 'Built with']

for needle in suspects:
    if needle in text_only:
        idx = text_only.find(needle)
        ctx = text_only[max(0,idx-50):idx+len(needle)+50]
        print(f"  '{needle}' →  ...{ctx.strip()[:140]}...")
```

False positives to expect:
- `balanced` as an internal JS variable name (not user-visible) — ok
- `Fritz Perls` as a proper noun reference — ok
- `CLIENT` is a substring of `CLIENTE` — ok

Real positives to fix immediately.

## Quality bar

A great localization should produce a dashboard where a native speaker can't tell it was translated from English. They should feel like the subject was speaking *their* language all along.

If a phrase reads as "translated" — stiff, slightly off, missing the warmth — go back and find the natural idiom. The strategy doc you wrote in Pass 1 is your defense against translation drift.
