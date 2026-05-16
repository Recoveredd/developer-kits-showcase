import {
  createColorMatcher,
  type DistanceMode,
  type PaletteEntry
} from 'color-nearest-match-kit';
import { byId, escapeHtml, parseJson, renderError } from '../shared';

const samplePalette = [
  { name: 'brand-blue', value: '#2563eb', meta: { token: 'primary' } },
  { name: 'brand-cyan', value: '#0891b2', meta: { token: 'info' } },
  { name: 'brand-green', value: '#16a34a', meta: { token: 'success' } },
  { name: 'brand-red', value: '#dc2626', meta: { token: 'danger' } },
  { name: 'ink', value: '#111827', meta: { token: 'text' } },
  { name: 'paper', value: '#ffffff', meta: { token: 'surface' } }
];

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="color-match-palette">Palette JSON</label>
      <textarea id="color-match-palette" spellcheck="false">${escapeHtml(JSON.stringify(samplePalette, null, 2))}</textarea>
      <div class="control-grid">
        <div>
          <label for="color-match-input">Color to match</label>
          <input id="color-match-input" type="text" value="#1d4ed8" />
        </div>
        <div>
          <label for="color-match-distance">Distance mode</label>
          <select id="color-match-distance">
            <option value="weighted-rgb">weighted-rgb</option>
            <option value="rgb">rgb</option>
          </select>
        </div>
      </div>
      <label for="color-match-limit">Rank limit</label>
      <input id="color-match-limit" type="number" min="1" max="10" step="1" value="4" />
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Nearest palette matches</div>
      <div id="color-match-summary" class="table-output compact-table-output"></div>
      <div id="color-match-swatches" class="color-match-grid"></div>
      <pre id="color-match-output" class="code-output small-code"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const paletteInput = byId<HTMLTextAreaElement>('color-match-palette');
  const colorInput = byId<HTMLInputElement>('color-match-input');
  const distanceInput = byId<HTMLSelectElement>('color-match-distance');
  const limitInput = byId<HTMLInputElement>('color-match-limit');
  const summary = byId<HTMLDivElement>('color-match-summary');
  const swatches = byId<HTMLDivElement>('color-match-swatches');
  const output = byId<HTMLElement>('color-match-output');

  const update = (): void => {
    const parsed = parseJson(paletteInput.value);

    if (!parsed.ok) {
      summary.innerHTML = renderError(parsed.message);
      swatches.innerHTML = '';
      output.textContent = '';
      return;
    }

    if (!Array.isArray(parsed.data)) {
      summary.innerHTML = renderError('Palette JSON must be an array of { name, value } entries.');
      swatches.innerHTML = '';
      output.textContent = '';
      return;
    }

    const palette = parsed.data as PaletteEntry[];
    const matcher = createColorMatcher(palette);
    const limit = Number(limitInput.value);
    const distance = distanceInput.value as DistanceMode;
    const result = matcher.rank(colorInput.value, { distance, limit });

    if (!result.ok) {
      summary.innerHTML = renderError(result.message);
      swatches.innerHTML = '';
      output.textContent = JSON.stringify(result, null, 2);
      return;
    }

    const [nearest] = result.matches;
    summary.innerHTML = nearest
      ? `<table><tbody>
          <tr><th>Input</th><td>${escapeHtml(colorInput.value)}</td></tr>
          <tr><th>Nearest</th><td>${escapeHtml(nearest.name)}</td></tr>
          <tr><th>Distance</th><td>${nearest.distance.toFixed(2)}</td></tr>
          <tr><th>Palette size</th><td>${matcher.size}</td></tr>
        </tbody></table>`
      : renderError('No palette entries were available.');

    swatches.innerHTML = result.matches
      .map(
        (match, index) => `
          <article class="color-match-card">
            <span class="color-match-rank">#${index + 1}</span>
            <span class="color-swatch" style="background:${match.value}"></span>
            <strong>${escapeHtml(match.name)}</strong>
            <code>${escapeHtml(match.value)}</code>
            <span>${match.distance.toFixed(2)}</span>
          </article>`
      )
      .join('');

    output.textContent = JSON.stringify(result, null, 2);
  };

  paletteInput.addEventListener('input', update);
  colorInput.addEventListener('input', update);
  distanceInput.addEventListener('change', update);
  limitInput.addEventListener('input', update);
  update();
}
