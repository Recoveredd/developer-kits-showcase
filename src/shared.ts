export function byId<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element #${id}`);
  }

  return element as TElement;
}

export function parseJson(value: string): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Invalid JSON.'
    };
  }
}

export function renderError(message: string): string {
  return `<div class="error-box">${escapeHtml(message)}</div>`;
}

export function renderPreviewDemoShell(
  inputLabel: string,
  inputId: string,
  inputValue: string,
  outputTitle: string,
  outputId: string,
  controls = ''
): string {
  return `
    <div class="panel input-panel">
      <div class="preview-note">Interactive preview · lazy-loaded from local GitHub-ready source</div>
      <label for="${inputId}">${inputLabel}</label>
      <textarea id="${inputId}" spellcheck="false">${escapeHtml(inputValue)}</textarea>
      ${controls}
    </div>
    <div class="panel output-panel">
      <div class="panel-title">${outputTitle}</div>
      <pre id="${outputId}" class="code-output">Loading preview module...</pre>
    </div>
  `;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
