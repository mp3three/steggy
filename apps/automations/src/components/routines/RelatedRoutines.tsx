import { GroupDTO, RoomDTO, RoutineDTO } from '@automagical/controller-shared';
import { each } from '@automagical/utilities';
import { Button, Drawer, List, Spin } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { sendRequest } from '../../types';

type tState = {
  routines: RoutineDTO[];
};

export class RelatedRoutines extends React.Component<
  {
    roomState?: RoomDTO;
    groupAction?: GroupDTO;
    groupState?: GroupDTO;
    entity?: string;
  },
  tState
> {
  override state = { routines: [] } as tState;
  private currentEntity: string;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override async componentDidUpdate(
    prevProps: Readonly<{
      roomState?: RoomDTO;
      groupAction?: GroupDTO;
      groupState?: GroupDTO;
      entity?: string;
    }>,
    prevState: Readonly<tState>,
    snapshot?: any,
  ): Promise<void> {
    if (this.props.entity !== this.currentEntity) {
      await this.refresh();
    }
  }

  override render() {
    return (
      <List
        pagination={{ onChange: () => {} }}
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

  private buildQuery(): string[] {
    if (this.props.roomState) {
      return [
        // Room States
        `command.type=room_state&command.command.room=${this.props.roomState._id}`,
      ];
    }
    if (this.props.groupAction) {
      return [
        // Group Actions
        `command.type=group_action&command.command.group=${this.props.groupAction._id}`,
      ];
    }
    if (this.props.groupState) {
      return [
        // Group States
        `command.type=group_state&command.command.group=${this.props.groupState._id}`,
      ];
    }
    if (this.props.entity) {
      this.currentEntity = this.props.entity;
      return [
        // Sequence activate
        `activate.type=kunami&activate.activate.sensor=${this.props.entity}`,
        // State change activate
        `activate.type=state_change&activate.activate.entity=${this.props.entity}`,
        // Entity commands
        `command.type=entity_state&command.command.ref=${this.props.entity}`,
      ];
    }
    return [''];
  }

  private async refresh(): Promise<void> {
    const queries = this.buildQuery();
    const routines: Record<string, RoutineDTO> = {};
    await each(queries, async query => {
      const out = await sendRequest<RoutineDTO[]>(`/routine?${query}`);
      out.forEach(i => (routines[i._id] = i));
    });
    this.setState({ routines: Object.values(routines) });
  }
}
