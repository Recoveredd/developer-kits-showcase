import { createJsonHtmlViewer, getThemeStyleTag, renderJsonToHtml } from 'json-html-kit';
import type { JsonHtmlThemeName, JsonHtmlViewer } from 'json-html-kit';
import { largeRowsSample, reportSample } from '../sample-data';
import { byId, escapeHtml, parseJson, renderError } from '../shared';

export function renderDemo(): string {
  const jsonValue = escapeHtml(JSON.stringify(reportSample, null, 2));

  return `
    <div class="json-html-demo">
      <div class="demo-tabs" role="tablist" aria-label="json-html-kit demo modes">
        <button id="json-html-renderer-tab" type="button" class="demo-tab is-active" role="tab" aria-selected="true" aria-controls="json-html-renderer-panel" data-json-html-tab="renderer">Renderer</button>
        <button id="json-html-pagination-tab" type="button" class="demo-tab" role="tab" aria-selected="false" aria-controls="json-html-pagination-panel" data-json-html-tab="pagination">Pagination</button>
      </div>
      <div id="json-html-renderer-panel" class="tab-demo-grid" role="tabpanel" aria-labelledby="json-html-renderer-tab">
        <div class="panel input-panel">
          <label for="json-html-input">JSON input</label>
          <textarea id="json-html-input" spellcheck="false">${jsonValue}</textarea>
          <div class="control-row">
            <label for="json-html-theme">Theme</label>
            <select id="json-html-theme">
              <option value="clean">clean</option>
              <option value="slate">slate</option>
              <option value="paper">paper</option>
            </select>
          </div>
          <div class="control-row">
            <label for="json-html-collapse">Collapse depth</label>
            <div class="range-control">
              <input id="json-html-collapse" type="range" min="0" max="5" step="1" value="3" />
              <output id="json-html-collapse-value" for="json-html-collapse">3</output>
            </div>
          </div>
        </div>
        <div class="panel output-panel">
          <div class="panel-title">Rendered HTML</div>
          <div id="json-html-output" class="rendered-json"></div>
        </div>
      </div>
      <div id="json-html-pagination-panel" class="tab-demo-grid" role="tabpanel" aria-labelledby="json-html-pagination-tab" hidden>
        <div class="panel input-panel">
          <div class="panel-title compact-title">Large array</div>
          <pre class="code-output compact-code">${escapeHtml(JSON.stringify(largeRowsSample.slice(0, 6), null, 2))}</pre>
          <div class="control-row">
            <label for="json-html-page-theme">Theme</label>
            <select id="json-html-page-theme">
              <option value="clean">clean</option>
              <option value="slate">slate</option>
              <option value="paper">paper</option>
            </select>
          </div>
          <div class="control-row">
            <label for="json-html-page-size">Page size</label>
            <select id="json-html-page-size">
              <option value="10">10 rows</option>
              <option value="25" selected>25 rows</option>
              <option value="50">50 rows</option>
            </select>
          </div>
        </div>
        <div class="panel output-panel">
          <div class="panel-title">Paginated viewer</div>
          <div id="json-html-page-info" class="demo-meta"></div>
          <div id="json-html-pagination-output" class="rendered-json"></div>
        </div>
      </div>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('json-html-input');
  const theme = byId<HTMLSelectElement>('json-html-theme');
  const collapseDepth = byId<HTMLInputElement>('json-html-collapse');
  const collapseDepthValue = byId<HTMLOutputElement>('json-html-collapse-value');
  const output = byId<HTMLDivElement>('json-html-output');
  const pageTheme = byId<HTMLSelectElement>('json-html-page-theme');
  const pageSize = byId<HTMLSelectElement>('json-html-page-size');
  const pageOutput = byId<HTMLDivElement>('json-html-pagination-output');
  const pageInfo = byId<HTMLDivElement>('json-html-page-info');
  let viewer: JsonHtmlViewer | undefined;

  const updatePageInfo = (): void => {
    if (!viewer) {
      pageInfo.textContent = '';
      return;
    }

    const info = viewer.getPageInfo();
    const firstVisible = info.totalItems === 0 ? 0 : info.startIndex + 1;
    pageInfo.textContent = `${info.totalItems} rows · page ${info.page + 1}/${info.pageCount} · showing ${firstVisible}-${info.endIndex}`;
  };

  const update = (): void => {
    const value = parseJson(input.value);
    const depth = Number(collapseDepth.value);
    collapseDepthValue.value = String(depth);
    collapseDepthValue.textContent = String(depth);

    output.innerHTML = value.ok
      ? `${getThemeStyleTag(theme.value as JsonHtmlThemeName)}${renderJsonToHtml(value.data, {
          theme: theme.value as JsonHtmlThemeName,
          tableMode: 'auto',
          collapseDepth: depth
        })}`
      : renderError(value.message);
  };

  const updateViewer = (): void => {
    viewer?.destroy();
    viewer = createJsonHtmlViewer(pageOutput, largeRowsSample, {
      theme: pageTheme.value as JsonHtmlThemeName,
      pageSize: Number(pageSize.value),
      tableMode: 'auto',
      collapseDepth: 1
    });
    updatePageInfo();
  };

  document.querySelectorAll<HTMLButtonElement>('[data-json-html-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.jsonHtmlTab;
      const rendererPanel = byId<HTMLDivElement>('json-html-renderer-panel');
      const paginationPanel = byId<HTMLDivElement>('json-html-pagination-panel');

      document.querySelectorAll<HTMLButtonElement>('[data-json-html-tab]').forEach((button) => {
        const isActive = button.dataset.jsonHtmlTab === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });

      rendererPanel.hidden = mode !== 'renderer';
      paginationPanel.hidden = mode !== 'pagination';
    });
  });

  input.addEventListener('input', update);
  theme.addEventListener('change', update);
  collapseDepth.addEventListener('input', update);
  pageTheme.addEventListener('change', updateViewer);
  pageSize.addEventListener('change', updateViewer);
  pageOutput.addEventListener('click', () => window.requestAnimationFrame(updatePageInfo));
  update();
  updateViewer();
}
