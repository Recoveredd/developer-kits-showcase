import { arrayToHtmlTable } from 'array-table-kit';
import {
  expandNumberRangeList,
  formatNumberRangeList,
  isNumberRangeList,
  parseNumberRangeList
} from 'number-range-list-kit';
import { byId, escapeHtml, renderError } from '../shared';

const sample = '1, 3-5, 10..8, 20–22, 5';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="number-range-input">Range list</label>
      <textarea id="number-range-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <div class="control-row">
        <label for="number-range-limit">Max expanded values</label>
        <select id="number-range-limit">
          <option value="8">8 values</option>
          <option value="20" selected>20 values</option>
          <option value="1000">1,000 values</option>
        </select>
      </div>
      <label class="check-control">
        <input id="number-range-descending" type="checkbox" checked />
        <span>Allow descending ranges</span>
      </label>
      <label class="check-control">
        <input id="number-range-dedupe" type="checkbox" />
        <span>Dedupe expanded values</span>
      </label>
      <label class="check-control">
        <input id="number-range-expand" type="checkbox" checked />
        <span>Expand values</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed range list</div>
      <div id="number-range-summary" class="table-output compact-table-output"></div>
      <div id="number-range-segments" class="table-output compact-table-output"></div>
      <div id="number-range-diagnostics" class="table-output compact-table-output"></div>
      <pre id="number-range-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('number-range-input');
  const limit = byId<HTMLSelectElement>('number-range-limit');
  const allowDescending = byId<HTMLInputElement>('number-range-descending');
  const dedupe = byId<HTMLInputElement>('number-range-dedupe');
  const expand = byId<HTMLInputElement>('number-range-expand');
  const summary = byId<HTMLDivElement>('number-range-summary');
  const segments = byId<HTMLDivElement>('number-range-segments');
  const diagnostics = byId<HTMLDivElement>('number-range-diagnostics');
  const output = byId<HTMLElement>('number-range-output');

  const update = (): void => {
    const options = {
      maxExpandedValues: Number(limit.value),
      allowDescending: allowDescending.checked,
      dedupe: dedupe.checked,
      expand: expand.checked
    };
    const result = parseNumberRangeList(input.value, options);
    const allDiagnostics = [
      ...result.errors.map((diagnostic) => ({ severity: 'error', ...diagnostic })),
      ...result.warnings.map((diagnostic) => ({ severity: 'warning', ...diagnostic }))
    ];

    diagnostics.innerHTML =
      allDiagnostics.length > 0
        ? arrayToHtmlTable(
            allDiagnostics.map((diagnostic) => ({
              severity: diagnostic.severity,
              code: diagnostic.code,
              range: `${diagnostic.startIndex}-${diagnostic.endIndex}`,
              message: diagnostic.message
            })),
            { columns: ['severity', 'code', 'range', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    if (result.segments.length > 0) {
      segments.innerHTML = arrayToHtmlTable(
        result.segments.map((segment) => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          step: segment.step,
          span: `${segment.startIndex}-${segment.endIndex}`
        })),
        { columns: ['text', 'start', 'end', 'step', 'span'] }
      );
    } else {
      segments.innerHTML = '<p class="empty-state">No valid segments yet.</p>';
    }

    summary.innerHTML = result.ok
      ? arrayToHtmlTable(
          [
            { metric: 'valid', value: String(isNumberRangeList(input.value, options)) },
            { metric: 'segments', value: result.segments.length },
            { metric: 'values', value: result.values ? result.values.length : 'not expanded' },
            { metric: 'formatted', value: formatNumberRangeList(result.segments) }
          ],
          { columns: ['metric', 'value'] }
        )
      : renderError('This range list has errors.');

    output.textContent = JSON.stringify(
      {
        ok: result.ok,
        values: result.ok ? result.values : null,
        simpleExpansion: expandNumberRangeList(input.value, options),
        errors: result.errors,
        warnings: result.warnings
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  limit.addEventListener('change', update);
  allowDescending.addEventListener('change', update);
  dedupe.addEventListener('change', update);
  expand.addEventListener('change', update);
  update();
}
