import { RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { RoomExtraActions } from './RoomExtraActions';
import { RoomListDetail } from './RoomListDetail';

export function RoomInspectButton(props: {
  onUpdate?: (room: RoomDTO) => void;
  room: RoomDTO | string;
}) {
  const [visible, setVisible] = useState(false);
  const [room, setRoom] = useState<RoomDTO>();

  async function load(visible?: boolean): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      url: `/room/${is.string(props.room) ? props.room : props.room._id}`,
    });
    if (props.onUpdate) {
      props.onUpdate(room);
    }
    setRoom(room);
    if (visible) {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (is.string(props.room)) {
      load();
      return;
    }
    setRoom(props.room);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.room]);

  function onUpdate(update: RoomDTO) {
    setRoom({
      ...room,
      ...update,
    });
    if (props.onUpdate) {
      props.onUpdate(update);
    }
  }

  async function loadRoom() {
    await load(true);
    setVisible(true);
  }

  return (
    <>
      <Drawer
        title="Room Details"
        size="large"
        visible={visible}
        extra={<RoomExtraActions room={room} onUpdate={props.onUpdate} />}
        onClose={() => setVisible(false)}
      >
        <RoomListDetail
          nested
          onUpdate={update => onUpdate(update)}
          room={room}
        />
      </Drawer>
      <Button
        size="small"
        type={visible ? 'primary' : 'text'}
        onClick={() => loadRoom()}
      >
        {room?.friendlyName}
      </Button>
    </>
  );
}
