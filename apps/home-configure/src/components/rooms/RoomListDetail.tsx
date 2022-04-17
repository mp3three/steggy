import { QuestionCircleOutlined } from '@ant-design/icons';
import { RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  Menu,
  Popconfirm,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomMetadata } from './RoomMetadata';
import { RoomSaveStates } from './RoomSaveState';

type tState = {
  name: string;
};

export class RoomListDetail extends React.Component<
  {
    nested?: boolean;
    onClone?: (room: RoomDTO) => void;
    onUpdate: (room?: RoomDTO) => void;
    room?: RoomDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    if (this.props.nested) {
      return this.renderBody();
    }
    return (
      <Card
        title="Room details"
        extra={
          !is.object(this.props.room) ? undefined : (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="delete">
                    <Popconfirm
                      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                      title={`Are you sure you want to delete ${this.props.room.friendlyName}?`}
                      onConfirm={() => this.delete()}
                    >
                      <Button danger icon={FD_ICONS.get('remove')}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Menu.Item>
                  <Menu.Item key="clone">
                    <Button
                      onClick={() => this.clone()}
                      icon={FD_ICONS.get('clone')}
                      style={{ width: '100%' }}
                    >
                      Clone
                    </Button>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" size="small">
                {FD_ICONS.get('menu')}
              </Button>
            </Dropdown>
          )
        }
      >
        {this.renderBody()}
      </Card>
    );
  }

  private async clone(): Promise<void> {
    const cloned = await sendRequest<RoomDTO>({
      method: 'post',
      url: `/room/${this.props.room._id}/clone`,
    });
    if (this.props.onClone) {
      this.props.onClone(cloned);
    }
  }

  private async delete(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/room/${this.props.room._id}`,
    });
    this.props.onUpdate();
  }

  private renderBody() {
    return !this.props.room ? (
      <Empty description="Select a room" />
    ) : (
      <>
        <Typography.Title
          level={3}
          editable={{
            onChange: friendlyName => this.update({ friendlyName }),
          }}
        >
          {this.props.room.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane key="members" tab="Members">
            <RoomConfiguration
              room={this.props.room}
              onUpdate={room => this.props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="save_states" tab="Save States">
            <RoomSaveStates
              room={this.props.room}
              onUpdate={room => this.props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="metadata" tab="Metadata">
            <RoomMetadata
              room={this.props.room}
              onUpdate={room => this.props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="settings" tab="Settings">
            <Card>
              <Form.Item label="Internal Name">
                <Input
                  defaultValue={
                    this.props.room.name ?? `room_${this.props.room._id}`
                  }
                  onBlur={({ target }) => this.update({ name: target.value })}
                />
              </Form.Item>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }

  private async update(body: Partial<RoomDTO>): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body,
      method: 'put',
      url: `/room/${this.props.room._id}`,
    });
    this.props.onUpdate(room);
  }
}
