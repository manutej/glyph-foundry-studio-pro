"""Glyph programs v8 — Milton Glaser Poetic Semiotics × Volumetric 2.5D Litho Architecture.

Each glyph draws inside its FigTree solver box (w x h) using semantic role tokens, organized into:
- Mandatory <title> and poetic <desc> on every glyph (Milton ICONS.md §4 Step 5 contract)
- One unmistakable Glaserian geometric move + visual pun ([+pun]) per glyph (01-affection, 04-greatness,
  05-just-enough, 06-style, 07-brain, 08-doubt, 09-aging, 10-truth, 11-wow, 12-ambiguity)
- Multi-plane Z-layers (`data-z="0..3"`) for physical depth & interactive 2.5D stage parallax
- Choreographed sub-beat sequences (`data-seq="0..k"`) for staged procedural assembly
- Strict zero-spill geometry verified in headless Chromium against actual @fontsource delivery fonts.
"""
import math

REGISTRY = {
    "crowd":    {"idioms": ["group", "headcount", "team", "range of people", "intake terrace"],
                 "rhetoric": ["mechanism", "quantity"], "floor": 18,
                 "params": {"n": "int", "solid": "int (draw n-solid as dashed sunflower potential = 'up to')", "roles": "[role]"}},
    "gate":     {"idioms": ["threshold", "bar to clear", "prerequisite", "vernier lock", "10-truth arrow"],
                 "rhetoric": ["mechanism"], "floor": 10},
    "cohort":   {"idioms": ["vessel", "mixed group", "amphitheater crucible", "01-affection sparks"],
                 "rhetoric": ["mechanism", "union"], "floor": 24,
                 "params": {"n": "int", "roles": "[role] alternating"}},
    "contract": {"idioms": ["commitment", "billable term", "sealed charter + 12-month matrix"],
                 "rhetoric": ["mechanism", "quantity"], "floor": 28},
    "taper":    {"idioms": ["step-down", "scaffolding release", "decay + 04-greatness autonomy peak"],
                 "rhetoric": ["mechanism", "trend"], "floor": 16,
                 "params": {"levels": "[number]", "ticks": "[str]"}},
    "fork":     {"idioms": ["choice", "trifurcation switchyard", "outcome portals"],
                 "rhetoric": ["choice"], "floor": 14,
                 "params": {"branches": "[{label, concept, icon: check|exit|loop}]"}},
    "equation": {"idioms": ["derivation", "dimensional volume multiplier", "09-aging rings + ingot stack"],
                 "rhetoric": ["derivation"], "floor": 18,
                 "params": {"terms": "[str]", "result": "str", "after": "str"}},
    "balance":  {"idioms": ["tension", "torsion scale", "08-doubt + 06-style rotated catalyst pod"],
                 "rhetoric": ["tension", "comparison"], "floor": 24,
                 "params": {"left": "int", "right": "int", "pod": "int", "note": "str"}},
    "venn":     {"idioms": ["union", "vesica piscis crucible", "11-wow escaping resonance arc"],
                 "rhetoric": ["union"], "floor": 12,
                 "params": {"a": "str", "b": "str", "mid": "str"}},
}


def crowd(P, w, h, prm, nid):
    """Expressive 2.5D Intake Terrace: 6 Leaning Solid Figures + 2 Dashed Sunflower Potential Silhouettes (04-greatness)."""
    n, solid = prm.get("n", 8), prm.get("solid", prm.get("n", 8))
    roles = prm.get("roles", ["actor-a"])
    main_role = roles[0]
    P.meta(
        f"Intake Ensemble ({solid}–{n} people)",
        "Six solid figures lean inward in conversation while two dashed silhouettes hold warm sunflower sparks at their hearts. "
        "Embodies Glaser's 04-Greatness and 05-Just-Enough: holding room open for the 7th and 8th person."
    )
    cols = math.ceil(n / 2)

    pad_x, pad_top, pad_bot = 8.0, 3.0, 9.0
    pw = w - 2 * pad_x - 3
    ph = h - pad_top - pad_bot - 3
    px, py = pad_x, pad_top

    # Z=0: 2.5D Lithographic Terrace Plinth + Sunflower Elastic Capacity Zone
    with P.layer(z=0, seq=0, cls="terrace-base"):
        P.plinth(px, py, pw, ph, rx=8, dx=3.0, dy=3.5, fill="panel", side="shadow", stroke="line", sw="frame", ticks=False)
        P.line(px + 8, py + ph * 0.50, px + pw - 8, py + ph * 0.50, stroke="grid", sw="hair", dash="3 3")
        if solid < n:
            zx = px + pw * 0.50
            zy = py + ph * 0.51
            zw = pw * 0.46
            zh = ph * 0.44
            P.rect(zx, zy, zw, zh, rx=5, fill="sunflower-tint", stroke=main_role, sw="hair", dash="3 2.5", extra="fill-opacity:0.34")

    s = min((pw - 18) / (cols * 0.96), (ph - 10) / 2.15)
    gx = (pw - 24) / max(cols - 1, 1)
    x0 = px + 12 + (pw - 24 - (cols - 1) * gx) / 2
    row0_y = py + ph * 0.27
    row1_y = py + ph * 0.72

    # Z=1 & Z=2: Expressive 2.5D Figures with Human Leaning Gesture (Row 1 = seq 1, Row 2 = seq 2)
    for r in range(2):
        with P.layer(z=r + 1, seq=r + 1, cls=f"crowd-row-{r}"):
            for c in range(cols):
                i = r * cols + c
                if i >= n:
                    continue
                cx = x0 + c * gx
                cy = row0_y if r == 0 else row1_y
                lean = 0.45 if c < (cols - 1) / 2 else (-0.45 if c > (cols - 1) / 2 else 0.0)
                P.person(cx, cy, s * 0.92, fill=roles[i % len(roles)], hollow=(i >= solid), sw="frame", lean=lean)

    # Z=3: Hand-Inked Span Bracket under the elastic range slots
    with P.layer(z=3, seq=3, cls="crowd-caliper"):
        if solid < n:
            c_start = solid % cols
            cx_a = x0 + c_start * gx - s * 0.32
            cx_b = x0 + (cols - 1) * gx + s * 0.32
            P.caliper(cx_a, cx_b, py + ph - 2.2, dir_y=1, stroke=main_role, sw="hair")

    return (px, py, px + pw, py + ph - 2)


