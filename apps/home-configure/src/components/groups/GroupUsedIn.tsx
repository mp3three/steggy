import { GroupDTO, RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Drawer, List } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { RoomListDetail } from '../rooms';
import { RoomExtraActions } from '../rooms/RoomExtraActions';

export function GroupUsedIn(props: { group: GroupDTO }) {
  const [room, setRoom] = useState<RoomDTO>();
  const [rooms, setRooms] = useState<RoomDTO[]>();

  useEffect(() => {
    async function refresh(): Promise<void> {
      const rooms = await sendRequest<RoomDTO[]>({
        control: {
          filters: new Set([{ field: 'groups', value: props.group._id }]),
        },
        url: `/room`,
      });
      setRooms(rooms);
    }
    refresh();
  }, [props.group._id]);

  function updateRoom(update: RoomDTO): void {
    if (!update) {
      setRoom(undefined);
      setRooms(rooms.filter(({ _id }) => _id !== room._id));
      return;
    }
    const list = rooms.map(r => (r._id === room._id ? { ...r, ...update } : r));
    setRoom(list.find(({ _id }) => room._id === _id));
    setRooms(list);
  }

  if (!props.group) {
    return undefined;
  }
  return (
    <Card title="Rooms" type="inner">
      <List
        pagination={{ size: 'small' }}
        dataSource={rooms}
        renderItem={item => (
          <List.Item>
            <Button
              type={room ? 'primary' : 'text'}
              onClick={() => setRoom(item)}
            >
              {item.friendlyName}
            </Button>
          </List.Item>
        )}
      />
      <Drawer
        title="Room Details"
        extra={
          <RoomExtraActions
            room={room}
            onUpdate={update => updateRoom(update)}
          />
        }
        size="large"
        visible={!is.undefined(room)}
        onClose={() => setRoom(undefined)}
      >
        <RoomListDetail
          nested
          onUpdate={update => updateRoom(update)}
          room={room}
        />
      </Drawer>
    </Card>
  );
}
