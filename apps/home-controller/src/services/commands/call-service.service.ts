// ManualEntityCommandDTO

import { AutoLogService } from '@steggy/boilerplate';
import { iRoutineCommand, RoutineCommand } from '@steggy/controller-sdk';
import {
  CallServiceCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';
import { HACallService } from '@steggy/home-assistant';
import { domain as getDomain } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

@RoutineCommand({
  description:
    'Execute a command against a device through the home assistant api',
  name: 'Call Service',
  type: 'call_service',
})
// ServiceServiceService
export class CallServiceService
  implements iRoutineCommand<CallServiceCommandDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly callService: HACallService,
  ) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<CallServiceCommandDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    const {
      command: {
        service,
        domain,
        entity_id,
        attributes = {},
        set_attributes = [],
      },
    } = command;
    if (is.empty(entity_id)) {
      this.logger.error({ command }, `{entity_id} not provided`);
      return;
    }
    if (is.empty(service)) {
      this.logger.error({ command }, `{service} not provided`);
      return;
    }
    const filtered = Object.fromEntries(
      Object.entries(attributes).filter(([field]) =>
        set_attributes.includes(field),
      ),
    );
    const service_data = { ...filtered, entity_id };
    this.logger.debug({ service_data }, `[${entity_id}] {${service}}`);

    await this.callService.call(
      service,
      service_data,
      domain || getDomain(entity_id),
      waitForChange,
    );
  }
}
