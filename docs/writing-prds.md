---
# Page settings
layout: default
comments: false

# Hero section
title: Writing PRDs
description: "The PRD grammar and its load-bearing rules."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Effective use
        url: '/docs/effective-use.html'
    next:
        content: Hints reference
        url: '/docs/hints.html'
---

Zurdo PRDs are markdown with a strict, machine-checked grammar. Strictness is the point: a PRD that parses is a PRD whose acceptance criteria zurdo can execute.

<div class="callout callout--danger" markdown="1">
**Important** If you only read one thing: use a real **em-dash (U+2014)** in your task headings, leave **no blank line** between the H2 and the metadata block, and give **every acceptance criterion at least one hint**.
</div>

## The 60-second tour

```markdown
# PRD: <free-form title>

## Task: task-1 — <task title>
**Effort**: medium
**Depends-on**: []
**Max-Attempts**: 5          # optional, falls back to config default
**Skills**: rust-style       # optional, comma-separated
**Agent-timeout**: 30m       # optional, units required (s/m/h)
**Category**: Backend        # optional, used to group reports
**Frozen**: docs/adr/*.md    # optional, globs the agent must not modify

### Requirements
- req-tests-green: The workspace test suite passes.
- req-health-endpoint: The service exposes a working /health endpoint.

### Description
Free-form prose. Passed verbatim to the executor agent.

### Acceptance Criteria
- [ ] cargo tests pass [shell: cargo test --workspace] [proves:req-tests-green]
- [ ] binary exists [file-exists: target/release/zurdo]
- [ ] /health returns 200 [http: GET http://localhost:8080/health -> 200] [proves:req-health-endpoint]
- [ ] design review signed off [manual]
```

A PRD is one H1 title plus one or more `## Task:` blocks. Each task has a contiguous metadata block, an optional `### Requirements` section, a `### Description` (sent verbatim to the agent), and `### Acceptance Criteria` (executed by zurdo). Section order is enforced: Requirements (optional) → Description → Acceptance Criteria.

## Rule 1: task headings use an em-dash, not a hyphen

The H2 task heading is exactly `## Task: <id> — <title>`. The separator between the task id and the title is a **U+2014 EM DASH** (`—`) — not a hyphen (`-`) and not an en-dash (`–`). The parser rejects each wrong separator with its own dedicated error:

```
line 12: task heading uses hyphen-minus (U+002D) where an em-dash (U+2014) is required
```

**Editor pitfall.** Many editors auto-replace `--` or ` - ` with an en-dash or em-dash inconsistently, and some Markdown linters reverse the change. If yours does, disable typographic autoreplace for `.md` files or bind a snippet that inserts the literal `—`. macOS: `Option+Shift+-`. Linux with a Compose key: `Compose - - -`.

The id itself must match `^task-[a-z0-9-]+$` — lowercase, digits, and hyphens, prefix required. `task-1`, `task-auth-rotate`, and `task-3a` parse; `Task-1`, `auth_rotate`, and `task--` fail validation.

## Rule 2: no blank line before (or inside) the metadata block

The metadata block lives **immediately** under the task heading. A blank line in between is rejected — the parser treats the H2 as having no metadata at all.

**Bad:**

```markdown
## Task: task-1 — Write the greeter

**Effort**: low
**Depends-on**: []
```

**Good:**

```markdown
## Task: task-1 — Write the greeter
**Effort**: low
**Depends-on**: []
```

The block must also be **contiguous**: a blank line between metadata fields ends the block, and any further `**Key**: value` line after that is rejected.

## Rule 3: the metadata key enum is closed

Only these seven keys are accepted; anything else is an error.

| Key             | Required? | Notes                                                                 |
| --------------- | --------- | ---------------------------------------------------------------------- |
| `Effort`        | yes       | Must be a key in the active executor's `[effort_map.<provider>]` (see below). |
| `Depends-on`    | yes       | YAML-style array, e.g. `[task-1, task-2]`. Empty array is `[]`.        |
| `Max-Attempts`  | no        | Positive integer. Falls back to `defaults.max_attempts` in config.     |
| `Skills`        | no        | Comma-separated skill names; user-managed (see below).                 |
| `Agent-timeout` | no        | Duration with an explicit unit: `30s`, `15m`, `1h`. Bare integers fail. |
| `Category`      | no        | Free-form label. Absent → grouped as `Uncategorized` in reports.       |
| `Frozen`        | no        | Comma-separated globs of paths the agent must not modify (see below).  |

Each line is exactly `**Key**: value` — the key must be bold-wrapped, with no leading whitespace.

