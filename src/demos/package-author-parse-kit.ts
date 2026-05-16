import { arrayToHtmlTable } from 'array-table-kit';
import { parsePackageAuthor, stringifyPackageAuthor } from 'package-author-parse-kit';
import { byId, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="package-author-input">Package person string</label>
      <textarea id="package-author-input" spellcheck="false">Ada Lovelace <ada@example.dev> (https://example.dev)</textarea>
      <div class="control-grid">
        <div>
          <label for="package-author-max">Max input length</label>
          <input id="package-author-max" type="number" min="1" step="1" value="500" />
        </div>
        <label class="check-control">
          <input id="package-author-bare-url" type="checkbox" checked />
          <span>Allow bare URL</span>
        </label>
      </div>
      <label class="check-control">
        <input id="package-author-require-field" type="checkbox" />
        <span>Require a known field</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Package author diagnostics</div>
      <div id="package-author-summary" class="table-output compact-table-output"></div>
      <div id="package-author-tokens" class="table-output compact-table-output"></div>
      <pre id="package-author-json" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('package-author-input');
  const maxInput = byId<HTMLInputElement>('package-author-max');
  const allowBareUrl = byId<HTMLInputElement>('package-author-bare-url');
  const requireField = byId<HTMLInputElement>('package-author-require-field');
  const summary = byId<HTMLDivElement>('package-author-summary');
  const tokens = byId<HTMLDivElement>('package-author-tokens');
  const output = byId<HTMLElement>('package-author-json');

  const update = (): void => {
    const result = parsePackageAuthor(input.value, {
      maxInputLength: Number(maxInput.value),
      allowBareUrl: allowBareUrl.checked,
      requireKnownField: requireField.checked
    });

    if (!result.ok && result.tokens.length === 0 && Object.keys(result.author).length === 0) {
      summary.innerHTML = renderError(result.issues[0]?.message ?? 'Input could not be parsed.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { field: 'ok', value: String(result.ok) },
          { field: 'name', value: result.author.name ?? '-' },
          { field: 'email', value: result.author.email ?? '-' },
          { field: 'url', value: result.author.url ?? '-' },
          { field: 'formatted', value: stringifyPackageAuthor(result.author) || '-' },
          { field: 'issues', value: String(result.issues.length) }
        ],
        { columns: ['field', 'value'] }
      );
    }

    tokens.innerHTML =
      result.tokens.length > 0
        ? arrayToHtmlTable(
            result.tokens.map((token) => ({
              kind: token.kind,
              value: token.value,
              span: `${token.start}-${token.end}`
            })),
            { columns: ['kind', 'value', 'span'] }
          )
        : result.issues.length > 0
          ? arrayToHtmlTable(
              result.issues.map((issue) => ({
                code: issue.code,
                index: issue.index,
                message: issue.message
              })),
              { columns: ['code', 'index', 'message'] }
            )
          : '<p class="empty-state">No tokens.</p>';

    output.textContent = JSON.stringify(result, null, 2);
  };

  input.addEventListener('input', update);
  maxInput.addEventListener('input', update);
  allowBareUrl.addEventListener('change', update);
  requireField.addEventListener('change', update);
  update();
}
