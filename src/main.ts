import { arrayToHtmlTable, arrayToMarkdownTable } from 'array-table-kit';
import { getDataUrlMediaType, isBase64DataUrl, parseDataUrl } from 'data-url-kit';
import { hasFrontmatter, stringifyFrontmatter, stripFrontmatter, tryParseFrontmatter } from 'frontmatter-kit';
import type { FrontmatterLanguage, FrontmatterRange } from 'frontmatter-kit';
import { jsonToCsv } from 'json-csv-kit';
import { createJsonHtmlViewer, getThemeStyleTag, renderJsonToHtml } from 'json-html-kit';
import type { JsonHtmlThemeName, JsonHtmlViewer } from 'json-html-kit';
import { deletePathImmutable, getPath, normalizePath, parsePath } from 'object-path-kit';
import { getPathEntries } from 'object-key-paths';
import { parseTerminalTable } from 'terminal-table-kit';
import { compareStrings, isSimilar, rankMatches } from 'text-similarity-kit';
import type { SimilarityAlgorithm } from 'text-similarity-kit';
import { findSvgElements, getSvgElementNames, getSvgStats, svgToJson, tryParseSvg } from 'svg-ast-kit';
import type { SvgStats } from 'svg-ast-kit';
import { packageSignals } from './package-signals';
import './styles.css';

type LibrarySlug =
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
  | 'human-duration-parse-kit'
  | 'import-specifier-scan-kit'
  | 'localized-price-parse-kit'
  | 'css-font-shorthand-kit'
  | 'jmx-k6-migration-kit'
  | 'proto-form-kit';

type LibraryMeta = {
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

type RouteMeta = {
  title: string;
  description: string;
  path: string;
};

const SITE_URL = 'https://packages.wasta-wocket.fr';
const SITE_NAME = 'Developer Kits';
const SUPPORT_URL = 'https://ko-fi.com/recovered';
const HOME_DESCRIPTION =
  'Small TypeScript developer utilities for JSON, tables, paths, CSV exports, terminal output, text matching, SVG parsing, front matter and data URLs.';

const libraries: LibraryMeta[] = [
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
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/hex-color-token-kit',
    status: 'preview',
    demoLabel: 'Color tokens',
    highlight: 'Find valid and malformed CSS hex colors without Node APIs.',
    accent: '#c2410c',
    features: ['#rgb, #rgba, #rrggbb and #rrggbbaa support', 'source offsets for editor tooling', 'normalized channels and alpha detection']
  },
  {
    slug: 'human-duration-parse-kit',
    name: 'human-duration-parse-kit',
    summary: 'Parse compact human duration strings into milliseconds with structured tokens and diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/human-duration-parse-kit',
    status: 'preview',
    demoLabel: 'Duration parser',
    highlight: 'Designed for forms and import tools that need explainable duration input.',
    accent: '#4f46e5',
    features: ['number words such as twenty-five minutes', 'negative terms and subtraction support', 'opt-in month and year approximations']
  },
  {
    slug: 'import-specifier-scan-kit',
    name: 'import-specifier-scan-kit',
    summary: 'Scan JavaScript source text for import, export, dynamic import and require specifiers.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/import-specifier-scan-kit',
    status: 'preview',
    demoLabel: 'Import scanner',
    highlight: 'Includes package-name helpers for dependency previews and audits.',
    accent: '#9333ea',
    features: ['static import, export-from, dynamic import and require scanning', 'spans for quick editor overlays', 'bare package extraction from subpath imports']
  },
  {
    slug: 'localized-price-parse-kit',
    name: 'localized-price-parse-kit',
    summary: 'Parse localized price strings into decimal values, currency hints and separator metadata.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/localized-price-parse-kit',
    status: 'preview',
    demoLabel: 'Price parser',
    highlight: 'Handles common ecommerce and invoice display prices.',
    accent: '#15803d',
    features: ['safe decimal string plus convenience number', 'currency symbol and ISO code hints', 'space and apostrophe grouped prices such as CHF 1’234.50']
  },
  {
    slug: 'css-font-shorthand-kit',
    name: 'css-font-shorthand-kit',
    summary: 'Parse and format CSS font shorthand values with structured diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/css-font-shorthand-kit',
    status: 'preview',
    demoLabel: 'Font shorthand',
    highlight: 'Small browser-friendly parser for design-token and editor tooling.',
    accent: '#be123c',
    features: ['system font keyword support', 'font family parsing with quoted names', 'format parsed values back to CSS']
  },
  {
    slug: 'jmx-k6-migration-kit',
    name: 'jmx-k6-migration-kit',
    summary: 'Audit JMeter JMX files and generate safe k6 migration scaffolds with explicit diagnostics.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/jmx-k6-migration-kit',
    status: 'preview',
    demoLabel: 'JMX to k6',
    highlight: 'Conservative migration assistant for professional load-test handoffs.',
    accent: '#0f766e',
    features: ['HTTP sampler conversion', 'migration report for unsupported components', 'CLI plus browser-friendly core parser']
  },
  {
    slug: 'proto-form-kit',
    name: 'proto-form-kit',
    summary: 'Turn Protocol Buffer schemas into form-friendly metadata, method hints and JSON examples.',
    version: '0.1.0',
    github: 'https://github.com/Recoveredd/proto-form-kit',
    status: 'preview',
    demoLabel: 'Proto forms',
    highlight: 'Useful for API explorers and internal tooling that inspect .proto source text.',
    accent: '#2563eb',
    features: ['message, enum and service metadata', 'neutral form control hints', 'method input/output example generation']
  }
];

const demoTiles: Array<{ label: string; slug: LibrarySlug }> = [
  { label: 'HTML viewer', slug: 'json-html-kit' },
  { label: 'Markdown table', slug: 'array-table-kit' },
  { label: 'CSV export', slug: 'json-csv-kit' },
  { label: 'Object paths', slug: 'object-path-kit' },
  { label: 'Key inventory', slug: 'object-key-paths' },
  { label: 'Terminal rows', slug: 'terminal-table-kit' },
  { label: 'Text matching', slug: 'text-similarity-kit' },
  { label: 'SVG AST', slug: 'svg-ast-kit' },
  { label: 'Front matter', slug: 'frontmatter-kit' },
  { label: 'Data URL', slug: 'data-url-kit' }
];

const reportSample = {
  report: 'API usage',
  generatedAt: '2026-05-12T09:30:00.000Z',
  customer: {
    name: 'Northwind Labs',
    plan: 'Scale',
    region: 'EU'
  },
  endpoints: [
    { path: '/v1/search', p95: 184, requests: 12904, healthy: true },
    { path: '/v1/export', p95: 421, requests: 870, healthy: true },
    { path: '/v1/import', p95: 890, requests: 312, healthy: false }
  ],
  notes: ['Nested JSON stays readable', 'Tables are detected automatically']
};

const rowsSample = [
  { name: 'Search API', owner: 'Platform', status: 'healthy', p95: 184, requests: 12904 },
  { name: 'Export API', owner: 'Data', status: 'healthy', p95: 421, requests: 870 },
  { name: 'Import API', owner: 'Data', status: 'degraded', p95: 890, requests: 312 }
];

const largeRowsSample = Array.from({ length: 250 }, (_, index) => {
  const id = index + 1;
  const p95 = 120 + ((id * 37) % 780);

  return {
    id,
    endpoint: `/v1/events/${id.toString().padStart(3, '0')}`,
    team: ['Platform', 'Data', 'Billing', 'Support'][index % 4],
    p95,
    requests: 240 + ((id * 163) % 18000),
    healthy: p95 < 720,
    metadata: {
      region: ['EU', 'US', 'APAC'][index % 3],
      tier: ['standard', 'priority', 'batch'][index % 3]
    }
  };
});

