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

The complete CLI surface as of zurdo v1.6.0. Run `zurdo <subcommand> --help` for built-in help; a bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## Subcommands

| Subcommand                    | Purpose                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo init`                  | Write a default `.zurdo/config.toml` (with comments) and install bundled skills to the provider discovery path |
| `zurdo run <prd>`             | Drive the PRD through the agent loop. Default when no subcommand is given with a positional PRD |
| `zurdo validate <prd>`        | Deterministic grammar + dep-graph checks; no LLM, no execution. (Skill existence is checked at run pre-flight, not here) |
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
| `zurdo lumen status`          | Report the [structural index](hints.md#structural-hints-experimental)'s state (and the Vela watcher's, when configured) |
| `zurdo lumen rebuild`         | Rebuild the structural index from scratch                                                       |
| `zurdo lumen clear`           | Delete `.zurdo/lumen/`. Confirms on a TTY                                                       |
| `zurdo vela serve` / `start` / `stop` / `status` | Run or manage the optional background watcher that keeps the Lumen index fresh |

## Authoring modes on `zurdo run`

Three flag-driven modes turn `run` into a PRD-authoring tool that never executes tasks:

| Invocation                              | What it does                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo run <prd> --analyze`             | Full pre-flight analysis: deterministic lints (vacuous shells, grep tautologies, frozen-path overlaps, uncovered requirements) plus an LLM critique of vague criteria. Exits without executing |
| `zurdo run <prd> --analyze --static-only` | Deterministic lints only — no LLM invocation, no `[roles.analyzer]` needed                     |
| `zurdo run <prd> --analyze --fix`       | Iterative refinement loop: the analyzer proposes a tightened PRD, zurdo re-analyzes, repeat until warnings stop decreasing. Writes `<prd>.proposed.md` and asks before overwriting            |
| `zurdo run <prd> --heal`                | Re-aim misaimed `[grep:]`/`[no-grep:]` payloads using the prior run's failure history plus the live working tree as evidence (select → propose → verify → apply). Requires an existing `.zurdo/<slug>/prd.json` from a prior run (exit `3` if absent) and `[roles.analyzer]`. On a TTY it offers each verified heal in place (`y/N`); on non-TTY or with `--no-prompt` it writes verified heals to `<prd>.proposed.md`. Never writes `prd.json` |

<div class="callout callout--info" markdown="1">
**Note** Flag combination rules: `--fix` and `--static-only` each require `--analyze` and conflict with each other; `--heal` conflicts with all three.
</div>

## Flags by subcommand

### `zurdo run`

| Flag                  | Effect                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--analyze`           | Run full pre-flight analysis (deterministic + LLM) and exit; never proceeds to execution.                |
| `--fix`               | With `--analyze`: iterative refinement loop instead of a single pass. Requires `[roles.analyzer]`. Flag error without `--analyze`. |
| `--static-only`       | With `--analyze`: deterministic checks only, no LLM. Requires `--analyze`; conflicts with `--fix`.       |
| `--heal`              | Hint auto-healing mode (see above). Conflicts with `--analyze`/`--fix`/`--static-only`.                  |
| `--resume`            | Skip the interactive resume prompt and continue from existing state. No-op when no state exists.         |
| `--reset`             | Archive old state under `.zurdo/<slug>/.archive/<ts>/` and start over. Skips the resume prompt.          |
| `--max-iterations N`  | Cap total agent invocations across the run (also caps `--analyze --fix` refinement iterations). Overrides `[defaults] max_total_iterations`. `0` = unlimited. |
| `--skip-model-check`  | Disable the automatic pre-run model probe. For CI against fake CLIs or deliberately unverified models.   |
| `--raw-agent`         | Restore the raw byte-level tee of agent output instead of the default step summaries on a TTY. Mutually exclusive with `--quiet-agent`. |

### `zurdo init`

| Flag             | Effect                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `--sync`         | Refresh bundled skill installs in the provider discovery path without rewriting `config.toml`.             |
| `--check-models` | After init, probe every `[effort_map.<provider>]` entry and print a status table. Informational; always exits `0`. |
| `--force`        | Overwrite an existing `.zurdo/config.toml` (still confirms on a TTY; overwrites with non-interactive stdin). Pairs with `--check-models` to regenerate then audit. |
| `--quiet`        | Suppress the one-line stdout summary. Stderr diagnostics are unaffected.                                   |

### `zurdo report`

| Flag                  | Effect                                              |
| --------------------- | ----------------------------------------------------- |
| `--format <json\|md>` | Output format. Default `json`.                       |

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
| `--no-prompt`               | Suppress every interactive prompt (CI-safe). The resume prompt defaults to *Resume*; `--heal` switches to writing `<prd>.proposed.md`. |
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
zurdo run prds/feature.md --analyze --static-only   # lint hints without an LLM
zurdo run prds/feature.md                   # the main event
zurdo run prds/feature.md --resume          # continue after Ctrl-C, no prompt
zurdo run prds/feature.md --heal            # re-aim grep hints that failed last run
zurdo verify prds/feature.md                # re-check criteria after hand edits
zurdo report prds/feature.md --format md    # human-readable run report
zurdo reason match prds/feature.md          # preview lessons that would inform this PRD
zurdo skills install --all --all-providers  # every bundled skill, every provider
```

## Exit codes

| Code | Meaning                                                                                     |
| ---- | -------------------------------------------------------------------------------------------- |
| `0`  | Success                                                                                      |
| `1`  | General failure (unhandled error)                                                            |
| `2`  | PRD parse / validation error (grammar errors, analyze findings; `--heal`'s input PRD or missing/invalid config) |
| `3`  | Pre-flight failure (missing config, missing CLI on PATH, lock held; for `--heal`: missing `prd.json` or `[roles.analyzer]`) |
| `4`  | State mismatch requiring `--reset` (a `prd_hash` mismatch with no valid heal-log chain to reconcile), or the pre-flight model probe rejected a model |
| `5`  | One or more tasks finished `failed` or `blocked-by-dependency`                               |
| `6`  | Iteration budget exhausted (`--max-iterations`, incl. under `--analyze --fix`)               |
| `7`  | `--analyze --fix` thrash detected (warning count non-decreasing across the last 3 iterations)|
| `8`  | `--analyze --fix` halted — the LLM produced an unparseable PRD; last-good iteration preserved|

CI wrappers can branch cleanly on `5` (real failure) vs `6` (budget) vs `7`/`8` (analyze-fix didn't converge) — see the [CI integration example](usage.md#ci-integration).

Next: [Configuration](configuration.md)