def gate(P, w, h, prm, nid):
    """Glaser's 10-Truth Target Arrow × Double-Helix Calibration Sieve."""
    label = prm.get("label", "")
    P.meta(
        f"Shared Prerequisite Bar · {label}",
        "Two streams converge through a calibration lock while a vermilion arrow passes cleanly through the centre bullseye into a sunflower spark. "
        "Embodies Glaser's 10-Truth: a shared bar is not a wall that stops you, but a threshold both sides pass through."
    )
    gw = min(max(P.tw(label, "tick") + 74, w * 0.58), w * 0.88)
    x0, x1 = w / 2 - gw / 2, w / 2 + gw / 2
    bh = 25
    top = 8
    ax_l = x0 + gw * 0.22
    ax_r = x0 + gw * 0.78
    mx, my = w / 2, h - 5

    # Z=0: Braided Double-Helix Convergence Funnel + 10-Truth Central Arrow Shaft
    with P.layer(z=0, seq=0, cls="gate-funnel"):
        P.rect(ax_l - 10, top - 3.5, 20, 5, rx=2, fill="actor-a-tint", stroke="line", sw="hair")
        P.rect(ax_r - 10, top - 3.5, 20, 5, rx=2, fill="actor-b-tint", stroke="line", sw="hair")
        for ax, role in ((ax_l, "actor-a"), (ax_r, "actor-b")):
            P.path(f"M{ax:.1f},{top + bh:.1f} C{ax:.1f},{my - 8:.1f} {mx:.1f},{top + bh + 6:.1f} {mx:.1f},{my:.1f}",
                   stroke="shadow", sw="glyph")
            P.path(f"M{ax:.1f},{top + bh:.1f} C{ax:.1f},{my - 10:.1f} {mx:.1f},{top + bh + 8:.1f} {mx:.1f},{my:.1f}",
                   stroke="line", sw="edge")
            P.path(f"M{ax:.1f},{top + bh:.1f} C{ax:.1f},{my - 10:.1f} {mx:.1f},{top + bh + 8:.1f} {mx:.1f},{my:.1f}",
                   stroke=role, sw="hair", dash="3 2.5")
        # 10-Truth central arrow shaft passing through the bar to the convergence point
        P.line(mx, top - 4, mx, my - 4, stroke="accent", sw="hair", dash="2 2")

    # Z=1: 2.5D Extruded Calibration Bar with Actor Lock-Chambers & Sunflower Vernier Ticks
    with P.layer(z=1, seq=1, cls="gate-beam"):
        P.rect(x0 + 2.5, top + 3.0, gw, bh, rx=bh / 2, fill="shadow", stroke=None)
        P.rect(x0, top, gw, bh, rx=bh / 2, fill="line", stroke="line", sw="frame")
        P.circle(ax_l, top + bh / 2, 6.8, fill="actor-a", stroke="ground", sw="hair")
        P.circle(ax_r, top + bh / 2, 6.8, fill="actor-b", stroke="ground", sw="hair")
        n_ticks = 9
        for i in range(n_ticks):
            tx = x0 + gw * (0.31 + 0.38 * i / (n_ticks - 1))
            th = 3.4 if i % 2 == 0 else 2.0
            P.line(tx, top + 1.5, tx, top + 1.5 + th, stroke="sunflower" if i == 4 else "muted", sw="hair")

    # Z=2: Calibration Label & Sunflower Synchronization Spark at Exit
    with P.layer(z=2, seq=2, cls="gate-label"):
        P.text(w / 2, top + bh / 2 + 4.5, label, role="tick", anchor="middle", fill="ground", src=nid)
        P.circle(mx, my, 5.6, fill="sunflower-tint", stroke="line", sw="frame")
        P.affection_spark(mx, my, r=3.8, fill="sunflower", stroke="accent")

    return (x0, top, x1, my)


def cohort(P, w, h, prm, nid):
    """The Affection Crucible Vessel (01-affection) — 16 Interleaved Engineers + Sunflower Pairing Sparks."""
    n = prm.get("n", 16)
    roles = prm.get("roles", ["actor-a", "actor-b"])
    P.meta(
        f"Unified {n}-Engineer Crucible Cohort",
        "Sixteen interleaved client and Pursuit engineers lean toward their partners inside a warm double-walled studio vessel, "
        "kindling eight sunflower sparks along the shared workbench. Embodies Glaser's 01-Affection: craft grows between people."
    )
    cols = 8 if n > 8 else n
    rows = math.ceil(n / cols)
    vw = min(w * 0.92, 328)
    vh = min(h * 0.88, 108)
    vx, vy = w / 2 - vw / 2, h / 2 - vh / 2 - 2

    # Z=0: 2.5D Extruded Crucible Stadium & Sunflower-Rimmed Inner Floor
    with P.layer(z=0, seq=0, cls="cohort-vessel"):
        P.plinth(vx, vy, vw, vh, rx=min(vh / 2, 32), dx=3.5, dy=4.5, fill="elev", side="shadow", stroke="line", sw="glyph")
        ins = 5.5
        P.rect(vx + ins, vy + ins, vw - 2 * ins, vh - 2 * ins, rx=min((vh - 2 * ins) / 2, 26),
               fill="panel", stroke="sunflower", sw="hair")
        ch = vh * 0.38
        P.rect(vx - 2.5, vy + vh / 2 - ch / 2, 5.0, ch, rx=2, fill="actor-a", stroke="line", sw="hair")
        P.rect(vx + vw - 2.5, vy + vh / 2 - ch / 2, 5.0, ch, rx=2, fill="actor-b", stroke="line", sw="hair")

    s = min((vw - 38) / cols / 0.95, (vh - 20) / rows / 1.12)
    gx = (vw - 44) / max(cols - 1, 1)
    sx = w / 2 - (cols - 1) * gx / 2
    y_row0 = vy + vh / 2 - s * 0.54
    y_row1 = vy + vh / 2 + s * 0.54

    # Z=1: Shared Curriculum Core Bus & 8 Sunflower Affection Sparks between Dyads (01-affection)
    with P.layer(z=1, seq=1, cls="cohort-bonds"):
        mid_y = vy + vh / 2 - s * 0.02
        P.line(sx - 6, mid_y, sx + (cols - 1) * gx + 6, mid_y, stroke="grid", sw="hair", dash="2 2")
        for c in range(cols):
            cx = sx + c * gx
            P.line(cx, y_row0 + s * 0.32, cx, y_row1 - s * 0.36, stroke="muted", sw="hair", dash="1.5 2")
            P.affection_spark(cx, mid_y, r=3.2, fill="sunflower", stroke="line")

    # Z=2 & Z=3: 16 Expressive Interleaved Figures Leaning Inward in Dyads
    for r in range(rows):
        with P.layer(z=r + 2, seq=r + 2, cls=f"cohort-row-{r}"):
            for c in range(cols):
                i = r * cols + c
                if i >= n:
                    continue
                role = roles[(r + c) % len(roles)]
                cy = y_row0 if r == 0 else y_row1
                lean = 0.40 if c % 2 == 0 else -0.40
                P.person(sx + c * gx, cy, s * 0.90, fill=role, sw="frame", lean=lean)

    return (vx, vy, vx + vw + 3.5, vy + vh + 4.5)


