import { arrayToHtmlTable } from 'array-table-kit';
import { parseTerminalTable } from 'terminal-table-kit';
import { terminalSample } from '../sample-data';
import { byId, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="terminal-table-input">Terminal output</label>
      <textarea id="terminal-table-input" spellcheck="false">${terminalSample}</textarea>
      <div class="control-row">
        <label for="terminal-table-max-rows">Max rows</label>
        <select id="terminal-table-max-rows">
          <option value="0">all rows</option>
          <option value="1">1 row</option>
          <option value="2" selected>2 rows</option>
        </select>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed rows</div>
      <div id="terminal-table-output" class="table-output"></div>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('terminal-table-input');
  const maxRows = byId<HTMLSelectElement>('terminal-table-max-rows');
  const output = byId<HTMLDivElement>('terminal-table-output');

  const update = (): void => {
    try {
      output.innerHTML = arrayToHtmlTable(parseTerminalTable(input.value, {
        keyStyle: 'camel',
        maxRows: maxRows.value === '0' ? Number.POSITIVE_INFINITY : Number(maxRows.value)
      }));
    } catch (error) {
      output.innerHTML = renderError(error instanceof Error ? error.message : 'Unable to parse table.');
    }
  };

  input.addEventListener('input', update);
  maxRows.addEventListener('change', update);
  update();
}
