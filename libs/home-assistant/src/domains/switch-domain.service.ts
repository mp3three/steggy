import { Injectable } from '@nestjs/common';
import { domain } from '@steggy/home-assistant-shared';
import { is, START } from '@steggy/utilities';

import { HACallService } from '../services';

@Injectable()
export class SwitchDomainService {
  constructor(private readonly callService: HACallService) {
    this.callService.domain = 'switch';
  }

  public async toggle(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'toggle',
      { entity_id },
      domain(is.string(entity_id) ? entity_id : entity_id[START]),
      waitForChange,
    );
  }

  public async turnOff(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_off',
      { entity_id },
      domain(is.string(entity_id) ? entity_id : entity_id[START]),
      waitForChange,
    );
  }

  public async turnOn(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_on',
      { entity_id },
      domain(is.string(entity_id) ? entity_id : entity_id[START]),
      waitForChange,
    );
  }
}
