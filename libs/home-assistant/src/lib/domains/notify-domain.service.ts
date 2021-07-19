import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class NotifyDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(NotifyDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    callService.domain = HASS_DOMAINS.notify;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async notify(
    message: string,
    optional: {
      title?: string;
      target?: string;
      data?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    await this.callService.call('notify', {
      message,
      ...optional,
    });
  }

  // #endregion Public Methods
}
