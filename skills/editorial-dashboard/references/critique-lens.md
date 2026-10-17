# The Critique Lens

The single most important technique in this skill. The reason most LLM-built dashboards feel generic isn't lack of effort — it's lack of a critic. There's no one in the room asking "would the subject of this dashboard be embarrassed by it?"

This document walks through how to use the subject as your critic.

## The premise

Every editorial dashboard has a *subject*: a person (Glaser, Eames, Didion), an idea (the Tao Te Ching, the Stoic disciplines), a body of work (Bauhaus, Studio Ghibli films), or a philosophy (the GTD method, internal family systems).

That subject — by virtue of being the subject — has *taste*. They have things they would *not* let into the work. Generic illustration. Trendy fonts. Symmetric grids when asymmetry would tell more truth. Reverence where they would have wanted wit.

Your job in the critique pass is to be a strict imitator of that taste, walking through your own v1 draft as if the subject were standing behind you.

## When to do the critique pass

After v1 is structurally complete (layout, copy, all sections in place, generic icons OK).
Before you put any polish on v2.

The critique pass takes ~20 minutes of writing. It saves hours of redesign.

## How to write it

Open a markdown file: `what-would-[subject]-say.md`

Write 6–12 things the subject would *dismantle* in v1. Two columns mentally:

### The "would dismantle" list

For each item, the format is:

> **The subject's voice (in quotes), naming what's wrong.**
> → Your one-line explanation of what to change.

Be ruthless and specific. The subject's voice should sound like *them*, not like a polite design critique. They should be slightly cranky. They should mention specific objects in v1.

#### Examples from the Glaser dashboard

> *"Every icon looks like the same hand made it. I told you not to trust style."*
> → Rebuild all 10 icons with deliberately different visual idioms — coffee cups, a bird breaking a frame, a chameleon, an eye with a heart for an iris. Each in its own color, each a different solution.

> *"Why is my face the hero? I wasn't the work. The ideas were the work."*
> → Remove the literal Glaser portrait. Hero becomes his iconic round glasses, alone, large, hand-drawn. The glasses become the symbol.

> *"Drawing rewires the brain. So why doesn't your reader DRAW anything?"*
> → Brain section needs a drawing canvas. Make a mark, get an affirmation. The principle is enacted, not described.

> *"The triad is the most important diagram in my ethics. You showed it as a pretty triangle."*
> → Replace the static triangle SVG with an interactive 3-axis ethics dial. Three weights, the user redistributes. Different distributions reveal different design philosophies.

> *"Vector perfection is the death of feeling. Where's the human hand?"*
> → Add Caveat hand-lettering for marginalia. Scribble underlines on key phrases. Slight wobble filter on the hero glasses. Hand-drawn fleurons between sections.

> *"Don't quote Iris Murdoch on a red billboard. Let her breathe."*
> → Refine the Murdoch finale. Less saturated. More like a printed postcard, slightly rotated, with a paper-grain texture.

### The "would keep" list

This is just as important. List 4–6 things v1 got right. The critique pass is *surgical*, not *demolition*. If v1's grid worked, don't redo the grid. Identify what to preserve.

#### Examples

> Cream-paper newsprint aesthetic ✓ — feels right for someone who came up in print
> Fraunces with the SOFT axis pushed ✓ — has the warmth Helvetica wouldn't
> The Persian-rug interactive that strips back to a solid blue rug ✓ — nailed the meaning of "less is more is wrong"
> Honest intent ✓ — the dashboard isn't trying to flatter

## Voicing different subjects

The critique voice should sound like the subject. A few examples to calibrate:

- **A craftsman like Glaser** — slightly cranky, mentions specific things, opinionated about ethics
- **A Stoic like Marcus Aurelius** — measured, asks whether the ornament serves the lesson or distracts from it
- **A modernist like Dieter Rams** — reductive, "less but better", removes anything that isn't load-bearing
- **A maximalist like David Carson** — pushes for more weirdness, more rule-breaking, more typographic risk
- **A literary subject like Joan Didion** — precision-obsessed, would dismantle any sentimental phrase

If you don't know how the subject would speak, search for one or two interviews with them and read for ten minutes before writing the critique. Their voice is their taste; their taste is your guide.

## Common patterns the critique should catch

Across many editorial dashboards, these come up repeatedly:

1. **Uniform icon style** — the subject would call this out as "trusting style over idea"
2. **The subject's portrait as hero** — usually too reverent; the *symbol* should be the hero
3. **Static where interactive would enact the idea** — does any section have an idea that the reader could DO instead of just READ?
4. **Generic centered blockquotes** — would the subject have wanted a postcard? a margin-scribble? a stamp?
5. **Sentence-case header punctuation** — Glaser used periods, italic emphasis, eyebrow slugs ("§ One"); most LLM defaults don't
6. **Vector-perfect everything** — where's the wobble? the rotation? the human hand?
7. **Reverent tone throughout** — where's the wit? the pun? the visual joke the subject would have made?
8. **Color as decoration, not content** — does each color *mean* something, or is it just paint?

If your v1 hits 4 or more of these, the critique pass will be substantial.

## Don't skip this step to "save time"

The critique pass is what makes the difference between v1 (a fine dashboard) and v2 (a dashboard the subject would have *signed*). It's the leverage point. Skipping it is how you produce another generic LLM-output that someone will look at and say "yeah, looks like AI made it."
