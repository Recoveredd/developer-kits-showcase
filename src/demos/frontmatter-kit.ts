import { arrayToHtmlTable } from 'array-table-kit';
import { hasFrontmatter, stringifyFrontmatter, stripFrontmatter, tryParseFrontmatter } from 'frontmatter-kit';
import type { FrontmatterLanguage, FrontmatterRange } from 'frontmatter-kit';
import { frontmatterSample } from '../sample-data';
import { byId, escapeHtml, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="frontmatter-input">Markdown document</label>
      <textarea id="frontmatter-input" spellcheck="false">${escapeHtml(frontmatterSample)}</textarea>
      <div class="control-row">
        <label for="frontmatter-language">Parse as</label>
        <select id="frontmatter-language">
          <option value="auto" selected>auto</option>
          <option value="yaml">yaml</option>
          <option value="json">json</option>
          <option value="toml">toml</option>
        </select>
      </div>
      <div class="control-row">
        <label for="frontmatter-stringify">Stringify as</label>
        <select id="frontmatter-stringify">
          <option value="yaml" selected>yaml</option>
          <option value="json">json</option>
          <option value="toml">toml</option>
        </select>
      </div>
      <label class="check-control">
        <input id="frontmatter-excerpt" type="checkbox" checked />
        <span>Use excerpt separator</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed front matter</div>
      <div id="frontmatter-summary" class="table-output compact-table-output"></div>
      <div id="frontmatter-output" class="frontmatter-output"></div>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('frontmatter-input');
  const language = byId<HTMLSelectElement>('frontmatter-language');
  const stringifyLanguage = byId<HTMLSelectElement>('frontmatter-stringify');
  const excerpt = byId<HTMLInputElement>('frontmatter-excerpt');
  const summary = byId<HTMLDivElement>('frontmatter-summary');
  const output = byId<HTMLDivElement>('frontmatter-output');

  const update = (): void => {
    const parseLanguage = language.value === 'auto' ? undefined : (language.value as FrontmatterLanguage);
    const parsed = tryParseFrontmatter(input.value, {
      ...(parseLanguage ? { language: parseLanguage } : {}),
      excerptSeparator: excerpt.checked ? '<!-- more -->' : false
    });

    if (!parsed.ok) {
      summary.innerHTML = '';
      output.innerHTML = renderError(parsed.error.message);
      return;
    }

    const result = parsed.result;
    const outputLanguage = stringifyLanguage.value as FrontmatterLanguage;
    const stringified = stringifyFrontmatter(result.attributes, result.body, {
      language: outputLanguage,
      delimiter: outputLanguage === 'toml' ? '+++' : '---'
    });

    summary.innerHTML = arrayToHtmlTable(
      [
        { metric: 'startsWithFrontmatter', value: String(hasFrontmatter(input.value)) },
        { metric: 'completeBlock', value: String(result.hasFrontmatter) },
        { metric: 'language', value: result.language ?? 'none' },
        { metric: 'attributes', value: Object.keys(result.attributes).length },
        { metric: 'diagnostics', value: result.diagnostics.length },
        { metric: 'excerpt', value: result.excerpt ? 'yes' : 'none' },
        { metric: 'strippedBodyLength', value: stripFrontmatter(input.value, { ...(parseLanguage ? { language: parseLanguage } : {}) }).length }
      ],
      { columns: ['metric', 'value'] }
    );

    output.innerHTML = `
      <section>
        <h2>Attributes</h2>
        <pre class="code-output small-code">${escapeHtml(JSON.stringify(result.attributes, null, 2))}</pre>
      </section>
      <section>
        <h2>Diagnostics</h2>
        ${
          result.diagnostics.length > 0
            ? arrayToHtmlTable(
                result.diagnostics.map((diagnostic) => ({
                  severity: diagnostic.severity,
                  code: diagnostic.code,
                  range: diagnostic.range ? formatRange(diagnostic.range) : '-',
                  message: diagnostic.message
                })),
                { columns: ['severity', 'code', 'range', 'message'] }
              )
            : '<p class="empty-state">No diagnostics.</p>'
        }
      </section>
      <section>
        <h2>Ranges</h2>
        ${arrayToHtmlTable(
          Object.entries(result.ranges).map(([name, range]) => ({
            name,
            range: formatRange(range),
            offsets: `${range.start.offset}-${range.end.offset}`
          })),
          { columns: ['name', 'range', 'offsets'] }
        )}
      </section>
      <section>
        <h2>Stringified document</h2>
        <pre class="code-output small-code">${escapeHtml(stringified)}</pre>
      </section>
    `;
  };

  input.addEventListener('input', update);
  language.addEventListener('change', update);
  stringifyLanguage.addEventListener('change', update);
  excerpt.addEventListener('change', update);
  update();
}

function formatRange(range: FrontmatterRange): string {
  return `${range.start.line}:${range.start.column} -> ${range.end.line}:${range.end.column}`;
}
