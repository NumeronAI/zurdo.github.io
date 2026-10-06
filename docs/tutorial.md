---
# Page settings
layout: default

# Hero section
title: Tutorial
description: "One small feature, from an empty repo to a closed issue. zurdo builds and verifies it, Carol keeps GitHub in step."

# Page navigation
page_nav:
    prev:
        content: Installation
        url: '/docs/installation.html'
    next:
        content: Usage
        url: '/docs/usage.html'
---

You'll build `greet.sh`, a two-task feature, in the demo repo `acme/hello`. The terminals show real zurdo and Carol output, trimmed. A scripted stand-in played the agent, so it ran in milliseconds and reported no token counts.

<p class="lp-who"><span class="lp-chip">you</span><span class="lp-chip lp-chip--zurdo">zurdo</span><span class="lp-chip lp-chip--carol">carol</span></p>

<figure class="lp-figure" aria-label="The tutorial's eight steps in three lanes. You write scope.md in step 3 and the PRD in step 4. zurdo installs, inits, validates in step 4, runs in step 6, and reviews in step 7. Carol installs, bootstraps, mirrors the scope in step 3, publishes in step 5, syncs in step 7, and reports status in step 8.">
<div class="lp-figure__scroll"><svg viewBox="0 0 680 222" role="img">
  <text class="lp-svg-muted" x="10" y="24">step</text>
  <a href="#step-1-install"><text class="lp-svg-text" x="127" y="24" text-anchor="middle" font-weight="600">1 Install</text></a>
  <a href="#step-2-set-up-the-repo"><text class="lp-svg-text" x="201" y="24" text-anchor="middle" font-weight="600">2 Set up</text></a>
  <a href="#step-3-scope-the-initiative"><text class="lp-svg-text" x="274" y="24" text-anchor="middle" font-weight="600">3 Scope</text></a>
  <a href="#step-4-write-the-prd"><text class="lp-svg-text" x="348" y="24" text-anchor="middle" font-weight="600">4 PRD</text></a>
  <a href="#step-5-publish-it"><text class="lp-svg-text" x="422" y="24" text-anchor="middle" font-weight="600">5 Publish</text></a>
  <a href="#step-6-run-it"><text class="lp-svg-text" x="496" y="24" text-anchor="middle" font-weight="600">6 Run</text></a>
  <a href="#step-7-review-and-sync"><text class="lp-svg-text" x="569" y="24" text-anchor="middle" font-weight="600">7 Review</text></a>
  <a href="#step-8-check-and-decide"><text class="lp-svg-text" x="643" y="24" text-anchor="middle" font-weight="600">8 Status</text></a>

  <rect x="80" y="44" width="596" height="48" rx="8" class="lp-svg-box" stroke-width="1"/>
  <rect x="80" y="104" width="596" height="48" rx="8" class="lp-svg-accent" stroke-width="1"/>
  <rect x="80" y="164" width="596" height="48" rx="8" class="lp-svg-carol" stroke-width="1"/>
  <text class="lp-svg-text" x="10" y="72" font-weight="600">You</text>
  <text class="lp-svg-text" x="10" y="132" font-weight="600">zurdo</text>
  <text class="lp-svg-text" x="10" y="192" font-weight="600">Carol</text>

  <path class="lp-svg-line" d="M127 149 V173 M201 149 V173 M274 89 V173 M348 89 V113 M569 149 V173" stroke-width="1" stroke-dasharray="3 3"/>

  <circle class="lp-svg-dot-zurdo" cx="127" cy="120" r="6"/><text class="lp-svg-mono" x="127" y="143" text-anchor="middle" font-size="11">brew</text>
  <circle class="lp-svg-dot-carol" cx="127" cy="180" r="6"/><text class="lp-svg-mono" x="127" y="203" text-anchor="middle" font-size="11">brew</text>
  <circle class="lp-svg-dot-zurdo" cx="201" cy="120" r="6"/><text class="lp-svg-mono" x="201" y="143" text-anchor="middle" font-size="11">init</text>
  <circle class="lp-svg-dot-carol" cx="201" cy="180" r="6"/><text class="lp-svg-mono" x="201" y="203" text-anchor="middle" font-size="11">bootstrap</text>
  <circle class="lp-svg-dot-you" cx="274" cy="60" r="6"/><text class="lp-svg-mono" x="274" y="83" text-anchor="middle" font-size="11">scope.md</text>
  <circle class="lp-svg-dot-carol" cx="274" cy="180" r="6"/><text class="lp-svg-mono" x="274" y="203" text-anchor="middle" font-size="11">scope</text>
  <circle class="lp-svg-dot-you" cx="348" cy="60" r="6"/><text class="lp-svg-mono" x="348" y="83" text-anchor="middle" font-size="11">PRD</text>
  <circle class="lp-svg-dot-zurdo" cx="348" cy="120" r="6"/><text class="lp-svg-mono" x="348" y="143" text-anchor="middle" font-size="11">validate</text>
  <circle class="lp-svg-dot-carol" cx="422" cy="180" r="6"/><text class="lp-svg-mono" x="422" y="203" text-anchor="middle" font-size="11">publish</text>
  <circle class="lp-svg-dot-zurdo" cx="496" cy="120" r="6"/><text class="lp-svg-mono" x="496" y="143" text-anchor="middle" font-size="11">run</text>
  <circle class="lp-svg-dot-zurdo" cx="569" cy="120" r="6"/><text class="lp-svg-mono" x="569" y="143" text-anchor="middle" font-size="11">review</text>
  <circle class="lp-svg-dot-carol" cx="569" cy="180" r="6"/><text class="lp-svg-mono" x="569" y="203" text-anchor="middle" font-size="11">sync</text>
  <circle class="lp-svg-dot-carol" cx="643" cy="180" r="6"/><text class="lp-svg-mono" x="643" y="203" text-anchor="middle" font-size="11">status</text>
