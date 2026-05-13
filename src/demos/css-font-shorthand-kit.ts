import { byId } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="font-input">CSS font shorthand</label>
      <input id="font-input" value='italic 700 1rem/1.4 "Inter", system-ui' />
      <label for="font-family-input">Font-family list</label>
      <input id="font-family-input" value='"Inter", system-ui, sans-serif' />
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed font</div>
      <pre id="font-output" class="code-output">Rendering demo...</pre>
    </div>
  `;
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('font-input');
  const familyInput = byId<HTMLInputElement>('font-family-input');
  const output = byId<HTMLElement>('font-output');
  const { formatFontShorthand, parseFontFamilyList, parseFontShorthand } = await import('css-font-shorthand-kit');

  const update = (): void => {
    const parsed = parseFontShorthand(input.value);
    output.textContent = JSON.stringify(
      {
        shorthand: parsed,
        formatted: parsed.ok ? formatFontShorthand(parsed.value) : null,
        families: parseFontFamilyList(familyInput.value)
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  familyInput.addEventListener('input', update);
  update();
}
