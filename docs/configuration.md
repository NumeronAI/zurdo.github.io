---
layout: default
title: Configuration
nav_order: 7
---

# Configuration
{: .no_toc }

1. TOC
{:toc}

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
max_attempts         = 5          # per-task fallback
max_total_iterations = 0          # 0 = unlimited

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
```

## Roles

**Executor** is the agent that does the work. It has no fixed model — the model is chosen per task from the effort map, keyed by the task's `**Effort**` metadata. Switching provider is a one-line edit to `[roles.executor] provider`.

**Analyzer** powers `--analyze`'s LLM critique of your PRD. It names a concrete model directly (analysis doesn't vary by task effort). If you never use `--analyze`, it sits unused.

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
| `defaults.max_attempts`          | Per-task attempt budget when the PRD omits `**Max-Attempts**`.                      | `5`     |
| `defaults.max_total_iterations`  | Cap on agent invocations across the whole run; `0` = unlimited. Overridable with `--max-iterations`. | `0`     |
| `timeouts.criterion_seconds`     | Time limit per `shell:`/`http:` hint execution (file/grep checks are local and unbounded). | `300`   |
| `timeouts.agent_seconds`         | Time limit per agent invocation when the task omits `**Agent-timeout**`.            | `1800`  |

## Providers

Each `[providers.<name>]` block names the CLI binary zurdo shells out to and optional `extra_args` appended to every invocation. The binary must be on your `PATH` and authenticated — zurdo holds no credentials of its own. Details on how each CLI is driven are on the [Providers](providers.md) page.

## Skills search paths

Skills referenced in a task's `**Skills**` metadata are user-managed. Beyond the provider's native discovery paths (project-scope `.claude/skills/` or `.agents/skills/`, and their global equivalents), you can register extra directories:

```toml
[skills]
search_paths = ["tools/skills", "/opt/shared-skills"]
```

Zurdo checks these at pre-flight (warn-only if a named skill is missing) but never installs or modifies user-managed skills.

## Precedence

Command-line flags override config values (e.g. `--max-iterations` beats `defaults.max_total_iterations`); PRD task metadata overrides config defaults for that task (`**Max-Attempts**`, `**Agent-timeout**`).

Next: [Providers](providers.md)