</svg></div>
<figcaption>You write two files. zurdo does the work and checks it. Carol mirrors each step onto GitHub.</figcaption>
</figure>

## Step 1: Install

<p class="lp-who"><span class="lp-chip lp-chip--zurdo">zurdo</span><span class="lp-chip lp-chip--carol">carol</span></p>

```sh
brew install ElOrlis/zurdo/zurdo ElOrlis/zurdo/carol
gh auth login          # Carol writes to GitHub through your gh login
```

You also need a signed-in agent CLI (`claude`, `codex`, or `copilot`). Tarballs and prerequisites: [zurdo](installation.md) · [Carol](../carol/installation.md).

## Step 2: Set up the repo

<p class="lp-who"><span class="lp-chip lp-chip--zurdo">zurdo</span><span class="lp-chip lp-chip--carol">carol</span></p>

<figure class="lp-terminal" aria-label="zurdo init and doctor pass; carol doctor fails on labels until carol bootstrap creates them">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">acme/hello</span></div>
<pre class="lp-terminal__body"><code><span class="t-dim">$</span> zurdo init
init: wrote .zurdo/config.toml
<span class="t-dim">$</span> zurdo doctor
<span class="t-dim">…</span>
<span class="t-ok">doctor: all checks passed</span>
<span class="t-dim">$</span> carol doctor
<span class="t-bad">FAIL labels</span>
<span class="t-ok">ok</span>  zurdo
<span class="t-dim">$</span> carol bootstrap --apply
bootstrap: acme/hello (12 ops)
  create_label zurdo:epic #5319E7
  create_label zurdo:task #1D76DB
  <span class="t-dim">…</span>
<span class="t-dim">$</span> carol doctor
<span class="t-ok">ok</span>  labels
<span class="t-ok">ok</span>  zurdo</code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Once per repo. The failing labels check on a new repo is expected.</figcaption>
</figure>

## Step 3: Scope the initiative

<p class="lp-who"><span class="lp-chip">you</span><span class="lp-chip lp-chip--carol">carol</span></p>

An initiative is a folder. You write `scope.md` now and one PRD per phase later:

```text
docs/greeter/
├── scope.md                # ← now
└── prds/
    └── prd-01-hello.md     # ← step 4
```

