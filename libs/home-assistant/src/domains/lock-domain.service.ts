import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@text-based/home-assistant-shared';

import { HACallService } from '../services';

@Injectable()
export class LockDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.lock;
  }

  public async lock(entityId: string | string[]): Promise<void> {
    return await this.callService.call('lock', {
      entity_id: entityId,
    });
  }

  public async open(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open', {
      entity_id: entityId,
    });
  }

  public async unlock(entityId: string | string[]): Promise<void> {
    return await this.callService.call('unlock', {
      entity_id: entityId,
    });
  }
}
