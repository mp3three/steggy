import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@automagical/controller-shared';
import { Button, Form, FormInstance, Input, Popconfirm } from 'antd';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';

export const GroupCreateButton = withRouter(
  class extends React.Component<
    {
      groupsUpdated: () => void;
      type: string;
    } & RouteComponentProps
  > {
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
        const group = await sendRequest<GroupDTO>(`/group`, {
          body: JSON.stringify(values),
          method: 'post',
        });
        this.form.resetFields();
        this.props.groupsUpdated();
        this.props.history.push(`/group/${group._id}`);
      } catch (error) {
        console.error(error);
      }
    }
  },
);
