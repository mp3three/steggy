import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { RoomDTO, RoomStateDTO } from '@automagical/controller-shared';
import { DOWN, UP } from '@automagical/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  List,
  Popconfirm,
  Popover,
  Row,
  Table,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
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
        <Row gutter={16}>
          <Col span={12}>
            <List
              pagination={{ onChange: () => {} }}
              dataSource={this.room.save_states.sort((a, b) =>
                a.friendlyName > b.friendlyName ? UP : DOWN,
              )}
              renderItem={record => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <RoomStateEdit
                        key={record.id}
                        onUpdate={group => this.props.roomUpdated(group)}
                        room={this.props.room}
                        state={record}
                      />
                    }
                  />
                  <Button onClick={() => this.activateState(record)}>
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
          </Col>
          <Col span={12}>
            <Card type="inner" title="Related Routines">
              <RelatedRoutines roomState={this.props.room} />
            </Card>
          </Col>
        </Row>
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
      this.form.resetFields();
      this.props.roomUpdated(room);
    } catch (error) {
      console.error(error);
    }
  }
}
