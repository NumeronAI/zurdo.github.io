---
# Page settings — content for the landing layout (doks-theme/_layouts/landing.html).
# Every URL here is a site path; the layout passes it through relative_url.
layout: landing
title: zurdo
keywords: zurdo, CLI, LLM, coding agents, PRD, verification loop
permalink: /
version: v1.25.0
description: A CLI that drives LLM coding agents through a PRD's tasks on machine time — and independently verifies every acceptance criterion instead of trusting the agent's self-report.

hero:
  title: Hand off the PRD.
  title_accent: Trust the verdict.
  release:
    text: Lumen query, MCP server, and run injection
    url: /docs/roadmap.html
  primary:
    label: Get started
    url: /docs/installation.html
  secondary:
    label: How it works
    url: /docs/how-it-works.html
  install: brew install ElOrlis/zurdo/zurdo
  terminal_caption: zurdo re-runs every criterion itself — the agent is never asked whether it passed.

providers:
  - name: claude
    url: https://docs.claude.com/en/docs/claude-code/overview
  - name: codex
    url: https://github.com/openai/codex
  - name: copilot
    url: https://github.com/github/gh-copilot

why:
  eyebrow: Why zurdo
  title: Walking away is safe because the loop never grades itself.
  lead: Spend 30–60 minutes authoring a PRD, hand it to zurdo run, and come back to a report and evidence — not a chat transcript to babysit.
  features:
    - icon: verify
      title: Independent verification
      body: After every iteration zurdo — never the agent — executes each acceptance criterion's hint and decides pass or fail.
      url: /docs/hints.html
    - icon: lint
      title: Lint before you spend
      body: zurdo validate and zurdo analyze check the PRD's grammar and logic before a single token is spent.
      url: /docs/writing-prds.html
    - icon: budget
      title: Bounded failure
      body: Max-Attempts budgets and stall detection cap what a stuck task can cost you.
      url: /docs/reason.html
    - icon: resume
      title: Crash-safe resume
      body: State lives under .zurdo/<slug>/, so an interrupted run resumes where it stopped instead of starting over.
      url: /docs/how-it-works.html
    - icon: structure
      title: Structural verification
      body: When a string match isn't proof, structural hints check code facts against the Lumen index — which agents can query over MCP.
      url: /docs/lumen.html
    - icon: lessons
      title: Lessons that compound
      body: Every diagnosed stall becomes a lesson that future runs are told about up front.
      url: /docs/reason.html

throughput:
  eyebrow: The operating rhythm
  title: Attention per verdict, not per iteration.
  body: An interactive chat workflow consumes engineer attention every iteration, so throughput stays chained to implementation time. Zurdo spends it once per design and once per verdict — and nothing forces the loop to be serial.
  footnote: Implementation time drops out of the equation. Author the next PRD while the last one runs; review both when you're free.
  cta: Read the operating rhythm
  url: /docs/workflow.html

quickstart:
  - label: Install
    caption: Homebrew is the quickest route; the installation guide covers release tarballs and prerequisites.
    code: |
      brew install ElOrlis/zurdo/zurdo
  - label: Initialize
    caption: From the root of the repo you want zurdo to drive.
    code: |
      zurdo init      # writes .zurdo/config.toml, installs bundled skills
      zurdo doctor    # confirm config, CLIs, and models are run-ready
  - label: Write a PRD
    caption: Each task carries acceptance criteria, and each criterion carries a hint zurdo can execute.
    code: |
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
  - label: Validate & run
    caption: Validate the grammar before paying for tokens, then drive the loop.
    code: |
      zurdo validate prds/hello.md   # grammar check, zero tokens
      zurdo analyze prds/hello.md    # optional: static + LLM analysis of the PRD
      zurdo run prds/hello.md        # drive the loop
  - label: Inspect
    caption: Every run leaves a report and its state behind.
    code: |
      zurdo report prds/hello.md     # JSON by default; --format md for markdown
      zurdo state list               # every .zurdo/<slug>/ at this repo root

doc_groups:
  - title: Start here
    items:
      - title: How it works
        excerpt: The verification loop, state model, and crash recovery.
        url: /docs/how-it-works.html
      - title: Installation
        excerpt: Homebrew, release tarballs, and prerequisites.
        url: /docs/installation.html
      - title: Usage
        excerpt: Everyday workflows, run output, CI integration, troubleshooting.
        url: /docs/usage.html
      - title: The operating rhythm
        excerpt: The loop you run zurdo in — and how it maps onto agile.
        url: /docs/workflow.html
      - title: Effective use
        excerpt: The research → PRD → run pipeline, framed with the AI Fluency 4Ds.
        url: /docs/effective-use.html
  - title: Verification
    items:
      - title: Writing PRDs
        excerpt: The PRD grammar and its load-bearing rules.
        url: /docs/writing-prds.html
      - title: Hints reference
        excerpt: The seven core hint types and the three structural hints.
        url: /docs/hints.html
      - title: Structural verification
        excerpt: The Lumen code index, structural hints, querying, and Vela.
        url: /docs/lumen.html
      - title: Agent access (MCP)
        excerpt: Serve the code index and run state to coding agents over MCP.
        url: /docs/mcp.html
      - title: Diagnosis & lessons
        excerpt: Stall detection, reasoner verdicts, and the lesson library.
        url: /docs/reason.html
  - title: Reference
    items:
      - title: Commands
        excerpt: Full command and flag reference, exit codes.
        url: /docs/commands.html
      - title: Configuration
        excerpt: The .zurdo/config.toml reference.
        url: /docs/configuration.html
      - title: Providers
        excerpt: How zurdo drives the claude, codex, and copilot CLIs.
        url: /docs/providers.html
      - title: Roadmap
        excerpt: What's coming in the next release and what's in development.
        url: /docs/roadmap.html

principles:
  - tag: Provider-agnostic
    title: No SDKs, no API keys
    body: Zurdo shells out to the claude, codex, and copilot CLIs you already have installed and authenticated. No API keys are handed to zurdo.
  - tag: No git automation
    title: Your repo, your history
    body: Branching, committing, and pull requests stay yours. Zurdo edits the working tree through the agent and leaves version control to you.

lineage: The design descends from the [Ralph technique](https://github.com/ClaytonFarr/ralph-playbook) — run an agent in a loop against a persistent plan — with each of Ralph's documented gaps closed by the runtime.

support:
  - label: Report a zurdo bug or request a feature
    url: https://github.com/ElOrlis/zurdo-dist/issues
  - label: Give documentation feedback
    url: https://github.com/NumeronAI/zurdo.github.io/issues

license: Zurdo is proprietary software, distributed as pre-built binaries. It is an independent reimplementation inspired by the Ralph technique.
copyright: Copyright © 2026 Numeron Technologies Inc.
---
