import { byId } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="price-input">Price input</label>
      <input id="price-input" value="CHF 1’234.50" />
      <div class="control-row">
        <label for="price-decimal">Decimal separator</label>
        <select id="price-decimal">
          <option value="auto" selected>auto</option>
          <option value=".">dot</option>
          <option value=",">comma</option>
        </select>
      </div>
      <label class="check-control">
        <input id="price-negative" type="checkbox" checked />
        <span>Allow negative values</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Parsed price</div>
      <pre id="price-output" class="code-output">Rendering demo...</pre>
    </div>
  `;
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLInputElement>('price-input');
  const decimal = byId<HTMLSelectElement>('price-decimal');
  const allowNegative = byId<HTMLInputElement>('price-negative');
  const output = byId<HTMLElement>('price-output');
  const { parseLocalizedPrice } = await import('localized-price-parse-kit');

  const update = (): void => {
    output.textContent = JSON.stringify(
      parseLocalizedPrice(input.value, {
        decimalSeparator: decimal.value as '.' | ',' | 'auto',
        allowNegative: allowNegative.checked
      }),
      null,
      2
    );
  };

  input.addEventListener('input', update);
  decimal.addEventListener('change', update);
  allowNegative.addEventListener('change', update);
  update();
}
