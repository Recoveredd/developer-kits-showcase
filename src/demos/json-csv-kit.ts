import { jsonToCsv } from 'json-csv-kit';
import { rowsSample } from '../sample-data';
import { byId, escapeHtml, parseJson } from '../shared';

export function renderDemo(): string {
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
      <label class="check-control">
        <input id="json-csv-bom" type="checkbox" />
        <span>UTF-8 BOM</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">CSV output</div>
      <pre id="json-csv-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('json-csv-input');
  const delimiter = byId<HTMLSelectElement>('json-csv-delimiter');
  const bom = byId<HTMLInputElement>('json-csv-bom');
  const output = byId<HTMLElement>('json-csv-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok || !Array.isArray(value.data)) {
      output.textContent = value.ok ? 'Expected an array of records.' : value.message;
      return;
    }

    output.textContent = jsonToCsv(value.data as Array<Record<string, unknown>>, {
      delimiter: delimiter.value,
      bom: bom.checked
    });
  };

  input.addEventListener('input', update);
  delimiter.addEventListener('change', update);
  bom.addEventListener('change', update);
  update();
}
