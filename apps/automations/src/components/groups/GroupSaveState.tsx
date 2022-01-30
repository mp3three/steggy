import {
  CameraOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { GroupDTO, GroupSaveStateDTO } from '@text-based/controller-shared';
import { DOWN, is, sleep, UP } from '@text-based/utilities';
import {
  Button,
  Card,
  Empty,
  Form,
  FormInstance,
  Input,
  notification,
  Popconfirm,
  Popover,
  Space,
  Table,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { GroupStateEdit, LightGroupDescription } from './states';

type tState = {
  captureCurrentVisible?: boolean;
};

export class GroupSaveStates extends React.Component<
  { group: GroupDTO; onGroupUpdate: (group?: GroupDTO) => void },
  tState
> {
  private captureForm: FormInstance;
  private createForm: FormInstance;

  override render() {
    return (
      // Outer card + create buttons
      <Card
        title="Save States"
        key="states"
        style={{ margin: '8px 0' }}
        extra={
          <Space>
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
              onConfirm={this.validateCapture.bind(this)}
              title={
                <Form
                  onFinish={this.validateCapture.bind(this)}
                  ref={form => (this.captureForm = form)}
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
              <Button size="small" icon={<CameraOutlined />}>
                Capture current
              </Button>
            </Popconfirm>
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
              onConfirm={this.validateCreate.bind(this)}
              title={
                <Form
                  onFinish={this.validateCreate.bind(this)}
                  ref={form => (this.createForm = form)}
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
              <Button size="small" icon={<FolderAddOutlined />}>
                Create new
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {/* Display table */}
        {is.empty(this.props.group.save_states) ? (
          <Empty description="No save states" />
        ) : (
          <Table
            dataSource={this.props.group.save_states.sort((a, b) =>
              a.friendlyName > b.friendlyName ? UP : DOWN,
            )}
          >
            <Table.Column
              width={20}
              render={(text, record: GroupSaveStateDTO) => (
                <GroupStateEdit
                  onUpdate={group => this.props.onGroupUpdate(group)}
                  group={this.props.group}
                  state={record}
                />
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
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  title={`Are you sure you want to delete ${record.friendlyName}`}
                  onConfirm={() => this.removeState(record)}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              )}
            />
          </Table>
        )}

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

  private async removeState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest(`/group/${this.props.group._id}/state/${state.id}`, {
      method: 'delete',
    });
    await sleep(500);
    this.props.onGroupUpdate();
  }

  private async validateCapture(): Promise<void> {
    try {
      const values = await this.captureForm.validateFields();
      const group = await sendRequest<GroupDTO>(
        `/group/${this.props.group._id}/capture`,
        {
          body: JSON.stringify(values),
          method: 'post',
        },
      );
      notification.success({
        message: `State captured: ${values.friendlyName}`,
      });
      this.props.onGroupUpdate(group);
      this.captureForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }

  private async validateCreate(): Promise<void> {
    try {
      const values = await this.createForm.validateFields();
      const group = await sendRequest<GroupDTO>(
        `/group/${this.props.group._id}/state`,
        {
          body: JSON.stringify(values),
          method: 'post',
        },
      );
      this.props.onGroupUpdate(group);
      this.createForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }
}