def contract(P, w, h, prm, nid):
    """The Forest-Sealed Charter (05-just-enough) + 12-Month Production Matrix & Open 13th Horizon."""
    P.meta(
        "8 Billable Charter · 12-Month Commitment",
        "A folded charter sealed with a forest-green signet holds eight billable seats alongside a 12-month studio calendar "
        "whose 13th slot opens into a sunflower horizon. Embodies Glaser's 05-Just-Enough: clear terms without hidden traps."
    )
    dh = min(h * 0.86, 118)
    dw = dh * 0.78
    gap = 20
    cal_w = min(w - dw - gap - 22, dh * 1.12)
    tot = dw + gap + cal_w
    x0 = w / 2 - tot / 2
    y0 = h / 2 - dh / 2 - 2
    fold = dw * 0.22

    # Z=0: Multi-sheet Charter Stack & Calendar Matrix Base
    with P.layer(z=0, seq=0, cls="contract-base"):
        P.rect(x0 - 3.5, y0 + 3.5, dw, dh, rx=3, fill="shadow", stroke="line", sw="hair")
        P.path(f"M{x0:.1f},{y0:.1f} L{x0 + dw - fold:.1f},{y0:.1f} L{x0 + dw:.1f},{y0 + fold:.1f} "
               f"L{x0 + dw:.1f},{y0 + dh:.1f} L{x0:.1f},{y0 + dh:.1f} Z", fill="elev", stroke="line", sw="glyph")
        P.polygon([(x0 + dw - fold, y0), (x0 + dw - fold, y0 + fold), (x0 + dw, y0 + fold)],
                  fill="sunflower-tint", stroke="line", sw="frame")
        P.line(x0 + dw * 0.14, y0 + dh * 0.11, x0 + dw * 0.66, y0 + dh * 0.11, stroke="forest", sw="frame")
        P.line(x0 + dw * 0.14, y0 + dh * 0.17, x0 + dw * 0.50, y0 + dh * 0.17, stroke="grid", sw="hair")

    # Z=1: 8 Billable Engineers inside Charter + Official Forest/Sunflower Wax Signet Seal
    with P.layer(z=1, seq=1, cls="contract-roster"):
        n_people = prm.get("people", 8)
        for i in range(n_people):
            r_, c_ = divmod(i, 4)
            px = x0 + dw * (0.20 + c_ * 0.20)
            py = y0 + dh * (0.37 + r_ * 0.23)
            P.person(px, py, dw * 0.165, fill="actor-b", sw="frame", badge=False, lean=0.25 if c_ < 2 else -0.25)
        P.line(x0 + dw * 0.14, y0 + dh * 0.84, x0 + dw * 0.56, y0 + dh * 0.84, stroke="muted", sw="frame")
        sx_seal, sy_seal, sr = x0 + dw * 0.76, y0 + dh * 0.83, dw * 0.105
        P.polygon([(sx_seal - sr * 0.5, sy_seal + sr * 0.5), (sx_seal - sr * 0.9, sy_seal + sr * 1.45),
                   (sx_seal - sr * 0.1, sy_seal + sr * 1.15)], fill="accent-deep", stroke="line", sw="hair")
        P.polygon([(sx_seal + sr * 0.5, sy_seal + sr * 0.5), (sx_seal + sr * 0.9, sy_seal + sr * 1.45),
                   (sx_seal + sr * 0.1, sy_seal + sr * 1.15)], fill="accent", stroke="line", sw="hair")
        P.circle(sx_seal, sy_seal, sr, fill="forest", stroke="line", sw="frame")
        P.circle(sx_seal, sy_seal, sr * 0.50, fill="sunflower", stroke="line", sw="hair")

    # Z=2: 12-Month Isometric Utilization Matrix + 13th Open Sunflower Horizon Slot
    cx0 = x0 + dw + gap
    cols, rows = 4, 3
    cell = cal_w / (cols + 0.95)
    cy0 = h / 2 - rows * cell / 2 - 10
    with P.layer(z=2, seq=2, cls="contract-calendar"):
        P.line(x0 + dw + 2, y0 + dh * 0.48, cx0 - 2, y0 + dh * 0.48, stroke="muted", sw="hair", dash="2 2")
        for i in range(12):
            r, c = divmod(i, cols)
            bx = cx0 + c * cell + 2
            by = cy0 + r * cell + 2
            bw_ = cell - 4.5
            bh_ = cell - 4.5
            P.rect(bx + 1.8, by + 2.0, bw_, bh_, rx=3, fill="shadow", stroke=None)
            P.rect(bx, by, bw_, bh_, rx=3, fill="elev", stroke="line", sw="frame")
            P.rect(bx + 1.5, by + 1.5, bw_ - 3.0, bh_ * 0.28, rx=1.5,
                   fill="forest" if i == 11 else "actor-b", stroke=None)
            for wk in range(4):
                wx = bx + 3.2 + wk * ((bw_ - 6.4) / 3.8)
                P.line(wx, by + bh_ * 0.52, wx, by + bh_ * 0.82, stroke="muted", sw="hair")

        hx = cx0 + cols * cell + 2.5
        hy = cy0 + 2 * cell + 2
        hw = cell * 0.82
        hh = cell - 4.5
        P.rect(hx, hy, hw, hh, rx=3, fill="sunflower-tint", stroke="accent", sw="frame", dash="3 2.5", extra="fill-opacity:0.42")
        mcx, mcy = hx + hw / 2, hy + hh / 2
        P.path(f"M{mcx - 3:.1f},{mcy - 3.5:.1f} L{mcx + 2.5:.1f},{mcy:.1f} L{mcx - 3:.1f},{mcy + 3.5:.1f}",
               stroke="accent", sw="frame")

    # Z=3: Timeline Caliper & Label
    with P.layer(z=3, seq=3, cls="contract-label"):
        cal_right = cx0 + (cols + 0.88) * cell
        P.caliper(cx0 + 2, cal_right, cy0 + rows * cell + 3.5, dir_y=1, stroke="muted", sw="hair")
        P.text((cx0 + cal_right) / 2, cy0 + rows * cell + 18, "a year, minimum", role="tick", anchor="middle", fill="muted", src=nid)

    return (x0 - 3.5, y0, cal_right, max(y0 + dh, cy0 + rows * cell + 22))


