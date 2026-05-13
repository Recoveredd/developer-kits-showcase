import { arrayToHtmlTable } from 'array-table-kit';
import { getPathEntries } from 'object-key-paths';
import { reportSample } from '../sample-data';
import { byId, escapeHtml, parseJson, renderError } from '../shared';

export function renderDemo(): string {
  const jsonValue = escapeHtml(JSON.stringify(reportSample, null, 2));

  return `
    <div class="panel input-panel">
      <label for="object-key-input">Object</label>
      <textarea id="object-key-input" spellcheck="false">${jsonValue}</textarea>
      <div class="control-row">
        <label for="object-key-style">Path style</label>
        <select id="object-key-style">
          <option value="dot">dot</option>
          <option value="bracket">bracket</option>
        </select>
      </div>
      <div class="control-row">
        <label for="object-key-limit">Entry limit</label>
        <select id="object-key-limit">
          <option value="0">unlimited</option>
          <option value="5">5 entries</option>
          <option value="10" selected>10 entries</option>
        </select>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Discovered paths</div>
      <div id="object-key-output" class="table-output"></div>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-key-input');
  const style = byId<HTMLSelectElement>('object-key-style');
  const limit = byId<HTMLSelectElement>('object-key-limit');
  const output = byId<HTMLDivElement>('object-key-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.innerHTML = renderError(value.message);
      return;
    }

    const entries = getPathEntries(value.data, {
      pathStyle: style.value as 'dot' | 'bracket',
      includeIntermediate: true,
      limit: limit.value === '0' ? Number.POSITIVE_INFINITY : Number(limit.value)
    }).map((entry) => ({
      path: entry.path,
      depth: entry.depth,
      leaf: entry.isLeaf
    }));

    output.innerHTML = arrayToHtmlTable(entries, {
      columns: ['path', 'depth', 'leaf']
    });
  };

  input.addEventListener('input', update);
  style.addEventListener('change', update);
  limit.addEventListener('change', update);
  update();
}
