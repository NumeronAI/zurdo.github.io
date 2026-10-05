---
# Page settings
layout: default

# Hero section
title: Installation
description: "Homebrew, release tarballs, and prerequisites."

# Page navigation
page_nav:
    prev:
        content: How it works
        url: '/docs/how-it-works.html'
    next:
        content: Usage
        url: '/docs/usage.html'
---

Zurdo ships as a pre-built binary from the public [zurdo-dist](https://github.com/ElOrlis/zurdo-dist) releases. It's proprietary and closed-source, so there's no source build and you don't need a Rust toolchain.

| Platform | Target | Homebrew | Tarball |
| --- | --- | --- | --- |
| macOS, Apple Silicon | `aarch64-apple-darwin` | ✓ | ✓ |
| Linux x86_64 | `x86_64-unknown-linux-gnu` | ✓ | ✓ |
| Linux aarch64 | `aarch64-unknown-linux-gnu` | ✓ | ✓ |
| macOS, Intel | — | — | — |

Intel Macs aren't pre-built yet.

## Homebrew (macOS and Linux)

```sh
brew install ElOrlis/zurdo/zurdo
```

On Linux this uses [Homebrew on Linux](https://docs.brew.sh/Homebrew-on-Linux).

<details markdown="1">
<summary>Upgrading from a pre-1.0 install</summary>

Older versions were tapped against the source repo, which is now private and no longer carries the formula. Re-tap once against the public tap:

```sh
brew untap elorlis/zurdo
brew install ElOrlis/zurdo/zurdo
```

</details>

## From a release tarball

```sh
VERSION=1.25.0
TARGET=aarch64-apple-darwin   # or x86_64-unknown-linux-gnu · aarch64-unknown-linux-gnu
curl -fsSL "https://github.com/ElOrlis/zurdo-dist/releases/download/v${VERSION}/zurdo-v${VERSION}-${TARGET}.tar.gz" \
  | tar -xz -C /usr/local/bin zurdo
```

Each release also ships `checksums.txt` and a `.sha256` file for each archive. To verify before installing (recommended in CI), download the archive instead of piping it, check it, then extract:

```sh
BASE="https://github.com/ElOrlis/zurdo-dist/releases/download/v${VERSION}"
curl -fsSLO "${BASE}/zurdo-v${VERSION}-${TARGET}.tar.gz"
curl -fsSLO "${BASE}/checksums.txt"
sha256sum --check --ignore-missing checksums.txt   # macOS: shasum -a 256 --check --ignore-missing checksums.txt
tar -xzf "zurdo-v${VERSION}-${TARGET}.tar.gz" -C /usr/local/bin zurdo
```

## Shell completions and man pages

Homebrew installs bash, zsh, and fish completions plus man pages (`man zurdo`, `man zurdo-run`, …). Tarballs bundle the same files under `completions/` and `man/`.

The binary can also generate completions for `bash`, `zsh`, `fish`, `elvish`, and `powershell`. These always match the installed version:

```sh
eval "$(zurdo completions zsh)"     # e.g. in your ~/.zshrc
```

## Prerequisites: an agent CLI

Zurdo shells out to an agent CLI to do the work. Install and sign in to at least one:

| Provider | CLI | Auth |
| --- | --- | --- |
| Anthropic | [`claude`](https://docs.claude.com/en/docs/claude-code/overview) | `claude login` or `ANTHROPIC_API_KEY` |
| OpenAI | [`codex`](https://github.com/openai/codex) | `codex login` or `OPENAI_API_KEY` |
| GitHub | [`copilot`](https://github.com/github/gh-copilot) | `copilot auth login` or `GITHUB_TOKEN` |

`zurdo init` writes a `.zurdo/config.toml` with all three providers wired up, so switching is a one-line edit. See [Providers](providers.md).

## Verify the installation

Check the binary, then run `zurdo doctor` in a repository you've set up with `zurdo init`:

```sh
zurdo --version
zurdo init      # once per repository
zurdo doctor
```

Doctor checks that the config loads, each provider CLI is on `PATH`, and each mapped model is available to your account:

<figure class="lp-terminal" aria-label="zurdo doctor output with every check passing">
<div class="lp-terminal__bar"><span class="lp-terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lp-terminal__title">zurdo doctor --skip-probes</span></div>
<pre class="lp-terminal__body"><code>config:
  <span class="t-ok">ok</span>    …/.zurdo/config.toml: loaded
providers:
  <span class="t-ok">ok</span>    executor → anthropic: cli `claude` found on PATH
  <span class="t-ok">ok</span>    analyzer → anthropic: cli `claude` found on PATH
models:
  <span class="t-ok">ok</span>    model probes: skipped (--skip-probes) — no provider process spawned
git:
  <span class="t-ok">ok</span>    git work tree: …/demo is a git work tree
  <span class="t-ok">ok</span>    .zurdo/ gitignored: no .gitignore present, or .zurdo/ is already listed
state:
  <span class="t-ok">ok</span>    run state directories: greeter-a4ed
  <span class="t-ok">ok</span>    run lock: no stale lock found
<span class="t-ok">doctor: all checks passed</span></code></pre>
<figcaption class="lp-terminal__caption"><span class="lp-dot" aria-hidden="true"></span>Drop --skip-probes to also check each model against your account.</figcaption>
</figure>

Doctor exits `4` on anything that would stop a run and `0` when its findings are only advisory. `--skip-probes` keeps it offline: no provider process is started. See [Commands](commands.md#zurdo-doctor--diagnose-the-environment).

<div class="callout callout--info" markdown="1">
**Note** If you see `zurdo: command not found` right after `brew install` on Linux, the Homebrew bin directory isn't on your `PATH`. Add this to your shell rc (`~/.bashrc` or `~/.zshrc`):

```sh
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```
</div>

## Optional: Carol, for project management

[Carol](../carol/index.md) is zurdo's companion CLI. It mirrors initiatives, PRDs, and run outcomes onto GitHub issues and a Projects board. It installs from the same tap:

```sh
brew install ElOrlis/zurdo/carol
```

See [Carol's installation](../carol/installation.md) for tarballs and the `gh` login it needs.
