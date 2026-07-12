# zurdo documentation

Documentation site for the **zurdo** CLI, published with GitHub Pages at
<https://zurdo.numeron.ai>.

## Local preview

```sh
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000/>.

## Structure

- `index.md` — landing page
- `docs/` — documentation pages (installation, usage, commands, configuration)
- `_config.yml` — Jekyll configuration (theme, site URL)
- `CNAME` — custom domain (`zurdo.numeron.ai`); do not delete

Pushing to `main` deploys automatically (Pages builds from the branch root).
