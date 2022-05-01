import {
  DebugReportDTO,
  GroupDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Empty, List, Tabs, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { GroupInspectButton } from '../groups';
import { RoomInspectButton } from '../rooms';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

// eslint-disable-next-line radar/cognitive-complexity
export function DebuggerSettings() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);

  const valid = is.empty([...groups, ...rooms, ...routines]);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh(): Promise<void> {
    const result = await sendRequest<DebugReportDTO>({
      url: `/debug/find-broken`,
    });
    setGroups(result.groups);
    setRooms(result.rooms);
    setRoutines(result.routines);
  }

  function updateGroup(group: GroupDTO, reference: GroupDTO): void {
    if (!group) {
      setGroups(groups.filter(({ _id }) => _id !== reference._id));
      return;
    }
    setGroups(groups.map(g => (g._id === group._id ? group : g)));
  }

  async function updateRoom(room: RoomDTO): Promise<void> {
    if (!room) {
      await refresh();
      return;
    }
    setRooms(rooms.map(r => (r._id === room._id ? room : r)));
  }

  function updateRoutine(routine: RoutineDTO): void {
    setRoutines(routines.map(r => (r._id === routine._id ? routine : r)));
  }

  return (
    <Card
      extra={
        <Tooltip
          title="Additional information available in server logs as warning level messages."
          placement="topLeft"
          color="blue"
        >
          <Button onClick={() => refresh()} size="small">
            Refresh
          </Button>
        </Tooltip>
      }
    >
      {valid ? (
        <Empty description="Everything is valid!" />
      ) : (
        <Tabs>
          {is.empty(groups) ? undefined : (
            <Tabs.TabPane tab="Groups" key="group">
              <List
                pagination={{ size: 'small' }}
                dataSource={groups}
                renderItem={group => (
                  <List.Item>
                    <GroupInspectButton
                      group={group}
                      onUpdate={update => updateGroup(update, group)}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          )}
          {is.empty(rooms) ? undefined : (
            <Tabs.TabPane tab="Rooms" key="room">
              <List
                pagination={{ size: 'small' }}
                dataSource={rooms}
                renderItem={room => (
                  <List.Item>
                    <RoomInspectButton
                      room={room}
                      onUpdate={update => updateRoom(update)}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          )}
          {is.empty(routines) ? undefined : (
            <Tabs.TabPane tab="Routines" key="routine">
              <List
                pagination={{ size: 'small' }}
                dataSource={routines}
                renderItem={routine => (
                  <List.Item>
                    <RoutineInspectButton
                      routine={routine}
                      onUpdate={update => updateRoutine(update)}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          )}
        </Tabs>
      )}
    </Card>
  );
}
