import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import { Button, Form, FormInstance, Input, Popconfirm } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

export class GroupCreateButton extends React.Component<{
  onUpdate: (group: GroupDTO) => void;
  type: string;
}> {
  override state = { modalVisible: false };
  private form: FormInstance;

  override render() {
    return (
      <Popconfirm
        icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
        onConfirm={this.validate.bind(this)}
        title={
          <Form
            onFinish={this.validate.bind(this)}
            ref={form => (this.form = form)}
          >
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
        <Button icon={<PlusBoxMultiple />} size="small">
          Create new
        </Button>
      </Popconfirm>
    );
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      values.type = this.props.type;
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group`,
      });
      this.form.resetFields();
      this.props.onUpdate(group);
    } catch (error) {
      console.error(error);
    }
  }
}
