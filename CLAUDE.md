# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Documentation site for the **zurdo** CLI, hosted on GitHub Pages at the custom domain `https://zurdo.numeron.ai` (DNS: CNAME at Namecheap pointing to `numeronai.github.io`). The repo is a *project* site under the NumeronAI org; without the custom domain it would serve at `https://numeronai.github.io/zurdo.github.io/`.

## Architecture

Plain Jekyll site using the GitHub Pages legacy branch build — pushes to `main` (root folder) deploy automatically; there is no GitHub Actions workflow and none is needed.

- `index.md` — landing page
- `docs/*.md` — documentation pages (installation, usage, commands, configuration)
- `_config.yml` — theme (`jekyll-theme-minimal`), empty `baseurl` (custom domain serves from root), `jekyll-relative-links`
- `CNAME` — the custom domain; deleting it detaches the domain from Pages

Link between pages with relative Markdown links (e.g. `[Usage](docs/usage.md)`) — `jekyll-relative-links` converts them, and they stay correct if the domain or baseurl ever changes.

## Commands

```sh
bundle install            # once; uses the github-pages gem
bundle exec jekyll serve  # local preview at http://localhost:4000/
```

There is no test suite. Build errors after a push appear in the repo's Actions tab (pages-build-deployment), not in Settings > Pages.
