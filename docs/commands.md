---
layout: default
title: Commands
nav_order: 6
---

# Command reference
{: .no_toc }

1. TOC
{:toc}

Run `zurdo <subcommand> --help` for the full flag surface of any command. A bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## Subcommands

| Subcommand                          | Purpose                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo init`                        | Write a default `.zurdo/config.toml` and install bundled skills to the provider discovery path  |
| `zurdo init --sync`                 | Refresh bundled skill installs without rewriting config                                          |
| `zurdo init --check-models`         | Probe every `effort_map` entry against its provider CLI and print a status table                |
| `zurdo check-models`                | Probe the **existing** config's models without writing anything; adds a row per configured analyzer model. Exits `0` when all ok, `4` on any unknown/unsupported (matching the `run` pre-flight) |
| `zurdo validate <prd>`              | Deterministic grammar + dep-graph checks; no LLM, no execution                                  |
| `zurdo run <prd>`                   | Drive the PRD through the agent loop                                                            |
| `zurdo run <prd> --resume`          | Resume an interrupted run; no prompt                                                            |
| `zurdo run <prd> --reset`           | Archive existing state under `.zurdo/<slug>/.archive/<ts>/` and start fresh                     |
| `zurdo run <prd> --analyze`         | Full pre-flight (deterministic + LLM); never proceeds to execution                              |
| `zurdo run <prd> --analyze --fix`   | Iterative PRD refinement loop; writes `<prd>.proposed.md` and asks before overwriting           |
| `zurdo verify <prd>`                | Re-run every terminal task's criteria against the current working tree                          |
| `zurdo report <prd>`                | Build a curated run report (`--format json` default, `--format md` supported)                   |
| `zurdo state list`                  | List every `.zurdo/<slug>/` at the repo root                                                    |
| `zurdo state where <prd>`           | Print the absolute `.zurdo/<slug>/` path a PRD resolves to                                      |
| `zurdo skills list`                 | List bundled skills compiled into the binary                                                    |
| `zurdo skills install <name>`       | Install a bundled skill into the provider discovery path (`--all`, `--provider`, `--all-providers`) |

### Examples

```sh
zurdo init                                  # bootstrap config + skills in this repo
zurdo validate prds/feature.md              # free, instant grammar check
zurdo run prds/feature.md                   # the main event
zurdo run prds/feature.md --resume          # continue after Ctrl-C, no prompt
zurdo verify prds/feature.md                # re-check criteria after hand edits
zurdo report prds/feature.md --format md    # human-readable run report
zurdo skills install --all --all-providers  # every bundled skill, every provider
```

## Global flags

These apply across multiple subcommands. Subcommand-specific flags (`--analyze`, `--fix`, `--resume`, `--reset`, `--format`, `--check-models`) are in the table above.

| Flag                        | Effect                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--no-prompt`               | Suppress every interactive prompt (CI-safe). The resume prompt defaults to *Resume*.                       |
| `--max-iterations N`        | Cap total agent invocations across the run. Overrides `[defaults] max_total_iterations`. `0` = unlimited.  |
| `--skip-model-check`        | Disable the pre-run model probe. For CI against fake CLIs or unverified models.                            |
| `--no-progress`             | Suppress the stdout progress stream (banner, per-task headers, summary).                                   |
| `--quiet-agent`             | On a TTY, drop the live tee of agent stdout/stderr. Spinner and heartbeats remain.                         |
| `--no-color`                | Disable ANSI escapes in all output (stdout progress stream and stderr diagnostics).                        |
| `--log-file <path>`         | Tee the stderr diagnostic log to a file. Independent of `progress.log`.                                    |
| `--log-level <level>`       | One of `error`, `warn`, `info`, `debug`, `trace`. Default `info`.                                          |
| `-v` / `-q`                 | Aliases for `--log-level=debug` / `--log-level=warn`. Mutually exclusive with `--log-level`.               |
| `--log-format <text\|json>` | Diagnostic-log format. Default `text`. Does not affect the stdout progress stream.                         |

## Exit codes

| Code | Meaning                                                                                     |
| ---- | -------------------------------------------------------------------------------------------- |
| `0`  | Success                                                                                      |
| `1`  | General failure (unhandled error)                                                            |
| `2`  | PRD parse / validation error                                                                 |
| `3`  | Pre-flight failure (missing config, missing CLI on PATH, lock held)                          |
| `4`  | State mismatch requires `--reset`, or the pre-flight model probe rejected the model          |
| `5`  | One or more tasks finished `failed` or `blocked-by-dependency`                               |
| `6`  | Iteration budget exhausted (`--max-iterations`, incl. under `--analyze --fix`)               |
| `7`  | `--analyze --fix` thrash detected (warning count non-decreasing across the last 3 iterations)|
| `8`  | `--analyze --fix` halted — the LLM produced an unparseable PRD; last-good iteration preserved|

CI wrappers can branch cleanly on `5` (real failure) vs `6` (budget) vs `7`/`8` (analyze-fix didn't converge) — see the [CI integration example](usage.md#ci-integration).

Next: [Configuration](configuration.md)
