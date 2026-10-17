# Orpheum — inspiration and sources

Where the style comes from, and what we took from each source. Stated plainly so the debt is visible. Nothing here is a claim about the sources' intentions beyond what they published.

## Adi Da Samraj — Transcendental Realism and the Orpheus series

Adi Da Samraj (1939–2008) made image-art intensively from about 2006 until his death. He named the approach **Transcendental Realism**, published under that title in 2010, and described its working principles as **Geome** (primary geometric form, replicated and composed) and **Linead** (the free hand-drawn line as the balancing pole). The late suites — *The Orpheus Series* and *The Linead Series* among them — are large, flat, hard-edged compositions of circles, squares and triangles in bold flat colour, fabricated at monumental scale.

His own words for what the images are: **aperspectival** (no single viewpoint), **anegoic** (not an expression of the artist's ego), **aniconic** (not a picture of anything). He called the viewer's engagement a condition one enters rather than a scene one looks at.

**What we took:** the atom set; flat relational colour; the refusal of figure, gesture-as-subject and perspective; the idea that the image is a *field* and not an arrangement of objects; the archival print contract. **What we did not take:** any of his images or compositions. Orpheum generates its own plates from rules; it does not reproduce his.

## Sanzo Wada — A Dictionary of Color Combinations

Sanzo Wada (1883–1967) published *Haishoku Sōkan* in the 1930s; the modern Seigensha edition collects 348 two-, three- and four-colour combinations. The palette drawer lists all of them under "Wada · two / three / four+", plus eleven Wada-derived six-swatch ramps in the Linead set.

**What we took:** the discipline of a *closed* combination — pick a set, use only the set — and the tonal temperament of the ramps (muted, matte, period). **What we changed:** every combination is given a ground and an ink and sorted by lightness so rank 0 is always nearest the ink.

## Harmonic and Fourier series

The overtone row (amplitudes 1, ½, ⅓, …) and the Fourier series are the same idea in two registers: a whole is the sum of integer partials. The **Harmonic** operator replicates a form at every integer division of its size; the **Fourier recut** takes a form's outline as a periodic signal, keeps K terms, and resynthesises. Few terms turn a square into a disc with a memory of corners — this is how a traced likeness becomes a primary.

Ladders of kept terms: all integers; odd only (the square-wave ladder); Fibonacci 1·2·3·5·8; and the φ ladder 1·2·4·7·11·18 (Lucas-adjacent, never closing on itself).

## The golden angle

137.507…° = 360°/φ². Successive **echoes** of a form turned by the golden angle never line up, which is why the sequence packs evenly (as seeds do). Scale per echo is 1/φ. The plate's own centre or the form's own centroid can be the axis.

## k-space

The 2-D Fourier transform of the whole plate. Its radially averaged power falls as 1/f^β; β is a texture number (≈1 rough, ≈2 smooth) and D = (8−β)/2 is the corresponding fractal dimension of a surface. We measure it to keep plates in a legible band, and we use it as an *operator*: rasterise a unit, filter its spectrum (slope, sector combs, φ-rings, echoes), trace the result back to vectors. Geometry that has passed through its own spectrum. Shared engine: `kspace-engine.js` (also drives *K-Space Lab*).

## Operads, sheaves, associahedra

Three pieces of mathematics chosen because they *describe what the plates already do*, not for decoration.

- **Operad.** An operation of arity n takes n units and returns one; plugging outputs into inputs is composition. A composition tree *is* an operad word; evaluating it is the algebra. This is why editing a leaf re-derives every ancestor.
- **Double operad.** Colour is a second operad acting on ranks, paired with every geometric operation (the k-th harmonic shifts rank by k, each echo by one). Geometry and colour move together but are not the same thing.
- **Sheaf.** Colour is a *section over the plate*: the colour at a point is a function of what is stacked there, and the glue rule is symmetric, so there is never a disagreement to resolve. (Honest note: gluing is pairwise today; triple overlaps are on the ledger.)
- **Associahedron K_n.** Bind n forms two at a time with a non-associative law and the bracketings become points; one re-association is an edge. K₄ is a pentagon, K₅ a 14-vertex solid (Catalan numbers 1, 2, 5, 14, 42). A single plate is one vertex; the suite is the whole polytope. Walking an edge gives a straight-line path of valid plates.

References: May, *The Geometry of Iterated Loop Spaces* (1972); Stasheff, "Homotopy associativity of H-spaces" (1963); Loday, "Realization of the Stasheff polytope" (2004); Tamari lattice.

## Lineage inside this project

`Linead Studio` → image to bands to vector plates with a linead web · `Geome Maker` → dihedral constructions from ring-pieces · `Orphic Maker` → symbol recipes · `K-Space Lab` → spectral analysis and painting · **`Orpheum`** → the compositional algebra over all of it. Earlier documents: `GEOME-V2-FEATURE-LEDGER.md`, `ORPHIC-META-SPEC.md`, `ORPHIC-LEXICON.md`.
