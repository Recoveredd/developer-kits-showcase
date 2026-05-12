import { arrayToHtmlTable, arrayToMarkdownTable } from 'array-table-kit';
import { jsonToCsv } from 'json-csv-kit';
import { createJsonHtmlViewer, getThemeStyleTag, renderJsonToHtml } from 'json-html-kit';
import type { JsonHtmlThemeName, JsonHtmlViewer } from 'json-html-kit';
import { getPath, normalizePath, parsePath } from 'object-path-kit';
import { getPathEntries } from 'object-key-paths';
import { parseTerminalTable } from 'terminal-table-kit';
import './styles.css';

type LibrarySlug =
  | 'json-html-kit'
  | 'array-table-kit'
  | 'json-csv-kit'
  | 'object-path-kit'
  | 'object-key-paths'
  | 'terminal-table-kit';

type LibraryMeta = {
  slug: LibrarySlug;
  name: string;
  summary: string;
  install: string;
  github: string;
  npm: string;
  demoLabel: string;
  accent: string;
};

type RouteMeta = {
  title: string;
  description: string;
  path: string;
};

const SITE_URL = 'https://packages.wasta-wocket.fr';
const SITE_NAME = 'Developer Kits';
const HOME_DESCRIPTION =
  'Small TypeScript developer utilities for JSON, tables, paths, CSV exports and terminal output.';

const libraries: LibraryMeta[] = [
  {
    slug: 'json-html-kit',
    name: 'json-html-kit',
    summary: 'Render JSON as safe, themed HTML that stays readable in docs, reports and support tools.',
    install: 'npm install json-html-kit',
    github: 'https://github.com/Recoveredd/json-html-kit',
    npm: 'https://www.npmjs.com/package/json-html-kit',
    demoLabel: 'JSON viewer',
    accent: '#3f6df6'
  },
  {
    slug: 'array-table-kit',
    name: 'array-table-kit',
    summary: 'Turn arrays of objects into Markdown or HTML tables with explicit columns and clean escaping.',
    install: 'npm install array-table-kit',
    github: 'https://github.com/Recoveredd/array-table-kit',
    npm: 'https://www.npmjs.com/package/array-table-kit',
    demoLabel: 'Markdown table',
    accent: '#0f9f7a'
  },
  {
    slug: 'json-csv-kit',
    name: 'json-csv-kit',
    summary: 'Convert JSON records to CSV with TypeScript-first options, safe escaping and nested data support.',
    install: 'npm install json-csv-kit',
    github: 'https://github.com/Recoveredd/json-csv-kit',
    npm: 'https://www.npmjs.com/package/json-csv-kit',
    demoLabel: 'CSV export',
    accent: '#d97706'
  },
  {
    slug: 'object-path-kit',
    name: 'object-path-kit',
    summary: 'Parse, normalize and safely access JavaScript object paths, including bracket notation.',
    install: 'npm install object-path-kit',
    github: 'https://github.com/Recoveredd/object-path-kit',
    npm: 'https://www.npmjs.com/package/object-path-kit',
    demoLabel: 'Path reader',
    accent: '#6d5dfc'
  },
  {
    slug: 'object-key-paths',
    name: 'object-key-paths',
    summary: 'List nested key paths from objects and arrays for schema inspection, mapping and docs.',
    install: 'npm install object-key-paths',
    github: 'https://github.com/Recoveredd/object-key-paths',
    npm: 'https://www.npmjs.com/package/object-key-paths',
    demoLabel: 'Path inventory',
    accent: '#0f8ea8'
  },
  {
    slug: 'terminal-table-kit',
    name: 'terminal-table-kit',
    summary: 'Parse fixed-width terminal table output into typed rows for scripts, dashboards and docs.',
    install: 'npm install terminal-table-kit',
    github: 'https://github.com/Recoveredd/terminal-table-kit',
    npm: 'https://www.npmjs.com/package/terminal-table-kit',
    demoLabel: 'Terminal parser',
    accent: '#1f7a4f'
  }
];

