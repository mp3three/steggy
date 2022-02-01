import { RoutineCommandSendNotificationDTO } from '@text-based/controller-shared';
import { Form, Input } from 'antd';
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
    this.load(command);
  }

  public getValue(): RoutineCommandSendNotificationDTO {
    return {
      template: this.state.template,
    };
  }

  public load(command: Partial<RoutineCommandSendNotificationDTO> = {}): void {
    this.setState({ template: command.template });
  }

  override render() {
    return (
      <Form.Item label="Template">
        <Input.TextArea
          value={this.state.template}
          onChange={({ target }) => this.setState({ template: target.value })}
        />
      </Form.Item>
    );
  }
}
