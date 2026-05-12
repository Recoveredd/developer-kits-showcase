import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const siteUrl = 'https://packages.wasta-wocket.fr';
const siteName = 'Developer Kits';

const pages = [
  {
    path: '/',
    title: 'Developer Kits | TypeScript utilities for developer data',
    description:
      'Small TypeScript developer utilities for JSON, tables, paths, CSV exports and terminal output.',
    schemaType: 'CollectionPage'
  },
  {
    path: '/json-html-kit',
    title: 'json-html-kit demo | Developer Kits',
    description: 'Render JSON as safe, themed HTML that stays readable in docs, reports and support tools.',
    packageName: 'json-html-kit',
    repository: 'https://github.com/Recoveredd/json-html-kit'
  },
  {
    path: '/array-table-kit',
    title: 'array-table-kit demo | Developer Kits',
    description: 'Turn arrays of objects into Markdown or HTML tables with explicit columns and clean escaping.',
    packageName: 'array-table-kit',
    repository: 'https://github.com/Recoveredd/array-table-kit'
  },
  {
    path: '/json-csv-kit',
    title: 'json-csv-kit demo | Developer Kits',
    description: 'Convert JSON records to CSV with TypeScript-first options, safe escaping and nested data support.',
    packageName: 'json-csv-kit',
    repository: 'https://github.com/Recoveredd/json-csv-kit'
  },
  {
    path: '/object-path-kit',
    title: 'object-path-kit demo | Developer Kits',
    description: 'Parse, normalize and safely access JavaScript object paths, including bracket notation.',
    packageName: 'object-path-kit',
    repository: 'https://github.com/Recoveredd/object-path-kit'
  },
  {
    path: '/object-key-paths',
    title: 'object-key-paths demo | Developer Kits',
    description: 'List nested key paths from objects and arrays for schema inspection, mapping and docs.',
    packageName: 'object-key-paths',
    repository: 'https://github.com/Recoveredd/object-key-paths'
  },
  {
    path: '/terminal-table-kit',
    title: 'terminal-table-kit demo | Developer Kits',
    description: 'Parse fixed-width terminal table output into typed rows for scripts, dashboards and docs.',
    packageName: 'terminal-table-kit',
    repository: 'https://github.com/Recoveredd/terminal-table-kit'
  }
];

const html = await readFile(join(dist, 'index.html'), 'utf8');

for (const page of pages) {
  const url = `${siteUrl}${page.path === '/' ? '/' : `${page.path}/`}`;
  const output = withMetadata(html, page, url);
  const target = page.path === '/' ? join(dist, 'index.html') : join(dist, page.path.slice(1), 'index.html');

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output);
}

function withMetadata(source, page, url) {
  const schema = page.packageName
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: page.packageName,
        codeRepository: page.repository,
        programmingLanguage: 'TypeScript',
        url,
        description: page.description,
        isPartOf: {
          '@type': 'CollectionPage',
          name: siteName,
          url: siteUrl
        }
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: siteName,
        url,
        description: page.description,
        hasPart: pages
          .filter((item) => item.packageName)
          .map((item) => ({
            '@type': 'SoftwareSourceCode',
            name: item.packageName,
            codeRepository: item.repository,
            programmingLanguage: 'TypeScript',
            url: `${siteUrl}${item.path}/`,
            description: item.description
          }))
      };

  return source
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`
    )
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`
    )
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`
    )
    .replace(
      /<script type="application\/ld\+json" id="structured-data">[\s\S]*?<\/script>/,
      `<script type="application/ld+json" id="structured-data">${JSON.stringify(schema)}</script>`
    );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