const terminalSample = `NAME        READY   STATUS    RESTARTS   AGE
api-7f9d    1/1     Running   0          4h
worker-21   1/1     Running   1          2h
sync-03     0/1     Pending   0          12m`;

const textCandidatesSample = [
  'Create invoice',
  'Export invoices',
  'Import contacts',
  'Payment export',
  'Search endpoint',
  'Customer support notes',
  'Marseille office'
];

const svgSample = `<svg viewBox="0 0 240 120" role="img" aria-labelledby="title desc">
  <title id="title">Latency chart</title>
  <desc id="desc">Three bars showing endpoint response time.</desc>
  <g class="bars" fill="#2563eb">
    <rect x="24" y="48" width="42" height="48" rx="6" data-label="search" />
    <rect x="98" y="24" width="42" height="72" rx="6" data-label="export" />
    <rect x="172" y="64" width="42" height="32" rx="6" data-label="import" />
  </g>
  <!-- baseline -->
  <path d="M18 96H222" stroke="#111827" stroke-width="2" />
</svg>`;

const frontmatterSample = `---
title: Release notes
draft: false
tags:
  - docs
  - release
author:
  name: Developer Kits
  team: Content tooling
---
# Release notes

Short intro for the public changelog.

<!-- more -->

Full article body with implementation details.`;

const dataUrlSample =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20240%20120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22240%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%230891b2%22%2F%3E%3Ctext%20x%3D%22120%22%20y%3D%2268%22%20font-size%3D%2228%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Edata-url-kit%3C%2Ftext%3E%3C%2Fsvg%3E';

const colorCssSample = `.button {
  color: #fff;
  background: #336699;
  border-color: #12zzzz;
  box-shadow: 0 0 0 3px #0f38;
}`;

const importSourceSample = `import React from "react";
import jsx from "react/jsx-runtime";
import local from "./local.js";
export { helper } from "@scope/pkg/subpath";
const legacy = require("legacy-package/utils");
const fs = await import("node:fs");`;

const jmxSample = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan testname="Checkout load test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments" />
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup testname="Users">
        <stringProp name="ThreadGroup.num_threads">5</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <stringProp name="LoopController.loops">3</stringProp>
        </elementProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy testname="Search API">
          <stringProp name="HTTPSampler.domain">api.example.com</stringProp>
          <stringProp name="HTTPSampler.protocol">https</stringProp>
          <stringProp name="HTTPSampler.path">/v1/search</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        <hashTree />
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;

const protoSample = `syntax = "proto3";

package demo.inventory;

message ListProductsRequest {
  string query = 1;
  repeated string tags = 2;
  map<string, int32> limits_by_region = 3;
}

message ListProductsResponse {
  repeated Product products = 1;
}

message Product {
  string id = 1;
  Status status = 2;
}

enum Status {
  STATUS_UNKNOWN = 0;
  STATUS_ACTIVE = 1;
}

service ProductCatalog {
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
}`;

function routeFromLocation(): LibrarySlug | 'home' {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '') as LibrarySlug;
  return libraries.some((library) => library.slug === slug) ? slug : 'home';
}

function navigate(path: string): void {
  window.history.pushState({}, '', path);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function libraryBySlug(slug: LibrarySlug): LibraryMeta {
  const library = libraries.find((item) => item.slug === slug);

  if (!library) {
    throw new Error(`Unknown library: ${slug}`);
  }

  return library;
}

function libraryPath(slug: LibrarySlug): string {
  return `/${slug}/`;
}

function isPublished(library: LibraryMeta): boolean {
  return library.status !== 'preview';
}

function render(): void {
  const route = routeFromLocation();
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    return;
  }

  updateDocumentMetadata(route);
  app.innerHTML = route === 'home' ? renderHome() : renderLibraryPage(libraryBySlug(route));
  bindNavigation(app);

  if (route !== 'home') {
    bindDemo(route);
  }
}

function routeMeta(route: LibrarySlug | 'home'): RouteMeta {
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

function updateDocumentMetadata(route: LibrarySlug | 'home'): void {
  const meta = routeMeta(route);
  const url = `${SITE_URL}${meta.path}`;

  document.title = meta.title;
  setMetaContent('meta[name="description"]', meta.description);
  setMetaContent('meta[property="og:title"]', meta.title);
  setMetaContent('meta[property="og:description"]', meta.description);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[name="twitter:title"]', meta.title);
  setMetaContent('meta[name="twitter:description"]', meta.description);
  setCanonical(url);
  setStructuredData(route, meta, url);
}

function setMetaContent(selector: string, content: string): void {
  const meta = document.querySelector<HTMLMetaElement>(selector);

  if (meta) {
    meta.content = content;
  }
}

function setCanonical(url: string): void {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (canonical) {
    canonical.href = url;
  }
}

function setStructuredData(route: LibrarySlug | 'home', meta: RouteMeta, url: string): void {
  const element = document.querySelector<HTMLScriptElement>('#structured-data');

  if (!element) {
    return;
  }

  const data =
    route === 'home'
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: SITE_NAME,
          url,
          description: meta.description,
          sameAs: ['https://github.com/Recoveredd', 'https://www.npmjs.com/~recovered', SUPPORT_URL],
          hasPart: libraries.map((library) => ({
            '@type': 'SoftwareSourceCode',
            name: library.name,
            codeRepository: library.github,
            sameAs: library.npm,
            programmingLanguage: 'TypeScript',
            runtimePlatform: ['Node.js', 'Web browser'],
            applicationCategory: 'DeveloperApplication',
            softwareVersion: library.version,
            license: 'https://www.mozilla.org/MPL/2.0/',
            url: `${SITE_URL}/${library.slug}/`,
            description: library.summary
          }))
        }
      : (() => {
          const library = libraryBySlug(route);

          return {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: library.name,
            codeRepository: library.github,
            sameAs: library.npm,
            programmingLanguage: 'TypeScript',
            runtimePlatform: ['Node.js', 'Web browser'],
            applicationCategory: 'DeveloperApplication',
            softwareVersion: library.version,
            license: 'https://www.mozilla.org/MPL/2.0/',
            url,
            description: meta.description,
            isPartOf: {
              '@type': 'CollectionPage',
              name: SITE_NAME,
              url: SITE_URL
            }
          };
        })();

  element.textContent = JSON.stringify(data);
}

function renderShell(content: string, activeSlug?: LibrarySlug): string {
  const navLinks = libraries
    .map((library) => {
      const isActive = library.slug === activeSlug;

      return `<a href="${libraryPath(library.slug)}" data-link class="demo-nav-link${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>${library.name.replace('-kit', '')}</a>`;
    })
    .join('');

  return `
    <header class="site-header">
      <a href="/" data-link class="brand" aria-label="Developer Kits home">
        <img class="brand-mark" src="/brand/developer-kits-logo-192.png" alt="" width="34" height="34" />
        <span>Developer Kits</span>
      </a>
      <nav class="demo-nav" aria-label="Demo navigation">${navLinks}</nav>
    </header>
    ${content}
    <footer class="site-footer">
      <span>Small TypeScript utilities for practical developer workflows.</span>
      <div class="footer-links">
        <a href="https://github.com/Recoveredd" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.npmjs.com/~recovered" target="_blank" rel="noreferrer">npm</a>
        <a href="${SUPPORT_URL}" target="_blank" rel="noopener noreferrer" aria-label="Support Developer Kits on Ko-fi">Ko-fi</a>
      </div>
    </footer>
  `;
}

