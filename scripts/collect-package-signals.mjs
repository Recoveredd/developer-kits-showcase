import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const owner = 'Recoveredd';
const packages = [
  'json-html-kit',
  'array-table-kit',
  'json-csv-kit',
  'object-path-kit',
  'object-key-paths',
  'terminal-table-kit',
  'text-similarity-kit',
  'svg-ast-kit',
  'frontmatter-kit',
  'data-url-kit',
  'hex-color-token-kit',
  'human-duration-parse-kit',
  'import-specifier-scan-kit',
  'localized-price-parse-kit',
  'css-font-shorthand-kit',
  'jmx-k6-migration-kit',
  'proto-form-kit',
  'number-range-list-kit',
  'hex-grid-kit'
];

const generatedAt = new Date().toISOString();
const headers = {
  accept: 'application/json',
  'user-agent': 'developer-kits-showcase-signals'
};

const rows = await Promise.all(packages.map(collectPackageSignals));
const totals = rows.reduce(
  (accumulator, row) => ({
    downloadsLastWeek: accumulator.downloadsLastWeek + (row.downloadsLastWeek ?? 0),
    stars: accumulator.stars + (row.stars ?? 0),
    openIssues: accumulator.openIssues + (row.openIssues ?? 0)
  }),
  { downloadsLastWeek: 0, stars: 0, openIssues: 0 }
);

const snapshot = {
  generatedAt,
  totals,
  packages: rows
};

await mkdir(join(root, 'reports'), { recursive: true });
await writeFile(join(root, 'reports', 'package-signals.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(join(root, 'reports', 'package-signals.md'), renderMarkdown(snapshot));
await writeFile(join(root, 'src', 'package-signals.ts'), renderTypeScript(snapshot));

const failures = rows.flatMap((row) => row.errors.map((error) => `${row.name}: ${error}`));
console.log(`Collected signals for ${rows.length} packages.`);
console.log(`Last-week downloads: ${totals.downloadsLastWeek}`);
console.log(`GitHub stars: ${totals.stars}`);

if (failures.length > 0) {
  console.warn(`Warnings:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

async function collectPackageSignals(name) {
  const row = {
    name,
    npmUrl: `https://www.npmjs.com/package/${name}`,
    githubUrl: `https://github.com/${owner}/${name}`,
    downloadsLastWeek: null,
    stars: null,
    openIssues: null,
    latestVersion: null,
    pushedAt: null,
    errors: []
  };

  const [downloads, npmMetadata, githubMetadata] = await Promise.allSettled([
    getJson(`https://api.npmjs.org/downloads/point/last-week/${name}`),
    getJson(`https://registry.npmjs.org/${name}/latest`),
    getJson(`https://api.github.com/repos/${owner}/${name}`)
  ]);

  if (downloads.status === 'fulfilled') {
    row.downloadsLastWeek = numberOrNull(downloads.value.downloads);
  } else if (downloads.reason.status === 404) {
    row.downloadsLastWeek = 0;
  } else {
    row.errors.push(`npm downloads unavailable (${downloads.reason.message})`);
  }

  if (npmMetadata.status === 'fulfilled') {
    row.latestVersion = stringOrNull(npmMetadata.value.version);
  } else {
    row.errors.push(`npm metadata unavailable (${npmMetadata.reason.message})`);
  }

  if (githubMetadata.status === 'fulfilled') {
    row.stars = numberOrNull(githubMetadata.value.stargazers_count);
    row.openIssues = numberOrNull(githubMetadata.value.open_issues_count);
    row.pushedAt = stringOrNull(githubMetadata.value.pushed_at);
  } else {
    row.errors.push(`GitHub metadata unavailable (${githubMetadata.reason.message})`);
  }

  return row;
}

async function getJson(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringOrNull(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function renderMarkdown(snapshot) {
  const lines = [
    '# Developer Kits package signals',
    '',
    `Generated at: ${snapshot.generatedAt}`,
    '',
    `- Last-week npm downloads: ${snapshot.totals.downloadsLastWeek}`,
    `- GitHub stars: ${snapshot.totals.stars}`,
    `- Open GitHub issues: ${snapshot.totals.openIssues}`,
    '',
    '| Package | npm last week | Stars | Open issues | Latest | Last push |',
    '| --- | ---: | ---: | ---: | --- | --- |'
  ];

  for (const item of snapshot.packages) {
    lines.push(
      `| [${item.name}](${item.npmUrl}) | ${formatCell(item.downloadsLastWeek)} | ${formatCell(item.stars)} | ${formatCell(item.openIssues)} | ${formatCell(item.latestVersion)} | ${formatCell(item.pushedAt)} |`
    );
  }

  return `${lines.join('\n')}\n`;
}

function renderTypeScript(snapshot) {
  return `export const packageSignals = ${JSON.stringify(snapshot, null, 2)} as const;\n`;
}

function formatCell(value) {
  return value ?? 'n/a';
}
