import { Button, Form, Input, Popconfirm } from 'antd';
import { useState } from 'react';

import { sendRequest } from '../../types';

export function GroupCreateButton(props: {
  groupsUpdated: () => void;
  type: string;
}) {
  const [friendlyName, setFriendlyName] = useState('');

  async function validate(): Promise<void> {
    try {
      await sendRequest({
        body: { friendlyName, type: props.type },
        method: 'post',
        url: `/group`,
      });
      props.groupsUpdated();
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  return (
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
      <Button>Create new</Button>
    </Popconfirm>
  );
}
