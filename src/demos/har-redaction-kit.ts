import { arrayToHtmlTable } from 'array-table-kit';
import {
  defaultHarSensitiveKeys,
  harRedactionRules,
  redactHar,
  type HarRedactionOptions,
  type HarRedactionRule
} from '../../../har-redaction-kit/src/index';
import { byId, escapeHtml, renderError } from '../shared';

const sampleHar = {
  log: {
    version: '1.2',
    creator: { name: 'browser', version: 'preview' },
    entries: [
      {
        request: {
          method: 'POST',
          url: 'https://api.example.test/search?access_token=url-secret&query=public',
          headers: [
            { name: 'Authorization', value: 'Bearer request-secret' },
            { name: 'Cookie', value: 'sid=abc; theme=dark' },
            { name: 'Accept', value: 'application/json' },
            { name: 'X-API-Key', value: 'key-secret' }
          ],
          cookies: [{ name: 'sid', value: 'cookie-secret' }],
          queryString: [
            { name: 'access_token', value: 'query-secret' },
            { name: 'query', value: 'public' }
          ],
          postData: {
            mimeType: 'application/json',
            text: JSON.stringify({
              email: 'customer@example.test',
              password: 'p4ss',
              profile: { plan: 'scale', refresh_token: 'refresh-secret' }
            })
          }
        },
        response: {
          status: 200,
          headers: [
            { name: 'Set-Cookie', value: 'sid=response-secret; HttpOnly' },
            { name: 'Content-Type', value: 'application/json' }
          ],
          cookies: [{ name: 'sid', value: 'response-secret' }]
        }
      }
    ]
  }
};

export function renderDemo(): string {
  const ruleControls = harRedactionRules
    .map(
      (rule) => `
        <label class="check-control">
          <input class="har-rule" type="checkbox" value="${rule}" checked />
          <span>${rule}</span>
        </label>
      `
    )
    .join('');

  return `
    <div class="panel input-panel">
      <label for="har-input">HAR JSON</label>
      <textarea id="har-input" spellcheck="false">${escapeHtml(JSON.stringify(sampleHar, null, 2))}</textarea>
      <div class="control-row">
        <label for="har-placeholder">Placeholder</label>
        <input id="har-placeholder" type="text" value="[REDACTED]" />
      </div>
      <label class="check-control">
        <input id="har-keep-url" type="checkbox" />
        <span>Keep original request.url</span>
      </label>
      <div class="panel-title">Enabled rules</div>
      <div class="stacked-controls">${ruleControls}</div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Redaction report</div>
      <div id="har-summary" class="table-output compact-table-output"></div>
      <div id="har-changes" class="table-output compact-table-output"></div>
      <pre id="har-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('har-input');
  const placeholder = byId<HTMLInputElement>('har-placeholder');
  const keepUrl = byId<HTMLInputElement>('har-keep-url');
  const summary = byId<HTMLDivElement>('har-summary');
  const changes = byId<HTMLDivElement>('har-changes');
  const output = byId<HTMLElement>('har-output');
  const ruleInputs = [...document.querySelectorAll<HTMLInputElement>('.har-rule')];

  const update = (): void => {
    const selectedRules = ruleInputs
      .filter((ruleInput) => ruleInput.checked)
      .map((ruleInput) => ruleInput.value as HarRedactionRule);
    const options: HarRedactionOptions = {
      rules: selectedRules,
      placeholder: placeholder.value || '[REDACTED]',
      keepOriginalUrl: keepUrl.checked,
      sensitiveKeys: [...defaultHarSensitiveKeys]
    };
    const result = redactHar(input.value, options);

    if (!result.ok) {
      summary.innerHTML = renderError(`Unable to redact HAR: ${result.diagnostics.join(', ')}`);
      changes.innerHTML = '';
      output.textContent = JSON.stringify(result, null, 2);
      return;
    }

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'entries', value: result.summary.entries },
        { metric: 'changes', value: result.summary.changes },
        { metric: 'changedRequests', value: result.summary.changedRequests },
        { metric: 'diagnostics', value: result.diagnostics.join(', ') || '-' }
      ],
      { columns: ['metric', 'value'] }
    );

    changes.innerHTML =
      result.changes.length > 0
        ? arrayToHtmlTable(
            result.changes.map((change) => ({
              rule: change.rule,
              path: change.path,
              beforeLength: change.beforeLength,
              afterLength: change.afterLength
            })),
            { columns: ['rule', 'path', 'beforeLength', 'afterLength'] }
          )
        : '<p class="empty-state">No redactions for the selected rules.</p>';

    output.textContent = JSON.stringify(result.har, null, 2);
  };

  input.addEventListener('input', update);
  placeholder.addEventListener('input', update);
  keepUrl.addEventListener('change', update);
  ruleInputs.forEach((ruleInput) => ruleInput.addEventListener('change', update));
  update();
}
