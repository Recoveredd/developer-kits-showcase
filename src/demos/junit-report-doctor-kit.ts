import { arrayToHtmlTable } from 'array-table-kit';
import { inspectJunitXml, parseJunitXml } from '../../../junit-report-doctor-kit/src/index';
import type { JunitInspectOptions } from '../../../junit-report-doctor-kit/src/index';
import { byId, escapeHtml, renderError } from '../shared';

const sampleXml = `<?xml version="1.0"?>
<j:testsuites xmlns:j="urn:junit" tests="3" failures="0" errors="0" skipped="0">
  <j:testsuite name="checkout" tests="2" failures="0" errors="0" skipped="0" time="1.25">
    <j:properties>
      <j:property name="ci.provider" value="synthetic" />
    </j:properties>
    <j:testcase classname="cart.checkout" name="accepts coupon" time="0.24" />
    <j:testcase classname="cart.checkout" name="rejects expired card" time="0.41" file="artifacts/card.png">
      <j:failure type="AssertionError" message="expected card to be accepted"><![CDATA[
        expected: paid
        received: declined
      ]]></j:failure>
      <j:system-out>[[ATTACHMENT|artifacts/card.png]]</j:system-out>
    </j:testcase>
    <j:testsuite name="nested shard">
      <j:testcase name="nested passes" time="0.05" />
    </j:testsuite>
  </j:testsuite>
  <j:system-out>root output</j:system-out>
</j:testsuites>`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="junit-input">JUnit XML report</label>
      <textarea id="junit-input" spellcheck="false">${escapeHtml(sampleXml)}</textarea>
      <label class="check-control">
        <input id="junit-strict" type="checkbox" checked />
        <span>Strict counters</span>
      </label>
      <label class="check-control">
        <input id="junit-whitespace" type="checkbox" />
        <span>Preserve whitespace</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">JUnit report diagnostics</div>
      <p class="empty-state">The sample intentionally contains a counter mismatch, a namespace, a nested suite, and attachment metadata.</p>
      <div id="junit-summary" class="table-output compact-table-output"></div>
      <div id="junit-diagnostics" class="table-output compact-table-output"></div>
      <pre id="junit-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('junit-input');
  const strictCounters = byId<HTMLInputElement>('junit-strict');
  const preserveWhitespace = byId<HTMLInputElement>('junit-whitespace');
  const summary = byId<HTMLDivElement>('junit-summary');
  const diagnostics = byId<HTMLDivElement>('junit-diagnostics');
  const output = byId<HTMLElement>('junit-output');

  const update = (): void => {
    const options: JunitInspectOptions = {
      strictCounters: strictCounters.checked,
      preserveWhitespace: preserveWhitespace.checked
    };
    const result = inspectJunitXml(input.value, options);
    const parseHelper = getParseHelper(input.value, options);

    diagnostics.innerHTML =
      result.diagnostics.length > 0
        ? arrayToHtmlTable(
            result.diagnostics.map((diagnostic) => ({
              severity: diagnostic.severity,
              code: diagnostic.code,
              path: diagnostic.path,
              message: diagnostic.message
            })),
            { columns: ['severity', 'code', 'path', 'message'] }
          )
        : '<p class="empty-state">No diagnostics.</p>';

    if (!result.report) {
      summary.innerHTML = renderError('Unable to normalize this JUnit report.');
      output.textContent = JSON.stringify({ ok: result.ok, diagnostics: result.diagnostics, parseHelper }, null, 2);
      return;
    }

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'ok', value: String(result.ok) },
        { metric: 'suites', value: result.report.summary.suites },
        { metric: 'tests', value: result.report.summary.tests },
        { metric: 'passed', value: result.report.summary.passed },
        { metric: 'failures', value: result.report.summary.failures },
        { metric: 'errors', value: result.report.summary.errors },
        { metric: 'skipped', value: result.report.summary.skipped },
        { metric: 'durationMs', value: result.report.summary.durationMs },
        { metric: 'hints', value: result.report.dialectHints.join(', ') || '-' }
      ],
      { columns: ['metric', 'value'] }
    );

    output.textContent = JSON.stringify(
      {
        ok: result.ok,
        options,
        parseHelper,
        summary: result.report.summary,
        suites: result.report.suites.map((suite) => ({
          name: suite.name,
          tests: suite.tests,
          failures: suite.failures,
          errors: suite.errors,
          skipped: suite.skipped,
          attachments: suite.attachments,
          cases: suite.cases.map((testCase) => ({
            name: testCase.name,
            status: testCase.status,
            durationMs: testCase.durationMs,
            attachments: testCase.attachments,
            failureMessages: testCase.failureMessages
          }))
        }))
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  strictCounters.addEventListener('change', update);
  preserveWhitespace.addEventListener('change', update);
  update();
}

function getParseHelper(input: string, options: JunitInspectOptions): { canParse: boolean; error?: string } {
  try {
    parseJunitXml(input, options);
    return { canParse: true };
  } catch (error) {
    return {
      canParse: false,
      error: error instanceof Error ? error.message : 'Unknown parse error.'
    };
  }
}
