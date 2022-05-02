import {
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
  RoutineTriggerEvent,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { RoutineActivateDrawer } from './RoutineActivateDrawer';

export function ActivateHistory(props: {
  onUpdate?: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [events, setEvents] = useState<RoutineTriggerEvent[]>([]);
  const [activate, setActivate] = useState<RoutineActivateDTO>();

  useEffect(() => {
    async function refresh(): Promise<void> {
      if (is.empty(props.routine?._id)) {
        return;
      }
      setEvents(
        await sendRequest<RoutineTriggerEvent[]>({
          control: {
            filters: new Set([
              {
                field: 'routine',
                value: props.routine._id,
              },
            ]),
            sort: ['time'],
          },
          url: `/debug/recent-activations`,
        }),
      );
    }
    refresh();
  }, [props.routine]);

  function renderSource(source: string) {
    if (is.empty(source)) {
      return <Typography.Text type="secondary">None listed</Typography.Text>;
    }
    const routine = props.routine;
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
          onClick={() => setActivate(item)}
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
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${props.routine._id}/activate/${activate.id}`,
    });
    body = routine.activate.find(({ id }) => id === activate.id);
    setActivate(body as RoutineActivateDTO);
    if (props.onUpdate) {
      props.onUpdate(routine);
    }
  }

  return (
    <>
      <Table dataSource={events} pagination={{ size: 'small' }}>
        <Table.Column
          title="Time"
          key="time"
          dataIndex="time"
          render={(value: number) => new Date(value).toLocaleString()}
        />
        <Table.Column
          title="Activation Source"
          key="source"
          dataIndex="source"
          render={(value: string) => renderSource(value)}
        />
      </Table>

      <RoutineActivateDrawer
        routine={props.routine}
        onUpdate={activate => updateActivate(activate)}
        onComplete={() => setActivate(undefined)}
        activate={activate}
      />
    </>
  );
}
