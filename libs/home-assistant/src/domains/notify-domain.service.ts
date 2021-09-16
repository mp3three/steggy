import { HASS_DOMAINS } from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class NotifyDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.notify;
  }

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
}
