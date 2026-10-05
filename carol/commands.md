---
# Page settings
layout: default

# Hero section
title: Commands & configuration
description: "Every Carol command and flag, .carol/config.toml, environment variables, and exit codes."

# Page navigation
page_nav:
    prev:
        content: Triage & scoring
        url: '/carol/triage.html'
---

Run Carol from the repository root. `carol --help` and `carol <command> --help` print the same reference, and the man pages (`man carol-sync`, …) ship with every release.

## Commands

| Command | Writes? | Purpose |
|---|---|---|
| `carol doctor` | No | Check the `gh` login, the base labels, and that `zurdo` runs. [Details](installation.md#prerequisites) |
| `carol bootstrap [--about <text>]` | With `--apply` | Create the label vocabulary, and a description for an undescribed repo. [Details](github-sync.md#carol-bootstrap) |
| `carol scope <scope.md> [--project <title>]` | With `--apply` | Mirror an initiative's scope, its tickets, their edges, and its board. [Details](github-sync.md#carol-scope) |
| `carol ticket <ticket.md>` | With `--apply` | Mirror one ticket under its scope issue. [Details](github-sync.md#carol-ticket) |
| `carol publish <prd.md> [--scope <n>]` | With `--apply` | Publish a PRD as a milestone, an epic, and task issues. [Details](github-sync.md#carol-publish) |
| `carol board <prd.md> [--project <title>]` | With `--apply` | Put a PRD's tasks on a Projects board with their run Status. [Details](github-sync.md#carol-board) |
| `carol sync <prd.md>` | With `--apply` | Mirror zurdo's run outcome onto the task issues and the epic. [Details](github-sync.md#carol-sync) |
| `carol plan <file>…` | No | Show the combined plan for several planning files, with each file's mode inferred from its path. [Details](github-sync.md#plan-then-apply) |
| `carol apply <file>… [--yes]` | Yes | Apply that combined plan. Asks for confirmation in a terminal unless you pass `--yes`. |
| `carol status [initiative]` | No | The initiative map: phases, run state, row conflicts, handoff freshness. [Details](status.md#carol-status) |
| `carol handoff check <handoff.md>` | No | Validate a handoff file's structure. [Details](status.md#carol-handoff-check) |
| `carol triage` | With `--apply` | Label hand-filed issues by area and route them. [Details](triage.md#carol-triage) |
| `carol score --report` | No | Each run task's outcome beside its authoring warnings. [Details](triage.md#carol-score---report) |
| `carol completions <shell>` | No | Print a completion script for `bash`, `zsh`, `fish`, `elvish`, or `powershell` |

### Common flags

| Flag | Accepted by | Effect |
|---|---|---|
| `--apply` | `bootstrap`, `scope`, `ticket`, `publish`, `board`, `sync`, `triage` | Execute the printed plan, then read each write back. Without it, these commands only print the plan. |
| `--format text\|json` | Every command except `completions` | `json` prints one versioned envelope: `{"schema_version": 1, "command": …, "data": …}`. Notices (`defer:`, `skip:`, `warn:`) go to stderr, so stdout stays one parseable document. |

## Configuration

Carol works without configuration. To set something, add an optional `.carol/config.toml` at the repository root, next to zurdo's `.zurdo/config.toml`. An unknown key or a malformed file is a usage error (exit 2).

```toml
[tracker]
kind = "github"            # the only tracker today
repo = "acme/shop"         # default: parsed from the `origin` remote

[paths]
initiatives = "docs"       # where <initiative>/scope.md directories live

[triage.area_globs]        # required by `carol triage`
api     = ["src/api/**"]
billing = ["src/billing/**"]
```

| Key | Default | Used by |
|---|---|---|
| `[tracker] kind` | `github` | Every command that reads or writes GitHub |
| `[tracker] repo` | `owner/name` from `git remote get-url origin` (HTTPS, `ssh://`, and `user@host:` forms) | Every command that reads or writes GitHub |
| `[paths] initiatives` | `docs` | `status` |
| `[triage.area_globs]` | — | `triage`. Maps an area name to a list of path globs. [Details](triage.md#carol-triage) |

## Environment

| Variable | Effect |
|---|---|
| `CAROL_ZURDO` | The zurdo binary Carol calls. The default is `zurdo` on `PATH`. Point it at a newer zurdo build when the repository's `.zurdo/config.toml` needs one. |
| `GH_TOKEN` / `gh`'s own config | Carol shells out to `gh`, so whatever account `gh` uses is the account that writes |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | OK, or an empty plan |
| `2` | Usage, config, or a parse error in a planning file. Also a failed `doctor` check other than auth, `handoff check` findings, and several initiatives with none named. |
| `3` | Auth missing: `gh` isn't logged in, or the `project` scope is missing for `board` |
| `4` | Plan refused: two issues carry one marker, or `ticket` found no scope issue ("run scope first") |
| `5` | Read-back mismatch: a write didn't stick. The message names the fields. |
| `6` | GitHub or zurdo unavailable, a GitHub write failed, or a PRD has no run state to sync |

A parse error always happens before anything is written. Carol reads every planning file before it opens GitHub, so a malformed file can never leave a half-applied plan behind.

## Releases

The Carol docs describe **Carol {{ site.carol.version }}**, which works with zurdo {{ site.zurdo.version }}. Binaries and release notes are on [carol-dist]({{ site.carol.dist }}/releases). Report Carol bugs on [carol-dist issues]({{ site.carol.dist }}/issues), and zurdo bugs on [zurdo-dist issues](https://github.com/ElOrlis/zurdo-dist/issues).
