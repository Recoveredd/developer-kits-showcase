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
  | 'data-url-kit';

type LibraryMeta = {
  slug: LibrarySlug;
  name: string;
  summary: string;
  install: string;
  version: string;
  github: string;
  npm: string;
  demoLabel: string;
  highlight: string;
  accent: string;
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
    title: `${library.name} demo | ${SITE_NAME}`,
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
          sameAs: ['https://github.com/Recoveredd', 'https://www.npmjs.com/~recoveredd', SUPPORT_URL],
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
        <a href="https://www.npmjs.com/~recoveredd" target="_blank" rel="noreferrer">npm</a>
        <a href="${SUPPORT_URL}" target="_blank" rel="noopener noreferrer" aria-label="Support Developer Kits on Ko-fi">Ko-fi</a>
      </div>
    </footer>
  `;
}

function renderHome(): string {
  const cards = libraries
    .map(
      (library) => `
        <article class="library-card" style="--accent: ${library.accent}">
          <div>
            <p class="card-label">${library.demoLabel}</p>
            <h3>${library.name}</h3>
            <p>${library.summary}</p>
            <div class="package-badges" aria-label="${library.name} package metadata">
              <span>v${library.version}</span>
              <span>MPL-2.0</span>
            </div>
            <p class="card-highlight">${library.highlight}</p>
          </div>
          <div class="card-actions">
            <a href="${libraryPath(library.slug)}" data-link>Open demo</a>
            <a href="${library.github}" target="_blank" rel="noreferrer">Source</a>
          </div>
        </article>
      `
    )
    .join('');

  return renderShell(`
    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <h1>Focused TypeScript utilities for JSON, tables and developer data.</h1>
          <p>
            Ten small packages built around the same idea: take awkward developer data and turn it
            into something readable, exportable or easy to map.
          </p>
          <div class="hero-actions">
            <a href="/json-html-kit/" data-link class="primary-action">Explore the demos</a>
            <a href="https://www.npmjs.com/~recoveredd" rel="noreferrer" class="secondary-action">View npm packages</a>
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
            Each package does one practical job without framework lock-in. The pages below are not
            marketing mockups: they run the actual published libraries in the browser.
          </p>
        </div>
        <div class="principle-list">
          <span>No runtime dependencies where possible</span>
          <span>TypeScript-first APIs</span>
          <span>Browser and Node friendly</span>
        </div>
      </section>
      <section class="library-grid" aria-label="Library demos">${cards}</section>
    </main>
  `);
}

function renderLibraryPage(library: LibraryMeta): string {
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
            <code>${library.install}</code>
            <div class="package-badges install-badges" aria-label="Package metadata">
              <span>v${library.version}</span>
              <span>MPL-2.0</span>
            </div>
            <div>
              <a href="${library.github}" target="_blank" rel="noreferrer">GitHub</a>
              <a href="${library.npm}" target="_blank" rel="noreferrer">npm</a>
            </div>
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
