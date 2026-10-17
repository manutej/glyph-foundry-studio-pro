"""Volumetric & Glaserian Symbolic Drawing Context (Pen v8 — Milton Soul × 2.5D Litho).

Synthesizes:
1. Milton Glaser's Iconography Contract (ICONS.md + PRINCIPLES.md + META_PROMPT.md):
   - Every glyph embeds <title> and a poetic <desc> ("why this form earns this meaning").
   - Warm hand-drawn round caps (stroke-linecap="round"), negative-space var(--ground) cutouts,
     5-actor semantic palette (cobalt, vermilion, sunflower, forest, plum), and visual puns/rebuses
     (01-affection leaning crescents, 04-greatness dashed potential peak, 05-just-enough exact fill line,
      06-style rotated 18° square, 07-brain outward spiral, 08-doubt mirrored question marks,
      09-aging off-center tree rings, 10-truth arrow passed through target, 11-wow escaping arc,
      12-ambiguity goblet/crucible rebus).
2. 4-Plane 2.5D Volumetric Depth (Z0..Z3) + Staged Sub-Beat Choreography (data-seq="0..k").
3. Zero SVG <filter>, <linearGradient>, <image>, or raw hex literals outside <style>.
"""
import contextlib, math, random

ALLOWED_TAGS = {"svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
                "text", "tspan", "title", "desc", "defs", "marker", "symbol", "use", "style"}


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


