---
# Page settings
layout: default

# Hero section
title: GitHub sync
description: "Plan, apply, markers, and how zurdo's run state lands on issues and the board."

# Page navigation
page_nav:
    prev:
        content: Initiatives
        url: '/carol/initiatives.html'
    next:
        content: Status & handoffs
        url: '/carol/status.html'
---

Six commands project an initiative onto GitHub. Together they mirror the [PRD loop](../docs/workflow.md): `scope` and `ticket` before a PRD exists, `publish` and `board` once it's written, and `sync` after `zurdo run`.

| What exists on GitHub | Made by | From |
|---|---|---|
| The label vocabulary | `carol bootstrap` | Carol's built-in list |
| A pinned **scope issue**, plus a Projects board named after the initiative | `carol scope` | `scope.md` |
| One issue per ticket, under the scope issue | `carol ticket` (and `carol scope`) | `tickets/*.md` |
| A **milestone**, an **epic** issue, and one **task** issue per PRD task | `carol publish` | The PRD |
| The PRD's issues as cards on the board, with a Status | `carol board` | The PRD and `zurdo report` |
| Outcome comments, labels, closed tasks, and the epic's status table | `carol sync` | `zurdo report` |

## Plan, then apply

Every command here computes one plan from a single snapshot of the repository, prints it, and stops:

```text
$ carol sync docs/billing/prds/prd-01-invoices.md
sync: acme/shop (3 ops)
  add_issue_labels zurdo:failed [<!-- zurdo-github prd=docs/billing/prds/prd-01-invoices.md task=task-03 -->]
  add_comment [<!-- zurdo-github prd=docs/billing/prds/prd-01-invoices.md task=task-03 -->]
  set_issue_body [<!-- zurdo-github prd=docs/billing/prds/prd-01-invoices.md epic -->]
```

Add `--apply` to run the same plan, not a recomputed one: what you read is what gets written. After each write Carol reads the item back. If a field didn't stick, Carol stops with exit 5 and names the field. Add `--format json` to get the plan as one envelope (`{"schema_version": 1, "command": …, "data": {"repo": …, "ops": […]}}`) for scripts and agents. A plan with nothing to do is `0 ops`, which exits 0.

`carol plan` and `carol apply` do the same for several files at once. Each file's mode comes from its path: `scope.md` is planned as `scope`, a file under `tickets/` as `ticket`, and any other `.md` as `publish`. An op that two files both plan appears only once. `carol apply` asks `apply N ops? [y/N]` when run in a terminal, unless you pass `--yes`.

```sh
carol plan  docs/billing/scope.md docs/billing/prds/prd-02-refunds.md
carol apply docs/billing/scope.md docs/billing/prds/prd-02-refunds.md
```

## Markers

Each issue Carol creates carries a hidden HTML comment in its body that identifies it:

| Issue | Marker |
|---|---|
| Scope | `<!-- zurdo-github scope=billing -->` |
| Ticket | `<!-- zurdo-github scope=billing ticket=tax-rules -->` |
| Epic | `<!-- zurdo-github prd=docs/billing/prds/prd-01-invoices.md epic -->` |
| Task | `<!-- zurdo-github prd=docs/billing/prds/prd-01-invoices.md task=task-03 -->` |

The marker is the issue's identity, not its number or title. On a re-run, Carol finds the issue by its marker and plans only what changed. Renaming a task's title updates the existing issue. PRD paths in markers are repo-relative and normalised, so `./docs/x.md` and `docs/x.md` are the same PRD.

<div class="callout callout--warning" markdown="1">
Don't copy a marker into another issue. If two issues carry the same marker, Carol can't tell which one is real, so it refuses the plan with exit 4 and names the marker. Delete or edit the duplicate by hand, then re-run.
</div>

## `carol bootstrap`

Creates the base labels. If the repository has no description and no topics, `--about "<text>"` also sets the description.

| Label | Meaning |
|---|---|
| `zurdo:scope`, `zurdo:research`, `zurdo:grilling` | Scope and ticket issues |
| `zurdo:epic`, `zurdo:task` | A PRD's epic and its tasks |
| `zurdo:pending-review` | The task passed, but zurdo is waiting on a `[manual]` sign-off |
| `zurdo:failed` | The task failed in its last run |
| `ready-for-agent` | A task with no `Depends-on`, so an agent can start it now |
| `needs-triage`, `needs-info`, `ready-for-human`, `wontfix` | States for issues people file by hand. See [Triage](triage.md). |

