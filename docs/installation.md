---
layout: default
title: Installation
---

# Installation

> TODO: fill in the real installation methods once release artifacts exist.

## Requirements

- Supported platforms: Linux, macOS <!-- TODO: confirm -->

## Install from a release binary

```sh
# TODO: replace with the real download URL / tap / package name
curl -fsSL https://github.com/NumeronAI/zurdo/releases/latest/download/zurdo-$(uname -s)-$(uname -m) -o zurdo
chmod +x zurdo
sudo mv zurdo /usr/local/bin/
```

## Build from source

```sh
git clone https://github.com/NumeronAI/zurdo.git
cd zurdo
# TODO: build command (e.g. go build ./..., cargo build --release, ...)
```

## Verify the installation

```sh
zurdo --version
```

[← Back to home](../index.md)
