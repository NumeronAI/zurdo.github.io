---
layout: default
title: Configuration
nav_order: 5
---

# Configuration

TODO: document the real config file location, format, and options.
{: .note }

## Config file

zurdo reads its configuration from: <!-- TODO: e.g. ~/.config/zurdo/config.toml -->

```toml
# Example configuration
# TODO: replace with real options
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `ZURDO_CONFIG` | Override the config file path <!-- TODO: confirm --> |

## Precedence

Command-line flags override environment variables, which override the config file.
