---
# Page settings
layout: default
comments: false

# Hero section
title: Hints reference
description: "The seven core hint types and the three experimental structural hints, with examples."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Writing PRDs
        url: '/docs/writing-prds.html'
    next:
        content: Diagnosis & lessons
        url: '/docs/reason.html'
---

Hints are the machine-checkable half of an acceptance criterion. After every agent iteration, zurdo executes each hint itself and decides pass/fail — the agent's opinion is never consulted.

## The seven core hint types

| Hint                                 | Behavior                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `[shell: <cmd>]`                     | Run the command; pass iff it exits `0`. Working directory is the repo root.         |
| `[http: <method> <url> -> <status>]` | Make the request; pass iff the response status matches. An optional `contains "<substring>"` tail additionally asserts the response body contains the substring (literal, case-sensitive; a non-empty `contains` against `HEAD` always fails). |
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
- [ ] /health reports ok [http: GET http://localhost:8080/health -> 200 contains "\"status\":\"ok\""]
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

<div class="callout callout--info" markdown="1">
**Note** **Upgrading from v1.1.x?** Patterns used to anchor to the start/end of the entire file. An anchored `[no-grep:]` hint that passed under the old semantics may now fail — that flip is the check finally seeing the line it was aimed at. Patterns without anchors are unaffected.
</div>

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

## Structural hints (experimental)

Three additional hint types verify facts about **named code symbols** — existence, references, call relationships — by static analysis instead of shell commands. They resolve against **Lumen**, zurdo's persistent structural index at `.zurdo/lumen/`, and are gated behind two config switches: `[lumen] enabled = true` **and** `[experimental] structural_hints = true` (setting the gate without Lumen is a config-load error).

```
[symbol: <kind> <qualified-name> in <file>]
[references: <kind> <qname> in <file> within <kind> <qname> in <file>]
[callers: <kind> <qname> in <file> within <kind> <qname> in <file>]
```

| Hint            | Proves                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `[symbol:]`     | A **definition** of that kind and qualified name exists in exactly that file — a use site or import doesn't count. |
| `[references:]` | The target symbol is referenced **inside** the enclosing symbol named by `within`, with the occurrence deterministically bound through lexical scope and static imports — a same-named symbol from another module doesn't count. |
| `[callers:]`    | Stronger than `[references:]`: the bound target occupies the **callee position of a call expression** inside the enclosing symbol. Passing the function as a value doesn't count. |

```markdown
- [ ] limiter type is defined [symbol: struct RateLimiter in src/middleware/rate_limit.rs]
- [ ] app wires the limiter [callers: method RateLimiter::layer in src/middleware/rate_limit.rs within function build_router in src/app.rs]
- [ ] config reaches the limiter [references: struct AppConfig in src/config.rs within struct RateLimiter in src/middleware/rate_limit.rs]
```

The load-bearing rules:

- **Kinds are a closed set of eleven:** `function`, `method`, `type`, `class`, `struct`, `enum`, `interface`, `trait`, `module`, `constant`, `variable` — each language maps its constructs onto them (`type` means a type *alias* only; Go's `type Foo struct` is a `struct`). Naming the wrong kind fails with the candidate's actual kind in the diagnostic.
- **Qualified names use `::`** as the owner separator in every language (`Config::load`); top-level names are unqualified. Top-level occurrences bind to the file's `module` symbol (`within module main in src/main.rs`).
- **Paths are exact and repo-relative** — no globs, no directory scopes, no inferring a file from a module name. `within` is mandatory on `[references:]`/`[callers:]` and rejected on `[symbol:]`.
- **Unique resolution or failure.** Zero candidates fails with "not found"; multiple candidates fail listing them. Dynamic dispatch, trait objects, and macro-generated names deliberately fail as ambiguous rather than guessing — a structural hint never false-passes.
- **Failures are typed** — `symbol_unresolved` / `binding_unresolved` — and passing verdicts record the resolved identity and source span in `prd.json` and the report's `structural_verdicts`.

Supported languages: Rust, Python, Go, TypeScript, and JavaScript (including TSX/JSX). Structural hints verify the **current working tree** — a task can satisfy its own structural criteria in the same run. Their target files count as evidence paths (frozen-overlap lints, evidence-modified warnings apply). A PRD with no structural hints never touches the index; one that has them triggers an index repair at pre-flight, and a non-ready index is a pre-flight error (`zurdo lumen rebuild` is the remedy) — never a silent criterion failure. The optional [Vela watcher](configuration.md#the-vela-watcher) keeps the index warm between runs.

## Writing hints that hold up

- **Probe behavior, not incidentals.** `[file-exists: README.md]` passes on almost any repo; `[shell: cargo test --workspace]` proves the work.
- **Make each criterion independently checkable.** If a hint needs a server running, say so in the task's Description so the agent starts it — or pick a hint that doesn't.
- **Let the failure diagnose itself.** Prefer `[shell: cargo test auth::token_expiry]` over one giant `[shell: ./check-everything.sh]`; per-criterion pass/fail in the run output then tells you *what* broke.
- **Use `[manual]` honestly.** It carries zero machine signal — it exists to put a human-review obligation on the record, not to make a task pass.

Next: [Diagnosis & lessons](reason.md)
