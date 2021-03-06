import Editor from '@monaco-editor/react';
import { CodeDTO } from '@steggy/controller-shared';
import { FilterDTO, HALF, is, SECOND } from '@steggy/utilities';
import { Alert, Space, Spin, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { CodeCommandHelp } from './CodeCommandHelp';
let timeout: NodeJS.Timeout;
// eslint-disable-next-line radar/cognitive-complexity
export function TypedEditor(props: {
  code: string;
  customExclude?: string[];
  defaultValue?: string;
  extraTypes?: string;
  height?: string;
  noTopLevelReturn?: boolean;
  onUpdate: (update: string) => void;
  secondaryText?: string | JSX.Element;
  type?: 'request' | 'execute';
}) {
  const [extraTypes, setExtraTypes] = useState<string>('');
  /**
   * Current code in editor
   */
  const [code, setCode] = useState<string>(props.code);
  /**
   * Types defined by user in database
   */
  const [customCode, setCustomCode] = useState<CodeDTO[]>([]);

  useEffect(() => {
    async function loadTypes() {
      const { types } = await sendRequest<{ types: string }>({
        url: `/debug/editor-types`,
      });
      setExtraTypes(types);
    }
    loadTypes();
  }, []);

  /**
   * Utilize it as a string with `useEffect`.
   * Each render has `customExclude` passed in as a new array, but will shallow equals
   */
  const exclude = props.customExclude?.join(',') || '';

  useEffect(() => {
    async function loadCustomCode(): Promise<void> {
      const filters = new Set<FilterDTO>();
      if (props.type === 'request') {
        filters.add({ field: 'type', value: 'request' });
      }
      if (!is.empty(exclude)) {
        filters.add({
          field: '_id',
          operation: 'nin',
          // Send it through as an array of values to not include
          value: exclude.split(','),
        });
      }
      const result = await sendRequest<CodeDTO[]>({
        control: { filters },
        url: `/code`,
      });
      setCustomCode(result);
    }
    loadCustomCode();
  }, [exclude, props.type]);

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
          {(props.type ?? 'request') === 'request' ? (
            props.noTopLevelReturn ? undefined : (
              <Tooltip
                placement="left"
                title="Code must return a value to be understood"
              >
                {/* TODO: Click to hide / never show again. Tracked against `person` profile */}
                {/* Only if it bothers me enough to make a ticket */}
                {FD_ICONS.get('information')}
              </Tooltip>
            )
          ) : (
            <CodeCommandHelp />
          )}
        </span>
      </div>
      <Editor
        theme="vs-dark"
        height={props.height ?? '50vh'}
        value={code ?? ''}
        beforeMount={monaco => {
          const {
            languages: { typescript },
          } = monaco;
          const dynamicContent = [
            extraTypes,
            props.extraTypes ?? '',
            ...(props.type === 'execute'
              ? [
                  `/**`,
                  ` * Execute function to stop routine execution`,
                  ` */`,
                  `declare const stop_processing: () => void;`,
                  `/**`,
                  ` * Access the application cache. Useful for temporary storage of whatever`,
                  ` */`,
                  `declare const cacheManager: iCacheManager;`,
                  `/**`,
                  ` * Access internal methods from @steggy`,
                  ` */`,
                  `declare const steggy: iVMBreakoutAPI;`,
                  `/**`,
                  ` * Execute a service call through the home assistant api`,
                  ` */`,
                  `declare const call_service: iCallService;`,
                ]
              : []),
            ...customCode.map(({ code }) => code),
          ].join(`\n`);
          typescript.typescriptDefaults.setDiagnosticsOptions(
            // ? 1108 = top level return
            // This is needed because we are only typing the function body, not a whole file
            //
            // ? 1375 = top level await
            // ? 1378 = related compiler complaining
            // This isn't really "top level", these aren't relevant
            {
              diagnosticCodesToIgnore: props.noTopLevelReturn
                ? [1375, 1378]
                : [1108, 1375, 1378],
            },
          );
          typescript.typescriptDefaults.setExtraLibs([
            {
              content: dynamicContent,
              filePath: 'dynamic-types.d.ts',
            },
          ]);
        }}
        options={{ minimap: { enabled: false } }}
        onChange={value => sendUpdate(value)}
        defaultLanguage="typescript"
        defaultValue={props.defaultValue}
      />
    </Space>
  );
}