def taper(P, w, h, prm, nid):
    """Scaffolding Release + Glaser's 04-Greatness Dashed Autonomy Peak & Sunflower Mastery Spark."""
    levels = prm.get("levels", [5, 3, 1, 0])
    ticks = prm.get("ticks", [""] * len(levels))
    P.meta(
        "Coaching Taper & Rising Autonomy (5 d/wk → 1 h/day)",
        "As the plum-podium coach's 3D cadence columns step down, a dashed mountain peak (04-greatness) and forest autonomy curve "
        "rise to a sunflower spark. Embodies Glaser's principle that great teaching makes itself unnecessary."
    )
    tick_h = 22
    ah = h - tick_h - 4
    coach_w = min(ah * 0.62, 58)
    n = len(levels)
    slot = min((w - coach_w - 22) / n, 80)
    total = coach_w + 18 + slot * n
    x0 = w / 2 - total / 2
    base = ah - 3
    mx = max(levels) or 1
    bw = slot * 0.48
    ex, ey = 5.5, -4.5

    cx_c = x0 + coach_w / 2
    cy_c = ah * 0.40
    ps = min(coach_w * 1.02, ah * 0.64)

    # Z=0: Studio Grid, Plum Coach Podium & Glaser 04-Greatness Dashed Autonomy Peak
    with P.layer(z=0, seq=0, cls="taper-grid"):
        chart_x0 = x0 + coach_w + 14
        chart_x1 = x0 + total
        for frac in (0.25, 0.55, 0.85):
            gy = base - (ah - 18) * frac
            P.line(chart_x0, gy, chart_x1, gy, stroke="grid", sw="hair", dash="2 3")
        ax0, ay0 = chart_x0 + slot * 0.5, base - (ah - 22) * 0.18
        ax1, ay1 = chart_x1 - slot * 0.35, base - (ah - 22) * 0.86
        # 04-Greatness dashed mountain of cohort mastery rising behind the tapering bars
        P.polygon([(ax0 + slot * 0.4, base), (ax1, ay1 - 2), (chart_x1 - 2, base)],
                  fill="sunflower-tint", stroke="forest", sw="hair", dash="4 3", extra="fill-opacity:0.25")
        P.path(f"M{ax0:.1f},{ay0:.1f} C{ax0 + (ax1 - ax0) * 0.45:.1f},{ay0:.1f} "
               f"{ax0 + (ax1 - ax0) * 0.55:.1f},{ay1:.1f} {ax1:.1f},{ay1:.1f}",
               stroke="forest", sw="frame", dash="4 3")
        P.affection_spark(ax1, ay1, r=4.2, fill="sunflower", stroke="forest")
        P.plinth(cx_c - coach_w * 0.44, cy_c - ps * 0.52, coach_w * 0.88, ps * 1.12, rx=8, dx=2.5, dy=3.0,
                 fill="plum-tint", side="shadow", stroke="plum", sw="frame")

    # Z=1: Sculpted Coach + Rightward Broadcast Support Waves
    with P.layer(z=1, seq=1, cls="taper-coach"):
        P.person(cx_c, cy_c, ps * 0.88, fill="actor-b", sw="frame", lean=0.45)
        wx = cx_c + coach_w * 0.48
        wy = cy_c - ps * 0.12
        for wr in (7.0, 12.5):
            P.path(f"M{wx:.1f},{wy - wr * 0.75:.1f} A{wr:.1f},{wr:.1f} 0 0,1 {wx:.1f},{wy + wr * 0.75:.1f}",
                   stroke="accent", sw="hair", dash="2 2")
        P.text(cx_c, cy_c + ps * 0.62 + 16, prm.get("actor", ""), role="tick", anchor="middle", fill="ink", src=nid)

    # Z=2: 3D Isometric Coaching Columns + Daily Cadence Strata
    crests = []
    with P.layer(z=2, seq=2, cls="taper-bars"):
        for i, (lv, tk) in enumerate(zip(levels, ticks)):
            cx = x0 + coach_w + 18 + slot * (i + 0.5)
            bh = max((ah - 20) * lv / mx, 6)
            last = prm.get("dashed_last") and i == n - 1
            bx = cx - bw / 2
            by = base - bh
            crests.append((cx + ex * 0.5, by + ey * 0.5))
            if last:
                P.iso_block(bx, by, bw, bh, ex=ex, ey=ey, front="soft", top="sunflower-tint", side="panel",
                            stroke="muted", sw="frame", dash="4 3")
            else:
                front_role = "actor-b" if i == 0 else ("elev" if i == 1 else "panel")
                top_role = "sunflower" if i == 0 else ("actor-b" if i == 1 else "elev")
                side_role = "actor-b-deep" if i == 0 else "shadow"
                P.iso_block(bx, by, bw, bh, ex=ex, ey=ey, front=front_role, top=top_role, side=side_role,
                            stroke="line", sw="frame")
                if i in (1, 2) and bh > 12:
                    P.rect(bx + 1.5, by + 1.5, bw - 3.0, min(8.0, bh * 0.26), rx=1, fill="actor-b", stroke=None)
                n_strata = int(round(lv))
                if n_strata >= 2 and bh > 18:
                    for s_i in range(1, n_strata):
                        sy = by + bh * s_i / n_strata
                        P.line(bx + 3, sy, bx + bw - 3, sy, stroke="line", sw="hair")

    # Z=3: Harmonic Decay Envelope Curve & Axis Ticks
    with P.layer(z=3, seq=3, cls="taper-axis"):
        if len(crests) >= 2:
            d_env = f"M{crests[0][0]:.1f},{crests[0][1] - 3:.1f}"
            for (px0, py0), (px1, py1) in zip(crests, crests[1:]):
                mx_ = (px0 + px1) / 2
                d_env += f" C{mx_:.1f},{py0 - 3:.1f} {mx_:.1f},{py1 - 3:.1f} {px1:.1f},{py1 - 3:.1f}"
            P.path(d_env, stroke="accent", sw="frame", dash="3 2")
            for px_, py_ in crests[:-1]:
                P.circle(px_, py_ - 3, 2.8, fill="sunflower", stroke="accent", sw="hair")
        P.line(x0 + coach_w + 10, base, x0 + total + 4, base, stroke="line", sw="frame")
        for i, tk in enumerate(ticks):
            cx = x0 + coach_w + 18 + slot * (i + 0.5)
            P.line(cx, base, cx, base + 4, stroke="line", sw="hair")
            P.text(cx, base + 17, tk, role="tick", anchor="middle", fill="muted", src=nid)

    return (x0, 2, x0 + total + ex, base + 20)


