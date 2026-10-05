---
# Page settings
layout: default

# Hero section
title: Triage & scoring
description: "Area labels for issues people file by hand, and each task's run outcome beside the lint warnings its PRD drew."

# Page navigation
page_nav:
    prev:
        content: Status & handoffs
        url: '/carol/status.html'
    next:
        content: Commands & configuration
        url: '/carol/commands.html'
---

Two commands look beyond a single initiative. `triage` sorts the issues people file by hand. `score` looks back over every zurdo run in the repository. Both follow printed, mechanical rules. Neither asks a model.

## `carol triage`

```sh
carol triage [--apply] [--format json]
```

`triage` labels open issues that Carol didn't create (issues with no [marker](github-sync.md#markers)). It works from what the reporter wrote and from the area table in [`.carol/config.toml`](commands.md#configuration):

```toml
[triage.area_globs]
api     = ["src/api/**", "openapi/**"]
billing = ["src/billing/**"]
docs    = ["docs/**", "*.md"]
```

For each eligible issue:

1. **Skip it if a human has already decided.** That means the issue carries `ready-for-human`, `ready-for-agent`, `needs-info`, or `wontfix`.
2. **Find its areas.** If it has no `area:*` label yet, each path in the body (a word containing `/`, with backticks, quotes, trailing punctuation, and any `:line:col` suffix removed) is matched against the globs. Every area that matches adds an `area:<name>` label.
3. **Route it.** An issue with a work type (`bug`, `enhancement`, or `documentation`) and an area moves to `ready-for-human`, and `needs-triage` is removed. Anything else gets `needs-triage` and waits for a person.

Labels that don't exist yet are created in the same plan. Like every write command, `triage` only prints the plan until you add `--apply`. Without a `[triage.area_globs]` table it stops with exit 2.

<div class="callout callout--info" markdown="1">
Triage never promotes an issue into a ticket file or a PRD task, and never assigns priority. Turning a bug report into planned work is still a scoping decision, made in `scope.md` or a [PRD](../docs/writing-prds.md).
</div>

## `carol score --report`

```sh
carol score --report [--format json]
```

For every run zurdo knows about (`zurdo state list`), `score` lists each task's outcome beside the lint warnings that task's text drew **when the PRD was written**. It reads the warnings from [`zurdo validate --authoring-state`](../docs/commands.md#zurdo-validate---authoring-state) and the authored text from git. It's read-only and offline.

```text
$ carol score --report
docs/billing/prds/prd-01-invoices.md task-01: passed after 1 attempt(s); warnings: none
docs/billing/prds/prd-01-invoices.md task-02: passed after 3 attempt(s); warnings: doc-echo=1
docs/billing/prds/prd-01-invoices.md task-03: failed after 5 attempt(s); warnings: grep-tautology=2
first attempt: 1 task(s); mean warnings: doc-echo=0.00 grep-tautology=0.00
retried or failed: 2 task(s); mean warnings: doc-echo=0.50 grep-tautology=1.00
unvalidated: 0 task(s)
```

The summary compares the average warnings per task for tasks that passed on the first attempt against tasks that were retried or failed. `score` reports the numbers and draws no conclusion: interpreting them is your job at phase review, step 6 of the [PRD loop](../docs/workflow.md). If one lint family keeps showing up on tasks that struggle, take that as a reason to [tighten your hints](../docs/hints.md). A task whose PRD zurdo couldn't validate shows `unvalidated`.

Next: [Commands & configuration](commands.md)
