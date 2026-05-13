import { arrayToHtmlTable, arrayToMarkdownTable } from 'array-table-kit';
import { rowsSample } from '../sample-data';
import { byId, escapeHtml, parseJson } from '../shared';

export function renderDemo(): string {
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

export function bindDemo(): void {
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
