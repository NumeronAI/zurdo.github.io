---
# Page settings
layout: default
comments: false

# Hero section
title: Hints reference
description: "The seven core hint types and the three structural hints, with examples."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: Writing PRDs
        url: '/docs/writing-prds.html'
    next:
        content: Structural verification
        url: '/docs/lumen.html'
---

Hints are the machine-checkable half of an acceptance criterion. After every agent iteration, zurdo executes each hint itself and decides pass/fail — the agent's opinion is never consulted.

## The seven core hint types

| Hint                                 | Behavior                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `[shell: <cmd>]`                     | Run the command; pass iff it exits `0` **and** its output does not show a test runner that ran zero tests ([below](#a-shell-hint-that-runs-no-tests-fails)). Working directory is the repo root. |
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

Mixing `[manual]` with automated hints means the automated portion still gates; the manual portion surfaces a review obligation in reports, settled by an explicit sign-off in the [`zurdo review` TUI](usage.md#reviewing-a-run-with-zurdo-review). A task whose criteria are **all** `[manual]` short-circuits at pre-flight to `passed-pending-review` and never invokes the agent.

## A `[shell:]` hint that runs no tests fails

Exit `0` is not proof on its own. `cargo test <filter matching nothing>` exits `0` having run nothing at all — a criterion aimed at a test that was never written passes, and the run reports work that does not exist. Since v1.13.0 zurdo closes that hole: a `[shell:]` hint whose combined stdout/stderr shows a **test runner reporting zero tests** fails with the typed reason `a test runner ran zero tests`, whatever the exit code.

Two runner dialects are recognized:

- **libtest** (`cargo test`, `cargo bench --test`) — a `running N tests` report with no `N ≥ 1` line among them.
- **`go test`** — a package line ending `[no tests to run]`. A `[no test files]` package line is *not* a report at all and never fails the hint.

The check reads the untruncated capture, so a single genuine `running 1 test` among hundreds of zero-report lines still passes, and it applies everywhere criteria are evaluated: pre-flight, every iteration, `zurdo verify`, and `zurdo heal`. Runners whose output wasn't captured at authoring time (`cargo nextest`, the JS runners) are deliberately not matched; `pytest` needs no matcher because it already exits `5` on an empty filter. A criterion that genuinely wants a zero-test invocation to pass can redirect its output (`… > /dev/null`) to escape the check.

<div class="callout callout--warning" markdown="1">
**Why this exists** A milestone's worth of zurdo's own PRD tasks once recorded themselves as passed against `[shell: cargo test <name>]` criteria naming tests nobody had written — all four passed at pre-flight, with zero agent attempts, and a release shipped claiming flags the binary did not have. The empty-test-run check and the [run-end vacuous-pass warning](usage.md#when-a-task-passes-without-doing-anything) are the two guards that came out of it.
</div>

## Timeouts

`shell:` and `http:` hints are bounded by `[timeouts] criterion_seconds` in config (default 300s). File and grep hints are local checks and are not time-limited.

## Regex semantics for `[grep:]` / `[no-grep:]`

Patterns are Rust `regex` syntax, matched against the file's contents in **multi-line mode**: `^` and `$` anchor at line boundaries, the way command-line `grep` behaves. `[grep: ^## Heading in doc.md]` passes if any line starts with the heading. Explicit `(?m)` prefixes remain valid and are redundant. The same semantics apply everywhere a pattern is evaluated — the run-time verifier, the `validate`/`analyze` grep lints, and `heal` verification — so authoring-time verdicts match run-time verdicts.

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

Hints must actually test something meaningful. Three pitfalls prove nothing:

- **Vacuous shell hints** — `[shell: true]` or `[shell: echo "works"]` always pass; no work is verified.
- **Grep tautologies** — `[grep: .* in src/main.rs]` matches everything and proves nothing; `[no-grep: ^$ in src/main.rs]` fails tautologically.
- **Doc echoes** — a criterion whose *only* hint greps a prose document for a phrase the criterion's own text names. The task's job is to write that phrase, so the criterion cannot fail: it proves the phrase was typed, not that anything works.

### The six warn-lint families

Both `zurdo validate` and `zurdo analyze` surface the same deterministic lint families — as `warning:` lines on stderr from `validate`, and as `Finding`s at warning severity from `analyze`:

| Family                  | Fires when                                                                                             | Promotable by `--strict`? |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------- |
| `grep-target`           | A `[grep:]`/`[no-grep:]` pattern targets a directory or doesn't compile.                                | Yes                       |
| `vacuous-shell`         | A `[shell:]` payload can't fail (`true`, a bare `echo`, …).                                             | Yes                       |
| `grep-tautology`        | A pattern matches everything (or nothing) by construction.                                              | Yes                       |
| `uncovered-requirement` | A declared `### Requirements` id no `[proves:]` criterion covers.                                       | Yes                       |
| `doc-echo`              | A criterion's sole hint greps a prose doc — extension `md`, `mdx`, `markdown`, `rst`, or `adoc`, or a path starting `docs/` — for a phrase the criterion itself names. | No — advisory pending field data on false positives |
| `skill-resolution`      | A PRD-referenced skill can't be resolved.                                                               | No — permanently exempt; skills are user-managed, so a CI checkout legitimately lacks them |

`zurdo validate --strict` promotes the four promotable families to validation errors, so a PRD that would otherwise pass with warnings exits `2` — see [CI integration](usage.md#ci-integration).

Two remedies clear a `doc-echo` finding, and the suggestion names both: pin a **constant the change introduces** rather than the prose describing it, or add a **second hint that checks the behavior** so the criterion no longer rests on the grep alone. The lint already exempts patterns that carry a constant anchor (a digit, `/`, `_`, `::`, a `.` before an alphanumeric, a backtick, a leading `-`) or any regex metacharacter — a hand-built pattern is a deliberate act of precision, not an echo.

`zurdo analyze` also flags a **frozen-path overlap**: a `grep:`/`no-grep:`/`file-exists:`/`file-absent:` hint whose evidence path matches a `**Frozen**` glob or a `[verification] protected_paths` config glob for the same task — a conflict that would otherwise surface only as failed iterations at run time. If you're unsure whether a hint proves anything, run `zurdo analyze <prd> --static-only`: the deterministic lint surfaces every family above before you commit compute to a real run.

## Structural hints

Three additional hint types verify facts about **named code symbols** — existence, references, call relationships — by static analysis instead of shell commands. They resolve against **Lumen**, zurdo's persistent structural index at `.zurdo/lumen/`, and need one config switch: `[lumen] enabled = true`.

<div class="callout callout--info" markdown="1">
**Upgrading from ≤ 1.8?** These hints left `[experimental]` in **v1.9.0**. `[experimental] structural_hints` is deprecated and ignored — it still loads so old configs keep working, but it decides nothing and warns on stderr at config load. `[lumen] enabled = true` is now the only gate, and the old "can't enable structural hints with Lumen off" config-load error is gone.
</div>

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

Supported languages: Rust, Python, Go, TypeScript, and JavaScript (including TSX/JSX). Structural hints verify the **current working tree** — a task can satisfy its own structural criteria in the same run. Their target files count as evidence paths (frozen-overlap lints, evidence-modified warnings apply). The full subsystem — how the Lumen index works, exactly which constructs resolve per language, the Vela watcher that keeps the index warm, and the troubleshooting table — has its own page: [Structural verification](lumen.md).

## Writing hints that hold up

- **Probe behavior, not incidentals.** `[file-exists: README.md]` passes on almost any repo; `[shell: cargo test --workspace]` proves the work.
- **Make each criterion independently checkable.** If a hint needs a server running, say so in the task's Description so the agent starts it — or pick a hint that doesn't.
- **Let the failure diagnose itself.** Prefer `[shell: cargo test auth::token_expiry]` over one giant `[shell: ./check-everything.sh]`; per-criterion pass/fail in the run output then tells you *what* broke.
- **Use `[manual]` honestly.** It carries zero machine signal — it exists to put a human-review obligation on the record, not to make a task pass. The obligation is settled by a logged, irrevocable sign-off in `zurdo review`.

Next: [Structural verification](lumen.md)
