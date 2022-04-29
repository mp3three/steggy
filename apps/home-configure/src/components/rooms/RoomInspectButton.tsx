import { RoomDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React, { useState } from 'react';

import { RoomExtraActions } from './RoomExtraActions';
import { RoomListDetail } from './RoomListDetail';

export function RoomInsectButton(props: {
  onUpdate: (room: RoomDTO) => void;
  room: RoomDTO;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button type="text" onClick={() => setVisible(true)}>
        {props.room?.friendlyName}
      </Button>
      <Drawer
        title="Room Details"
        size="large"
        visible={visible}
        extra={<RoomExtraActions room={props.room} onUpdate={props.onUpdate} />}
        onClose={() => setVisible(false)}
      >
        <RoomListDetail
          nested
          onUpdate={update => props.onUpdate(update)}
          room={props.room}
        />
      </Drawer>
    </>
  );
}
