import { arrayToHtmlTable } from 'array-table-kit';
import {
  findLinkByRel,
  formatLinkHeader,
  paginationLinks,
  parseLinkHeader
} from 'http-link-header-kit';
import { byId, escapeHtml, renderError } from '../shared';

const sampleHeader =
  '<https://api.example.test/items?page=1>; rel="first", <https://api.example.test/items?page=2>; rel="next prev"; title="Page 2", <https://api.example.test/items?page=5>; rel="last"';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="link-header-input">HTTP Link header</label>
      <textarea id="link-header-input" spellcheck="false">${escapeHtml(sampleHeader)}</textarea>
      <div class="control-row">
        <label for="link-header-rel">Find rel</label>
        <input id="link-header-rel" type="text" value="next" />
      </div>
      <label class="check-control">
        <input id="link-header-allow-empty" type="checkbox" />
        <span>Allow empty input</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Link header diagnostics</div>
      <div id="link-header-summary" class="table-output compact-table-output"></div>
      <div id="link-header-diagnostics" class="table-output compact-table-output"></div>
      <pre id="link-header-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('link-header-input');
  const rel = byId<HTMLInputElement>('link-header-rel');
  const allowEmpty = byId<HTMLInputElement>('link-header-allow-empty');
  const summary = byId<HTMLDivElement>('link-header-summary');
  const diagnostics = byId<HTMLDivElement>('link-header-diagnostics');
  const output = byId<HTMLElement>('link-header-output');

  const update = (): void => {
    const result = parseLinkHeader(input.value, {
      allowEmpty: allowEmpty.checked
    });
    const pagination = paginationLinks(result.links);
    const found = findLinkByRel(result.links, rel.value);

    diagnostics.innerHTML =
      result.diagnostics.length > 0
        ? arrayToHtmlTable(result.diagnostics, { columns: ['code', 'offset', 'message'] })
        : '<p class="empty-state">No diagnostics.</p>';

    if (result.links.length === 0 && !result.ok) {
      summary.innerHTML = renderError('No usable Link value was parsed.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { metric: 'ok', value: String(result.ok) },
          { metric: 'links', value: result.links.length },
          { metric: 'find rel', value: found?.uri ?? '-' },
          { metric: 'next', value: pagination.next?.uri ?? '-' },
          { metric: 'last', value: pagination.last?.uri ?? '-' }
        ],
        { columns: ['metric', 'value'] }
      );
    }

    output.textContent = JSON.stringify(
      {
        links: result.links,
        diagnostics: result.diagnostics,
        pagination,
        found,
        formatted: formatLinkHeader(result.links)
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  rel.addEventListener('input', update);
  allowEmpty.addEventListener('change', update);
  update();
}
