import { AutoLogService, OnEvent, QuickScript } from '@steggy/boilerplate';

import {
  LUTRON_HOST,
  LUTRON_PASSWORD,
  LUTRON_PORT,
  LUTRON_USERNAME,
  RECONNECT_INTERVAL,
} from './config';
import { LUTRON_EVENT } from './constants';
import { LutronClientService } from './lutron-client.service';

@QuickScript({
  application: Symbol('lutron-relay'),
  configuration: {
    [LUTRON_HOST]: {
      description: 'Connection host',
      type: 'string',
    },
    [LUTRON_PASSWORD]: {
      default: 'integration',
      description: 'Authentication password',
      type: 'string',
    },
    [LUTRON_PORT]: {
      default: 23,
      description: 'Connection port',
      type: 'number',
    },
    [LUTRON_USERNAME]: {
      default: 'lutron',
      description: 'Authentication username',
      type: 'string',
    },
    [RECONNECT_INTERVAL]: {
      default: 5000,
      description: 'Reconnect interval on dropped connection',
      type: 'number',
    },
  },
  providers: [LutronClientService],
})
export class LutronRelay {
  constructor(private readonly logger: AutoLogService) {}

  @OnEvent(LUTRON_EVENT)
  protected onEvent(line: string): void {
    this.logger.info(line);
  }
}
