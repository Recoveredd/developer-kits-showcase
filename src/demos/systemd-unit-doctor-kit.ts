import { arrayToHtmlTable } from 'array-table-kit';
import {
  formatSystemdUnitDiagnostics,
  inspectSystemdUnit
} from 'systemd-unit-doctor-kit';
import type { InspectSystemdUnitOptions, SystemdUnitKind } from 'systemd-unit-doctor-kit';
import { byId, escapeHtml } from '../shared';

const sampleUnit = `[Unit]
Description=Nightly sync
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/sync-data %q
Restart=always
UnknownServiceFlag=yes

[Install]
WantedBy=multi-user.target
`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="systemd-input">systemd unit file</label>
      <textarea id="systemd-input" spellcheck="false">${escapeHtml(sampleUnit)}</textarea>
      <div class="control-row">
        <label for="systemd-kind">Unit kind</label>
        <select id="systemd-kind">
          <option value="unknown">infer</option>
          <option value="service" selected>service</option>
          <option value="timer">timer</option>
          <option value="socket">socket</option>
        </select>
      </div>
      <label class="check-control">
        <input id="systemd-install" type="checkbox" checked />
        <span>Require [Install]</span>
      </label>
      <label class="check-control">
        <input id="systemd-unknown" type="checkbox" />
        <span>Allow unknown directives</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Unit diagnostics</div>
      <p class="empty-state">The sample intentionally includes an unescaped percent specifier, an unknown directive and a risky oneshot restart policy.</p>
      <div id="systemd-summary" class="table-output compact-table-output"></div>
      <div id="systemd-diagnostics" class="table-output compact-table-output"></div>
      <pre id="systemd-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('systemd-input');
  const kind = byId<HTMLSelectElement>('systemd-kind');
  const requireInstall = byId<HTMLInputElement>('systemd-install');
  const allowUnknown = byId<HTMLInputElement>('systemd-unknown');
  const summary = byId<HTMLDivElement>('systemd-summary');
  const diagnostics = byId<HTMLDivElement>('systemd-diagnostics');
  const output = byId<HTMLElement>('systemd-output');

  const update = (): void => {
    const selectedKind = kind.value as SystemdUnitKind;
    const options: InspectSystemdUnitOptions = {
      kind: selectedKind === 'unknown' ? undefined : selectedKind,
      requireInstall: requireInstall.checked,
      allowUnknownDirectives: allowUnknown.checked
    };
    const result = inspectSystemdUnit(input.value, options);

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'ok', value: String(result.ok) },
        { metric: 'kind', value: result.kind },
        { metric: 'sections', value: result.sections.length },
        { metric: 'assignments', value: result.assignments.length },
        { metric: 'diagnostics', value: result.diagnostics.length }
      ],
      { columns: ['metric', 'value'] }
    );

    diagnostics.innerHTML =
      result.diagnostics.length > 0
        ? arrayToHtmlTable(
            result.diagnostics.map((diagnostic) => ({
              severity: diagnostic.severity,
              code: diagnostic.code,
              target: [diagnostic.section, diagnostic.directive].filter(Boolean).join('.') || '-',
              line: `${diagnostic.line}:${diagnostic.column}`,
              message: diagnostic.message
            })),
            { columns: ['severity', 'code', 'target', 'line', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    if (result.diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
      output.textContent = formatSystemdUnitDiagnostics(result);
      return;
    }

    output.textContent = JSON.stringify(
      {
        options,
        formatted: formatSystemdUnitDiagnostics(result),
        sections: result.sections,
        assignments: result.assignments,
        diagnostics: result.diagnostics
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  kind.addEventListener('change', update);
  requireInstall.addEventListener('change', update);
  allowUnknown.addEventListener('change', update);
  update();
}