```markdown
# Scope: Greeter

## Destination

A `greet.sh` script that says hello, by name when given one. Done when both forms print the exact text.

## Decisions so far

- Plain POSIX sh, no dependencies.

## Phases

| Phase | Title | PRD | Status |
|-------|-------|-----|--------|
| phase-01 | Hello CLI | docs/greeter/prds/prd-01-hello.md | ready |

## Out of scope

- Translations.
```

Mirror it to GitHub. **Read the plan, then add `--apply`:**

<figure class="lp-terminal" aria-label="carol scope prints a six-op plan: create and pin the scope issue, create and link the Greeter board">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">carol scope docs/greeter/scope.md</span></div>
<pre class="lp-terminal__body"><code>scope: acme/hello (6 ops)
  create_issue "Scope: Greeter" [&lt;!-- zurdo-github scope=greeter --&gt;]
  pin_issue [&lt;!-- zurdo-github scope=greeter --&gt;]
  create_project "Greeter"
  link_project_repo "Greeter" &lt;- acme/hello
  set_project_metadata "Greeter"
  add_project_item "Greeter" &lt;- [&lt;!-- zurdo-github scope=greeter --&gt;]
<span class="t-dim">$</span> carol scope docs/greeter/scope.md <span class="t-acc">--apply</span></code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Without --apply nothing is written. The hidden marker is how Carol finds the issue again.</figcaption>
</figure>

## Step 4: Write the PRD

<p class="lp-who"><span class="lp-chip">you</span><span class="lp-chip lp-chip--zurdo">zurdo</span></p>

Two tasks. Each criterion carries a **hint** that zurdo runs itself, so the agent can't grade its own work.

```markdown
# PRD: Hello CLI

## Task: task-greet — Print a greeting
**Effort**: low
**Depends-on**: []

### Description
Create `greet.sh` at the repo root. With no arguments it prints `Hello, world`.

### Acceptance Criteria
- [ ] the script exists [file-exists: greet.sh]
- [ ] it greets the world [shell: sh greet.sh | grep -qx "Hello, world"]

## Task: task-name — Greet by name
**Effort**: low
**Depends-on**: [task-greet]

### Description
When `greet.sh` gets a name, it prints `Hello, <name>` instead.

### Acceptance Criteria
- [ ] it greets by name [shell: sh greet.sh Ada | grep -qx "Hello, Ada"]
- [ ] the usage line reads well [manual]
```

<div class="lp-cards" markdown="1">
<div markdown="1">
**`—` em-dash**
Between task id and title. A hyphen is a validation error.
</div>
<div markdown="1">
**`Depends-on`**
`task-name` waits for `task-greet`. On GitHub it becomes *blocked by*.
</div>
<div markdown="1">
**`[manual]`**
A human signs this one off in step 7.
</div>
</div>

Check it before spending a token:

<figure class="lp-terminal" aria-label="zurdo validate prints OK; zurdo analyze --static-only says ready to run">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">docs/greeter/prds/prd-01-hello.md</span></div>
<pre class="lp-terminal__body"><code><span class="t-dim">$</span> zurdo validate docs/greeter/prds/prd-01-hello.md
<span class="t-ok">OK</span>
<span class="t-dim">$</span> zurdo analyze --static-only docs/greeter/prds/prd-01-hello.md
<span class="t-dim">…</span>
[info] Execution order: task-greet → task-name

<span class="t-dim">═══ Verdict ═══</span>
<span class="t-ok">✓ READY TO RUN — 0 errors, 0 warnings, 1 info</span></code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Both are free and instant. Drop --static-only for an LLM critique too.</figcaption>
</figure>

More: [Writing PRDs](writing-prds.md) · [Hints reference](hints.md).

## Step 5: Publish it

<p class="lp-who"><span class="lp-chip lp-chip--carol">carol</span></p>

```sh
carol publish docs/greeter/prds/prd-01-hello.md --apply
carol board   docs/greeter/prds/prd-01-hello.md --apply
```

