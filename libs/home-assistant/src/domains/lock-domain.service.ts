import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';

import { HACallService } from '../services';

@Injectable()
export class LockDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.lock;
  }

  public async lock(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'lock',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async open(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'open',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async unlock(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'unlock',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }
}
