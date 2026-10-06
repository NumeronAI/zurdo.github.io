# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Documentation site for the **zurdo** CLI, hosted on GitHub Pages at the custom domain `https://docs.zurdo.sh` (DNS: a CNAME record pointing `docs.zurdo.sh` to `numeronai.github.io`; the apex `zurdo.sh` no longer points at GitHub Pages). The repo is a *project* site under the NumeronAI org; without the custom domain it would serve at `https://numeronai.github.io/zurdo.github.io/`.

## Architecture

Plain Jekyll site using the GitHub Pages legacy branch build — pushes to `main` (root folder) deploy automatically; there is no GitHub Actions workflow and none is needed.

- `index.md` — landing page (`layout: landing`); its content (hero, features, quick-start tabs, principles) lives in front matter — the body is empty
- `docs/*.md` — documentation pages (reading order: how-it-works, installation, tutorial, usage, workflow, effective-use, writing-prds, hints, lumen, mcp, reason, commands, configuration, providers, roadmap); each uses `layout: default` with hero `title`/`description` and a `page_nav` prev/next chain in front matter
- `_data/docs_nav.yml` — the grouped page list behind both the landing page's docs directory and the docs sidebar; add new pages here
- `carol/*.md` — docs for **Carol**, zurdo's project-management companion CLI (reading order: index, installation, initiatives, github-sync, status, triage, commands); same front matter conventions as `docs/`, nav in `_data/carol_nav.yml`. `default.html` picks the sidebar by URL (`/carol/` → `carol_nav`, else `docs_nav`) and shows a zurdo | Carol switch above it; the header version chip, GitHub link, and page meta follow the same split. The landing page has a Carol section (`carol:` in `index.md` front matter) and a Carol column in the docs directory
- Site design: HeroUI v3's precompiled CSS (`assets/vendor/heroui/`, a pinned `@heroui/styles` build — no React, no Tailwind step) + `assets/css/site.css` (brand tokens, base, header, footer; class prefix `lp-`) + `landing.css` / `docs.css` per layout + `assets/js/site.js` (theme toggle, tabs, copy buttons, heading anchors, table wrapping, on-this-page list). Light/dark follows the OS until the toggle stores a choice
- `doks-theme/_layouts/` — `landing.html` (home), `default.html` (docs: sidebar · article · on-this-page), `error-404.html`; shared chrome is in `_includes/zurdo-head.html`, `zurdo-header.html`, `zurdo-footer.html`, `zurdo-docs-nav.html`. `default.html` loads mermaid when a page sets `mermaid: true`
- `doks-theme/` — despite the name (the site once used the vendored Doks theme), it now holds only the layouts and includes above plus `assets/images/` (`logo.png` for SEO metadata, `social-card.png` for share previews)
- `_config.yml` — `layouts_dir`/`includes_dir` point into `doks-theme/`; the `zurdo:` block holds the docs version, top nav, license, copyright, and support links; the `carol:` block holds Carol's released version and dist repo; empty `baseurl` (custom domain serves from root); `jekyll-relative-links`
- `CNAME` — the custom domain; deleting it detaches the domain from Pages

Default permalinks are kept deliberately (`/docs/usage.html`) so pre-migration URLs stay valid. Callouts are `<div class="callout callout--info|warning|danger" markdown="1">` blocks. Mermaid pages must set `mermaid: true` in front matter.

Content is hand-mirrored from the **private** `~/workspace/utils/zurdo` repo (source of truth); Carol pages from the **private** `ElOrlis/carol` repo (`README.md`, `CHANGELOG.md`, `CONTEXT.md` glossary, and `src/` for exact behavior — its `docs/proposals/`, `docs/carol/` scope/PRDs/tickets/handoff, and `lessons/` are internal and stay out). Wherever a Carol behavior touches zurdo (run state, `zurdo report`/`state list`/`validate --authoring-state` JSON, the PRD loop), cross-link both ways. The docs describe the released zurdo version in `_config.yml` (`zurdo.version`, shown in the header and on the home page); unreleased work goes only on `docs/roadmap.md` (Unreleased changelog items + current-milestone themes — internal proposals stay private). Carol's pages describe `carol.version` and have no roadmap page. Product bug reports point to the public `ElOrlis/zurdo-dist` repo (Carol: `ElOrlis/carol-dist`), docs feedback to this repo.

Link between pages with relative Markdown links (e.g. `[Usage](docs/usage.md)`) — `jekyll-relative-links` converts them, and they stay correct if the domain or baseurl ever changes.

## Commands

```sh
bundle install            # once; uses the github-pages gem
bundle exec jekyll serve  # local preview at http://localhost:4000/
```

There is no test suite. Build errors after a push appear in the repo's Actions tab (pages-build-deployment), not in Settings > Pages.
