import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/remote/
 */
@Injectable()
export class MediaPlayerDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.media_player;
  }

  @Trace()
  public async sendCommand(entityId: string | string[]): Promise<void> {
    return await this.callService.call('send_command', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async toggle(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOn(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }
}
