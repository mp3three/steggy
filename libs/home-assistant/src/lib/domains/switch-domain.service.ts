import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class SwitchDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(SwitchDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    this.callService.domain = HASS_DOMAINS.switch;
  }

  // #endregion Constructors

  // #region Public Methods

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

  // #endregion Public Methods
}
