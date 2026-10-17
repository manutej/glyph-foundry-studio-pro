# Meta-prompt — the "transcendental maker" category
Reusable generator for makers in this family (Geome Maker, Orphic Maker, future instruments). Example-agnostic: fill slots, follow procedure.

## Typed slots
- Corpus: source-teaching { myth: text, doctrine: text, intent: text }   — e.g. Orpheus myth + Transcendental Realism essay
- Vocabulary: list[Primitive]   — minimal forms; each must be primary or derived-from-primary
- Algebra: { combinators: list[Op(arity, params)], laws: list[Law] }   — composition operators + conservation laws
- Palette: { strings: list[Color] (5-9), grounds: {deep, bright}, chord: Color x Color -> Color CLOSED over strings }
- Discipline: list[Constraint]   — e.g. aperspectival (no vanishing point), aniconic (no representation), flat fields, single ground
- SymbolSpace: list[{ name, tradition, meaning: 1 line, recipe: Term }]
- Surface: { views: list[View], controls: list[Control -> engine input], exports: list[Format] }
- OutputContract: { work: deterministic fn(inputs) -> Term -> shapes, term: printable, checks: list[Law -> pass/fail] rendered in UI }

## Procedure
1. Read Corpus; extract structural equivalences (myth object -> engine object). Record the mapping table; it is part of the product.
2. Fix Vocabulary to the smallest set that spans SymbolSpace. Reject any symbol needing a new primitive; recompose instead.
3. Define Algebra as pure functions over immutable terms; every combinator must state arity and what it conserves.
4. Derive Palette.chord from the strings themselves (perceptual midpoint snapped to nearest string, parents penalized) — never hand-pick per pair; the rule must survive palette swaps.
5. Build Surface so every law is VISIBLE (checks on canvas, chord table as proof), every work reproducible (seed shown), every term printable.
6. Verify against 2-3 sibling instances of the category (a different myth, a different palette) before shipping.

## Laws (category invariants)
- palette.closed: rendered colors are strings-or-ground, always.
- geometry.primary: shapes reduce to circle / rectangle / triangle.
- term.printable: render(term) and print(term) never disagree.
- ground.single: one ground per work.
