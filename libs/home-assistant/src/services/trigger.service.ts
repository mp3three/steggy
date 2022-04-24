import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { HASSIO_WS_COMMAND } from '@steggy/home-assistant-shared';

import { HASocketAPIService } from './ha-socket-api.service';

@Injectable()
export class TriggerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketApi: HASocketAPIService,
  ) {}

  public async subscribe(
    trigger: Record<string, unknown>,
    callback: () => void,
  ): Promise<number> {
    const data = { trigger, type: HASSIO_WS_COMMAND.subscribe_trigger };
    const id = await this.socketApi.sendMessage<number>(data, false, () => {
      callback();
    });
    this.logger.debug({ trigger }, `Added device trigger {${id}}`);
    return id;
  }

  public async unsubscribe(subscription: number): Promise<void> {
    await this.socketApi.sendMessage({
      subscription,
      type: HASSIO_WS_COMMAND.unsubscribe_events,
    });
    this.logger.debug(`Removed trigger {${subscription}}`);
  }
}