class Pen:
    def __init__(self, style, seed="x", measure=None):
        self.S = style
        self.out = []
        self.rng = random.Random(seed)
        self.jit = float(style.get("jitter", 0))
        self.measure = measure  # fn(text, role) -> width px

    # ---- metadata (Milton ICONS.md §4 Step 5: <title> + mandatory <desc>) -----------
    def meta(self, title, desc):
        """Embeds <title> and poetic <desc> inside the glyph group or symbol."""
        self.out.append(f"<title>{esc(title)}</title>")
        self.out.append(f"<desc>{esc(desc)}</desc>")

    # ---- color / stroke helpers -------------------------------------------------
    @staticmethod
    def paint(fill=None, stroke=None, sw=None, extra=""):
        parts = []
        parts.append(f"fill:var(--{fill})" if fill else "fill:none")
        if stroke:
            parts.append(f"stroke:var(--{stroke})")
            parts.append(f"stroke-width:var(--sw-{sw or 'glyph'})")
            parts.append("stroke-linecap:round;stroke-linejoin:round")
        if extra:
            parts.append(extra)
        return ";".join(parts)

    def _j(self, v, scale=1.0):
        return v + (self.rng.uniform(-self.jit, self.jit) * scale if self.jit else 0.0)

    @contextlib.contextmanager
    def layer(self, z=1, seq=0, cls="", extra_attrs=""):
        c = f"z-layer {cls}".strip()
        attr = f' {extra_attrs.strip()}' if extra_attrs else ""
        self.out.append(f'<g class="{c}" data-z="{z}" data-seq="{seq}"{attr}>')
        try:
            yield
        finally:
            self.out.append("</g>")

    # ---- primitives -----------------------------------------------------------------
    def line(self, x1, y1, x2, y2, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        if self.jit and sw != "hair":
            mx, my = (x1 + x2) / 2 + self._j(0, 1.1), (y1 + y2) / 2 + self._j(0, 1.1)
            d = f"M{self._j(x1, 0.6):.1f},{self._j(y1, 0.6):.1f} Q{mx:.1f},{my:.1f} {self._j(x2, 0.6):.1f},{self._j(y2, 0.6):.1f}"
        else:
            d = f"M{x1:.1f},{y1:.1f} L{x2:.1f},{y2:.1f}"
        self.path(d, stroke=stroke, sw=sw, dash=dash, cls=cls, extra=extra)

    def path(self, d, fill=None, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        ex = extra + (f";stroke-dasharray:{dash}" if dash else "")
        c = f' class="{cls}"' if cls else ""
        self.out.append(f'<path{c} d="{d}" style="{self.paint(fill, stroke, sw, ex.strip(";"))}"/>')

    def polygon(self, pts, fill=None, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        d = "M" + " L".join(f"{px:.1f},{py:.1f}" for px, py in pts) + " Z"
        self.path(d, fill=fill, stroke=stroke, sw=sw, dash=dash, cls=cls, extra=extra)

    def rect(self, x, y, w, h, rx=0, fill=None, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        if self.jit and not rx and sw != "hair":
            pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
            d = "M" + " L".join(f"{self._j(px, 0.5):.1f},{self._j(py, 0.5):.1f}" for px, py in pts) + " Z"
            self.path(d, fill=fill, stroke=stroke, sw=sw, dash=dash, cls=cls, extra=extra)
            return
        ex = extra + (f";stroke-dasharray:{dash}" if dash else "")
        c = f' class="{cls}"' if cls else ""
        self.out.append(f'<rect{c} x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx:.1f}" '
                        f'style="{self.paint(fill, stroke, sw, ex.strip(";"))}"/>')

    def ellipse(self, cx, cy, rx, ry, fill=None, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        ex = extra + (f";stroke-dasharray:{dash}" if dash else "")
        c = f' class="{cls}"' if cls else ""
        self.out.append(f'<ellipse{c} cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" '
                        f'style="{self.paint(fill, stroke, sw, ex.strip(";"))}"/>')

    def circle(self, cx, cy, r, fill=None, stroke="line", sw="glyph", dash=None, cls="", extra=""):
        if self.jit and r > 5 and sw != "hair":
            n = 14
            pts = []
            for i in range(n):
                a = 2 * math.pi * i / n
                rr = r + self.rng.uniform(-self.jit, self.jit) * 0.45
                pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
            d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
            for i in range(n):
                p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
                c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
                c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
                d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
            self.path(d + " Z", fill=fill, stroke=stroke, sw=sw, dash=dash, cls=cls, extra=extra)
            return
        ex = extra + (f";stroke-dasharray:{dash}" if dash else "")
        c = f' class="{cls}"' if cls else ""
        self.out.append(f'<circle{c} cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" style="{self.paint(fill, stroke, sw, ex.strip(";"))}"/>')

    def text(self, x, y, s, role="caption", anchor="start", fill="ink", src=None, cls="", halo=False):
        a = {"start": "start", "middle": "middle", "end": "end"}[anchor]
        srcattr = f' data-src="{src}"' if src else ""
        extra = ";paint-order:stroke;stroke:var(--ground);stroke-width:3.5px;stroke-linejoin:round" if halo else ""
        self.out.append(f'<text class="t-{role} {cls}" x="{x:.1f}" y="{y:.1f}" text-anchor="{a}" '
                        f'style="fill:var(--{fill}){extra}"{srcattr}>{esc(s)}</text>')

    def tw(self, s, role):
        if self.measure:
            w = self.measure(s, role)
            if w is not None:
                return w
        size = self.S["type"][role][0]
        return len(s) * size * 0.56

    def raw(self, s):
        self.out.append(s)

    def svg(self):
        return "\n".join(self.out)

    # ---- 2.5D Lithographic & Architectural Composites -------------------------------
    def plinth(self, x, y, w, h, rx=8, dx=3.5, dy=4.5, fill="elev", side="shadow", rim="rim",
               stroke="line", sw="frame", dash=None, ticks=False):
        """Draws a grounded 2.5D lithographic plate with offset slab, warm surface, and top highlight."""
        if dx or dy:
            self.rect(x + dx, y + dy, w, h, rx=rx, fill=side, stroke=stroke, sw="hair", dash=dash, cls="plinth-shadow")
        self.rect(x, y, w, h, rx=rx, fill=fill, stroke=stroke, sw=sw, dash=dash, cls="plinth-face")
        if rim and not dash and w > 2 * rx + 6:
            self.line(x + rx + 2, y + 1.8, x + w - rx - 2, y + 1.8, stroke=rim, sw="hair", cls="plinth-rim")
        if ticks and w > 30 and h > 20:
            tk = 4.0
            for cx_, cy_, sx, sy in ((x + 5, y + 5, 1, 1), (x + w - 5, y + 5, -1, 1),
                                     (x + 5, y + h - 5, 1, -1), (x + w - 5, y + h - 5, -1, -1)):
                self.path(f"M{cx_:.1f},{cy_ + sy * tk:.1f} L{cx_:.1f},{cy_:.1f} L{cx_ + sx * tk:.1f},{cy_:.1f}",
                          stroke="muted", sw="hair")

    def iso_block(self, x, y, w, h, ex=6.0, ey=-5.0, front="panel", top="elev", side="shadow",
                  stroke="line", sw="frame", dash=None):
        """Draws a 3-face axonometric 3D block: front rect + extruded top plane + extruded right plane."""
        self.polygon([(x, y), (x + ex, y + ey), (x + w + ex, y + ey), (x + w, y)],
                     fill=top, stroke=stroke, sw=sw, dash=dash)
        self.polygon([(x + w, y), (x + w + ex, y + ey), (x + w + ex, y + h + ey), (x + w, y + h)],
                     fill=side, stroke=stroke, sw=sw, dash=dash)
        self.rect(x, y, w, h, rx=0, fill=front, stroke=stroke, sw=sw, dash=dash)
        if not dash and w > 8:
            self.line(x + 1.5, y + 1.5, x + w - 1.5, y + 1.5, stroke="rim", sw="hair")

    def caliper(self, x0, x1, y, dir_y=1, stroke="muted", sw="hair", notch=True):
        """Draws a hand-inked span bracket from x0 to x1."""
        tk = 4.5 * dir_y
        mid = (x0 + x1) / 2
        d = f"M{x0:.1f},{y - tk:.1f} Q{x0:.1f},{y:.1f} {x0 + 4:.1f},{y:.1f} L{x1 - 4:.1f},{y:.1f} Q{x1:.1f},{y:.1f} {x1:.1f},{y - tk:.1f}"
        self.path(d, stroke=stroke, sw=sw)
        if notch:
            self.circle(mid, y, 2.0, fill="sunflower", stroke=stroke, sw="hair")

    # ---- Milton Glaser Poetic Motifs (ICONS.md §2 canonical moves) ------------------
    def affection_spark(self, cx, cy, r=5.0, fill="sunflower", stroke="line"):
        """4-cusp Glaserian star/heart spark born in the negative space between paired people (01-affection)."""
        d = (f"M{cx:.1f},{cy - r:.1f} "
             f"Q{cx:.1f},{cy:.1f} {cx + r:.1f},{cy:.1f} "
             f"Q{cx:.1f},{cy:.1f} {cx:.1f},{cy + r:.1f} "
             f"Q{cx:.1f},{cy:.1f} {cx - r:.1f},{cy:.1f} "
             f"Q{cx:.1f},{cy:.1f} {cx:.1f},{cy - r:.1f} Z")
        self.path(d, fill=fill, stroke=stroke, sw="hair")

    def tree_rings(self, cx, cy, r_max, n_rings=3, stroke="line"):
        """Off-centre accumulating tree rings (09-aging: accumulation around a living core)."""
        for i in range(n_rings, 0, -1):
            frac = i / n_rings
            ox = cx - (1.0 - frac) * r_max * 0.22
            oy = cy + (1.0 - frac) * r_max * 0.14
            self.circle(ox, oy, r_max * frac, fill=None, stroke=stroke, sw="hair")
        self.circle(cx - r_max * 0.22, cy + r_max * 0.14, 1.8, fill="sunflower", stroke=stroke, sw="hair")

    # ---- Expressive, Feeling 2.5D Person (Milton ICONS.md + 2.5D Litho) --------------
    def person(self, cx, cy, s, fill="actor-a", hollow=False, sw="glyph", badge=True, lean=0.0):
        """cx,cy = centre of the figure; s = figure height.
        - lean in [-1..+1]: tilts the head and shoulder arc toward a partner (01-affection crescent gesture).
        - Uses var(--ground) negative-space cutouts for heart/spark emblems so the warm paper breathes through.
        - Hollow figures (seats 7-8 in '6-8') render as hand-drawn dashed expectation silhouettes with a
          rising sunflower spark ('holding room open for potential', 04-greatness).
        """
        hr = s * 0.205
        hx = cx + lean * hr * 0.32
        hy = cy - s * 0.26
        bw, by0, by1 = s * 0.35, cy + s * 0.01, cy + s * 0.47
        deep_role = f"{fill}-deep" if fill in ("actor-a", "actor-b", "accent") else "shadow"
        tint_role = f"{fill}-tint" if fill in ("actor-a", "actor-b", "accent") else "soft"

        if hollow:
            # Hand-drawn dashed expectation silhouette with a warm sunflower spark at the heart
            self.ellipse(cx, by1 + s * 0.02, bw * 1.0, s * 0.07, fill=None, stroke=fill, sw="hair", dash="2 2.5")
            d_body = (f"M{cx - bw:.1f},{by1:.1f} C{cx - bw:.1f},{by0:.1f} {cx - bw * 0.35:.1f},{by0:.1f} {cx:.1f},{by0:.1f} "
                      f"C{cx + bw * 0.35:.1f},{by0:.1f} {cx + bw:.1f},{by0:.1f} {cx + bw:.1f},{by1:.1f} Z")
            self.path(d_body, fill=tint_role, stroke=fill, sw="frame", dash="4 3", extra="fill-opacity:0.30")
            self.circle(hx, hy, hr, fill=tint_role, stroke=fill, sw="frame", dash="4 3", extra="fill-opacity:0.30")
            # Warm sunflower potential spark in the chest (instead of cold CAD crosshairs)
            cy_chest = (by0 + by1) * 0.52
            self.circle(cx, cy_chest, max(hr * 0.26, 2.2), fill="sunflower", stroke=fill, sw="hair")
            return

        # 1. Ground litho shadow ellipse
        self.ellipse(cx + s * 0.025, by1 + s * 0.02, bw * 1.06, s * 0.08, fill="shadow", stroke=None)
        # 2. Extruded lithographic back-bevel torso for 2.5D physical depth
        off_x, off_y = s * 0.045, s * 0.035
        d_back = (f"M{cx - bw + off_x:.1f},{by1 + off_y:.1f} "
                  f"C{cx - bw + off_x:.1f},{by0 + off_y:.1f} {cx - bw * 0.35 + off_x:.1f},{by0 + off_y:.1f} {cx + off_x:.1f},{by0 + off_y:.1f} "
                  f"C{cx + bw * 0.35 + off_x:.1f},{by0 + off_y:.1f} {cx + bw + off_x:.1f},{by0 + off_y:.1f} {cx + bw + off_x:.1f},{by1 + off_y:.1f} Z")
        self.path(d_back, fill=deep_role, stroke="line", sw="hair")
        # 3. Main sculpted torso with leaning shoulder curve
        sh_shift = lean * bw * 0.14
        d_front = (f"M{cx - bw:.1f},{by1:.1f} C{cx - bw:.1f},{by0:.1f} {cx - bw * 0.35 + sh_shift:.1f},{by0:.1f} {cx + sh_shift:.1f},{by0:.1f} "
                   f"C{cx + bw * 0.35 + sh_shift:.1f},{by0:.1f} {cx + bw:.1f},{by0:.1f} {cx + bw:.1f},{by1:.1f} Z")
        self.path(d_front, fill=fill, stroke="line", sw=sw)
        # 4. Warm paper negative-space cutout emblem on chest (ICONS.md: var(--ground) negative-space punch)
        if badge and s >= 22:
            cy_b = by0 + (by1 - by0) * 0.52
            rb = s * 0.082
            if fill == "actor-a":
                # Client Engineer: negative-space paper key-diamond with cobalt/sunflower core
                self.polygon([(cx, cy_b - rb), (cx + rb, cy_b), (cx, cy_b + rb), (cx - rb, cy_b)],
                             fill="ground", stroke="line", sw="hair")
            elif fill == "actor-b":
                # Pursuit Fellow: warm sunflower/paper rising spark circle + arc
                self.circle(cx, cy_b, rb * 0.85, fill="ground", stroke="line", sw="hair")
        # 5. Head sphere with subtle gesture tilt + negative-space paper eye/attention dot
        self.circle(hx, hy, hr, fill=fill, stroke="line", sw=sw)
        if s >= 21:
            eye_x = hx + (lean * hr * 0.28 if lean else -hr * 0.22)
            self.circle(eye_x, hy - hr * 0.12, max(hr * 0.21, 1.25), fill="ground", stroke=None)