function renderHome(): string {
  const publishedCards = libraries
    .filter(isPublished)
    .map(renderLibraryCard)
    .join('');
  const previewCards = libraries
    .filter((library) => !isPublished(library))
    .map(renderLibraryCard)
    .join('');

  return renderShell(`
    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <h1>Focused TypeScript utilities for JSON, tables and developer data.</h1>
          <p>
            A growing set of small packages built around the same idea: take awkward developer data and turn it
            into something readable, exportable or easy to map.
          </p>
          <div class="hero-actions">
            <a href="/json-html-kit/" data-link class="primary-action">Explore the demos</a>
            <a href="https://www.npmjs.com/~recovered" rel="noreferrer" class="secondary-action">View npm packages</a>
          </div>
        </div>
        <div class="hero-demo" aria-label="Package ecosystem preview">
          <div class="flow-node source">JSON</div>
          <div class="flow-grid">
            ${demoTiles
              .map((tile) => `<a href="${libraryPath(tile.slug)}" data-link>${tile.label}</a>`)
              .join('')}
          </div>
          <pre>${escapeHtml(jsonToCsv(rowsSample, { columns: ['name', 'p95', 'requests'] }))}</pre>
        </div>
      </section>
      <section class="principles-section">
        <div>
          <h2>Small by design, useful together.</h2>
          <p>
            Published pages run the npm packages in the browser. Preview pages lazy-load local libraries
            from GitHub-ready source while npm publishing is temporarily blocked.
          </p>
        </div>
        <div class="principle-list">
          <span>No runtime dependencies where possible</span>
          <span>TypeScript-first APIs</span>
          <span>Browser and Node friendly</span>
        </div>
      </section>
      ${renderSignalsSection()}
      <section class="library-section" aria-label="Published library demos">
        <div class="section-heading">
          <h2>Published demos</h2>
          <p>These packages are available on npm and run directly in the browser.</p>
        </div>
        <div class="library-grid">${publishedCards}</div>
      </section>
      <section class="library-section preview-library-section" aria-label="GitHub preview demos">
        <div class="section-heading">
          <h2>GitHub previews</h2>
          <p>These libraries are ready on GitHub and waiting for npm publication. Their demos lazy-load the local source.</p>
        </div>
        <div class="library-grid">${previewCards}</div>
      </section>
    </main>
  `);
}

function renderLibraryCard(library: LibraryMeta): string {
  const status = isPublished(library) ? 'npm package' : 'GitHub preview';

  return `
    <article class="library-card${isPublished(library) ? '' : ' is-preview'}" style="--accent: ${library.accent}">
      <div>
        <p class="card-label">${library.demoLabel}</p>
        <h3>${library.name}</h3>
        <p>${library.summary}</p>
        <div class="package-badges" aria-label="${library.name} package metadata">
          <span>v${library.version}</span>
          <span>${status}</span>
          <span>MPL-2.0</span>
        </div>
        <p class="card-highlight">${library.highlight}</p>
      </div>
      <div class="card-actions">
        <a href="${libraryPath(library.slug)}" data-link>${isPublished(library) ? 'Open demo' : 'Open preview'}</a>
        <a href="${library.github}" target="_blank" rel="noreferrer">Source</a>
      </div>
    </article>
  `;
}

function renderSignalsSection(): string {
  const topPackages = [...packageSignals.packages]
    .sort((left, right) => (right.downloadsLastWeek ?? 0) - (left.downloadsLastWeek ?? 0))
    .slice(0, 5)
    .map(
      (item) => `
        <li>
          <a href="${item.npmUrl}" target="_blank" rel="noreferrer">${item.name}</a>
          <span>${formatNumber(item.downloadsLastWeek ?? 0)} weekly downloads</span>
        </li>
      `
    )
    .join('');

  return `
    <section class="signals-section" aria-label="Package signals">
      <div>
        <h2>Package signals</h2>
        <p>
          A small weekly snapshot from npm and GitHub, showing where the kits are already getting used.
        </p>
      </div>
      <div class="signals-panel">
        <div class="signal-metrics">
          <div>
            <strong>${formatNumber(packageSignals.totals.downloadsLastWeek)}</strong>
            <span>npm downloads last week</span>
          </div>
          <div>
            <strong>${formatNumber(packageSignals.packages.length)}</strong>
            <span>published packages</span>
          </div>
        </div>
        <ol class="signal-list">${topPackages}</ol>
        <p class="signal-updated">Updated ${formatDate(packageSignals.generatedAt)}</p>
      </div>
    </section>
  `;
}

function renderLibraryPage(library: LibraryMeta): string {
  const installContent = isPublished(library)
    ? `<code>${library.install}</code>`
    : `<div class="preview-status-box">
        <strong>GitHub preview</strong>
        <span>npm publication is pending while registry rate limiting is resolved.</span>
      </div>`;
  const packageLinks = `
    <a href="${library.github}" target="_blank" rel="noreferrer">GitHub</a>
    ${library.npm ? `<a href="${library.npm}" target="_blank" rel="noreferrer">npm</a>` : ''}
  `;

  return renderShell(`
    <main>
      <section class="library-hero" style="--accent: ${library.accent}">
        <nav class="library-breadcrumb" aria-label="Breadcrumb">
          <a href="/" data-link>Developer Kits</a>
          <span aria-hidden="true">/</span>
          <span>${library.name}</span>
        </nav>
        <div class="library-heading">
          <div>
            <h1>${library.name}</h1>
            <p>${library.summary}</p>
          </div>
          <div class="install-box">
            ${installContent}
            <div class="package-badges install-badges" aria-label="Package metadata">
              <span>v${library.version}</span>
              <span>${isPublished(library) ? 'npm package' : 'preview'}</span>
              <span>MPL-2.0</span>
            </div>
            <div>${packageLinks}</div>
          </div>
        </div>
      </section>
      <section class="demo-shell">
        ${renderDemoMarkup(library.slug)}
      </section>
      <section class="next-section">
        ${libraries
          .filter((item) => item.slug !== library.slug)
          .slice(0, 3)
          .map((item) => `<a href="${libraryPath(item.slug)}" data-link>${item.name}<span>${item.demoLabel}</span></a>`)
          .join('')}
      </section>
    </main>
  `, library.slug);
}

