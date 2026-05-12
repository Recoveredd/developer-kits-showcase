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
