/* eslint-disable radar/no-duplicate-string */
import {
  GroupDTO,
  GroupSaveStateDTO,
  PersonDTO,
  RoomDTO,
  RoomStateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { Empty, List, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { RELATED_ROUTINES, sendRequest } from '../../types';
import { GroupStateEdit } from '../groups';
import { RoomStateEdit } from '../rooms';
import { RoutineInspectButton } from './RoutineInspectButton';

type tRoomList = { room: RoomDTO; state: RoomStateDTO }[];
type tGroupList = { group: GroupDTO; state: GroupSaveStateDTO }[];
type tPeopleList = { person: PersonDTO; state: RoomStateDTO }[];

// eslint-disable-next-line radar/cognitive-complexity
export function RelatedRoutines(props: {
  entity?: string;
  groupAction?: GroupDTO;
  groupState?: GroupDTO;
  roomState?: RoomDTO;
  routine?: RoutineDTO;
}) {
  // const [room, setRoom] = useState<RoomDTO>();
  // const [room_state, setRoom_state] = useState<RoomStateDTO>();
  const [room_states, setRoom_states] = useState<tRoomList>([]);
  const [group_states, setGroup_states] = useState<tGroupList>([]);
  const [people_states, setPeople_states] = useState<tPeopleList>([]);
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);

  useEffect(() => {
    async function loadRoutines() {
      const queries = routineQueries();
      const routines: Record<string, RoutineDTO> = {};
      await each(queries, async control => {
        const out = await sendRequest<RoutineDTO[]>({
          control,
          url: `/routine`,
        });
        out.forEach(i => (routines[i._id] = i));
      });
      setRoutines(Object.values(routines));
    }

    async function loadRooms(): Promise<void> {
      if (!props.groupState) {
        return;
      }
      const rooms = await sendRequest<RoomDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'save_states.states.ref',
              value: props.groupState._id,
            },
          ]),
        },
        url: `/room`,
      });
      const room_states: tRoomList = [];
      rooms.forEach(room => {
        room.save_states ??= [];
        room.save_states.forEach(state => {
          state.states ??= [];
          state.states.forEach(i => {
            if (i.type === 'group' && i.ref === props.groupState._id) {
              room_states.push({ room, state });
            }
          });
        });
      });
      setRoom_states(room_states);
    }

    async function loadPeople(): Promise<void> {
      if (!props.groupState) {
        return;
      }
      const people = await sendRequest<PersonDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'save_states.states.ref',
              value: props.groupState._id,
            },
          ]),
        },
        url: `/person`,
      });
      const people_states: tPeopleList = [];
      people.forEach(person => {
        person.save_states ??= [];
        person.save_states.forEach(state => {
          state.states ??= [];
          state.states.forEach(i => {
            if (i.type === 'group' && i.ref === props.groupState._id) {
              people_states.push({ person, state });
            }
          });
        });
      });
      setPeople_states(people_states);
    }

    async function loadGroups() {
      if (!props.groupState) {
        return;
      }
      const groups = await sendRequest<GroupDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'save_states.states.ref',
              value: props.groupState._id,
            },
          ]),
        },
        url: `/group`,
      });
      const group_states: tGroupList = [];
      groups.forEach(group => {
        group.save_states ??= [];
        group.save_states.forEach(state => {
          state.states ??= [];
          state.states.forEach(i => {
            if (i.type === 'group' && i.ref === props.groupState._id) {
              group_states.push({ group, state });
            }
          });
        });
      });
      setGroup_states(group_states);
    }

    function routineQueries(): ResultControlDTO[] {
      if (props.roomState) {
        return RELATED_ROUTINES.room_state(props.roomState._id);
      }
      if (props.groupAction) {
        return RELATED_ROUTINES.group_action(props.groupAction._id);
      }
      if (props.groupState) {
        return RELATED_ROUTINES.group_state(props.groupState._id);
      }
      if (props.entity) {
        return RELATED_ROUTINES.entity(props.entity);
      }
      if (props.routine) {
        return RELATED_ROUTINES.routine(props.routine._id);
      }
      return [{}];
    }

    loadPeople();
    loadGroups();
    loadRooms();
    loadRoutines();
  }, [
    props.entity,
    props.groupAction,
    props.groupState,
    props.roomState,
    props.routine,
  ]);

  function updateRoutine(routine: RoutineDTO, update: RoutineDTO) {
    setRoutines(
      routines.map(i => (i._id === routine._id ? { ...i, ...update } : i)),
    );
  }

  const IS_USED = !is.empty([
    ...people_states,
    ...group_states,
    ...room_states,
    ...routines,
  ]);

  if (!IS_USED) {
    return <Empty />;
  }

  return (
    <Tabs>
      {is.empty(routines) ? undefined : (
        <Tabs.TabPane tab="Routines" key="routine">
          <List
            pagination={{ size: 'small' }}
            dataSource={routines}
            renderItem={item => (
              <List.Item>
                <RoutineInspectButton
                  routine={item}
                  onUpdate={update => updateRoutine(item, update)}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(room_states) ? undefined : (
        <Tabs.TabPane
          tab={
            <Typography>
              <Typography.Text type="secondary">
                {`(${room_states.length}) `}
              </Typography.Text>
              Room States
            </Typography>
          }
          key="roomStates"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={room_states}
            renderItem={room => (
              <List.Item>
                <List.Item.Meta
                  title={<RoomStateEdit room={room.room} state={room.state} />}
                  description={room.room.friendlyName}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(people_states) ? undefined : (
        <Tabs.TabPane
          tab={
            <Typography>
              <Typography.Text type="secondary">
                {`(${people_states.length}) `}
              </Typography.Text>
              People States
            </Typography>
          }
          key="roomStates"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={people_states}
            renderItem={person => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <RoomStateEdit
                      person={person.person}
                      state={person.state}
                    />
                  }
                  description={person.person.friendlyName}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
      {is.empty(group_states) ? undefined : (
        <Tabs.TabPane
          tab={
            <Typography>
              <Typography.Text type="secondary">
                {`(${group_states.length}) `}
              </Typography.Text>
              Group States
            </Typography>
          }
          key="groupStates"
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={group_states}
            renderItem={group => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <GroupStateEdit group={group.group} state={group.state} />
                  }
                  description={group.group.friendlyName}
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      )}
    </Tabs>
  );
}
