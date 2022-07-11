import { CodeDTO } from '@steggy/controller-shared';
import {
  Card,
  Descriptions,
  Empty,
  Form,
  Popover,
  Radio,
  Select,
  Tabs,
  Typography,
} from 'antd';

import { TypedEditor } from '../misc';

export function CodeEdit(props: {
  code: CodeDTO;
  onUpdate: (code: Partial<CodeDTO>) => void;
}) {
  if (!props.code) {
    return (
      <Card>
        <Empty description="Select an item to edit" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Typography.Text
          strong
          editable={{ onChange: text => console.log(text) }}
        >
          Code
        </Typography.Text>
      }
    >
      <Tabs>
        <Tabs.TabPane tab="Code" key="code">
          <TypedEditor
            code={props.code?.code ?? ''}
            type={props.code.type}
            onUpdate={code => props.onUpdate({ code })}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Settings" key="settings">
          <Form.Item
            label={
              <Popover
                content={
                  <Descriptions bordered style={{ maxWidth: '35vw' }}>
                    <Descriptions.Item label="When enabled" span={3}>
                      (functions, types, variables, etc) defined here will be
                      made available within UI editors.
                    </Descriptions.Item>
                    <Descriptions.Item label="When disabled" span={3}>
                      Code will never be executed. Good for WIP functionality.
                    </Descriptions.Item>
                  </Descriptions>
                }
              >
                State
              </Popover>
            }
          >
            <Radio.Group value={props.code?.enable?.type ?? 'enable'}>
              <Radio.Button value="enable">Enabled</Radio.Button>
              <Radio.Button value="disable">Disabled</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Usage">
            <Select
              value={props.code.type ?? 'request'}
              onChange={type => props.onUpdate({ type })}
            >
              <Select.Option value="request">
                Retrieve information
              </Select.Option>
              <Select.Option value="execute">Execute command</Select.Option>
            </Select>
          </Form.Item>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
