import type { LibraryMeta, LibrarySlug, RouteMeta } from './types';

export const SITE_URL = 'https://packages.wasta-wocket.fr';
export const SITE_NAME = 'Developer Kits';
export const SUPPORT_URL = 'https://ko-fi.com/recovered';
export const HOME_DESCRIPTION =
  'Small TypeScript developer utilities for JSON, tables, paths, CSV exports, terminal output, package metadata, text matching, SVG parsing, front matter, data URLs, HTTP headers, Link headers, retry plans, string hashes, range lists, file paths, hex grids, color matching, currency symbols, Node lockfiles, large logs, systemd units and HAR cleanup.';

export const libraries: LibraryMeta[] = [
  {
    slug: 'json-html-kit',
    name: 'json-html-kit',
    summary: 'Render JSON as safe, themed HTML that stays readable in docs, reports and support tools.',
    install: 'npm install json-html-kit',
    version: '0.4.2',
    github: 'https://github.com/Recoveredd/json-html-kit',
    npm: 'https://www.npmjs.com/package/json-html-kit',
    demoLabel: 'JSON viewer',
    highlight: 'Paginated viewer with readable page metadata.',
    accent: '#3f6df6'
  },
  {
    slug: 'array-table-kit',
    name: 'array-table-kit',
    summary: 'Turn arrays of objects into Markdown or HTML tables with explicit columns and clean escaping.',
    install: 'npm install array-table-kit',
    version: '0.2.3',
    github: 'https://github.com/Recoveredd/array-table-kit',
    npm: 'https://www.npmjs.com/package/array-table-kit',
    demoLabel: 'Markdown table',
    highlight: 'Readonly-friendly TypeScript API for fixture data.',
    accent: '#0f9f7a'
  },
  {
    slug: 'json-csv-kit',
    name: 'json-csv-kit',
    summary: 'Convert JSON records to CSV with TypeScript-first options, safe escaping and nested data support.',
    install: 'npm install json-csv-kit',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/json-csv-kit',
    npm: 'https://www.npmjs.com/package/json-csv-kit',
    demoLabel: 'CSV export',
    highlight: 'Optional UTF-8 BOM for spreadsheet exports.',
    accent: '#d97706'
  },
  {
    slug: 'object-path-kit',
    name: 'object-path-kit',
    summary: 'Parse, normalize and safely access JavaScript object paths, including bracket notation.',
    install: 'npm install object-path-kit',
    version: '0.1.3',
    github: 'https://github.com/Recoveredd/object-path-kit',
    npm: 'https://www.npmjs.com/package/object-path-kit',
    demoLabel: 'Path reader',
    highlight: 'Immutable get, set and delete helpers.',
    accent: '#6d5dfc'
  },
  {
    slug: 'object-key-paths',
    name: 'object-key-paths',
    summary: 'List nested key paths from objects and arrays for schema inspection, mapping and docs.',
    install: 'npm install object-key-paths',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/object-key-paths',
    npm: 'https://www.npmjs.com/package/object-key-paths',
    demoLabel: 'Path inventory',
    highlight: 'Bound large scans with an entry limit.',
    accent: '#0f8ea8'
  },
  {
    slug: 'terminal-table-kit',
    name: 'terminal-table-kit',
    summary: 'Parse fixed-width terminal table output into typed rows for scripts, dashboards and docs.',
    install: 'npm install terminal-table-kit',
    version: '0.1.2',
    github: 'https://github.com/Recoveredd/terminal-table-kit',
    npm: 'https://www.npmjs.com/package/terminal-table-kit',
    demoLabel: 'Terminal parser',
    highlight: 'Limit parsed rows from long command output.',
    accent: '#1f7a4f'
  },
  {
    slug: 'text-similarity-kit',
    name: 'text-similarity-kit',
    summary: 'Compare and rank short strings with TypeScript-first fuzzy matching helpers.',
    install: 'npm install text-similarity-kit',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/text-similarity-kit',
    npm: 'https://www.npmjs.com/package/text-similarity-kit',
    demoLabel: 'Text matching',
    highlight: 'Dice, Levenshtein, Jaro, Jaro-Winkler and threshold helpers.',
    accent: '#b91c5c'
  },
  {
    slug: 'svg-ast-kit',
    name: 'svg-ast-kit',
    summary: 'Parse SVG markup into a typed JSON AST with traversal, lookup and stats helpers.',
    install: 'npm install svg-ast-kit',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/svg-ast-kit',
    npm: 'https://www.npmjs.com/package/svg-ast-kit',
    demoLabel: 'SVG AST',
    highlight: 'Inspect element names, counts, attributes and parser output.',
    accent: '#2563eb'
  },
  {
    slug: 'frontmatter-kit',
    name: 'frontmatter-kit',
    summary: 'Parse and inspect front matter with typed metadata, body ranges and readable diagnostics.',
    install: 'npm install frontmatter-kit',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/frontmatter-kit',
    npm: 'https://www.npmjs.com/package/frontmatter-kit',
    demoLabel: 'Front matter',
    highlight: 'Inspector-friendly ranges, diagnostics, stringify and strip helpers.',
    accent: '#7c3aed'
  },
  {
    slug: 'data-url-kit',
    name: 'data-url-kit',
    summary: 'Parse, validate and inspect data URLs with typed diagnostics, byte metadata and decoded output.',
    install: 'npm install data-url-kit',
    version: '0.1.1',
    github: 'https://github.com/Recoveredd/data-url-kit',
    npm: 'https://www.npmjs.com/package/data-url-kit',
    demoLabel: 'Data URL inspector',
    highlight: 'Readable diagnostics and quick metadata helpers for previews.',
    accent: '#0891b2'
  },
  {
    slug: 'hex-color-token-kit',
    name: 'hex-color-token-kit',
    summary: 'Extract and validate CSS hex color tokens with spans, normalized values and readable diagnostics.',
    install: 'npm install hex-color-token-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/hex-color-token-kit',
    npm: 'https://www.npmjs.com/package/hex-color-token-kit',
    demoLabel: 'Color tokens',
    highlight: 'Find valid and malformed CSS hex colors without Node APIs.',
    accent: '#c2410c',
    features: ['#rgb, #rgba, #rrggbb and #rrggbbaa support', 'source offsets for editor tooling', 'normalized channels and alpha detection']
  },
  {
    slug: 'color-nearest-match-kit',
    name: 'color-nearest-match-kit',
    summary: 'Match a color against a named palette with ranked results and readable diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/color-nearest-match-kit',
    status: 'preview',
    demoLabel: 'Color matching',
    highlight: 'Preview ranks design-token palette colors without Node APIs.',
    accent: '#2563eb',
    features: [
      'hex and RGB object inputs',
      'top-N nearest palette matches with distances',
      'structured diagnostics for invalid colors and palettes'
    ]
  },
  {
    slug: 'currency-code-symbol-kit',
    name: 'currency-code-symbol-kit',
    summary: 'Resolve ISO currency codes to locale-aware symbols with structured diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/currency-code-symbol-kit',
    status: 'preview',
    demoLabel: 'Currency symbols',
    highlight: 'Preview shows Intl-backed symbols, invalid locales and same-symbol collisions.',
    accent: '#0f766e',
    features: [
      'locale-aware Intl.NumberFormat symbol lookup',
      'invalid code and invalid locale diagnostics',
      'caller-scoped same-symbol collision checks'
    ]
  },
  {
    slug: 'node-lockfile-doctor-kit',
    name: 'node-lockfile-doctor-kit',
    summary: 'Inspect Node package-manager lockfile consistency with structured diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/node-lockfile-doctor-kit',
    status: 'preview',
    demoLabel: 'Lockfile doctor',
    highlight: 'Preview catches package-manager drift, missing locks and lockfile conflicts.',
    accent: '#334155',
    features: [
      'npm, pnpm, Yarn and Bun lockfile detection',
      'packageManager, workspace and dependency drift diagnostics',
      'browser-friendly core plus optional Node CLI'
    ]
  },
  {
    slug: 'package-author-parse-kit',
    name: 'package-author-parse-kit',
    summary: 'Parse package author, maintainer and contributor strings with stable diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/package-author-parse-kit',
    status: 'preview',
    demoLabel: 'Package authors',
    highlight: 'Preview exposes name, email, URL tokens and source offsets for package metadata editors.',
    accent: '#6d5dfc',
    features: [
      'npm-style person field parsing',
      'source offsets for author, maintainer and contributor forms',
      'diagnostics for duplicate fields, invalid email and invalid URL'
    ]
  },
  {
    slug: 'human-duration-parse-kit',
    name: 'human-duration-parse-kit',
    summary: 'Parse compact human duration strings into milliseconds with structured tokens and diagnostics.',
    install: 'npm install human-duration-parse-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/human-duration-parse-kit',
    npm: 'https://www.npmjs.com/package/human-duration-parse-kit',
    demoLabel: 'Duration parser',
    highlight: 'Designed for forms and import tools that need explainable duration input.',
    accent: '#4f46e5',
    features: ['number words such as twenty-five minutes', 'negative terms and subtraction support', 'opt-in month and year approximations']
  },
  {
    slug: 'import-specifier-scan-kit',
    name: 'import-specifier-scan-kit',
    summary: 'Scan JavaScript source text for import, export, dynamic import and require specifiers.',
    install: 'npm install import-specifier-scan-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/import-specifier-scan-kit',
    npm: 'https://www.npmjs.com/package/import-specifier-scan-kit',
    demoLabel: 'Import scanner',
    highlight: 'Includes package-name helpers for dependency previews and audits.',
    accent: '#9333ea',
    features: ['static import, export-from, dynamic import and require scanning', 'spans for quick editor overlays', 'bare package extraction from subpath imports']
  },
  {
    slug: 'localized-price-parse-kit',
    name: 'localized-price-parse-kit',
    summary: 'Parse localized price strings into decimal values, currency hints and separator metadata.',
    install: 'npm install localized-price-parse-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/localized-price-parse-kit',
    npm: 'https://www.npmjs.com/package/localized-price-parse-kit',
    demoLabel: 'Price parser',
    highlight: 'Handles common ecommerce and invoice display prices.',
    accent: '#15803d',
    features: ['safe decimal string plus convenience number', 'currency symbol and ISO code hints', 'space and apostrophe grouped prices such as CHF 1’234.50']
  },
  {
    slug: 'css-font-shorthand-kit',
    name: 'css-font-shorthand-kit',
    summary: 'Parse and format CSS font shorthand values with structured diagnostics.',
    install: 'npm install css-font-shorthand-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/css-font-shorthand-kit',
    npm: 'https://www.npmjs.com/package/css-font-shorthand-kit',
    demoLabel: 'Font shorthand',
    highlight: 'Small browser-friendly parser for design-token and editor tooling.',
    accent: '#be123c',
    features: ['system font keyword support', 'font family parsing with quoted names', 'format parsed values back to CSS']
  },
  {
    slug: 'jmx-k6-migration-kit',
    name: 'jmx-k6-migration-kit',
    summary: 'Audit JMeter JMX files and generate safe k6 migration scaffolds with explicit diagnostics.',
    install: 'npm install jmx-k6-migration-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/jmx-k6-migration-kit',
    npm: 'https://www.npmjs.com/package/jmx-k6-migration-kit',
    demoLabel: 'JMX to k6',
    highlight: 'Conservative migration assistant for professional load-test handoffs.',
    accent: '#0f766e',
    features: ['HTTP sampler conversion', 'migration report for unsupported components', 'CLI plus browser-friendly core parser']
  },
  {
    slug: 'junit-report-doctor-kit',
    name: 'junit-report-doctor-kit',
    summary: 'Normalize JUnit XML reports with stable diagnostics for CI pipelines and test report uploads.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/junit-report-doctor-kit',
    status: 'preview',
    demoLabel: 'JUnit doctor',
    highlight: 'Preview detects counter mismatches, XML quirks, attachments and normalized test outcomes.',
    accent: '#1d4ed8',
    features: [
      'JUnit XML summary and JSON normalization',
      'strict counter diagnostics for CI preflight checks',
      'CDATA, namespaces, nested suites and attachment metadata'
    ]
  },
  {
    slug: 'proto-form-kit',
    name: 'proto-form-kit',
    summary: 'Turn Protocol Buffer schemas into form-friendly metadata, method hints and JSON examples.',
    install: 'npm install proto-form-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/proto-form-kit',
    npm: 'https://www.npmjs.com/package/proto-form-kit',
    demoLabel: 'Proto forms',
    highlight: 'Useful for API explorers and internal tooling that inspect .proto source text.',
    accent: '#2563eb',
    features: ['message, enum and service metadata', 'neutral form control hints', 'method input/output example generation']
  },
  {
    slug: 'number-range-list-kit',
    name: 'number-range-list-kit',
    summary: 'Parse integer range lists into safe expanded values, normalized segments and readable diagnostics.',
    install: 'npm install number-range-list-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/number-range-list-kit',
    npm: 'https://www.npmjs.com/package/number-range-list-kit',
    demoLabel: 'Range lists',
    highlight: 'Form-friendly parser with spans, warnings and expansion guards.',
    accent: '#7c2d12',
    features: ['bounded integer expansion', 'source spans for diagnostics', 'boolean validation helper for forms']
  },
  {
    slug: 'hex-grid-kit',
    name: 'hex-grid-kit',
    summary: 'Build interactive SVG hex grids with cube coordinates, hit testing and framework-agnostic helpers.',
    install: 'npm install hex-grid-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/hex-grid-kit',
    npm: 'https://www.npmjs.com/package/hex-grid-kit',
    demoLabel: 'Hex grid',
    highlight: 'Interactive cube-coordinate boards for games, editors and map tools.',
    accent: '#2563eb',
    features: ['cube-first coordinate helpers', 'hexagon, rectangle, parallelogram and custom shapes', 'per-cell data, fills and pointer callbacks']
  },
  {
    slug: 'filepath-validator-kit',
    name: 'filepath-validator-kit',
    summary: 'Validate file path strings with portable, POSIX or Windows policies and structured diagnostics.',
    install: 'npm install filepath-validator-kit',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/filepath-validator-kit',
    npm: 'https://www.npmjs.com/package/filepath-validator-kit',
    demoLabel: 'File paths',
    highlight: 'Form-friendly validation with segment spans, stable issue codes and reusable policies.',
    accent: '#334155',
    features: ['portable, POSIX and Windows validation policies', 'source offsets for path segments', 'reusable validators with default options']
  },
  {
    slug: 'http-cache-control-kit',
    name: 'http-cache-control-kit',
    summary: 'Parse and format HTTP Cache-Control headers with typed diagnostics for tooling and tests.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/http-cache-control-kit',
    status: 'preview',
    demoLabel: 'Cache-Control',
    highlight: 'Preview diagnoses directives, duplicate values, quoted strings and delta-seconds.',
    accent: '#0f766e',
    features: ['request and response Cache-Control directives', 'stable diagnostics for malformed headers', 'formatter with sorting and quote controls']
  },
  {
    slug: 'http-accept-language-kit',
    name: 'http-accept-language-kit',
    summary: 'Parse, format and lightly match HTTP Accept-Language headers with typed diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/http-accept-language-kit',
    status: 'preview',
    demoLabel: 'Accept-Language',
    highlight: 'Preview shows q-value sorting, wildcard diagnostics and supported-language matching.',
    accent: '#4338ca',
    features: ['strict HTTP qvalue precision by default', 'source order and raw token preservation', 'small exact, base-language and wildcard matcher']
  },
  {
    slug: 'numeric-unit-parse-kit',
    name: 'numeric-unit-parse-kit',
    summary: 'Parse numeric values with units into structured amounts, normalized strings and readable diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/numeric-unit-parse-kit',
    status: 'preview',
    demoLabel: 'Unit parser',
    highlight: 'Preview validates spacing, token and measurement inputs before npm publication.',
    accent: '#7c3aed',
    features: ['allowed unit lists with case sensitivity controls', 'unitless zero and percent policies', 'reusable parser defaults for forms']
  },
  {
    slug: 'file-extension-inspect-kit',
    name: 'file-extension-inspect-kit',
    summary: 'Inspect filename extensions with explicit dotfile, extensionless and compound-extension policies.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/file-extension-inspect-kit',
    status: 'preview',
    demoLabel: 'Extension inspector',
    highlight: 'Preview shows dotfile handling, compound extension matching and comparison behavior.',
    accent: '#475569',
    features: ['dotfile and extensionless filename policies', 'compound extension support such as tar.gz and d.ts', 'case and trim controls for upload validators']
  },
  {
    slug: 'large-log-viewer-kit',
    name: 'large-log-viewer-kit',
    summary: 'Inspect and render large browser logs with offset indexing, virtual windows and chunked search.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/large-log-viewer-kit',
    status: 'preview',
    demoLabel: 'Large logs',
    highlight: 'Preview demonstrates fixed-row virtualization, safe ANSI rendering and bounded search.',
    accent: '#0f766e',
    features: ['offset-backed line indexing without splitting every row', 'virtual windows for fixed-height log viewers', 'chunked search and ANSI-aware safe HTML output']
  },
  {
    slug: 'har-redaction-kit',
    name: 'har-redaction-kit',
    summary: 'Redact sensitive fields from HAR files with deterministic reports for support handoffs.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/har-redaction-kit',
    status: 'preview',
    demoLabel: 'HAR redaction',
    highlight: 'Preview masks headers, cookies, query strings, post bodies and JSON response content.',
    accent: '#b91c1c',
    features: ['request and response cookie/header redaction', 'JSON and form postData cleanup', 'strict or broad sensitive key matching']
  },
  {
    slug: 'systemd-unit-doctor-kit',
    name: 'systemd-unit-doctor-kit',
    summary: 'Inspect systemd unit files with portable diagnostics for browsers, CLIs and CI.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/systemd-unit-doctor-kit',
    status: 'preview',
    demoLabel: 'systemd doctor',
    highlight: 'Preview reports malformed sections, risky service policies, timer issues and unknown directives.',
    accent: '#334155',
    features: [
      'portable .service, .timer and .socket diagnostics',
      'line and directive metadata for editor or CI output',
      'browser-friendly core with a thin Node CLI wrapper'
    ]
  },
  {
    slug: 'retry-delay-plan-kit',
    name: 'retry-delay-plan-kit',
    summary: 'Build deterministic retry delay plans with diagnostics, jitter and Retry-After helpers.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/retry-delay-plan-kit',
    status: 'preview',
    demoLabel: 'Retry planner',
    highlight: 'Preview renders retry schedules before any timer or network call runs.',
    accent: '#6d5dfc',
    features: [
      'deterministic full, equal or no jitter plans',
      'issue reporting for unsafe user-provided options',
      'Retry-After delta-seconds and HTTP-date parsing'
    ]
  },
  {
    slug: 'murmur-string-hash-kit',
    name: 'murmur-string-hash-kit',
    summary: 'Hash UTF-8 strings with browser-friendly MurmurHash3 x86_32 helpers.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/murmur-string-hash-kit',
    status: 'preview',
    demoLabel: 'String hash',
    highlight: 'Preview hashes UTF-8 strings into uint32, hex and base36 fingerprints.',
    accent: '#0f8ea8',
    features: [
      'explicit UTF-8 byte hashing with byte count metadata',
      'seeded uint32, hex and base36 helpers',
      'optional maxBytes guard for untrusted input'
    ]
  },
  {
    slug: 'http-link-header-kit',
    name: 'http-link-header-kit',
    summary: 'Parse, inspect and format HTTP Link headers with diagnostics and pagination helpers.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/http-link-header-kit',
    status: 'preview',
    demoLabel: 'Link headers',
    highlight: 'Preview resolves rel tokens, pagination shortcuts and malformed parameter diagnostics.',
    accent: '#0f766e',
    features: [
      'non-throwing Link header parser with offsets',
      'case-insensitive rel lookup and pagination helpers',
      'formatter plus duplicate parameter diagnostics'
    ]
  }
];

