---
# Page settings
layout: homepage
keywords: zurdo, CLI, LLM, coding agents, PRD, verification loop
permalink: /

# Hero section
title: zurdo
hero_logo: /doks-theme/assets/images/layout/logo.svg
description: A CLI that drives LLM coding agents through a PRD's tasks in a loop — and independently verifies every acceptance criterion instead of trusting the agent's self-report.
buttons:
    - content: Get started
      url: '/docs/installation.html'
      external_url: false
    - icon: arrow-right
      content: How it works
      url: '/docs/how-it-works.html'
      external_url: false

# Grid navigation
grid_navigation:
    - title: How it works
      excerpt: The verification loop, state model, and crash recovery.
      cta: Read more
      url: '/docs/how-it-works.html'
    - title: Installation
      excerpt: Homebrew, release tarballs, and prerequisites.
      cta: Read more
      url: '/docs/installation.html'
    - title: Usage
      excerpt: Everyday workflows, run output, CI integration, troubleshooting.
      cta: Read more
      url: '/docs/usage.html'
    - title: The operating rhythm
      excerpt: The loop you run zurdo in — and how it maps onto agile, ceremony by ceremony.
      cta: Read more
      url: '/docs/workflow.html'
    - title: Effective use
      excerpt: The research → PRD → run pipeline, framed with Anthropic's AI Fluency 4Ds.
      cta: Read more
      url: '/docs/effective-use.html'
    - title: Writing PRDs
      excerpt: The PRD grammar and its load-bearing rules.
      cta: Read more
      url: '/docs/writing-prds.html'
    - title: Hints reference
      excerpt: The seven core hint types and the experimental structural hints, with examples.
      cta: Read more
      url: '/docs/hints.html'
    - title: Structural verification
      excerpt: The Lumen code index, structural hints, and the Vela watcher.
      cta: Read more
      url: '/docs/lumen.html'
    - title: Diagnosis & lessons
      excerpt: Stall detection, reasoner verdicts, and the cross-run lesson library.
      cta: Read more
      url: '/docs/reason.html'
    - title: Commands
      excerpt: Full command and flag reference, exit codes.
      cta: Read more
      url: '/docs/commands.html'
    - title: Configuration
      excerpt: The .zurdo/config.toml reference.
      cta: Read more
      url: '/docs/configuration.html'
    - title: Providers
      excerpt: How zurdo drives the claude, codex, and copilot CLIs.
      cta: Read more
      url: '/docs/providers.html'
    - title: Roadmap
      excerpt: What's coming in the next release and what's in development.
      cta: Read more
      url: '/docs/roadmap.html'
---

<div class="callout callout--info" markdown="1">
**Version** This documentation describes **zurdo v1.6.0**. Work in flight is tracked on the [Roadmap](docs/roadmap.md).
</div>

## Why zurdo

Zurdo descends from the **Ralph technique** — run a coding agent in a loop against a persistent plan until the work is done ([ClaytonFarr/ralph-playbook](https://github.com/ClaytonFarr/ralph-playbook)). Ralph proved the loop works, and was honest about where it breaks. Zurdo closes each documented gap:

| Ralph's gap                        | Zurdo's answer                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Completion is self-graded** — the agent decides when it's done | Zurdo executes every criterion's [hint](docs/hints.md) itself after each iteration; the agent's self-report is never consulted |
| **Weak criteria go undetected** — "works correctly" verifies nothing | `zurdo validate` and `--analyze` lint the PRD *before* tokens are spent; `--heal` re-aims misfired hints after            |
| **The loop is unbounded** — it can circle forever | Per-task `Max-Attempts`, run-wide `--max-iterations`, [stall detection](docs/reason.md), and exit codes that say *why* it stopped |
| **State is fragile** — a plan file the agent itself rewrites | Everything lives under `.zurdo/<slug>/` — atomic, owned by zurdo, resumable after Ctrl-C or a crash                        |

And a loop that stops failing the *same way* twice: with the opt-in [reason subsystem](docs/reason.md), a stalled task gets a one-call LLM diagnosis — guide the retry, route a bad hint to `--heal`, or halt the spend — and every recovery is distilled into a **lesson** future runs in the repo are told about up front. When a string match isn't proof enough, opt-in [structural hints](docs/lumen.md) verify *code facts* — this definition exists, that function is actually called — against the Lumen code index instead of grepping for text.

Two deliberate non-features keep it predictable: **provider-agnostic** (shells out to the [`claude`](https://docs.claude.com/en/docs/claude-code/overview), [`codex`](https://github.com/openai/codex), and [`copilot`](https://github.com/github/gh-copilot) CLIs — no SDKs, no API keys handed to zurdo) and **no git automation** (branching, committing, and PRs stay yours).

## Quick start

```sh
# 0. Install (see the installation guide for all methods):
brew install ElOrlis/zurdo/zurdo

# 1. From the root of the repo you want zurdo to drive:
zurdo init                            # writes .zurdo/config.toml, installs bundled skills

# 2. Write a PRD (see Writing PRDs for the full grammar):
cat > prds/hello.md <<'EOF'
# PRD: Hello

## Task: task-build — Write the greeter
**Effort**: low
**Depends-on**: []

### Description
Create `src/greeter.txt` containing the single line `hello world`.

### Acceptance Criteria
- [ ] greeter file exists [file-exists: src/greeter.txt]
- [ ] greeter says hello world [grep: hello world in src/greeter.txt]
EOF

# 3. Validate the grammar before paying for tokens:
zurdo validate prds/hello.md

# 4. (optional) Static + LLM analysis of the PRD itself:
zurdo --analyze prds/hello.md

# 5. Drive the loop:
zurdo run prds/hello.md

# 6. Inspect what happened:
zurdo report prds/hello.md           # JSON by default; --format md for markdown
zurdo state list                     # every .zurdo/<slug>/ at this repo root
```

A bare `zurdo <prd>` is sugar for `zurdo run <prd>`.

## Support

- **Zurdo bugs and feature requests:** [github.com/ElOrlis/zurdo-dist/issues](https://github.com/ElOrlis/zurdo-dist/issues)
- **Documentation feedback:** [github.com/NumeronAI/zurdo.github.io/issues](https://github.com/NumeronAI/zurdo.github.io/issues)

## License

Zurdo is proprietary software, distributed as pre-built binaries. It is an independent reimplementation inspired by the Ralph technique as documented in [ClaytonFarr/ralph-playbook](https://github.com/ClaytonFarr/ralph-playbook). Copyright © 2026 Numeron Technologies Inc.
