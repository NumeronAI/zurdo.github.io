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

The complete CLI surface as of zurdo v1.25.0. Every subcommand carries extensive built-in help — `zurdo <subcommand> --help` describes its modes, load-bearing exit codes, and examples — and `zurdo help <topic>` prints offline [guide pages](#zurdo-help--guide-pages-in-the-terminal) right in the terminal. A bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## Subcommands

| Subcommand                    | Purpose                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo init`                  | Write a default `.zurdo/config.toml` (with comments) and install bundled skills to the provider discovery path |
| `zurdo run <prd>`             | Drive the PRD through the agent loop. Default when no subcommand is given with a positional PRD |
| `zurdo validate <prd>`        | Deterministic grammar + dep-graph checks; no LLM, no execution. `--strict` promotes advisory lints to errors, `--format json` emits a parseable envelope ([details](#machine-readable-output)), `--authoring-state` / `--at <rev>` validate an already-shipped PRD against the tree it was written for ([details](#zurdo-validate---authoring-state)). (Skill existence is checked at run pre-flight, not here) |
| `zurdo doctor`                | Diagnose why a run won't start — config, providers, `PATH`, model probes, git/state, Lumen — with no PRD, no lock, and nothing written ([details](#zurdo-doctor--diagnose-the-environment)) |
| `zurdo analyze <prd>`         | Full pre-flight analysis of the PRD itself — deterministic lints plus an LLM critique — and exit without executing anything ([details](#zurdo-analyze--pre-flight-analysis)) |
| `zurdo heal <prd>`            | Re-aim misaimed `[grep:]`/`[no-grep:]` hints using a prior run's failure history ([details](#zurdo-heal--re-aim-misaimed-grep-hints)) |
| `zurdo review <prd>`          | Interactive TUI over a prior run's evidence: task statuses, per-criterion provenance, the baseline diff, and in-band `[manual]` sign-off ([details](#zurdo-review--walk-the-evidence-sign-off-manual-criteria)) |
| `zurdo verify <prd>`          | Re-run every terminal task's criteria against the current working tree, without invoking the executor. `--format json` supported |
| `zurdo report <prd>`          | Build a curated run report from `prd.json` (`--format json` default, `--format md` supported), including the [completion gate](usage.md#the-completion-gate) verdict when one ran |
| `zurdo state list`            | List every `.zurdo/<slug>/` state directory at the repo root, with a `gate` column for the completion-gate verdict. `--format json` supported |
| `zurdo state where <prd>`     | Print the absolute `.zurdo/<slug>/` path a PRD resolves to (the directory need not exist)       |
| `zurdo skills list`           | List the seven [bundled skills](how-it-works.md#skills) compiled into the binary                 |
| `zurdo skills install <name>` | Install a bundled skill directly into the provider discovery path                               |
| `zurdo check-models`          | **Deprecated since v1.9.0** — use `zurdo doctor`, whose `models` section probes the same rows and adds the vocabulary canary. Retained through 1.x with identical behavior and exit codes; prints one stderr deprecation line per invocation |
| `zurdo reason match <prd>`    | Preview which [library lessons](reason.md) would match each task of a PRD — read-only, never updates lesson stats |
| `zurdo reason status`         | Lesson-library count (grouped by match key), one line per lesson file that failed to parse, plus per-slug diagnosis-block counts |
| `zurdo reason clear`          | Delete the lesson **usage** sidecar (`.zurdo/reason/usage.json`). The git-tracked `lessons/` files are left alone — retire one with `git rm`. Confirms on a TTY; `--yes` for non-interactive use |
| `zurdo lumen status`          | Report the [structural index](lumen.md)'s state (and the Vela watcher's, when configured)       |
| `zurdo lumen rebuild`         | Rebuild the structural index from scratch                                                       |
| `zurdo lumen clear`           | Delete `.zurdo/lumen/`. Confirms on a TTY; `--yes` for non-interactive use                      |
| `zurdo lumen query <selector>` | Ask the structural index a question — `--name`, `--outline`, `--callers`, or `--references` — over a freshly repaired view; no prior rebuild needed ([details](lumen.md#asking-the-index-a-question)) |
| `zurdo mcp serve`             | Serve the structural index and compound-loop state to an MCP client over stdio. Launched by the client, not typed ([details](mcp.md)) |
| `zurdo vela serve` / `start` / `stop` / `status` | Run or manage the optional [background watcher](lumen.md#the-vela-watcher) that keeps the Lumen index fresh |
| `zurdo help [topic]`          | List every subcommand and guide topic, or print one guide page ([details](#zurdo-help--guide-pages-in-the-terminal)) |
| `zurdo completions <shell>`   | Print a shell completion script to stdout ([details](#shell-completions-and-man-pages))          |

## `zurdo doctor` — diagnose the environment

`zurdo run` won't start and you want to know why, before writing a PRD or spending a token. `zurdo doctor` (v1.10.0) re-checks the **environment half** of the run pre-flight — with no PRD argument, without acquiring the run lock, and without writing anything to disk:

```sh
zurdo doctor                  # full diagnostic
zurdo doctor --skip-probes    # environment only — spawns no provider process at all
zurdo doctor --format json    # one parseable document for tooling
```

Output is a list of sections, each holding `<status>  <label>: <detail>` rows with an optional `hint:` line:

| Section      | Checks                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `config`     | `.zurdo/config.toml` loads. A config that won't load makes every later section meaningless, so doctor stops there. |
| `providers`  | Every provider a configured role names has a `[providers.<name>]` block, and its `cli` resolves on `PATH`.    |
| `models`     | Every `[effort_map.<provider>]` entry plus `[roles.analyzer]`'s model, classified exactly as `check-models` did. |
| `vocabulary` | The [provider vocabulary canary](providers.md#the-vocabulary-canary) — does each provider's event stream still yield extractable assistant text? |
| `git`        | A usable `git` work tree, and whether `.zurdo/` is gitignored.                                                |
| `state`      | Run-state directories present, and any stale run lock.                                                        |
| `lumen`      | Index generation and Vela daemon status. Only when `[lumen] enabled = true`.                                  |

The **blocking/advisory split** is what makes doctor safe as a CI gate: only `fail` rows move the exit code. A vocabulary gap, a stale lock, a missing `.gitignore` entry, an unbuilt Lumen index, and a stopped Vela daemon are all `warn` — reported, never gating.

The model probes reuse the stdout they already captured to run the vocabulary canary, so the canary costs **zero extra process spawns**. `--skip-probes` suppresses the spawn itself, not just the classification — neither the probes nor the canary's `--version` lookup runs — which is what makes doctor safe offline, in CI, and on a metered account.

Exit `0` when everything passed or only advisories were reported; exit `2` when the config is missing or unloadable; exit `4` on any blocking finding — the same code the run pre-flight uses for a failed model check.

## Machine-readable output

`zurdo validate`, `zurdo verify`, and `zurdo state list` accept `--format json` (v1.12.0), emitting one **shared versioned envelope** so a CI consumer parses one contract rather than three per-command shapes:

```json
{ "schema_version": 1, "command": "validate", "data": { "ok": true, "errors": [], "warnings": [] } }
```

| Command      | `command` value | `data` payload                                                                                     |
| ------------ | --------------- | ---------------------------------------------------------------------------------------------------- |
| `validate`   | `validate`      | `{ok, errors[], warnings[]}` — each warning names its [lint family](hints.md#the-warn-lint-families) |
| `verify`     | `verify`        | `{terminal_checked, changes[]}` — an empty `changes` array *is* the no-regressions case, so the shape never branches |
| `state list` | `state-list`    | `{entries[]}` — a repo with no runs parses identically to one with runs, instead of emitting prose  |

In JSON mode stdout is a single document and diagnostics stay on stderr; a parse or validation failure reports its errors *in the payload* rather than only as text. **`--format json` changes rendering only** — the exit code for a given input is identical to text mode on all three commands.

`zurdo report` and `zurdo doctor` have their own JSON shapes: `report`'s schema is load-bearing enough to be the default and evolves independently, and `doctor --format json` carries every section it renders.

## `zurdo validate --strict`

`--strict` promotes six of the ten [warn-lint families](hints.md#the-warn-lint-families) — `grep-target`, `vacuous-shell`, `grep-tautology`, `frozen-overlap`, `doc-echo`, `uncovered-requirement` — to validation errors, so a PRD that would otherwise pass with warnings exits `2`, the same code a structural error produces. Four families are exempt, for three different reasons:

- **`skill-resolution`** — permanently. PRD-referenced skills are user-managed, so a CI checkout legitimately lacks them; promoting this family would fail every strict run for a non-defect.
- **`discarded-evidence`** and **`cached-verification`** (v1.18.0) — pending field data. `doc-echo` sat in this state until v1.16.0 promoted it.
- **`unaddressed-lesson`** (v1.21.0) — never. The obligations it checks come from *your* repository's lesson library, so no measurement elsewhere could justify making it build-breaking. It is also emitted only by `zurdo analyze`, never by `validate`.

It composes with `--format json`: a promoted finding moves from the `warnings` array to `errors`, and `ok` goes `false`. Without the flag every family stays advisory and a PRD with warnings still exits `0`.

## `zurdo validate --authoring-state`

Validating a PRD whose work has already shipped is misleading: every `[grep:]` and `[no-grep:]` hint already reads green against `HEAD`, so `grep-tautology` fires on all of them — an artifact of the tree, not a defect in the PRD. `--authoring-state` (v1.15.0) validates the PRD **as it was when it was written**: zurdo finds the commit that added the PRD (following renames) and checks that commit's text against its first parent. `--at <rev>` names the commit explicitly instead.

```sh
zurdo validate prds/feature.md --authoring-state   # the commit that added the PRD
zurdo validate prds/feature.md --at 3f1d61b        # an explicit revision
```

The two flags are mutually exclusive. Because the reconstruction reports on the *committed* PRD, not the file on disk, both output formats name the resolved commit and baseline whenever either flag is used (`revision` in the JSON payload). This is how zurdo's own maintainers measure lint false-positive rates — on zurdo's own PRD corpus it cut total findings from 929 to 94.

## `zurdo analyze` — pre-flight analysis

`zurdo analyze <prd>` runs the full pre-flight analysis and never proceeds to execution. Three modes:

| Invocation                          | What it does                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `zurdo analyze <prd>`               | Full analysis: every deterministic [lint family](hints.md#the-warn-lint-families) — including `unaddressed-lesson`, which only `analyze` emits — plus an LLM critique of vague criteria. Requires `[roles.analyzer]` |
| `zurdo analyze <prd> --static-only` | Deterministic lints only — no LLM invocation, no `[roles.analyzer]` needed, and (since v1.18.0) no `.zurdo/config.toml` needed either: an absent config falls back to the defaults `zurdo init` would write. The CI-friendly instant pass |
| `zurdo analyze <prd> --fix`         | Iterative refinement loop: the analyzer proposes a tightened PRD, zurdo re-analyzes, repeat until warnings stop decreasing. Writes `<prd>.proposed.md` and asks before overwriting            |

`--static-only` conflicts with `--fix` (the fix loop is LLM-driven). Its missing-config carve-out covers absence only: a `config.toml` that exists but fails to parse still exits `2`, and a full `analyze` pass still requires a config. `--max-iterations N` caps the `--fix` refinement loop — same spelling as `run`'s flag, but here it means the refinement-loop cap, and `0` is a flag error under `--fix`.

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

### `zurdo validate`

| Flag                    | Effect                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `--strict`              | Promote the six promotable warn-lint families to validation errors (exit `2`). See [above](#zurdo-validate---strict). |
| `--authoring-state`     | Validate the PRD as committed, against the parent of the commit that added it. See [above](#zurdo-validate---authoring-state). |
| `--at <rev>`            | Like `--authoring-state`, but at an explicit revision. Mutually exclusive with `--authoring-state`. |
| `--format <text\|json>` | `json` emits the shared versioned envelope on stdout. Rendering only — the exit code is unchanged. Default `text`. |
| `--repo-root <path>`    | Override the auto-detected repo root (the nearest ancestor with `.git`).                              |

### `zurdo doctor`

| Flag                    | Effect                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `--skip-probes`         | Spawn no provider process at all — suppresses both the model probes and the canary's `--version` lookup. |
| `--format <text\|json>` | `json` emits one document carrying every section. Default is the grouped human-readable form.          |

### `zurdo analyze`

| Flag                  | Effect                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--fix`               | Iterative refinement loop instead of a single pass. Requires `[roles.analyzer]`; conflicts with `--static-only`. |
| `--static-only`       | Deterministic checks only — no LLM, no `[roles.analyzer]` needed. Conflicts with `--fix`.                |
| `--max-iterations N`  | Cap on the `--fix` refinement loop (distinct from `run`'s run-loop cap). `0` is a flag error under `--fix`. |
| `--no-progress`       | Silence the analyze progress stream; only the final verdict is emitted.                                  |
| `--repo-root <path>`  | Override the auto-detected repo root (the nearest ancestor with `.git`).                                 |

### `zurdo heal` / `zurdo review` / `zurdo verify` / `zurdo report` / `zurdo state list`

| Flag                    | Effect                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `--repo-root <path>`    | Override the auto-detected repo root.                                                        |
| `--format <json\|md>`   | (`report` only) Output format. Default `json` — load-bearing for external tooling.            |
| `--format <text\|json>` | (`verify` and `state list`) The shared versioned envelope. Default `text`.                    |

### `zurdo lumen query`

Exactly one selector is required; clap rejects zero or two. Requires `[lumen] enabled = true`.

| Flag                  | Effect                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--name <IDENT>`      | Definitions whose qualified name matches — exact, then trailing-segment; substring only when neither matched. |
| `--outline <PATH>`    | Every definition recorded for that file, in source order.                                                |
| `--callers <NAME>`    | Every call site whose callee resolves to that name.                                                      |
| `--references <NAME>` | Every identifier reference to that name.                                                                 |
| `--limit <N>`         | Maximum rows printed. Default `20`; `0` means unlimited.                                                 |

`zurdo mcp serve` takes no flags of its own; the repository is the working directory it starts in.

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
zurdo doctor                                # why won't a run start? config, PATH, models, state
zurdo doctor --skip-probes --format json    # offline environment check, parseable
zurdo validate prds/feature.md              # free, instant grammar check
zurdo validate prds/feature.md --strict     # advisory lints become errors (CI gate)
zurdo validate prds/done.md --authoring-state # lint a shipped PRD as it was written
zurdo analyze prds/feature.md --static-only # lint hints without an LLM
zurdo run prds/feature.md                   # the main event
zurdo run prds/feature.md --resume          # continue after Ctrl-C, no prompt
zurdo heal prds/feature.md                  # re-aim grep hints that failed last run
zurdo verify prds/feature.md                # re-check criteria after hand edits
zurdo review prds/feature.md                # walk the evidence, sign off [manual] criteria
zurdo report prds/feature.md --format md    # human-readable run report
zurdo reason match prds/feature.md          # preview lessons that would inform this PRD
zurdo lumen query --name Config::load       # ask the structural index (needs [lumen] enabled)
zurdo help workflow                         # guide pages, offline in the terminal
eval "$(zurdo completions zsh)"             # shell completions from the live binary
zurdo skills install --all --all-providers  # every bundled skill, every provider
```

## Exit codes

| Code | Meaning                                                                                     |
| ---- | -------------------------------------------------------------------------------------------- |
| `0`  | Success                                                                                      |
| `1`  | General failure (unhandled error)                                                            |
| `2`  | PRD parse / validation error (grammar errors, analyze findings, a `--strict` promoted warning, `heal`'s input PRD), or a missing / invalid `.zurdo/config.toml` — except that `analyze --static-only` tolerates an *absent* config. Also: `review` on a non-interactive terminal, and an unknown `zurdo help` topic |
| `3`  | Pre-flight failure (missing CLI on PATH, lock held; for `heal` and `review`: missing `prd.json`; for `heal` and `analyze --fix`: missing `[roles.analyzer]`). A missing config is **not** this class — it exits `2` |
| `4`  | State mismatch requiring `--reset` (a `prd_hash` mismatch with no valid heal-log chain to reconcile); no run state yet (`report`, `verify`); the pre-flight model probe rejected a model; or `doctor` reported a blocking finding |
| `5`  | One or more tasks finished `failed` or `blocked-by-dependency`                               |
| `6`  | Iteration budget exhausted (`--max-iterations`, incl. under `analyze --fix`)                 |
| `7`  | `analyze --fix` thrash detected (warning count non-decreasing across the last 3 iterations)  |
| `8`  | `analyze --fix` halted — the LLM produced an unparseable PRD; last-good iteration preserved  |
| `9`  | Every task passed, but the run-end [completion gate](usage.md#the-completion-gate) failed or timed out (v1.21.0) |

CI wrappers can branch cleanly on `5` (a task failed) vs `9` (every task passed, the repository is still broken) vs `6` (budget) vs `7`/`8` (analyze-fix didn't converge) — see the [CI integration example](usage.md#ci-integration). The same table ships in the binary: `zurdo help exit-codes`.

<div class="callout callout--warning" markdown="1">
**Changed in v1.10.0** `zurdo validate` and `zurdo verify` now exit `2` rather than `1` on a PRD parse failure or a structural validation error, matching the meaning `2` has always carried elsewhere. A CI wrapper that distinguishes the two codes will observe this; one checking `!= 0` is unaffected.
</div>

Next: [Configuration](configuration.md)
