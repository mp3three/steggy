import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { RoomDTO, RoomStateDTO } from '@text-based/controller-shared';
import { DOWN, UP } from '@text-based/utilities';
import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Popconfirm,
  Popover,
  Table,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RoomStateEdit } from './states';

export class RoomSaveStates extends React.Component<{
  room: RoomDTO;
  roomUpdated: (room: RoomDTO) => void;
}> {
  override state = { modalVisible: false };
  private form: FormInstance;
  private get room() {
    return this.props.room;
  }

  override render() {
    return (
      <Card
        title="Save States"
        extra={
          <Popconfirm
            onConfirm={this.validate.bind(this)}
            title={
              <Form
                onFinish={this.validate.bind(this)}
                layout="vertical"
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
        <Table
          dataSource={this.room.save_states.sort((a, b) =>
            a.friendlyName > b.friendlyName ? UP : DOWN,
          )}
        >
          <Table.Column
            width={20}
            render={(text, record: RoomStateDTO) => (
              <RoomStateEdit
                key={record.id}
                onUpdate={group => this.props.roomUpdated(group)}
                room={this.props.room}
                state={record}
              />
            )}
          />
          <Table.Column
            title="Friendly Name"
            key="friendlyName"
            render={(text, record: RoomStateDTO) => (
              <Popover content="asdf">{record.friendlyName}</Popover>
            )}
          />
          <Table.Column
            width={20}
            render={(text, record: RoomStateDTO) => (
              <Button onClick={() => this.activateState(record)}>
                Activate
              </Button>
            )}
          />
          <Table.Column
            width={20}
            render={(text, record: RoomStateDTO) => (
              <Popconfirm
                title={`Are you sure you want to delete ${record.friendlyName}`}
                onConfirm={() => this.removeState(record)}
              >
                <Button danger>Delete</Button>
              </Popconfirm>
            )}
          />
        </Table>
      </Card>
    );
  }

  private async activateState(record: RoomStateDTO): Promise<void> {
    await sendRequest(`/room/${this.room._id}/state/${record.id}`, {
      method: 'post',
    });
  }

  private async removeState(record: RoomStateDTO): Promise<void> {
    const room = await sendRequest<RoomDTO>(
      `/room/${this.room._id}/state/${record.id}`,
      { method: 'delete' },
    );
    this.props.roomUpdated(room);
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      const room = await sendRequest<RoomDTO>(`/room/${this.room._id}/state`, {
        body: JSON.stringify(values),
        method: 'post',
      });
      this.props.roomUpdated(room);
    } catch (error) {
      console.error(error);
    }
  }
}
