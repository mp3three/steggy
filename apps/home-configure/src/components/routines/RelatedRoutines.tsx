import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomDTO,
  RoomStateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { List, Tabs } from 'antd';
import { useEffect, useState } from 'react';

import { RELATED_ROUTINES, sendRequest } from '../../types';
import { GroupStateEdit } from '../groups';
import { RoomStateEdit } from '../rooms';
import { RoutineInspectButton } from './RoutineInspectButton';

type tRoomList = { room: RoomDTO; state: RoomStateDTO }[];
type tGroupList = { group: GroupDTO; state: GroupSaveStateDTO }[];

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

  return (
    <Tabs>
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
      {is.undefined(props.groupState) ? undefined : (
        <>
          <Tabs.TabPane tab="Room States" key="roomStates">
            <List
              pagination={{ size: 'small' }}
              dataSource={room_states}
              renderItem={room => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <RoomStateEdit room={room.room} state={room.state} />
                    }
                    description={room.room.friendlyName}
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Group States" key="groupStates">
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
        </>
      )}
    </Tabs>
  );
}
