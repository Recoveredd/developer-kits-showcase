import { arrayToHtmlTable } from 'array-table-kit';
import { getDataUrlMediaType, isBase64DataUrl, parseDataUrl } from 'data-url-kit';
import { dataUrlSample } from '../sample-data';
import { byId, escapeHtml, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="data-url-input">Data URL</label>
      <textarea id="data-url-input" spellcheck="false">${escapeHtml(dataUrlSample)}</textarea>
      <div class="control-row">
        <label for="data-url-max-bytes">Max bytes</label>
        <select id="data-url-max-bytes">
          <option value="0">no limit</option>
          <option value="128">128 bytes</option>
          <option value="256">256 bytes</option>
          <option value="1024" selected>1 KB</option>
          <option value="4096">4 KB</option>
        </select>
      </div>
      <label class="check-control">
        <input id="data-url-base64-whitespace" type="checkbox" checked />
        <span>Allow base64 whitespace</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed data URL</div>
      <div id="data-url-summary" class="table-output compact-table-output"></div>
      <div id="data-url-diagnostics" class="table-output compact-table-output"></div>
      <pre id="data-url-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('data-url-input');
  const maxBytes = byId<HTMLSelectElement>('data-url-max-bytes');
  const allowWhitespace = byId<HTMLInputElement>('data-url-base64-whitespace');
  const summary = byId<HTMLDivElement>('data-url-summary');
  const diagnostics = byId<HTMLDivElement>('data-url-diagnostics');
  const output = byId<HTMLElement>('data-url-output');

  const update = (): void => {
    const options = {
      ...(maxBytes.value === '0' ? {} : { maxBytes: Number(maxBytes.value) }),
      allowBase64Whitespace: allowWhitespace.checked
    };
    const result = parseDataUrl(input.value, options);
    const diagnosticRows = result.diagnostics.map((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      index: diagnostic.index ?? '-',
      message: diagnostic.message
    }));

    diagnostics.innerHTML =
      diagnosticRows.length > 0
        ? arrayToHtmlTable(diagnosticRows, { columns: ['severity', 'code', 'index', 'message'] })
        : '<p class="empty-state">No diagnostics.</p>';

    if (!result.ok) {
      summary.innerHTML = renderError('Unable to parse this data URL.');
      output.textContent = JSON.stringify({ ok: false }, null, 2);
      return;
    }

    const textPreview = result.value.text === undefined
      ? 'binary or invalid UTF-8'
      : result.value.text.slice(0, 120);

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'mediaType', value: getDataUrlMediaType(input.value, options) ?? 'unknown' },
        { metric: 'base64', value: String(isBase64DataUrl(input.value, options)) },
        { metric: 'bytes', value: result.value.byteLength },
        { metric: 'parameters', value: result.value.parameterList.length },
        { metric: 'textPreview', value: textPreview }
      ],
      { columns: ['metric', 'value'] }
    );

    output.textContent = JSON.stringify(
      {
        mediaType: result.value.mediaType,
        type: result.value.type,
        subtype: result.value.subtype,
        parameters: result.value.parameters,
        isBase64: result.value.isBase64,
        byteLength: result.value.byteLength,
        text: result.value.text
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  maxBytes.addEventListener('change', update);
  allowWhitespace.addEventListener('change', update);
  update();
}
