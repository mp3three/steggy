import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { RoomDTO, RoomStateDTO } from '@automagical/controller-shared';
import { DOWN, UP } from '@automagical/utilities';
import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  List,
  Popconfirm,
  Space,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { RoomStateEdit } from './states';

export class RoomSaveStates extends React.Component<{
  onUpdate: (room: RoomDTO) => void;
  room: RoomDTO;
}> {
  override state = { modalVisible: false };
  private form: FormInstance;
  private get room() {
    return this.props.room;
  }

  override render() {
    return (
      <Space style={{ width: '100%' }} direction="vertical" size="large">
        <Card
          type="inner"
          title="Save States"
          extra={
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
              <Button size="small" icon={<PlusBoxMultiple />}>
                Create new
              </Button>
            </Popconfirm>
          }
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={this.room.save_states.sort((a, b) =>
              a.friendlyName > b.friendlyName ? UP : DOWN,
            )}
            renderItem={record => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <RoomStateEdit
                      key={record.id}
                      onUpdate={group => this.props.onUpdate(group)}
                      room={this.props.room}
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
        <Card type="inner" title="Used in routines">
          <RelatedRoutines roomState={this.props.room} />
        </Card>
      </Space>
    );
  }

  private async activateState(record: RoomStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/room/${this.room._id}/state/${record.id}`,
    });
  }

  private async removeState(record: RoomStateDTO): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      method: 'delete',
      url: `/room/${this.room._id}/state/${record.id}`,
    });
    this.props.onUpdate(room);
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      const room = await sendRequest<RoomDTO>({
        body: values,
        method: 'post',
        url: `/room/${this.room._id}/state`,
      });
      this.form.resetFields();
      this.props.onUpdate(room);
    } catch (error) {
      console.error(error);
    }
  }
}
