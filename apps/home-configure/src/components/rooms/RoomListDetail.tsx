import { RoomDTO } from '@automagical/controller-shared';
import { Card, Empty, Tabs, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomMetadata } from './RoomMetadata';
import { RoomSaveStates } from './RoomSaveState';

type tState = {
  name: string;
};

export class RoomListDetail extends React.Component<
  { onUpdate: (room: RoomDTO) => void; room?: RoomDTO },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Card title="Room details" type="inner">
        {!this.props.room ? (
          <Empty description="Select a room" />
        ) : (
          <>
            <Typography.Title
              level={3}
              editable={{ onChange: value => this.rename(value) }}
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
              <Tabs.TabPane key="savestates" tab="Save States">
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
            </Tabs>
          </>
        )}
      </Card>
    );
  }

  private async rename(friendlyName: string): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: { friendlyName },
      method: 'put',
      url: `/room/${this.props.room._id}`,
    });
    this.props.onUpdate(room);
  }
}
