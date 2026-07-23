# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Documentation site for the **zurdo** CLI, hosted on GitHub Pages at the custom domain `https://zurdo.sh` (DNS: apex A/AAAA records at the registrar pointing to GitHub Pages' IPs, since `zurdo.sh` is an apex domain). The repo is a *project* site under the NumeronAI org; without the custom domain it would serve at `https://numeronai.github.io/zurdo.github.io/`.

## Architecture

Plain Jekyll site using the GitHub Pages legacy branch build — pushes to `main` (root folder) deploy automatically; there is no GitHub Actions workflow and none is needed.

- `index.md` — landing page (pitch, quickstart, doc map)
- `docs/*.md` — documentation pages (how-it-works, installation, usage, writing-prds + hints child page, commands, configuration, providers, roadmap)
- `_config.yml` — Just the Docs via `remote_theme`, empty `baseurl` (custom domain serves from root), `jekyll-relative-links`, mermaid enabled
- `CNAME` — the custom domain; deleting it detaches the domain from Pages

Content is hand-mirrored from the **private** `~/workspace/utils/zurdo` repo (source of truth). The docs describe the released zurdo version stamped on the home page; unreleased work goes only on `docs/roadmap.md` (Unreleased changelog items + current-milestone themes — internal proposals stay private). Product bug reports point to the public `ElOrlis/zurdo-dist` repo, docs feedback to this repo.

Link between pages with relative Markdown links (e.g. `[Usage](docs/usage.md)`) — `jekyll-relative-links` converts them, and they stay correct if the domain or baseurl ever changes.

## Commands

```sh
bundle install            # once; uses the github-pages gem
bundle exec jekyll serve  # local preview at http://localhost:4000/
```

There is no test suite. Build errors after a push appear in the repo's Actions tab (pages-build-deployment), not in Settings > Pages.
