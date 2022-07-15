import { CodeDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { CodeSearch, CodeSearchUpdateProps } from './CodeSearch';

export function CodeList(props: {
  code: CodeDTO[];
  onSelect: (code: CodeDTO) => void;
  onUpdate: () => void;
  searchUpdate: (props: CodeSearchUpdateProps) => void;
}) {
  const [friendlyName, setFriendlyName] = useState('');

  async function validate(): Promise<void> {
    try {
      const code = await sendRequest<CodeDTO>({
        body: { friendlyName } as Partial<CodeDTO>,
        method: 'post',
        url: `/code`,
      });
      props.onUpdate();
      props.onSelect(code);
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  async function remove(id: string) {
    await sendRequest({
      method: 'delete',
      url: `/code/${id}`,
    });
    props.onUpdate();
  }

  return (
    <Card
      title={
        <Space>
          <CodeSearch onUpdate={search => props.searchUpdate(search)} />
          <Typography.Text strong>Code</Typography.Text>
        </Space>
      }
      extra={
        <Popconfirm
          icon=""
          onConfirm={() => validate()}
          title={
            <Form.Item
              label="Friendly Name"
              name="friendlyName"
              rules={[{ required: true }]}
            >
              <Input
                value={friendlyName}
                onChange={({ target }) => setFriendlyName(target.value)}
              />
            </Form.Item>
          }
        >
          <Button
            size="small"
            type={is.empty(props.code) ? 'primary' : 'text'}
            icon={FD_ICONS.get('plus_box')}
          >
            Create new
          </Button>
        </Popconfirm>
      }
    >
      <List
        dataSource={props.code}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Button
                  type="text"
                  size="small"
                  onClick={() => props.onSelect(item)}
                >
                  {item.friendlyName}
                </Button>
              }
              description={
                <Typography.Text type="secondary">
                  Last update: {new Date(item.modified).toLocaleString()}
                </Typography.Text>
              }
            />
            <Popconfirm
              title="Are you sure you want to remove this?"
              onConfirm={() => remove(item._id)}
            >
              <Button danger type="text" size="small">
                X
              </Button>
            </Popconfirm>
          </List.Item>
        )}
      />
    </Card>
  );
}
