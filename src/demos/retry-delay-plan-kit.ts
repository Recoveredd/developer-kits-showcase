import { arrayToHtmlTable } from 'array-table-kit';
import {
  createRetryDelayPlan,
  parseRetryAfterDelay
} from 'retry-delay-plan-kit';
import type { RetryDelayJitter } from 'retry-delay-plan-kit';
import { byId } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <div class="control-grid">
        <label>
          Attempts
          <input id="retry-attempts" type="number" min="0" max="20" value="5" />
        </label>
        <label>
          Base delay ms
          <input id="retry-base" type="number" min="0" value="100" />
        </label>
        <label>
          Factor
          <input id="retry-factor" type="number" min="1" step="0.1" value="2" />
        </label>
        <label>
          Max delay ms
          <input id="retry-max-delay" type="number" min="0" value="1200" />
        </label>
      </div>
      <div class="control-row">
        <label for="retry-jitter">Jitter</label>
        <select id="retry-jitter">
          <option value="none">none</option>
          <option value="full">full</option>
          <option value="equal" selected>equal</option>
        </select>
      </div>
      <label for="retry-seed">Seed</label>
      <input id="retry-seed" type="text" value="deploy-42" />
      <label for="retry-after">Retry-After header</label>
      <input id="retry-after" type="text" value="12" />
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Retry delay plan</div>
      <p class="empty-state">The demo renders a deterministic plan only. The library does not sleep, retry requests or start timers.</p>
      <div id="retry-summary" class="table-output compact-table-output"></div>
      <div id="retry-steps" class="table-output compact-table-output"></div>
      <pre id="retry-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const attempts = byId<HTMLInputElement>('retry-attempts');
  const baseDelay = byId<HTMLInputElement>('retry-base');
  const factor = byId<HTMLInputElement>('retry-factor');
  const maxDelay = byId<HTMLInputElement>('retry-max-delay');
  const jitter = byId<HTMLSelectElement>('retry-jitter');
  const seed = byId<HTMLInputElement>('retry-seed');
  const retryAfter = byId<HTMLInputElement>('retry-after');
  const summary = byId<HTMLDivElement>('retry-summary');
  const steps = byId<HTMLDivElement>('retry-steps');
  const output = byId<HTMLElement>('retry-output');

  const update = (): void => {
    const plan = createRetryDelayPlan({
      attempts: attempts.valueAsNumber,
      maxAttempts: 20,
      baseDelayMs: baseDelay.valueAsNumber,
      factor: factor.valueAsNumber,
      maxDelayMs: maxDelay.valueAsNumber,
      jitter: jitter.value as RetryDelayJitter,
      seed: seed.value
    });
    const retryAfterDelay = parseRetryAfterDelay(retryAfter.value, new Date('2026-05-14T10:30:00.000Z'));

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'steps', value: plan.steps.length },
        { metric: 'total delay ms', value: plan.totalDelayMs },
        { metric: 'issues', value: plan.issues.length },
        { metric: 'Retry-After ms', value: retryAfterDelay ?? '-' }
      ],
      { columns: ['metric', 'value'] }
    );

    steps.innerHTML =
      plan.steps.length > 0
        ? arrayToHtmlTable(plan.steps, { columns: ['attempt', 'delayMs', 'capped'] })
        : '<p class="empty-state">No retry step generated.</p>';

    output.textContent = JSON.stringify(
      {
        options: {
          attempts: attempts.valueAsNumber,
          maxAttempts: 20,
          baseDelayMs: baseDelay.valueAsNumber,
          factor: factor.valueAsNumber,
          maxDelayMs: maxDelay.valueAsNumber,
          jitter: jitter.value,
          seed: seed.value
        },
        retryAfter: retryAfter.value,
        retryAfterDelay,
        plan
      },
      null,
      2
    );
  };

  for (const element of [attempts, baseDelay, factor, maxDelay, jitter, seed, retryAfter]) {
    element.addEventListener('input', update);
    element.addEventListener('change', update);
  }

  update();
}
