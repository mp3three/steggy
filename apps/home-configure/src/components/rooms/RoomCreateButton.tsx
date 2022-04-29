import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Input, Popconfirm } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

export function GroupCreateButton(props: {
  groupsUpdated: () => void;
  type: string;
}) {
  let form: FormInstance;

  async function validate(): Promise<void> {
    try {
      const values = await form.validateFields();
      values.type = props.type;
      await sendRequest({
        body: values,
        method: 'post',
        url: `/group`,
      });
      form.resetFields();
      props.groupsUpdated();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Popconfirm
      icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
      onConfirm={() => validate()}
      title={
        <Form onFinish={() => validate()} ref={target => (form = target)}>
          <Form.Item
            label="Friendly Name"
            name="friendlyName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      }
    >
      <Button>Create new</Button>
    </Popconfirm>
  );
}
