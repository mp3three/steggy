import { GroupDTO, RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Drawer, List } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RoomListDetail } from '../rooms';

type tState = {
  group: string;
  room: RoomDTO;
  rooms: RoomDTO[];
};

export class GroupUsedIn extends React.Component<{ group: GroupDTO }, tState> {
  override state = {} as tState;

  override render() {
    if (!this.props.group) {
      return undefined;
    }
    if (this.props.group._id !== this.state.group) {
      this.refresh();
    }
    return (
      <Card title="Rooms" type="inner">
        <List
          dataSource={this.state.rooms}
          renderItem={room => (
            <List.Item>
              <Button type="text" onClick={() => this.setState({ room })}>
                {room.friendlyName}
              </Button>
            </List.Item>
          )}
        />
        <Drawer
          title="Room Details"
          size="large"
          visible={!is.undefined(this.state.room)}
          onClose={() => this.setState({ room: undefined })}
        >
          <RoomListDetail
            nested
            onUpdate={update => this.updateRoom(update)}
            room={this.state.room}
          />
        </Drawer>
      </Card>
    );
  }

  private async refresh(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        filters: new Set([{ field: 'groups', value: this.props.group._id }]),
      },
      url: `/room`,
    });

    this.setState({
      group: this.props.group._id,
      rooms,
    });
  }

  private updateRoom(update: RoomDTO): void {
    const rooms = this.state.rooms.map(r =>
      r._id === this.state.room._id ? { ...r, ...update } : r,
    );
    const room = rooms.find(({ _id }) => this.state.room._id === _id);
    this.setState({ room, rooms });
  }
}
