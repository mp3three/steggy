import { HASS_DOMAINS } from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class LockDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.lock;
  }

  @Trace()
  public async lock(entityId: string | string[]): Promise<void> {
    return await this.callService.call('lock', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async open(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async unlock(entityId: string | string[]): Promise<void> {
    return await this.callService.call('unlock', {
      entity_id: entityId,
    });
  }
}
