// ManualEntityCommandDTO

import { AutoLogService } from '@steggy/boilerplate';
import { iRoutineCommand, RoutineCommand } from '@steggy/controller-sdk';
import {
  CallServiceCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';
import { HomeAssistantFetchAPIService } from '@steggy/home-assistant';
import { domain } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

@RoutineCommand({
  description:
    'Execute a command against a device through the home assistant api',
  name: 'Home Assistant: Call Service',
  type: 'call_service',
})
// ServiceServiceService
export class CallServiceService
  implements iRoutineCommand<CallServiceCommandDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeAssistantFetchAPIService,
  ) {}

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<CallServiceCommandDTO>;
  }): Promise<void> {
    const {
      command: { service, entity_id, attributes = {}, set_attributes = [] },
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
    this.logger.debug(filtered, `[${entity_id}] {${service}}`);
    await this.fetchService.fetch({
      body: { ...filtered, entity_id },
      method: 'post',
      url: `/api/services/${domain(entity_id)}/${service}`,
    });
  }
}
