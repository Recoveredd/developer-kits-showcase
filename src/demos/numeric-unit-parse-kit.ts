import { arrayToHtmlTable } from 'array-table-kit';
import {
  createNumericUnitParser,
  formatNumericUnit,
  isNumericUnit
} from 'numeric-unit-parse-kit';
import type { ParseNumericUnitOptions } from 'numeric-unit-parse-kit';
import { byId, escapeHtml, renderError } from '../shared';

const sample = '  1.5rem  ';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="numeric-unit-input">Numeric unit input</label>
      <textarea id="numeric-unit-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <div class="control-row">
        <label for="numeric-unit-allowed">Allowed units</label>
        <input id="numeric-unit-allowed" value="px, rem, em, %, gold" spellcheck="false" />
      </div>
      <div class="control-row">
        <label for="numeric-unit-separator">Format separator</label>
        <select id="numeric-unit-separator">
          <option value="" selected>none</option>
          <option value=" ">space</option>
        </select>
      </div>
      <label class="check-control">
        <input id="numeric-unit-require" type="checkbox" checked />
        <span>Require unit</span>
      </label>
      <label class="check-control">
        <input id="numeric-unit-zero" type="checkbox" checked />
        <span>Allow unitless zero</span>
      </label>
      <label class="check-control">
        <input id="numeric-unit-negative" type="checkbox" checked />
        <span>Allow negative values</span>
      </label>
      <label class="check-control">
        <input id="numeric-unit-percent" type="checkbox" checked />
        <span>Allow percent unit</span>
      </label>
      <label class="check-control">
        <input id="numeric-unit-case" type="checkbox" checked />
        <span>Case-sensitive units</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed numeric unit</div>
      <div id="numeric-unit-summary" class="table-output compact-table-output"></div>
      <div id="numeric-unit-diagnostics" class="table-output compact-table-output"></div>
      <pre id="numeric-unit-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('numeric-unit-input');
  const allowed = byId<HTMLInputElement>('numeric-unit-allowed');
  const separator = byId<HTMLSelectElement>('numeric-unit-separator');
  const requireUnit = byId<HTMLInputElement>('numeric-unit-require');
  const allowUnitlessZero = byId<HTMLInputElement>('numeric-unit-zero');
  const allowNegative = byId<HTMLInputElement>('numeric-unit-negative');
  const allowPercent = byId<HTMLInputElement>('numeric-unit-percent');
  const caseSensitiveUnits = byId<HTMLInputElement>('numeric-unit-case');
  const summary = byId<HTMLDivElement>('numeric-unit-summary');
  const diagnostics = byId<HTMLDivElement>('numeric-unit-diagnostics');
  const output = byId<HTMLElement>('numeric-unit-output');

  const update = (): void => {
    const options = readOptions();
    const parser = createNumericUnitParser(options);
    const result = parser.parse(input.value);
    const valid = isNumericUnit(input.value, options);

    if (result.ok) {
      const formatted = formatNumericUnit(result.value, {
        separator: separator.value,
        unitlessZero: false,
        maximumFractionDigits: 4
      });

      summary.innerHTML = arrayToHtmlTable(
        [
          { metric: 'valid', value: String(valid) },
          { metric: 'amount', value: String(result.value.amount) },
          { metric: 'unit', value: result.value.unit || '(none)' },
          { metric: 'normalized', value: result.value.normalized },
          { metric: 'formatted', value: formatted }
        ],
        { columns: ['metric', 'value'] }
      );
      diagnostics.innerHTML = '<p class="empty-state">No diagnostics.</p>';
    } else {
      summary.innerHTML = renderError('This value does not match the selected unit policy.');
      diagnostics.innerHTML = arrayToHtmlTable(
        result.issues.map((issue) => ({
          code: issue.code,
          unit: issue.unit ?? '-',
          normalized: issue.normalizedInput ?? '-',
          message: issue.message
        })),
        { columns: ['code', 'unit', 'normalized', 'message'] }
      );
    }

    output.textContent = JSON.stringify(
      {
        options,
        helperCheck: parser.isValid(input.value),
        result
      },
      null,
      2
    );
  };

  function readOptions(): ParseNumericUnitOptions {
    return {
      allowedUnits: allowed.value
        .split(',')
        .map((unit) => unit.trim())
        .filter(Boolean),
      requireUnit: requireUnit.checked,
      allowUnitlessZero: allowUnitlessZero.checked,
      allowNegative: allowNegative.checked,
      allowPercent: allowPercent.checked,
      caseSensitiveUnits: caseSensitiveUnits.checked
    };
  }

  input.addEventListener('input', update);
  allowed.addEventListener('input', update);
  separator.addEventListener('change', update);
  requireUnit.addEventListener('change', update);
  allowUnitlessZero.addEventListener('change', update);
  allowNegative.addEventListener('change', update);
  allowPercent.addEventListener('change', update);
  caseSensitiveUnits.addEventListener('change', update);
  update();
}
