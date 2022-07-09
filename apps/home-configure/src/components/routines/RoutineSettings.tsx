import { RoutineDTO } from '@steggy/controller-shared';
import { Card, Space } from 'antd';

import { sendRequest } from '../../types';
import {
  RepeatRun,
  RoutineDescription,
  RoutineTags,
  SettingsHeader,
  SyncProcessing,
} from './settings';

export function RoutineSettings(props: {
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  async function update(body: Partial<RoutineDTO>): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(routine);
  }

  return (
    <Card type="inner">
      <Space direction="vertical" style={{ width: '100%' }}>
        <SettingsHeader routine={props.routine} />
        <SyncProcessing
          routine={props.routine}
          onUpdate={routine => update(routine)}
        />
        <RoutineTags
          routine={props.routine}
          onUpdate={routine => update(routine)}
        />
        <RepeatRun
          routine={props.routine}
          onUpdate={routine => update(routine)}
        />
        <RoutineDescription
          routine={props.routine}
          onUpdate={routine => update(routine)}
        />
      </Space>
    </Card>
  );
}
