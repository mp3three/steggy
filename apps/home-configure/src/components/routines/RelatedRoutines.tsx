import { GroupDTO, RoomDTO, RoutineDTO } from '@steggy/controller-shared';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { Button, Drawer, List, Tabs } from 'antd';
import React from 'react';

import { RELATED_ROUTINES, sendRequest } from '../../types';
import { RoutineListDetail } from './RoutineListDetail';

type tState = {
  routine: RoutineDTO;
  routines: RoutineDTO[];
};

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
      <>
        <Tabs>
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
          {is.undefined(this.props.groupState) ? undefined : (
            <Tabs.TabPane tab="Room States" key="roomStates">
              <List pagination={{ size: 'small' }} />
            </Tabs.TabPane>
          )}
        </Tabs>
        {this.state.routine ? (
          <Drawer
            title="Edit routine"
            size="large"
            onClose={() => this.setState({ routine: undefined })}
            visible={!is.undefined(this.state.routine)}
          >
            <RoutineListDetail
              nested
              routine={this.state.routine}
              onUpdate={routine => this.updateRoutine(routine)}
            />
          </Drawer>
        ) : undefined}
      </>
    );
  }
  private async refresh(): Promise<void> {
    const queries = this.routineQueries();
    const routines: Record<string, RoutineDTO> = {};
    await each(queries, async control => {
      const out = await sendRequest<RoutineDTO[]>({ control, url: `/routine` });
      out.forEach(i => (routines[i._id] = i));
    });
    this.setState({ routines: Object.values(routines) });
  }

  private routineQueries(): ResultControlDTO[] {
    if (this.props.roomState) {
      return RELATED_ROUTINES.room_state(this.props.roomState._id);
    }
    if (this.props.groupAction) {
      return RELATED_ROUTINES.group_action(this.props.groupAction._id);
    }
    if (this.props.groupState) {
      return RELATED_ROUTINES.group_state(this.props.groupState._id);
    }
    if (this.props.entity) {
      this.currentEntity = this.props.entity;
      return RELATED_ROUTINES.entity(this.currentEntity);
    }
    if (this.props.routine) {
      return RELATED_ROUTINES.routine(this.props.routine._id);
    }
    return [{}];
  }

  private updateRoutine(routine: RoutineDTO): void {
    this.setState({ routine });
  }
}
