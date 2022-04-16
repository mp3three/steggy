import {
  DebugReportDTO,
  GroupDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Empty, List, Tabs, Tooltip } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { GroupInspectButton } from '../groups';
import { RoomInsectButton } from '../rooms';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

type tState = DebugReportDTO;

export class DebuggerSettings extends React.Component {
  override state = { groups: [], rooms: [], routines: [] } as tState;

  private get valid() {
    return is.empty([
      ...this.state.groups,
      ...this.state.rooms,
      ...this.state.routines,
    ]);
  }

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Card
        extra={
          <Tooltip
            title="Additional information available in server logs as warning level messages."
            placement="topLeft"
            color="blue"
          >
            <Button onClick={() => this.refresh()}>Refresh</Button>
          </Tooltip>
        }
      >
        {this.valid ? (
          <Empty description="Everything is valid!" />
        ) : (
          <Tabs>
            {is.empty(this.state.groups) ? undefined : (
              <Tabs.TabPane tab="Groups" key="group">
                <List
                  dataSource={this.state.groups}
                  renderItem={group => (
                    <List.Item>
                      <GroupInspectButton
                        group={group}
                        onUpdate={group => this.updateGroup(group)}
                      />
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            )}
            {is.empty(this.state.rooms) ? undefined : (
              <Tabs.TabPane tab="Rooms" key="room">
                <List
                  dataSource={this.state.rooms}
                  renderItem={room => (
                    <List.Item>
                      <RoomInsectButton
                        room={room}
                        onUpdate={update => this.updateRoom(update)}
                      />
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            )}
            {is.empty(this.state.routines) ? undefined : (
              <Tabs.TabPane tab="Routines" key="routine">
                <List
                  dataSource={this.state.routines}
                  renderItem={routine => (
                    <List.Item>
                      <RoutineInspectButton
                        routine={routine}
                        onUpdate={update => this.updateRoutine(update)}
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

  private async refresh(): Promise<void> {
    const result = await sendRequest<DebugReportDTO>({
      url: `/debug/find-broken`,
    });
    this.setState(result);
  }

  private updateGroup(group: GroupDTO): void {
    this.setState({
      groups: this.state.groups.map(g => (g._id === group._id ? group : g)),
    });
  }

  private updateRoom(room: RoomDTO): void {
    this.setState({
      rooms: this.state.rooms.map(r => (r._id === room._id ? room : r)),
    });
  }

  private updateRoutine(routine: RoutineDTO): void {
    this.setState({
      routines: this.state.routines.map(r =>
        r._id === routine._id ? routine : r,
      ),
    });
  }
}
