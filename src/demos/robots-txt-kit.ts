import { arrayToHtmlTable } from 'array-table-kit';
import {
  checkRobotsTxt,
  listRobotsTxtSitemaps,
  parseRobotsTxt
} from 'robots-txt-kit';
import { byId, renderError } from '../shared';

const sampleRobots = `User-agent: *
Disallow: /private
Allow: /private/public
Disallow: /caf%C3%A9
Crawl-delay: 2.5

User-agent: Googlebot
Disallow: /nogoogle
Allow: /nogoogle/news$

Sitemap: https://example.com/sitemap.xml`;

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="robots-input">robots.txt</label>
      <textarea id="robots-input" spellcheck="false">${sampleRobots}</textarea>
      <div class="control-grid">
        <div>
          <label for="robots-url">URL or path</label>
          <input id="robots-url" value="/private/public/page" />
        </div>
        <div>
          <label for="robots-agent">User agent</label>
          <input id="robots-agent" value="Googlebot-News" />
        </div>
      </div>
      <label class="check-control">
        <input id="robots-default" type="checkbox" checked />
        <span>Allow by default</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Crawl decision</div>
      <div id="robots-summary" class="table-output compact-table-output"></div>
      <div id="robots-groups" class="table-output compact-table-output"></div>
      <pre id="robots-json" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('robots-input');
  const url = byId<HTMLInputElement>('robots-url');
  const agent = byId<HTMLInputElement>('robots-agent');
  const defaultAllowed = byId<HTMLInputElement>('robots-default');
  const summary = byId<HTMLDivElement>('robots-summary');
  const groups = byId<HTMLDivElement>('robots-groups');
  const output = byId<HTMLElement>('robots-json');

  const update = (): void => {
    const parsed = parseRobotsTxt(input.value);
    const decision = checkRobotsTxt(input.value, url.value, {
      userAgent: agent.value,
      defaultAllowed: defaultAllowed.checked
    });
    const sitemaps = listRobotsTxtSitemaps(input.value);

    if (!parsed.ok && parsed.document.groups.length === 0) {
      summary.innerHTML = renderError(parsed.diagnostics[0]?.message ?? 'robots.txt could not be parsed.');
    } else {
      summary.innerHTML = arrayToHtmlTable(
        [
          { field: 'allowed', value: String(decision.allowed) },
          { field: 'path', value: decision.path },
          { field: 'selected agents', value: decision.group?.agents.join(', ') ?? '-' },
          { field: 'matched rule', value: decision.rule ? `${decision.rule.type}: ${decision.rule.path}` : '-' },
          { field: 'diagnostics', value: String(decision.diagnostics.length) },
          { field: 'sitemaps', value: String(sitemaps.length) }
        ],
        { columns: ['field', 'value'] }
      );
    }

    groups.innerHTML =
      parsed.document.groups.length > 0
        ? arrayToHtmlTable(
            parsed.document.groups.map((group, index) => ({
              index: String(index + 1),
              agents: group.agents.join(', '),
              rules: String(group.rules.length),
              delay: group.crawlDelay ?? '-'
            })),
            { columns: ['index', 'agents', 'rules', 'delay'] }
          )
        : parsed.diagnostics.length > 0
          ? arrayToHtmlTable(
              parsed.diagnostics.map((item) => ({
                code: item.code,
                line: item.line ?? '-',
                directive: item.directive ?? '-'
              })),
              { columns: ['code', 'line', 'directive'] }
            )
          : '<p class="empty-state">No groups.</p>';

    output.textContent = JSON.stringify({ parsed, decision, sitemaps }, null, 2);
  };

  input.addEventListener('input', update);
  url.addEventListener('input', update);
  agent.addEventListener('input', update);
  defaultAllowed.addEventListener('change', update);
  update();
}
