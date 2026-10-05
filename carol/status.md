---
# Page settings
layout: default

# Hero section
title: Status & handoffs
description: "The initiative map: phases, zurdo run state, row conflicts, and whether the last handoff still holds."

# Page navigation
page_nav:
    prev:
        content: GitHub sync
        url: '/carol/github-sync.html'
    next:
        content: Triage & scoring
        url: '/carol/triage.html'
---

`carol status` answers "where does this initiative stand?" from the files alone. It reads `scope.md`, the tickets, zurdo's run state, and git. It never contacts GitHub and never writes anything, so it's safe to run while `zurdo run` is going, from a fresh clone, or at the start of every session.

## `carol status`

```sh
carol status [initiative] [--format json]
```

With no argument, Carol uses the only initiative under `docs/`. If there are several, it lists them and asks you to name one (exit 2).

```text
$ carol status billing
Status — Billing (docs/billing/)
Destination: Customers get itemised invoices and self-serve refunds.

  phase-01  Invoices  done  prd-01-invoices.md  settled: 7 passed · 0 pending-review · 0 failed · 0 blocked
  phase-02  Refunds  running  prd-02-refunds.md  in flight
  phase-03  Dunning  researching  —  no run
Row conflict: phase-03 researching-unblocked

Handoff: stale — committed 4e1a9c2, stopped_at 2026-10-05T18:40:00Z.
Since the handoff:
  9b03f7d  Resolve tax-rules ticket
  run prd-02-refunds-3f1d (phase-02) at 2026-10-05T21:12:44Z
Uncommitted:
   M docs/billing/scope.md
```

### Run state

Each phase with a PRD is matched to its entry in `zurdo state list --format json`. The state column uses zurdo's word for the run, put in initiative terms:

| zurdo `state list` | `carol status` | Meaning |
|---|---|---|
| no entry | `no run` | The PRD hasn't been run |
| `active` | `in flight` | `zurdo run` holds the lock right now |
| `clean` | `settled` + tally | The run finished. The tally counts passed, pending-review, failed, and blocked-by-dependency tasks. |
| `stale` | `crashed` | A lock was left by a run that died. [Resume it](../docs/usage.md) with `zurdo run`. |

A settled tally with failures is the signal for [Diagnosis & lessons](../docs/reason.md) or a rescope. A pending-review count means a [`zurdo review`](../docs/usage.md#reviewing-a-run-with-zurdo-review) is waiting on you.

### Row conflicts

A **row conflict** is a Phases row whose status contradicts its tickets. Carol reports conflicts but doesn't fix them, because the status in `scope.md` is your call.

| Kind | The row says… | …but |
|---|---|---|
| `researching-unblocked` | `researching` | Every ticket that blocks it is resolved, so it may be `ready` |
| `ready-blocked` | `ready` | A ticket that blocks it is still open |

### Handoff freshness

If the initiative has a [`handoff.md`](initiatives.md#the-handoff), Carol checks whether the work has moved on since it was written:

- **`fresh`**: no commit has touched the initiative's directory since the commit that last changed the handoff, and no phase's PRD has run since its `stopped_at`.
- **`stale`**: something moved, and Carol lists the commits and runs. The handoff's open questions and in-flight work are still worth reading, but work out its station and next action again from the files.
- **`none`**: no handoff exists. That's normal before a session first stops.

`Uncommitted` lists `git status --short`, so a session can see work it hasn't committed yet.

### JSON for agents

`--format json` prints one envelope, `{"schema_version": 1, "command": "status", "data": {…}}`. `data` holds `phases[]` (each with its `run`), `tickets[]` (type, question, status, blocks), `row_conflicts[]`, `tree.dirty`, and `handoff` (verdict, commit, station, phase, and the `since` and `runs_after` lists). Agent skills read this to orient a new session before acting, the same way they read zurdo's [JSON envelope](../docs/commands.md).

## `carol handoff check`

```sh
carol handoff check docs/billing/handoff.md [--format json]
```

Validates the handoff's structure, not its content, and doesn't compare it with the tree (`status` does that). With no findings it prints `<path>: ok` and exits 0. Otherwise each finding goes to stderr as `<line>: <rule>: <message>`, and the command exits 2.

| Rule | Checks |
|---|---|
| `frontmatter` | Opens with `---` frontmatter and has exactly the keys `initiative`, `stopped_at`, `station`, `phase`, `by`, with no unknown or duplicate keys |
| `initiative` | Matches the handoff's directory name |
| `stopped-at` | UTC ISO-8601 to the second, for example `2026-10-05T18:40:00Z` |
| `station` | One of `scope`, `research`, `phase-prd`, `publish`, `run-and-sync`, `phase-review` |
| `phase` | Appears in the sibling `scope.md` Phases table |
| `by` | `agent` or `user` |
| `title` | `# Handoff: <initiative title>` |
| `sections` | The seven sections, in order, with no others |
| `empty-section` | Every section has text. Write `None.` when there's nothing to say. |
| `next-action` | Exactly one `Row <n> — <action>` line |

Run it as the last step before committing a handoff, so the next session can trust the file's structure.

Next: [Triage & scoring](triage.md)
