import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/remote/
 */
@Injectable()
export class RemoteDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.remote;
  }

  public async sendCommand(entityId: string | string[]): Promise<void> {
    return await this.callService.call('send_command', {
      entity_id: entityId,
    });
  }

  public async toggle(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  public async turnOff(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  public async turnOn(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }
}
