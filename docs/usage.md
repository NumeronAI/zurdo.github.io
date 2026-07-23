---
# Page settings
layout: default
comments: false

# Hero section
title: Usage
description: "Everyday workflows, run output, CI integration, troubleshooting."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Installation
        url: '/docs/installation.html'
    next:
        content: Effective use
        url: '/docs/effective-use.html'
---

## The everyday workflow

```sh
# One-time, at the root of the repo zurdo will drive:
zurdo init                    # writes .zurdo/config.toml, installs bundled skills

# Per PRD:
zurdo validate prds/feature.md      # grammar + dep-graph checks; free and instant
zurdo --analyze prds/feature.md     # optional: static lints + LLM review of the PRD itself
zurdo run prds/feature.md           # drive the loop
zurdo report prds/feature.md        # curated run report (JSON; --format md for markdown)
```

`zurdo validate` is deterministic — no LLM, no execution — so run it as often as you like. `zurdo --analyze` goes further: it lints hints for no-ops (vacuous shells, grep tautologies) and has an LLM critique vague criteria, all **before** you spend tokens on a real run. A bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## What a run looks like

`zurdo run` emits a live narration on stdout: a startup banner, per-task headers, per-criterion pass/fail, then a final summary table.

```
═══════════════════════════════════════════════════════════
  Zurdo v1.2.0
  PRD:      prds/auth.md
  Slug:     auth-a1b2
  Executor: anthropic (effort_map: low=claude-haiku-4-5,
                                   medium=claude-sonnet-4-6,
                                   high=claude-opus-4-7)
  Tasks:    7 (4 pending, 2 passed, 1 blocked-by-dependency)
═══════════════════════════════════════════════════════════

─── task-auth: Set up authentication ─── effort=medium, deps=[]
  → iteration 1 of 5 (max-attempts=5, agent-timeout=30m)
  ⠋ task-auth iter 1 — claude-sonnet-4-6 — 12s — 4.1 KB stdout
  ✓ agent completed: exit=0, 47s, 18.4 KB stdout
                     tokens in=3,421 out=8,209 — $0.12 est.
  → running 5 criteria
    ✓ shell: cargo build (1.2s)
    ✓ shell: cargo test (8.4s)
    ✗ shell: cargo clippy -- -D warnings (3.1s)
      stderr tail: error: this loop never actually loops
  iteration 1: 4/5 criteria passed; will retry
  ...
  ✓ task-auth: passed in 2 iterations (8m 14s)

═══ Run Summary ═══
  task-id          status                  attempts   wall-clock   criteria
  ──────────────────────────────────────────────────────────────────────────
  task-auth        passed                  2/5        8m 14s       5/5
  task-login       passed-pending-review   1/5        3m 02s       4/4
  task-rate-limit  failed                  5/5        12m 41s      3/4
  ──────────────────────────────────────────────────────────────────────────
  totals           1 passed, 1 pending-review, 1 failed                24m 57s
  iterations       8 used (of unlimited)
  tokens & cost    in=142,308 out=384,902 — $0.34 est.
```

Glyph legend: `→` action, `✓` pass, `✗` fail, `⊘` skipped/manual, `⚠` warning.