ICONS = {
    "check": lambda P, x, y, r: P.path(
        f"M{x - r * .42:.1f},{y:.1f} L{x - r * .08:.1f},{y + r * .36:.1f} L{x + r * .46:.1f},{y - r * .36:.1f}",
        stroke="ground", sw="edge"),
    "exit": lambda P, x, y, r: (
        P.line(x - r * .33, y - r * .33, x + r * .33, y + r * .33, stroke="ground", sw="edge"),
        P.line(x - r * .33, y + r * .33, x + r * .33, y - r * .33, stroke="ground", sw="edge")),
    "loop": lambda P, x, y, r: (
        P.path(f"M{x + r * .44:.1f},{y:.1f} A{r * .44:.1f},{r * .44:.1f} 0 1 1 {x:.1f},{y - r * .44:.1f}",
               stroke="ground", sw="edge"),
        P.path(f"M{x - r * .10:.1f},{y - r * .68:.1f} L{x + r * .12:.1f},{y - r * .44:.1f} L{x - r * .10:.1f},{y - r * .20:.1f}",
               stroke="ground", sw="edge")),
}


def fork(P, w, h, prm, nid):
    """Year-End Trifurcation Switchyard & Sculpted Outcome Portals with Sunflower Junction Heart."""
    br = prm["branches"]
    P.meta(
        "Year-End Choice · Hire Direct, Dismiss, or Extend",
        "From a sunflower-lit junction diamond, three clean tracks lead to forest-green direct hire, clean exit, or extended deployment. "
        "Embodies Glaser's 10-Truth: every option at year-end is visible up front."
    )
    lab_w = max(P.tw(b["label"], "caption") for b in br)
    r = 16.5
    stem_x0, stem_x1 = 16, 52
    end_x = max(w - lab_w - r * 2 - 22, stem_x1 + 54)
    cy = h * 0.5
    ys = [h * (0.5 + (i - (len(br) - 1) / 2) * 0.33) for i in range(len(br))]
    fills = {"check": "forest", "exit": "muted", "loop": "actor-b"}
    tints = {"check": "forest-tint", "exit": "soft", "loop": "sunflower-tint"}

    # Z=0: Switchyard Trunk, Sunflower Junction Spark & Dual-Track Conduit Beds
    with P.layer(z=0, seq=0, cls="fork-tracks"):
        P.line(stem_x0, cy, stem_x1, cy, stroke="shadow", sw="glyph")
        P.line(stem_x0, cy, stem_x1, cy, stroke="line", sw="edge")
        for b, y in zip(br, ys):
            mid = (stem_x1 + end_x) / 2
            if abs(y - cy) < 1:
                d = f"M{stem_x1:.1f},{cy:.1f} C{mid - 10:.1f},{cy - 26:.1f} {mid + 10:.1f},{cy - 26:.1f} {end_x - r - 3:.1f},{y:.1f}"
            else:
                d = f"M{stem_x1:.1f},{cy:.1f} C{mid:.1f},{cy:.1f} {mid:.1f},{y:.1f} {end_x - r - 3:.1f},{y:.1f}"
            P.path(d, stroke="soft", sw="glyph")
            P.path(d, stroke="line", sw="edge")
        P.affection_spark(stem_x1, cy, r=6.2, fill="sunflower", stroke="line")

    # Z=1..3: Three Sculpted 2.5D Portal Medallions + Label Plates
    for idx, (b, y) in enumerate(zip(br, ys)):
        with P.layer(z=idx + 1, seq=idx + 1, cls=f"fork-branch-{idx}"):
            role = fills.get(b["icon"], "accent")
            tint = tints.get(b["icon"], "panel")
            P.circle(end_x + 2.0, y + 2.5, r + 3.0, fill="shadow", stroke=None)
            P.circle(end_x, y, r + 3.0, fill=tint, stroke="line", sw="hair")
            P.circle(end_x, y, r, fill=role, stroke="line", sw="frame")
            ICONS[b["icon"]](P, end_x, y, r * 0.92)
            tw_b = P.tw(b["label"], "caption")
            lx = end_x + r + 9
            P.raw(f'<g data-concept="{b["concept"]}">')
            P.rect(lx - 4, y - 11, tw_b + 10, 22, rx=6, fill="elev", stroke="grid", sw="hair")
            P.text(lx + 1, y + 5, b["label"], role="caption", src=nid)
            P.raw("</g>")

    return (stem_x0, ys[0] - r - 4, end_x + r + 14 + lab_w, ys[-1] + r + 4)


