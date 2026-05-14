import { arrayToHtmlTable } from 'array-table-kit';
import {
  hashString,
  hashStrings
} from '../../../murmur-string-hash-kit/src/index';
import { byId, escapeHtml, renderError } from '../shared';

const sampleInputs = `café
feature:checkout
tenant:northwind`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <p class="empty-state">MurmurHash3 is deterministic and fast, but not cryptographic. Do not use it for secrets, signatures or adversarial integrity checks.</p>
      <label for="murmur-input">Strings to hash</label>
      <textarea id="murmur-input" spellcheck="false">${escapeHtml(sampleInputs)}</textarea>
      <div class="control-row">
        <label for="murmur-seed">Seed</label>
        <input id="murmur-seed" type="number" value="42" />
      </div>
      <div class="control-row">
        <label for="murmur-max">Max UTF-8 bytes</label>
        <input id="murmur-max" type="number" min="0" value="64" />
      </div>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">MurmurHash3 x86_32 output</div>
      <div id="murmur-summary" class="table-output compact-table-output"></div>
      <div id="murmur-table" class="table-output compact-table-output"></div>
      <pre id="murmur-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('murmur-input');
  const seed = byId<HTMLInputElement>('murmur-seed');
  const maxBytes = byId<HTMLInputElement>('murmur-max');
  const summary = byId<HTMLDivElement>('murmur-summary');
  const table = byId<HTMLDivElement>('murmur-table');
  const output = byId<HTMLElement>('murmur-output');

  const update = (): void => {
    const lines = input.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const options = {
      seed: seed.valueAsNumber,
      maxBytes: maxBytes.valueAsNumber
    };

    try {
      const primary = hashString(lines[0] ?? '', options);
      const batch = hashStrings(lines, options);

      summary.innerHTML = arrayToHtmlTable(
        [
          { metric: 'primary hex', value: primary.hex },
          { metric: 'primary base36', value: primary.base36 },
          { metric: 'primary bytes', value: primary.bytes },
          { metric: 'seed', value: primary.seed }
        ],
        { columns: ['metric', 'value'] }
      );

      table.innerHTML =
        batch.length > 0
          ? arrayToHtmlTable(
              batch.map((item) => ({
                input: item.input,
                hex: item.hex,
                base36: item.base36,
                bytes: item.bytes
              })),
              { columns: ['input', 'hex', 'base36', 'bytes'] }
            )
          : '<p class="empty-state">No non-empty string to hash.</p>';
      output.textContent = JSON.stringify({ options, batch }, null, 2);
    } catch (error) {
      summary.innerHTML = renderError(error instanceof Error ? error.message : 'Unable to hash this input.');
      table.innerHTML = '';
      output.textContent = '';
    }
  };

  input.addEventListener('input', update);
  seed.addEventListener('input', update);
  maxBytes.addEventListener('input', update);
  update();
}
