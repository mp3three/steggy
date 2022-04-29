import { RoutineCommandWebhookDTO } from '@steggy/controller-shared';
import React from 'react';

import { WebhookRequest } from '../../misc/WebhookRequest';

export function WebhookCommand(props: {
  command?: RoutineCommandWebhookDTO;
  onUpdate: (command: Partial<RoutineCommandWebhookDTO>) => void;
}) {
  return (
    <WebhookRequest
      webhook={props.command}
      onUpdate={command => props.onUpdate(command)}
    />
  );
}
