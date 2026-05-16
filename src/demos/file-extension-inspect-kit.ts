import { arrayToHtmlTable } from 'array-table-kit';
import {
  createFileExtensionInspector,
  getFileExtension,
  hasFileExtension,
  inspectFileExtension,
  splitFileExtension
} from 'file-extension-inspect-kit';
import type { DotfilePolicy, ExtensionlessPolicy, InspectFileExtensionOptions } from 'file-extension-inspect-kit';
import { byId, escapeHtml, renderError } from '../shared';

const sample = '  uploads/archive.TAR.GZ  ';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="file-extension-input">Filename or path-like input</label>
      <textarea id="file-extension-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <div class="control-row">
        <label for="file-extension-compounds">Compound extensions</label>
        <input id="file-extension-compounds" value="tar.gz, d.ts, module.css" spellcheck="false" />
      </div>
      <div class="control-row">
        <label for="file-extension-expected">Expected extension</label>
        <input id="file-extension-expected" value="tar.gz" spellcheck="false" />
      </div>
      <div class="control-row">
        <label for="file-extension-dotfile">Dotfile policy</label>
        <select id="file-extension-dotfile">
          <option value="name" selected>name</option>
          <option value="extension">extension</option>
          <option value="empty">empty</option>
        </select>
      </div>
      <div class="control-row">
        <label for="file-extension-extensionless">Extensionless policy</label>
        <select id="file-extension-extensionless">
          <option value="empty" selected>empty</option>
          <option value="name">name</option>
        </select>
      </div>
      <label class="check-control">
        <input id="file-extension-preserve" type="checkbox" checked />
        <span>Preserve output case</span>
      </label>
      <label class="check-control">
        <input id="file-extension-case-sensitive" type="checkbox" />
        <span>Case-sensitive matching</span>
      </label>
      <label class="check-control">
        <input id="file-extension-trim" type="checkbox" checked />
        <span>Trim surrounding whitespace</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Extension inspection</div>
      <div id="file-extension-summary" class="table-output compact-table-output"></div>
      <div id="file-extension-diagnostics" class="table-output compact-table-output"></div>
      <pre id="file-extension-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('file-extension-input');
  const compounds = byId<HTMLInputElement>('file-extension-compounds');
  const expected = byId<HTMLInputElement>('file-extension-expected');
  const dotfile = byId<HTMLSelectElement>('file-extension-dotfile');
  const extensionless = byId<HTMLSelectElement>('file-extension-extensionless');
  const preserveCase = byId<HTMLInputElement>('file-extension-preserve');
  const caseSensitive = byId<HTMLInputElement>('file-extension-case-sensitive');
  const trim = byId<HTMLInputElement>('file-extension-trim');
  const summary = byId<HTMLDivElement>('file-extension-summary');
  const diagnostics = byId<HTMLDivElement>('file-extension-diagnostics');
  const output = byId<HTMLElement>('file-extension-output');

  const update = (): void => {
    const options = readOptions();
    const inspector = createFileExtensionInspector(options);
    const result = inspector.inspect(input.value);
    const expectedValue = expected.value.trim();

    if (result.ok) {
      summary.innerHTML = arrayToHtmlTable(
        [
          { metric: 'fileName', value: result.fileName },
          { metric: 'stem', value: result.stem || '(empty)' },
          { metric: 'effectiveStem', value: result.effectiveStem || '(empty)' },
          { metric: 'extension', value: result.extension || '(none)' },
          { metric: 'effectiveExtension', value: result.effectiveExtension || '(none)' },
          { metric: `has "${expectedValue}"`, value: String(inspector.has(input.value, expectedValue)) }
        ],
        { columns: ['metric', 'value'] }
      );
      diagnostics.innerHTML =
        result.diagnostics.length > 0
          ? arrayToHtmlTable(
              result.diagnostics.map((diagnostic) => ({ diagnostic })),
              { columns: ['diagnostic'] }
            )
          : '<p class="empty-state">No diagnostics.</p>';
    } else {
      summary.innerHTML = renderError(result.message);
      diagnostics.innerHTML = arrayToHtmlTable(
        result.diagnostics.map((diagnostic) => ({ diagnostic })),
        { columns: ['diagnostic'] }
      );
    }

    output.textContent = JSON.stringify(
      {
        options,
        result,
        helperOutput: {
          getFileExtension: getFileExtension(input.value, options),
          hasFileExtension: hasFileExtension(input.value, expectedValue, options),
          splitFileExtension: splitFileExtension(input.value, options),
          directInspect: inspectFileExtension(input.value, options)
        }
      },
      null,
      2
    );
  };

  function readOptions(): InspectFileExtensionOptions {
    return {
      compoundExtensions: compounds.value
        .split(',')
        .map((extension) => extension.trim())
        .filter(Boolean),
      dotfile: dotfile.value as DotfilePolicy,
      extensionless: extensionless.value as ExtensionlessPolicy,
      caseMode: preserveCase.checked ? 'preserve' : 'lower',
      caseSensitive: caseSensitive.checked,
      trim: trim.checked
    };
  }

  input.addEventListener('input', update);
  compounds.addEventListener('input', update);
  expected.addEventListener('input', update);
  dotfile.addEventListener('change', update);
  extensionless.addEventListener('change', update);
  preserveCase.addEventListener('change', update);
  caseSensitive.addEventListener('change', update);
  trim.addEventListener('change', update);
  update();
}