<figure class="lp-figure" aria-label="What lands on GitHub: pinned scope issue 1, epic 2 Hello CLI as its sub-issue with milestone Hello CLI, tasks 3 and 4 as sub-issues of the epic, and 4 blocked by 3">
<div class="lp-figure__scroll"><svg viewBox="0 0 680 216" role="img">
  <rect x="10" y="10" width="360" height="40" rx="6" class="lp-svg-box" stroke-width="1"/>
  <text class="lp-svg-text" x="24" y="35" font-weight="600">#1  Scope: Greeter</text>
  <text class="lp-svg-mono" x="356" y="35" text-anchor="end" font-size="11">zurdo:scope</text>

  <path class="lp-svg-line" d="M26 50 V84 H44" stroke-width="1.5"/>
  <rect x="44" y="64" width="326" height="40" rx="6" class="lp-svg-accent" stroke-width="1.5"/>
  <text class="lp-svg-text" x="58" y="89" font-weight="600">#2  Hello CLI</text>
  <text class="lp-svg-mono" x="356" y="89" text-anchor="end" font-size="11">zurdo:epic</text>

  <path class="lp-svg-line" d="M60 104 V138 H78 M60 138 V192 H78" stroke-width="1.5"/>
  <rect x="78" y="118" width="292" height="40" rx="6" class="lp-svg-box" stroke-width="1"/>
  <text class="lp-svg-text" x="92" y="143">#3  Print a greeting</text>
  <text class="lp-svg-mono" x="356" y="143" text-anchor="end" font-size="11">ready-for-agent</text>
  <rect x="78" y="172" width="292" height="40" rx="6" class="lp-svg-box" stroke-width="1"/>
  <text class="lp-svg-text" x="92" y="197">#4  Greet by name</text>
  <text class="lp-svg-mono" x="356" y="197" text-anchor="end" font-size="11">effort:low</text>

  <path class="lp-svg-line" d="M370 192 C400 192 400 138 376 138" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path class="lp-svg-line" d="M382 133 L376 138 L382 143" stroke-width="1.5"/>

  <text class="lp-svg-text" x="420" y="27" font-weight="600">Pinned scope issue</text>
  <text class="lp-svg-muted" x="420" y="43">from scope.md · on the Greeter board</text>
  <text class="lp-svg-text" x="420" y="81" font-weight="600">Epic + milestone "Hello CLI"</text>
  <text class="lp-svg-muted" x="420" y="97">from the PRD title · sub-issue of #1</text>
  <text class="lp-svg-text" x="420" y="135" font-weight="600">One issue per task</text>
  <text class="lp-svg-muted" x="420" y="151">criteria as a checklist, hints in backticks</text>
  <text class="lp-svg-text" x="420" y="189" font-weight="600">Depends-on → blocked by #3</text>
  <text class="lp-svg-muted" x="420" y="205">the same graph zurdo schedules</text>
</svg></div>
<figcaption>carol publish: 11 ops. Re-running it updates these issues in place, never duplicates them.</figcaption>
</figure>

<figure class="lp-figure" aria-label="The Greeter board before any run: both task cards in Todo">
<div class="lp-board">
  <div class="lp-board__col"><span class="lp-board__head">Todo</span>
    <span class="lp-board__card lp-board__card--todo">Print a greeting<small>#3</small></span>
    <span class="lp-board__card lp-board__card--todo">Greet by name<small>#4</small></span>
  </div>
  <div class="lp-board__col"><span class="lp-board__head">In Progress</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Pending Review</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Done</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Failed</span></div>
</div>
<figcaption>The Greeter board before any run.</figcaption>
</figure>

## Step 6: Run it

<p class="lp-who"><span class="lp-chip lp-chip--zurdo">zurdo</span></p>

<figure class="lp-terminal" aria-label="zurdo run: task-greet passes in one iteration; task-name fails its shell hint once, passes on iteration 2, and waits for manual review">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">zurdo run docs/greeter/prds/prd-01-hello.md</span></div>
<pre class="lp-terminal__body"><code><span class="t-dim">─── task-greet: Print a greeting ─── effort=low, deps=[]</span>
  <span class="t-acc">→</span> iteration 1 of 3
  <span class="t-ok">✓</span> agent completed: exit=0
    <span class="t-ok">✓</span> file-exists: greet.sh
    <span class="t-ok">✓</span> shell: sh greet.sh | grep -qx "Hello, world"
  <span class="t-ok">✓ task-greet: passed in 1 iterations</span>
