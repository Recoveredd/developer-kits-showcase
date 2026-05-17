# Developer Kits Showcase

Portfolio and interactive demo site for the Recoveredd TypeScript utility packages.

Live site: https://packages.wasta-wocket.fr/

The site is intentionally static: it is built with Vite, deployed manually on an Apache-backed host, and each package page works as a small browser demo that can be linked from GitHub and npm.

## What This Site Contains

- A landing page for the package collection.
- One route per package, for example `/json-html-kit/` or `/hex-grid-kit/`.
- Interactive demos powered by the published npm packages.
- Package metadata: npm link, GitHub link, version, license and short install command.
- Package signals generated from npm/GitHub activity.
- Static SEO assets: `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph metadata and `version.txt`.

The current catalog is maintained in [`src/catalog.ts`](src/catalog.ts). It contains the package list, demo labels, summaries, links, versions and navigation groups.

## Local Development

Install dependencies:

```bash
npm install
```

Start the local Vite server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Package Signals

Refresh npm/GitHub activity before rebuilding when the homepage metrics should reflect the latest package activity:

```bash
npm run signals
```

This writes:

- [`reports/package-signals.md`](reports/package-signals.md)
- [`reports/package-signals.json`](reports/package-signals.json)
- [`src/package-signals.ts`](src/package-signals.ts)

The homepage uses `src/package-signals.ts`, so run `npm run build` after refreshing signals.

## Adding A Package Page

1. Install the package in this portfolio project:

```bash
npm install <package-name>
```

2. Add or update its entry in [`src/catalog.ts`](src/catalog.ts).
3. Add the demo rendering logic in [`src/main.ts`](src/main.ts) if the package needs a custom interactive view.
4. Keep the route slug identical to the package name unless there is a strong reason not to.
5. Run:

```bash
npm run build
```

6. Check the page locally with `npm run preview`.

When a package moves from preview/local source to npm, make sure the demo imports the published package instead of a local source path.

## Deployment

Deployment is manual by design.

After a successful build, upload the contents of `dist/` to the Apache virtual host for:

```text
https://packages.wasta-wocket.fr/
```

The build copies or generates the static deployment assets needed by the host:

- `.htaccess`
- `robots.txt`
- `sitemap.xml`
- favicons and web manifest
- `version.txt`

`version.txt` contains the short Git commit for the deployed portfolio build. The parent workspace tracks deployment state in:

```text
../docs/portfolio-deployment.md
```

After deploying, verify that the online version matches the local portfolio commit from the parent workspace:

```bash
node scripts/check-portfolio-deployed-version.mjs
```

## SEO Notes

The post-build step runs automatically during `npm run build`:

```bash
node scripts/postbuild-seo.mjs
```

It prepares clean folder-based routes with `index.html`, page metadata, canonical links, structured data, sitemap entries and static fallback behavior for Apache.

Do not replace this with extensionless HTML files. Routes should stay directory-based:

```text
/json-html-kit/index.html
/array-table-kit/index.html
```

## Repository Scope

This repository only contains the portfolio and demo site. The packages themselves live in their own GitHub repositories and are installed here as dependencies once published on npm.

The site is not the source of truth for package implementation. It is the public demo and navigation layer for the package collection.
