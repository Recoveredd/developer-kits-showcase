export type LibrarySlug =
  | 'json-html-kit'
  | 'array-table-kit'
  | 'json-csv-kit'
  | 'object-path-kit'
  | 'object-key-paths'
  | 'terminal-table-kit'
  | 'text-similarity-kit'
  | 'svg-ast-kit'
  | 'frontmatter-kit'
  | 'data-url-kit'
  | 'hex-color-token-kit'
  | 'color-nearest-match-kit'
  | 'currency-code-symbol-kit'
  | 'node-lockfile-doctor-kit'
  | 'package-author-parse-kit'
  | 'css-media-query-match-kit'
  | 'lcov-trace-doctor-kit'
  | 'robots-txt-kit'
  | 'human-duration-parse-kit'
  | 'import-specifier-scan-kit'
  | 'localized-price-parse-kit'
  | 'css-font-shorthand-kit'
  | 'jmx-k6-migration-kit'
  | 'junit-report-doctor-kit'
  | 'proto-form-kit'
  | 'number-range-list-kit'
  | 'hex-grid-kit'
  | 'filepath-validator-kit'
  | 'http-cache-control-kit'
  | 'http-accept-language-kit'
  | 'numeric-unit-parse-kit'
  | 'file-extension-inspect-kit'
  | 'large-log-viewer-kit'
  | 'har-redaction-kit'
  | 'systemd-unit-doctor-kit'
  | 'retry-delay-plan-kit'
  | 'murmur-string-hash-kit'
  | 'http-link-header-kit';

export type LibraryMeta = {
  slug: LibrarySlug;
  name: string;
  summary: string;
  install?: string;
  version: string;
  github: string;
  npm?: string;
  status?: 'published' | 'preview';
  demoLabel: string;
  highlight: string;
  accent: string;
  features?: string[];
};

export type RouteMeta = {
  title: string;
  description: string;
  path: string;
};

export type DemoModule = {
  renderDemo: () => string;
  bindDemo: () => void | Promise<void>;
};