def equation(P, w, h, prm, nid):
    """Dimensional Value Multiplier (1D Rate x 2D Week x 3D Cohort x 4D 09-Aging Rings = $400,000 Ingot + 10x Stack)."""
    terms, result, after = prm["terms"], prm["result"], prm.get("after", "")
    P.meta(
        "Cohort Unit Economics · $25/h × 40 h/wk × 8 people × 50 wk = $400,000",
        "Four tactile instrument tiles encode hourly rate, 5-day studio rhythm, 8 paired engineers, and 50 weeks of off-centre "
        "tree-ring accumulation (09-aging), compounding into a 3D vermilion & sunflower ingot and 10-cohort stack."
    )
    pad, op = 12, 24
    tws = [P.tw(t, "num") + pad * 2 for t in terms]
    rw = P.tw(result, "num") + pad * 2 + 6
    stack_w = 24
    total = sum(tws) + op * len(terms) + rw + stack_w
    x = max(w / 2 - total / 2, 6)
    bh = 48
    y = h * 0.36 - bh / 2
    x_start = x

    # Z=0: Continuous Horizontal Sunflower Computation Bus
    with P.layer(z=0, seq=0, cls="eq-bus"):
        bus_y = y + bh / 2
        P.line(x_start + 8, bus_y, x_start + total - stack_w - 8, bus_y, stroke="sunflower", sw="glyph")

    # Z=1: Four 2.5D Instrument Modules with Glaserian Micro-Metaphors
    for i, (t, tw_) in enumerate(zip(terms, tws)):
        with P.layer(z=1, seq=i + 1, cls=f"eq-term-{i}"):
            P.plinth(x, y, tw_, bh, rx=8, dx=2.5, dy=3.5, fill="elev", side="shadow", stroke="line", sw="frame")
            hy = y + 9
            cx_m = x + tw_ / 2
            if i == 0:
                P.circle(cx_m - 12, hy, 3.8, fill="sunflower", stroke="line", sw="hair")
                P.line(cx_m - 5, hy, cx_m + 14, hy, stroke="accent", sw="hair", dash="2 2")
            elif i == 1:
                for d_i in range(5):
                    P.rect(cx_m - 22 + d_i * 9, hy - 2.5, 6.5, 5.0, rx=1,
                           fill="sunflower" if d_i == 4 else "actor-a-tint", stroke="actor-a", sw="hair")
            elif i == 2:
                for p_i in range(8):
                    P.circle(cx_m - 24.5 + p_i * 7, hy, 2.2, fill="actor-b" if p_i % 2 else "actor-a", stroke="line", sw="hair")
            else:
                P.tree_rings(cx_m - 15, hy, 4.4, n_rings=2, stroke="forest")
                P.rect(cx_m - 6, hy - 2.2, 26, 4.4, rx=2.2, fill="forest-tint", stroke="forest", sw="hair")
                P.rect(cx_m - 6, hy - 2.2, 22, 4.4, rx=2.2, fill="forest", stroke=None)

            P.line(x + 6, y + 16, x + tw_ - 6, y + 16, stroke="grid", sw="hair")
            P.text(x + tw_ / 2, y + bh - 11, t, role="num", anchor="middle", src=nid)
            x += tw_
            last_op = "=" if result.startswith("=") else "≈"
            P.circle(x + op / 2, y + bh / 2, 8.5, fill="sunflower-tint", stroke="line", sw="hair")
            P.text(x + op / 2, y + bh / 2 + 5.5, "×" if i < len(terms) - 1 else last_op,
                   role="num", anchor="middle", fill="ink", src=nid)
            x += op

    # Z=2: 3D Extruded Profit Ingot ($400,000) + 10-Cohort Compounding Stack
    with P.layer(z=2, seq=len(terms) + 1, cls="eq-result"):
        P.iso_block(x, y - 3, rw, bh + 6, ex=6.5, ey=-5.5, front="accent", top="sunflower", side="accent-deep",
                    stroke="line", sw="glyph")
        P.text(x + rw / 2, y + bh / 2 + 6, result.replace("≈ ", "").replace("= ", ""),
               role="num", anchor="middle", fill="ground", src=nid, cls="t-strong")
        sx = x + rw + 10
        sy_bot = y + bh + 3
        sh_tot = bh + 6
        for k in range(10):
            ly = sy_bot - (k + 1) * (sh_tot / 10)
            P.rect(sx, ly, 12, (sh_tot / 10) - 1.2, rx=1,
                   fill="accent" if k == 0 else ("sunflower" if k == 9 else "actor-b-tint"), stroke="line", sw="hair")

    # Z=3: Synthesis Annotation with Sunflower Sparks
    with P.layer(z=3, seq=len(terms) + 2, cls="eq-after"):
        if after:
            ay = y + bh + 34
            mid_x = (x_start + x + rw + stack_w) / 2
            tw_a = P.tw(after, "hand")
            P.affection_spark(mid_x - tw_a / 2 - 12, ay - 6, r=3.6, fill="sunflower", stroke="line")
            P.affection_spark(mid_x + tw_a / 2 + 12, ay - 6, r=3.6, fill="sunflower", stroke="line")
            P.text(mid_x, ay, after, role="hand", anchor="middle", fill="ink", src=nid)

    return (x_start, y - 9, x + rw + stack_w, y + bh + 40)