**Frozen paths.** `**Frozen**` lists glob patterns naming files the agent must not touch during the task. Patterns are root-anchored; `*` stays within one path segment, `**` crosses directories, and negation is not supported. Run-wide globs can also be set in `[verification] protected_paths` config — the two sources are enforced as a union. After each iteration, zurdo diffs the tree against **that task's** baseline — captured at the task's first attempt and reused across its retries, so a task is never charged for an earlier task's legitimate edits. A modified frozen path fails the iteration **regardless of criteria results**, and the retry prompt tells the agent to revert. Untracked files count: a path that didn't exist when the baseline was captured is still protected once created, and (since v1.13.1) freezing a glob over an untracked path no longer fails every attempt on its own. Enforcement needs the baseline, so outside a git repo it degrades to a warning. See [How it works](how-it-works.md#evidence-integrity).

**Skills are user-managed.** Skills named in `**Skills**` are not installed by zurdo. Put them where your provider discovers them — project scope (`.claude/skills/<name>/` for Anthropic, `.agents/skills/<name>/` for Codex/Copilot), global scope (e.g. `~/.claude/skills/`), or custom directories via `[skills] search_paths` in config. Zurdo warn-checks their existence at pre-flight but never installs them. List bare names only — zurdo applies the provider-appropriate prefix (`/` for Anthropic and Copilot, `$` for Codex) at prompt-render time.

## Rule 4: every acceptance criterion needs at least one hint

Acceptance criteria are GFM task-list items (`- [ ]`). Trailing `[hint]` blocks are greedily consumed from the end of the line. A criterion with no hint is a validation error — `[manual]` must be explicit if human review is what you mean.

```markdown
- [ ] cargo test passes [shell: cargo test --workspace]
- [ ] design review signed off [manual]
```

Multiple hints on one criterion are AND'd — all must pass:

```markdown
- [ ] the build succeeds and emits the binary [shell: cargo build] [file-exists: target/debug/zurdo]
```

All seven core hint types, their semantics, and the common authoring pitfalls are on the [Hints reference](hints.md) page. With `[lumen] enabled = true` there are three more — the `[symbol:]`/`[references:]`/`[callers:]` hints that verify code facts by static analysis; see [Structural verification](lumen.md).

## Rule 5: effort values come from your config, not a fixed enum

The grammar does **not** hardcode `low | medium | high`. `**Effort**` is validated against the active executor's `[effort_map.<provider>]` block at pre-flight. If your `[effort_map.anthropic]` only defines `low` and `high`, then `**Effort**: medium` is rejected for an Anthropic-executor run.

The default `zurdo init` config defines `low | medium | high` for all three bundled providers, so most users never think about this — it matters the moment you customize the map. See [Configuration](configuration.md).

## Requirement traceability (optional)

A task may carry a `### Requirements` block naming what it must achieve, one bullet per requirement, and criteria may link back with a `[proves:<req-id>]` modifier:

```markdown
## Task: task-auth — Add token-based authentication
**Effort**: medium
**Depends-on**: []

### Requirements

- req-auth-1: Tokens must expire after 24 hours
- req-auth-2: Expired tokens must be rejected with HTTP 401

### Description

Add JWT-based authentication. Tokens expire after 24 hours. Requests with
expired tokens must receive a 401 response.

### Acceptance Criteria

- [ ] token expiry is enforced [shell: cargo test auth::token_expiry] [proves:req-auth-1]
- [ ] expired token rejected [http: GET http://localhost:8080/protected -> 401] [proves:req-auth-2]
- [ ] full test suite passes [shell: cargo test --workspace]
```

The rules, all machine-checked:

- **Placement.** `### Requirements`, when present, must appear **before** `### Description`.
- **Id shape and uniqueness.** `req-id` matches `^req-[a-z0-9-]+$` and must be unique within the task — duplicates are validation errors.
- **Dangling references are `validate` errors.** Every `[proves:<req-id>]` must reference a requirement declared in the same task's block.
- **Uncovered requirements are warnings.** A declared requirement no criterion proves is an `uncovered-requirement` warning from both `zurdo validate` and `zurdo analyze` — and an error under `validate --strict`.

`[proves:]` is a modifier, not a hint — it runs no check and never gates the criterion. Place it after all hint blocks on the line. Criteria without it are valid (they still gate the task, just untraced), and multiple criteria may prove the same requirement.

## Pre-authored tests

A criterion like `[shell: cargo test login_rejects_missing_password]` is only as honest as the test it runs — and if the agent writing the feature also writes that test, it controls both sides. A **pre-authored test** (the convention `zurdo-prd-author` teaches since v1.17.0) closes that gap: you write the test **before** the run and commit it with the PRD, so the agent can only make it pass.

The test has to be committed in a way that doesn't run yet, or CI goes red on the PRD commit. Rust shape:

```markdown
### Description

<…the work…>

The tests marked `#[ignore = "pre-authored: task-03"]` in `tests/preauthored_task_03.rs`
are evidence, not scratch. Do not delete them or weaken their assertions. The only edit
this task may make to that file is removing the `#[ignore …]` attribute.

### Acceptance Criteria

- [ ] login rejects a missing password [shell: cargo test -- --include-ignored login_rejects_missing_password]
- [ ] no pre-authored test for this task is still ignored [no-grep: #\x5bignore in tests/preauthored_task_03.rs]
```

The load-bearing details:

- **The reason string** `#[ignore = "pre-authored: <task-id>"]` marks the test as waiting for a task, not permanently quarantined.
- **`-- --include-ignored`, never `--ignored`.** `--ignored` runs *only* ignored tests, so once the agent correctly removes the attribute the filter matches nothing and the [empty-test-run check](hints.md#a-shell-hint-that-runs-no-tests-fails) fails the criterion.
- **The `[no-grep:]` guard** forces the marker's removal. It uses `#\x5b` (a literal `[`) because the hint tokenizer rejects an unclosed `[` inside a hint (the readable spelling fails validation), and the prefix match has to catch both the marked and a bare `#[ignore]`. Don't spell the attribute in a comment in that file — the guard would match it forever.
- **One file per task**, since the guard is file-scoped. The Description paragraph goes in the task's `### Description`; the PRD preamble never reaches the executor.
- **Commit a signature stub** (`todo!()`) for any function the test calls that doesn't exist yet — `#[ignore]` stops a test running, not compiling.

Go uses a build tag instead: `//go:build preauthored` on a dedicated `_test.go` file, a hint like `[shell: go test -tags=preauthored -run '^TestX$' -count=1 ./...]`, and a `[no-grep: //go:build preauthored in …]` guard. `-count=1` is mandatory (Go caches passes — the [`cached-verification`](hints.md#the-warn-lint-families) lint flags its absence), and `t.Skip()` is off-limits because a skipped test is a passing package.

Before committing the PRD, run the hint yourself: it must fail, and fail **on an assertion** (or a `todo!()` panic) — not on a compile error, and not on a zero-test demotion. Where a test genuinely can't come first, say why in the task's `.trail.md`.

## Authoring with the bundled skills

If your agent provider is set up, the bundled `zurdo-prd-author` skill turns PRD authoring into a guided, evidence-first interview — it drafts the acceptance criteria first, derives tasks from them, then renders the grammar — and pressure-tests every criterion until its hint actually verifies. `zurdo init` installs it; invoke it from your agent CLI like any other skill.

Alongside the PRD it writes a `<prd-name>.trail.md` **reasoning sidecar** — a record of why each decision was made, never parsed by zurdo — which the `zurdo-hint-debugger` skill reads later when a criterion fails. In a repo with a [lesson library](reason.md), the pressure-test phase consults it read-only, folding known repo quirks into the criteria before they can cost a run — and when the interview settles a correction worth remembering, the skill writes it as a new `lessons/lesson-<hash8>.md` file to commit alongside the PRD.

Two more skills bracket it:

- **Before:** `zurdo-design-author` (v1.20.0) is for work too big for one PRD. It produces a `docs/design/<topic>.md` record — alternatives considered and rejected, phases with observable exit criteria — and every claim marked new must carry a measured number.
- **After:** `zurdo-prd-review` (v1.17.0) reads a finished run's diff against what each task *meant* and, if anything is missing or drifted, scaffolds a follow-up PRD rather than editing the original. See [Skills](how-it-works.md#skills).

If a lesson says every PRD touching some area must include a particular check, it can carry an [obligation](reason.md#obligations-lessons-that-bind-future-prds); `zurdo analyze` then warns about any PRD that leaves the check out.

## Validate early, analyze before you spend

```sh
zurdo validate prds/feature.md              # deterministic grammar + dep-graph checks
zurdo analyze prds/feature.md               # + hint lints and LLM critique
```

`validate` catches structural errors instantly and for free, along with nine of the ten [lint families](hints.md#the-warn-lint-families); add `--strict` to make the six promotable ones errors. `zurdo analyze` additionally checks lesson obligations and flags hints that prove nothing (see [Hints reference](hints.md#beware-vacuous-hints-and-tautologies)) and criteria too vague to verify — before any tokens are spent on a run.

Next: [Hints reference](hints.md)
