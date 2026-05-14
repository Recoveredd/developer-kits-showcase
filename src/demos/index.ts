import type { DemoModule, LibrarySlug } from '../types';

export async function loadDemo(slug: LibrarySlug): Promise<DemoModule> {
  switch (slug) {
    case 'json-html-kit':
      return import('./json-html-kit');
    case 'array-table-kit':
      return import('./array-table-kit');
    case 'json-csv-kit':
      return import('./json-csv-kit');
    case 'object-path-kit':
      return import('./object-path-kit');
    case 'object-key-paths':
      return import('./object-key-paths');
    case 'terminal-table-kit':
      return import('./terminal-table-kit');
    case 'text-similarity-kit':
      return import('./text-similarity-kit');
    case 'svg-ast-kit':
      return import('./svg-ast-kit');
    case 'frontmatter-kit':
      return import('./frontmatter-kit');
    case 'data-url-kit':
      return import('./data-url-kit');
    case 'hex-color-token-kit':
      return import('./hex-color-token-kit');
    case 'human-duration-parse-kit':
      return import('./human-duration-parse-kit');
    case 'import-specifier-scan-kit':
      return import('./import-specifier-scan-kit');
    case 'localized-price-parse-kit':
      return import('./localized-price-parse-kit');
    case 'css-font-shorthand-kit':
      return import('./css-font-shorthand-kit');
    case 'jmx-k6-migration-kit':
      return import('./jmx-k6-migration-kit');
    case 'junit-report-doctor-kit':
      return import('./junit-report-doctor-kit');
    case 'proto-form-kit':
      return import('./proto-form-kit');
    case 'number-range-list-kit':
      return import('./number-range-list-kit');
    case 'hex-grid-kit':
      return import('./hex-grid-kit');
    case 'filepath-validator-kit':
      return import('./filepath-validator-kit');
    case 'http-cache-control-kit':
      return import('./http-cache-control-kit');
    case 'http-accept-language-kit':
      return import('./http-accept-language-kit');
    case 'numeric-unit-parse-kit':
      return import('./numeric-unit-parse-kit');
    case 'file-extension-inspect-kit':
      return import('./file-extension-inspect-kit');
    case 'large-log-viewer-kit':
      return import('./large-log-viewer-kit');
    case 'har-redaction-kit':
      return import('./har-redaction-kit');
    case 'systemd-unit-doctor-kit':
      return import('./systemd-unit-doctor-kit');
    case 'retry-delay-plan-kit':
      return import('./retry-delay-plan-kit');
    case 'murmur-string-hash-kit':
      return import('./murmur-string-hash-kit');
    case 'http-link-header-kit':
      return import('./http-link-header-kit');
  }
}
