import {
  CameraOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { GroupDTO, GroupSaveStateDTO } from '@automagical/controller-shared';
import { DOWN, sleep, UP } from '@automagical/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  List,
  notification,
  Popconfirm,
  Row,
  Space,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { GroupStateEdit } from './states';

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
      <Row gutter={8}>
        <Col span={12}>
          <Card
            type="inner"
            title="Save States"
            key="states"
            extra={
              <Space>
                <Popconfirm
                  icon={
                    <QuestionCircleOutlined style={{ visibility: 'hidden' }} />
                  }
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
                  icon={
                    <QuestionCircleOutlined style={{ visibility: 'hidden' }} />
                  }
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
            <List
              dataSource={this.props.group.save_states.sort((a, b) =>
                a.friendlyName > b.friendlyName ? UP : DOWN,
              )}
              renderItem={record => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <GroupStateEdit
                        onUpdate={group => this.props.onGroupUpdate(group)}
                        group={this.props.group}
                        state={record}
                      />
                    }
                  />
                  <Button
                    onClick={() => this.activateState(record)}
                    type="primary"
                  >
                    Activate
                  </Button>
                  <Popconfirm
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    title={`Are you sure you want to delete ${record.friendlyName}`}
                    onConfirm={() => this.removeState(record)}
                  >
                    <Button danger type="text">
                      X
                    </Button>
                  </Popconfirm>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title="Related Routines">
            <RelatedRoutines groupState={this.props.group} />
          </Card>
        </Col>
      </Row>
    );
  }

  private async activateState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/group/${this.props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    this.props.onGroupUpdate();
  }

  private async removeState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${this.props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    this.props.onGroupUpdate();
  }

  private async validateCapture(): Promise<void> {
    try {
      const values = await this.captureForm.validateFields();
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group/${this.props.group._id}/capture`,
      });
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
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group/${this.props.group._id}/state`,
      });
      this.props.onGroupUpdate(group);
      this.createForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }
}
