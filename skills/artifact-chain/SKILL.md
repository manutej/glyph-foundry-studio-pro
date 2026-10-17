---
name: artifact-chain
description:Format-agnostic iterative generator for rich visual documents (PPTX, DOCX, PDF, XLSX, HTML) using a 7-stage pipeline — Deconstruct, Characterize, Atomize, Execute+Verify per atom, Global Verify, Remediate, Emit. Treats any exemplar template as a constraint system and applies atomic content mutations with structural + visual verification gates, integrating with glyph-foundry and svg-enhance for ADD_ICON and ADD_SYMSPEC_FIGURE visual atoms.
---

# Artifact Chain — Iterative Exemplar-Driven Document Compiler

Turn `{exemplar_artifact, raw_content_source}` into a finished document (`PPTX`, `DOCX`, `PDF`, `XLSX`, or `HTML`) that looks hand-authored by the exemplar's original designer. Every change is decomposed into an ordered sequence of typed **atoms** and verified after each step via a **dual-channel gate** (structural XML/DOM invariants + rendered page-image inspection).

---

## Directory Structure

- [scripts/chain.py](./scripts/chain.py) — Format-agnostic 7-stage execution harness (`extract_style_record`, `build_template_map`, `atomize`, `apply_atom`, `verify_structural`, `verify_visual`, `global_audit`).
- [scripts/emit_visual_atom.py](./scripts/emit_visual_atom.py) — Visual atom compiler bridging `artifact-chain` to [glyph-foundry](../glyph-foundry/SKILL.md) and [svg-enhance](../svg-enhance/SKILL.md). Compiles any `SymSpec` JSON (`ADD_SYMSPEC_FIGURE`) or single 2.5D/Milton icon (`ADD_ICON`) into a hex-resolved SVG (`*.resolved.svg`) and `@2x.png` plate styled from the target exemplar's palette.
- [references/stage-contracts.md](./references/stage-contracts.md) — Exact schemas for `style_record.json`, `template_map.json`, `atom_plan.json`, and `audit_report.json`.
- [references/atom-catalog.md](./references/atom-catalog.md) — Catalog of atomic mutations (`REPLACE_TEXT`, `POPULATE_TABLE`, `ADD_ICON`, `ADD_SYMSPEC_FIGURE`, `RECOLOR`, `CLONE_SECTION`, `DELETE_CONTAINER`, `REORDER`).
- [references/verification-gates.md](./references/verification-gates.md) — Structural + visual checks, remediation playbooks, and layout defect taxonomy.
- [references/format-adapters.md](./references/format-adapters.md) — Format-specific bindings (`PPTX` DrawingML, `DOCX` WordprocessingML, `PDF`, `HTML`).

---

## Workflow

1. **Stage 1 — Deconstruct**: Extract `style_record.json` and `template_map.json` from the exemplar before making any edits.
2. **Stage 2 — Characterize**: Parse the raw source into claims, metrics, and structure, mapping each to a template container ID.
3. **Stage 3 — Atomize**: Produce `atom_plan.json` ordered from destructive (`DELETE_CONTAINER`, `CLONE_SECTION`) to content-bearing (`REPLACE_TEXT`, `POPULATE_TABLE`) to decorative (`ADD_ICON`, `ADD_SYMSPEC_FIGURE`, `RECOLOR`).
4. **Stage 4 — Execute & Verify Per Atom**:
   - When executing `ADD_ICON` or `ADD_SYMSPEC_FIGURE`, invoke [scripts/emit_visual_atom.py](./scripts/emit_visual_atom.py) so all embedded figures and icons use hex-resolved (`*.resolved.svg`) or `@2x.png` plates verified by `glyph-foundry` (`H1`–`H8`).
   - Run structural + visual verification after every atom; rollback and remediate on failure.
5. **Stage 5–7 — Global Verify, Remediate & Emit**: Render all pages/slides, check cross-page rhythm and density, and emit the final artifact + `audit_report.json`.
