---
layout: default
title: Home
nav_order: 1
description: Zurdo drives LLM coding agents through a PRD's tasks in a loop — and independently verifies every acceptance criterion.
permalink: /
---

# zurdo
{: .fs-9 }

A CLI that drives LLM coding agents through a PRD's tasks in a loop — and **independently verifies** every acceptance criterion instead of trusting the agent's self-report.
{: .fs-6 .fw-300 }

[Get started](docs/installation.md){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[How it works](docs/how-it-works.md){: .btn .fs-5 .mb-4 .mb-md-0 }

---

This documentation describes **zurdo v1.1.3**. Work in flight is tracked on the [Roadmap](docs/roadmap.md).
{: .note }

## Why zurdo

A coding agent that grades its own homework will eventually mark its own homework `passing`. Zurdo's core rule is that **the agent never gets to decide whether a task passed**:

1. Your PRD's acceptance criteria carry explicit, machine-checkable hints — `[shell:]`, `[http:]`, `[file-exists:]`, `[grep:]`, `[file-absent:]`, `[no-grep:]`, or `[manual]`.
2. After every agent iteration, **zurdo itself** runs every hint against the working tree and decides pass/fail. Multiple hints on one criterion are AND'd.
3. A task is `passed` only when all automated hints pass. If the agent claims success but `cargo test` exits non-zero, the task fails and the loop tries again — up to the per-task `Max-Attempts` budget.

Three design choices keep it predictable:

- **Provider-agnostic.** Works with the [`claude`](https://docs.claude.com/en/docs/claude-code/overview), [`codex`](https://github.com/openai/codex), and [`copilot`](https://github.com/github/gh-copilot) CLIs by shelling out — no SDKs, no API calls from zurdo itself.
- **No git automation.** Zurdo runs the agent against your working tree and verifies the result. Whether to branch, commit, or open a PR is your call.
- **Crash-safe state.** Everything lives under `.zurdo/<slug>/` at the repo root, atomically written, resumable after Ctrl-C or a crash.

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

## Documentation

- [How it works](docs/how-it-works.md) — the verification loop, state model, and crash recovery
- [Installation](docs/installation.md) — Homebrew, release tarballs, and prerequisites
- [Usage](docs/usage.md) — everyday workflows, run output, CI integration, troubleshooting
- [Writing PRDs](docs/writing-prds.md) — the PRD grammar and its load-bearing rules
- [Hints reference](docs/hints.md) — all seven verification hint types, with examples
- [Commands](docs/commands.md) — full command and flag reference, exit codes
- [Configuration](docs/configuration.md) — the `.zurdo/config.toml` reference
- [Providers](docs/providers.md) — how zurdo drives the claude, codex, and copilot CLIs
- [Roadmap](docs/roadmap.md) — what's coming in the next release and what's in development

## Support

- **Zurdo bugs and feature requests:** [github.com/ElOrlis/zurdo-dist/issues](https://github.com/ElOrlis/zurdo-dist/issues)
- **Documentation feedback:** [github.com/NumeronAI/zurdo.github.io/issues](https://github.com/NumeronAI/zurdo.github.io/issues)

## License

Zurdo is proprietary software, distributed as pre-built binaries. It is an independent reimplementation inspired by [paullovvik/ralph-loop](https://github.com/paullovvik/ralph-loop) (MIT). Copyright © 2026 El Orlis.
