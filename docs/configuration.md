---
# Page settings
layout: default
comments: false

# Hero section
title: Configuration
description: "The .zurdo/config.toml reference."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Commands
        url: '/docs/commands.html'
    next:
        content: Providers
        url: '/docs/providers.html'
---

Zurdo reads its configuration from `.zurdo/config.toml` at the **repo root** — per repository, not per user. `zurdo init` writes the default shown below.

## The default config

```toml
[roles.executor]
provider = "anthropic"            # or "codex" or "copilot"
# model is determined by [effort_map.<provider>] below

[roles.analyzer]                  # required for zurdo analyze / heal
provider = "anthropic"
model    = "claude-haiku-4-5"

[effort_map.anthropic]
low    = "claude-haiku-4-5"
medium = "claude-sonnet-4-6"
high   = "claude-opus-4-7"

[effort_map.codex]
low    = "gpt-5.5"
medium = "gpt-5.5"
high   = "gpt-5.5"

[effort_map.copilot]                # `auto` lets the Copilot CLI pick the model
low    = "auto"                      # concrete dotted ids (e.g. claude-sonnet-4.6)
medium = "auto"                      # are plan-gated; probe with `zurdo doctor`
high   = "auto"

[defaults]
max_attempts         = 3          # per-task fallback
max_total_iterations = 0          # 0 = unlimited
parallel_criteria    = false      # true only if every shell/http criterion is hermetic
analyzer_parallelism = 4          # concurrent analyzer LLM calls (1–16)

[timeouts]
criterion_seconds = 300           # shell + http only
agent_seconds     = 1800

[providers.anthropic]
cli        = "claude"
extra_args = []

[providers.codex]
cli        = "codex"
extra_args = []

[providers.copilot]
cli        = "copilot"
extra_args = []

[lumen]                           # structural code index — off by default
enabled          = false          # also the only gate on structural hints
languages        = ["rust", "python", "go", "typescript", "javascript"]
max_file_bytes   = 2097152
gc_grace_minutes = 10

[experimental]                    # no gate currently lives here; kept for future opt-ins

[vela]                            # background index watcher — off by default
enabled = false

[mcp]                             # hand zurdo's MCP server to the executor — off by default
inject_server        = false      # also requires [lumen] enabled = true
strict_claude_config = false      # claude only: --strict-mcp-config hides your other servers

[mcp.adapters]                    # per-provider injection gates
anthropic = true
codex     = true
copilot   = false                 # org policy can block third-party MCP servers there
```

## Roles

**Executor** is the agent that does the work. It has no fixed model — the model is chosen per task from the effort map, keyed by the task's `**Effort**` metadata. Switching provider is a one-line edit to `[roles.executor] provider`.

