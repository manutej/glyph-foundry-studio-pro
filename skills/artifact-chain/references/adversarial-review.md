# Adversarial review

Review each pipeline stage separately. A flawless artifact built on a
misunderstood brief is still wrong, and no amount of downstream polish detects
that.

## Stages

Review in order, and record findings per stage at P1/P2/P3 severity.

**1. Brief.** What is the actual source of truth? If scope was inferred from
meeting invites, email subjects, or a conversation rather than a brief, that is
a P1 finding even when everything downstream is clean — every element inherits
the inference. Name the ambiguities that a client can resolve in one reply.

**2. Structure.** Does the spine serve the audience and the format? Check for
overlap between sections, missing components the format implies (exercises,
appendices, sources), and sections that are least differentiated and therefore
most replaceable.

**3. Content.** Evidence discipline: no invented statistics; numbers only inside
labelled worked examples; every claim needing a subject-matter expert carries a
`VERIFY` tag that survives into the deliverable's notes. Check for fragments,
tonal drift, and claims stated with more confidence than their basis.

**4. Presentation.** Template adherence (mechanical), then visual QA. Record
every defect found and its cause, because the causes are reusable: the same
defect class will recur on the next build.

## Output format

A review document that states:

- **Verdict** — ship / ship with conditions / rework, and the conditions
- **Gate table** — each mechanical check and its result
- **Per-stage findings** — P1/P2/P3 with rationale
- **Defects found and fixed** — with cause, so the fix generalizes
- **Declared deviations** from the template
- **VERIFY items** needing a subject-matter expert before delivery
- **What the evaluator cannot judge** — state this explicitly

## The finding that outranks the gate

Report severity by consequence, not by which stage found it. A build with zero
mechanical failures and an unconfirmed brief has one P1 finding and it is at the
top of the pipeline. Saying "zero failures" without that caveat is the
misleading version of a true statement.

## Useful adversarial questions

- What did I infer that nobody told me?
- Which number here would I be unable to defend if challenged?
- Which section would a subject-matter expert recognize as generic?
- Which check passed for the wrong reason?
- If this were wrong, which check would have caught it — and did that check run?
