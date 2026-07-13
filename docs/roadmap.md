---
layout: default
title: Roadmap
nav_order: 10
---

# Roadmap
{: .no_toc }

What's moving in zurdo, relative to the released **v1.2.0** these docs describe. Items here are subject to change until they ship.

1. TOC
{:toc}

## Just shipped: v1.2.0 (2026-07-12)

The **evidence-first verification** milestone — knowing a criterion passed is half the story; v1.2.0 shows where the evidence came from. Everything below is documented in the main docs; highlights:

- **Baseline tree capture.** `zurdo run` snapshots the working tree at run start (without touching your git state) and writes the run's full diff to `.zurdo/<slug>/run-diff.patch` at the end. [Details](how-it-works.md#evidence-integrity).
- **Pre-flight criterion provenance.** Per-criterion pre-flight verdicts are persisted, and a criterion that was already green before the agent ran is flagged in live progress and tallied as `passed-at-preflight` in the summary — display-only, never a failure.
- **Evidence-modified warnings.** A `warning:` diagnostic when files that hints rely on as evidence changed since baseline.
- **Frozen paths.** Per-task `**Frozen**` metadata and run-wide `[verification] protected_paths` config declare globs the agent must not touch; a violating iteration fails regardless of criteria results. [Details](writing-prds.md#rule-3-the-metadata-key-enum-is-closed).
- **Retry prompts carry real feedback.** Iteration 2+ prompts now include the prior attempt's failing checks and the agent's narrative tail — previously a retrying agent was told nothing about what had just failed.
- **Line-anchored grep patterns.** `^`/`$` in `[grep:]`/`[no-grep:]` now anchor at line boundaries, the way command-line `grep` behaves. Anchored hints written against the old whole-file semantics may flip verdicts. [Details](hints.md#regex-semantics-for-grep--no-grep).
- **Evidence-first PRD authoring.** The bundled `zurdo-prd-author` skill now drafts criteria first and derives tasks from them, instead of the reverse.

## In development

The next milestone is being scoped. Nothing is committed publicly yet — watch this page after the next release, or [open an issue](https://github.com/ElOrlis/zurdo-dist/issues) to influence what ships.

## Release history

| Version | Date       | Highlights                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1.2.0   | 2026-07-12 | Evidence-first verification: baseline capture, pre-flight provenance, evidence-modified warnings, frozen paths, retry-prompt feedback, line-anchored grep. |
| 1.1.3   | 2026-07-02 | `--analyze` prompts now reference all seven hint types (the analyzer previously never suggested absence hints). |
| 1.1.2   | 2026-07-01 | Parser accepts `### Requirements` in its documented position (before `### Description`).             |
| 1.1.1   | 2026-06-26 | Bundled `zurdo-prd-author` skill's grammar reference updated for Requirements/`[proves:]`.           |

Found a bug, or want to influence what ships next? [Open an issue](https://github.com/ElOrlis/zurdo-dist/issues).
