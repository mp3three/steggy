import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';

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
    waitForChange = false,
  ): Promise<void> {
    await this.callService.call(
      'notify',
      {
        message,
        ...optional,
      },
      undefined,
      waitForChange,
    );
  }
}
