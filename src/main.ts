import { jsonToCsv } from 'json-csv-kit';
import {
  demoNavGroups,
  demoTiles,
  isPublished,
  libraries,
  libraryBySlug,
  libraryPath,
  routeMeta,
  SITE_NAME,
  SITE_URL,
  SUPPORT_URL
} from './catalog';
import { loadDemo } from './demos';
import { packageSignals } from './package-signals';
import { rowsSample } from './sample-data';
import { escapeHtml, formatDate, formatNumber, renderError } from './shared';
import type { LibraryMeta, LibrarySlug, RouteMeta } from './types';
import './styles.css';

let renderVersion = 0;

function routeFromLocation(): LibrarySlug | 'home' {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '') as LibrarySlug;
  return libraries.some((library) => library.slug === slug) ? slug : 'home';
}

function navigate(path: string): void {
  window.history.pushState({}, '', path);
  void render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function render(): Promise<void> {
  const version = ++renderVersion;
  const route = routeFromLocation();
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    return;
  }

  updateDocumentMetadata(route);

  if (route === 'home') {
    app.innerHTML = renderHome();
    bindNavigation(app);
    return;
  }

  const library = libraryBySlug(route);
  const demo = await loadDemo(route);

  if (version !== renderVersion) {
    return;
  }

  app.innerHTML = renderLibraryPage(library, demo.renderDemo());
  bindNavigation(app);
  await demo.bindDemo();
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
  const navGroups = demoNavGroups
    .map((group) => {
      const activeItem = group.items.find((item) => item.slug === activeSlug);
      const links = group.items
        .map((item) => {
          const isActive = item.slug === activeSlug;

          return `<a href="${libraryPath(item.slug)}" data-link class="demo-nav-link${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`;
        })
        .join('');

      return `
        <details class="demo-nav-group${activeItem ? ' is-active' : ''}">
          <summary>
            <span>${group.label}</span>
            ${activeItem ? `<small>${activeItem.label}</small>` : ''}
          </summary>
          <div class="demo-nav-menu" aria-label="${group.description}">
            ${links}
          </div>
        </details>
      `;
    })
    .join('');

  return `
    <header class="site-header">
      <a href="/" data-link class="brand" aria-label="Developer Kits home">
        <img class="brand-mark" src="/brand/developer-kits-logo-192.png" alt="" width="34" height="34" />
        <span>Developer Kits</span>
      </a>
      <nav class="demo-nav" aria-label="Demo navigation">${navGroups}</nav>
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
  const previewSection = previewCards
    ? `
      <section class="library-section preview-library-section" aria-label="GitHub preview demos">
        <div class="section-heading">
          <h2>GitHub previews</h2>
          <p>These libraries are ready on GitHub. Their demos run in the portfolio while npm publication waits.</p>
        </div>
        <div class="library-grid">${previewCards}</div>
      </section>
    `
    : '';

  return renderShell(`
    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <h1>Focused TypeScript utilities for JSON, tables and developer data.</h1>
          <p>
            Published npm packages and GitHub previews, built around the same idea: take awkward developer data
            and turn it into something readable, exportable or easy to map.
          </p>
          <div class="hero-status-strip" aria-label="Portfolio scope">
            <span>npm packages</span>
            <span>GitHub previews</span>
            <span>Interactive demos</span>
          </div>
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
            Published pages run the corresponding npm package directly in the browser. Preview pages stay clearly
            marked until their npm package is available.
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
      ${previewSection}
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

function renderLibraryPage(library: LibraryMeta, demoMarkup: string): string {
  const installContent = isPublished(library)
    ? `<code>${library.install}</code>`
    : `<div class="preview-status-box">
        <strong>GitHub preview</strong>
        <span>Source and demo are available; the npm package is not published yet.</span>
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
        ${demoMarkup}
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

function bindNavigation(root: HTMLElement): void {
  const navGroups = [...root.querySelectorAll<HTMLDetailsElement>('.demo-nav-group')];

  navGroups.forEach((group) => {
    group.addEventListener('toggle', () => {
      if (!group.open) return;

      navGroups.forEach((otherGroup) => {
        if (otherGroup !== group) {
          otherGroup.open = false;
        }
      });
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    navGroups.forEach((group) => {
      group.open = false;
    });
  });

  root.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.demo-nav-group')) return;

    navGroups.forEach((group) => {
      group.open = false;
    });
  });

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

window.addEventListener('popstate', () => {
  void render();
});

void render().catch((error) => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (app) {
    app.innerHTML = renderError(error instanceof Error ? error.message : 'Unable to render demo.');
  }
});