**Analyzer** powers `zurdo analyze`'s LLM critique of your PRD and `zurdo heal`'s re-aim proposals. It names a concrete model directly (analysis doesn't vary by task effort). If you never use `analyze` or `heal`, it sits unused.

**Reasoner** (optional, `[roles.reasoner]` — same `provider`/`model` shape as the analyzer) powers the opt-in [reason subsystem](reason.md)'s diagnosis and lesson-extraction calls. When absent, those calls fall back to `[roles.analyzer]`. Enabling `[reason]` with neither role configured is a config-load error.

## The effort map

`[effort_map.<provider>]` maps effort labels to model ids per provider. A PRD's `**Effort**` value must be a key in the **active executor's** map — the labels are not a fixed enum, so you can define your own tiers:

```toml
[effort_map.anthropic]
trivial = "claude-haiku-4-5"
normal  = "claude-sonnet-4-6"
gnarly  = "claude-opus-4-7"
```

With that map, `**Effort**: gnarly` is valid and `**Effort**: medium` is rejected at pre-flight. The default config defines `low | medium | high` for all three providers, so most users never think about this.

Before a run, zurdo probes each mapped model against its provider CLI (the *model probe*); an unknown or plan-gated model fails pre-flight with exit `4`. Check without running via [`zurdo doctor`](commands.md#zurdo-doctor--diagnose-the-environment), or bypass with `--skip-model-check`. See [Providers](providers.md).

## Defaults and timeouts

| Key                              | Meaning                                                                            | Default |
| -------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| `defaults.max_attempts`          | Per-task attempt budget when the PRD omits `**Max-Attempts**`.                      | `3`     |
| `defaults.max_total_iterations`  | Cap on agent invocations across the whole run; `0` = unlimited. Overridable with `--max-iterations`. | `0`     |
| `defaults.parallel_criteria`     | Run a task's criteria concurrently instead of sequentially. Enable only if every `shell:`/`http:` criterion is hermetic — parallel non-hermetic checks can interfere with each other. | `false` |
| `defaults.analyzer_parallelism`  | Concurrent analyzer LLM calls during `zurdo analyze` (range 1–16; `1` preserves fully sequential behavior). | `4`     |
| `timeouts.criterion_seconds`     | Time limit per `shell:`/`http:` hint execution (file/grep checks are local and unbounded). | `300`   |
| `timeouts.agent_seconds`         | Time limit per agent invocation when the task omits `**Agent-timeout**`.            | `1800`  |
| `timeouts.completion_seconds`    | Time limit for the run-end [completion gate](#the-completion-gate). Not seeded by `zurdo init`. A timeout counts as a gate failure (exit `9`). | `900`   |

A single `[shell:]` hint can override `criterion_seconds` with a trailing `timeout:<N>(s|m|h)` token; `[http:]` hints can't — see [Timeouts](hints.md#timeouts).

## Providers

Each `[providers.<name>]` block names the CLI binary zurdo shells out to and optional `extra_args` appended to every invocation. The binary must be on your `PATH` and authenticated — zurdo holds no credentials of its own. Details on how each CLI is driven are on the [Providers](providers.md) page.

## The `[verification]` table

`[verification]` is optional and **not seeded by `zurdo init`**. It holds three run-wide settings:

```toml
[verification]
protected_paths    = ["Cargo.lock", "docs/**/*.md"]
prime_context      = true                       # the default
completion_command = "cargo test --workspace && cargo clippy --all-targets -- -D warnings"
```

| Key                                   | Meaning                                                                         | Default |
| ------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| `verification.protected_paths`        | Run-wide frozen globs ([below](#protected-paths)).                              | `[]`    |
| `verification.prime_context`          | Give the executor prompt an `# Evidence Paths` section ([below](#context-priming)). Set `false` to go back to the pre-v1.14 prompt. | `true` |
| `verification.completion_command`     | The run-end [completion gate](#the-completion-gate). No gate runs when this is unset. | unset |

### Protected paths

`protected_paths` names paths no agent may modify during **any** task of a run. It applies to every task whether or not that task declares its own `**Frozen**` globs; a task's `**Frozen**` globs add to the list for that task and can never narrow it. After every iteration, any protected path appearing in the diff against that task's baseline (captured at its first attempt, reused across retries) fails the iteration regardless of criteria results. Patterns are root-anchored; `*` stays within one path segment, `**` crosses directories, negation is not supported. Enforcement requires the baseline capture, so outside a git repo it degrades to a warning. See [How it works](how-it-works.md#evidence-integrity).

`zurdo validate` warns when a criterion points at a protected path it can't satisfy without touching it — the [`frozen-overlap`](hints.md#the-warn-lint-families) lint.

### Context priming

Since v1.14.0 every executor prompt carries an `# Evidence Paths` section, rendered between `# Acceptance Criteria` and `# Available Skills` from the first attempt on. It lists every file the task's own criteria point at (`[file-exists:]`, `[file-absent:]`, `[grep:]`, `[no-grep:]`, and the structural hints), each annotated with what the agent can't cheaply find out on its own: whether the path **exists yet** (a missing path names a file the task must create) and whether it is **frozen** for this task. An agent learns a path is untouchable by reading the prompt instead of by editing it and failing an iteration. Tasks whose hints are all `[shell:]`, `[http:]`, or `[manual]` get no section. `prime_context = false` is the kill switch.

### The completion gate

A run can finish with every criterion green and the repository still broken — a criterion proves one task's requirement, and nothing checks the whole suite unless every PRD remembers to add that criterion. `completion_command` (v1.21.0) states that repository-wide rule once, in config:

- **When it runs.** Once, at run end, when every task is `passed` or `passed-pending-review` (a pending `[manual]` review doesn't hold it back). A run with a `failed` or `blocked-by-dependency` task exits `5` and never reaches the gate. It **also runs on resume** — including a resume of an already-complete run — because the rule concerns the working tree, not a particular run.
- **What it is.** One shell command string; chain steps with `&&`. There's no list form and no per-PRD override. It isn't a criterion: it proves no requirement, belongs to no task, never changes a task's status, and `zurdo verify` doesn't run it. `zurdo heal` never runs it.
- **Budget.** `[timeouts] completion_seconds` (default `900`), separate from `criterion_seconds`.
- **Outcome.** `passed`, `failed`, or `timed-out`. Either failure exits `9` — distinct from `5`, so CI can tell "a task failed" from "every task passed and the repo is broken". The run summary shows the failing command and its output, `zurdo state list` shows it in a `gate` column, and `zurdo report` carries the full record (text and JSON).

A repository that sets no `completion_command` behaves exactly as before. See [The completion gate](usage.md#the-completion-gate) for how it looks in a run.

## Skills search paths

Skills referenced in a task's `**Skills**` metadata are user-managed. Beyond the provider's native discovery paths (project-scope `.claude/skills/` or `.agents/skills/`, and their global equivalents), you can register extra directories:

```toml
[skills]
search_paths = ["tools/skills", "/opt/shared-skills"]
```

Zurdo checks these at pre-flight (warn-only if a named skill is missing) but never installs or modifies user-managed skills.

## Lumen and structural hints

`[lumen]` controls the optional **structural code index** at `.zurdo/lumen/` — repo-scoped, shared by every PRD:

| Key                       | Meaning                                                          | Default |
| ------------------------- | ----------------------------------------------------------------- | ------- |
| `lumen.enabled`           | Build and maintain the index — **and** the sole gate allowing `[symbol:]`/`[references:]`/`[callers:]` hints in a PRD. | `false` |
| `lumen.languages`         | Languages indexed. Recognized: `rust`, `python`, `go`, `typescript`, `javascript`. | all five |
| `lumen.max_file_bytes`    | Files larger than this are skipped.                              | `2097152` |
| `lumen.gc_grace_minutes`  | Index generations older than this window become GC-eligible.     | `10`    |

Since **v1.9.0** `lumen.enabled` is the *only* switch the `[symbol:]`/`[references:]`/`[callers:]` hint types need — the old `[experimental] structural_hints` gate is deprecated and ignored (it still parses, so pre-1.9 configs keep loading, but it warns on stderr and decides nothing). A PRD with no structural hints never touches the index. The full subsystem — index lifecycle, per-language capabilities, `zurdo lumen` CLI — is on [Structural verification](lumen.md).

## The Vela watcher

`[vela]` configures the optional background watcher that keeps the Lumen index fresh between runs — a freshness optimization, never required for correctness:

| Key                  | Meaning                                                      | Default |
| -------------------- | ------------------------------------------------------------- | ------- |
| `vela.enabled`       | Auto-start the watcher from structural operations.           | `false` |
| `vela.idle_minutes`  | The daemon shuts itself down after this long with no filesystem events and no client connections. `0` disables the timeout. | `30`    |
| `vela.debounce_ms`   | Debounce window coalescing bursty filesystem events.         | `200`   |

Manage it explicitly with `zurdo vela serve|start|stop|status`; `zurdo lumen status` also reports the watcher's state. Full daemon semantics are on [Structural verification](lumen.md#the-vela-watcher).

## MCP server injection

`[mcp]` (v1.24.0) lets `zurdo run` register [`zurdo mcp serve`](mcp.md) with the executor it launches, so the agent can query the structural index during the run instead of re-reading the tree:

| Key                         | Meaning                                                                                       | Default |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| `mcp.inject_server`         | Master switch. Fires only when `[lumen] enabled = true` too.                                   | `false` |
| `mcp.strict_claude_config`  | Also pass `--strict-mcp-config` to `claude`, which ignores every other MCP server you configured. | `false` |
| `mcp.adapters.anthropic`    | Inject into the `claude` executor.                                                            | `true`  |
| `mcp.adapters.codex`        | Inject into the `codex` executor.                                                             | `true`  |
| `mcp.adapters.copilot`      | Inject into the `copilot` executor. Off because an organization's Copilot policy can block third-party MCP servers. | `false` |

With injection off, the executor's command line is exactly what it was before the feature existed. A registration that can't be written is a warning; the run continues without it. Per-provider spellings and the server's tools are on [Agent access (MCP)](mcp.md).

## Reason: diagnosis and lessons

The `[reason]` table and `[roles.reasoner]` configure stall diagnosis and the [lesson library](reason.md#lessons). `[reason] enabled` switches on only the reasoner calls made on a stall — since v1.14.0, reading and injecting committed lessons needs no switch. Both are accepted in config but **not seeded by `zurdo init`** — the full key reference, defaults, and lifecycle live on [Diagnosis & lessons](reason.md#configuration).

## Pricing overrides

The cost estimates in the run banner and summary come from a built-in per-model price table covering every default-config model. Optional `[pricing.<model>]` blocks override it — to correct a stale rate, alias a self-hosted model, or apply a discount — without rebuilding zurdo:

```toml
[pricing.claude-sonnet-4-6]
input       = 3.00      # USD per million tokens; required
output      = 15.00     # required
cache_write = 3.75      # optional
cache_read  = 0.30      # optional
```

Copilot bills in premium requests rather than tokens, so its override is a request rate plus per-model multipliers (`default` covers `auto` and any unmapped id):

```toml
[pricing.copilot]
request_rate = 0.04

[pricing.copilot.multipliers]
default            = 1.0
"claude-haiku-4.5" = 0.33
```

Negative values are rejected at config load.

Prices are looked up by **exact model id**. A dated Anthropic pin such as `claude-haiku-4-5-20251001` in `[effort_map.anthropic]` does not fall back to the undated `claude-haiku-4-5` row, so the run's cost estimate is marked `partial` — add a `[pricing.<dated-id>]` block if you pin one.

## Precedence

Command-line flags override config values (e.g. `--max-iterations` beats `defaults.max_total_iterations`); PRD task metadata overrides config defaults for that task (`**Max-Attempts**`, `**Agent-timeout**`).

Next: [Providers](providers.md)
