import { RoutineCommandSleepDTO } from '@steggy/controller-shared';
import { InputNumber } from 'antd';
import React from 'react';

export class SleepCommand extends React.Component<{
  command?: RoutineCommandSleepDTO;
  onUpdate: (command: Partial<RoutineCommandSleepDTO>) => void;
}> {
  override render() {
    return (
      <InputNumber
        value={this.props.command?.duration}
        onChange={duration => this.props.onUpdate({ duration })}
        addonAfter="seconds"
      />
    );
  }
}
