import MenuIcon from '@2fd/ant-design-icons/lib/Menu';
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

import { sendRequest } from '../../types';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomMetadata } from './RoomMetadata';
import { RoomSaveStates } from './RoomSaveState';

type tState = {
  name: string;
};

export class RoomListDetail extends React.Component<
  {
    nested?: boolean;
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
                      <Button danger type="text">
                        Delete Group
                      </Button>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text">
                <MenuIcon />
              </Button>
            </Dropdown>
          )
        }
      >
        {this.renderBody()}
      </Card>
    );
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
