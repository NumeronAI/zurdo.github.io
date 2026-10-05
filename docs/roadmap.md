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

What's moving in zurdo, relative to the released **v1.25.0** these docs describe. Items here are subject to change until they ship.

## Just shipped: v1.22.0 – v1.25.0 (September 2026)

Four releases that make zurdo's code index **something agents can ask**, not only something the verifier reads:

- **v1.22.0 (2026-09-20) — query the index.** [`zurdo lumen query`](lumen.md#asking-the-index-a-question) answers name lookups, file outlines, and caller/reference questions from the command line, and [`zurdo mcp serve`](mcp.md) serves the same four questions to MCP clients. Resumed runs now record the evaluation that short-circuited a task (`preflight_pass` in `prd.json`, read by `zurdo report`), and `run-diff.patch` opens with a header naming the baseline it covers.
- **v1.23.0 (2026-09-21) — deeper Rust, quieter answers.** The index records enum variants, fields, and macros as their own kinds. `--name` stops padding an exact answer with substring matches.
- **v1.24.0 (2026-09-26) — agents get the server.** Two more MCP tools, `match_lessons` and `run_report`, serve the compound loop's own state. With [`[mcp] inject_server`](mcp.md#letting-zurdo-run-hand-the-server-to-the-agent), `zurdo run` registers the server with the `claude`, `codex`, or `copilot` executor it launches. Off by default.
- **v1.25.0 (2026-09-29) — Python, TypeScript/JavaScript, and Go depth.** Fields, enum members, protocols, namespaces, and import aliases are indexed in every language, and call chains render on one line. **Some names changed kind**, so a few structural hints may need re-pinning. See [the upgrade note](lumen.md#what-resolves-per-language).

## Recently shipped

**v1.21.0 (2026-09-01) — state a rule once.** The [completion gate](configuration.md#the-completion-gate) (`[verification] completion_command`, exit `9`) runs a repository-wide check once every task has passed. [Lesson obligations](reason.md#obligations-lessons-that-bind-future-prds) let a lesson require something of every PRD it applies to, enforced by the `unaddressed-lesson` lint.

**v1.20.0 (2026-08-25) — `zurdo-design-author`.** A seventh bundled skill, one level above PRD authoring: idea → design record → PRDs, with a **no number, no claim** rule for anything presented as new. [Details](writing-prds.md#authoring-with-the-bundled-skills).

**v1.19.0 (2026-08-25) — skills that call skills.** `zurdo-lessons` and `zurdo-domain` are the first *disciplines*: skills the other skills invoke mid-task by name. [Details](how-it-works.md#skills).

**v1.18.0 (2026-08-23) — two more lint families and an ignored-test fix.** `discarded-evidence` and `cached-verification`; an all-`#[ignore]`d libtest run now fails. [Details](hints.md#the-warn-lint-families).

**v1.17.0 (2026-08-22) — intent review and pre-authored tests.** The `zurdo-prd-review` skill checks a finished run against what the PRD *meant*. [Details](writing-prds.md#pre-authored-tests).

## Unreleased

Merged since v1.25.0 and planned for the next release:

- **Pyxis — search by meaning, not just by name.** Lumen answers questions about *named* code; it can't find the doc section that explains a feature, or the function whose name you don't know. Pyxis is a second, opt-in index over source symbols **and markdown prose**. It is turned on with a new `[pyxis] enabled` key, and it also needs Lumen on. A new `zurdo pyxis status | query | install` command family comes with it:
  - **Lexical always.** Ranking is BM25 over each symbol's name, doc comment, and first lines, and over each markdown section. No model and no network are needed.
  - **Hybrid when installed.** `zurdo pyxis install` downloads a small pinned static embedding model from the release and verifies every file's SHA-256 before using it. Ranking then fuses BM25 with embedding similarity. A model whose checksum doesn't match is reported and refused, never silently downgraded to lexical.
  - **Always current.** The index repairs itself by content hash on every query, so an edit shows up in the next answer.
  - **Leads, not locations.** Each `zurdo pyxis query` row is labeled `lexical` or `hybrid`, and **no row carries a line or column**. Pyxis tells an agent where to look, and Lumen proves what is there.
  - **Over MCP too.** `zurdo mcp serve` gains a seventh tool, `find_related`, when Pyxis is enabled.
  
  A follow-up still has to land first: `zurdo pyxis install` should repair a damaged model directory, since `status` names it as the fix.

## In development

The current milestone makes the index an agent-facing surface. Querying, the MCP server, run injection, the compound-loop tools, and per-language depth have shipped, and Pyxis is above. What remains:

- **Measuring whether it pays.** Run injection is off by default until runs with the server are compared against a recorded baseline of how much agents navigate without it. That measurement also decides whether `[mcp] inject_server` should default on.
- **Links to a sibling repository's index**, so an agent working in one repository can ask about another. This is still being researched.

None of these are committed. [Open an issue](https://github.com/ElOrlis/zurdo-dist/issues) to influence what comes next.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1.25.0  | 2026-09-29 | Python, TS/JS, and Go depth: fields, enum members, protocols, namespaces, import aliases (`alias` kind); call chains rendered structurally; some names change kind. |
| 1.24.0  | 2026-09-26 | `match_lessons` and `run_report` MCP tools; `[mcp] inject_server` registers `zurdo mcp serve` with the executor. |
| 1.23.0  | 2026-09-21 | Rust depth: `enum-variant`, `field`, `macro` kinds; `--name` substring matches become a fallback. |
| 1.22.0  | 2026-09-20 | `zurdo lumen query`; `zurdo mcp serve`; `preflight_pass` for resumed short-circuits; `run-diff.patch` baseline header. |
| 1.21.0  | 2026-09-01 | Completion gate (`[verification] completion_command`, exit `9`); lesson `requires` obligations and the `unaddressed-lesson` lint. |
| 1.20.0  | 2026-08-25 | `zurdo-design-author` bundled skill; cold-init performance gate samples best-of-5. |
| 1.19.0  | 2026-08-25 | `zurdo-lessons` and `zurdo-domain` discipline skills; orchestrator skills marked model-uninvocable. |
| 1.18.0  | 2026-08-23 | `discarded-evidence` and `cached-verification` lint families; all-ignored libtest runs fail; `analyze --static-only` works without a config. |
| 1.17.0  | 2026-08-22 | `zurdo-prd-review` skill; pre-authored-test authoring rule; `IntentReview` lesson source; large accuracy pass over help topics and bundled skills. |
| 1.16.0  | 2026-08-12 | `--strict` promotes `doc-echo`; `doc-echo` stands down beside a sibling `[no-grep:]`. |
| 1.15.0  | 2026-08-09 | `zurdo validate --authoring-state` and `--at <rev>`. |
| 1.14.0  | 2026-08-08 | Lessons as git-tracked `lessons/*.md` + `usage.json`; heal-acceptance lessons; `# Evidence Paths` prompt section and `prime_context`; `frozen-overlap` lint; masked grep tautologies. |
| 1.13.1  | 2026-08-01 | Frozen-path diffs are tree-to-tree, so untracked paths count in both directions; `run-diff.patch` includes run-created files. |
| 1.13.0  | 2026-07-31 | Empty-test-run detection on `[shell:]` hints; run-end vacuous-pass warning; `doc-echo` warn-lint family. |
| 1.12.0  | 2026-07-28 | `--format json` on `validate`/`verify`/`state list` via a shared versioned envelope; `validate --strict`. |
| 1.11.0  | 2026-07-28 | Terminal post-mortem reason blocks; per-attempt out-of-tree path references; structured reasoner narrative projection with step citations. |
| 1.10.0  | 2026-07-28 | `zurdo doctor`; shared provider event vocabulary + canary; three adapter fixes (codex text extraction, copilot summaries, copilot quota); `validate`/`verify` exit `2` on parse errors. |
| 1.9.0   | 2026-07-27 | Structural hints generally available — `[lumen] enabled` is the only gate; `[experimental] structural_hints` deprecated and ignored. |
| 1.8.0   | 2026-07-25 | Per-task frozen baselines; `blocked-by-dependency` re-derived on resume; fingerprint composition includes frozen violations and criterion index. |
| 1.7.0   | 2026-07-24 | Surface upgrades: `zurdo analyze`/`heal` first-class, `zurdo review` TUI with logged `[manual]` sign-off, `zurdo help <topic>`, completions + man pages. |
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
