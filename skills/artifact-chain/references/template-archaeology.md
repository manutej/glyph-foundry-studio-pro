# Template archaeology

A client template is not a starting aesthetic. It is a design system someone
already paid for, and it is usually hiding.

## The inversion

The commonest complaint about a client template is "there's nothing in here —
just a few slides of rules." That is almost always wrong. In a PowerPoint file:

- **The visible slides** carry guidelines, an icon sheet, and a cover.
- **The slide master** carries the actual design system: every layout, every
  brand shape, every licensed photograph, cropped and positioned.

One real case: eight visible slides, **sixty-five master layouts** — nine
branded title slides with licensed photography, card grids at three, four and
five columns, split-column comparison layouts, full-bleed section slides.
Nothing needed designing. It needed finding.

The same inversion holds for `.docx` (styles and numbering live in `styles.xml`,
not in the visible text) and `.xlsx` (named styles, number formats and theme
colors outlive any sheet).

## Procedure

**1. Inventory the layouts.** Run `scripts/layout_catalog.py`. It adds one slide
per master layout, labels every placeholder with its index and type, and renders
the result. You get a visual map and — more useful — a way for the client to
choose layouts by number instead of describing them in prose.

**2. Extract the theme.** Pull the color scheme, font scheme and slide
dimensions from `ppt/theme/theme1.xml`. Use these; never approximate brand
colors by eye.

**3. Recover the assets BEFORE deleting anything.** Icon sheets and image
libraries are frequently on slides that say "delete this slide after following
these guidelines." Deleting them destroys the only copy. Run
`scripts/extract_assets.py` first.

Brand icons are often SVG-only, embedded via the `svgBlip` extension with no
raster fallback, so `python-pptx` cannot place them directly. Rasterize at
300dpi (sharp, cairosvg, or rsvg-convert) and **look at the result** — a silent
rasterizer failure yields blank squares that no automated check notices.

**4. Read the guideline slides as a specification.** They contain the rules you
compile into a gate at the next stage. Capture verbatim: minimum font sizes,
forbidden terms, font names and fallbacks, footer and page-number requirements,
accessibility obligations.

**5. Strip to a clean base.** Remove the guideline slides from the presentation
part, then repair the package (the pptx skill's `clean.py`), so the master and
its layouts survive intact. Keep the full master — trimming unused layouts is a
one-click step at the very end, and until then the client can keep building on it.

## Placeholder geometry

Before composing anything, dump each candidate layout's placeholders with index,
type and position in inches. Composition then targets real coordinates instead
of guesses.

## The trap that costs a debugging cycle

In `python-pptx`, setting `.top` or `.height` on a placeholder that *inherits*
its position writes an incomplete transform — `x=0, cx=0`. The shape becomes
zero-width and its text is present in the file but invisible on screen.

Whenever you move an inherited placeholder, restate **all four** values, reading
left and width from the layout:

```python
def move(slide_ph, layout, idx, top, height):
    src = next(p for p in layout.placeholders
               if p.placeholder_format.idx == idx)
    slide_ph.left, slide_ph.width = src.left, src.width
    slide_ph.top, slide_ph.height = Inches(top), Inches(height)
```

Add a zero-size-shape invariant to the gate regardless. This defect class is
invisible to text extraction and to file validation, and it is the reason the
QA ladder exists.
