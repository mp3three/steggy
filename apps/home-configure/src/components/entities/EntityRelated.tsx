import { GroupDTO, RoomDTO, RoutineDTO } from '@steggy/controller-shared';
import { is, ResultControlDTO } from '@steggy/utilities';
import { Button, Drawer, List, Skeleton, Tabs } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { GroupListDetail } from '../groups/GroupListDetail';
import { RoomListDetail } from '../rooms';
import { RoutineListDetail } from '../routines';

/* eslint-disable radar/no-duplicate-string */

type tState = {
  group?: GroupDTO;
  groups?: GroupDTO[];
  room?: RoomDTO;
  rooms?: RoomDTO[];
  routine?: RoutineDTO;
  routines?: RoutineDTO[];
};

export class RelatedRoutines extends React.Component<
  { entity?: string },
  tState
> {
  override state = { routines: [] } as tState;
  private currentEntity: string;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override async componentDidUpdate(): Promise<void> {
    if (this.props.entity !== this.currentEntity) {
      await this.refresh();
    }
  }

  override render() {
    return (
      <>
        <Tabs>
          <Tabs.TabPane tab="Rooms" key="rooms">
            <List
              pagination={{ size: 'small' }}
              dataSource={this.state.rooms}
              renderItem={item => (
                <List.Item>
                  <Button
                    type="text"
                    onClick={() => this.setState({ room: item })}
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
              dataSource={this.state.groups}
              renderItem={item => (
                <List.Item>
                  <Button
                    type="text"
                    onClick={() => this.setState({ group: item })}
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
              dataSource={this.state.routines}
              renderItem={item => (
                <List.Item>
                  <Button
                    type="text"
                    onClick={() => this.setState({ routine: item })}
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
          onClose={() => this.setState({ routine: undefined })}
          visible={!is.undefined(this.state.routine)}
        >
          {is.undefined(this.state.routine) ? (
            <Skeleton />
          ) : (
            <RoutineListDetail
              nested
              routine={this.state.routine}
              onUpdate={routine => this.updateRoutine(routine)}
            />
          )}
        </Drawer>
        <Drawer
          title="Edit group"
          size="large"
          onClose={() => this.setState({ group: undefined })}
          visible={!is.undefined(this.state.group)}
        >
          {is.undefined(this.state.group) ? (
            <Skeleton />
          ) : (
            <GroupListDetail
              type="inner"
              group={this.state.group}
              onUpdate={group => this.updateGroup(group)}
            />
          )}
        </Drawer>
        <Drawer
          title="Edit room"
          size="large"
          onClose={() => this.setState({ room: undefined })}
          visible={!is.undefined(this.state.room)}
        >
          {is.undefined(this.state.room) ? (
            <Skeleton />
          ) : (
            <RoomListDetail
              nested
              room={this.state.room}
              onUpdate={room => this.updateRoom(room)}
            />
          )}
        </Drawer>
      </>
    );
  }

  private async refresh(): Promise<void> {
    await Promise.all([
      (async () => {
        const rooms = await sendRequest<RoomDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'entities',
                value: this.props.entity,
              },
            ]),
          },
          url: `/room`,
        });
        this.setState({ room: undefined, rooms });
      })(),
      (async () => {
        const groups = await sendRequest<GroupDTO[]>({
          control: {
            filters: new Set([
              {
                field: 'entities',
                value: this.props.entity,
              },
            ]),
          },
          url: `/group`,
        });
        this.setState({ group: undefined, groups });
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
                    value: this.props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'activate.type', value: 'kunami' },
                  {
                    field: 'activate.activate.sensor',
                    value: this.props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'activate.type', value: 'state_change' },
                  {
                    field: 'activate.activate.entity',
                    value: this.props.entity,
                  },
                ]),
              },
              // command
              {
                filters: new Set([
                  { field: 'command.type', value: 'stop_processing' },
                  {
                    field: 'command.command.comparisons.comparison.entity_id',
                    value: this.props.entity,
                  },
                ]),
              },
              {
                filters: new Set([
                  { field: 'command.type', value: 'entity_state' },
                  { field: 'command.command.ref', value: this.props.entity },
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
        this.setState({ routine: undefined, routines });
      })(),
    ]);
  }

  private updateGroup(update: GroupDTO): void {
    const groups = this.state.groups.map(item =>
      item._id === this.state.group._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const group = groups.find(({ _id }) => _id === this.state.group._id);
    this.setState({ group, groups });
  }

  private updateRoom(update: RoomDTO): void {
    const rooms = this.state.rooms.map(item =>
      item._id === this.state.room._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const room = rooms.find(({ _id }) => _id === this.state.room._id);
    this.setState({ room, rooms });
  }

  private updateRoutine(update: RoutineDTO): void {
    const routines = this.state.routines.map(item =>
      item._id === this.state.routine._id
        ? {
            ...item,
            ...update,
          }
        : item,
    );
    const routine = routines.find(({ _id }) => _id === this.state.routine._id);
    this.setState({ routine, routines });
  }
}
