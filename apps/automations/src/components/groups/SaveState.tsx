import {
  CameraOutlined,
  EditOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { GroupDTO, GroupSaveStateDTO } from '@text-based/controller-shared';
import { is, sleep } from '@text-based/utilities';
import {
  Button,
  Card,
  Empty,
  Form,
  FormInstance,
  Input,
  Modal,
  notification,
  Popconfirm,
  Popover,
  Space,
  Table,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { LightGroupDescription } from './states';

type tState = {
  captureCurrentVisible?: boolean;
};

export class GroupSaveStates extends React.Component<
  { group: GroupDTO; onGroupUpdate: () => void },
  tState
> {
  private form: FormInstance;

  override render() {
    return (
      // Outer card + create buttons
      <Card
        title="Save States"
        key="states"
        style={{ margin: '8px 0' }}
        extra={
          <Space>
            <Button
              size="small"
              icon={<CameraOutlined />}
              onClick={this.captureCurrent.bind(this)}
            >
              Capture current
            </Button>
            <Button
              size="small"
              icon={<FolderAddOutlined />}
              onClick={this.createNewState.bind(this)}
            >
              Create new
            </Button>
          </Space>
        }
      >
        {/* Display table */}
        {is.empty(this.props.group.save_states) ? (
          <Empty description="No save states" />
        ) : (
          <Table dataSource={this.props.group.save_states}>
            <Table.Column
              width={20}
              render={(text, record: GroupSaveStateDTO) => (
                <Button onClick={() => this.editState(record)}>
                  <EditOutlined />
                </Button>
              )}
            />
            <Table.Column
              title="Friendly Name"
              key="friendlyName"
              render={(text, record: GroupSaveStateDTO) => (
                <Popover content={<LightGroupDescription state={record} />}>
                  {record.friendlyName}
                </Popover>
              )}
            />
            <Table.Column
              width={20}
              render={(text, record: GroupSaveStateDTO) => (
                <Button onClick={() => this.activateState(record)}>
                  Activate
                </Button>
              )}
            />
            <Table.Column
              width={20}
              render={(text, record: GroupSaveStateDTO) => (
                <Popconfirm
                  title={`Are you sure you want to delete ${record.friendlyName}`}
                  onConfirm={() => this.removeState(record)}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              )}
            />
          </Table>
        )}

        {/* Capture current modal */}
        <Modal
          forceRender
          title="Capture current state"
          visible={this.state?.captureCurrentVisible}
          onOk={this.validate.bind(this)}
          onCancel={this.hide.bind(this)}
        >
          <Form
            onFinish={this.validate.bind(this)}
            layout="vertical"
            ref={form => (this.form = form)}
          >
            <Form.Item
              label="Friendly Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        {/* / Capture current modal */}
      </Card>
    );
  }

  private async activateState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest(`/group/${this.props.group._id}/state/${state.id}`, {
      method: 'post',
    });
    await sleep(500);
    this.props.onGroupUpdate();
  }

  private captureCurrent(): void {
    this.setState({ captureCurrentVisible: true });
  }

  private createNewState(): void {
    //
  }

  private editState(state: GroupSaveStateDTO): void {
    //
  }

  private hide(): void {
    this.setState({ captureCurrentVisible: false });
  }

  private async removeState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest(`/group/${this.props.group._id}/state/${state.id}`, {
      method: 'delete',
    });
    await sleep(500);
    this.props.onGroupUpdate();
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      await sendRequest(`/group/${this.props.group._id}/capture`, {
        body: JSON.stringify(values),
        method: 'post',
      });
      this.hide();
      notification.success({
        message: `State captured: ${values.name}`,
      });
      this.props.onGroupUpdate();
    } catch (error) {
      console.error(error);
    }
  }
}
