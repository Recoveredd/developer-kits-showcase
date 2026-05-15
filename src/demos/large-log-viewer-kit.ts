import { arrayToHtmlTable } from 'array-table-kit';
import {
  createLogDocument,
  getLogLineScrollTop,
  renderLogLineHtml,
  stripAnsi
} from 'large-log-viewer-kit';
import type { LogDocument, LogSearchMatch } from 'large-log-viewer-kit';
import { byId, escapeHtml, formatNumber } from '../shared';

const rowHeight = 24;
const sampleLog = createSyntheticLog(1_200);

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="large-log-input">Log text</label>
      <textarea id="large-log-input" class="large-log-input" spellcheck="false">${escapeHtml(sampleLog)}</textarea>
      <div class="control-row">
        <label for="large-log-search">Search query</label>
        <input id="large-log-search" value="ERROR" spellcheck="false" />
      </div>
      <div class="control-row">
        <label for="large-log-jump">Jump to line</label>
        <input id="large-log-jump" value="420" inputmode="numeric" />
      </div>
      <div class="large-log-actions">
        <button id="large-log-sample-small" type="button">1,200 lines</button>
        <button id="large-log-sample-large" type="button">75,000 lines</button>
      </div>
      <label class="check-control">
        <input id="large-log-ansi" type="checkbox" checked />
        <span>Render ANSI color classes</span>
      </label>
      <label class="check-control">
        <input id="large-log-case" type="checkbox" />
        <span>Case-sensitive search</span>
      </label>
    </div>
    <div class="panel output-panel large-log-panel">
      <div class="panel-title">Virtualized log viewer</div>
      <div id="large-log-stats" class="table-output compact-table-output"></div>
      <div id="large-log-scroll" class="large-log-scroll" aria-label="Virtualized log output" tabindex="0">
        <div id="large-log-spacer" class="large-log-spacer">
          <div id="large-log-rows" class="large-log-rows"></div>
        </div>
      </div>
      <div id="large-log-search-results" class="large-log-search-results"></div>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('large-log-input');
  const query = byId<HTMLInputElement>('large-log-search');
  const jump = byId<HTMLInputElement>('large-log-jump');
  const ansi = byId<HTMLInputElement>('large-log-ansi');
  const caseSensitive = byId<HTMLInputElement>('large-log-case');
  const smallSample = byId<HTMLButtonElement>('large-log-sample-small');
  const largeSample = byId<HTMLButtonElement>('large-log-sample-large');
  const stats = byId<HTMLDivElement>('large-log-stats');
  const scroll = byId<HTMLDivElement>('large-log-scroll');
  const spacer = byId<HTMLDivElement>('large-log-spacer');
  const rows = byId<HTMLDivElement>('large-log-rows');
  const results = byId<HTMLDivElement>('large-log-search-results');

  let document = createLogDocument(input.value);
  let lastMatches: LogSearchMatch[] = [];

  const rebuild = (): void => {
    document = createLogDocument(input.value);
    scroll.scrollTop = Math.min(scroll.scrollTop, Math.max(0, document.lineCount * rowHeight - scroll.clientHeight));
    renderStats(document);
    renderWindow(document);
    runSearch(document);
  };

  const rerender = (): void => {
    renderWindow(document);
    runSearch(document);
  };

  function renderStats(current: LogDocument): void {
    stats.innerHTML = arrayToHtmlTable(
      [
        { metric: 'lines', value: formatNumber(current.lineCount) },
        { metric: 'source length', value: formatNumber(current.length) },
        { metric: 'diagnostics', value: current.diagnostics.length > 0 ? current.diagnostics.join(', ') : 'none' },
        { metric: 'rendered rows', value: `${formatNumber(current.getWindow(readWindowRequest()).rows.length)} visible only` }
      ],
      { columns: ['metric', 'value'] }
    );
  }

  function readWindowRequest() {
    return {
      scrollTop: scroll.scrollTop,
      viewportHeight: scroll.clientHeight || 420,
      rowHeight,
      overscan: 8
    };
  }

  function renderWindow(current: LogDocument): void {
    const window = current.getWindow(readWindowRequest());
    spacer.style.height = `${window.totalHeight}px`;
    rows.style.transform = `translateY(${window.offsetTop}px)`;
    rows.innerHTML = window.rows
      .map((line) => {
        const html = renderLogLineHtml(line.text, {
          ansi: ansi.checked,
          highlightQuery: query.value,
          caseSensitiveHighlight: caseSensitive.checked
        });

        return `<div class="large-log-row" style="height: ${rowHeight}px">
          <span class="large-log-line-number">${line.lineNumber}</span>
          <code>${html}</code>
        </div>`;
      })
      .join('');
  }

  function runSearch(current: LogDocument): void {
    const value = query.value;

    if (value.length === 0) {
      lastMatches = [];
      results.innerHTML = '<p class="empty-state">Enter a query to preview chunked search results.</p>';
      return;
    }

    const startedAt = performance.now();
    const search = current.createSearch(value, {
      caseSensitive: caseSensitive.checked,
      includeLineText: true,
      maxResults: 100
    });
    let steps = 0;

    while (!search.done) {
      search.next(2_500);
      steps += 1;
    }

    lastMatches = search.results;
    const duration = Math.max(0, performance.now() - startedAt);
    const preview = lastMatches.slice(0, 8);

    results.innerHTML = `
      <div class="large-log-result-meta">
        <strong>${formatNumber(lastMatches.length)} matches</strong>
        <span>${formatNumber(search.searchedLineCount)} lines scanned in ${steps} chunks, ${duration.toFixed(1)} ms</span>
      </div>
      ${
        preview.length > 0
          ? `<ol>${preview
              .map(
                (match) => `<li>
                  <button type="button" data-line="${match.lineNumber}">line ${match.lineNumber}</button>
                  <code>${escapeHtml(trimPreview(stripAnsi(match.lineText ?? '')))}</code>
                </li>`
              )
              .join('')}</ol>`
          : '<p class="empty-state">No match in this log.</p>'
      }
    `;
  }

  input.addEventListener('input', rebuild);
  query.addEventListener('input', rerender);
  ansi.addEventListener('change', rerender);
  caseSensitive.addEventListener('change', rerender);
  scroll.addEventListener('scroll', () => {
    renderWindow(document);
    renderStats(document);
  });
  jump.addEventListener('change', () => {
    const lineNumber = Number(jump.value);
    scroll.scrollTop = getLogLineScrollTop(Number.isFinite(lineNumber) ? lineNumber : 1, rowHeight);
    renderWindow(document);
  });
  smallSample.addEventListener('click', () => {
    input.value = createSyntheticLog(1_200);
    rebuild();
  });
  largeSample.addEventListener('click', () => {
    input.value = createSyntheticLog(75_000);
    rebuild();
  });
  results.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const lineNumber = Number(target.dataset.line);
    if (!Number.isFinite(lineNumber)) return;

    jump.value = String(lineNumber);
    scroll.scrollTop = getLogLineScrollTop(lineNumber, rowHeight);
    renderWindow(document);
  });

  renderStats(document);
  renderWindow(document);
  runSearch(document);
}

function createSyntheticLog(lineCount: number): string {
  return Array.from({ length: lineCount }, (_, index) => {
    const lineNumber = index + 1;
    const timestamp = `2026-05-14T${String(Math.floor(index / 3) % 24).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00.000Z`;

    if (lineNumber % 137 === 0) {
      return `\x1b[31mERROR\x1b[0m ${timestamp} worker-${lineNumber % 8} failed to process job-${lineNumber}`;
    }

    if (lineNumber % 41 === 0) {
      return `\x1b[33mWARN\x1b[0m ${timestamp} queue latency ${120 + (lineNumber % 30)}ms on shard-${lineNumber % 5}`;
    }

    return `INFO ${timestamp} request completed status=200 path=/api/items/${lineNumber} duration=${20 + (lineNumber % 80)}ms`;
  }).join('\n');
}

function trimPreview(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}
