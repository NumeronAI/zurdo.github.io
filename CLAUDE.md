# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Documentation site for the **zurdo** CLI, hosted on GitHub Pages at the custom domain `https://docs.zurdo.sh` (DNS: a CNAME record pointing `docs.zurdo.sh` to `numeronai.github.io`; the apex `zurdo.sh` no longer points at GitHub Pages). The repo is a *project* site under the NumeronAI org; without the custom domain it would serve at `https://numeronai.github.io/zurdo.github.io/`.

## Architecture

Plain Jekyll site using the GitHub Pages legacy branch build — pushes to `main` (root folder) deploy automatically; there is no GitHub Actions workflow and none is needed.

- `index.md` — landing page (`layout: landing`); all of its content (hero, features, quick-start tabs, docs directory, version) lives in front matter — the body is empty
- `doks-theme/_layouts/landing.html` — standalone landing layout built on HeroUI v3's precompiled CSS (`assets/vendor/heroui/`, pinned `@heroui/styles` build; no React, no Tailwind step) plus `assets/css/landing.css` (brand tokens + layout) and `assets/js/landing.js` (theme toggle, tabs, copy buttons). Its includes are `zurdo-mark.svg`, `zurdo-icon.html`, `zurdo-copy-icons.html`. Docs pages still use the Doks theme; `homepage.html` is now unused
- `docs/*.md` — documentation pages (reading order: how-it-works, installation, usage, workflow, effective-use, writing-prds, hints, lumen, mcp, reason, commands, configuration, providers, roadmap); each uses `layout: default` with hero `title`/`description`, `micro_nav`, and a `page_nav` prev/next chain in front matter
- `doks-theme/` — the vendored Doks theme (ThemeForest): `_layouts`, `_includes`, `_sass`, `assets`. Local edits: `homepage.html` also renders `{{ content }}` (in a centered `col-md-8 col-md-offset-2` column), `_callout.scss` makes only a callout's leading bold phrase a block title, `site-head.html` uses `{% seo %}`, `site-footer.html` loads mermaid when a page sets `mermaid: true`
- `_config.yml` — `layouts_dir`/`includes_dir`/`sass_dir` point into `doks-theme/`; `doks:` block holds header nav, footer, color theme; empty `baseurl` (custom domain serves from root); `jekyll-relative-links`
- `CNAME` — the custom domain; deleting it detaches the domain from Pages

Default permalinks are kept deliberately (`/docs/usage.html`) so pre-migration URLs stay valid. Callouts are `<div class="callout callout--info|warning|danger" markdown="1">` blocks. Mermaid pages must set `mermaid: true` in front matter.

Content is hand-mirrored from the **private** `~/workspace/utils/zurdo` repo (source of truth). The docs describe the released zurdo version stamped on the home page; unreleased work goes only on `docs/roadmap.md` (Unreleased changelog items + current-milestone themes — internal proposals stay private). Product bug reports point to the public `ElOrlis/zurdo-dist` repo, docs feedback to this repo.

Link between pages with relative Markdown links (e.g. `[Usage](docs/usage.md)`) — `jekyll-relative-links` converts them, and they stay correct if the domain or baseurl ever changes.

## Commands

```sh
bundle install            # once; uses the github-pages gem
bundle exec jekyll serve  # local preview at http://localhost:4000/
```

There is no test suite. Build errors after a push appear in the repo's Actions tab (pages-build-deployment), not in Settings > Pages.