def balance(P, w, h, prm, nid):
    """Precision Torsion Scale (08-Doubt) vs. High-Leverage Catalyst Cell with 18° Rotated Core (06-Style).
    Strictly bounded within (0, 0, w, h) for 0.0px layout spill.
    """
    L, R, pod = prm.get("left", 8), prm.get("right", 8), prm.get("pod", 3)
    note = prm.get("note", "")
    P.meta(
        "The Ratio Question · 8 : 8 Parity vs. 8 : 2–4 Catalyst Pod",
        "Above the tilted 8:8 scale sits Glaser's 08-Doubt question hinge, while on the right a rotated 18° square core (06-style) "
        "energizes 8 client engineers with just 2–4 Pursuit catalysts."
    )
    ah = h - 28
    bx0, bx1 = w * 0.06, w * 0.58
    beam_y = max(ah * 0.44, 52.0)
    cx = (bx0 + bx1) / 2
    tilt = prm.get("tilt", 7)
    ang_deg = math.degrees(math.atan2(tilt, (bx1 - bx0) / 2))

    # Z=0: Stepped Fulcrum Pedestal, Upper Protractor Dial Arc & Catalyst Reactor Dish with 18° Rotated Square (06-style)
    with P.layer(z=0, seq=0, cls="balance-base"):
        P.path(f"M{cx - 14:.1f},{beam_y:.1f} A14,14 0 0,0 {cx + 14:.1f},{beam_y:.1f}",
               fill="sunflower-tint", stroke="line", sw="hair", dash="2 2")
        P.line(cx, beam_y - 12, cx, ah * 0.90, stroke="accent", sw="hair", dash="2 2")
        P.polygon([(cx, beam_y), (cx - 15, ah * 0.90), (cx + 15, ah * 0.90)],
                  fill="soft", stroke="line", sw="frame")
        P.rect(cx - 22, ah * 0.90, 44, 5.5, rx=2, fill="shadow", stroke="line", sw="frame")

        # Right side: High-Leverage Catalyst Cell Dish + Glaser 06-Style 18° Rotated Square
        px, py = w * 0.81, ah * 0.54
        pr = min(w * 0.145, ah * 0.39)
        P.circle(px + 2.5, py + 3.0, pr, fill="shadow", stroke=None)
        P.circle(px, py, pr, fill="elev", stroke="line", sw="frame", dash="5 3.5")
        sq = pr * 0.62
        P.raw(f'<g transform="rotate(18 {px:.1f} {py:.1f})">')
        P.rect(px - sq / 2, py - sq / 2, sq, sq, rx=3.5, fill="sunflower-tint", stroke="actor-b", sw="hair")
        P.raw("</g>")

    # Z=1: Tilted Torsion Beam & Snugly-Seated Scale Pans (8 : 8)
    with P.layer(z=1, seq=1, cls="balance-beam"):
        P.raw(f'<g transform="rotate({ang_deg:.2f} {cx:.1f} {beam_y:.1f})">')
        P.rect(bx0, beam_y - 2.2, bx1 - bx0, 4.4, rx=2, fill="elev", stroke="line", sw="frame")
        P.circle(cx, beam_y, 4.4, fill="sunflower", stroke="line", sw="frame")
        dot = min((bx1 - bx0) / 2 / 5.4, 8.0)
        for side, cnt, role in ((bx0 + (cx - bx0) * 0.38, L, "actor-a"), (cx + (bx1 - cx) * 0.62, R, "actor-b")):
            P.line(side - 22, beam_y + 2, side - 24, beam_y + 18, stroke="line", sw="hair")
            P.line(side + 22, beam_y + 2, side + 24, beam_y + 18, stroke="line", sw="hair")
            P.path(f"M{side - 29:.1f},{beam_y + 18:.1f} Q{side:.1f},{beam_y + 31:.1f} {side + 29:.1f},{beam_y + 18:.1f} Z",
                   fill="panel", stroke="line", sw="frame")
            for i in range(cnt):
                r_, c_ = divmod(i, 4)
                P.circle(side - 1.5 * dot * 1.06 + c_ * dot * 1.06,
                         beam_y + 15.0 - r_ * dot * 0.98,
                         dot * 0.46, fill=role, stroke="line", sw="hair")
        P.raw("</g>")

    # Z=2: Molecular Catalyst Pod (8 Client Trainees in Orbital Shell around 2-4 Pursuit Core Catalysts)
    with P.layer(z=2, seq=2, cls="balance-pod"):
        pod_left = prm.get("pod_left", 8)
        ring_r = pr * 0.70
        node_r = pr * 0.125
        for i in range(pod_left):
            ang = 2 * math.pi * i / max(pod_left, 1) - math.pi / 2
            ox = px + ring_r * math.cos(ang)
            oy = py + ring_r * math.sin(ang)
            P.line(px, py, ox, oy, stroke="grid", sw="hair")
        for i in range(pod_left):
            ang = 2 * math.pi * i / max(pod_left, 1) - math.pi / 2
            ox = px + ring_r * math.cos(ang)
            oy = py + ring_r * math.sin(ang)
            P.circle(ox, oy, node_r, fill="actor-a", stroke="line", sw="hair")
        core_r = pr * 0.22
        for i in range(4):
            ang = math.pi / 4 + i * math.pi / 2
            nx = px + core_r * math.cos(ang)
            ny = py + core_r * math.sin(ang)
            if i < 2:
                P.circle(nx, ny, node_r * 1.05, fill="actor-b", stroke="line", sw="hair")
            else:
                P.circle(nx, ny, node_r * 1.05, fill="sunflower-tint", stroke="actor-b", sw="hair", dash="2 1.5")
        P.affection_spark(px, py, r=3.5, fill="sunflower", stroke="line")

    # Z=3: Cleanly Offset Tension Callout & Grounded Notes
    with P.layer(z=3, seq=3, cls="balance-notes"):
        P.circle(cx - 11, beam_y - 26, 4.0, fill="sunflower-tint", stroke="actor-a", sw="hair", dash="2 2")
        P.text(cx, beam_y - 21, "?", role="title", anchor="middle", fill="accent", src=nid)
        note_y = h - 11
        if prm.get("note_left"):
            P.text(cx, note_y, prm["note_left"], role="hand", anchor="middle", fill="ink", src=nid)
        if prm.get("note_right"):
            P.text(px, note_y, prm["note_right"], role="hand", anchor="middle", fill="ink", src=nid)
        if note:
            P.text(w / 2, note_y, note, role="hand", anchor="middle", fill="ink", src=nid)

    return (bx0 - 6, 8, px + pr + 4, h - 4)


