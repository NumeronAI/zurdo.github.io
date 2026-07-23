---
# Page settings
layout: default
comments: false

# Hero section
title: Roadmap
description: "What's coming in the next release and what's in development."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Providers
        url: '/docs/providers.html'
---

What's moving in zurdo, relative to the released **v1.6.0** these docs describe. Items here are subject to change until they ship.

## Just shipped: v1.6.0 (2026-07-23)

The capstone of the **self-healing loop** arc (v1.3 → v1.6). Everything below is documented in the main docs; highlights:

- **The reason subsystem, complete.** Stall detection on failure fingerprints, one-call reasoner diagnosis with `retry_with_guidance` / `halt_task` / `suggest_heal` verdicts, and a repository-scoped **lesson library**: a task that stalls and then recovers leaves behind a rule future runs are told about before they trip over the same quirk. Opt-in, fail-open, and never able to mark work passed. [Details](reason.md).
- **Lessons reach every authoring surface.** The `zurdo reason match` preview CLI, a lessons section in `--analyze`, lesson injection into `--heal` proposals, and read-only lesson consultation by the bundled `zurdo-prd-author` and `zurdo-hint-debugger` skills.
- **Structural hints, executable end-to-end** (v1.3–1.4, experimental). `[symbol:]`, `[references:]`, and `[callers:]` verify facts about named code symbols against the persistent Lumen index, with the optional Vela watcher keeping it fresh. [Details](hints.md#structural-hints-experimental).
- **A readable live tee** (v1.5). Agent output renders as step summaries on a TTY (`• tool Bash: …`, `• edit: …`) for all three provider CLIs; `--raw-agent` restores the firehose. [Details](usage.md#reading-the-agent-as-it-works).

## In development

The current milestone reworks how you drive and read zurdo day to day:

- **First-class subcommands** — `zurdo analyze` and `zurdo heal`, promoted out of `run --analyze` / `run --heal` (the old forms keep working).
- **A richer help system** — more useful per-command `--help` plus `zurdo help <topic>` guide pages.
- **An interactive review TUI** — `zurdo review <prd>` to walk per-task evidence and sign off `[manual]` criteria without leaving the terminal.

Nothing here is committed until it ships — watch this page after the next release, or [open an issue](https://github.com/ElOrlis/zurdo-dist/issues) to influence what comes next.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1.6.0   | 2026-07-23 | Lesson library + cross-surface lesson reads: `zurdo reason` CLI, lessons in `--analyze`/`--heal` and the authoring skills. |
| 1.5.0   | 2026-07-23 | Live agent tee renders step summaries on a TTY; `--raw-agent` opt-out; claude adapter streams JSONL. |
| 1.4.1   | 2026-07-22 | Structural hints verify the current working tree; per-occurrence binding ambiguity fix.              |
| 1.4.0   | 2026-07-22 | `[references:]`/`[callers:]` executable via the deterministic binding engine; Vela watcher (`zurdo vela`). |
| 1.3.0   | 2026-07-20 | Lumen structural index (`zurdo lumen`), experimental `[symbol:]` hints, stall detection groundwork.   |
| 1.2.0   | 2026-07-12 | Evidence-first verification: baseline capture, pre-flight provenance, evidence-modified warnings, frozen paths, retry-prompt feedback, line-anchored grep. |
| 1.1.3   | 2026-07-02 | `--analyze` prompts now reference all seven hint types (the analyzer previously never suggested absence hints). |
| 1.1.2   | 2026-07-01 | Parser accepts `### Requirements` in its documented position (before `### Description`).             |
| 1.1.1   | 2026-06-26 | Bundled `zurdo-prd-author` skill's grammar reference updated for Requirements/`[proves:]`.           |

Found a bug, or want to influence what ships next? [Open an issue](https://github.com/ElOrlis/zurdo-dist/issues).
