import {
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is, ResultControlDTO } from '@steggy/utilities';
import { Button, Drawer, List, Skeleton, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { GroupListDetail } from '../groups/GroupListDetail';
import { RoomListDetail } from '../rooms';
import { RoutineListDetail } from '../routines';

/* eslint-disable radar/no-duplicate-string */

// eslint-disable-next-line radar/cognitive-complexity
export function EntityRelated(props: { entity: string }) {
  const [group, setGroup] = useState<GroupDTO>();
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [room, setRoom] = useState<RoomDTO>();
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [person, setPerson] = useState<PersonDTO>();
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [routine, setRoutine] = useState<RoutineDTO>();
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.entity]);

  async function refresh(): Promise<void> {
    await Promise.all([
      (async () => {
        const rooms = await sendRequest<RoomDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'entities',
                value: props.entity,
              },
            ]),
          },
          url: `/room`,
        });
        setRoom(undefined);
        setRooms(rooms);
      })(),
      (async () => {
        const people = await sendRequest<PersonDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'entities',
                value: props.entity,
              },
            ]),
          },
          url: `/person`,
        });
        setPerson(undefined);
        setPeople(people);
      })(),
      (async () => {
        const groups = await sendRequest<GroupDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'entities',
                value: props.entity,
              },
            ]),
          },
          url: `/group`,
        });
        setGroup(group);
        setGroups(groups);
      })(),
      (async () => {
        const routines: RoutineDTO[] = [];
        await Promise.all(
          (
            [
              // enabled
              // activate
              {
                filters: new Set([
                  { field: 'activate.type', value: 'attribute' },
                  {
                    field: 'activate.activate.entity',
                    value: props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'activate.type', value: 'kunami' },
                  {
                    field: 'activate.activate.sensor',
                    value: props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'activate.type', value: 'state_change' },
                  {
                    field: 'activate.activate.entity',
                    value: props.entity,
                  },
                ]),
              },
              // command
              {
                filters: new Set([
                  { field: 'command.type', value: 'stop_processing' },
                  {
                    field: 'command.command.comparisons.comparison.entity_id',
                    value: props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'command.type', value: 'entity_state' },
                  { field: 'command.command.ref', value: props.entity },
                ]),
              },
            ] as ResultControlDTO[]
          ).map(async control => {
            const list = await sendRequest<RoutineDTO[]>({
              control,
              url: `/routine`,
            });
            list.forEach(item => {
              const exists = routines.some(({ _id }) => _id === item._id);
              if (!exists) {
                routines.push(item);
              }
            });
          }),
        );
        setRoutine(undefined);
        setRoutines(routines);
      })(),
    ]);
  }

  async function updateGroup(update: GroupDTO): Promise<void> {
    if (is.undefined(update)) {
      await refresh();
      return;
    }
    const mapped = groups.map(item =>
      item._id === group._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const found = mapped.find(({ _id }) => _id === group._id);
    setGroup(found);
    setGroups(mapped);
  }

  function updateRoom(update: RoomDTO): void {
    if (!update) {
      setRoom(undefined);
      setRooms(rooms.filter(({ _id }) => _id !== room._id));
      return;
    }
    const mapped = rooms.map(item =>
      item._id === room._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const room = mapped.find(({ _id }) => _id === room._id);
    setRoom(room);
    setRooms(mapped);
  }

  function updateRoutine(update: RoutineDTO): void {
    const mapped = routines.map(item =>
      item._id === routine._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const routine = mapped.find(({ _id }) => _id === routine._id);
    setRoutines(mapped);
    setRoutine(routine);
  }

  return (
    <>
      <Tabs>
        <Tabs.TabPane tab="Rooms" key="rooms">
          <List
            pagination={{ size: 'small' }}
            dataSource={rooms}
            renderItem={item => (
              <List.Item>
                <Button
                  type={room?._id === item._id ? 'primary' : 'text'}
                  onClick={() => setRoom(item)}
                >
                  {item.friendlyName}
                </Button>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="People" key="people">
          <List
            pagination={{ size: 'small' }}
            dataSource={people}
            renderItem={item => (
              <List.Item>
                <Button
                  type={person?._id === item._id ? 'primary' : 'text'}
                  onClick={() => setPerson(item)}
                >
                  {item.friendlyName}
                </Button>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Groups" key="groups">
          <List
            pagination={{ size: 'small' }}
            dataSource={groups}
            renderItem={item => (
              <List.Item>
                <Button
                  type={group?._id === item._id ? 'primary' : 'text'}
                  onClick={() => setGroup(item)}
                >
                  {item.friendlyName}
                </Button>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Routines" key="routine">
          <List
            pagination={{ size: 'small' }}
            dataSource={routines}
            renderItem={item => (
              <List.Item>
                <Button
                  type={routine?._id === item._id ? 'primary' : 'text'}
                  onClick={() => setRoutine(item)}
                >
                  {item.friendlyName}
                </Button>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      </Tabs>
      <Drawer
        title="Edit routine"
        size="large"
        onClose={() => setRoutine(undefined)}
        visible={!is.undefined(routine)}
      >
        {is.undefined(routine) ? (
          <Skeleton />
        ) : (
          <RoutineListDetail
            nested
            routine={routine}
            onUpdate={routine => updateRoutine(routine)}
          />
        )}
      </Drawer>
      <Drawer
        title="Edit group"
        size="large"
        onClose={() => setGroup(undefined)}
        visible={!is.undefined(group)}
      >
        {is.undefined(group) ? (
          <Skeleton />
        ) : (
          <GroupListDetail
            type="inner"
            group={group}
            onUpdate={group => updateGroup(group)}
          />
        )}
      </Drawer>
      <Drawer
        title="Edit room"
        size="large"
        onClose={() => setRoom(undefined)}
        visible={!is.undefined(room)}
      >
        {is.undefined(room) ? (
          <Skeleton />
        ) : (
          <RoomListDetail
            nested
            room={room}
            onUpdate={room => updateRoom(room)}
          />
        )}
      </Drawer>
    </>
  );
}
