#!/usr/bin/env python3
"""Chain harness: execute an atomized artifact build under gates and checkpoints.

Artifact-agnostic. Supply two things and the rest is handled:

  atomize(spec)        -> list of atoms  (one decision each, with typed ports)
  apply_atom(state, a) -> mutate live state

Everything else — type checking, red flags, batching, snapshot-before-ledger,
invariant gates, hash-verified cold resume — is here.

    python chain.py compile     # Phase A: atomize + type check, no execution
    python chain.py run         # Phase A then Phase B
    python chain.py kill 337    # deliberate mid-batch kill (the drill)
    python chain.py resume      # cold resume from ledger + snapshot

The kill drill is not optional. A resume path that has never been exercised does
not work — the first implementation of this harness crashed on resume because
the snapshot carried the work product but not the worker's cursor.
"""
import hashlib, json, os, shutil, sys, time

RUN = "run"
BATCH = 50
GATE_EVERY = 2        # in batches; 2 halves detection latency vs 4, near-free
R_MAX = 12
TOKEN_CAP = 750

# --------------------------------------------------------------- adapt these
PORTS = {
    # "OP_NAME": (in_colour, out_colour)
}


def atomize(spec):
    """Return [{id, op, target, args, tau, in_color, out_color}, ...].

    One decision per atom. If describing it needs 'and', split it.
    """
    raise NotImplementedError


def new_state():
    """Container for whatever the build mutates (open documents, cursors)."""
    raise NotImplementedError


def apply_atom(state, atom):
    """Apply exactly one atom to live state."""
    raise NotImplementedError


def save_state(state, directory):
    """Persist every artifact under `directory`; return {name: path}."""
    raise NotImplementedError


def load_state(paths):
    """Rebuild state from persisted artifacts.

    Must also reconstruct the worker's CURSOR — current section, its layout,
    which fields already hold content. Derive it from the artifact rather than
    carrying it, so the artifact stays the single source of truth.
    """
    raise NotImplementedError


def invariants(state):
    """Cheap, oracle-free observables recomputable from state alone.

    Good: element counts, zero-size shapes, sub-minimum font sizes, missing alt
    text, forbidden terms. Bad: anything needing judgment.
    Return {scope: {name: value}}; non-zero on a defect counter means HALT.
    """
    raise NotImplementedError


# --------------------------------------------------------------- generic below
def type_check(atoms):
    errs, prev = [], {}
    for a in atoms:
        if a["op"] not in PORTS:
            errs.append(f"{a['id']}: unknown op {a['op']}")
            continue
        want, have = a["in_color"], prev.get(a["target"], "Spec")
        if want != have:
            errs.append(f"{a['id']}: in_color {want} != upstream {have}")
        prev[a["target"]] = a["out_color"]
    return errs


def red_flag(atom):
    txt = atom["args"].get("text")
    if txt is not None:
        if not isinstance(txt, str):
            return "malformed"
        if len(txt) > TOKEN_CAP:
            return "overlong"
        if not txt.strip() and atom["op"].startswith(("SET_", "ADD_")):
            return "malformed"
    return None


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()[:16]


def snapshot(state, bno):
    d = f"{RUN}/state/{bno:04d}"
    os.makedirs(d, exist_ok=True)
    paths = save_state(state, d)
    hashes = {k: sha(v) for k, v in paths.items()}
    json.dump(hashes, open(f"{d}/hashes.json", "w"), indent=1)
    return d, hashes


def ledger_append(row):
    with open(f"{RUN}/run-ledger.jsonl", "a") as f:
        f.write(json.dumps(row) + "\n")


def ledger_tail():
    p = f"{RUN}/run-ledger.jsonl"
    if not os.path.exists(p):
        return None
    rows = [json.loads(l) for l in open(p) if l.strip()]
    return rows[-1] if rows else None


