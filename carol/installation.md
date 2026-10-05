---
# Page settings
layout: default

# Hero section
title: Installation
description: "Homebrew, release tarballs, and the gh login Carol needs."

# Page navigation
page_nav:
    prev:
        content: Overview
        url: '/carol/'
    next:
        content: Initiatives
        url: '/carol/initiatives.html'
---

Carol is distributed the same way as zurdo: pre-built binaries on the public [carol-dist]({{ site.carol.dist }}) releases, and a formula in the same Homebrew tap. It's proprietary and closed-source, so there's no source build.

| Platform | Target | Homebrew | Tarball |
| --- | --- | --- | --- |
| macOS, Apple Silicon | `aarch64-apple-darwin` | ✓ | ✓ |
| Linux x86_64 | `x86_64-unknown-linux-gnu` | ✓ | ✓ |
| Linux aarch64 | `aarch64-unknown-linux-gnu` | ✓ | ✓ |
| macOS, Intel | — | — | — |

## Homebrew (macOS and Linux)

```sh
brew install ElOrlis/zurdo/carol
```

If you already installed zurdo with Homebrew, the tap is already there. To install both tools at once:

```sh
brew install ElOrlis/zurdo/zurdo ElOrlis/zurdo/carol
```

## From a release tarball

```sh
VERSION=0.1.2
TARGET=aarch64-apple-darwin   # or x86_64-unknown-linux-gnu · aarch64-unknown-linux-gnu
curl -fsSL "https://github.com/ElOrlis/carol-dist/releases/download/v${VERSION}/carol-v${VERSION}-${TARGET}.tar.gz" \
  | tar -xz -C /usr/local/bin carol
```

Each release also ships `checksums.txt` and a `.sha256` file for each archive. To verify before installing, download the archive instead of piping it, check it, then extract:

```sh
BASE="https://github.com/ElOrlis/carol-dist/releases/download/v${VERSION}"
curl -fsSLO "${BASE}/carol-v${VERSION}-${TARGET}.tar.gz"
curl -fsSLO "${BASE}/checksums.txt"
sha256sum --check --ignore-missing checksums.txt   # macOS: shasum -a 256 --check --ignore-missing checksums.txt
tar -xzf "carol-v${VERSION}-${TARGET}.tar.gz" -C /usr/local/bin carol
```

## Shell completions and man pages

Homebrew installs bash, zsh, and fish completions plus man pages (`man carol`, `man carol-sync`, …). Tarballs bundle the same files under `completions/` and `man/`. The binary can also print a completion script for your shell:

```sh
eval "$(carol completions zsh)"     # e.g. in your ~/.zshrc
carol completions fish | source
```

## Prerequisites

| Needs | Why | Check |
|---|---|---|
| [`gh`](https://cli.github.com/), logged in | Every GitHub read and write goes through your own `gh` login. Carol stores no token of its own. | `gh auth status` |
| The `project` scope on that login | Only for `carol board`, which writes a Projects board. `carol scope` skips the board with a notice when it's missing. | `gh auth refresh -s project` |
| [zurdo](../docs/installation.md) on `PATH` | `sync`, `board`, `status`, and `score` read run state from zurdo's JSON | `zurdo --version` |
| A git checkout with an `origin` remote | Carol works out `owner/name` from `origin`, unless [`[tracker] repo`](commands.md#configuration) names it | `git remote get-url origin` |

Then run `carol doctor` from the repository root. It checks the `gh` login, that the base labels exist, and that zurdo answers:

```text
$ carol doctor
FAIL labels
ok  zurdo
```

A failing `labels` check on a new repository is expected: `carol bootstrap --apply` creates them. See [GitHub sync](github-sync.md#carol-bootstrap).

Next: [Initiatives](initiatives.md)
