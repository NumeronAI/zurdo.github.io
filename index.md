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
    - title: Effective use
      excerpt: The research → PRD → run pipeline, framed with Anthropic's AI Fluency 4Ds.
      cta: Read more
      url: '/docs/effective-use.html'
    - title: Writing PRDs
      excerpt: The PRD grammar and its load-bearing rules.
      cta: Read more
      url: '/docs/writing-prds.html'
    - title: Hints reference
      excerpt: All seven verification hint types, with examples.
      cta: Read more
      url: '/docs/hints.html'
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
**Version** This documentation describes **zurdo v1.2.0**. Work in flight is tracked on the [Roadmap](docs/roadmap.md).
</div>

## Why zurdo

Zurdo descends from the **Ralph technique** — run a coding agent in a loop against a persistent plan until the work is done — as documented in [ClaytonFarr/ralph-playbook](https://github.com/ClaytonFarr/ralph-playbook). Ralph proved the loop works. It was also honest about where it breaks, and those documented failure modes are exactly what zurdo was built to close.

### Where the original loop falls short

The playbook relies on *backpressure* — tests, linters, builds — to reject bad work, and instructs the agent to "keep doing work against backpressure until tests pass." That leaves four gaps, all acknowledged in the playbook itself:

- **Completion is self-graded.** The agent decides when tests pass and when a plan item is done. A coding agent that grades its own homework will eventually mark its own homework `passing` — and without backpressure wired in per-project, Ralph accepts incomplete work silently.
- **Weak criteria go undetected.** Vague or subjective acceptance criteria ("works correctly", "good UX") resist programmatic validation, so the loop converges on *something* without anyone checking it's the thing you asked for.
- **The loop is unbounded.** Ralph "can go in circles, ignore instructions, or take wrong directions" — managed by a human watching the loop and tuning prompts, not by the system itself.
- **State is fragile.** The plan lives in a Markdown file the agent itself rewrites; it goes stale, gets cluttered, and the recommended fix is regenerating it by hand when things drift.

### What zurdo changes

**1. Verification moves out of the agent.** Zurdo's core rule is that the agent never gets to decide whether a task passed:

1. Your PRD's acceptance criteria carry explicit, machine-checkable hints — `[shell:]`, `[http:]`, `[file-exists:]`, `[grep:]`, `[file-absent:]`, `[no-grep:]`, or `[manual]`.
2. After every agent iteration, **zurdo itself** runs every hint against the working tree and decides pass/fail. Multiple hints on one criterion are AND'd.
3. A task is `passed` only when all automated hints pass. If the agent claims success but `cargo test` exits non-zero, the task fails and the loop tries again.

**2. Criteria are optimized before you pay for tokens.** Weak backpressure is a bug you can lint for. `zurdo validate` checks the PRD grammar; `zurdo run --analyze` runs deterministic lints (vacuous shell hints, grep tautologies, frozen-path overlaps, requirements no hint covers) plus an LLM critique of vague criteria; `--analyze --fix` iterates on the PRD until the warnings stop decreasing; and `--heal` re-aims misfired `[grep:]` payloads after a run using the failure history as evidence.

**3. The loop is bounded.** Each task carries a `Max-Attempts` budget, `--max-iterations` caps the whole run, and distinct exit codes separate real failure from budget exhaustion from analyzer thrash — so CI can branch on *why* the loop stopped instead of a human watching it circle.

**4. State survives.** Everything lives under `.zurdo/<slug>/` at the repo root — atomically written, owned by zurdo rather than rewritten by the agent, and resumable after Ctrl-C or a crash.

Two more design choices keep it predictable:

- **Provider-agnostic.** Works with the [`claude`](https://docs.claude.com/en/docs/claude-code/overview), [`codex`](https://github.com/openai/codex), and [`copilot`](https://github.com/github/gh-copilot) CLIs by shelling out — no SDKs, no API calls from zurdo itself.
- **No git automation.** Zurdo runs the agent against your working tree and verifies the result. Whether to branch, commit, or open a PR is your call.

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
