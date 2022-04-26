import { RoutineDTO, RoutineTriggerEvent } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Table, Typography } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

type tState = {
  events: RoutineTriggerEvent[];
  routines: RoutineDTO[];
};

export class RecentActivations extends React.Component {
  override state = { events: [] } as tState;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render(): React.ReactNode {
    return (
      <Card
        title={
          <Typography.Title level={5}>
            Recent Routine Activations
          </Typography.Title>
        }
        extra={
          <>
            <Typography.Text code>
              {this.state.events.length} activations
            </Typography.Text>
            <Button type="text" size="small" onClick={() => this.refresh()}>
              {FD_ICONS.get('refresh')}
            </Button>
          </>
        }
      >
        <Table dataSource={this.state.events} pagination={{ size: 'small' }}>
          <Table.Column
            title="Time"
            key="time"
            dataIndex="time"
            render={(value: number) => new Date(value).toLocaleString()}
          />
          <Table.Column
            title="Routine"
            key="routine"
            dataIndex="routine"
            render={(value: string) => (
              <RoutineInspectButton
                routine={this.state.routines.find(({ _id }) => _id === value)}
                onUpdate={routine => this.onRoutineUpdate(routine)}
              />
            )}
          />
          <Table.Column
            title="Activation Source"
            key="source"
            dataIndex="source"
            render={(value: string, record: RoutineTriggerEvent) =>
              this.renderSource(
                this.state.routines.find(({ _id }) => _id === record.routine),
                value,
              )
            }
          />
        </Table>
      </Card>
    );
  }

  private onRoutineUpdate(routine: RoutineDTO): void {
    this.setState({
      routines: this.state.routines.map(r =>
        r._id === routine._id ? routine : r,
      ),
    });
  }

  private async refresh(): Promise<void> {
    this.setState({
      events: await sendRequest<RoutineTriggerEvent[]>({
        url: `/debug/recent-activations`,
      }),
      routines: await sendRequest<RoutineDTO[]>({
        url: `/routine`,
      }),
    });
  }

  private renderSource(routine: RoutineDTO, source: string) {
    if (is.empty(source)) {
      return <Typography.Text type="secondary">None listed</Typography.Text>;
    }
    const activate = routine.activate.find(({ id }) => id === source);
    if (activate) {
      return (
        <Typography.Text code>
          Activation event: {activate.friendlyName}
        </Typography.Text>
      );
    }
    return source;
  }
}
