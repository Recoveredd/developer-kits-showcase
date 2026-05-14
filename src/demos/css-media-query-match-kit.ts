import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatMediaQueryList,
  matchMediaQueryList
} from '../../../css-media-query-match-kit/src/index';
import { byId, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="css-media-input">Media query list</label>
      <textarea id="css-media-input" spellcheck="false">screen and (min-width: 768px) and (orientation: landscape),
print,
screen and (hover: hover) and (pointer: fine)</textarea>
      <div class="control-grid">
        <div>
          <label for="css-media-type">Media type</label>
          <select id="css-media-type">
            <option value="screen">screen</option>
            <option value="print">print</option>
            <option value="speech">speech</option>
            <option value="all">all</option>
          </select>
        </div>
        <div>
          <label for="css-media-width">Width</label>
          <input id="css-media-width" type="number" min="0" step="1" value="1280" />
        </div>
        <div>
          <label for="css-media-height">Height</label>
          <input id="css-media-height" type="number" min="0" step="1" value="720" />
        </div>
        <div>
          <label for="css-media-resolution">Resolution dppx</label>
          <input id="css-media-resolution" type="number" min="0" step="0.25" value="2" />
        </div>
        <div>
          <label for="css-media-hover">Hover</label>
          <select id="css-media-hover">
            <option value="hover">hover</option>
            <option value="none">none</option>
          </select>
        </div>
        <div>
          <label for="css-media-pointer">Pointer</label>
          <select id="css-media-pointer">
            <option value="fine">fine</option>
            <option value="coarse">coarse</option>
            <option value="none">none</option>
          </select>
        </div>
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Match result</div>
      <div id="css-media-summary" class="table-output compact-table-output"></div>
      <div id="css-media-queries" class="table-output compact-table-output"></div>
      <pre id="css-media-json" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('css-media-input');
  const type = byId<HTMLSelectElement>('css-media-type');
  const width = byId<HTMLInputElement>('css-media-width');
  const height = byId<HTMLInputElement>('css-media-height');
  const resolution = byId<HTMLInputElement>('css-media-resolution');
  const hover = byId<HTMLSelectElement>('css-media-hover');
  const pointer = byId<HTMLSelectElement>('css-media-pointer');
  const summary = byId<HTMLDivElement>('css-media-summary');
  const queries = byId<HTMLDivElement>('css-media-queries');
  const output = byId<HTMLElement>('css-media-json');

  const update = (): void => {
    const result = matchMediaQueryList(input.value, {
      type: type.value as 'all' | 'screen' | 'print' | 'speech',
      width: Number(width.value),
      height: Number(height.value),
      resolution: Number(resolution.value),
      hover: hover.value as 'none' | 'hover',
      pointer: pointer.value as 'none' | 'coarse' | 'fine'
    });

    if (!result.ok && result.queries.length === 0) {
      summary.innerHTML = renderError(result.diagnostics[0]?.message ?? 'The media query could not be parsed.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { field: 'matches', value: String(result.matches) },
          { field: 'parsed queries', value: String(result.queries.length) },
          { field: 'matched queries', value: String(result.matchedQueries.length) },
          { field: 'diagnostics', value: String(result.diagnostics.length) },
          { field: 'normalized', value: formatMediaQueryList(result.queries) || '-' }
        ],
        { columns: ['field', 'value'] }
      );
    }

    queries.innerHTML =
      result.queries.length > 0
        ? arrayToHtmlTable(
            result.queries.map((query, index) => ({
              index: String(index + 1),
              media: [query.modifier, query.type].filter(Boolean).join(' '),
              conditions: query.conditions
                .map((condition) =>
                  condition.comparison === 'boolean'
                    ? condition.feature
                    : `${condition.comparison} ${condition.feature}: ${condition.value}`
                )
                .join(', ') || '-',
              matched: result.matchedQueries.includes(query) ? 'yes' : 'no'
            })),
            { columns: ['index', 'media', 'conditions', 'matched'] }
          )
        : result.diagnostics.length > 0
          ? arrayToHtmlTable(
              result.diagnostics.map((item) => ({
                code: item.code,
                feature: item.feature ?? '-',
                value: item.value ?? '-'
              })),
              { columns: ['code', 'feature', 'value'] }
            )
          : '<p class="empty-state">No parsed queries.</p>';

    output.textContent = JSON.stringify(result, null, 2);
  };

  input.addEventListener('input', update);
  type.addEventListener('change', update);
  width.addEventListener('input', update);
  height.addEventListener('input', update);
  resolution.addEventListener('input', update);
  hover.addEventListener('change', update);
  pointer.addEventListener('change', update);
  update();
}
