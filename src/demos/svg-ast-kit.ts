import { arrayToHtmlTable } from 'array-table-kit';
import { findSvgElements, getSvgElementNames, getSvgStats, svgToJson, tryParseSvg } from 'svg-ast-kit';
import type { SvgStats } from 'svg-ast-kit';
import { svgSample } from '../sample-data';
import { byId, escapeHtml, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="svg-ast-input">SVG markup</label>
      <textarea id="svg-ast-input" spellcheck="false">${escapeHtml(svgSample)}</textarea>
      <div class="control-row">
        <label for="svg-ast-find">Find elements</label>
        <select id="svg-ast-find">
          <option value="*">all elements</option>
          <option value="svg">svg</option>
          <option value="g">g</option>
          <option value="rect" selected>rect</option>
          <option value="path">path</option>
          <option value="title">title</option>
        </select>
      </div>
      <label class="check-control">
        <input id="svg-ast-comments" type="checkbox" checked />
        <span>Keep comments</span>
      </label>
      <label class="check-control">
        <input id="svg-ast-positions" type="checkbox" />
        <span>Include positions</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed AST</div>
      <div id="svg-ast-summary" class="table-output compact-table-output"></div>
      <pre id="svg-ast-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('svg-ast-input');
  const find = byId<HTMLSelectElement>('svg-ast-find');
  const keepComments = byId<HTMLInputElement>('svg-ast-comments');
  const includePositions = byId<HTMLInputElement>('svg-ast-positions');
  const summary = byId<HTMLDivElement>('svg-ast-summary');
  const output = byId<HTMLElement>('svg-ast-output');

  const update = (): void => {
    const options = {
      includeComments: keepComments.checked,
      includePositions: includePositions.checked
    };
    const result = tryParseSvg(input.value, options);

    if (!result.ok) {
      summary.innerHTML = '';
      output.innerHTML = renderError(result.error.message);
      return;
    }

    const stats = getSvgStats(result.root);
    const found = find.value === '*'
      ? findSvgElements(result.root, () => true)
      : findSvgElements(result.root, find.value);
    const elementNames = getSvgElementNames(result.root, { unique: true }).join(', ');

    summary.innerHTML = arrayToHtmlTable(summaryRows(stats, found.length, elementNames), {
      columns: ['metric', 'value']
    });
    output.textContent = svgToJson(input.value, options, 2);
  };

  input.addEventListener('input', update);
  find.addEventListener('change', update);
  keepComments.addEventListener('change', update);
  includePositions.addEventListener('change', update);
  update();
}

function summaryRows(stats: SvgStats, foundCount: number, elementNames: string): Array<{ metric: string; value: string | number }> {
  const topElements = Object.entries(stats.elementsByName)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 4)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ');

  return [
    { metric: 'elements', value: stats.elements },
    { metric: 'attributes', value: stats.attributes },
    { metric: 'maxDepth', value: stats.maxDepth },
    { metric: 'matched', value: foundCount },
    { metric: 'uniqueNames', value: elementNames || 'none' },
    { metric: 'topElements', value: topElements || 'none' }
  ];
}
