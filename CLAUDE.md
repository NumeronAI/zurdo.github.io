# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Documentation site for the **zurdo** CLI, hosted on GitHub Pages. Despite the repo name, this is a *project* site under the NumeronAI org, served at `https://numeronai.github.io/zurdo.github.io/` (the repo would need to be `NumeronAI.github.io` to get the root URL).

## Architecture

Plain Jekyll site using the GitHub Pages legacy branch build — pushes to `main` (root folder) deploy automatically; there is no GitHub Actions workflow and none is needed.

- `index.md` — landing page
- `docs/*.md` — documentation pages (installation, usage, commands, configuration)
- `_config.yml` — theme (`jekyll-theme-minimal`), `baseurl: /zurdo.github.io`, `jekyll-relative-links`

Because `baseurl` is non-empty, always link between pages with relative Markdown links (e.g. `[Usage](docs/usage.md)`) — `jekyll-relative-links` converts them; never hardcode absolute `/...` paths.

## Commands

```sh
bundle install            # once; uses the github-pages gem
bundle exec jekyll serve  # local preview at http://localhost:4000/zurdo.github.io/
```

There is no test suite. Build errors after a push appear in the repo's Actions tab (pages-build-deployment), not in Settings > Pages.
