---
# Page settings
layout: default
comments: false

# Hero section
title: Agent access (MCP)
description: "zurdo mcp serve — the structural index and the compound loop's own state, served to coding agents over the Model Context Protocol."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Structural verification
        url: '/docs/lumen.html'
    next:
        content: Diagnosis & lessons
        url: '/docs/reason.html'
---

An agent working a task spends much of each iteration re-deriving facts about the repository: where a type is defined, who calls a function, what a file declares. It does that by reading and grepping the tree — every iteration, from scratch. The [Lumen index](lumen.md) already knows those facts, because structural verification needs them. Since **v1.22.0** zurdo can hand them to the agent too.

There are two ways in, and they give the same answers:

- **`zurdo lumen query`** — ask the index from the command line ([details](lumen.md#asking-the-index-a-question)). For you, and for any agent that can run a shell command.
- **`zurdo mcp serve`** — a [Model Context Protocol](https://modelcontextprotocol.io) server over the same index, plus the compound loop's own state (which lessons a PRD would match, what a run recorded). For MCP clients — including the agent `zurdo run` itself launches, [when you opt in](#letting-zurdo-run-hand-the-server-to-the-agent).

Everything on this page needs `[lumen] enabled = true`.

## The server

`zurdo mcp serve` speaks MCP over stdio (protocol revision `2025-06-18`). It is launched by an MCP client's subprocess machinery, not typed at a prompt: it reads JSON-RPC frames from stdin and answers on stdout until stdin closes. It takes no flags — the repository is the working directory it starts in.

It publishes the **tools** capability only — no resources, no prompts, no sampling — and six tools in two families:

| Tool               | Family     | Argument                    | Answers with                                                                 |
| ------------------ | ---------- | --------------------------- | ----------------------------------------------------------------------------- |
| `search_symbols`   | structural | a qualified-name needle     | Definitions matching the name — exact, then trailing-segment; substring only when neither matched. Same rows as `zurdo lumen query --name`. |
| `file_outline`     | structural | a file path                 | That file's definitions in source order. Same rows as `--outline`.            |
| `find_callers`     | structural | a callee name               | Call sites whose callee resolves to that name. Same rows as `--callers`.      |
| `find_references`  | structural | an identifier name          | Identifier references to that name. Same rows as `--references`.             |
| `match_lessons`    | compound   | `prd` — a PRD path          | Per task, the [library lessons](reason.md#lessons) that would match it — the same `reason:` lines `zurdo reason match` prints. |
| `run_report`       | compound   | `prd` — a PRD path          | The run recorded for that PRD, in exactly the JSON `zurdo report --format json` produces. |

The four structural tools also take an optional `limit` (default `20`, `0` for unlimited).

Properties worth knowing:

- **One row shape, two surfaces.** Structural answers are the CLI's own tab-separated rows, not a second JSON contract — both surfaces call one renderer, so they can't spell the same fact two ways. An empty answer is the literal text `no results`, because an empty content block reads as nothing at all in most clients.
- **Fresh for every call.** The structural view is repaired before *each* structural tool call, never cached for the session. An agent that edits a file and asks again gets an answer about the file it just wrote — the same rule a [verification pass](lumen.md#the-lumen-index) follows. The compound tools never touch the structural index at all.
- **Read-only.** `match_lessons` is a preview: it stamps no reuse metadata. `run_report` writes no report file. Neither starts a run.
- **Refusals are tool results.** A PRD outside the server's repository, or one the matching CLI command would reject, comes back as a tool result with `isError: true` and the same message that command prints — never a JSON-RPC error.
- **Refuses to start on a disabled index.** With `[lumen] enabled = false` the server exits at startup with a message and writes no protocol frame, rather than completing a handshake it can never answer past.

To use it from your own MCP client, register a stdio server whose command is `zurdo` with arguments `["mcp", "serve"]`, started in the repository root.

## Letting `zurdo run` hand the server to the agent

Since **v1.24.0** a run can register `zurdo mcp serve` with the executor it launches, so the agent can query the index instead of re-reading the tree. It is **off by default**:

```toml
[lumen]
enabled = true          # required — a server with no index has nothing to answer

[mcp]
inject_server        = true    # master switch
strict_claude_config = false   # claude only; see below

[mcp.adapters]                 # per-provider gates
anthropic = true
codex     = true
copilot   = false
```

Injection fires only when `inject_server`, `[lumen] enabled`, **and** the active executor's adapter gate are all true. With any of them off, the executor's command line is byte-for-byte what it was before the feature existed.

At run start zurdo registers the **running binary** — never whatever `zurdo` is first on `PATH`, since the two can differ — once, so every attempt in the run gets the same command line. Each provider takes its own spelling:

| Provider  | How the server is registered                                                                                   | Gate default |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ------------ |
| `claude`  | `--mcp-config .zurdo/mcp-claude.json`, plus `--strict-mcp-config` only when `strict_claude_config = true`         | on           |
| `codex`   | A pair of `-c mcp_servers.zurdo.command=…` / `-c mcp_servers.zurdo.args=["mcp","serve"]` overrides — no file, and nothing written to your persistent codex config | on |
| `copilot` | `--additional-mcp-config @.zurdo/mcp-copilot.json`                                                               | **off**      |

<div class="callout callout--warning" markdown="1">
**`strict_claude_config` cuts off your other servers.** `--strict-mcp-config` tells `claude` to ignore every MCP server configured anywhere else — including one you pass through `[providers.anthropic] extra_args`. That is why it sits behind its own key, off by default, instead of following from `inject_server`.
</div>

<div class="callout callout--info" markdown="1">
**Why `copilot` defaults off.** A GitHub organization's Copilot policy can disable third-party MCP servers. Under that policy `copilot` accepts the flag, names the server back, and then never starts it — so the registration costs the agent a failed connection every iteration and returns nothing it can act on. Turn the gate on only if your organization allows third-party MCP servers.
</div>

If the registration file can't be written, the run prints `warn: MCP server registration not written (…); running without injection` and carries on. Nothing about verification depends on the server — it only saves the agent work, and every criterion is still checked by zurdo against the tree.

## Troubleshooting

| Symptom                                                     | Cause                                                                 | Fix                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `zurdo mcp serve` exits immediately with an error           | `[lumen] enabled` is `false`.                                          | Enable Lumen. The server refuses on a disabled index by design.         |
| `inject_server = true` but the agent never sees the server  | Lumen is off, or the executor's `[mcp.adapters]` gate is off (`copilot` defaults off). | Check both. All three gates must be true.                               |
| `claude` lost access to MCP servers you configured yourself | `strict_claude_config = true`.                                         | Set it back to `false` unless you want only zurdo's server.             |
| `copilot` reports third-party MCP servers are disabled      | Your organization's Copilot policy blocks them.                        | Set `[mcp.adapters] copilot = false`; nothing else in the run is affected. |
| `match_lessons` / `run_report` return an error result       | The PRD is outside the repository, fails to parse, or (for `run_report`) has no run yet. | The message is the one `zurdo reason match` / `zurdo report` would print — fix the same way. |

Next: [Diagnosis & lessons](reason.md)
