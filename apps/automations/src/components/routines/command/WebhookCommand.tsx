import { RoutineCommandSleepDTO } from '@automagical/controller-shared';
import { InputNumber } from 'antd';
import React from 'react';

type tState = {
  duration: number;
};

export class WebhookCommand extends React.Component<
  { command?: RoutineCommandSleepDTO },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    const { command } = this.props;
    this.load(command);
  }

  public getValue(): RoutineCommandSleepDTO {
    return { duration: this.state.duration };
  }

  public load(command: Partial<RoutineCommandSleepDTO> = {}): void {
    this.setState({ duration: command.duration });
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