<span class="t-dim">─── task-name: Greet by name ─── effort=low, deps=[task-greet]</span>
  <span class="t-acc">→</span> iteration 1 of 3
  <span class="t-ok">✓</span> agent completed: exit=0
    <span class="t-bad">✗</span> shell: sh greet.sh Ada | grep -qx "Hello, Ada"
    <span class="t-ok">✓</span> [manual]
  <span class="t-acc">→</span> iteration 2 of 3
  <span class="t-ok">✓</span> agent completed: exit=0
    <span class="t-ok">✓</span> shell: sh greet.sh Ada | grep -qx "Hello, Ada"
    <span class="t-ok">✓</span> [manual]
  <span class="t-ok">✓ task-name: passed-pending-review in 2 iterations</span>
<span class="t-dim">═══ Run Summary ═══</span>
  task-id              status                             attempts   criteria
  task-greet           <span class="t-ok">passed</span>                             1/3        2/2
  task-name            <span class="t-warn">passed-pending-review</span>              2/3        2/2
  totals               1 passed, 1 pending-review, 0 failed, 0 blocked</code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>The agent said "Done!" both times. zurdo's own check caught the first try and sent it back.</figcaption>
</figure>

<div class="lp-cards" markdown="1">
<div markdown="1">
**✗ → retry**
The failing hint goes into the next prompt, up to `Max-Attempts`.
</div>
<div markdown="1">
**Ctrl-C is safe**
State is saved after every step. `zurdo run` again resumes.
</div>
<div markdown="1">
**pending-review**
Every automated check passed. `[manual]` is waiting on you.
</div>
</div>

