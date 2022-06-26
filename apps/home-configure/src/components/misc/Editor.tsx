import Editor from '@monaco-editor/react';
import { HALF, is, SECOND } from '@steggy/utilities';
import { Alert, Space, Spin, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
let timeout: NodeJS.Timeout;

// const files = require.context(
//   '!!raw-loader!/node_modules/@alfresco/js-api/typings/src/',
//   true,
//   /\.d.ts$/,
// );
export function TypedEditor(props: {
  code: string;
  defaultValue?: string;
  onUpdate: (update: string) => void;
  secondaryText: string | JSX.Element;
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

  // The race condition stopper
  if (is.empty(extraTypes)) {
    return (
      <Spin tip="Loading...">
        <Alert
          message="Loading definitions"
          description="Capturing from the current system state"
          type="info"
        />
      </Spin>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <Typography.Text type="secondary">
          {props.secondaryText}
        </Typography.Text>
        <span style={{ float: 'right' }}>
          <Tooltip
            placement="left"
            title="Code must return a value to be understood"
          >
            {/* TODO: Click to hide / never show again. Tracked against `person` profile */}
            {/* Only if it bothers me enough to make a ticket */}
            {FD_ICONS.get('information')}
          </Tooltip>
        </span>
      </div>
      <Editor
        theme="vs-dark"
        height="50vh"
        value={code ?? ''}
        beforeMount={({ languages: { typescript } }) => {
          // typescript.typescriptDefaults.setCompilerOptions({
          //   moduleResolution: typescript.ModuleResolutionKind.NodeJs,
          // });
          typescript.typescriptDefaults.setDiagnosticsOptions(
            // ? 1108 = top level return
            // This is needed because we are only typing the function body, not a whole file
            { diagnosticCodesToIgnore: [1108] },
          );
          typescript.typescriptDefaults.addExtraLib(
            extraTypes,
            'home-controller-vm.d.ts',
          );
        }}
        options={{ minimap: { enabled: false } }}
        onChange={value => sendUpdate(value)}
        defaultLanguage="typescript"
        defaultValue={props.defaultValue}
      />
    </Space>
  );
}
