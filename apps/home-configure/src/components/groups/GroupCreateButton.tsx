import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import { TitleCase } from '@steggy/utilities';
import { Button, Form, Popconfirm, Select, Typography } from 'antd';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export function GroupCreateButton(props: {
  highlight: boolean;
  onUpdate: (group: GroupDTO) => void;
}) {
  const [type, setSetType] = useState<string>('');

  async function create(): Promise<void> {
    try {
      const group = await sendRequest<GroupDTO>({
        body: {
          friendlyName: `New ${TitleCase(type)} Group`,
          type,
        } as Partial<GroupDTO>,
        method: 'post',
        url: `/group`,
      });
      props.onUpdate(group);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Popconfirm
      icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
      onConfirm={() => create()}
      placement="bottomRight"
      title={
        <Form.Item label="Group Type" name="type" rules={[{ required: true }]}>
          <Select
            value={type}
            onChange={type => setSetType(type)}
            style={{ width: '150px' }}
          >
            <Select.Option disabled label="select one">
              <Typography.Text type="secondary">Select one</Typography.Text>
            </Select.Option>
            <Select.Option value="light">Light</Select.Option>
            <Select.Option value="fan">Fan</Select.Option>
            <Select.Option value="lock">Lock</Select.Option>
            <Select.Option value="switch">Switch</Select.Option>
            <Select.Option value="group">Group</Select.Option>
            <Select.Option value="room">Room</Select.Option>
            <Select.Option value="people">People</Select.Option>
          </Select>
        </Form.Item>
      }
    >
      <Button
        icon={FD_ICONS.get('plus_box')}
        type={!props.highlight ? 'text' : 'primary'}
        size="small"
      >
        Create new
      </Button>
    </Popconfirm>
  );
}
