# The QA ladder

Five rungs. Each catches a class the rung below cannot see. The blind spots
below are measured from real builds, not assumed — every one of them shipped a
defect past a passing check.

## Rung 1 — Text extraction

`markitdown file.pptx`, or equivalent. Confirms content is present and lets you
grep for forbidden terms and placeholder leakage.

**Blind spot: visibility.** Text can be present in the file and invisible on
screen — zero-width shapes, white-on-white, off-canvas placement. Measured: 24
slides with invisible text passed this rung with all content correctly
extracted.

## Rung 2 — File integrity

The pptx skill's `validate.py --original template.pptx`. Confirms the package is
well formed and the template's parts survived.

**Blind spot: everything about layout.** Validity says the file opens, not that
it is right. The same 24 blank slides passed.

## Rung 3 — Structural invariants

Your compiled gate (`scripts/evaluate.py`). Font sizes with inheritance
resolved, forbidden terms, alt text, zero-size shapes, margins, notes.

**Blind spot: anything requiring the reader's eye.** It cannot see that a bullet
reads as a sentence fragment, that a title breaks mid-word, or that a slide is
visually empty below the fold.

This is the cheapest rung that catches real disasters, which is why it belongs
in the execution gates rather than only at the end.

## Rung 4 — Thumbnail render

Convert to PDF, rasterize, tile into contact sheets, and look. Catches gross
layout failure fast across many pages: invisible text, overlap, overflow,
catastrophic imbalance.

**Blind spot: anything small.** Measured: a contact sheet passed 22 bullets that
read as fragments ("What it is for" / "and explicitly not for") and a title that
broke mid-word as "Cybersecurit / y Trends". Both were obvious at full
resolution and invisible at thumbnail scale.

## Rung 5 — Full-resolution render

Render individual pages at full size and inspect. Non-negotiable for at least a
sample: every distinct layout type, the first and last page, and anything the
gate warned about.

**Blind spot: whether the content is right.** No render tells you the curriculum
is wrong or the brief was misread. That is the adversarial review's job.

## How to climb

Run rungs 1–3 on every build, automatically. Run rung 4 on the whole artifact.
Run rung 5 on every distinct layout type plus a sample.

Do not stop early because the cheap rungs are green. The measured pattern is
that **the cheap rungs are blind to exactly the failures that embarrass you in
front of a client** — an artifact that passes text extraction and validation can
be one-third blank.

## The asymmetry worth internalizing

Cheap checks catch cheap failures. The expensive failures — invisible content,
broken typography, visual emptiness — are caught only by looking. Budget for
looking. When a build is "done", it is done when someone has *seen* it.
