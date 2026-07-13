---
layout: default
title: Providers
nav_order: 9
---

# Providers
{: .no_toc }

1. TOC
{:toc}

Zurdo drives coding agents exclusively through their **CLIs** — it shells out to the binary on your `PATH`, using whatever authentication you've already set up. There are no SDKs, no API calls from zurdo itself, and no credentials to hand over.

| Provider  | CLI binary | Docs                                                                | Auth                                   |
| --------- | ---------- | -------------------------------------------------------------------- | --------------------------------------- |
| Anthropic | `claude`   | [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)  | `claude login` or `ANTHROPIC_API_KEY`  |
| OpenAI    | `codex`    | [Codex CLI](https://github.com/openai/codex)                          | `codex login` or `OPENAI_API_KEY`      |
| GitHub    | `copilot`  | [Copilot CLI](https://github.com/github/gh-copilot)                   | `copilot auth login` or `GITHUB_TOKEN` |

For flags, model availability, and CLI behavior beyond what's here, the vendor docs above are authoritative — those CLIs evolve on their own schedules.
{: .note }

## Selecting a provider

The executor provider is one line in `.zurdo/config.toml`:

```toml
[roles.executor]
provider = "anthropic"    # or "codex" or "copilot"
```

`zurdo init` writes all three `[providers.*]` and `[effort_map.*]` blocks, so switching is just editing that line. The analyzer role (used by `--analyze`) is configured independently and may use a different provider than the executor.

Each `[providers.<name>]` block lets you rename the binary (if yours isn't on `PATH` under the default name) and append extra arguments to every invocation:

```toml
[providers.anthropic]
cli        = "claude"
extra_args = []
```

## Models and the effort map

Zurdo never hardcodes a model. Each task's `**Effort**` label is looked up in `[effort_map.<provider>]` to pick the model for that invocation — cheap models for trivial tasks, strong models for gnarly ones, in one PRD. See [Configuration](configuration.md#the-effort-map).

### The model probe

Before a run, zurdo probes every mapped model against its provider CLI to catch typos and plan-gated models **before** any task starts. A rejected model fails pre-flight with exit `4`.

```sh
zurdo check-models          # probe the existing config, write nothing
zurdo init --check-models   # probe as part of init
```

`zurdo check-models` prints a status table with a row per `effort_map` entry plus each configured analyzer model, and exits `0` when everything is available or `4` on any unknown/unsupported entry — same semantics as the `run` pre-flight. Bypass the probe with `--skip-model-check` (useful in CI against stubbed CLIs).

### Copilot and `auto`

The default Copilot effort map uses `auto`, which lets the Copilot CLI pick the model. Concrete dotted ids (e.g. `claude-sonnet-4.6`) are plan-gated — whether they work depends on your Copilot subscription. Probe with `zurdo check-models` before relying on one.

## Skill prefixes

Skills are invoked with different sigils per CLI: `/skill-name` for Anthropic and Copilot, `$skill-name` for Codex. List **bare names** in PRD `**Skills**` metadata — zurdo applies the right prefix at prompt-render time for whichever provider is executing. Never hand-prefix skill names in a PRD.

Bundled-skill installs also go to provider-specific discovery paths: `.claude/skills/<name>/` for Anthropic, `.agents/skills/<name>/` for Codex and Copilot. `zurdo skills install <name> --provider <p>` (repeatable) or `--all-providers` targets them explicitly.

## Cost visibility

The run banner shows the active provider and its resolved effort map, and each iteration reports the model used, token counts, and an estimated cost — so a misconfigured map is visible before and during the run, not after the bill.

Next: [Roadmap](roadmap.md)
