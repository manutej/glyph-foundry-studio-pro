# Orpheum — the style

What the plates are, and the rules that make one read as ours. Low-data companion to `Orpheum Atlas.dc.html`. Vocabulary follows `ORPHIC-META-SPEC.md` and `ORPHIC-LEXICON.md`.

## In one paragraph

A plate is a flat field of primary forms — circle, square, triangle — in flat colour from a closed palette, arranged by composition rules rather than by hand placement. Nothing is shaded, nothing is a picture of something, and no single form is the subject. Where forms overlap, the palette decides the colour, not the painter. Depth, when it appears, is stacked flat colour, never a rendered light.

## The five commitments

1. **Primary forms only.** Every mark on the plate is one of three atoms or something derived from them by a named operation (harmonic replication, echo, Fourier recut, binding, split). A traced drawing enters as polygons and is then treated as atoms.
2. **Flat colour from a closed palette.** Five or six swatches, one ground, one ink. No gradients, no washes, no tints except the declared *veil* mode. Overlaps re-cut to a palette member (`glue(a,b) = (a+b+1) mod m`), so no colour outside the ramp can appear. We call this *palette closure*.
3. **Composition is structural.** Forms are placed by ratio — the integer series 1, ½, ⅓…; the golden angle 137.5°; a binding law that is not associative. A composition is a tree; it is edited by editing the tree, not the forms.
4. **Aperspectival, anegoic, aniconic.** No vanishing point, no privileged viewer; no author's gesture as subject; no icon, figure or scene. These three words come from the source artist's own account of his image-art and we hold to them literally.
5. **Fabrication is monumental.** The plate is vector first and prints at 300–900 dpi; the default is 900 dpi at 8 in on the long side. Six formats: square, portrait 1:√2, card 7:12, wide 16:10, exhibition 16:9 and 21:9.

## Grounds

- **Dark ground** (`Orpheum`, `Noir · line`, `Hermetic`, `Wada · Night Green`): the plate is a night field; the lightest swatch is rank 0 and reads as the ink.
- **Paper ground** (`Spectra · paper`, `Sumi · seal`, the Wada set): the plate is a sheet; the darkest swatch is rank 0.
- Rank 0 is always the colour nearest the ink — the structural colour. Use it for the form that carries the composition.

## Forms and what they mean (opt-in, never applied automatically)

| Atom | Orphic reading | Default use |
|---|---|---|
| Circle | the Point of Origin, extended | the carrying form; receives the harmonic series |
| Square | the Ground — four directions held | the frame or the anchor; takes depth well |
| Triangle | the Ascent — three as one | the directional form; echoes well |

Derived forms keep the reading of their source: a harmonic row of circles is still "origin, sounding at every division."

## Colour

- **Rank, not colour.** A form carries an index into the ramp. Change the palette and the whole plate re-colours lawfully.
- **Glue on overlap.** Solid over solid: the intersection is re-cut as `(a+b+1) mod m`. Symmetric, so draw order does not matter.
- **Veil.** A form may be declared a veil: opacity α (default 0.55) with `multiply`, `screen` or `normal`. Veils sit above every solid, are never re-cut, and are the one place a blended colour is allowed. Use them for a detail layer over a primary body (the *Fourier split* does exactly this).
- **Depth shade.** Shadows are translucent ink (multiply) or ground, or — to stay strictly palette-closed — a rank-stepped solid extrusion.

## Composition rules of thumb

- One carrying form, one or two counter-forms, then series. If a plate has more than three *kinds* of gesture it is usually two plates.
- Series should be audible: 1, ½, ⅓ reads as an overtone row; 1/φ^k reads as a spiral descent. Don't mix laws inside one unit.
- Let overlaps happen. The glued third colour is where the plate becomes a field rather than a collection of objects.
- Echo *about plate* to make the plate itself the centre; echo *about self* to make the form its own centre.
- When a unit stops reading, flatten it, look, then ungroup and re-bind. The tree is a sketch, not a contract.

## Anti-patterns

- Gradients of any kind on a fill. Shaded "3-D" depth. Drop shadows softer than ~0.45× their distance.
- Figures, faces, horizons, text as image.
- More than one palette per plate. Swatches picked outside the ramp.
- Forms placed by eye to "balance" — place by ratio, then move the unit as a whole.
- Emoji or glyph ornament anywhere.

## Checks before export

- No colour on the plate outside ramp ∪ {ground, ink} (the status line's glue count should match what you see; "glue cap reached" means raise the cap on export).
- Every form belongs to a unit, or is deliberately alone.
- Spectrum slope β between ~1.0 and ~1.6 for most plates; lower is noisy, higher is empty. Measure in the k-space drawer.
- Long side ≥ 7200 px at the chosen format; dpi reported in the status line.
