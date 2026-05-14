import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatAcceptLanguage,
  parseAcceptLanguage,
  pickAcceptedLanguage
} from '../../../http-accept-language-kit/src/index';
import { byId, escapeHtml, renderError } from '../shared';

const sample = 'fr-CA, fr;q=0.8, en-US;q=0.6, *;q=0.2';
const supportedSample = 'en-US\nfr-FR\nde-DE';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="accept-language-input">Accept-Language header</label>
      <textarea id="accept-language-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <label for="accept-language-supported">Supported languages</label>
      <textarea id="accept-language-supported" spellcheck="false">${escapeHtml(supportedSample)}</textarea>
      <label class="check-control">
        <input id="accept-language-wildcard" type="checkbox" checked />
        <span>Allow wildcard ranges</span>
      </label>
      <label class="check-control">
        <input id="accept-language-extended" type="checkbox" />
        <span>Allow extended q precision</span>
      </label>
      <label class="check-control">
        <input id="accept-language-clamp" type="checkbox" />
        <span>Clamp out-of-range q values</span>
      </label>
      <label class="check-control">
        <input id="accept-language-sort" type="checkbox" checked />
        <span>Sort by quality</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Language negotiation preview</div>
      <div id="accept-language-summary" class="table-output compact-table-output"></div>
      <div id="accept-language-diagnostics" class="table-output compact-table-output"></div>
      <pre id="accept-language-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('accept-language-input');
  const supportedInput = byId<HTMLTextAreaElement>('accept-language-supported');
  const allowWildcard = byId<HTMLInputElement>('accept-language-wildcard');
  const allowExtended = byId<HTMLInputElement>('accept-language-extended');
  const clampQuality = byId<HTMLInputElement>('accept-language-clamp');
  const sort = byId<HTMLInputElement>('accept-language-sort');
  const summary = byId<HTMLDivElement>('accept-language-summary');
  const diagnostics = byId<HTMLDivElement>('accept-language-diagnostics');
  const output = byId<HTMLElement>('accept-language-output');

  const update = (): void => {
    const options = {
      allowWildcard: allowWildcard.checked,
      allowExtendedQualityPrecision: allowExtended.checked,
      clampQuality: clampQuality.checked,
      sort: sort.checked
    };
    const supported = supportedInput.value
      .split(/\s+/u)
      .map((language) => language.trim())
      .filter(Boolean);
    const result = parseAcceptLanguage(input.value, options);
    const selected = pickAcceptedLanguage(input.value, supported, options);
    const formatted = formatAcceptLanguage(result.languages);
    const diagnosticRows = result.diagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      index: diagnostic.index ?? '-',
      token: diagnostic.token ?? '-',
      message: diagnostic.message
    }));

    diagnostics.innerHTML =
      diagnosticRows.length > 0
        ? arrayToHtmlTable(diagnosticRows, { columns: ['code', 'index', 'token', 'message'] })
        : '<p class="empty-state">No diagnostics.</p>';

    if (result.languages.length === 0) {
      summary.innerHTML = renderError('No usable language range was parsed.');
      output.textContent = JSON.stringify(result, null, 2);
      return;
    }

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'ok', value: String(result.ok) },
        { metric: 'ranges', value: result.languages.length },
        { metric: 'selected', value: selected ?? '(none)' },
        { metric: 'formatted', value: formatted }
      ],
      { columns: ['metric', 'value'] }
    );

    output.textContent = JSON.stringify(
      {
        languages: result.languages,
        diagnostics: result.diagnostics,
        supported,
        selected,
        formatted
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  supportedInput.addEventListener('input', update);
  allowWildcard.addEventListener('change', update);
  allowExtended.addEventListener('change', update);
  clampQuality.addEventListener('change', update);
  sort.addEventListener('change', update);
  update();
}
