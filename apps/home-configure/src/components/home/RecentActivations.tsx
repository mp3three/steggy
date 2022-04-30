import { RoutineDTO, RoutineTriggerEvent } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

export function RecentActivations() {
  const [events, setEvents] = useState<RoutineTriggerEvent[]>([]);
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  function onRoutineUpdate(routine: RoutineDTO): void {
    setRoutines(routines.map(r => (r._id === routine._id ? routine : r)));
  }

  async function refresh(): Promise<void> {
    setEvents(
      await sendRequest<RoutineTriggerEvent[]>({
        url: `/debug/recent-activations`,
      }),
    );
    setRoutines(
      await sendRequest<RoutineDTO[]>({
        url: `/routine`,
      }),
    );
  }

  function renderSource(routine: RoutineDTO, source: string) {
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

  return (
    <Card
      title={
        <Typography.Title level={5}>
          Recent Routine Activations
        </Typography.Title>
      }
      extra={
        <>
          <Typography.Text code>{events.length} activations</Typography.Text>
          <Button type="text" size="small" onClick={() => refresh()}>
            {FD_ICONS.get('refresh')}
          </Button>
        </>
      }
    >
      <Table dataSource={events} pagination={{ size: 'small' }}>
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
              routine={routines.find(({ _id }) => _id === value)}
              onUpdate={routine => onRoutineUpdate(routine)}
            />
          )}
        />
        <Table.Column
          title="Activation Source"
          key="source"
          dataIndex="source"
          render={(value: string, record: RoutineTriggerEvent) =>
            renderSource(
              routines.find(({ _id }) => _id === record.routine),
              value,
            )
          }
        />
      </Table>
    </Card>
  );
}
