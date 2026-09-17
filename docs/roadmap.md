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

What's moving in zurdo, relative to the released **v1.21.0** these docs describe. Items here are subject to change until they ship.

## Just shipped: v1.21.0 (2026-09-01)

Two ways to state a rule **once** and have zurdo enforce it, instead of relying on every PRD to remember it.

- **The completion gate.** `[verification] completion_command` runs one repository-wide check — the full suite, a lint pass — at run end, once every task has passed. A failure or timeout (`[timeouts] completion_seconds`, default `900`) exits with the new code **`9`**, distinct from `5`, so "a task failed" and "every task passed and the repo is broken" stay separate outcomes. It runs on resume too, and shows up in the run summary, a new `gate` column in `zurdo state list`, and `zurdo report`. [Details](configuration.md#the-completion-gate).
- **Lesson obligations.** A lesson can carry a `requires` block — a regex some criterion must match, per PRD or per task — and `zurdo analyze` reports a PRD that doesn't satisfy it as the new `unaddressed-lesson` warning (the tenth lint family; never promoted by `--strict`). [Details](reason.md#obligations-lessons-that-bind-future-prds).

## Recently shipped

**v1.20.0 (2026-08-25) — `zurdo-design-author`.** A seventh bundled skill, one level above PRD authoring: idea → design record → PRDs, with a **no number, no claim** rule for anything presented as new. [Details](writing-prds.md#authoring-with-the-bundled-skills).

**v1.19.0 (2026-08-25) — skills that call skills.** `zurdo-lessons` and `zurdo-domain` are the first *disciplines*: skills the other skills invoke mid-task by name. The five user-facing skills are now marked so the model won't invoke them on its own. [Details](how-it-works.md#skills).

**v1.18.0 (2026-08-23) — two more lint families and an ignored-test fix.** `discarded-evidence` flags a test hint that throws its stdout away; `cached-verification` flags `go test` without `-count=N`. A libtest run whose only tests were `#[ignore]`d now fails instead of passing, and `zurdo analyze --static-only` no longer needs a config file. [Details](hints.md#the-warn-lint-families).

**v1.17.0 (2026-08-22) — intent review and pre-authored tests.** The `zurdo-prd-review` skill checks a finished run against what the PRD *meant* and scaffolds a follow-up PRD for any gap; `zurdo-prd-author` now asks whether a test a hint runs exists yet, and teaches committing it first. The release also corrected dozens of stale claims in the built-in help and bundled skills. [Details](writing-prds.md#pre-authored-tests).

**v1.16.0 (2026-08-12) — `doc-echo` is `--strict`-promotable**, making six of the seven lint families of that release promotable. [Details](commands.md#zurdo-validate---strict).

**v1.15.0 (2026-08-09) — `zurdo validate --authoring-state` / `--at <rev>`.** Lint a PRD whose work already shipped against the tree it was written for. [Details](commands.md#zurdo-validate---authoring-state).

**v1.14.0 (2026-08-08) — lessons become source.** The lesson library moved to a git-tracked `lessons/` directory (no migration from `.zurdo/reason/library/`); accepted heals write lessons without a provider call; lesson reads no longer need `[reason] enabled`; executor prompts gained an `# Evidence Paths` section; and `frozen-overlap` became a lint family. [Details](reason.md#the-library-is-source-not-state).

## Unreleased

Merged since v1.21.0 and planned for the next release:

- **`zurdo lumen query`** — ask the structural index a question directly: `--name <ident>` (qualified-name lookup), `--outline <path>` (a file's definitions in source order), `--callers <name>`, or `--references <name>`, one selector at a time, with `--limit N` (default `20`, `0` for no limit). Output is one tab-separated row per result, in the same shape structural-hint diagnostics use. It reads a freshly repaired view, so no prior `zurdo lumen rebuild` is needed. Requires `[lumen] enabled = true`.
- **`zurdo mcp serve`** — an MCP stdio server over the same index, for an MCP client to launch (not for typing interactively). It exposes four tools — `search_symbols`, `file_outline`, `find_callers`, `find_references` — that answer in exactly the rows `zurdo lumen query` prints, and it re-checks the working tree on every call, so an agent that just edited a file gets an answer about the edited file. Requires `[lumen] enabled = true`.
- **Resumed runs explain their shortcuts.** A task that a *resumed* run found already passing now records the evaluation that passed it (`preflight_pass` in `prd.json`), and `zurdo report`'s `passed_at_preflight` reads it — previously that task looked passed with no evidence.
- **`run-diff.patch` states its baseline.** The patch now opens with a `#` header naming the baseline tree and when it was captured, because a resumed run's patch covers only the work since the resume. `git apply` still accepts it.

## In development

The current milestone makes zurdo's code index **something agents can query**, not just something the verifier reads. `zurdo lumen query` and `zurdo mcp serve` are its first steps. Themes under consideration after them:

- serving zurdo's own run state — lessons, task status, verdicts — through the same MCP server;
- registering that server with the agent zurdo launches, so executors can use it during a run;
- retrieval over prose (docs, PRDs) that the structural index can't cover;
- links to a sibling repository's index.

None of these are committed. [Open an issue](https://github.com/ElOrlis/zurdo-dist/issues) to influence what comes next.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
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
