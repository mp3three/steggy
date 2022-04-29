import {
  GroupDTO,
  RoomDTO,
  RoomStateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { Button, Drawer, List, Skeleton, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

import { RELATED_ROUTINES, sendRequest } from '../../types';
import { RoomStateEdit } from '../rooms/states';
import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineListDetail } from './RoutineListDetail';

type list = { room: RoomDTO; state: RoomStateDTO }[];

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
  const [room_states, setRoom_states] = useState<list>();
  const [routine, setRoutine] = useState<RoutineDTO>();
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);

  useEffect(() => {
    async function refresh(): Promise<void> {
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
      if (!is.undefined(props.groupState)) {
        const rooms = await sendRequest<RoomDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'save_states.states.type',
                value: 'group',
              },
              {
                field: 'save_states.states.ref',
                value: props.groupState._id,
              },
            ]),
          },
          url: `/room`,
        });
        const room_states: list = [];
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

    refresh();
  }, [
    props.entity,
    props.groupAction,
    props.groupState,
    props.roomState,
    props.routine,
  ]);

  return (
    <>
      <Tabs>
        <Tabs.TabPane tab="Routines" key="routine">
          <List
            pagination={{ size: 'small' }}
            dataSource={routines}
            renderItem={item => (
              <List.Item>
                <Button
                  size="small"
                  type="text"
                  onClick={() => setRoutine(item)}
                >
                  {item.friendlyName}
                </Button>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
        {is.undefined(props.groupState) ? undefined : (
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
        )}
      </Tabs>
      <Drawer
        title="Edit routine"
        size="large"
        extra={
          <RoutineExtraActions
            routine={routine}
            onUpdate={routine => setRoutine(routine)}
          />
        }
        onClose={() => setRoutine(undefined)}
        visible={!is.undefined(routine)}
      >
        {is.undefined(routine) ? (
          <Skeleton />
        ) : (
          <RoutineListDetail
            nested
            routine={routine}
            onUpdate={routine => setRoutine(routine)}
          />
        )}
      </Drawer>
    </>
  );
}
