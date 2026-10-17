#!/usr/bin/env python3
"""Template-adherence gate for PowerPoint deliverables.

The client's guidelines, compiled into checks that run on every build. Edit
RULES for the specific engagement — the defaults below are the ones that recur.

    python evaluate.py out/*.pptx [--rules rules.json]

Exit code is non-zero on any FAIL, so this drops straight into a build pipeline.

Calibrate thresholds against the TEMPLATE, not against taste. If the gate flags
the client's own template, the gate is wrong: read the master, take the real
value, re-run. Two real misses — a footer floor invented at 12pt when the
template's own footers were 8pt, and a margin check that flagged the template's
own flush-right slide numbers.
"""
import glob, json, re, sys
from pptx import Presentation
from pptx.util import Emu

RULES = {
    "min_pt": 18.0,              # body text floor (accessibility)
    "chrome_floor_pt": 8.0,      # footers/page numbers may be smaller, not tiny
    "chrome_markers": [],        # substrings identifying footer text, e.g. ["Summit 2026"]
    "forbidden": [],             # regex strings, e.g. [r"\bblue\b", r"\bbcbs"]
    "slide_width_in": 13.333,
    "left_margin_in": 0.40,
    "require_alt_text": True,
    "require_notes": True,       # warn only
}

PLACEHOLDER = re.compile(
    r"click to edit|master (title|text)|lorem|ipsum|\bTODO\b|\[insert|\bx{3,}\b", re.I)


def effective_sizes(slide):
    """(shape_id, text, pt) per run, resolving inheritance from the layout.

    A checker that reads only explicit sizes reports 'unresolved' on exactly the
    runs most likely to be wrong, so walk the chain instead of skipping it.
    """
    out = []
    for sh in slide.shapes:
        if not sh.has_text_frame:
            continue
        inherited = None
        if sh.is_placeholder:
            idx = sh.placeholder_format.idx
            for lp in slide.slide_layout.placeholders:
                if lp.placeholder_format.idx == idx:
                    for lr in lp.text_frame.paragraphs[0].runs or []:
                        if lr.font.size:
                            inherited = lr.font.size.pt
                    if inherited is None:
                        sz = lp.text_frame.paragraphs[0].font.size
                        inherited = sz.pt if sz else None
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                out.append((sh.shape_id, r.text,
                            r.font.size.pt if r.font.size else inherited))
    return out


def check(path, rules):
    prs = Presentation(path)
    fails, warns = [], []
    forbidden = [re.compile(p, re.I) for p in rules["forbidden"]]

    for n, slide in enumerate(prs.slides, 1):
        texts = []
        for _sid, txt, pt in effective_sizes(slide):
            texts.append(txt)
            if not txt.strip():
                continue
            is_chrome = (txt.strip() == str(n) or
                         any(m in txt for m in rules["chrome_markers"]))
            limit = rules["chrome_floor_pt"] if is_chrome else rules["min_pt"]
            if pt is None:
                warns.append(f"s{n}: size unresolved — {txt[:40]!r}")
            elif pt < limit:
                fails.append(f"s{n}: {pt:g}pt < {limit:g}pt — {txt[:40]!r}")

        blob = " ".join(texts)
        for pat in forbidden:
            if pat.search(blob):
                fails.append(f"s{n}: forbidden term /{pat.pattern}/")
        if PLACEHOLDER.search(blob):
            fails.append(f"s{n}: leftover placeholder text")

        for sh in slide.shapes:
            if sh.width == 0 or sh.height == 0:
                fails.append(f"s{n}: zero-size shape ({sh.shape_id}) — text will be invisible")
            if rules["require_alt_text"] and not sh.has_text_frame:
                if hasattr(sh._element, "_nvXxPr"):
                    if sh._element._nvXxPr.cNvPr.get("descr") is None:
                        fails.append(f"s{n}: visual without alt text ({sh.shape_id})")
            if sh.left is not None and sh.width:
                if Emu(sh.left).inches < rules["left_margin_in"] or \
                        Emu(sh.left + sh.width).inches > rules["slide_width_in"] + 0.01:
                    warns.append(f"s{n}: shape past margin ({sh.shape_id})")

        if rules["require_notes"]:
            if not slide.has_notes_slide or not slide.notes_slide.notes_text_frame.text.strip():
                warns.append(f"s{n}: no speaker notes")
    return fails, warns


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    rules = dict(RULES)
    if "--rules" in sys.argv:
        rules.update(json.load(open(sys.argv[sys.argv.index("--rules") + 1])))
    paths = args or sorted(glob.glob("out/*.pptx"))
    total = 0
    for p in paths:
        f, w = check(p, rules)
        total += len(f)
        print(f"\n=== {p}\n  FAIL {len(f)}   WARN {len(w)}")
        for x in f[:15]:
            print("   x", x)
        for x in w[:6]:
            print("   .", x)
    print(f"\nTOTAL FAILURES: {total}")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
