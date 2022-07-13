import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Divider, Select, Tooltip, Typography } from 'antd';

import { FD_ICONS } from '../../../types';

export function RepeatRun(props: {
  onUpdate: (routine: Partial<RoutineDTO>) => void;
  routine: RoutineDTO;
}) {
  return (
    <>
      <Divider orientation="left">
        <Tooltip
          title={
            <Typography>
              {
                'Manual activation via api call may ignore this setting by adding including '
              }
              <Typography.Text code>force: true</Typography.Text>
              {' option'}
            </Typography>
          }
        >
          {FD_ICONS.get('information')}
          {` Repeat Runs`}
        </Tooltip>
      </Divider>
      <Select
        style={{ width: '250px' }}
        disabled={!props.routine.sync}
        value={props.routine.repeat ?? 'normal'}
        onChange={repeat => props.onUpdate({ repeat })}
      >
        <Select.Option value="normal">Normal</Select.Option>
        <Select.Option value="queue">Queue</Select.Option>
        <Select.Option value="block">Block until complete</Select.Option>
        <Select.Option value="interrupt">Interrupt</Select.Option>
      </Select>
      {!props.routine.sync ? (
        <Typography.Paragraph type="secondary">
          Setting only used with sync routines.
        </Typography.Paragraph>
      ) : (
        <Typography.Paragraph type="secondary">
          {/* Shh... it's secretly a switch statement in disguise */}
          {is.empty(props.routine.repeat) || props.routine.repeat === 'normal'
            ? 'This routine will not automatically interact with itself.'
            : undefined}
          {props.routine.repeat === 'queue'
            ? 'Repeat runs of this routine will queue and execute in order. First in first out.'
            : undefined}
          {props.routine.repeat === 'block'
            ? 'Repeat runs of this routine will be blocked until the first one is complete.'
            : undefined}
          {props.routine.repeat === 'interrupt'
            ? 'Repeat runs of this routine will also attempt to interrupt previous runs, stopping new commands from being run.'
            : undefined}
        </Typography.Paragraph>
      )}
    </>
  );
}
