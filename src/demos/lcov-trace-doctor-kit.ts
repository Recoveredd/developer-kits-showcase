import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatLcovDiagnostics,
  inspectLcovTrace
} from 'lcov-trace-doctor-kit';
import { byId, renderError } from '../shared';

const sampleTrace = [
  'TN:unit',
  'SF:.\\\\src\\\\math.ts',
  'FN:1,add',
  'FN:3,subtract',
  'FNDA:3,add',
  'FNDA:0,subtract',
  'DA:1,3',
  'DA:2,0',
  'DA:2,0',
  'BRDA:1,0,0,1',
  'BRDA:1,0,1,-',
  'FNF:2',
  'FNH:1',
  'LF:2',
  'LH:1',
  'BRF:2',
  'BRH:1',
  'end_of_record'
].join('\n');

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="lcov-input">LCOV tracefile</label>
      <textarea id="lcov-input" spellcheck="false">${sampleTrace}</textarea>
      <div class="control-grid">
        <label class="check-control">
          <input id="lcov-normalize-paths" type="checkbox" checked />
          <span>Normalize paths</span>
        </label>
        <div>
          <label for="lcov-max">Max input length</label>
          <input id="lcov-max" type="number" min="1" step="1" value="1000000" />
        </div>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">LCOV diagnostics</div>
      <div id="lcov-summary" class="table-output compact-table-output"></div>
      <div id="lcov-records" class="table-output compact-table-output"></div>
      <pre id="lcov-diagnostics" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('lcov-input');
  const normalizePaths = byId<HTMLInputElement>('lcov-normalize-paths');
  const max = byId<HTMLInputElement>('lcov-max');
  const summary = byId<HTMLDivElement>('lcov-summary');
  const records = byId<HTMLDivElement>('lcov-records');
  const diagnostics = byId<HTMLElement>('lcov-diagnostics');

  const update = (): void => {
    const result = inspectLcovTrace(input.value, {
      normalizePaths: normalizePaths.checked,
      maxInputLength: Number(max.value)
    });

    if (!result.ok && result.records.length === 0) {
      summary.innerHTML = renderError(result.diagnostics[0]?.message ?? 'The LCOV tracefile could not be inspected.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { field: 'ok', value: String(result.ok) },
          { field: 'records', value: String(result.summary.records) },
          { field: 'line coverage', value: formatCoverage(result.summary.lineCoverage) },
          { field: 'function coverage', value: formatCoverage(result.summary.functionCoverage) },
          { field: 'branch coverage', value: formatCoverage(result.summary.branchCoverage) },
          { field: 'diagnostics', value: String(result.diagnostics.length) }
        ],
        { columns: ['field', 'value'] }
      );
    }

    records.innerHTML =
      result.records.length > 0
        ? arrayToHtmlTable(
            result.records.map((record) => ({
              file: record.sourceFile,
              lines: `${record.summary.linesHit}/${record.summary.linesFound}`,
              functions: `${record.summary.functionsHit}/${record.summary.functionsFound}`,
              branches: `${record.summary.branchesHit}/${record.summary.branchesFound}`
            })),
            { columns: ['file', 'lines', 'functions', 'branches'] }
          )
        : result.diagnostics.length > 0
          ? arrayToHtmlTable(
              result.diagnostics.map((item) => ({
                severity: item.severity,
                code: item.code,
                line: item.line ?? '-'
              })),
              { columns: ['severity', 'code', 'line'] }
            )
          : '<p class="empty-state">No LCOV records.</p>';

    diagnostics.textContent = formatLcovDiagnostics(result.diagnostics);
  };

  input.addEventListener('input', update);
  normalizePaths.addEventListener('change', update);
  max.addEventListener('input', update);
  update();
}

function formatCoverage(value: number | null): string {
  return value === null ? '-' : `${value}%`;
}
