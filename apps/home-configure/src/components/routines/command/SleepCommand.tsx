import { RoutineCommandSleepDTO } from '@steggy/controller-shared';
import { InputNumber } from 'antd';
import React from 'react';

export function SleepCommand(props: {
  command?: RoutineCommandSleepDTO;
  onUpdate: (command: Partial<RoutineCommandSleepDTO>) => void;
}) {
  return (
    <InputNumber
      value={props.command?.duration}
      onChange={duration => props.onUpdate({ duration })}
      addonAfter="seconds"
    />
  );
}
