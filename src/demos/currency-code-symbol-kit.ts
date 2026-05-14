import { arrayToHtmlTable } from 'array-table-kit';
import { inspectCurrencySymbol } from '../../../currency-code-symbol-kit/src/index';
import { byId, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <div class="control-grid">
        <div>
          <label for="currency-code-input">Currency code</label>
          <input id="currency-code-input" type="text" value="USD" />
        </div>
        <div>
          <label for="currency-locale-input">Locale</label>
          <input id="currency-locale-input" type="text" value="en-US" />
        </div>
      </div>
      <label for="currency-compare-input">Compare with</label>
      <textarea id="currency-compare-input" class="small-code" spellcheck="false">CAD
AUD
EUR
JPY</textarea>
      <label class="check-control">
        <input id="currency-narrow-input" type="checkbox" checked />
        <span>Use narrow symbol</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Currency symbol diagnostics</div>
      <div id="currency-summary-output" class="table-output compact-table-output"></div>
      <div id="currency-diagnostics-output" class="table-output compact-table-output"></div>
      <pre id="currency-json-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const codeInput = byId<HTMLInputElement>('currency-code-input');
  const localeInput = byId<HTMLInputElement>('currency-locale-input');
  const compareInput = byId<HTMLTextAreaElement>('currency-compare-input');
  const narrowInput = byId<HTMLInputElement>('currency-narrow-input');
  const summary = byId<HTMLDivElement>('currency-summary-output');
  const diagnostics = byId<HTMLDivElement>('currency-diagnostics-output');
  const output = byId<HTMLElement>('currency-json-output');

  const update = (): void => {
    const compareWith = compareInput.value
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean);
    const result = inspectCurrencySymbol(codeInput.value, {
      locale: localeInput.value,
      narrow: narrowInput.checked,
      compareWith,
      maxComparisons: 12
    });

    if (!result.ok) {
      summary.innerHTML = renderError(result.diagnostics[0]?.message ?? 'Currency could not be resolved.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { field: 'code', value: result.code },
          { field: 'symbol', value: result.symbol },
          { field: 'locale', value: result.locale },
          { field: 'diagnostics', value: String(result.diagnostics.length) }
        ],
        { columns: ['field', 'value'] }
      );
    }

    diagnostics.innerHTML =
      result.diagnostics.length > 0
        ? arrayToHtmlTable(
            result.diagnostics.map((diagnostic) => ({
              code: diagnostic.code,
              related: diagnostic.relatedCodes?.join(', ') ?? '-',
              message: diagnostic.message
            })),
            { columns: ['code', 'related', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    output.textContent = JSON.stringify(result, null, 2);
  };

  codeInput.addEventListener('input', update);
  localeInput.addEventListener('input', update);
  compareInput.addEventListener('input', update);
  narrowInput.addEventListener('change', update);
  update();
}
