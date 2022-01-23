import { TitleCase } from '@text-based/utilities';
import {
  Button,
  Form,
  FormInstance,
  Input,
  Layout,
  Modal,
  Radio,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

enum GROUP_TYPES {
  light = 'light',
  fan = 'fan',
  switch = 'switch',
  lock = 'lock',
}

const { Sider } = Layout;

export class GroupListSidebar extends React.Component<{
  groupsUpdated: () => void;
}> {
  override state = { modalVisible: false };
  private form: FormInstance;

  override render() {
    return (
      <>
        <Sider>
          <Button onClick={this.show.bind(this)}>Create new</Button>
        </Sider>
        <Modal
          forceRender
          title="Basic Modal"
          visible={this.state.modalVisible}
          onOk={this.validate.bind(this)}
          onCancel={this.hide.bind(this)}
        >
          <Form
            onFinish={this.validate.bind(this)}
            layout="vertical"
            ref={form => (this.form = form)}
          >
            <Form.Item
              label="Group Type"
              name="type"
              rules={[{ required: true }]}
            >
              <Radio.Group value={GROUP_TYPES.light}>
                {Object.keys(GROUP_TYPES).map(type => (
                  <Radio.Button value={type} key={type}>
                    {TitleCase(type)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Friendly Name"
              name="friendlyName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  private hide(): void {
    this.setState({ modalVisible: false });
  }

  private show(): void {
    this.setState({ modalVisible: true });
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      await sendRequest(`/group`, {
        body: JSON.stringify(values),
        method: 'post',
      });
      this.hide();
      this.props.groupsUpdated();
    } catch (error) {
      console.error(error);
    }
  }
}
