---
# Page settings
layout: homepage
keywords: zurdo, CLI, LLM, coding agents, PRD, verification loop
permalink: /

# Hero section
title: zurdo
hero_logo: /doks-theme/assets/images/layout/logo.svg
description: A CLI that drives LLM coding agents through a PRD's tasks on machine time — and independently verifies every acceptance criterion instead of trusting the agent's self-report.
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
      excerpt: The seven core hint types and the three structural hints, with examples.
      cta: Read more
      url: '/docs/hints.html'
    - title: Structural verification
      excerpt: The Lumen code index, structural hints, querying, and the Vela watcher.
      cta: Read more
      url: '/docs/lumen.html'
    - title: Agent access (MCP)
      excerpt: Serve the code index and run state to coding agents over MCP.
      cta: Read more
      url: '/docs/mcp.html'
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
**Version** This documentation describes **zurdo v1.25.0**. Work in flight is tracked on the [Roadmap](docs/roadmap.md).
</div>

## Why zurdo

Zurdo changes what a day of engineering attention produces. You scope the work, spend 30–60 minutes authoring a [PRD](docs/writing-prds.md), and hand it to `zurdo run` — implementation happens on machine time, often on a remote server, while you scope the next piece or get on with your day. You come back to a report and evidence, not a chat transcript to babysit.

Walking away is safe because the loop never grades itself. After every iteration zurdo — never the agent — executes every acceptance criterion's [hint](docs/hints.md) and decides pass/fail; `zurdo validate` and `zurdo analyze` lint the PRD *before* tokens are spent; `Max-Attempts` budgets and [stall detection](docs/reason.md) bound the cost of failure; crash-safe state under `.zurdo/<slug>/` means an interrupted run resumes instead of restarting. When a string match isn't proof enough, opt-in [structural hints](docs/lumen.md) verify *code facts* against the Lumen code index — which agents can also [query over MCP](docs/mcp.md) instead of re-reading the tree — and the [reason subsystem](docs/reason.md) turns every diagnosed stall into a **lesson** future runs are told about up front. (The design descends from the [Ralph technique](https://github.com/ClaytonFarr/ralph-playbook) — run an agent in a loop against a persistent plan — with each of Ralph's documented gaps closed by the runtime.)

That safety is what buys the productivity. An interactive chat workflow consumes engineer attention *per iteration*, so throughput stays chained to implementation time. Zurdo consumes it *per design and per verdict*:

```text
throughput ≈ available attention ÷ (authoring timebox + review timebox)
```

Implementation duration drops out of the equation entirely — and nothing forces the loop to be serial: author the next PRD while the last one runs, review both when you're free. [The operating rhythm](docs/workflow.md) walks the full loop phase by phase and maps it onto agile, ceremony by ceremony — a sprint compressed to hours, with every rule agile enforces socially enforced mechanically instead.

Two deliberate non-features keep it predictable: **provider-agnostic** (shells out to the [`claude`](https://docs.claude.com/en/docs/claude-code/overview), [`codex`](https://github.com/openai/codex), and [`copilot`](https://github.com/github/gh-copilot) CLIs — no SDKs, no API keys handed to zurdo) and **no git automation** (branching, committing, and PRs stay yours).

## Quick start

```sh
# 0. Install (see the installation guide for all methods):
brew install ElOrlis/zurdo/zurdo

# 1. From the root of the repo you want zurdo to drive:
zurdo init                            # writes .zurdo/config.toml, installs bundled skills
zurdo doctor                          # confirm config, CLIs, and models are run-ready

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
zurdo analyze prds/hello.md

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
