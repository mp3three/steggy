import { RoomDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React from 'react';

import { RoomListDetail } from './RoomListDetail';

type tState = {
  visible: boolean;
};

export class RoomInsectButton extends React.Component<
  {
    onUpdate: (room: RoomDTO) => void;
    room: RoomDTO;
  },
  tState
> {
  override state = {} as tState;

  override render(): React.ReactNode {
    return (
      <>
        <Button type="text" onClick={() => this.setState({ visible: true })}>
          {this.props.room?.friendlyName}
        </Button>
        <Drawer
          title="Room Details"
          size="large"
          visible={this.state.visible}
          onClose={() => this.setState({ visible: false })}
        >
          <RoomListDetail
            nested
            onUpdate={update => this.props.onUpdate(update)}
            room={this.props.room}
          />
        </Drawer>
      </>
    );
  }
}
