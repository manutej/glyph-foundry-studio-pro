# Compiling guidelines into a gate

A rule that lives only in prose gets followed on slide 3 and forgotten on slide
47. Compile every mechanically checkable rule into an evaluator that runs on
every build.

## What to extract

Read the template's guideline slides and the brand/accessibility documents they
reference, and sort each rule into:

| Class | Example | Treatment |
|---|---|---|
| Mechanically checkable | "body text 18pt or larger" | code it — non-negotiable gate |
| Checkable with a list | "never use the term X" | code it as a regex over all text |
| Structural | "footers and page numbers on every slide" | code it as a per-element presence check |
| Visual judgment | "keep slides uncluttered" | QA ladder rung 5, human eye |
| Subjective | "sound confident" | not a gate; note it in review |

## Rules that recur across clients

Worth checking for even when not stated:

- **Minimum font size** — usually the accessibility rule, and the one that
  actually constrains design. It makes dense bullet slides impossible, which
  improves content. Note the exemption: footers and page numbers may be smaller.
  Find the template's own footer size and use it as the floor rather than
  inventing one.
- **Forbidden terms** — corporate coupling policies, legacy brand names,
  competitor names, regulated claims. Regex over every run of text on every
  slide, including notes.
- **Placeholder leakage** — "Click to edit Master title", lorem ipsum, `TODO`,
  `[insert]`, `XXX`. Ships more often than anyone admits.
- **Alt text** on every non-text element.
- **Zero-size shapes** — see template-archaeology's trap. Three lines, catches
  disasters.
- **Margin and bleed** — but calibrate against the template's own chrome, which
  often sits flush to the edge by design.
- **Speaker notes present** — warn, do not fail.

## Resolving inherited values

A run with no explicit size inherits from the layout, then the master. An
evaluator that reads only explicit sizes reports "unresolved" on exactly the
elements most likely to be wrong. Walk the inheritance chain: run → layout
placeholder of the same index → master text style. Report unresolved as a
warning, never silently pass it.

## Calibrate thresholds against the template, not against taste

The first version of a gate usually encodes the author's assumptions rather than
the client's rules. Two real examples: a footer floor invented at 12pt when the
template's own footers were 8pt, and a margin check at 12.95" that flagged the
template's own flush-right slide numbers.

When the gate flags the template itself, the gate is wrong. Read the master,
take the real value, and re-run.

## Declared deviations

Sometimes the right call is to deviate — using 10pt footers where the template
uses 8pt, for legibility. That is fine, **if declared** in the review document.
An undeclared deviation is indistinguishable from a defect.

## Fail versus warn

Fail on anything that would embarrass the client: forbidden terms, sub-minimum
text, invisible shapes, placeholder leakage, missing alt text. Warn on anything
stylistic or unresolvable. A gate that fails on warnings gets disabled, and a
disabled gate catches nothing.

## Worked calibration

`scripts/evaluate.py` shipped with empty `chrome_markers` reports 11 failures on
a deck that is in fact clean — every footer trips the 18pt floor because nothing
told the gate which text is chrome:

```
x s2: 10pt < 18pt — 'IT Development Summit 2026  |  Turning S...'
```

Supplying the engagement's rules resolves it:

```json
{"chrome_markers": ["Summit 2026"], "forbidden": ["\\bblue\\b", "\\bbcbs"]}
```

→ `FAIL 0` across all five decks. Keep the rules file beside the build; it is the
engagement's contract in machine-readable form, and the first place to look when
a gate fires on something that is plainly fine.
