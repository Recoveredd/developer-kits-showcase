import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatNodeLockfileDoctorReport,
  inspectNodeLockfiles,
  type ProjectFiles
} from '../../../node-lockfile-doctor-kit/src/index';
import { byId, escapeHtml, parseJson, renderError } from '../shared';

const samplePackageJson = JSON.stringify(
  {
    name: 'demo-app',
    packageManager: 'pnpm@9.1.0',
    dependencies: { zod: '^3.0.0' },
    devDependencies: { vitest: '^1.6.0' },
    workspaces: ['packages/*']
  },
  null,
  2
);

const samplePnpmLock = `lockfileVersion: '9.0'

importers:
  .:
    dependencies:
      zod: {}
    devDependencies:
      vitest: {}
`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="lockfile-package-json">package.json</label>
      <textarea id="lockfile-package-json" spellcheck="false">${escapeHtml(samplePackageJson)}</textarea>
      <label for="lockfile-main">Lockfile text</label>
      <textarea id="lockfile-main" class="small-code" spellcheck="false">${escapeHtml(samplePnpmLock)}</textarea>
      <div class="control-grid">
        <div>
          <label for="lockfile-name">Lockfile name</label>
          <select id="lockfile-name">
            <option value="pnpm-lock.yaml">pnpm-lock.yaml</option>
            <option value="package-lock.json">package-lock.json</option>
            <option value="yarn.lock">yarn.lock</option>
            <option value="bun.lock">bun.lock</option>
          </select>
        </div>
        <div>
          <label for="lockfile-expected">Expected manager</label>
          <select id="lockfile-expected">
            <option value="">auto</option>
            <option value="npm">npm</option>
            <option value="pnpm">pnpm</option>
            <option value="yarn">yarn</option>
            <option value="bun">bun</option>
          </select>
        </div>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Lockfile diagnostics</div>
      <div id="lockfile-summary" class="table-output compact-table-output"></div>
      <div id="lockfile-diagnostics" class="table-output compact-table-output"></div>
      <pre id="lockfile-report" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const packageJsonInput = byId<HTMLTextAreaElement>('lockfile-package-json');
  const lockfileInput = byId<HTMLTextAreaElement>('lockfile-main');
  const lockfileName = byId<HTMLSelectElement>('lockfile-name');
  const expectedManager = byId<HTMLSelectElement>('lockfile-expected');
  const summary = byId<HTMLDivElement>('lockfile-summary');
  const diagnostics = byId<HTMLDivElement>('lockfile-diagnostics');
  const report = byId<HTMLElement>('lockfile-report');

  const update = (): void => {
    const packageJson = parseJson(packageJsonInput.value);
    if (!packageJson.ok) {
      summary.innerHTML = renderError(`package.json parse error: ${packageJson.message}`);
      diagnostics.innerHTML = '';
      report.textContent = '';
      return;
    }

    const files: ProjectFiles = {
      'package.json': JSON.stringify(packageJson.data),
      [lockfileName.value]: lockfileInput.value
    };
    const result = inspectNodeLockfiles(files, {
      expectedManager: expectedManager.value === '' ? undefined : (expectedManager.value as never)
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { field: 'ok', value: String(result.ok) },
        { field: 'manager', value: result.manager },
        { field: 'lockfiles', value: result.lockfiles.map((lockfile) => lockfile.name).join(', ') || '-' },
        { field: 'diagnostics', value: String(result.diagnostics.length) }
      ],
      { columns: ['field', 'value'] }
    );

    diagnostics.innerHTML =
      result.diagnostics.length > 0
        ? arrayToHtmlTable(
            result.diagnostics.map((item) => ({
              severity: item.severity,
              code: item.code,
              file: item.file ?? '-',
              message: item.message
            })),
            { columns: ['severity', 'code', 'file', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    report.textContent = formatNodeLockfileDoctorReport(result);
  };

  packageJsonInput.addEventListener('input', update);
  lockfileInput.addEventListener('input', update);
  lockfileName.addEventListener('change', update);
  expectedManager.addEventListener('change', update);
  update();
}
