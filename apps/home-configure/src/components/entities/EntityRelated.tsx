/* eslint-disable radar/no-identical-functions */
import {
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is, ResultControlDTO } from '@steggy/utilities';
import { Empty, List, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { GroupInspectButton } from '../groups';
import { PersonInspectButton } from '../people';
import { RoomInspectButton } from '../rooms';
import { RoutineInspectButton } from '../routines';

/* eslint-disable radar/no-duplicate-string */

// eslint-disable-next-line radar/cognitive-complexity
export function EntityRelated(props: { entity: string }) {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [people, setPeople] = useState<PersonDTO[]>([]);
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
        setRoutines(routines);
      })(),
    ]);
  }

  async function updateGroup(update: GroupDTO): Promise<void> {
    if (is.undefined(update)) {
      await refresh();
      return;
    }
    setGroups(
      groups.map(item =>
        item._id === update._id
          ? {
              ...item,
              ...update,
            }
          : item,
      ),
    );
  }

  function updatePeople(update: PersonDTO): void {
    if (!update) {
      setPeople(people.filter(({ _id }) => _id !== update._id));
      return;
    }
    setPeople(
      people.map(item =>
        item._id === update._id
          ? {
              ...item,
              ...update,
            }
          : item,
      ),
    );
  }
  function updateRoom(update: RoomDTO): void {
    if (!update) {
      setRooms(rooms.filter(({ _id }) => _id !== update._id));
      return;
    }
    setRooms(
      rooms.map(item =>
        item._id === update._id
          ? {
              ...item,
              ...update,
            }
          : item,
      ),
    );
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
  }

  const notUsed = [rooms, people, routines, groups].every(i => is.empty(i));

  return notUsed ? (
    <Empty description="This entity is not used" />
  ) : (
    <Tabs>
      {is.empty(rooms) ? undefined : (
        <Tabs.TabPane
          tab={
            <>
              <Typography.Text type="secondary">
                ({rooms.length})
              </Typography.Text>
              {` Rooms`}
            </>
          }
          key="rooms"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={rooms}
            renderItem={item => (
              <List.Item>
                <RoomInspectButton
                  room={item}
                  onUpdate={room => updateRoom(room)}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(people) ? undefined : (
        <Tabs.TabPane
          disabled={is.empty(people)}
          tab={
            <>
              <Typography.Text type="secondary">
                ({people.length})
              </Typography.Text>
              {` People`}
            </>
          }
          key="people"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={people}
            renderItem={item => (
              <List.Item>
                <PersonInspectButton
                  person={item}
                  onUpdate={person => updatePeople(person)}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(groups) ? undefined : (
        <Tabs.TabPane
          tab={
            <>
              <Typography.Text type="secondary">
                ({groups.length})
              </Typography.Text>
              {` Groups`}
            </>
          }
          key="groups"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={groups}
            renderItem={item => (
              <List.Item>
                <GroupInspectButton
                  group={item}
                  onUpdate={update => updateGroup(update)}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(routines) ? undefined : (
        <Tabs.TabPane
          tab={
            <>
              <Typography.Text type="secondary">
                ({routines.length})
              </Typography.Text>
              {` Routines`}
            </>
          }
          key="routine"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={routines}
            renderItem={item => (
              <List.Item>
                <RoutineInspectButton
                  routine={item}
                  onUpdate={update => updateRoutine(update)}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
    </Tabs>
  );
}
