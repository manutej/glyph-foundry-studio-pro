#!/usr/bin/env python3
"""HTML, SVG Token, Anchor & JS Selector Validator for Editorial Dashboards.

Usage:
  python3 .agents/skills/editorial-dashboard/scripts/validate_dashboard.py path/to/dashboard.html [--strict-vars]
"""
import argparse, pathlib, re, sys
from html.parser import HTMLParser


VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class DashboardValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.ids = set()
        self.hrefs = []
        self.svg_count = 0
        self.in_svg = False
        self.raw_hex_attrs = 0

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "id" in attr_dict and attr_dict["id"]:
            self.ids.add(attr_dict["id"])
        if tag == "a" and "href" in attr_dict:
            href = attr_dict["href"]
            if href and href.startswith("#") and len(href) > 1:
                self.hrefs.append(href[1:])
        if tag == "svg":
            self.svg_count += 1
            self.in_svg = True
        if self.in_svg:
            for k, v in attrs:
                if k in ("fill", "stroke") and v and re.fullmatch(r"#[0-9A-Fa-f]{3,6}", v.strip()):
                    self.raw_hex_attrs += 1
        if tag not in VOID_TAGS:
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag == "svg":
            self.in_svg = False
        if tag in VOID_TAGS:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        elif any(t == tag for t, _ in self.stack):
            while self.stack and self.stack[-1][0] != tag:
                unclosed, line = self.stack.pop()
                self.errors.append(f"Unclosed <{unclosed}> (opened at line {line}) before </{tag}> at line {self.getpos()[0]}")
            if self.stack:
                self.stack.pop()
        else:
            self.errors.append(f"Stray closing </{tag}> at line {self.getpos()[0]}")


def validate_file(path: pathlib.Path, strict_vars: bool = False) -> int:
    html = path.read_text(encoding="utf-8")
    v = DashboardValidator()
    v.feed(html)

    for tag, line in v.stack:
        v.errors.append(f"Unclosed <{tag}> opened at line {line} still on stack at EOF")

    missing_anchors = [h for h in v.hrefs if h not in v.ids]
    for m in missing_anchors:
        v.errors.append(f"Broken anchor href='#{m}' has no matching id='{m}'")

    scripts = "\n".join(re.findall(r"<script\b[^>]*>(.*?)</script>", html, re.S))
    js_refs = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", scripts))
    js_refs |= set(re.findall(r"querySelector\(['\"]#([A-Za-z0-9_-]+)['\"]\)", scripts))
    missing_js = sorted(js_refs - v.ids)
    for m in missing_js:
        v.errors.append(f"JS selector references missing DOM id='#{m}'")

    if strict_vars and v.raw_hex_attrs > 0:
        v.errors.append(f"Found {v.raw_hex_attrs} raw hex fill/stroke attributes inside <svg>; use var(--ink, ...) tokens")

    print(f"[validate_dashboard] {path.name}: {len(v.ids)} IDs · {v.svg_count} inline SVGs · {len(v.errors)} errors")
    if v.raw_hex_attrs > 0 and not strict_vars:
        print(f"  [note] {v.raw_hex_attrs} raw hex attributes in <svg> (pass --strict-vars to enforce CSS var tokens)")
    for err in v.errors:
        print(f"  [ERROR] {err}")
    return 1 if v.errors else 0


def main():
    ap = argparse.ArgumentParser(description="Validate an Editorial Dashboard HTML artifact.")
    ap.add_argument("html", help="Path to HTML file")
    ap.add_argument("--strict-vars", action="store_true", help="Fail if <svg> contains raw hex attributes instead of var(--*)")
    args = ap.parse_args()
    sys.exit(validate_file(pathlib.Path(args.html), args.strict_vars))


if __name__ == "__main__":
    main()