export const demoTiles: Array<{ label: string; slug: LibrarySlug }> = [
  { label: 'HTML viewer', slug: 'json-html-kit' },
  { label: 'Markdown table', slug: 'array-table-kit' },
  { label: 'CSV export', slug: 'json-csv-kit' },
  { label: 'Object paths', slug: 'object-path-kit' },
  { label: 'Key inventory', slug: 'object-key-paths' },
  { label: 'Terminal rows', slug: 'terminal-table-kit' },
  { label: 'Text matching', slug: 'text-similarity-kit' },
  { label: 'SVG AST', slug: 'svg-ast-kit' },
  { label: 'Front matter', slug: 'frontmatter-kit' },
  { label: 'Data URL', slug: 'data-url-kit' },
  { label: 'Color match', slug: 'color-nearest-match-kit' },
  { label: 'Currency symbols', slug: 'currency-code-symbol-kit' },
  { label: 'Lockfiles', slug: 'node-lockfile-doctor-kit' },
  { label: 'Package author', slug: 'package-author-parse-kit' },
  { label: 'JUnit doctor', slug: 'junit-report-doctor-kit' },
  { label: 'Range lists', slug: 'number-range-list-kit' },
  { label: 'Hex grid', slug: 'hex-grid-kit' },
  { label: 'File paths', slug: 'filepath-validator-kit' },
  { label: 'Cache-Control', slug: 'http-cache-control-kit' },
  { label: 'Accept-Language', slug: 'http-accept-language-kit' },
  { label: 'Unit parser', slug: 'numeric-unit-parse-kit' },
  { label: 'Extensions', slug: 'file-extension-inspect-kit' },
  { label: 'Large logs', slug: 'large-log-viewer-kit' },
  { label: 'HAR cleanup', slug: 'har-redaction-kit' },
  { label: 'systemd units', slug: 'systemd-unit-doctor-kit' },
  { label: 'Retry plans', slug: 'retry-delay-plan-kit' },
  { label: 'String hash', slug: 'murmur-string-hash-kit' },
  { label: 'Link headers', slug: 'http-link-header-kit' }
];

export function libraryBySlug(slug: LibrarySlug): LibraryMeta {
  const library = libraries.find((item) => item.slug === slug);

  if (!library) {
    throw new Error(`Unknown library: ${slug}`);
  }

  return library;
}

export function libraryPath(slug: LibrarySlug): string {
  return `/${slug}/`;
}

export function isPublished(library: LibraryMeta): boolean {
  return library.status !== 'preview';
}

export function routeMeta(route: LibrarySlug | 'home'): RouteMeta {
  if (route === 'home') {
    return {
      title: `${SITE_NAME} | TypeScript utilities for developer data`,
      description: HOME_DESCRIPTION,
      path: '/'
    };
  }

  const library = libraryBySlug(route);

  return {
    title: `${library.name} ${isPublished(library) ? 'demo' : 'preview'} | ${SITE_NAME}`,
    description: library.summary,
    path: `/${library.slug}/`
  };
}
