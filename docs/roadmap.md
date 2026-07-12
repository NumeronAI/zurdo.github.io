---
layout: default
title: Roadmap
nav_order: 9
---

# Roadmap
{: .no_toc }

What's moving in zurdo, relative to the released **v1.1.3** these docs describe. Items here are subject to change until they ship.

1. TOC
{:toc}

## Coming in the next release

These are implemented on the main branch and land with the next tag.

### Line-anchored grep patterns

`[grep:]` / `[no-grep:]` patterns will compile in **multi-line mode**: `^` and `$` anchor at line boundaries, the way command-line `grep` users expect. Today they anchor to the start/end of the whole file, so a hint like `[grep: ^## Heading in doc.md]` can never pass unless the file *begins* with the heading — a silent "pattern not matched" even when the agent wrote the content correctly.

The new semantics apply uniformly to the run-time evaluator and the `validate`/`--analyze` grep lints, so authoring-time verdicts match run-time verdicts. Patterns without anchors are unaffected; explicit `(?m)` prefixes remain valid and become redundant. An existing anchored `[no-grep:]` hint may flip from pass to fail — that flip is the check finally seeing the line it was aimed at.

### Pre-flight criterion provenance

Pre-flight already runs every criterion before the agent does; the next release **keeps** that snapshot instead of discarding it. Each task's `prd.json` entry records a per-criterion pre-flight verdict, captured once when the task first leaves `pending` — separating "the agent made this criterion true" from "this criterion was already true."

On top of it, a criterion that was already green at pre-flight is flagged in live progress with the tail `already passed at pre-flight — proves nothing about this run`, and the summary table gains a `passed-at-preflight` tally. This is provenance, not policy: exit codes and status transitions are unaffected — legitimate pre-flight-green cases exist (resumed runs, idempotent re-runs, criteria a dependency already satisfied). The point is that a human reading the report can weigh the evidence.

### Baseline tree capture

Before the first task is evaluated, `zurdo run` will snapshot the working tree as you handed it over — tracked, modified, and untracked files alike — recording a git tree hash and capture metadata at `.zurdo/<slug>/baseline`. This answers "what was already there" for the whole run, so later stages can tell the agent's edits apart from the tree it started from.

The capture never touches your git state: it stages into a scratch index via `GIT_INDEX_FILE`, leaving `.git/index` and the reflog byte-for-byte unchanged. Outside a git repo (or with no usable `git` on `PATH`) it degrades to a single warning and the run proceeds normally.

## In development

The next milestone deepens the same theme — **evidence you can trust** — building on the baseline capture:

- **Run-diff capture.** Compute and persist everything a run changed, as a patch under `.zurdo/<slug>/`.
- **Evidence-modified warnings.** When the run itself modified a file that a `grep:`/`no-grep:`/`file-exists:`/`file-absent:` hint reads as evidence, the report says so. A warning, never a failure — often the task *is* "edit that file" — but it goes on the record.
- **Frozen paths.** An enforcement tier: glob-declared paths the agent must not touch (run-wide in config, or per task in PRD metadata). Any frozen path in the run diff fails the iteration regardless of criteria results.
- **Evidence-first PRD authoring.** The bundled `zurdo-prd-author` skill is being reworked to start from the evidence — criteria are drafted first and tasks derived from them, instead of the reverse.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1.1.3   | 2026-07-02 | `--analyze` prompts now reference all seven hint types (the analyzer previously never suggested absence hints). |
| 1.1.2   | 2026-07-01 | Parser accepts `### Requirements` in its documented position (before `### Description`).             |
| 1.1.1   | 2026-06-26 | Bundled `zurdo-prd-author` skill's grammar reference updated for Requirements/`[proves:]`.           |

Found a bug, or want to influence what ships next? [Open an issue](https://github.com/ElOrlis/zurdo-dist/issues).
