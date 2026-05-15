import { arrayToHtmlTable } from 'array-table-kit';
import { migrateCrontabToSystemdTimers } from '../../../crontab-timer-migration-kit/src/index';
import { byId, renderError } from '../shared';

const sampleCrontab = `PATH=/usr/local/bin:/usr/bin
MAILTO=ops@example.test
30 2 * * * /usr/local/bin/backup
0 7 * * 1 /usr/bin/report | mail ops
*/5 9-17 * * MON-FRI /usr/bin/check`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <p class="preview-note">Preview build: this demo lazy-loads the local source until the npm package is published.</p>
      <label for="crontab-input">Crontab</label>
      <textarea id="crontab-input" spellcheck="false">${sampleCrontab}</textarea>
      <div class="control-grid">
        <div>
          <label for="crontab-prefix">Unit prefix</label>
          <input id="crontab-prefix" value="nightly" />
        </div>
        <div>
          <label for="crontab-user">User</label>
          <input id="crontab-user" value="deploy" />
        </div>
        <div>
          <label for="crontab-working-directory">Working directory</label>
          <input id="crontab-working-directory" value="/srv/app" />
        </div>
        <div>
          <label for="crontab-max-jobs">Max jobs</label>
          <input id="crontab-max-jobs" type="number" value="8" min="0" max="100" />
        </div>
      </div>
      <label class="check-control">
        <input id="crontab-persistent" type="checkbox" checked />
        <span>Persistent timers</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Migration report</div>
      <div id="crontab-summary" class="table-output compact-table-output"></div>
      <div id="crontab-jobs" class="table-output compact-table-output"></div>
      <div id="crontab-diagnostics" class="table-output compact-table-output"></div>
      <pre id="crontab-service" class="code-output"></pre>
      <pre id="crontab-timer" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('crontab-input');
  const prefix = byId<HTMLInputElement>('crontab-prefix');
  const user = byId<HTMLInputElement>('crontab-user');
  const workingDirectory = byId<HTMLInputElement>('crontab-working-directory');
  const maxJobs = byId<HTMLInputElement>('crontab-max-jobs');
  const persistent = byId<HTMLInputElement>('crontab-persistent');
  const summary = byId<HTMLDivElement>('crontab-summary');
  const jobs = byId<HTMLDivElement>('crontab-jobs');
  const diagnostics = byId<HTMLDivElement>('crontab-diagnostics');
  const service = byId<HTMLElement>('crontab-service');
  const timer = byId<HTMLElement>('crontab-timer');

  const update = (): void => {
    const result = migrateCrontabToSystemdTimers(input.value, {
      unitPrefix: prefix.value.trim() || 'cron-job',
      user: user.value.trim() || undefined,
      workingDirectory: workingDirectory.value.trim() || undefined,
      maxJobs: Number(maxJobs.value),
      persistent: persistent.checked
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { field: 'ok', value: String(result.ok) },
        { field: 'jobs', value: String(result.jobs.length) },
        { field: 'environment', value: String(result.environment.length) },
        { field: 'diagnostics', value: String(result.diagnostics.length) }
      ],
      { columns: ['field', 'value'] }
    );

    jobs.innerHTML =
      result.jobs.length > 0
        ? arrayToHtmlTable(
            result.jobs.map((job) => ({
              line: String(job.line),
              service: job.serviceUnitName,
              timer: job.timerUnitName,
              onCalendar: job.onCalendar ?? 'UNSUPPORTED',
              warnings: String(job.diagnostics.length)
            })),
            { columns: ['line', 'service', 'timer', 'onCalendar', 'warnings'] }
          )
        : renderError('No migratable cron jobs were found.');

    const importantDiagnostics = result.diagnostics.filter((entry) => entry.code !== 'line-ignored');
    diagnostics.innerHTML =
      importantDiagnostics.length > 0
        ? arrayToHtmlTable(
            importantDiagnostics.map((entry) => ({
              severity: entry.severity,
              code: entry.code,
              line: entry.line ?? '-',
              value: entry.value ?? '-'
            })),
            { columns: ['severity', 'code', 'line', 'value'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    const firstJob = result.jobs[0];
    service.textContent = firstJob ? firstJob.serviceUnit : '# No service generated.';
    timer.textContent = firstJob ? firstJob.timerUnit : '# No timer generated.';
  };

  input.addEventListener('input', update);
  prefix.addEventListener('input', update);
  user.addEventListener('input', update);
  workingDirectory.addEventListener('input', update);
  maxJobs.addEventListener('input', update);
  persistent.addEventListener('change', update);
  update();
}
