# Atomization and gated execution

## What an atom is

One atom = one decision. The test: if describing it needs the word "and", split
it. "Add a slide and set its title" is two atoms. "Write this string into
placeholder 22" is one.

For a slide deck the atom vocabulary is roughly:

```
NEW_DECK · ADD_SLIDE · SET_TITLE · SET_KICKER · ADD_BULLET · ADD_LINE
SET_HEAD · ADD_ITEM · ADD_ICON · SET_NOTES · ADD_FOOTER · SAVE_DECK
```

A 53-slide deck set atomized to **627 micro-steps** at this granularity — a
useful calibration. For reports substitute `ADD_HEADING`, `ADD_PARA`,
`ADD_TABLE_ROW`, `ADD_FIGURE`, `SET_CAPTION`.

Granularity is a real choice. Too coarse and a failure takes the whole section
with it; too fine and the ledger costs more than the work. One decision per atom
is the line that keeps failures local without drowning in bookkeeping.

## Typed ports

Give every atom an input colour and an output colour, and check the chain before
executing anything:

```python
PORTS = {"ADD_SLIDE": ("State", "State"),
         "NEW_DECK":  ("Spec",  "State"), ...}
```

The check is mechanical: each atom's input colour must match the upstream
atom's output colour for the same target. Shape errors surface here, before any
spend, where they cost nothing.

Keep the colour set closed. If something does not fit an existing colour, split
it rather than adding an `other` — `other` turns a type system into a bag of
labels.

## Two phases, kept separate

- **Phase A — build the term.** Atomize and type-check. No execution, no model
  calls, no file writes. Errors caught here are free.
- **Phase B — evaluate.** Apply atoms to live state, in batches, under gates.

The separation matters because Phase A failures are cheap and Phase B failures
are not. Anything that can be decided in A should be.

## Red flags

Check each atom before applying it: malformed (missing or wrong-typed
arguments), overlong (past the token cap), type-error (references an asset that
does not exist).

**Discard and re-derive — never repair.** Repairing a malformed step launders a
defect into the artifact, where it becomes indistinguishable from an intended
decision.

Cap retries (`R_max`). A step that keeps failing is signalling a systematic
problem, not bad luck, and more attempts will not fix it.

## Execution and checkpoints

Batch the atoms — 50 is a reasonable default. After each batch:

1. **Snapshot** the state (save the artifact, hash it).
2. **Then** append the ledger row naming that snapshot.

That order is load-bearing. With it, a crash in the write window costs nothing
regardless of how naive the resume logic is: the ledger simply does not mention
the orphan snapshot, and the batch re-executes. Inverted, the ledger names a
state nobody wrote, and a resume that trusts it continues from a gap — silently,
with no error anywhere.

The ledger is append-only and binding: no batch proceeds past an unrecorded or
failing gate verdict.

## Snapshot sufficiency

A snapshot must be enough to resume from. Capturing the work product but not the
worker's **cursor** — which section is current, which layout it uses, which
fields already hold content — produces a checkpoint you cannot restart from. The
ledger's atom count says *where* to restart; nothing says *what the worker's
local state was*.

Two valid fixes: snapshot the cursor alongside the artifact, or reconstruct it
from the artifact on resume (last section, its layout, which placeholders are
non-empty). The second is better — it keeps the artifact the single source of
truth.

Verify the snapshot's hash before trusting it. On mismatch, fall back one
checkpoint.

**Test this by killing the run on purpose.** A resume path that has never been
exercised does not work. This is not a figure of speech: the first implementation
of the above crashed on resume, and only a deliberate kill revealed it.

## Gates

Recompute invariants every N batches (2 is a good default — it halves detection
latency versus 4, and cheap invariants make the extra gates nearly free).

Good invariants are cheap, need no oracle, and are recomputable from state
alone: element counts, zero-size shapes, sub-minimum font sizes, missing alt
text, forbidden terms. Measured result: a three-line zero-size-shape check
halted a 627-atom run at atom 100 — versus a human catching the same defect
only after the full build plus a render pass.

Bind the verdict. A gate whose HALT can be ignored is a log line.

## The consistency check worth running

After a full chain run, compare the chain-built artifact against the same goal
built in one step, under a **declared** equivalence. Declare it explicitly:
"same element count; same ordered sequence of (kind, geometry to 1/1000",
text, explicit size) tuples; same notes." Byte-equality is not the equivalence —
archive timestamps differ by construction and carry no meaning.

Agreement means decomposition did not change what the build produces. It is
also the only honest way to verify a resume: a killed-and-resumed run that still
matches proves the resume behaved as an identity, rather than merely not
crashing.
