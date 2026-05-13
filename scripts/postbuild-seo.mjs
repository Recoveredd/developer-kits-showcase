import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const siteUrl = 'https://packages.wasta-wocket.fr';
const siteName = 'Developer Kits';
const supportUrl = 'https://ko-fi.com/recovered';

const pages = [
  {
    path: '/',
    title: 'Developer Kits | TypeScript utilities for developer data',
    description:
      'Small TypeScript developer utilities for JSON, tables, paths, CSV exports, terminal output, text matching, SVG parsing, front matter and data URLs.',
    schemaType: 'CollectionPage'
  },
  {
    path: '/json-html-kit',
    title: 'json-html-kit demo | Developer Kits',
    description: 'Render JSON as safe, themed HTML that stays readable in docs, reports and support tools.',
    packageName: 'json-html-kit',
    version: '0.4.2',
    repository: 'https://github.com/Recoveredd/json-html-kit',
    npm: 'https://www.npmjs.com/package/json-html-kit'
  },
  {
    path: '/array-table-kit',
    title: 'array-table-kit demo | Developer Kits',
    description: 'Turn arrays of objects into Markdown or HTML tables with explicit columns and clean escaping.',
    packageName: 'array-table-kit',
    version: '0.2.3',
    repository: 'https://github.com/Recoveredd/array-table-kit',
    npm: 'https://www.npmjs.com/package/array-table-kit'
  },
  {
    path: '/json-csv-kit',
    title: 'json-csv-kit demo | Developer Kits',
    description: 'Convert JSON records to CSV with TypeScript-first options, safe escaping and nested data support.',
    packageName: 'json-csv-kit',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/json-csv-kit',
    npm: 'https://www.npmjs.com/package/json-csv-kit'
  },
  {
    path: '/object-path-kit',
    title: 'object-path-kit demo | Developer Kits',
    description: 'Parse, normalize and safely access JavaScript object paths, including bracket notation.',
    packageName: 'object-path-kit',
    version: '0.1.3',
    repository: 'https://github.com/Recoveredd/object-path-kit',
    npm: 'https://www.npmjs.com/package/object-path-kit'
  },
  {
    path: '/object-key-paths',
    title: 'object-key-paths demo | Developer Kits',
    description: 'List nested key paths from objects and arrays for schema inspection, mapping and docs.',
    packageName: 'object-key-paths',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/object-key-paths',
    npm: 'https://www.npmjs.com/package/object-key-paths'
  },
  {
    path: '/terminal-table-kit',
    title: 'terminal-table-kit demo | Developer Kits',
    description: 'Parse fixed-width terminal table output into typed rows for scripts, dashboards and docs.',
    packageName: 'terminal-table-kit',
    version: '0.1.2',
    repository: 'https://github.com/Recoveredd/terminal-table-kit',
    npm: 'https://www.npmjs.com/package/terminal-table-kit'
  },
  {
    path: '/text-similarity-kit',
    title: 'text-similarity-kit demo | Developer Kits',
    description: 'Compare and rank short strings with TypeScript-first fuzzy matching helpers.',
    packageName: 'text-similarity-kit',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/text-similarity-kit',
    npm: 'https://www.npmjs.com/package/text-similarity-kit'
  },
  {
    path: '/svg-ast-kit',
    title: 'svg-ast-kit demo | Developer Kits',
    description: 'Parse SVG markup into a typed JSON AST with traversal, lookup and stats helpers.',
    packageName: 'svg-ast-kit',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/svg-ast-kit',
    npm: 'https://www.npmjs.com/package/svg-ast-kit'
  },
  {
    path: '/frontmatter-kit',
    title: 'frontmatter-kit demo | Developer Kits',
    description: 'Parse and inspect front matter with typed metadata, body ranges and readable diagnostics.',
    packageName: 'frontmatter-kit',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/frontmatter-kit',
    npm: 'https://www.npmjs.com/package/frontmatter-kit'
  },
  {
    path: '/data-url-kit',
    title: 'data-url-kit demo | Developer Kits',
    description: 'Parse, validate and inspect data URLs with typed diagnostics, byte metadata and decoded output.',
    packageName: 'data-url-kit',
    version: '0.1.1',
    repository: 'https://github.com/Recoveredd/data-url-kit',
    npm: 'https://www.npmjs.com/package/data-url-kit'
  },
  {
    path: '/hex-color-token-kit',
    title: 'hex-color-token-kit preview | Developer Kits',
    description: 'Extract and validate CSS hex color tokens with spans, normalized values and readable diagnostics.',
    packageName: 'hex-color-token-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/hex-color-token-kit'
  },
  {
    path: '/human-duration-parse-kit',
    title: 'human-duration-parse-kit preview | Developer Kits',
    description: 'Parse compact human duration strings into milliseconds with structured tokens and diagnostics.',
    packageName: 'human-duration-parse-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/human-duration-parse-kit'
  },
  {
    path: '/import-specifier-scan-kit',
    title: 'import-specifier-scan-kit preview | Developer Kits',
    description: 'Scan JavaScript source text for import, export, dynamic import and require specifiers.',
    packageName: 'import-specifier-scan-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/import-specifier-scan-kit'
  },
  {
    path: '/localized-price-parse-kit',
    title: 'localized-price-parse-kit preview | Developer Kits',
    description: 'Parse localized price strings into decimal values, currency hints and separator metadata.',
    packageName: 'localized-price-parse-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/localized-price-parse-kit'
  },
  {
    path: '/css-font-shorthand-kit',
    title: 'css-font-shorthand-kit preview | Developer Kits',
    description: 'Parse and format CSS font shorthand values with structured diagnostics.',
    packageName: 'css-font-shorthand-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/css-font-shorthand-kit'
  },
  {
    path: '/jmx-k6-migration-kit',
    title: 'jmx-k6-migration-kit preview | Developer Kits',
    description: 'Audit JMeter JMX files and generate safe k6 migration scaffolds with explicit diagnostics.',
    packageName: 'jmx-k6-migration-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/jmx-k6-migration-kit'
  },
  {
    path: '/proto-form-kit',
    title: 'proto-form-kit preview | Developer Kits',
    description: 'Turn Protocol Buffer schemas into form-friendly metadata, method hints and JSON examples.',
    packageName: 'proto-form-kit',
    version: '0.1.0',
    repository: 'https://github.com/Recoveredd/proto-form-kit'
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
        sameAs: page.npm,
        programmingLanguage: 'TypeScript',
        runtimePlatform: ['Node.js', 'Web browser'],
        applicationCategory: 'DeveloperApplication',
        softwareVersion: page.version,
        license: 'https://www.mozilla.org/MPL/2.0/',
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
        sameAs: ['https://github.com/Recoveredd', 'https://www.npmjs.com/~recovered', supportUrl],
        hasPart: pages
          .filter((item) => item.packageName)
          .map((item) => ({
            '@type': 'SoftwareSourceCode',
            name: item.packageName,
            codeRepository: item.repository,
            sameAs: item.npm,
            programmingLanguage: 'TypeScript',
            runtimePlatform: ['Node.js', 'Web browser'],
            applicationCategory: 'DeveloperApplication',
            softwareVersion: item.version,
            license: 'https://www.mozilla.org/MPL/2.0/',
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
