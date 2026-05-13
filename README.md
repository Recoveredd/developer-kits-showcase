# Developer Kits Showcase

Portfolio and demo site for small TypeScript utility packages.

Live site: https://packages.wasta-wocket.fr/

## Libraries

- [json-html-kit](https://packages.wasta-wocket.fr/json-html-kit/) — render JSON as safe, themed HTML.
- [array-table-kit](https://packages.wasta-wocket.fr/array-table-kit/) — convert arrays of objects to Markdown or HTML tables.
- [json-csv-kit](https://packages.wasta-wocket.fr/json-csv-kit/) — export JSON records to CSV.
- [object-path-kit](https://packages.wasta-wocket.fr/object-path-kit/) — parse and safely access object paths.
- [object-key-paths](https://packages.wasta-wocket.fr/object-key-paths/) — list nested object key paths.
- [terminal-table-kit](https://packages.wasta-wocket.fr/terminal-table-kit/) — parse terminal table output.
- [text-similarity-kit](https://packages.wasta-wocket.fr/text-similarity-kit/) — compare and rank short strings.
- [svg-ast-kit](https://packages.wasta-wocket.fr/svg-ast-kit/) — parse SVG markup into a typed JSON AST.
- [frontmatter-kit](https://packages.wasta-wocket.fr/frontmatter-kit/) — parse front matter with ranges and diagnostics.
- [data-url-kit](https://packages.wasta-wocket.fr/data-url-kit/) — parse and inspect data URLs.
- [hex-color-token-kit](https://packages.wasta-wocket.fr/hex-color-token-kit/) — extract and validate CSS hex colors.
- [human-duration-parse-kit](https://packages.wasta-wocket.fr/human-duration-parse-kit/) — parse human duration strings.
- [import-specifier-scan-kit](https://packages.wasta-wocket.fr/import-specifier-scan-kit/) — scan JavaScript import specifiers.
- [localized-price-parse-kit](https://packages.wasta-wocket.fr/localized-price-parse-kit/) — parse localized price strings.
- [css-font-shorthand-kit](https://packages.wasta-wocket.fr/css-font-shorthand-kit/) — parse CSS font shorthands.
- [jmx-k6-migration-kit](https://packages.wasta-wocket.fr/jmx-k6-migration-kit/) — audit JMeter JMX files for k6 migrations.
- [proto-form-kit](https://packages.wasta-wocket.fr/proto-form-kit/) — derive form metadata from Protocol Buffer schemas.
- [number-range-list-kit](https://packages.wasta-wocket.fr/number-range-list-kit/) — parse integer range lists.
- [hex-grid-kit](https://packages.wasta-wocket.fr/hex-grid-kit/) — build interactive SVG hex grids.
- [filepath-validator-kit](https://packages.wasta-wocket.fr/filepath-validator-kit/) — validate file paths with structured diagnostics.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploy the contents of `dist/` to an Apache-backed static host. The build includes `.htaccess`, `robots.txt` and `sitemap.xml`.

## Package Signals

Refresh the npm and GitHub snapshot before rebuilding when you want the homepage stats to reflect current package activity:

```bash
npm run signals
```

The script writes `reports/package-signals.md`, `reports/package-signals.json` and `src/package-signals.ts`.
