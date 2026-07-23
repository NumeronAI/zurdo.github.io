---
# Page settings
layout: default
comments: false

# Hero section
title: Installation
description: "Homebrew, release tarballs, and prerequisites."

# Micro navigation
micro_nav: true

# Page navigation
page_nav:
    prev:
        content: How it works
        url: '/docs/how-it-works.html'
    next:
        content: Usage
        url: '/docs/usage.html'
---

## Homebrew (macOS and Linux)

```sh
brew install ElOrlis/zurdo/zurdo
```

This pulls a pre-built binary from the public [zurdo-dist](https://github.com/ElOrlis/zurdo-dist) releases — no Rust toolchain required. Shipped targets:

- macOS Apple Silicon (`aarch64-apple-darwin`)
- Linux x86_64 and aarch64, via [Homebrew on Linux](https://docs.brew.sh/Homebrew-on-Linux)

Intel macOS is not pre-built yet.

**Upgrading from a pre-1.0 install?** Older versions were tapped against the source repo, which is now private and no longer carries the formula. Re-tap once against the public tap:

```sh
brew untap elorlis/zurdo
brew install ElOrlis/zurdo/zurdo
```

## From a release tarball

```sh
# Replace VERSION and TARGET to taste. Available targets:
#   aarch64-apple-darwin
#   x86_64-unknown-linux-gnu · aarch64-unknown-linux-gnu
VERSION=1.6.0
TARGET=aarch64-apple-darwin
curl -fsSL "https://github.com/ElOrlis/zurdo-dist/releases/download/v${VERSION}/zurdo-v${VERSION}-${TARGET}.tar.gz" \
  | tar -xz -C /usr/local/bin zurdo
```

Each release also ships a `checksums.txt` and per-file `.sha256` siblings — verify before installing in CI:

```sh
curl -fsSLO "https://github.com/ElOrlis/zurdo-dist/releases/download/v${VERSION}/checksums.txt"
sha256sum --check --ignore-missing checksums.txt
```

## Source availability

Zurdo is proprietary, closed-source software. The source is not publicly available; install the pre-built binaries via Homebrew or the release tarballs above.

## Prerequisites: an agent CLI

Zurdo shells out to an agent CLI for the executor role. Install and authenticate at least one:

| Provider  | CLI                                                              | Auth                                    |
| --------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Anthropic | [`claude`](https://docs.claude.com/en/docs/claude-code/overview) | `claude login` or `ANTHROPIC_API_KEY`   |
| OpenAI    | [`codex`](https://github.com/openai/codex)                       | `codex login` or `OPENAI_API_KEY`       |
| GitHub    | [`copilot`](https://github.com/github/gh-copilot)                | `copilot auth login` or `GITHUB_TOKEN`  |

`zurdo init` writes a `.zurdo/config.toml` with all three providers wired; switching is a one-line edit. See [Providers](providers.md) for how zurdo drives each CLI.

## Verify the installation

```sh
zurdo --version
```

<div class="callout callout--info" markdown="1">
**Note** `zurdo: command not found` right after `brew install` on Linux usually means the Homebrew bin directory is not on your `PATH` — add `eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"` to your shell rc.
</div>

Next: [Usage](usage.md)
