import { tNestedObject } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Collapse,
  Descriptions,
  Empty,
  Form,
  List,
  Popover,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export function MathExample(props: {
  addVariable: (variable: string) => void;
}) {
  const [data, setData] = useState<tNestedObject>({});

  async function loadData(): Promise<void> {
    setData(
      await sendRequest({
        url: `/debug/data-math`,
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
                    <Descriptions bordered>
                      {Object.entries(value)
                        .flatMap(([label, value]) =>
                          is.object(value)
                            ? Object.entries(value).map(([key, value]) => [
                                `${label}.${key}`,
                                value,
                              ])
                            : [[label, value]],
                        )
                        .map(([label, value]: [string, number]) => (
                          <Descriptions.Item
                            key={`domain_${name}_${label}`}
                            label={
                              <Popover
                                title={
                                  <>
                                    {'Click to add variable: '}
                                    <Typography.Text code>
                                      {name}.{label}
                                    </Typography.Text>
                                  </>
                                }
                                content={
                                  <>
                                    Current Value:
                                    <Typography.Text code>
                                      {value}
                                    </Typography.Text>
                                  </>
                                }
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() =>
                                    props.addVariable(`${name}.${label}`)
                                  }
                                >
                                  {label}
                                </Button>
                              </Popover>
                            }
                            span={3}
                          >
                            {value}
                          </Descriptions.Item>
                        ))}
                    </Descriptions>
                  )}
                </Collapse.Panel>
              ))}
          </Collapse>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Extra Documentation">
          <List>
            <List.Item>
              <Typography.Link
                target="_blank"
                href="https://mathjs.org/docs/expressions/syntax.html"
              >
                Math expression syntax
              </Typography.Link>
            </List.Item>
          </List>
        </Tabs.TabPane>
      </Tabs>
    </Form.Item>
  );
}