Banner, timings, and token costs are trimmed here. Full output: [Usage](usage.md#what-a-run-looks-like).

## Step 7: Review and sync

<p class="lp-who"><span class="lp-chip lp-chip--zurdo">zurdo</span><span class="lp-chip lp-chip--carol">carol</span></p>

Push the run's results to GitHub:

<figure class="lp-terminal" aria-label="carol sync comments on both tasks, closes task-greet, labels task-name pending review; carol board moves the cards">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">carol sync · carol board</span></div>
<pre class="lp-terminal__body"><code><span class="t-dim">$</span> carol sync docs/greeter/prds/prd-01-hello.md
sync: acme/hello (5 ops)
  add_comment [&lt;!-- … task=task-greet --&gt;]
  <span class="t-ok">close_issue</span> [&lt;!-- … task=task-greet --&gt;]
  add_issue_labels <span class="t-warn">zurdo:pending-review</span> [&lt;!-- … task=task-name --&gt;]
  add_comment [&lt;!-- … task=task-name --&gt;]
  set_issue_body [&lt;!-- … epic --&gt;]
<span class="t-dim">$</span> carol sync docs/greeter/prds/prd-01-hello.md <span class="t-acc">--apply</span>
<span class="t-dim">$</span> carol board docs/greeter/prds/prd-01-hello.md <span class="t-acc">--apply</span></code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Markers shortened here. Syncing the same run twice posts nothing new.</figcaption>
</figure>

<div class="lp-issue" role="img" aria-label="Issue 4, Greet by name, labelled zurdo:pending-review, with Carol's comment: Zurdo run: passed pending review, attempts 2, last model claude-haiku-4-5">
<div class="lp-issue__head"><span class="lp-issue__title">Greet by name <span class="lp-issue__num">#4</span></span><span class="lp-issue__label" style="--tint: var(--warning)">zurdo:pending-review</span><span class="lp-issue__label">zurdo:task</span></div>
<div class="lp-issue__body"><b>Zurdo run: passed pending review</b><br>attempts: 2<br>last model: claude-haiku-4-5<br><span>tokens_in · tokens_out · cost_usd_est</span></div>
</div>

<figure class="lp-figure" aria-label="The board after sync: Print a greeting in Done, Greet by name in Pending Review">
<div class="lp-board">
  <div class="lp-board__col"><span class="lp-board__head">Todo</span></div>
  <div class="lp-board__col"><span class="lp-board__head">In Progress</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Pending Review</span>
    <span class="lp-board__card lp-board__card--review">Greet by name<small>#4</small></span>
  </div>
  <div class="lp-board__col"><span class="lp-board__head">Done</span>
    <span class="lp-board__card lp-board__card--done">Print a greeting<small>#3 · closed</small></span>
  </div>
  <div class="lp-board__col"><span class="lp-board__head">Failed</span></div>
</div>
<figcaption>After sync. A failed task would land in Failed, with its failing hints in the comment.</figcaption>
</figure>

Now sign off the `[manual]` criterion, then sync again:

```sh
zurdo review docs/greeter/prds/prd-01-hello.md   # Enter: evidence · d: diff · s: sign off
carol sync   docs/greeter/prds/prd-01-hello.md --apply
carol board  docs/greeter/prds/prd-01-hello.md --apply
```

<figure class="lp-figure" aria-label="The board after sign-off: both cards in Done">
<div class="lp-board">
  <div class="lp-board__col"><span class="lp-board__head">Todo</span></div>
  <div class="lp-board__col"><span class="lp-board__head">In Progress</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Pending Review</span></div>
  <div class="lp-board__col"><span class="lp-board__head">Done</span>
    <span class="lp-board__card lp-board__card--done">Print a greeting<small>#3 · closed</small></span>
    <span class="lp-board__card lp-board__card--done">Greet by name<small>#4 · closed</small></span>
  </div>
  <div class="lp-board__col"><span class="lp-board__head">Failed</span></div>
</div>
<figcaption>After sign-off. Sign-offs are logged and can't be undone.</figcaption>
</figure>

More: [zurdo review](usage.md#reviewing-a-run-with-zurdo-review) · [carol sync](../carol/github-sync.md#carol-sync).

## Step 8: Check and decide

<p class="lp-who"><span class="lp-chip lp-chip--carol">carol</span><span class="lp-chip">you</span></p>

`carol status` reads only local files and zurdo's run state. Run it at the start of any session.

<figure class="lp-terminal" aria-label="carol status greeter: phase-01 Hello CLI is ready, its run settled with 1 passed and 1 pending review">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">carol status greeter</span></div>
<pre class="lp-terminal__body"><code>Status — Greeter (docs/greeter/)
Destination: A `greet.sh` script that says hello, by name when given one.

  phase-01  Hello CLI  <span class="t-warn">ready</span>  prd-01-hello.md  <span class="t-ok">settled</span>: 1 passed · 1 pending-review · 0 failed · 0 blocked

Handoff: none.
Uncommitted:
  ?? greet.sh</code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Captured before sign-off. The Status column is yours: Carol never edits scope.md.</figcaption>
</figure>

The evidence holds, so you decide:

<div class="lp-cards" markdown="1">
<div markdown="1">
**1 · Merge**
Commit `greet.sh` yourself. zurdo never touches git.
</div>
<div markdown="1">
**2 · Mark it done**
Set the phase row to `done` in `scope.md`, then `carol scope … --apply`.
</div>
<div markdown="1">
**3 · Next phase**
Add `phase-02` to the table and start again at [step 4](#step-4-write-the-prd).
</div>
</div>

## Cheat sheet

| Step | You | zurdo | Carol |
|---|---|---|---|
| 1 · Install | | `brew install …/zurdo` | `brew install …/carol` |
| 2 · Set up | | `init` · `doctor` | `doctor` · `bootstrap --apply` |
| 3 · Scope | write `scope.md` | | `scope --apply` |
| 4 · PRD | write the PRD | `validate` · `analyze` | |
| 5 · Publish | | | `publish --apply` · `board --apply` |
| 6 · Run | | `run` | |
| 7 · Review | sign off | `review` | `sync --apply` · `board --apply` |
| 8 · Decide | update `scope.md` | | `status` · `scope --apply` |

Go deeper: [The PRD loop](workflow.md) · [Initiatives](../carol/initiatives.md) · [Commands](commands.md) · [Carol commands](../carol/commands.md).

Next: [Usage](usage.md)
