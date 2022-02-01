import { RoutineCommandSendNotificationDTO } from '@text-based/controller-shared';
import { Input } from 'antd';
import React from 'react';

type tState = {
  template: string;
};

export class SendNotificationCommand extends React.Component<
  { command?: RoutineCommandSendNotificationDTO },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    const { command } = this.props;
    if (command) {
      this.setState({ template: command.template });
    }
  }

  public getValue(): RoutineCommandSendNotificationDTO {
    return {
      template: this.state.template,
    };
  }

  override render() {
    return (
      <Input.TextArea
        value={this.state.template}
        onChange={({ target }) => this.setState({ template: target.value })}
      />
    );
  }
}