`publish` adds an `effort:<tier>` label for each effort tier the PRD uses.

## `carol scope`

```sh
carol scope docs/billing/scope.md [--project "<board title>"] [--apply]
```

Creates or updates the scope issue and pins it the first time. The issue body carries the destination, notes, decisions, and open questions, plus the Phases table, which gains Epic and Milestone columns linking to what `publish` created. In the same plan, `scope`:

- processes every ticket in `tickets/` in file-name order, as `carol ticket` would;
- wires the graph: each published phase's epic becomes a sub-issue of the scope issue, each ticket's `blocked-by` becomes a `blocked by` edge, and a ticket that `blocks` a phase blocks that phase's epic. A phase with no epic yet is skipped with a `defer:` notice and wired on a later run;
- sets up the initiative's Projects board, named after the scope title unless you pass `--project`. It links the board to the repository, sets its description to the destination's first paragraph and its README to the scope issue's body, and adds the scope and ticket issues as cards.

## `carol ticket`

```sh
carol ticket docs/billing/tickets/tax-rules.md [--apply]
```

Creates or updates one ticket issue as a sub-issue of the scope issue. Edges between tickets need every ticket's issue number, so `carol scope` creates them. A `resolved` ticket gets its findings posted as a comment and is then closed. If the scope issue doesn't exist yet, Carol stops with exit 4 and tells you to run `scope` first.

## `carol publish`

```sh
carol publish docs/billing/prds/prd-01-invoices.md [--scope <issue number>] [--apply]
```

Publishes a PRD as:

- a **milestone** named after the PRD's title;
- an **epic** issue (`zurdo:epic`) that links to the scope issue and has a table of tasks with their Status;
- one **task** issue per `## Task:` (`zurdo:task`, `effort:<tier>`). Each body holds the description and the acceptance criteria as a checklist, with every [hint](../docs/hints.md) in backticks, so reviewers see exactly what zurdo will check. A task with no `Depends-on` also gets `ready-for-agent`.

Tasks become sub-issues of the epic, and each `Depends-on` becomes a `blocked by` edge, so GitHub shows the same dependency graph zurdo schedules. For a PRD under `docs/<initiative>/prds/`, Carol finds the scope issue itself, and you only need `--scope` for a PRD stored elsewhere. Re-publishing after you edit the PRD updates titles, bodies, and milestones in place, and keeps each task's Status cell in the epic.

## `carol board`

```sh
carol board docs/billing/prds/prd-01-invoices.md [--project "<board title>"] [--apply]
```

Adds the PRD's task issues to a Projects (v2) board and sets each card's Status from zurdo's run state. The default board is the initiative's (the `scope.md` title). Use `--project` to name another one. `board` adds the `Pending Review` and `Failed` Status options if the board doesn't have them. If no run has happened yet, every card is `Todo`.

This needs the `project` scope on your `gh` login. Without it, `board` exits 3 and tells you to run `gh auth refresh -s project`. The board is only a view: Carol writes it and never reads your plan back from it.

## `carol sync`

```sh
carol sync docs/billing/prds/prd-01-invoices.md [--apply]
```

Reads `zurdo report <prd> --format json`, and for each task with a result:

| zurdo task status | Label | Comment | Issue | Epic table / board |
|---|---|---|---|---|
| `passed` | removes `zurdo:pending-review`, `zurdo:failed` | Attempts, last model, tokens in and out, estimated cost | Closed | Done |
| `passed-pending-review` | `zurdo:pending-review` | Same as above | Stays open until you sign off in [`zurdo review`](../docs/usage.md#reviewing-a-run-with-zurdo-review) | Pending Review |
| `failed` | `zurdo:failed` | The failing criteria: the report's `failed_hints` | Stays open | Failed |
| `in_progress` | — | — | — | In Progress |

Each comment carries a marker naming the PRD, the task, and the run's `started_at`. Syncing the same run twice posts nothing new, and a new run posts once more. `sync` never removes `ready-for-agent` and never reopens a closed issue.

If the PRD has never been run, there's no report to read, so `sync` exits 6. Run `carol board` after `sync` to move the cards too.

```sh
zurdo run docs/billing/prds/prd-01-invoices.md
carol sync  docs/billing/prds/prd-01-invoices.md --apply
carol board docs/billing/prds/prd-01-invoices.md --apply
```

Next: [Status & handoffs](status.md)
