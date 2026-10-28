# Publication plan — approval required

The portfolio is prepared locally. The public GitHub repository has not been created, initialized, committed, pushed, or published.

## Proposed public repository

- Owner: `UgurCC0`
- Name: `ugurdev-portfolio`
- Visibility: public
- Default branch: `main`

## Files proposed for publication

- `README.md`
- `projects/*.md`
- `assets/screenshots/**`
- `docs/screenshot-inventory.md`
- `docs/screenshot-manifest.json`
- `docs/evidence-matrix.md`
- `docs/qa-report.md`
- `docs/publication-plan.md`
- `scripts/*.cjs`
- `tests/*.cjs`
- `package.json`
- `.gitignore`

## Explicit exclusions

- Entire private `site-core` repository and its source code
- Entire private `atesogluelektrik-website` repository and commercial packages
- Entire local WordPress/WooCommerce installation
- Database dumps, SQL backups, runtime storage, logs, caches, sessions, uploads, credentials, and secret configuration
- Internal development plans and temporary diagnostics
- Unverified contact information

## Planned Git steps after approval

The exact sequence will be reviewed again before execution. No command below has been run.

```text
git init -b main
git add .gitignore README.md package.json projects assets/screenshots docs scripts tests
git diff --cached --check
git status --short
git commit -m "docs: build UGURDEV project portfolio"
create public GitHub repository UgurCC0/ugurdev-portfolio
add the approved GitHub remote
push main
```

Before publication, the staged file inventory and secret scan will be shown one final time. GitHub Pages will remain disabled unless separately approved.

[Back to portfolio](../README.md)