function renderDemoMarkup(slug: LibrarySlug): string {
  const jsonValue = escapeHtml(JSON.stringify(reportSample, null, 2));

  if (slug === 'json-html-kit') {
    return `
      <div class="json-html-demo">
        <div class="demo-tabs" role="tablist" aria-label="json-html-kit demo modes">
          <button id="json-html-renderer-tab" type="button" class="demo-tab is-active" role="tab" aria-selected="true" aria-controls="json-html-renderer-panel" data-json-html-tab="renderer">Renderer</button>
          <button id="json-html-pagination-tab" type="button" class="demo-tab" role="tab" aria-selected="false" aria-controls="json-html-pagination-panel" data-json-html-tab="pagination">Pagination</button>
        </div>
        <div id="json-html-renderer-panel" class="tab-demo-grid" role="tabpanel" aria-labelledby="json-html-renderer-tab">
          <div class="panel input-panel">
            <label for="json-html-input">JSON input</label>
            <textarea id="json-html-input" spellcheck="false">${jsonValue}</textarea>
            <div class="control-row">
              <label for="json-html-theme">Theme</label>
              <select id="json-html-theme">
                <option value="clean">clean</option>
                <option value="slate">slate</option>
                <option value="paper">paper</option>
              </select>
            </div>
            <div class="control-row">
              <label for="json-html-collapse">Collapse depth</label>
              <div class="range-control">
                <input id="json-html-collapse" type="range" min="0" max="5" step="1" value="3" />
                <output id="json-html-collapse-value" for="json-html-collapse">3</output>
              </div>
            </div>
          </div>
          <div class="panel output-panel">
            <div class="panel-title">Rendered HTML</div>
            <div id="json-html-output" class="rendered-json"></div>
          </div>
        </div>
        <div id="json-html-pagination-panel" class="tab-demo-grid" role="tabpanel" aria-labelledby="json-html-pagination-tab" hidden>
          <div class="panel input-panel">
            <div class="panel-title compact-title">Large array</div>
            <pre class="code-output compact-code">${escapeHtml(JSON.stringify(largeRowsSample.slice(0, 6), null, 2))}</pre>
            <div class="control-row">
              <label for="json-html-page-theme">Theme</label>
              <select id="json-html-page-theme">
                <option value="clean">clean</option>
                <option value="slate">slate</option>
                <option value="paper">paper</option>
              </select>
            </div>
            <div class="control-row">
              <label for="json-html-page-size">Page size</label>
              <select id="json-html-page-size">
                <option value="10">10 rows</option>
                <option value="25" selected>25 rows</option>
                <option value="50">50 rows</option>
              </select>
            </div>
          </div>
          <div class="panel output-panel">
            <div class="panel-title">Paginated viewer</div>
            <div id="json-html-page-info" class="demo-meta"></div>
            <div id="json-html-pagination-output" class="rendered-json"></div>
          </div>
        </div>
      </div>
    `;
  }

  if (slug === 'array-table-kit') {
    return `
      <div class="panel input-panel">
        <label for="array-table-input">Rows</label>
        <textarea id="array-table-input" spellcheck="false">${escapeHtml(JSON.stringify(rowsSample, null, 2))}</textarea>
        <div class="control-row">
          <label for="array-table-format">Format</label>
          <select id="array-table-format">
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
          </select>
        </div>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Table output</div>
        <pre id="array-table-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'json-csv-kit') {
    return `
      <div class="panel input-panel">
        <label for="json-csv-input">Records</label>
        <textarea id="json-csv-input" spellcheck="false">${escapeHtml(JSON.stringify(rowsSample, null, 2))}</textarea>
        <div class="control-row">
          <label for="json-csv-delimiter">Delimiter</label>
          <select id="json-csv-delimiter">
            <option value=",">comma</option>
            <option value=";">semicolon</option>
          </select>
        </div>
        <label class="check-control">
          <input id="json-csv-bom" type="checkbox" />
          <span>UTF-8 BOM</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">CSV output</div>
        <pre id="json-csv-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'object-path-kit') {
    return `
      <div class="panel input-panel">
        <label for="object-path-input">Object</label>
        <textarea id="object-path-input" spellcheck="false">${jsonValue}</textarea>
        <label for="object-path-query">Path</label>
        <input id="object-path-query" value='customer["name"]' />
        <label class="check-control">
          <input id="object-path-delete" type="checkbox" />
          <span>Preview immutable delete</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Path result</div>
        <pre id="object-path-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'object-key-paths') {
    return `
      <div class="panel input-panel">
        <label for="object-key-input">Object</label>
        <textarea id="object-key-input" spellcheck="false">${jsonValue}</textarea>
        <div class="control-row">
          <label for="object-key-style">Path style</label>
          <select id="object-key-style">
            <option value="dot">dot</option>
            <option value="bracket">bracket</option>
          </select>
        </div>
        <div class="control-row">
          <label for="object-key-limit">Entry limit</label>
          <select id="object-key-limit">
            <option value="0">unlimited</option>
            <option value="5">5 entries</option>
            <option value="10" selected>10 entries</option>
          </select>
        </div>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Discovered paths</div>
        <div id="object-key-output" class="table-output"></div>
      </div>
    `;
  }

  if (slug === 'text-similarity-kit') {
    return `
      <div class="panel input-panel">
        <label for="text-similarity-query">Query</label>
        <input id="text-similarity-query" value="export invoice" />
        <label for="text-similarity-candidates">Candidates</label>
        <textarea id="text-similarity-candidates" spellcheck="false">${escapeHtml(textCandidatesSample.join('\n'))}</textarea>
        <div class="control-row">
          <label for="text-similarity-algorithm">Algorithm</label>
          <select id="text-similarity-algorithm">
            <option value="dice">dice</option>
            <option value="levenshtein">levenshtein</option>
            <option value="jaro">jaro</option>
            <option value="jaro-winkler" selected>jaro-winkler</option>
          </select>
        </div>
        <div class="control-row">
          <label for="text-similarity-threshold">Threshold</label>
          <div class="range-control">
            <input id="text-similarity-threshold" type="range" min="0" max="1" step="0.05" value="0.25" />
            <output id="text-similarity-threshold-value" for="text-similarity-threshold">0.25</output>
          </div>
        </div>
        <div class="control-row">
          <label for="text-similarity-limit">Limit</label>
          <select id="text-similarity-limit">
            <option value="0">all matches</option>
            <option value="3" selected>3 matches</option>
            <option value="5">5 matches</option>
          </select>
        </div>
        <label class="check-control">
          <input id="text-similarity-diacritics" type="checkbox" />
          <span>Strip diacritics</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Ranked matches</div>
        <div id="text-similarity-score" class="demo-meta"></div>
        <div id="text-similarity-output" class="table-output"></div>
      </div>
    `;
  }

  if (slug === 'svg-ast-kit') {
    return `
      <div class="panel input-panel">
        <label for="svg-ast-input">SVG markup</label>
        <textarea id="svg-ast-input" spellcheck="false">${escapeHtml(svgSample)}</textarea>
        <div class="control-row">
          <label for="svg-ast-find">Find elements</label>
          <select id="svg-ast-find">
            <option value="*">all elements</option>
            <option value="svg">svg</option>
            <option value="g">g</option>
            <option value="rect" selected>rect</option>
            <option value="path">path</option>
            <option value="title">title</option>
          </select>
        </div>
        <label class="check-control">
          <input id="svg-ast-comments" type="checkbox" checked />
          <span>Keep comments</span>
        </label>
        <label class="check-control">
          <input id="svg-ast-positions" type="checkbox" />
          <span>Include positions</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed AST</div>
        <div id="svg-ast-summary" class="table-output compact-table-output"></div>
        <pre id="svg-ast-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'frontmatter-kit') {
    return `
      <div class="panel input-panel">
        <label for="frontmatter-input">Markdown document</label>
        <textarea id="frontmatter-input" spellcheck="false">${escapeHtml(frontmatterSample)}</textarea>
        <div class="control-row">
          <label for="frontmatter-language">Parse as</label>
          <select id="frontmatter-language">
            <option value="auto" selected>auto</option>
            <option value="yaml">yaml</option>
            <option value="json">json</option>
            <option value="toml">toml</option>
          </select>
        </div>
        <div class="control-row">
          <label for="frontmatter-stringify">Stringify as</label>
          <select id="frontmatter-stringify">
            <option value="yaml" selected>yaml</option>
            <option value="json">json</option>
            <option value="toml">toml</option>
          </select>
        </div>
        <label class="check-control">
          <input id="frontmatter-excerpt" type="checkbox" checked />
          <span>Use excerpt separator</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed front matter</div>
        <div id="frontmatter-summary" class="table-output compact-table-output"></div>
        <div id="frontmatter-output" class="frontmatter-output"></div>
      </div>
    `;
  }

  if (slug === 'data-url-kit') {
    return `
      <div class="panel input-panel">
        <label for="data-url-input">Data URL</label>
        <textarea id="data-url-input" spellcheck="false">${escapeHtml(dataUrlSample)}</textarea>
        <div class="control-row">
          <label for="data-url-max-bytes">Max bytes</label>
          <select id="data-url-max-bytes">
            <option value="0">no limit</option>
            <option value="128">128 bytes</option>
            <option value="256">256 bytes</option>
            <option value="1024" selected>1 KB</option>
            <option value="4096">4 KB</option>
          </select>
        </div>
        <label class="check-control">
          <input id="data-url-base64-whitespace" type="checkbox" checked />
          <span>Allow base64 whitespace</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed data URL</div>
        <div id="data-url-summary" class="table-output compact-table-output"></div>
        <div id="data-url-diagnostics" class="table-output compact-table-output"></div>
        <pre id="data-url-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'hex-color-token-kit') {
    return renderPreviewDemoShell(
      'CSS input',
      'hex-color-input',
      colorCssSample,
      'Extracted tokens',
      'hex-color-output',
      `<label class="check-control">
        <input id="hex-color-invalid" type="checkbox" checked />
        <span>Include invalid candidates</span>
      </label>`
    );
  }

  if (slug === 'human-duration-parse-kit') {
    return `
      <div class="panel input-panel">
        <label for="duration-input">Duration input</label>
        <input id="duration-input" value="2 weeks, 3 days and 45 minutes" />
        <label class="check-control">
          <input id="duration-calendar" type="checkbox" />
          <span>Allow month/year approximations</span>
        </label>
        <label class="check-control">
          <input id="duration-negative" type="checkbox" checked />
          <span>Allow negative terms</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed duration</div>
        <div id="duration-summary" class="table-output compact-table-output"></div>
        <pre id="duration-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'import-specifier-scan-kit') {
    return renderPreviewDemoShell(
      'JavaScript source',
      'import-scan-input',
      importSourceSample,
      'Detected specifiers',
      'import-scan-output',
      `<label class="check-control">
        <input id="import-scan-node" type="checkbox" />
        <span>Include Node builtins in package list</span>
      </label>`
    );
  }

  if (slug === 'localized-price-parse-kit') {
    return `
      <div class="panel input-panel">
        <label for="price-input">Price input</label>
        <input id="price-input" value="CHF 1’234.50" />
        <div class="control-row">
          <label for="price-decimal">Decimal separator</label>
          <select id="price-decimal">
            <option value="auto" selected>auto</option>
            <option value=".">dot</option>
            <option value=",">comma</option>
          </select>
        </div>
        <label class="check-control">
          <input id="price-negative" type="checkbox" checked />
          <span>Allow negative values</span>
        </label>
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed price</div>
        <pre id="price-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'css-font-shorthand-kit') {
    return `
      <div class="panel input-panel">
        <label for="font-input">CSS font shorthand</label>
        <input id="font-input" value='italic 700 1rem/1.4 "Inter", system-ui' />
        <label for="font-family-input">Font-family list</label>
        <input id="font-family-input" value='"Inter", system-ui, sans-serif' />
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Parsed font</div>
        <pre id="font-output" class="code-output"></pre>
      </div>
    `;
  }

  if (slug === 'jmx-k6-migration-kit') {
    return renderPreviewDemoShell(
      'JMeter JMX input',
      'jmx-input',
      jmxSample,
      'Migration output',
      'jmx-output',
      `<div class="control-row">
        <label for="jmx-output-mode">Output</label>
        <select id="jmx-output-mode">
          <option value="summary" selected>summary</option>
          <option value="script">k6 script</option>
          <option value="report">Markdown report</option>
        </select>
      </div>`
    );
  }

  if (slug === 'proto-form-kit') {
    return renderPreviewDemoShell(
      'Protocol Buffer source',
      'proto-input',
      protoSample,
      'Form metadata',
      'proto-output',
      `<div class="control-row">
        <label for="proto-method">Method</label>
        <input id="proto-method" value="ProductCatalog.ListProducts" />
      </div>`
    );
  }

  return `
    <div class="panel input-panel">
      <label for="terminal-table-input">Terminal output</label>
      <textarea id="terminal-table-input" spellcheck="false">${terminalSample}</textarea>
      <div class="control-row">
        <label for="terminal-table-max-rows">Max rows</label>
        <select id="terminal-table-max-rows">
          <option value="0">all rows</option>
          <option value="1">1 row</option>
          <option value="2" selected>2 rows</option>
        </select>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed rows</div>
      <div id="terminal-table-output" class="table-output"></div>
    </div>
  `;
}

function renderPreviewDemoShell(
  inputLabel: string,
  inputId: string,
  inputValue: string,
  outputTitle: string,
  outputId: string,
  controls = ''
): string {
  return `
    <div class="panel input-panel">
      <div class="preview-note">Interactive preview · lazy-loaded from local GitHub-ready source</div>
      <label for="${inputId}">${inputLabel}</label>
      <textarea id="${inputId}" spellcheck="false">${escapeHtml(inputValue)}</textarea>
      ${controls}
    </div>
    <div class="panel output-panel">
      <div class="panel-title">${outputTitle}</div>
      <pre id="${outputId}" class="code-output">Loading preview module...</pre>
    </div>
  `;
}

function bindNavigation(root: HTMLElement): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const url = new URL(link.href);

      if (url.origin === window.location.origin) {
        event.preventDefault();
        navigate(url.pathname);
      }
    });
  });
}

function bindDemo(slug: LibrarySlug): void {
  if (slug === 'json-html-kit') {
    bindJsonHtmlDemo();
  } else if (slug === 'array-table-kit') {
    bindArrayTableDemo();
  } else if (slug === 'json-csv-kit') {
    bindJsonCsvDemo();
  } else if (slug === 'object-path-kit') {
    bindObjectPathDemo();
  } else if (slug === 'object-key-paths') {
    bindObjectKeyDemo();
  } else if (slug === 'terminal-table-kit') {
    bindTerminalTableDemo();
  } else if (slug === 'text-similarity-kit') {
    bindTextSimilarityDemo();
  } else if (slug === 'frontmatter-kit') {
    bindFrontmatterDemo();
  } else if (slug === 'data-url-kit') {
    bindDataUrlDemo();
  } else if (slug === 'hex-color-token-kit') {
    void bindHexColorDemo();
  } else if (slug === 'human-duration-parse-kit') {
    void bindHumanDurationDemo();
  } else if (slug === 'import-specifier-scan-kit') {
    void bindImportSpecifierDemo();
  } else if (slug === 'localized-price-parse-kit') {
    void bindLocalizedPriceDemo();
  } else if (slug === 'css-font-shorthand-kit') {
    void bindCssFontDemo();
  } else if (slug === 'jmx-k6-migration-kit') {
    void bindJmxK6Demo();
  } else if (slug === 'proto-form-kit') {
    void bindProtoFormDemo();
  } else {
    bindSvgAstDemo();
  }
}

function bindJsonHtmlDemo(): void {
  const input = byId<HTMLTextAreaElement>('json-html-input');
  const theme = byId<HTMLSelectElement>('json-html-theme');
  const collapseDepth = byId<HTMLInputElement>('json-html-collapse');
  const collapseDepthValue = byId<HTMLOutputElement>('json-html-collapse-value');
  const output = byId<HTMLDivElement>('json-html-output');
  const pageTheme = byId<HTMLSelectElement>('json-html-page-theme');
  const pageSize = byId<HTMLSelectElement>('json-html-page-size');
  const pageOutput = byId<HTMLDivElement>('json-html-pagination-output');
  const pageInfo = byId<HTMLDivElement>('json-html-page-info');
  let viewer: JsonHtmlViewer | undefined;

  const updatePageInfo = (): void => {
    if (!viewer) {
      pageInfo.textContent = '';
      return;
    }

    const info = viewer.getPageInfo();
    const firstVisible = info.totalItems === 0 ? 0 : info.startIndex + 1;
    pageInfo.textContent = `${info.totalItems} rows · page ${info.page + 1}/${info.pageCount} · showing ${firstVisible}-${info.endIndex}`;
  };

  const update = (): void => {
    const value = parseJson(input.value);
    const depth = Number(collapseDepth.value);
    collapseDepthValue.value = String(depth);
    collapseDepthValue.textContent = String(depth);

    output.innerHTML = value.ok
      ? `${getThemeStyleTag(theme.value as JsonHtmlThemeName)}${renderJsonToHtml(value.data, {
          theme: theme.value as JsonHtmlThemeName,
          tableMode: 'auto',
          collapseDepth: depth
        })}`
      : renderError(value.message);
  };

  const updateViewer = (): void => {
    viewer?.destroy();
    viewer = createJsonHtmlViewer(pageOutput, largeRowsSample, {
      theme: pageTheme.value as JsonHtmlThemeName,
      pageSize: Number(pageSize.value),
      tableMode: 'auto',
      collapseDepth: 1
    });
    updatePageInfo();
  };

  document.querySelectorAll<HTMLButtonElement>('[data-json-html-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.jsonHtmlTab;
      const rendererPanel = byId<HTMLDivElement>('json-html-renderer-panel');
      const paginationPanel = byId<HTMLDivElement>('json-html-pagination-panel');

      document.querySelectorAll<HTMLButtonElement>('[data-json-html-tab]').forEach((button) => {
        const isActive = button.dataset.jsonHtmlTab === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });

      rendererPanel.hidden = mode !== 'renderer';
      paginationPanel.hidden = mode !== 'pagination';
    });
  });

  input.addEventListener('input', update);
  theme.addEventListener('change', update);
  collapseDepth.addEventListener('input', update);
  pageTheme.addEventListener('change', updateViewer);
  pageSize.addEventListener('change', updateViewer);
  pageOutput.addEventListener('click', () => window.requestAnimationFrame(updatePageInfo));
  update();
  updateViewer();
}

function bindArrayTableDemo(): void {
  const input = byId<HTMLTextAreaElement>('array-table-input');
  const format = byId<HTMLSelectElement>('array-table-format');
  const output = byId<HTMLElement>('array-table-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok || !Array.isArray(value.data)) {
      output.textContent = value.ok ? 'Expected an array of records.' : value.message;
      return;
    }

    output.textContent =
      format.value === 'html'
        ? arrayToHtmlTable(value.data as Array<Record<string, unknown>>)
        : arrayToMarkdownTable(value.data as Array<Record<string, unknown>>);
  };

  input.addEventListener('input', update);
  format.addEventListener('change', update);
  update();
}

function bindJsonCsvDemo(): void {
  const input = byId<HTMLTextAreaElement>('json-csv-input');
  const delimiter = byId<HTMLSelectElement>('json-csv-delimiter');
  const bom = byId<HTMLInputElement>('json-csv-bom');
  const output = byId<HTMLElement>('json-csv-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok || !Array.isArray(value.data)) {
      output.textContent = value.ok ? 'Expected an array of records.' : value.message;
      return;
    }

    output.textContent = jsonToCsv(value.data as Array<Record<string, unknown>>, {
      delimiter: delimiter.value,
      bom: bom.checked
    });
  };

  input.addEventListener('input', update);
  delimiter.addEventListener('change', update);
  bom.addEventListener('change', update);
  update();
}

function bindObjectPathDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-path-input');
  const path = byId<HTMLInputElement>('object-path-query');
  const deleteMode = byId<HTMLInputElement>('object-path-delete');
  const output = byId<HTMLElement>('object-path-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.textContent = value.message;
      return;
    }

    try {
      const nextValue = deleteMode.checked
        ? deletePathImmutable(value.data, path.value)
        : undefined;

      output.textContent = JSON.stringify(
        {
          normalized: normalizePath(path.value),
          segments: parsePath(path.value),
          value: getPath(value.data, path.value, null),
          ...(deleteMode.checked ? { afterDelete: nextValue } : {})
        },
        null,
        2
      );
    } catch (error) {
      output.textContent = error instanceof Error ? error.message : 'Unknown path error.';
    }
  };

  input.addEventListener('input', update);
  path.addEventListener('input', update);
  deleteMode.addEventListener('change', update);
  update();
}

function bindObjectKeyDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-key-input');
  const style = byId<HTMLSelectElement>('object-key-style');
  const limit = byId<HTMLSelectElement>('object-key-limit');
  const output = byId<HTMLDivElement>('object-key-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.innerHTML = renderError(value.message);
      return;
    }

    const entries = getPathEntries(value.data, {
      pathStyle: style.value as 'dot' | 'bracket',
      includeIntermediate: true,
      limit: limit.value === '0' ? Number.POSITIVE_INFINITY : Number(limit.value)
    }).map((entry) => ({
      path: entry.path,
      depth: entry.depth,
      leaf: entry.isLeaf
    }));

    output.innerHTML = arrayToHtmlTable(entries, {
      columns: ['path', 'depth', 'leaf']
    });
  };

  input.addEventListener('input', update);
  style.addEventListener('change', update);
  limit.addEventListener('change', update);
  update();
}

function bindTerminalTableDemo(): void {
  const input = byId<HTMLTextAreaElement>('terminal-table-input');
  const maxRows = byId<HTMLSelectElement>('terminal-table-max-rows');
  const output = byId<HTMLDivElement>('terminal-table-output');

  const update = (): void => {
    try {
      output.innerHTML = arrayToHtmlTable(parseTerminalTable(input.value, {
        keyStyle: 'camel',
        maxRows: maxRows.value === '0' ? Number.POSITIVE_INFINITY : Number(maxRows.value)
      }));
    } catch (error) {
      output.innerHTML = renderError(error instanceof Error ? error.message : 'Unable to parse table.');
    }
  };

  input.addEventListener('input', update);
  maxRows.addEventListener('change', update);
  update();
}

function bindTextSimilarityDemo(): void {
  const query = byId<HTMLInputElement>('text-similarity-query');
  const candidates = byId<HTMLTextAreaElement>('text-similarity-candidates');
  const algorithm = byId<HTMLSelectElement>('text-similarity-algorithm');
  const threshold = byId<HTMLInputElement>('text-similarity-threshold');
  const thresholdValue = byId<HTMLOutputElement>('text-similarity-threshold-value');
  const limit = byId<HTMLSelectElement>('text-similarity-limit');
  const stripDiacritics = byId<HTMLInputElement>('text-similarity-diacritics');
  const score = byId<HTMLDivElement>('text-similarity-score');
  const output = byId<HTMLDivElement>('text-similarity-output');

  const update = (): void => {
    const candidateList = candidates.value
      .split('\n')
      .map((candidate) => candidate.trim())
      .filter(Boolean);
    const selectedAlgorithm = algorithm.value as SimilarityAlgorithm;
    const thresholdNumber = Number(threshold.value);
    const limitNumber = Number(limit.value);

    thresholdValue.value = threshold.value;
    thresholdValue.textContent = thresholdNumber.toFixed(2);

    const rankOptions = {
      algorithm: selectedAlgorithm,
      threshold: thresholdNumber,
      stripDiacritics: stripDiacritics.checked
    };

    const matches = rankMatches(query.value, candidateList, limitNumber === 0
      ? rankOptions
      : { ...rankOptions, limit: limitNumber }).map((match) => ({
      candidate: match.candidate,
      rating: match.rating.toFixed(3),
      index: match.index
    }));

    const selfScore = compareStrings(query.value, candidateList[0] ?? '', {
      algorithm: selectedAlgorithm,
      stripDiacritics: stripDiacritics.checked
    });
    const passesThreshold = isSimilar(query.value, candidateList[0] ?? '', {
      algorithm: selectedAlgorithm,
      stripDiacritics: stripDiacritics.checked,
      threshold: thresholdNumber
    });

    score.textContent = `${candidateList.length} candidates · query vs first candidate: ${selfScore.toFixed(3)} · threshold pass: ${passesThreshold ? 'yes' : 'no'}`;
    output.innerHTML = matches.length > 0
      ? arrayToHtmlTable(matches, { columns: ['candidate', 'rating', 'index'] })
      : renderError('No match above the current threshold.');
  };

  query.addEventListener('input', update);
  candidates.addEventListener('input', update);
  algorithm.addEventListener('change', update);
  threshold.addEventListener('input', update);
  limit.addEventListener('change', update);
  stripDiacritics.addEventListener('change', update);
  update();
}

function bindSvgAstDemo(): void {
  const input = byId<HTMLTextAreaElement>('svg-ast-input');
  const find = byId<HTMLSelectElement>('svg-ast-find');
  const keepComments = byId<HTMLInputElement>('svg-ast-comments');
  const includePositions = byId<HTMLInputElement>('svg-ast-positions');
  const summary = byId<HTMLDivElement>('svg-ast-summary');
  const output = byId<HTMLElement>('svg-ast-output');

  const update = (): void => {
    const options = {
      includeComments: keepComments.checked,
      includePositions: includePositions.checked
    };
    const result = tryParseSvg(input.value, options);

    if (!result.ok) {
      summary.innerHTML = '';
      output.innerHTML = renderError(result.error.message);
      return;
    }

    const stats = getSvgStats(result.root);
    const found = find.value === '*'
      ? findSvgElements(result.root, () => true)
      : findSvgElements(result.root, find.value);
    const elementNames = getSvgElementNames(result.root, { unique: true }).join(', ');

    summary.innerHTML = arrayToHtmlTable(summaryRows(stats, found.length, elementNames), {
      columns: ['metric', 'value']
    });
    output.textContent = svgToJson(input.value, options, 2);
  };

  input.addEventListener('input', update);
  find.addEventListener('change', update);
  keepComments.addEventListener('change', update);
  includePositions.addEventListener('change', update);
  update();
}

function bindFrontmatterDemo(): void {
  const input = byId<HTMLTextAreaElement>('frontmatter-input');
  const language = byId<HTMLSelectElement>('frontmatter-language');
  const stringifyLanguage = byId<HTMLSelectElement>('frontmatter-stringify');
  const excerpt = byId<HTMLInputElement>('frontmatter-excerpt');
  const summary = byId<HTMLDivElement>('frontmatter-summary');
  const output = byId<HTMLDivElement>('frontmatter-output');

  const update = (): void => {
    const parseLanguage = language.value === 'auto' ? undefined : (language.value as FrontmatterLanguage);
    const parsed = tryParseFrontmatter(input.value, {
      ...(parseLanguage ? { language: parseLanguage } : {}),
      excerptSeparator: excerpt.checked ? '<!-- more -->' : false
    });

    if (!parsed.ok) {
      summary.innerHTML = '';
      output.innerHTML = renderError(parsed.error.message);
      return;
    }

    const result = parsed.result;
    const outputLanguage = stringifyLanguage.value as FrontmatterLanguage;
    const stringified = stringifyFrontmatter(result.attributes, result.body, {
      language: outputLanguage,
      delimiter: outputLanguage === 'toml' ? '+++' : '---'
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'startsWithFrontmatter', value: String(hasFrontmatter(input.value)) },
        { metric: 'completeBlock', value: String(result.hasFrontmatter) },
        { metric: 'language', value: result.language ?? 'none' },
        { metric: 'attributes', value: Object.keys(result.attributes).length },
        { metric: 'diagnostics', value: result.diagnostics.length },
        { metric: 'excerpt', value: result.excerpt ? 'yes' : 'none' },
        { metric: 'strippedBodyLength', value: stripFrontmatter(input.value, { ...(parseLanguage ? { language: parseLanguage } : {}) }).length }
      ],
      { columns: ['metric', 'value'] }
    );

    output.innerHTML = `
      <section>
        <h2>Attributes</h2>
        <pre class="code-output small-code">${escapeHtml(JSON.stringify(result.attributes, null, 2))}</pre>
      </section>
      <section>
        <h2>Diagnostics</h2>
        ${
          result.diagnostics.length > 0
            ? arrayToHtmlTable(
                result.diagnostics.map((diagnostic) => ({
                  severity: diagnostic.severity,
                  code: diagnostic.code,
                  range: diagnostic.range ? formatRange(diagnostic.range) : '-',
                  message: diagnostic.message
                })),
                { columns: ['severity', 'code', 'range', 'message'] }
              )
            : '<p class="empty-state">No diagnostics.</p>'
        }
      </section>
      <section>
        <h2>Ranges</h2>
        ${arrayToHtmlTable(
          Object.entries(result.ranges).map(([name, range]) => ({
            name,
            range: formatRange(range),
            offsets: `${range.start.offset}-${range.end.offset}`
          })),
          { columns: ['name', 'range', 'offsets'] }
        )}
      </section>
      <section>
        <h2>Stringified document</h2>
        <pre class="code-output small-code">${escapeHtml(stringified)}</pre>
      </section>
    `;
  };

  input.addEventListener('input', update);
  language.addEventListener('change', update);
  stringifyLanguage.addEventListener('change', update);
  excerpt.addEventListener('change', update);
  update();
}

function bindDataUrlDemo(): void {
  const input = byId<HTMLTextAreaElement>('data-url-input');
  const maxBytes = byId<HTMLSelectElement>('data-url-max-bytes');
  const allowWhitespace = byId<HTMLInputElement>('data-url-base64-whitespace');
  const summary = byId<HTMLDivElement>('data-url-summary');
  const diagnostics = byId<HTMLDivElement>('data-url-diagnostics');
  const output = byId<HTMLElement>('data-url-output');

  const update = (): void => {
    const options = {
      ...(maxBytes.value === '0' ? {} : { maxBytes: Number(maxBytes.value) }),
      allowBase64Whitespace: allowWhitespace.checked
    };
    const result = parseDataUrl(input.value, options);
    const diagnosticRows = result.diagnostics.map((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      index: diagnostic.index ?? '-',
      message: diagnostic.message
    }));

    diagnostics.innerHTML =
      diagnosticRows.length > 0
        ? arrayToHtmlTable(diagnosticRows, { columns: ['severity', 'code', 'index', 'message'] })
        : '<p class="empty-state">No diagnostics.</p>';

    if (!result.ok) {
      summary.innerHTML = renderError('Unable to parse this data URL.');
      output.textContent = JSON.stringify({ ok: false }, null, 2);
      return;
    }

    const textPreview = result.value.text === undefined
      ? 'binary or invalid UTF-8'
      : result.value.text.slice(0, 120);

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'mediaType', value: getDataUrlMediaType(input.value, options) ?? 'unknown' },
        { metric: 'base64', value: String(isBase64DataUrl(input.value, options)) },
        { metric: 'bytes', value: result.value.byteLength },
        { metric: 'parameters', value: result.value.parameterList.length },
        { metric: 'textPreview', value: textPreview }
      ],
      { columns: ['metric', 'value'] }
    );

    output.textContent = JSON.stringify(
      {
        mediaType: result.value.mediaType,
        type: result.value.type,
        subtype: result.value.subtype,
        parameters: result.value.parameters,
        isBase64: result.value.isBase64,
        byteLength: result.value.byteLength,
        text: result.value.text
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  maxBytes.addEventListener('change', update);
  allowWhitespace.addEventListener('change', update);
  update();
}

async function bindHexColorDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('hex-color-input');
  const includeInvalid = byId<HTMLInputElement>('hex-color-invalid');
  const output = byId<HTMLElement>('hex-color-output');
  const { extractHexColorTokens } = await import('../../hex-color-token-kit/src/index.ts');

  const update = (): void => {
    const result = extractHexColorTokens(input.value, { includeInvalid: includeInvalid.checked });
    output.textContent = JSON.stringify(
      {
        valid: result.valid.map((token) => ({
          input: token.input,
          normalized: token.normalized,
          channels: token.channels,
          span: `${token.start}-${token.end}`
        })),
        invalid: result.invalid.map((token) => ({
          input: token.input,
          issues: token.issues.map((issue) => issue.code),
          span: `${token.start}-${token.end}`
        })),
        issues: result.issues
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  includeInvalid.addEventListener('change', update);
  update();
}

async function bindHumanDurationDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('duration-input');
  const allowCalendarUnits = byId<HTMLInputElement>('duration-calendar');
  const allowNegative = byId<HTMLInputElement>('duration-negative');
  const summary = byId<HTMLDivElement>('duration-summary');
  const output = byId<HTMLElement>('duration-output');
  const { humanDurationMilliseconds, parseHumanDuration } = await import('../../human-duration-parse-kit/src/index.ts');

  const update = (): void => {
    const options = {
      allowCalendarUnits: allowCalendarUnits.checked,
      allowNegative: allowNegative.checked
    };
    const result = parseHumanDuration(input.value, options);
    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'valid', value: String(result.ok) },
        { metric: 'milliseconds', value: humanDurationMilliseconds(input.value, options) ?? '-' },
        { metric: 'tokens', value: result.tokens.length },
        { metric: 'issues', value: result.issues.length }
      ],
      { columns: ['metric', 'value'] }
    );
    output.textContent = JSON.stringify(result, null, 2);
  };

  input.addEventListener('input', update);
  allowCalendarUnits.addEventListener('change', update);
  allowNegative.addEventListener('change', update);
  update();
}

async function bindImportSpecifierDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('import-scan-input');
  const includeNodeBuiltins = byId<HTMLInputElement>('import-scan-node');
  const output = byId<HTMLElement>('import-scan-output');
  const { listPackageSpecifiers, scanImportSpecifiers } = await import('../../import-specifier-scan-kit/src/index.ts');

  const update = (): void => {
    const result = scanImportSpecifiers(input.value);
    output.textContent = JSON.stringify(
      {
        packageNames: listPackageSpecifiers(input.value, {
          includeNodeBuiltins: includeNodeBuiltins.checked
        }),
        specifiers: result.specifiers.map((match) => ({
          kind: match.kind,
          specifier: match.specifier,
          span: `${match.specifierStart}-${match.specifierEnd}`
        })),
        issues: result.issues
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  includeNodeBuiltins.addEventListener('change', update);
  update();
}

async function bindLocalizedPriceDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('price-input');
  const decimal = byId<HTMLSelectElement>('price-decimal');
  const allowNegative = byId<HTMLInputElement>('price-negative');
  const output = byId<HTMLElement>('price-output');
  const { parseLocalizedPrice } = await import('../../localized-price-parse-kit/src/index.ts');

  const update = (): void => {
    output.textContent = JSON.stringify(
      parseLocalizedPrice(input.value, {
        decimalSeparator: decimal.value as '.' | ',' | 'auto',
        allowNegative: allowNegative.checked
      }),
      null,
      2
    );
  };

  input.addEventListener('input', update);
  decimal.addEventListener('change', update);
  allowNegative.addEventListener('change', update);
  update();
}

async function bindCssFontDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('font-input');
  const familyInput = byId<HTMLInputElement>('font-family-input');
  const output = byId<HTMLElement>('font-output');
  const { formatFontShorthand, parseFontFamilyList, parseFontShorthand } = await import('../../css-font-shorthand-kit/src/index.ts');

  const update = (): void => {
    const parsed = parseFontShorthand(input.value);
    output.textContent = JSON.stringify(
      {
        shorthand: parsed,
        formatted: parsed.ok ? formatFontShorthand(parsed.value) : null,
        families: parseFontFamilyList(familyInput.value)
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  familyInput.addEventListener('input', update);
  update();
}

async function bindJmxK6Demo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('jmx-input');
  const mode = byId<HTMLSelectElement>('jmx-output-mode');
  const output = byId<HTMLElement>('jmx-output');
  const { formatMigrationReport, migrateJmxToK6 } = await import('../../jmx-k6-migration-kit/src/index.ts');

  const update = (): void => {
    const result = migrateJmxToK6(input.value, {
      sourceName: 'preview.jmx',
      baseUrl: 'https://api.example.com'
    });

    if (mode.value === 'script') {
      output.textContent = result.k6.ok ? result.k6.script : JSON.stringify(result.k6.findings, null, 2);
      return;
    }

    if (mode.value === 'report') {
      output.textContent = formatMigrationReport({ analysis: result.analysis, k6: result.k6 });
      return;
    }

    output.textContent = JSON.stringify(
      {
        summary: result.analysis.summary,
        findings: result.analysis.findings,
        httpRequests: result.analysis.httpRequests.map((request) => ({
          name: request.name,
          method: request.method,
          url: `${request.protocol ?? 'https'}://${request.domain ?? 'example.com'}${request.path}`,
          checks: request.checks.length,
          notes: request.migrationNotes.length
        }))
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  mode.addEventListener('change', update);
  update();
}

