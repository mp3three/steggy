import { CodeDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Popover,
  Radio,
  Select,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { TypedEditor } from '../misc';

export function CodeEdit(props: {
  code: CodeDTO;
  onUpdate: (code: Partial<CodeDTO>) => void;
}) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const tags = props.code?.tags ?? [];

  useEffect(() => {
    async function refresh() {
      const response = await sendRequest<{ tags: string[] }>({
        url: `/code/tags`,
      });
      setAllTags(response.tags);
    }
    refresh();
  }, [props.code?._id]);
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
          editable={{
            onChange: friendlyName => props.onUpdate({ friendlyName }),
          }}
        >
          {props.code.friendlyName}
        </Typography.Text>
      }
    >
      <Tabs>
        <Tabs.TabPane tab="Code" key="code">
          <TypedEditor
            key={props.code?._id}
            code={props.code?.code ?? ''}
            type={props.code.type}
            noTopLevelReturn
            onUpdate={code => props.onUpdate({ code })}
            customExclude={[props.code._id]}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Settings" key="settings">
          <Form labelCol={{ span: 4 }}>
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
            <Form.Item label="Tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                value={[...tags]}
                onChange={value => props.onUpdate({ tags: is.unique(value) })}
              >
                {allTags.map(tag => (
                  <Select.Option value={tag} key={tag}>
                    {tag}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Priority">
              <Input
                type="number"
                key={props.code?._id}
                defaultValue={props.code.priority}
                onBlur={({ target }) =>
                  props.onUpdate({ priority: Number(target.value) })
                }
              />
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
