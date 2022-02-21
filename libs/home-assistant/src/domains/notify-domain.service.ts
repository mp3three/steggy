import { HASS_DOMAINS } from '@automagical/home-assistant-shared';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class NotifyDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.notify;
  }

  public async notify(
    message: string,
    optional: {
      data?: Record<string, unknown>;
      target?: string;
      title?: string;
    } = {},
  ): Promise<void> {
    await this.callService.call('notify', {
      message,
      ...optional,
    });
  }
}