async function bindProtoFormDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('proto-input');
  const methodInput = byId<HTMLInputElement>('proto-method');
  const output = byId<HTMLElement>('proto-output');
  const { createProtoMethodExample, parseProtoFormSchema } = await import('../../proto-form-kit/src/index.ts');

  const update = (): void => {
    const schema = parseProtoFormSchema(input.value);
    const [serviceName = '', methodName = ''] = methodInput.value.split('.');
    const methodExample = serviceName && methodName
      ? createProtoMethodExample(schema, serviceName, methodName)
      : null;

    output.textContent = JSON.stringify(
      {
        ok: schema.ok,
        packageName: schema.packageName,
        messages: schema.messages.map((message) => ({
          name: message.fullName,
          fields: message.fields.map((field) => ({
            name: field.name,
            jsonName: field.jsonName,
            type: field.type,
            control: field.control,
            enumValues: field.enumValues
          }))
        })),
        services: schema.services,
        methodExample,
        diagnostics: schema.diagnostics
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  methodInput.addEventListener('input', update);
  update();
}

function formatRange(range: FrontmatterRange): string {
  return `${range.start.line}:${range.start.column} -> ${range.end.line}:${range.end.column}`;
}

function summaryRows(stats: SvgStats, foundCount: number, elementNames: string): Array<{ metric: string; value: string | number }> {
  const topElements = Object.entries(stats.elementsByName)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 4)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ');

  return [
    { metric: 'elements', value: stats.elements },
    { metric: 'attributes', value: stats.attributes },
    { metric: 'maxDepth', value: stats.maxDepth },
    { metric: 'matched', value: foundCount },
    { metric: 'uniqueNames', value: elementNames || 'none' },
    { metric: 'topElements', value: topElements || 'none' }
  ];
}

function byId<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element #${id}`);
  }

  return element as TElement;
}

function parseJson(value: string): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Invalid JSON.'
    };
  }
}

function renderError(message: string): string {
  return `<div class="error-box">${escapeHtml(message)}</div>`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

window.addEventListener('popstate', render);
render();
