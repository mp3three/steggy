import { RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Empty, Form, Input, Tabs, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RoomMetadata } from '../misc';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomExtraActions } from './RoomExtraActions';
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
            <RoomExtraActions
              room={this.props.room}
              onClone={this.props.onClone}
              onUpdate={this.props.onUpdate}
            />
          )
        }
      >
        {this.renderBody()}
      </Card>
    );
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
