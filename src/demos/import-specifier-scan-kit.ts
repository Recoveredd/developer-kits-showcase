import { importSourceSample } from '../sample-data';
import { byId, renderPreviewDemoShell } from '../shared';

export function renderDemo(): string {
  return renderPreviewDemoShell(
    'JavaScript source',
    'import-scan-input',
    importSourceSample,
    'Detected specifiers',
    'import-scan-output',
    `<label class="check-control">
      <input id="import-scan-node" type="checkbox" />
      <span>Include Node builtins in package list</span>
    </label>`
  );
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('import-scan-input');
  const includeNodeBuiltins = byId<HTMLInputElement>('import-scan-node');
  const output = byId<HTMLElement>('import-scan-output');
  const { listPackageSpecifiers, scanImportSpecifiers } = await import('import-specifier-scan-kit');

  const update = (): void => {
    const result = scanImportSpecifiers(input.value);
    output.textContent = JSON.stringify(
      {
        packageNames: listPackageSpecifiers(input.value, {
          includeNodeBuiltins: includeNodeBuiltins.checked
        }),
        specifiers: result.specifiers.map((match) => ({
          kind: match.kind,
          specifier: match.specifier,
          span: `${match.specifierStart}-${match.specifierEnd}`
        })),
        issues: result.issues
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  includeNodeBuiltins.addEventListener('change', update);
  update();
}
