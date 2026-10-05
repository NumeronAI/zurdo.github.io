---
# Page settings
layout: default

# Hero section
title: Initiatives
description: "scope.md, tickets, PRDs, and the handoff — the planning files Carol reads."

# Page navigation
page_nav:
    prev:
        content: Installation
        url: '/carol/installation.html'
    next:
        content: GitHub sync
        url: '/carol/github-sync.html'
---

A zurdo PRD covers one run's worth of work. Anything bigger is an **initiative**: a body of work with one destination, split into **phases** that each deliver one PRD. Carol reads an initiative from a directory of plain Markdown files, and it never writes to them.

## Layout

```text
docs/
└── billing/                    # the initiative; its name is the directory name
    ├── scope.md                # destination, decisions, and the Phases table
    ├── tickets/
    │   ├── tax-rules.md        # a research question
    │   └── refund-policy.md    # a grilling question for a human
    ├── prds/
    │   ├── prd-01-invoices.md  # a zurdo PRD, one per phase
    │   └── prd-02-refunds.md
    └── handoff.md              # where the last session stopped (optional)
```

Initiatives live under `docs/` by default. Set [`[paths] initiatives`](commands.md#configuration) to use another directory. Carol finds an initiative by looking for `<dir>/<name>/scope.md`.

A PRD under `docs/<initiative>/prds/` belongs to that initiative. `carol publish` uses this to link the epic to the scope issue, and `carol board` uses it to put the PRD on the initiative's board. A PRD stored anywhere else still works, but you pass `--scope` and `--project` yourself.

## `scope.md`

```markdown
# Scope: Billing

## Destination

Customers get itemised invoices and self-serve refunds. Done when …

## Notes

- Payments go through the existing Stripe account.

## Decisions so far

- Invoices are generated on the server, never in the browser.

## Phases

| Phase | Title | PRD | Status |
|-------|-------|-----|--------|
| phase-01 | Invoices | docs/billing/prds/prd-01-invoices.md | done |
| phase-02 | Refunds | docs/billing/prds/prd-02-refunds.md | running |
| phase-03 | Dunning | | researching |

## Not yet specified

- Whether refunds over $500 need a second approver.

## Out of scope

- Multi-currency.
```

| Part | Rule |
|---|---|
| `# Scope: <title>` | Required. The title names the scope issue and the initiative's Projects board. |
| `## Destination` | The first sentence is what `carol status` prints as the initiative's one-line summary |
| `## Notes`, `## Decisions so far`, `## Not yet specified`, `## Out of scope` | Copied into the scope issue's body. Any other `##` section stays local. |
| `## Phases` | One row per phase: id, title, PRD path (empty until it's written), and status |
| Phase status | `planned`, `researching`, `ready`, `running`, or `done`. Anything else is a parse error (exit 2). |

The phase status is your judgment of where the phase stands. Carol doesn't change it, but [`carol status`](status.md#row-conflicts) flags a row whose status disagrees with its tickets.

## Tickets

A ticket is a question that must be answered before a phase can be specified. There are two kinds. A **research** ticket can be answered by reading code or docs, by you or by an agent. A **grilling** ticket needs a decision from a human.

```markdown
---
type: research
question: Which tax rules apply to EU invoices issued from the US entity?
status: open
blocks: [phase-03]
blocked-by: []
---

## Question

What we need to know, and what an answer must include.

## Findings

Filled in when the ticket is resolved.
```

| Key | Values |
|---|---|
| `type` | `research` or `grilling` |
| `question` | One line. It becomes the issue title. |
| `status` | `open` or `resolved` |
| `blocks` | Phase ids this ticket blocks |
| `blocked-by` | Names (file names without `.md`) of tickets that must be resolved first |

The ticket's name is its file name. The `## Findings` section is published only after the ticket is `resolved`. The next `carol ticket` or `carol scope` then posts the findings as a comment and closes the issue, once.

## PRDs

An initiative's PRDs are ordinary zurdo PRDs. Write them with the same [grammar](../docs/writing-prds.md) and the `zurdo-prd-author` skill, and check them with `zurdo validate` before publishing. Carol parses the PRD itself to build the epic and task issues. It uses the task id, title, description, acceptance criteria and hints, and the `Effort`, `Depends-on`, `Skills`, `Max-Attempts`, and `Agent-timeout` metadata. A PRD that Carol can't parse is a usage error (exit 2) before anything is planned, so a malformed PRD can never be half-published.

## The handoff

`handoff.md` is the one file a session leaves behind when it stops before the initiative is finished. It records where things stand and names one next action. It's a hint about the state of the work, not a store for anything durable: decisions belong in `scope.md`, and run outcomes belong in zurdo's run state.

```markdown
---
initiative: billing
stopped_at: 2026-10-05T18:40:00Z
station: run-and-sync
phase: phase-02
by: agent
---

# Handoff: Billing

## Stopped at
## Done this session
## In flight
## Waiting on a human
## Next action
## Uncommitted
## Watch out
```

All seven sections are required, in this order. A section with nothing to say holds `None.`, and `## Next action` holds exactly one action.

The **station** is the kind of work due next. It doesn't measure progress.

| Station | The next work is… |
|---|---|
| `scope` | Shaping or revising `scope.md` |
| `research` | Answering open tickets |
| `phase-prd` | Writing the PRD for a `ready` phase |
| `publish` | `carol publish` and `carol board` |
| `run-and-sync` | `zurdo run`, then `carol sync` |
| `phase-review` | `zurdo report`, `zurdo review`, and deciding what's next |

[`carol handoff check`](status.md#carol-handoff-check) validates the file's structure, and [`carol status`](status.md#handoff-freshness) tells you whether the work has moved on since it was written.

Next: [GitHub sync](github-sync.md)
