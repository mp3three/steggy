import {
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
  RoutineTriggerEvent,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoutineActivateDrawer, RoutineInspectButton } from '../routines';

export function RecentActivations() {
  const [events, setEvents] = useState<RoutineTriggerEvent[]>([]);
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);
  const [routine, setRoutine] = useState<RoutineDTO>();
  const [activate, setActivate] = useState<RoutineActivateDTO>();

  useEffect(() => {
    refresh();
  }, []);

  function onRoutineUpdate(routine: RoutineDTO): void {
    setRoutines(routines.map(r => (r._id === routine._id ? routine : r)));
  }

  async function refresh(): Promise<void> {
    setEvents(
      await sendRequest<RoutineTriggerEvent[]>({
        control: {
          sort: ['time'],
        },
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
    const item = (routine?.activate ?? []).find(({ id }) => id === source);
    // If the activation event is deleted, then the text id will be printed
    // Better than nothing 🤷
    //
    // Also may print plain text descriptions (ex: manual activate)
    //
    if (item) {
      return (
        <Button
          size="small"
          onClick={() => {
            setActivate(item);
            setRoutine(routine);
          }}
          type={item.id === activate?.id ? 'primary' : 'text'}
        >
          {item?.friendlyName}
        </Button>
      );
    }
    return source;
  }

  async function updateActivate(
    body: Partial<ROUTINE_ACTIVATE_TYPES>,
  ): Promise<void> {
    const update = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${routine._id}/activate/${activate.id}`,
    });
    body = routine.activate.find(({ id }) => id === activate.id);
    setRoutine(update);
    setRoutines(
      routines.map(item => (item._id === update._id ? update : item)),
    );
    setActivate(update.activate.find(({ id }) => id === activate.id));
  }

  return (
    <Card
      type="inner"
      title={
        <Typography.Text strong>Recent Routine Activations</Typography.Text>
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
      <RoutineActivateDrawer
        routine={routine}
        onUpdate={activate => updateActivate(activate)}
        onComplete={() => setActivate(undefined)}
        activate={activate}
      />
    </Card>
  );
}
