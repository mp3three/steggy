import { RoutineCommandSleepDTO } from '@text-based/controller-shared';
import { InputNumber } from 'antd';
import React from 'react';

type tState = {
  duration: number;
};

export class SleepCommand extends React.Component<
  { command?: RoutineCommandSleepDTO },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    const { command } = this.props;
    if (command) {
      this.setState({ duration: command.duration });
    }
  }

  public getValue(): RoutineCommandSleepDTO {
    return { duration: this.state.duration };
  }

  override render() {
    return (
      <InputNumber
        value={this.state.duration}
        onChange={duration => this.setState({ duration })}
        addonAfter="seconds"
      />
    );
  }
}
