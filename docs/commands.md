---
# Page settings
layout: default
comments: false

# Hero section
title: Commands
description: "Full command and flag reference, exit codes."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Diagnosis & lessons
        url: '/docs/reason.html'
    next:
        content: Configuration
        url: '/docs/configuration.html'
---

The complete CLI surface as of zurdo v1.7.0. Every subcommand carries extensive built-in help — `zurdo <subcommand> --help` describes its modes, load-bearing exit codes, and examples — and `zurdo help <topic>` prints offline [guide pages](#zurdo-help--guide-pages-in-the-terminal) right in the terminal. A bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## Subcommands

| Subcommand                    | Purpose                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo init`                  | Write a default `.zurdo/config.toml` (with comments) and install bundled skills to the provider discovery path |
| `zurdo run <prd>`             | Drive the PRD through the agent loop. Default when no subcommand is given with a positional PRD |
| `zurdo validate <prd>`        | Deterministic grammar + dep-graph checks; no LLM, no execution. (Skill existence is checked at run pre-flight, not here) |
| `zurdo analyze <prd>`         | Full pre-flight analysis of the PRD itself — deterministic lints plus an LLM critique — and exit without executing anything ([details](#zurdo-analyze--pre-flight-analysis)) |
| `zurdo heal <prd>`            | Re-aim misaimed `[grep:]`/`[no-grep:]` hints using a prior run's failure history ([details](#zurdo-heal--re-aim-misaimed-grep-hints)) |
| `zurdo review <prd>`          | Interactive TUI over a prior run's evidence: task statuses, per-criterion provenance, the baseline diff, and in-band `[manual]` sign-off ([details](#zurdo-review--walk-the-evidence-sign-off-manual-criteria)) |
| `zurdo verify <prd>`          | Re-run every terminal task's criteria against the current working tree, without invoking the executor |
| `zurdo report <prd>`          | Build a curated run report from `prd.json` (`--format json` default, `--format md` supported)   |
| `zurdo state list`            | List every `.zurdo/<slug>/` state directory at the repo root                                    |
| `zurdo state where <prd>`     | Print the absolute `.zurdo/<slug>/` path a PRD resolves to (the directory need not exist)       |
| `zurdo skills list`           | List bundled skills compiled into the binary                                                    |
| `zurdo skills install <name>` | Install a bundled skill directly into the provider discovery path                               |
| `zurdo check-models`          | Probe the **existing** config's models without writing anything; adds a row per configured analyzer model. Exits `0` when all ok, `4` on any unknown/unsupported (matching the `run` pre-flight); transient `error` rows render but don't gate the exit code |
| `zurdo reason match <prd>`    | Preview which [library lessons](reason.md) would match each task of a PRD — read-only, never updates lesson stats |
| `zurdo reason status`         | Lesson-library count (grouped by match key) plus per-slug diagnosis-block counts                |
| `zurdo reason clear`          | Delete the lesson library. Confirms on a TTY; `--yes` for non-interactive use                   |
| `zurdo lumen status`          | Report the [structural index](lumen.md)'s state (and the Vela watcher's, when configured)       |
| `zurdo lumen rebuild`         | Rebuild the structural index from scratch                                                       |
| `zurdo lumen clear`           | Delete `.zurdo/lumen/`. Confirms on a TTY; `--yes` for non-interactive use                      |
| `zurdo vela serve` / `start` / `stop` / `status` | Run or manage the optional [background watcher](lumen.md#the-vela-watcher) that keeps the Lumen index fresh |
| `zurdo help [topic]`          | List every subcommand and guide topic, or print one guide page ([details](#zurdo-help--guide-pages-in-the-terminal)) |
| `zurdo completions <shell>`   | Print a shell completion script to stdout ([details](#shell-completions-and-man-pages))          |

## `zurdo analyze` — pre-flight analysis

`zurdo analyze <prd>` runs the full pre-flight analysis and never proceeds to execution. Three modes:

| Invocation                          | What it does                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo analyze <prd>`               | Full analysis: deterministic lints (vacuous shells, grep tautologies, frozen-path overlaps, uncovered requirements) plus an LLM critique of vague criteria. Requires `[roles.analyzer]` |
| `zurdo analyze <prd> --static-only` | Deterministic lints only — no LLM invocation, no `[roles.analyzer]` needed. The CI-friendly instant pass |
| `zurdo analyze <prd> --fix`         | Iterative refinement loop: the analyzer proposes a tightened PRD, zurdo re-analyzes, repeat until warnings stop decreasing. Writes `<prd>.proposed.md` and asks before overwriting            |

`--static-only` conflicts with `--fix` (the fix loop is LLM-driven). `--max-iterations N` caps the `--fix` refinement loop — same spelling as `run`'s flag, but here it means the refinement-loop cap, and `0` is a flag error under `--fix`.

## `zurdo heal` — re-aim misaimed grep hints

A `[grep:]` hint can fail because the code is wrong — or because the *hint* is wrong. `zurdo heal <prd>` re-aims failed `[grep:]`/`[no-grep:]` payloads using the prior run's failure history plus the live working tree as evidence (select → propose → verify → apply). It requires an existing `.zurdo/<slug>/prd.json` from a prior run (exit `3` if absent) and `[roles.analyzer]`. On a TTY it offers each verified heal in place (`y/N`); on non-TTY or with `--no-prompt` it writes verified heals to `<prd>.proposed.md`. It never executes tasks and never writes `prd.json`.

<div class="callout callout--warning" markdown="1">
**Deprecated flag forms** `analyze` and `heal` were flag modes on `run` before v1.7.0. The old spellings — `zurdo run --analyze` (with `--fix`/`--static-only`), `zurdo run --heal`, and the bare `zurdo --analyze <prd>` sugar — still parse and behave identically, but no longer appear in `zurdo run --help` and print a one-line stderr notice (e.g. `warning: 'zurdo run --analyze' is deprecated; use 'zurdo analyze'`). Removal is deferred to a future 2.0.
</div>

## `zurdo review` — walk the evidence, sign off `[manual]` criteria

`zurdo review <prd>` opens a full-screen terminal UI over a prior run's recorded state. Everything is read-only except one action: signing off `[manual]` criteria. Three surfaces:

- **Task list** — every task with its `prd.json` status; `passed-pending-review` tasks carry an explicit `<< awaiting manual sign-off` marker.
- **Evidence detail** — one criterion at a time: its prose, each hint's source text, the latest iteration's pass/fail verdict with the provenance the runner captured (exit code, typed failure reason, a bounded stderr excerpt), and an explicit warning when a hint's evidence changed since the run-start baseline.
- **Baseline diff** — the working tree's diff against the persisted `.zurdo/<slug>/baseline`, recomputed live when the session opens: the changed-path list and the selected file's hunks. Degrades to a notice when no baseline was captured or `git diff` fails.

Navigation: `j`/`k` (or arrow keys) to move, `Enter` to descend into a task's evidence, `d` for the diff, `t` back to the task list, `Esc` up a level, `q` to quit.

**Sign-off** (`s`) is offered only on an unsigned `[manual]` criterion of a task in `passed-pending-review` — automated criteria, tasks in other statuses, and already-signed criteria expose no sign-off action, and the footer advertises the key only where it works. Each sign-off prompts for an optional one-line reviewer note, then an explicit confirmation naming the task; on confirm, a record (task id, criterion, note, UTC timestamp) is appended to `.zurdo/<slug>/review-log.jsonl` — a tamper-evident hash chain anchored at the run's PRD hash. Signing a task's **last** unsigned `[manual]` criterion additionally flips it `passed-pending-review` → `passed` in `prd.json` (the only `prd.json` write this surface ever makes; the run lock, held for the whole session, means no concurrent run can race it). Sign-offs are irrevocable — there is no unsign — and a broken log chain disables sign-off rather than appending to it. When the PRD hash changes (e.g. after `--reset`), the old log is archived and a fresh chain begins. Already-signed criteria render with their note and sign-off time on later sessions.

Guard rails, checked before any TUI setup: `review` requires an interactive terminal — non-TTY stdin or `--no-prompt` prints a one-line stderr pointer at `zurdo report` and exits `2`. It requires an existing `.zurdo/<slug>/prd.json` from a prior run (exit `3` if absent) and refuses to start while another process holds the run lock (exit `3`).

## `zurdo help` — guide pages in the terminal

Bare `zurdo help` lists every subcommand and every guide topic. `zurdo help <name>` with a subcommand name renders that subcommand's own `--help`; otherwise the name is looked up among the compiled-in guide topics:

`hints` · `prd-grammar` · `exit-codes` · `config` · `workflow` · `state-dir`

The topics are condensed, offline versions of this documentation — the hint-type menu, the PRD grammar rules, the exit-code table, the config key reference, the operating loop, and the `.zurdo/<slug>/` layout. A subcommand name always shadows a topic of the same name; a name matching neither is an error on stderr, exit `2`.

## Shell completions and man pages

`zurdo completions <shell>` prints a completion script for `bash`, `zsh`, `fish`, `elvish`, or `powershell` to stdout, generated from the same command tree that parses every invocation — so it always matches the installed binary. Nothing is written to disk and no config or repo is touched; it works from any directory:

```sh
eval "$(zurdo completions zsh)"          # or:
zurdo completions bash > /etc/bash_completion.d/zurdo
zurdo completions fish | source
```

Installs via **Homebrew get bash/zsh/fish completions and man pages automatically** (`man zurdo`, `man zurdo-run`, …); release tarballs bundle both under `completions/` and `man/` — see [Installation](installation.md#shell-completions-and-man-pages).

## Flags by subcommand

### `zurdo run`

| Flag                  | Effect                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--resume`            | Skip the interactive resume prompt and continue from existing state. No-op when no state exists.         |
| `--reset`             | Archive old state under `.zurdo/<slug>/.archive/<ts>/` and start over. Skips the resume prompt.          |
| `--max-iterations N`  | Cap total agent invocations across the run. Overrides `[defaults] max_total_iterations`. `0` = unlimited. |
| `--skip-model-check`  | Disable the automatic pre-run model probe. For CI against fake CLIs or deliberately unverified models.   |
| `--raw-agent`         | Restore the raw byte-level tee of agent output instead of the default step summaries on a TTY. Mutually exclusive with `--quiet-agent`. |

The pre-v1.7.0 mode flags `--analyze`, `--fix`, `--static-only`, and `--heal` still parse as hidden deprecated aliases (see the callout above) but are no longer listed in `--help`.

### `zurdo analyze`

| Flag                  | Effect                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--fix`               | Iterative refinement loop instead of a single pass. Requires `[roles.analyzer]`; conflicts with `--static-only`. |
| `--static-only`       | Deterministic checks only — no LLM, no `[roles.analyzer]` needed. Conflicts with `--fix`.                |
| `--max-iterations N`  | Cap on the `--fix` refinement loop (distinct from `run`'s run-loop cap). `0` is a flag error under `--fix`. |
| `--no-progress`       | Silence the analyze progress stream; only the final verdict is emitted.                                  |
| `--repo-root <path>`  | Override the auto-detected repo root (the nearest ancestor with `.git`).                                 |

### `zurdo heal` / `zurdo review` / `zurdo verify` / `zurdo report`

| Flag                  | Effect                                              |
| --------------------- | ----------------------------------------------------- |
| `--repo-root <path>`  | Override the auto-detected repo root.                |
| `--format <json\|md>` | (`report` only) Output format. Default `json`.       |

### `zurdo init`

| Flag             | Effect                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `--sync`         | Refresh bundled skill installs in the provider discovery path without rewriting `config.toml`.             |
| `--check-models` | After init, probe every `[effort_map.<provider>]` entry and print a status table. Informational; always exits `0`. |
| `--force`        | Overwrite an existing `.zurdo/config.toml` (still confirms on a TTY; overwrites with non-interactive stdin). Pairs with `--check-models` to regenerate then audit. |
| `--quiet`        | Suppress the one-line stdout summary. Stderr diagnostics are unaffected.                                   |

### `zurdo skills install`

| Flag                | Effect                                                          |
| ------------------- | ----------------------------------------------------------------- |
| `--all`             | Install every bundled skill in one shot.                         |
| `--provider <name>` | Target a specific provider's discovery path. Repeatable.         |
| `--all-providers`   | Fan out across every configured provider. Composes with `--all`. |

### Global flags

Apply across subcommands:

| Flag                        | Effect                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--no-prompt`               | Suppress every interactive prompt (CI-safe). The resume prompt defaults to *Resume*; `heal` switches to writing `<prd>.proposed.md`; `review` refuses with exit `2` (it needs a terminal). |
| `--no-progress`             | Suppress the stdout progress stream (banner, per-task headers, summary).                                   |
| `--quiet-agent`             | On a TTY, drop the live tee of agent stdout/stderr. Spinner and heartbeats remain.                         |
| `--no-color`                | Disable ANSI escapes in all output (stdout progress stream and stderr diagnostics).                        |
| `--log-file <path>`         | Tee the stderr diagnostic log to a file. Independent of `progress.log`.                                    |
| `--log-level <level>`       | One of `error`, `warn`, `info`, `debug`, `trace`. Default `info`.                                          |
| `-v` / `-q`                 | Aliases for `--log-level=debug` / `--log-level=warn`. Mutually exclusive with `--log-level`.               |
| `--log-format <text\|json>` | Diagnostic-log format. Default `text`. Does not affect the stdout progress stream.                         |

### Examples

```sh
zurdo init                                  # bootstrap config + skills in this repo
zurdo init --force --check-models           # regenerate config, then audit its models
zurdo validate prds/feature.md              # free, instant grammar check
zurdo analyze prds/feature.md --static-only # lint hints without an LLM
zurdo run prds/feature.md                   # the main event
zurdo run prds/feature.md --resume          # continue after Ctrl-C, no prompt
zurdo heal prds/feature.md                  # re-aim grep hints that failed last run
zurdo verify prds/feature.md                # re-check criteria after hand edits
zurdo review prds/feature.md                # walk the evidence, sign off [manual] criteria
zurdo report prds/feature.md --format md    # human-readable run report
zurdo reason match prds/feature.md          # preview lessons that would inform this PRD
zurdo help workflow                         # guide pages, offline in the terminal
eval "$(zurdo completions zsh)"             # shell completions from the live binary
zurdo skills install --all --all-providers  # every bundled skill, every provider
```

## Exit codes

| Code | Meaning                                                                                     |
| ---- | -------------------------------------------------------------------------------------------- |
| `0`  | Success                                                                                      |
| `1`  | General failure (unhandled error)                                                            |
| `2`  | PRD parse / validation error (grammar errors, analyze findings; `heal`'s input PRD or missing/invalid config). Also: `review` on a non-interactive terminal, and an unknown `zurdo help` topic |
| `3`  | Pre-flight failure (missing config, missing CLI on PATH, lock held; for `heal` and `review`: missing `prd.json`; for `heal`: missing `[roles.analyzer]`) |
| `4`  | State mismatch requiring `--reset` (a `prd_hash` mismatch with no valid heal-log chain to reconcile), or the pre-flight model probe rejected a model |
| `5`  | One or more tasks finished `failed` or `blocked-by-dependency`                               |
| `6`  | Iteration budget exhausted (`--max-iterations`, incl. under `analyze --fix`)                 |
| `7`  | `analyze --fix` thrash detected (warning count non-decreasing across the last 3 iterations)  |
| `8`  | `analyze --fix` halted — the LLM produced an unparseable PRD; last-good iteration preserved  |

CI wrappers can branch cleanly on `5` (real failure) vs `6` (budget) vs `7`/`8` (analyze-fix didn't converge) — see the [CI integration example](usage.md#ci-integration). The same table ships in the binary: `zurdo help exit-codes`.

Next: [Configuration](configuration.md)
