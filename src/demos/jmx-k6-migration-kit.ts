import { jmxSample } from '../sample-data';
import { byId, renderPreviewDemoShell } from '../shared';

export function renderDemo(): string {
  return renderPreviewDemoShell(
    'JMeter JMX input',
    'jmx-input',
    jmxSample,
    'Migration output',
    'jmx-output',
    `<div class="control-row">
      <label for="jmx-output-mode">Output</label>
      <select id="jmx-output-mode">
        <option value="summary" selected>summary</option>
        <option value="script">k6 script</option>
        <option value="report">Markdown report</option>
      </select>
    </div>`
  );
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('jmx-input');
  const mode = byId<HTMLSelectElement>('jmx-output-mode');
  const output = byId<HTMLElement>('jmx-output');
  const { formatMigrationReport, migrateJmxToK6 } = await import('jmx-k6-migration-kit');

  const update = (): void => {
    const result = migrateJmxToK6(input.value, {
      sourceName: 'demo.jmx',
      baseUrl: 'https://api.example.com'
    });

    if (mode.value === 'script') {
      output.textContent = result.k6.ok ? result.k6.script : JSON.stringify(result.k6.findings, null, 2);
      return;
    }

    if (mode.value === 'report') {
      output.textContent = formatMigrationReport({ analysis: result.analysis, k6: result.k6 });
      return;
    }

    output.textContent = JSON.stringify(
      {
        summary: result.analysis.summary,
        findings: result.analysis.findings,
        httpRequests: result.analysis.httpRequests.map((request) => ({
          name: request.name,
          method: request.method,
          url: `${request.protocol ?? 'https'}://${request.domain ?? 'example.com'}${request.path}`,
          checks: request.checks.length,
          notes: request.migrationNotes.length
        }))
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  mode.addEventListener('change', update);
  update();
}
