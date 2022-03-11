import { RoutineCommandSendNotificationDTO } from '@automagical/controller-shared';
import { Form, Input } from 'antd';
import React from 'react';

export class SendNotificationCommand extends React.Component<{
  command?: RoutineCommandSendNotificationDTO;
  onUpdate: (command: Partial<RoutineCommandSendNotificationDTO>) => void;
}> {
  public load(command: Partial<RoutineCommandSendNotificationDTO> = {}): void {
    this.setState({ template: command.template });
  }

  override render() {
    return (
      <Form.Item label="Template">
        <Input.TextArea
          value={this.props.command?.template}
          onChange={({ target }) =>
            this.props.onUpdate({ template: target.value })
          }
        />
      </Form.Item>
    );
  }
}
