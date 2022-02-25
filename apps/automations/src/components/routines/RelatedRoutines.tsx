import { GroupDTO, RoomDTO, RoutineDTO } from '@automagical/controller-shared';
import { each, ResultControlDTO } from '@automagical/utilities';
import { List } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';

type tState = {
  routines: RoutineDTO[];
};
const field = 'command.type';

export class RelatedRoutines extends React.Component<
  {
    entity?: string;
    groupAction?: GroupDTO;
    groupState?: GroupDTO;
    roomState?: RoomDTO;
    routine?: RoutineDTO;
  },
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
      <List
        pagination={{ size: 'small' }}
        dataSource={this.state.routines}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Link to={`/routine/${item._id}`}>{item.friendlyName}</Link>
              }
            />
          </List.Item>
        )}
      />
    );
  }

  private buildQuery(): ResultControlDTO[] {
    if (this.props.roomState) {
      return [
        {
          filters: new Set([
            {
              field,
              value: 'room_state',
            },
            {
              field: 'command.command.room',
              value: this.props.roomState._id,
            },
          ]),
        } as ResultControlDTO,
      ];
    }
    if (this.props.groupAction) {
      return [
        {
          filters: new Set([
            {
              field,
              value: 'group_action',
            },
            {
              field: 'command.command.group',
              value: this.props.groupAction._id,
            },
          ]),
        } as ResultControlDTO,
      ];
    }
    if (this.props.groupState) {
      return [
        {
          filters: new Set([
            {
              field,
              value: 'group_state',
            },
            {
              field: 'command.command.group',
              value: this.props.groupState._id,
            },
          ]),
        } as ResultControlDTO,
      ];
    }
    if (this.props.entity) {
      this.currentEntity = this.props.entity;
      return [
        {
          filters: new Set([
            {
              field,
              value: 'kunami',
            },
            {
              field: 'activate.activate.sensor',
              value: this.props.entity,
            },
          ]),
        } as ResultControlDTO,
        {
          filters: new Set([
            {
              field,
              value: 'state_change',
            },
            {
              field: 'activate.activate.entity',
              value: this.props.entity,
            },
          ]),
        } as ResultControlDTO,
        {
          filters: new Set([
            {
              field,
              value: 'entity_state',
            },
            {
              field: 'command.command.ref',
              value: this.props.entity,
            },
          ]),
        } as ResultControlDTO,
      ];
    }
    if (this.props.routine) {
      return [
        {
          filters: new Set([
            {
              field,
              value: 'trigger_routine',
            },
            {
              field: 'command.command.routine',
              value: this.props.routine._id,
            },
          ]),
        } as ResultControlDTO,
      ];
    }
    return [{}];
  }

  private async refresh(): Promise<void> {
    const queries = this.buildQuery();
    const routines: Record<string, RoutineDTO> = {};
    await each(queries, async control => {
      const out = await sendRequest<RoutineDTO[]>({ control, url: `/routine` });
      out.forEach(i => (routines[i._id] = i));
    });
    this.setState({ routines: Object.values(routines) });
  }
}
