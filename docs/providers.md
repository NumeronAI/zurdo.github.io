---
# Page settings
layout: default
comments: false

# Hero section
title: Providers
description: "How zurdo drives the claude, codex, and copilot CLIs."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Configuration
        url: '/docs/configuration.html'
    next:
        content: Roadmap
        url: '/docs/roadmap.html'
---

Zurdo drives coding agents exclusively through their **CLIs** — it shells out to the binary on your `PATH`, using whatever authentication you've already set up. There are no SDKs, no API calls from zurdo itself, and no credentials to hand over.

| Provider  | CLI binary | Docs                                                                | Auth                                   |
| --------- | ---------- | -------------------------------------------------------------------- | --------------------------------------- |
| Anthropic | `claude`   | [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)  | `claude login` or `ANTHROPIC_API_KEY`  |
| OpenAI    | `codex`    | [Codex CLI](https://github.com/openai/codex)                          | `codex login` or `OPENAI_API_KEY`      |
| GitHub    | `copilot`  | [Copilot CLI](https://github.com/github/gh-copilot)                   | `copilot auth login` or `GITHUB_TOKEN` |

<div class="callout callout--info" markdown="1">
**Note** For flags, model availability, and CLI behavior beyond what's here, the vendor docs above are authoritative — those CLIs evolve on their own schedules.
</div>

## Selecting a provider

The executor provider is one line in `.zurdo/config.toml`:

```toml
[roles.executor]
provider = "anthropic"    # or "codex" or "copilot"
```

`zurdo init` writes all three `[providers.*]` and `[effort_map.*]` blocks, so switching is just editing that line. The analyzer role (used by `zurdo analyze` and `zurdo heal`) is configured independently and may use a different provider than the executor.

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
zurdo doctor                # probe the existing config, write nothing
zurdo init --check-models   # probe as part of init
```

`zurdo doctor`'s `models` section prints a status row per `effort_map` entry plus each configured analyzer model, and reports `4` on any unknown/unsupported entry — same semantics as the `run` pre-flight. Bypass the probe at run time with `--skip-model-check` (useful in CI against stubbed CLIs), or suppress every provider spawn in doctor itself with `--skip-probes`.

<div class="callout callout--info" markdown="1">
**`zurdo check-models` is deprecated** since v1.9.0 in favor of `zurdo doctor`, which probes the same rows and adds the vocabulary canary below. It is retained through 1.x with behavior and exit codes unchanged so existing scripts keep working, and prints one stderr deprecation line per invocation.
</div>

### Copilot and `auto`

The default Copilot effort map uses `auto`, which lets the Copilot CLI pick the model. Concrete dotted ids (e.g. `claude-sonnet-4.6`) are plan-gated — whether they work depends on your Copilot subscription. Probe with `zurdo doctor` before relying on one.

## Event streams and the vocabulary

Zurdo parses each CLI's structured event stream to read assistant text, render [live step summaries](usage.md#reading-the-agent-as-it-works), and build the [reasoner's narrative projection](reason.md#what-the-reasoner-actually-reads). Since v1.10.0 the shapes each provider emits live in a single shared **vocabulary descriptor**, verified against checked-in captures of real provider streams rather than hand-written fakes — one definition consumed by both the provider adapters and the step summarizer, so the two can't drift apart.

### The vocabulary canary

Provider CLIs change their event shapes on their own schedules, and a vocabulary that has silently gone stale is hard to spot: the run keeps working (the executor role doesn't consume assistant text) while every analyzer-role surface fails. The **canary** warns when a provider's stream *parses* but yields no extractable assistant text — the signature of an upstream change.

It runs in three places, all non-blocking: at `zurdo run` pre-flight over the stdout the model probe already captured (zero extra spawns), at most once per run on the agent path for a cleanly-exited iteration that produced events but no text, and as `zurdo doctor`'s `vocabulary` section. A reported gap is advisory — it never gates an exit code.

Relatedly, a `CompletionCli` parse failure now names the **cause** rather than only the symptom: it reports the event inventory the stream actually carried (event count, unclassified event types, bookkeeping event types), so a vocabulary change is identifiable from one line of output.

<div class="callout callout--warning" markdown="1">
**Fixed in v1.10.0** Three provider defects worth knowing about if you're upgrading from ≤ 1.9:

- **`codex` could not extract assistant text at all**, breaking every analyzer-role surface (`analyze` LLM checks, `analyze --fix`, `heal` propose, reason blocks, lesson extraction) with `codex JSONL event stream did not contain an assistant message event`. The adapter recognized `message` / `response.completed` events that no shipped codex release emits; the text has always lived in `item.completed` → `item.text`. The executor role, token accounting, iteration captures, and criterion verification were never affected.
- **`copilot` live step summaries were empty** — an entire task rendered as a single misleading `• result (done)` line. Both providers' `result` shapes are now disambiguated by payload (claude's carries `subtype` and no `exitCode`; copilot's the reverse), and copilot's result line reports premium requests rather than a dollar cost.
- **Copilot quota exhaustion classified as permanent instead of transient**, failing the task outright instead of backing off. A quota-exhausted account reports `session.error` on stdout with stderr empty; classification now consults the parsed stream's error events, not stderr alone.
</div>

## Handing the agent zurdo's MCP server

With [`[mcp] inject_server = true`](configuration.md#mcp-server-injection) and Lumen enabled, `zurdo run` registers its own [MCP server](mcp.md) with the executor at run start, using each CLI's own per-invocation spelling: `--mcp-config` for `claude`, a pair of `-c mcp_servers.zurdo.*` overrides for `codex` (nothing is written to your persistent codex config), and `--additional-mcp-config` for `copilot`. The `copilot` gate defaults **off**, because an organization's Copilot policy can disable third-party MCP servers, and then the CLI accepts the flag but never starts the server. Details: [Agent access (MCP)](mcp.md#letting-zurdo-run-hand-the-server-to-the-agent).

## Skill prefixes

Skills are invoked with different sigils per CLI: `/skill-name` for Anthropic and Copilot, `$skill-name` for Codex. List **bare names** in PRD `**Skills**` metadata — zurdo applies the right prefix at prompt-render time for whichever provider is executing. Never hand-prefix skill names in a PRD.

Bundled-skill installs also go to provider-specific discovery paths: `.claude/skills/<name>/` for Anthropic, `.agents/skills/<name>/` for Codex and Copilot. `zurdo skills install <name> --provider <p>` (repeatable) or `--all-providers` targets them explicitly.

## Cost visibility

The run banner shows the active provider and its resolved effort map, and each iteration reports the model used, token counts, and an estimated cost — so a misconfigured map is visible before and during the run, not after the bill.

Next: [Roadmap](roadmap.md)
