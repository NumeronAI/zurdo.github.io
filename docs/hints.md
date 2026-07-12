---
layout: default
title: Hints reference
parent: Writing PRDs
nav_order: 1
---

# Hints reference
{: .no_toc }

Hints are the machine-checkable half of an acceptance criterion. After every agent iteration, zurdo executes each hint itself and decides pass/fail — the agent's opinion is never consulted.

1. TOC
{:toc}

## The seven hint types

| Hint                                 | Behavior                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `[shell: <cmd>]`                     | Run the command; pass iff it exits `0`. Working directory is the repo root.         |
| `[http: <method> <url> -> <status>]` | Make the request; pass iff the response status matches.                              |
| `[file-exists: <path>]`              | Pass iff a file exists at the path (relative to repo root).                          |
| `[grep: <pattern> in <file>]`        | Pass iff the regex pattern is found in the file.                                     |
| `[file-absent: <path>]`              | Pass iff **no** file exists at the path (relative to repo root).                     |
| `[no-grep: <pattern> in <file>]`     | Pass iff the file is readable and the regex is **not** found; a missing or unreadable file **fails**. |
| `[manual]`                           | Out-of-band human review; never machine-checked.                                     |

One example of each:

```markdown
- [ ] cargo test passes [shell: cargo test --workspace]
- [ ] the binary exists [file-exists: target/debug/zurdo]
- [ ] legacy config is deleted [file-absent: config/legacy.toml]
- [ ] the marker string is present [grep: Health check in docs/runbook.md]
- [ ] no TODOs remain [no-grep: TODO in src/main.rs]
- [ ] /health returns 200 [http: GET http://localhost:8080/health -> 200]
- [ ] design review signed off [manual]
```

## Combining hints

Multiple hints on one criterion are **AND'd** — all must pass:

```markdown
- [ ] the build succeeds and emits the binary [shell: cargo build] [file-exists: target/debug/zurdo]
```

Mixing `[manual]` with automated hints means the automated portion still gates; the manual portion surfaces a review obligation in reports. A task whose criteria are **all** `[manual]` short-circuits at pre-flight to `passed-pending-review` and never invokes the agent.

## Timeouts

`shell:` and `http:` hints are bounded by `[timeouts] criterion_seconds` in config (default 300s). File and grep hints are local checks and are not time-limited.

## Regex semantics for `[grep:]` / `[no-grep:]`

Patterns are Rust `regex` syntax, matched against the file's contents in **multi-line mode**: `^` and `$` anchor at line boundaries, the way command-line `grep` behaves. `[grep: ^## Heading in doc.md]` passes if any line starts with the heading. Explicit `(?m)` prefixes remain valid and are redundant. The same semantics apply everywhere a pattern is evaluated — the run-time verifier, the `validate`/`--analyze` grep lints, and `--heal` verification — so authoring-time verdicts match run-time verdicts.

**Upgrading from v1.1.x?** Patterns used to anchor to the start/end of the entire file. An anchored `[no-grep:]` hint that passed under the old semantics may now fail — that flip is the check finally seeing the line it was aimed at. Patterns without anchors are unaffected.
{: .note }

## Prefer absence hints over shell negation

Two hints assert that something is *gone*:

- **`[file-absent: <path>]`** — passes iff no file exists at the path.
- **`[no-grep: <pattern> in <file>]`** — passes iff the file is readable and the pattern is not found. It deliberately **fails** when the file cannot be read, so a typo'd filename cannot make the criterion pass by accident.

Do **not** use `[shell: ! test -e <path>]` or `[shell: ! grep -q <pat> <file>]` for these cases. A misplaced `!`, a quoting slip, or a missing command silently inverts the exit code and produces a criterion that *always passes* — defeating the point of independent verification.

```markdown
# ✓ correct — file removal task
- [ ] legacy config is deleted [file-absent: config/legacy.toml]
- [ ] TODO is removed from main module [no-grep: TODO in src/main.rs]

# ✗ avoid — silent failures hide bugs
- [ ] legacy config is deleted [shell: ! test -e config/legacy.toml]
- [ ] TODO is removed from main module [shell: ! grep -q TODO src/main.rs]
```

## Beware vacuous hints and tautologies

Hints must actually test something meaningful. Two pitfalls prove nothing:

- **Vacuous shell hints** — `[shell: true]` or `[shell: echo "works"]` always pass; no work is verified.
- **Grep tautologies** — `[grep: .* in src/main.rs]` matches everything and proves nothing; `[no-grep: ^$ in src/main.rs]` fails tautologically.

`zurdo --analyze` detects and warns about both classes. It also flags a **frozen-path overlap**: a `grep:`/`no-grep:`/`file-exists:`/`file-absent:` hint whose evidence path matches a `**Frozen**` glob or a `[verification] protected_paths` config glob for the same task — a conflict that would otherwise surface only as failed iterations at run time. If you're unsure whether a hint proves anything, run `zurdo --analyze --static-only` — the deterministic lint surfaces vacuous-shell and grep-tautology warnings before you commit compute to a real run.

## Writing hints that hold up

- **Probe behavior, not incidentals.** `[file-exists: README.md]` passes on almost any repo; `[shell: cargo test --workspace]` proves the work.
- **Make each criterion independently checkable.** If a hint needs a server running, say so in the task's Description so the agent starts it — or pick a hint that doesn't.
- **Let the failure diagnose itself.** Prefer `[shell: cargo test auth::token_expiry]` over one giant `[shell: ./check-everything.sh]`; per-criterion pass/fail in the run output then tells you *what* broke.
- **Use `[manual]` honestly.** It carries zero machine signal — it exists to put a human-review obligation on the record, not to make a task pass.

Next: [Commands](commands.md)
