import { arrayToHtmlTable } from 'array-table-kit';
import {
  assertValidPath,
  createFilePathValidator,
  isValidPath
} from 'filepath-validator-kit';
import type { FilePathValidationOptions, PathVetPlatform } from 'filepath-validator-kit';
import { byId, escapeHtml } from '../shared';

const sample = 'uploads/2026/report.csv';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="filepath-input">File path</label>
      <textarea id="filepath-input" spellcheck="false">${escapeHtml(sample)}</textarea>
      <div class="control-row">
        <label for="filepath-platform">Policy</label>
        <select id="filepath-platform">
          <option value="portable" selected>portable</option>
          <option value="windows">windows</option>
          <option value="posix">posix</option>
        </select>
      </div>
      <div class="control-row">
        <label for="filepath-max-segment">Max segment length</label>
        <select id="filepath-max-segment">
          <option value="0">no limit</option>
          <option value="12">12 chars</option>
          <option value="32" selected>32 chars</option>
          <option value="255">255 chars</option>
        </select>
      </div>
      <label class="check-control">
        <input id="filepath-absolute" type="checkbox" />
        <span>Allow absolute paths</span>
      </label>
      <label class="check-control">
        <input id="filepath-traversal" type="checkbox" />
        <span>Allow traversal segments</span>
      </label>
      <label class="check-control">
        <input id="filepath-empty-segments" type="checkbox" />
        <span>Allow repeated separators</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Path validation</div>
      <div id="filepath-summary" class="table-output compact-table-output"></div>
      <div id="filepath-segments" class="table-output compact-table-output"></div>
      <div id="filepath-diagnostics" class="table-output compact-table-output"></div>
      <pre id="filepath-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('filepath-input');
  const platform = byId<HTMLSelectElement>('filepath-platform');
  const maxSegmentLength = byId<HTMLSelectElement>('filepath-max-segment');
  const allowAbsolute = byId<HTMLInputElement>('filepath-absolute');
  const allowTraversal = byId<HTMLInputElement>('filepath-traversal');
  const allowEmptySegments = byId<HTMLInputElement>('filepath-empty-segments');
  const summary = byId<HTMLDivElement>('filepath-summary');
  const segments = byId<HTMLDivElement>('filepath-segments');
  const diagnostics = byId<HTMLDivElement>('filepath-diagnostics');
  const output = byId<HTMLElement>('filepath-output');

  const update = (): void => {
    const options = readOptions();
    const validator = createFilePathValidator(options);
    const result = validator.validate(input.value);

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'valid', value: String(result.valid) },
        { metric: 'isValidPath', value: String(isValidPath(input.value, options)) },
        { metric: 'absolute', value: String(result.absolute) },
        { metric: 'segments', value: result.segments.length },
        { metric: 'normalized', value: result.normalizedSeparators }
      ],
      { columns: ['metric', 'value'] }
    );

    segments.innerHTML =
      result.segments.length > 0
        ? arrayToHtmlTable(
            result.segments.map((segment) => ({
              index: segment.index,
              value: segment.value,
              span: `${segment.start}-${segment.end}`
            })),
            { columns: ['index', 'value', 'span'] }
          )
        : '<p class="empty-state">No path segments.</p>';

    diagnostics.innerHTML =
      result.issues.length > 0
        ? arrayToHtmlTable(
            result.issues.map((issue) => ({
              code: issue.code,
              segment: issue.segment ?? '-',
              span: issue.start === undefined ? '-' : `${issue.start}-${issue.end}`,
              message: issue.message
            })),
            { columns: ['code', 'segment', 'span', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    output.textContent = JSON.stringify(
      {
        result,
        assertValidPath: tryAssertValidPath(input.value, options)
      },
      null,
      2
    );
  };

  function readOptions(): FilePathValidationOptions {
    return {
      platform: platform.value as PathVetPlatform,
      allowAbsolute: allowAbsolute.checked,
      allowTraversal: allowTraversal.checked,
      allowEmptySegments: allowEmptySegments.checked,
      ...(maxSegmentLength.value === '0' ? {} : { maxSegmentLength: Number(maxSegmentLength.value) })
    };
  }

  function tryAssertValidPath(value: string, options: FilePathValidationOptions): string {
    try {
      return assertValidPath(value, options);
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid path.';
    }
  }

  input.addEventListener('input', update);
  platform.addEventListener('change', update);
  maxSegmentLength.addEventListener('change', update);
  allowAbsolute.addEventListener('change', update);
  allowTraversal.addEventListener('change', update);
  allowEmptySegments.addEventListener('change', update);
  update();
}
