import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class LockDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(LockDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    callService.domain = HASS_DOMAINS.lock;
  }

  // #endregion Constructors

  // #region Public Methods

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

  // #endregion Public Methods
}