def gate(level, scope, state, atoms_done):
    inv = invariants(state)
    fails = [f"{s}: {k}={v}" for s, d in inv.items() for k, v in d.items()
             if k != "count" and v]
    verdict = "PROCEED" if not fails else "HALT"
    os.makedirs(f"{RUN}/gates", exist_ok=True)
    json.dump(dict(level=level, scope=scope, verdict=verdict, failing=fails,
                   invariants=inv, atoms_done=atoms_done),
              open(f"{RUN}/gates/gate-{scope}.json", "w"), indent=1)
    return verdict, fails


def execute(atoms, kill_at=None, resume=False):
    state, start = None, 0
    if resume:
        tail = ledger_tail()
        if tail is None:
            print("resume requested but ledger is empty")
            return
        snap = tail["state_ref"]
        hashes = json.load(open(f"{snap}/hashes.json"))
        for name, h in hashes.items():
            if sha(f"{snap}/{name}") != h:
                print(f"HASH MISMATCH on {name} — fall back one checkpoint")
                return
        state = load_state({n: f"{snap}/{n}" for n in hashes})
        start = tail["atoms_done"]
        print(f"RESUMED from {snap} at atom {start} (hashes verified)")
    else:
        state = new_state()

    stats = dict(redflags=0, max_rounds=0, gates=0)
    bno, t0 = start // BATCH, time.time()

    for i in range(start, len(atoms)):
        a, rounds = atoms[i], 0
        while True:
            rounds += 1
            if rounds > R_MAX:
                print(f"R_MAX on {a['id']} — systematic, not bad luck. Stopping.")
                return
            flag = red_flag(a)
            if flag:                      # discard and re-derive, NEVER repair
                stats["redflags"] += 1
                print(f"  red-flag {flag} on {a['id']} — discard")
                continue
            apply_atom(state, a)
            break
        stats["max_rounds"] = max(stats["max_rounds"], rounds)

        done = i + 1
        if done % BATCH == 0 or done == len(atoms):
            bno += 1
            if kill_at is not None and done >= kill_at:
                print(f"*** SIMULATED KILL at atom {done} (batch {bno} discarded) ***")
                return
            snap, hashes = snapshot(state, bno)          # snapshot FIRST
            g = None
            if bno % GATE_EVERY == 0 or done == len(atoms):
                scope = f"L2-b{bno}" if done != len(atoms) else "posthoc"
                v, fails = gate("L2", scope, state, done)
                stats["gates"] += 1
                g = dict(scope=scope, verdict=v)
                if v != "PROCEED":
                    ledger_append(dict(batch=bno, atoms_done=done, state_ref=snap,
                                       hashes=hashes, gate=g, **stats))
                    print("GATE HALT:", fails)
                    return
            ledger_append(dict(batch=bno, atoms_done=done, state_ref=snap,
                               hashes=hashes, gate=g,
                               elapsed=round(time.time() - t0, 1), **stats))
            print(f"  batch {bno:>3}  atoms {done:>4}/{len(atoms)}  {snap}  "
                  f"gate {g['verdict'] if g else '-'}")
    print("RUN COMPLETE", stats)
    return state


def main(spec=None):
    mode = sys.argv[1] if len(sys.argv) > 1 else "run"
    atoms = atomize(spec)
    if mode == "compile":
        os.makedirs(RUN, exist_ok=True)
        errs = type_check(atoms)
        json.dump(atoms, open(f"{RUN}/atoms.json", "w"), indent=1)
        print(f"s = {len(atoms)} micro-steps")
        print("type_check:", "well_typed" if not errs else errs[:5])
        ops = {}
        for a in atoms:
            ops[a["op"]] = ops.get(a["op"], 0) + 1
        for k, v in sorted(ops.items(), key=lambda x: -x[1]):
            print(f"   {k:<14} {v}")
    elif mode in ("run", "kill"):
        shutil.rmtree(RUN, ignore_errors=True)
        os.makedirs(RUN, exist_ok=True)
        errs = type_check(atoms)
        if errs:
            print("L0 pre-flight FAILED:", errs[:5])
            return
        print("L0 pre-flight: well_typed")
        execute(atoms, kill_at=int(sys.argv[2]) if mode == "kill" else None)
    elif mode == "resume":
        execute(atoms, resume=True)


if __name__ == "__main__":
    main()