def venn(P, w, h, prm, nid):
    """The Resonance Crucible Lens (12-Ambiguity × 11-Wow) — Vesica Piscis Interference of Staffing & Training."""
    P.meta(
        f"{prm['mid']} · {prm['a']} × {prm['b']}",
        "Two warm lenses—cobalt staffing and amber training—intersect in a sunflower-lit crucible whose outer resonance arc "
        "crests above the frame. Embodies Glaser's 11-Wow and 12-Ambiguity: one shared form with two readings."
    )
    r = min((h - 26) * 0.45, w * 0.17)
    cx, cy = w / 2, r + 6
    off = r * 0.54
    lx, rx = cx - off, cx + off

    # Z=0: Optical Axis, Lens Drop Shadows & 11-Wow Outer Resonance Arc
    with P.layer(z=0, seq=0, cls="venn-base"):
        P.line(lx - r - 14, cy, rx + r + 14, cy, stroke="grid", sw="hair", dash="2 3")
        P.circle(lx + 2, cy + 2.5, r, fill="shadow", stroke=None, extra="fill-opacity:0.35")
        P.circle(rx + 2, cy + 2.5, r, fill="shadow", stroke=None, extra="fill-opacity:0.35")
        P.path(f"M{lx - 3:.1f},{cy - r * 0.52:.1f} A{r * 1.12:.1f},{r * 0.90:.1f} 0 0,1 {rx + 3:.1f},{cy - r * 0.52:.1f}",
               fill=None, stroke="sunflower", sw="hair", dash="2 3.5")

    # Z=1: Left Lens (Staffing Capacity) & Right Lens (Training Craft)
    with P.layer(z=1, seq=1, cls="venn-lenses"):
        P.circle(lx, cy, r, fill="actor-a-tint", stroke="actor-a", sw="edge", extra="fill-opacity:0.40")
        P.circle(lx, cy, r * 0.74, fill=None, stroke="actor-a", sw="hair", dash="3 3")
        P.circle(rx, cy, r, fill="actor-b-tint", stroke="actor-b", sw="edge", extra="fill-opacity:0.40")
        P.circle(rx, cy, r * 0.74, fill=None, stroke="actor-b", sw="hair", dash="3 3")
        for k in range(5):
            ang_l = math.pi * (0.65 + 0.70 * k / 4)
            P.line(lx + r * math.cos(ang_l), cy + r * math.sin(ang_l),
                   lx + (r + 4.0) * math.cos(ang_l), cy + (r + 4.0) * math.sin(ang_l), stroke="actor-a", sw="hair")
            ang_r = math.pi * (-0.35 + 0.70 * k / 4)
            P.line(rx + r * math.cos(ang_r), cy + r * math.sin(ang_r),
                   rx + (r + 4.0) * math.cos(ang_r), cy + (r + 4.0) * math.sin(ang_r), stroke="actor-b", sw="hair")

    # Z=2: Vesica Piscis Crucible Intersection & Sunflower Affection Sparks
    vy = math.sqrt(max(r * r - off * off, 1.0))
    with P.layer(z=2, seq=2, cls="venn-crucible"):
        d_vesica = (f"M{cx:.1f},{cy - vy:.1f} "
                    f"A{r:.1f},{r:.1f} 0 0,1 {cx:.1f},{cy + vy:.1f} "
                    f"A{r:.1f},{r:.1f} 0 0,1 {cx:.1f},{cy - vy:.1f} Z")
        P.path(d_vesica, fill="sunflower-tint", stroke="accent", sw="frame")
        P.affection_spark(cx, cy - vy * 0.62, r=3.2, fill="sunflower", stroke="accent")
        P.affection_spark(cx, cy + vy * 0.62, r=3.2, fill="sunflower", stroke="accent")

    # Z=3: Crucible Core Badge & Widely-Separated Labels with Pointer Ticks
    with P.layer(z=3, seq=3, cls="venn-labels"):
        bw = P.tw(prm["mid"], "caption") + 12
        bh = 20
        P.rect(cx - bw / 2, cy - bh / 2, bw, bh, rx=10, fill="elev", stroke="accent", sw="hair")
        lab_lx = lx - r * 0.46
        lab_rx = rx + r * 0.46
        P.line(lab_lx, cy + r - 1, lab_lx, cy + r + 5, stroke="actor-a", sw="hair")
        P.line(lab_rx, cy + r - 1, lab_rx, cy + r + 5, stroke="actor-b", sw="hair")
        P.text(lab_lx, cy + r + 17, prm["a"], role="tick", anchor="middle", fill="ink", src=nid)
        P.text(lab_rx, cy + r + 17, prm["b"], role="tick", anchor="middle", fill="ink", src=nid)
        P.text(cx, cy + 5, prm["mid"], role="caption", anchor="middle", fill="accent", src=nid, cls="t-strong")

    return (lx - r - 14, cy - r - 2, rx + r + 14, cy + r + 20)


GLYPHS = {"crowd": crowd, "gate": gate, "cohort": cohort, "contract": contract, "taper": taper,
          "fork": fork, "equation": equation, "balance": balance, "venn": venn}
