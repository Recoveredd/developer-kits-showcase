import { arrayToHtmlTable } from 'array-table-kit';
import {
  convertSrtToWebVtt,
  inspectCaptionTrack
} from '../../../caption-track-doctor-kit/src/index';
import { byId, renderError } from '../shared';

const sampleCaptions = `1
00:00:01,000 --> 00:00:03,500
Hello <i>world</i>

3
00:00:03,000 --> 00:00:04,000
This cue overlaps the previous one`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="caption-input">Caption track</label>
      <textarea id="caption-input" spellcheck="false">${sampleCaptions}</textarea>
      <div class="control-grid">
        <div>
          <label for="caption-format">Format</label>
          <select id="caption-format">
            <option value="auto">auto</option>
            <option value="srt">srt</option>
            <option value="webvtt">webvtt</option>
          </select>
        </div>
        <div>
          <label for="caption-max-length">Max input length</label>
          <input id="caption-max-length" type="number" value="500000" min="1" />
        </div>
      </div>
      <label class="check-control">
        <input id="caption-allow-html" type="checkbox" />
        <span>Allow HTML-like cue text</span>
      </label>
      <label class="check-control">
        <input id="caption-identifiers" type="checkbox" checked />
        <span>Keep cue identifiers on SRT conversion</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Caption report</div>
      <div id="caption-summary" class="table-output compact-table-output"></div>
      <div id="caption-cues" class="table-output compact-table-output"></div>
      <div id="caption-diagnostics" class="table-output compact-table-output"></div>
      <pre id="caption-webvtt" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('caption-input');
  const format = byId<HTMLSelectElement>('caption-format');
  const maxLength = byId<HTMLInputElement>('caption-max-length');
  const allowHtml = byId<HTMLInputElement>('caption-allow-html');
  const identifiers = byId<HTMLInputElement>('caption-identifiers');
  const summary = byId<HTMLDivElement>('caption-summary');
  const cues = byId<HTMLDivElement>('caption-cues');
  const diagnostics = byId<HTMLDivElement>('caption-diagnostics');
  const webvtt = byId<HTMLElement>('caption-webvtt');

  const update = (): void => {
    const maxInputLength = Number(maxLength.value);
    const report = inspectCaptionTrack(input.value, {
      format: format.value as 'auto' | 'srt' | 'webvtt',
      maxInputLength,
      allowHtmlTags: allowHtml.checked
    });
    const converted = convertSrtToWebVtt(input.value, {
      maxInputLength,
      allowHtmlTags: allowHtml.checked,
      includeCueIdentifiers: identifiers.checked
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { field: 'ok', value: String(report.ok) },
        { field: 'format', value: report.format },
        { field: 'cues', value: String(report.cues.length) },
        { field: 'duration', value: `${report.durationMs} ms` },
        { field: 'diagnostics', value: String(report.diagnostics.length) }
      ],
      { columns: ['field', 'value'] }
    );

    cues.innerHTML =
      report.cues.length > 0
        ? arrayToHtmlTable(
            report.cues.map((cue) => ({
              cue: String(cue.index + 1),
              start: String(cue.startMs),
              end: String(cue.endMs),
              lines: String(cue.text.length),
              source: String(cue.sourceLine)
            })),
            { columns: ['cue', 'start', 'end', 'lines', 'source'] }
          )
        : renderError('No cue parsed.');

    diagnostics.innerHTML =
      report.diagnostics.length > 0
        ? arrayToHtmlTable(
            report.diagnostics.map((entry) => ({
              severity: entry.severity,
              code: entry.code,
              line: entry.line ?? '-',
              cue: entry.cueIndex ?? '-'
            })),
            { columns: ['severity', 'code', 'line', 'cue'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    webvtt.textContent = converted.ok ? converted.webvtt : '# SRT conversion is unavailable for this input.';
  };

  input.addEventListener('input', update);
  format.addEventListener('change', update);
  maxLength.addEventListener('input', update);
  allowHtml.addEventListener('change', update);
  identifiers.addEventListener('change', update);
  update();
}
