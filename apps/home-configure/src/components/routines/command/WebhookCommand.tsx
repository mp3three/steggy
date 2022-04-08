import { RoutineCommandWebhookDTO } from '@steggy/controller-shared';
import React from 'react';

import { WebhookRequest } from '../../misc/WebhookRequest';

export class WebhookCommand extends React.Component<{
  command?: RoutineCommandWebhookDTO;
  onUpdate: (command: Partial<RoutineCommandWebhookDTO>) => void;
}> {
  override render() {
    return (
      <WebhookRequest
        webhook={this.props.command}
        onUpdate={this.props.onUpdate.bind(this)}
      />
    );
  }
}
