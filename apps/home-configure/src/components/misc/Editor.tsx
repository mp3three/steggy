import Editor from '@monaco-editor/react';
import { HALF, SECOND } from '@steggy/utilities';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
let timeout: NodeJS.Timeout;

export function TypedEditor(props: {
  code: string;
  defaultValue?: string;
  onUpdate: (update: string) => void;
}) {
  const [extraTypes, setExtraTypes] = useState<string>('');
  const [code, setCode] = useState<string>(props.code);
  useEffect(() => {
    async function loadTypes() {
      const { types } = await sendRequest<{ types: string }>({
        url: `/debug/editor-types`,
      });
      setExtraTypes(types);
    }
    loadTypes();
  }, []);
  function sendUpdate(update: string): void {
    setCode(update);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => props.onUpdate(update), HALF * HALF * SECOND);
  }
  return (
    <Editor
      theme="vs-dark"
      height="50vh"
      value={code ?? ''}
      beforeMount={({
        languages: {
          typescript: { typescriptDefaults },
        },
      }) => {
        typescriptDefaults.setDiagnosticsOptions(
          // ? 1108 = top level return
          // This is needed because we are only typing the function body, not a whole file
          { diagnosticCodesToIgnore: [1108] },
        );
        typescriptDefaults.addExtraLib(extraTypes, 'home-controller-vm.d.ts');
      }}
      options={{ minimap: { enabled: false } }}
      onChange={value => sendUpdate(value)}
      defaultLanguage="typescript"
      defaultValue={props.defaultValue}
    />
  );
}
