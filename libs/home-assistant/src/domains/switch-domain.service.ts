import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@automagical/home-assistant-shared';

import { HACallService } from '../services';

@Injectable()
export class SwitchDomainService {
  constructor(private readonly callService: HACallService) {
    this.callService.domain = HASS_DOMAINS.switch;
  }

  public async toggle(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'toggle',
      {
        entity_id,
      },
      undefined,
      waitForChange,
    );
  }

  public async turnOff(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_off',
      {
        entity_id,
      },
      undefined,
      waitForChange,
    );
  }

  public async turnOn(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_on',
      {
        entity_id,
      },
      undefined,
      waitForChange,
    );
  }
}
