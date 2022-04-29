import { RoomDTO, RoutineCommandRoomStateDTO } from '@steggy/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

export function RoomStateCommand(props: {
  command?: RoutineCommandRoomStateDTO;
  onUpdate: (command: Partial<RoutineCommandRoomStateDTO>) => void;
}) {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  const room = rooms.find(({ _id }) => _id === props.command?.room);

  useEffect(() => {
    async function refresh(): Promise<void> {
      const rooms = await sendRequest<RoomDTO[]>({
        control: {
          select: [
            'friendlyName',
            'save_states.id',
            'save_states.friendlyName',
          ],
          sort: ['friendlyName'],
        },
        url: `/room`,
      });
      setRooms(rooms);
    }
    refresh();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Room">
        <Select
          value={room?._id}
          onChange={room => props.onUpdate({ room })}
          showSearch
          style={{ width: '100%' }}
        >
          {rooms.map(group => (
            <Select.Option key={group._id} value={group._id}>
              {group.friendlyName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Save State">
        {room ? (
          <Select
            value={props.command?.state}
            onChange={state => props.onUpdate({ state })}
          >
            {room.save_states.map(state => (
              <Select.Option key={state.id} value={state.id}>
                {state.friendlyName}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Skeleton.Input style={{ width: '200px' }} active />
        )}
      </Form.Item>
    </Space>
  );
}
