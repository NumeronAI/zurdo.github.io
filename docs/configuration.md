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

[roles.analyzer]                  # required for --analyze
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
medium = "auto"                      # are plan-gated; probe with `zurdo check-models`
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
enabled          = false
languages        = ["rust", "python", "go", "typescript", "javascript"]
max_file_bytes   = 2097152
gc_grace_minutes = 10

[experimental]                    # feature gates — all default false
structural_hints = false          # requires [lumen] enabled = true

[vela]                            # background index watcher — off by default
enabled = false
```

## Roles

**Executor** is the agent that does the work. It has no fixed model — the model is chosen per task from the effort map, keyed by the task's `**Effort**` metadata. Switching provider is a one-line edit to `[roles.executor] provider`.

**Analyzer** powers `--analyze`'s LLM critique of your PRD. It names a concrete model directly (analysis doesn't vary by task effort). If you never use `--analyze`, it sits unused.

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

Before a run, zurdo probes each mapped model against its provider CLI (the *model probe*); an unknown or plan-gated model fails pre-flight with exit `4`. Check without running via `zurdo check-models`, or bypass with `--skip-model-check`. See [Providers](providers.md).

## Defaults and timeouts

| Key                              | Meaning                                                                            | Default |
| -------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| `defaults.max_attempts`          | Per-task attempt budget when the PRD omits `**Max-Attempts**`.                      | `3`     |
| `defaults.max_total_iterations`  | Cap on agent invocations across the whole run; `0` = unlimited. Overridable with `--max-iterations`. | `0`     |
| `defaults.parallel_criteria`     | Run a task's criteria concurrently instead of sequentially. Enable only if every `shell:`/`http:` criterion is hermetic — parallel non-hermetic checks can interfere with each other. | `false` |
| `defaults.analyzer_parallelism`  | Concurrent analyzer LLM calls during `--analyze` (range 1–16; `1` preserves fully sequential behavior). | `4`     |
| `timeouts.criterion_seconds`     | Time limit per `shell:`/`http:` hint execution (file/grep checks are local and unbounded). | `300`   |
| `timeouts.agent_seconds`         | Time limit per agent invocation when the task omits `**Agent-timeout**`.            | `1800`  |

## Providers

Each `[providers.<name>]` block names the CLI binary zurdo shells out to and optional `extra_args` appended to every invocation. The binary must be on your `PATH` and authenticated — zurdo holds no credentials of its own. Details on how each CLI is driven are on the [Providers](providers.md) page.

## Protected paths

An optional `[verification]` table declares run-wide **frozen globs** — paths no agent may modify during any task of a run:

```toml
[verification]
protected_paths = ["Cargo.lock", "docs/**/*.md"]
```

These are enforced in union with each task's `**Frozen**` metadata: after every iteration, any protected path appearing in the diff against the run-start baseline fails the iteration regardless of criteria results. Patterns are root-anchored; `*` stays within one path segment, `**` crosses directories, negation is not supported. Enforcement requires the baseline capture, so outside a git repo it degrades to a warning. See [How it works](how-it-works.md#evidence-integrity).

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
| `lumen.enabled`           | Build and maintain the index.                                    | `false` |
| `lumen.languages`         | Languages indexed. Recognized: `rust`, `python`, `go`, `typescript`, `javascript`. | all five |
| `lumen.max_file_bytes`    | Files larger than this are skipped.                              | `2097152` |
| `lumen.gc_grace_minutes`  | Index generations older than this window become GC-eligible.     | `10`    |

The experimental `[symbol:]`/`[references:]`/`[callers:]` hint types additionally require the `[experimental] structural_hints = true` gate; setting the gate while `lumen.enabled = false` is a config-load error. See [Structural hints](hints.md#structural-hints-experimental). A PRD with no structural hints never touches the index.

## The Vela watcher

`[vela]` configures the optional background watcher that keeps the Lumen index fresh between runs — a freshness optimization, never required for correctness:

| Key                  | Meaning                                                      | Default |
| -------------------- | ------------------------------------------------------------- | ------- |
| `vela.enabled`       | Auto-start the watcher from structural operations.           | `false` |
| `vela.idle_minutes`  | Idle window before a watcher-triggered reindex.              | `30`    |
| `vela.debounce_ms`   | Debounce window for filesystem events.                       | `200`   |

Manage it explicitly with `zurdo vela serve|start|stop|status`; `zurdo lumen status` also reports the watcher's state.

## Reason: diagnosis and lessons

The `[reason]` table and `[roles.reasoner]` opt into stall diagnosis and the cross-run lesson library. They are accepted in config but **not seeded by `zurdo init`** — the full key reference, defaults, and lifecycle live on [Diagnosis & lessons](reason.md#configuration).

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

## Precedence

Command-line flags override config values (e.g. `--max-iterations` beats `defaults.max_total_iterations`); PRD task metadata overrides config defaults for that task (`**Max-Attempts**`, `**Agent-timeout**`).

Next: [Providers](providers.md)
