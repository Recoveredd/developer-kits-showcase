import { deletePathImmutable, getPath, normalizePath, parsePath } from 'object-path-kit';
import { reportSample } from '../sample-data';
import { byId, escapeHtml, parseJson } from '../shared';

export function renderDemo(): string {
  const jsonValue = escapeHtml(JSON.stringify(reportSample, null, 2));

  return `
    <div class="panel input-panel">
      <label for="object-path-input">Object</label>
      <textarea id="object-path-input" spellcheck="false">${jsonValue}</textarea>
      <label for="object-path-query">Path</label>
      <input id="object-path-query" value='customer["name"]' />
      <label class="check-control">
        <input id="object-path-delete" type="checkbox" />
        <span>Preview immutable delete</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Path result</div>
      <pre id="object-path-output" class="code-output"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const input = byId<HTMLTextAreaElement>('object-path-input');
  const path = byId<HTMLInputElement>('object-path-query');
  const deleteMode = byId<HTMLInputElement>('object-path-delete');
  const output = byId<HTMLElement>('object-path-output');

  const update = (): void => {
    const value = parseJson(input.value);

    if (!value.ok) {
      output.textContent = value.message;
      return;
    }

    try {
      const nextValue = deleteMode.checked
        ? deletePathImmutable(value.data, path.value)
        : undefined;

      output.textContent = JSON.stringify(
        {
          normalized: normalizePath(path.value),
          segments: parsePath(path.value),
          value: getPath(value.data, path.value, null),
          ...(deleteMode.checked ? { afterDelete: nextValue } : {})
        },
        null,
        2
      );
    } catch (error) {
      output.textContent = error instanceof Error ? error.message : 'Unknown path error.';
    }
  };

  input.addEventListener('input', update);
  path.addEventListener('input', update);
  deleteMode.addEventListener('change', update);
  update();
}
