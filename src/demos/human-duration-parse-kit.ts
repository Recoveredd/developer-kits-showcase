import { arrayToHtmlTable } from 'array-table-kit';
import { byId } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="duration-input">Duration input</label>
      <input id="duration-input" value="2 weeks, 3 days and 45 minutes" />
      <label class="check-control">
        <input id="duration-calendar" type="checkbox" />
        <span>Allow month/year approximations</span>
      </label>
      <label class="check-control">
        <input id="duration-negative" type="checkbox" checked />
        <span>Allow negative terms</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed duration</div>
      <div id="duration-summary" class="table-output compact-table-output"></div>
      <pre id="duration-output" class="code-output">Rendering demo...</pre>
    </div>
  `;
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('duration-input');
  const allowCalendarUnits = byId<HTMLInputElement>('duration-calendar');
  const allowNegative = byId<HTMLInputElement>('duration-negative');
  const summary = byId<HTMLDivElement>('duration-summary');
  const output = byId<HTMLElement>('duration-output');
  const { humanDurationMilliseconds, parseHumanDuration } = await import('human-duration-parse-kit');

  const update = (): void => {
    const options = {
      allowCalendarUnits: allowCalendarUnits.checked,
      allowNegative: allowNegative.checked
    };
    const result = parseHumanDuration(input.value, options);
    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'valid', value: String(result.ok) },
        { metric: 'milliseconds', value: humanDurationMilliseconds(input.value, options) ?? '-' },
        { metric: 'tokens', value: result.tokens.length },
        { metric: 'issues', value: result.issues.length }
      ],
      { columns: ['metric', 'value'] }
    );
    output.textContent = JSON.stringify(result, null, 2);
  };

  input.addEventListener('input', update);
  allowCalendarUnits.addEventListener('change', update);
  allowNegative.addEventListener('change', update);
  update();
}
