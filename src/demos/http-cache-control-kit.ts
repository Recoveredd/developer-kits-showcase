import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatCacheControl,
  getCacheControlDeltaSeconds,
  hasCacheControlDirective,
  parseCacheControl
} from '../../../http-cache-control-kit/src/index';
import { byId, escapeHtml, renderError } from '../shared';

const sample = 'public, max-age=3600, stale-while-revalidate=30, private="Authorization, Cookie"';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="cache-control-input">Cache-Control header</label>
      <textarea id="cache-control-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <div class="control-row">
        <label for="cache-control-quote">Formatter quote mode</label>
        <select id="cache-control-quote">
          <option value="auto" selected>auto</option>
          <option value="always">always</option>
          <option value="never">never</option>
        </select>
      </div>
      <label class="check-control">
        <input id="cache-control-unknown" type="checkbox" />
        <span>Allow unknown directives</span>
      </label>
      <label class="check-control">
        <input id="cache-control-duplicates" type="checkbox" />
        <span>Allow duplicate directives</span>
      </label>
      <label class="check-control">
        <input id="cache-control-sort" type="checkbox" checked />
        <span>Sort formatted output</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Header diagnostics</div>
      <div id="cache-control-summary" class="table-output compact-table-output"></div>
      <div id="cache-control-diagnostics" class="table-output compact-table-output"></div>
      <pre id="cache-control-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('cache-control-input');
  const allowUnknown = byId<HTMLInputElement>('cache-control-unknown');
  const allowDuplicates = byId<HTMLInputElement>('cache-control-duplicates');
  const sort = byId<HTMLInputElement>('cache-control-sort');
  const quote = byId<HTMLSelectElement>('cache-control-quote');
  const summary = byId<HTMLDivElement>('cache-control-summary');
  const diagnostics = byId<HTMLDivElement>('cache-control-diagnostics');
  const output = byId<HTMLElement>('cache-control-output');

  const update = (): void => {
    const result = parseCacheControl(input.value, {
      allowUnknown: allowUnknown.checked,
      allowDuplicates: allowDuplicates.checked
    });

    const diagnosticRows = result.diagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      directive: diagnostic.directive ?? '-',
      index: diagnostic.index ?? '-',
      message: diagnostic.message
    }));

    diagnostics.innerHTML =
      diagnosticRows.length > 0
        ? arrayToHtmlTable(diagnosticRows, { columns: ['code', 'directive', 'index', 'message'] })
        : '<p class="empty-state">No diagnostics.</p>';

    if (result.directives.length === 0) {
      summary.innerHTML = renderError('No usable Cache-Control directive was parsed.');
      output.textContent = JSON.stringify(result, null, 2);
      return;
    }

    const formatted = formatCacheControl(result.directives, {
      sort: sort.checked,
      quoteValues: quote.value as 'auto' | 'always' | 'never'
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'ok', value: String(result.ok) },
        { metric: 'directives', value: result.directives.length },
        { metric: 'has no-store', value: String(hasCacheControlDirective(result, 'no-store')) },
        { metric: 'max-age seconds', value: getCacheControlDeltaSeconds(result, 'max-age') ?? '-' },
        { metric: 'formatted', value: formatted }
      ],
      { columns: ['metric', 'value'] }
    );

    output.textContent = JSON.stringify(
      {
        values: result.values,
        diagnostics: result.diagnostics,
        formatted
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  allowUnknown.addEventListener('change', update);
  allowDuplicates.addEventListener('change', update);
  sort.addEventListener('change', update);
  quote.addEventListener('change', update);
  update();
}
