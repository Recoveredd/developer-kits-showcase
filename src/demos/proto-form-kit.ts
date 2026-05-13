import { protoSample } from '../sample-data';
import { byId, renderPreviewDemoShell } from '../shared';

export function renderDemo(): string {
  return renderPreviewDemoShell(
    'Protocol Buffer source',
    'proto-input',
    protoSample,
    'Form metadata',
    'proto-output',
    `<div class="control-row">
      <label for="proto-method">Method</label>
      <input id="proto-method" value="ProductCatalog.ListProducts" />
    </div>`
  );
}

export async function bindDemo(): Promise<void> {
  const input = byId<HTMLTextAreaElement>('proto-input');
  const methodInput = byId<HTMLInputElement>('proto-method');
  const output = byId<HTMLElement>('proto-output');
  const { createProtoMethodExample, parseProtoFormSchema } = await import('../../../proto-form-kit/src/index.ts');

  const update = (): void => {
    const schema = parseProtoFormSchema(input.value);
    const [serviceName = '', methodName = ''] = methodInput.value.split('.');
    const methodExample = serviceName && methodName
      ? createProtoMethodExample(schema, serviceName, methodName)
      : null;

    output.textContent = JSON.stringify(
      {
        ok: schema.ok,
        packageName: schema.packageName,
        messages: schema.messages.map((message) => ({
          name: message.fullName,
          fields: message.fields.map((field) => ({
            name: field.name,
            jsonName: field.jsonName,
            type: field.type,
            control: field.control,
            enumValues: field.enumValues
          }))
        })),
        services: schema.services,
        methodExample,
        diagnostics: schema.diagnostics
      },
      null,
      2
    );
  };

  input.addEventListener('input', update);
  methodInput.addEventListener('input', update);
  update();
}
