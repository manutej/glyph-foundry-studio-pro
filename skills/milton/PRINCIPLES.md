# Milton — Principles

The philosophical contract. **This file is brand-agnostic.** Every Milton output, regardless of which preset or fork it uses, must honour these principles. They are the part of the skill that does not vary.

The full source notes — including original quotes and attribution — live at `~/Documents/CETI/DESIGN/research/glaser-notes.md`.

---

## I. The Ten Things (London AIGA, 2001)

Each principle has a **canonical accent** in the default CETI preset. **In a fork, the accent that carries each principle changes** — but the principle itself does not.

### 1. You can only work for people you like
> Affection is the most reliable predictor of work you'll be proud of. Project briefs filter through this lens first.

### 2. If you have a choice, never have a job
> A job sells time. Practice asks your own questions. Design as if you own the question.

### 3. Some people are toxic — avoid them
> Not the rude. The ones who, after time spent in their company, leave you smaller. Cut the cord.

### 4. Professionalism is not enough
> The good is the enemy of the great. Competence is a moving floor, not a ceiling.

### 5. Less is not necessarily more
> "Just enough is more." Refuse the Mies-minimalism reflex. The right amount is whatever the work requires.

### 6. Style is not to be trusted
> Style is the residue of habit. Habit is the enemy of attention. **This principle protects this skill from itself: the CETI preset is not the contract; the way of working is.**

### 7. How you live changes your brain
> Drawing daily restructures perception. The portfolio is a brain scan.

### 8. Doubt is better than certainty
> "Certainty is a closing of the mind. To create the new, requires doubt." Hold the question open.

### 9. On aging
> The body declines. Attention, properly cultivated, does not.

### 10. Tell the truth
> The hinge. The bridge to the Road to Hell.

---

## II. The Road to Hell (Metropolis, 2002)

Twelve ethical scenarios, ordered by Glaser's discomfort. The premise: in Hell, the damned are unaware. In Purgatory, they know.

> **Awareness is the difference.**

The list is in PRINCIPLES because every Milton output should be auditable against it. When the brief is for a corporate client, ask: which step are we on? When you draw a logo, ask: am I making a thing more honest, or less?

The full 12 are catalogued in the dashboard at `DESIGN/index.html` (search "ROAD = ["). Re-read whenever a brief makes you uneasy.

---

## III. Ambiguity & Truth

The third foundational essay.

> *"The most useful thing about ambiguity is that it engages the viewer. The brain wants to resolve. Give it work to do."*

**Apply ambiguity through:**
- **Rebus** — substitute a glyph for a word (I♥NY)
- **Figure-ground** — one image, two readings (goblet/two faces)
- **Double-reading** — sentence breaks at one word, gives a second meaning
- **Substitution** — letter becomes object, object becomes letter
- **Negative space** — the form is in what isn't drawn

Reserve ambiguity for moments of weight. A button label is not ambiguous. A hero can be.

---

## IV. The Three Responses

> *"There are three possible responses to a piece of design — yes, no, and WOW! Wow is the one to aim for."*

**Yes** is acceptable, forgettable, the response that lets the designer off easy.

**No** at least sends you back to work. A no contains an argument you can answer.

**Wow** is the one that justifies the practice. **Rare on purpose** — if every project lands here, the bar has slipped.

Treat "wow" as a budget. Spend it where the brief, the client, and the moment line up.

---

## V. Translation rules — Glaser → web

What "Glaser-style" actually means in modern web work, **independent of which brand is being designed for**:

| Glaser principle              | Web implementation                                                                   |
|-------------------------------|--------------------------------------------------------------------------------------|
| Just enough is more           | Every gradient, animation, hover state earns its place.                              |
| Doubt > certainty             | UIs that show their seams. Visible state, undo affordance, "draft" textures.         |
| Tell the truth                | Honest data viz. No misleading axes. No dark-pattern toggles. No fake urgency.       |
| Style is not to be trusted    | The palette is a fork-able preset, not a fixed look. The contract is the philosophy. |
| Drawing is thinking           | SVG icons drawn for the specific concept, not pulled from an icon set.               |
| Wow is the response to aim for| Each landing page has one moment that stops the user. Not five — one.                |
| Ambiguity engages             | Rebus, substitution, double-reading. Reserve for moments of weight.                  |
| How you live changes brain    | Practice rule: ship something every week. Portfolio is a brain scan.                 |
| Affection is the predictor    | Only take work for clients you'd want to learn from.                                 |
| Awareness is the difference   | Document every ethical decision. Future-you needs to know why past-you said yes.     |

These translations are **fork-stable** — the column on the right doesn't change when you change the brand colours.

---

## VI. What Glaser refused

Equally important: the moves the skill **does not make**, even when fashionable. **These hold for every fork.**

- **No glassmorphism.** The form should reveal, not obscure.
- **No purple-to-pink hero gradients.** The 2018–2024 SaaS uniform.
- **No emoji-as-icon.** Emoji is platform-rendered third-party art.
- **No stock isometric illustrations.** They flatter without saying anything.
- **No generic "feature card" grids** with a tiny icon, a 3-word headline, and a 12-word blurb.
- **No mid-grey-on-white SaaS body text.** Use `--ink-soft`, not `#666`.

When in doubt: would Glaser keep this in the Push Pin studio? If no, revise.

---

## VII. The replicability principle (the skill's own meta-rule)

This skill encodes Glaser's philosophy. The CETI palette and the Bricolage type stack are **how that philosophy was first applied**. They are not the philosophy itself. A new brand applying Milton will have different colours and possibly different type — and will still be a Milton output **if and only if** every principle in this file is honoured.

The agent (`agents/milton.md`) audits against the principles, not the palette. Forks pass the audit by being philosophically consistent, not by matching CETI's hex codes.
