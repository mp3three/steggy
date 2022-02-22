import { RoutineCommandWebhookDTO } from '@automagical/controller-shared';
import React from 'react';

import { WebhookRequest } from '../../misc/WebhookRequest';

type tState = {
  command: RoutineCommandWebhookDTO;
};

export class WebhookCommand extends React.Component<
  { command?: RoutineCommandWebhookDTO },
  tState
> {
  override componentDidMount(): void {
    const { command } = this.props;
    this.load(command);
  }

  public getValue(): RoutineCommandWebhookDTO {
    return this.state.command;
  }

  public load(command: RoutineCommandWebhookDTO): void {
    this.setState({ command });
  }

  override render() {
    return (
      <WebhookRequest
        webhook={this.props.command}
        onUpdate={command =>
          this.setState({
            command: {
              ...this.state.command,
              ...command,
            },
          })
        }
      />
    );
  }
}
