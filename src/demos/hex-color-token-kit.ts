import { colorCssSample } from '../sample-data';
import { byId, renderPreviewDemoShell } from '../shared';

export function renderDemo(): string {
  return renderPreviewDemoShell(
    'CSS input',
    'hex-color-input',
    colorCssSample,
    'Extracted tokens',
    'hex-color-output',
    `<label class="check-control">
      <input id="hex-color-invalid" type="checkbox" checked />
      <span>Include invalid candidates</span>
    </label>`
  );
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('hex-color-input');
  const includeInvalid = byId<HTMLInputElement>('hex-color-invalid');
  const output = byId<HTMLElement>('hex-color-output');
  const { extractHexColorTokens } = await import('hex-color-token-kit');

  const update = (): void => {
    const result = extractHexColorTokens(input.value, { includeInvalid: includeInvalid.checked });
    output.textContent = JSON.stringify(
      {
        valid: result.valid.map((token) => ({
          input: token.input,
          normalized: token.normalized,
          channels: token.channels,
          span: `${token.start}-${token.end}`
        })),
        invalid: result.invalid.map((token) => ({
          input: token.input,
          issues: token.issues.map((issue) => issue.code),
          span: `${token.start}-${token.end}`
        })),
        issues: result.issues
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  includeInvalid.addEventListener('change', update);
  update();
}
