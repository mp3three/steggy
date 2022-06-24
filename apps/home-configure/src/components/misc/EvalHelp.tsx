import { tNestedObject } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Collapse,
  Empty,
  Form,
  List,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export function EvalHelp(props: { addVariable: (variable: string) => void }) {
  const [data, setData] = useState<tNestedObject>({});

  async function loadData(): Promise<void> {
    setData(
      await sendRequest({
        url: `/debug/data-all`,
      }),
    );
  }

  useEffect(() => {
    loadData();
  }, []);
  const entries = Object.entries(data);

  return (
    <Form.Item>
      <Tabs>
        <Tabs.TabPane tab="Injected Variables" key="b">
          <div style={{ textAlign: 'right' }}>
            <Tooltip title="Click to reload values">
              <Button type="text" size="small" onClick={() => loadData()}>
                {FD_ICONS.get('refresh')}
              </Button>
            </Tooltip>
          </div>
          <Collapse>
            {entries
              .sort(([a], [b]) => (a > b ? UP : DOWN))
              .map(([name, value]) => (
                <Collapse.Panel key={`domain_${name}`} header={name}>
                  {is.empty(value) ? (
                    // If anything else is empty, it would have been omitted
                    <Empty description="No numeric secrets provided" />
                  ) : (
                    <List
                      pagination={{ simple: true, size: 'small' }}
                      dataSource={Object.entries(value)
                        .flatMap(([label, value]) =>
                          is.object(value)
                            ? Object.entries(value).map(([key, value]) => [
                                `${label}.${key}`,
                                value,
                              ])
                            : [[label, value]],
                        )
                        .sort(([a], [b]) => (a > b ? UP : DOWN))}
                      renderItem={([label, value]: [string, number]) => (
                        <List.Item>
                          <List.Item.Meta
                            title={
                              <Button
                                type="text"
                                size="small"
                                onClick={() =>
                                  props.addVariable(`${name}.${label}`)
                                }
                              >
                                {label}
                              </Button>
                            }
                          />
                          <Button
                            type="text"
                            size="small"
                            onClick={() =>
                              props.addVariable(`${name}.${label}`)
                            }
                          >
                            <Typography.Text code>{value}</Typography.Text>
                          </Button>
                        </List.Item>
                      )}
                    />
                  )}
                </Collapse.Panel>
              ))}
          </Collapse>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Extra Notes">
          <List>
            <List.Item>Code does not have network access</List.Item>
            <List.Item>250ms timeout</List.Item>
          </List>
        </Tabs.TabPane>
      </Tabs>
    </Form.Item>
  );
}