const demoTiles: Array<{ label: string; slug: LibrarySlug }> = [
  { label: 'HTML viewer', slug: 'json-html-kit' },
  { label: 'Markdown table', slug: 'array-table-kit' },
  { label: 'CSV export', slug: 'json-csv-kit' },
  { label: 'Object paths', slug: 'object-path-kit' },
  { label: 'Key inventory', slug: 'object-key-paths' },
  { label: 'Terminal rows', slug: 'terminal-table-kit' }
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
          hasPart: libraries.map((library) => ({
            '@type': 'SoftwareSourceCode',
            name: library.name,
            codeRepository: library.github,
            programmingLanguage: 'TypeScript',
            url: `${SITE_URL}/${library.slug}/`,
            description: library.summary
          }))
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: libraryBySlug(route).name,
          codeRepository: libraryBySlug(route).github,
          programmingLanguage: 'TypeScript',
          url,
          description: meta.description,
          isPartOf: {
            '@type': 'CollectionPage',
            name: SITE_NAME,
            url: SITE_URL
          }
        };

  element.textContent = JSON.stringify(data);
}

function renderShell(content: string): string {
  const navLinks = libraries
    .map(
      (library) =>
        `<a href="${libraryPath(library.slug)}" data-link class="nav-link">${library.name.replace('-kit', '')}</a>`
    )
    .join('');

  return `
    <header class="site-header">
      <a href="/" data-link class="brand" aria-label="Developer Kits home">
        <span class="brand-mark">dk</span>
        <span>Developer Kits</span>
      </a>
      <nav class="desktop-nav" aria-label="Library navigation">${navLinks}</nav>
      <a class="header-action" href="https://github.com/Recoveredd" target="_blank" rel="noreferrer">GitHub</a>
    </header>
    ${content}
    <footer class="site-footer">
      <span>Small TypeScript utilities for practical developer workflows.</span>
      <a href="https://github.com/Recoveredd" target="_blank" rel="noreferrer">Recoveredd on GitHub</a>
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
            Six small packages built around the same idea: take awkward developer data and turn it
            into something readable, exportable or easy to map.
          </p>
          <div class="hero-actions">
            <a href="/json-html-kit/" data-link class="primary-action">Explore the demos</a>
            <a href="https://www.npmjs.com/~recoveredd" target="_blank" rel="noreferrer" class="secondary-action">View npm packages</a>
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
        <a href="/" data-link class="back-link">All kits</a>
        <div class="library-heading">
          <div>
            <h1>${library.name}</h1>
            <p>${library.summary}</p>
          </div>
          <div class="install-box">
            <code>${library.install}</code>
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
  `);
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
      </div>
      <div class="panel output-panel">
        <div class="panel-title">Discovered paths</div>
        <div id="object-key-output" class="table-output"></div>
      </div>
    `;
  }

  return `
    <div class="panel input-panel">
      <label for="terminal-table-input">Terminal output</label>
      <textarea id="terminal-table-input" spellcheck="false">${terminalSample}</textarea>
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
  } else {
    bindTerminalTableDemo();
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
  let viewer: JsonHtmlViewer | undefined;

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
  const output = byId<HTMLElement>('json-csv-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok || !Array.isArray(value.data)) {
      output.textContent = value.ok ? 'Expected an array of records.' : value.message;
      return;
    }

    output.textContent = jsonToCsv(value.data as Array<Record<string, unknown>>, {
      delimiter: delimiter.value
    });
  };

  input.addEventListener('input', update);
  delimiter.addEventListener('change', update);
  update();
}

function bindObjectPathDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-path-input');
  const path = byId<HTMLInputElement>('object-path-query');
  const output = byId<HTMLElement>('object-path-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.textContent = value.message;
      return;
    }

    try {
      output.textContent = JSON.stringify(
        {
          normalized: normalizePath(path.value),
          segments: parsePath(path.value),
          value: getPath(value.data, path.value, null)
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
  update();
}

function bindObjectKeyDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-key-input');
  const style = byId<HTMLSelectElement>('object-key-style');
  const output = byId<HTMLDivElement>('object-key-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.innerHTML = renderError(value.message);
      return;
    }

    const entries = getPathEntries(value.data, {
      pathStyle: style.value as 'dot' | 'bracket',
      includeIntermediate: true
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
  update();
}

function bindTerminalTableDemo(): void {
  const input = byId<HTMLTextAreaElement>('terminal-table-input');
  const output = byId<HTMLDivElement>('terminal-table-output');

  const update = (): void => {
    try {
      output.innerHTML = arrayToHtmlTable(parseTerminalTable(input.value, { keyStyle: 'camel' }));
    } catch (error) {
      output.innerHTML = renderError(error instanceof Error ? error.message : 'Unable to parse table.');
    }
  };

  input.addEventListener('input', update);
  update();
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
