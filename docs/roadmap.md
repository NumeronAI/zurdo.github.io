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

What's moving in zurdo, relative to the released **v1.13.1** these docs describe. Items here are subject to change until they ship.

## Just shipped: v1.13.0 / v1.13.1 (2026-07-31 / 2026-08-01)

The **honest-pass** milestone — three checks that stop a run from reporting work it didn't do, plus the baseline fix that came out of the same review.

- **A `[shell:]` hint that runs no tests now fails.** `cargo test <filter matching nothing>` exits `0` having verified nothing. A libtest or `go test` report showing zero tests run now fails the hint with `a test runner ran zero tests`, whatever the exit code — at pre-flight, every iteration, `verify`, and `heal`. [Details](hints.md#a-shell-hint-that-runs-no-tests-fails).
- **A run-end warning names tasks that passed without any agent work.** Terminal `passed` with zero attempts gets called out by name in the summary; a run where *every* task did that escalates to "nothing ran". Diagnostic only — the exit code is untouched — and silent on resumes. [Details](usage.md#when-a-task-passes-without-doing-anything).
- **`doc-echo`, a sixth warn-lint family.** Flags a criterion whose only proof greps a prose doc for a phrase the criterion itself names. Advisory, not `--strict`-promotable, pending field data on its false-positive rate. [Details](hints.md#the-six-warn-lint-families).
- **Frozen-path comparison is tree-to-tree (v1.13.1).** A frozen glob naming a path that was untracked at capture time no longer failed every attempt with nothing to revert, and a file the run created and never staged no longer escaped the check. `run-diff.patch` gained the same symmetry. [Details](how-it-works.md#evidence-integrity).

These three checks exist because zurdo shipped a release claiming flags its binary did not have: four PRD tasks recorded themselves passed against `[shell: cargo test <name>]` criteria naming tests nobody had written. The v1.12.0 changelog carries the correction.

## Recently shipped

**v1.12.0 (2026-07-28) — the CI-ready surface.** `--format json` on `validate`, `verify`, and `state list`, all emitting one shared versioned envelope, plus `zurdo validate --strict` to promote four of the six warn-lint families to errors. [Details](commands.md#machine-readable-output).

**v1.11.0 (2026-07-28) — executor observability.** Terminal [post-mortem blocks](reason.md#post-mortems) that explain a dead task to a human rather than guiding an agent; [out-of-tree path references](reason.md#out-of-tree-path-references) recorded per attempt and surfaced on four read paths; and a reasoner evidence bundle that reads a structured tool-call projection instead of a raw stream tail — on one 348 KB transcript the old window showed 1.18%, 40% of it cost telemetry.

**v1.10.0 (2026-07-28) — `zurdo doctor` and the provider vocabulary.** A PRD-free, lock-free, write-free environment diagnostic that subsumes `check-models`, plus a shared provider event vocabulary verified against real captured streams — which is what surfaced three live adapter defects, including a `codex` adapter that could not extract assistant text at all. [Details](commands.md#zurdo-doctor--diagnose-the-environment), [providers](providers.md#event-streams-and-the-vocabulary).

**v1.9.0 (2026-07-27) — structural hints are generally available.** All seven graduation gates green, so `[symbol:]`/`[references:]`/`[callers:]` left `[experimental]`; `[lumen] enabled` is the only remaining switch. [Details](lumen.md#turning-it-on).

**v1.8.0 (2026-07-25) — per-task frozen baselines.** Frozen-path enforcement diffs against a baseline captured at each task's first attempt rather than run start, and `blocked-by-dependency` is re-derived on resume, so fixing a failed dependency unblocks its dependents without `--reset`.

## In development

The next milestone is being scoped — nothing is committed. Watch this page after the next release, or [open an issue](https://github.com/ElOrlis/zurdo-dist/issues) to influence what comes next.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
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
