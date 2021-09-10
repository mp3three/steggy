import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class SwitchDomainService {
  constructor(private readonly callService: HACallService) {
    this.callService.domain = HASS_DOMAINS.switch;
  }

  @Trace()
  public async toggle(entity_id: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id,
    });
  }

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id,
    });
  }

  @Trace()
  public async turnOn(entity_id: string | string[]): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id,
    });
  }
}