A criterion that was already green before the agent ever ran carries the tail `already passed at pre-flight — proves nothing about this run`, and the summary table adds a `passed-at-preflight` tally — see [Evidence integrity](how-it-works.md#evidence-integrity).

The progress stream is on stdout; a parallel JSONL event log lands at `.zurdo/<slug>/progress.log` for tooling. Tunables: `--no-progress` silences the stream, `--quiet-agent` drops the live tee of agent output (spinner stays), `--no-color` strips ANSI.

## Interrupting and resuming

Ctrl-C once and zurdo finishes the current iteration, renders the summary with partial state, and exits cleanly. The next `zurdo run` against the same PRD offers to resume:

```sh
zurdo run prds/feature.md --resume    # resume without the prompt
zurdo run prds/feature.md --reset     # archive state, start fresh
```

If you **edited the PRD** since the last run, zurdo refuses with exit `4` (PRD-hash drift) and asks for `--reset` — mid-run edits are never silently absorbed. Details in [How it works](how-it-works.md#resume-locks-and-recovery).

## Re-verifying after the fact

`zurdo verify <prd>` re-runs every terminal task's criteria against the **current** working tree — useful after you've hand-edited code, rebased, or want to confirm a run's claims still hold:

```sh
zurdo verify prds/feature.md
```

## Refining a PRD with `--analyze --fix`

`zurdo run <prd> --analyze` runs the full pre-flight analysis and never proceeds to execution (`--static-only` skips the LLM and keeps just the deterministic lints). Adding `--fix` turns it into an iterative refinement loop: the LLM proposes a tightened PRD, zurdo re-analyzes, and the loop repeats until warnings stop decreasing. The result is written to `<prd>.proposed.md`, and zurdo asks before overwriting your original.

```sh
zurdo run prds/feature.md --analyze --fix
```

## Healing misaimed grep hints with `--heal`

A `[grep:]` hint can fail because the code is wrong — or because the *hint* is wrong (a moved file, a renamed symbol, a pattern aimed at the wrong line). After a run with such failures, `--heal` re-aims failed `[grep:]`/`[no-grep:]` payloads using the run's failure history plus the live working tree as evidence:

```sh
zurdo run prds/feature.md --heal
```

It runs select → propose → verify → apply: the analyzer proposes a corrected payload for each failed grep hint, zurdo verifies the proposal against the tree, and only verified heals are offered. On a TTY each heal is a `y/N` edit to the PRD in place; on non-TTY (or with `--no-prompt`) verified heals go to `<prd>.proposed.md` instead. `--heal` requires an existing `.zurdo/<slug>/prd.json` from a prior run and `[roles.analyzer]` in config; it never executes tasks and never writes `prd.json`. If you're unsure whether the hint or the code is at fault, the bundled `zurdo-hint-debugger` skill correlates the hint with the iteration logs first.

## CI integration

The exit-code surface is designed for clean branching from a shell wrapper (the full table is in [Commands](commands.md#exit-codes)):

```sh
#!/usr/bin/env bash
set -euo pipefail

ec=0
zurdo run prds/feature.md \
    --no-prompt \
    --no-color \
    --max-iterations 50 \
    --log-format json --log-file zurdo.log \
  || ec=$?

case "$ec" in
  0)    echo "all tasks passed" ;;
  2)    echo "PRD grammar broken";   exit 1 ;;
  3|4)  echo "infra / pre-flight";   exit 1 ;;
  5)    echo "task failure";         exit 1 ;;  # real regression
  6)    echo "budget exhausted";     exit 1 ;;  # bump --max-iterations
  7|8)  echo "analyze-fix non-convergent"; exit 1 ;;
  *)    echo "unexpected ec=$ec";    exit 1 ;;
esac
```

Notes:

- `--no-prompt` makes the resume prompt non-interactive (defaults to *Resume*) so the run never blocks on stdin.
- `--no-color` keeps logs grep-friendly in CI's plain-text artifact viewer.
- `--log-format json` plus `--log-file` gives you a structured diagnostic log alongside the JSONL `progress.log`.
- Capture `.zurdo/<slug>/reports/*.json` and `.zurdo/<slug>/iterations/*` as build artifacts for post-mortems.
- Cap spend with `--max-iterations` (global) and per-task `Max-Attempts` (PRD metadata). Exit `6` distinguishes "budget hit" from `5` ("a task actually failed"), so dashboards can split flakes from regressions.

## Troubleshooting

| Symptom                                                            | Cause                                                                            | Fix                                                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `lock held by pid <n>` (exit `3`)                                  | Another `zurdo run` is in flight against the same PRD.                           | Wait for it. If no zurdo is running, the lock is stale and the next run will take it over.        |
| `state mismatch — pass --reset` (exit `4`)                         | The PRD has changed since the last successful run.                               | If the edits were intentional, run with `--reset` (old state archives under `.zurdo/<slug>/.archive/<ts>/`). |
| `unknown model anthropic:<x>` (exit `4`)                           | The model under `[effort_map.<provider>]` is unknown or unsupported under your auth. | Probe with `zurdo check-models`, fix the entry, or pass `--skip-model-check`.                    |
| `task heading uses hyphen-minus where em-dash required` (exit `2`) | The H2 task heading uses `-` or `–` instead of U+2014 `—`.                       | Insert a real em-dash. macOS: `Option+Shift+-`. Linux Compose key: `Compose - - -`.              |
| `acceptance criterion has no hint` (exit `2`)                      | A `- [ ]` line lacks any hint.                                                   | Add at least one hint, or `[manual]` if it's a human-review-only criterion.                      |
| Agent runs forever, no progress                                    | Agent is hung or slow.                                                           | Lower `Agent-timeout` in the task metadata or `[timeouts] agent_seconds` in config.              |
| `frozen path modified: <path>` fails every iteration               | The task genuinely requires editing a path frozen by `**Frozen**` or `[verification] protected_paths`. | Unfreeze the path or restructure the task — `zurdo --analyze` warns about hint/frozen-glob overlaps up front. |
| Grep criterion keeps failing though the content looks right        | The hint's pattern or file path is misaimed (moved file, renamed symbol).        | Run `zurdo run <prd> --heal` to re-aim failed grep payloads against the live tree.               |
| Criterion passes but proves nothing                                | Hint is too loose (`[shell: true]`, `[file-exists: README.md]`).                 | Tighten the hint. `zurdo --analyze` flags many such no-ops as warnings.                          |
| `[Y/n]` prompts appear in CI logs                                  | Default mode is interactive when stdin happens to be a TTY.                      | Always pass `--no-prompt` in CI (plus `--resume` or `--reset` to declare intent explicitly).     |
| `zurdo: command not found` after `brew install`                    | Homebrew bin directory not on PATH (Linux specifically).                         | `eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"` in your shell rc.                       |

If your symptom isn't here, run with `-v` (`--log-level=debug`) and check `.zurdo/<slug>/progress.log` — every state transition is structured there.

Next: [Effective use](effective-use.md)
