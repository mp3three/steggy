import { DeviceListItemDTO } from '@automagical/home-assistant';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { encode } from 'ini';

import { HomeFetchService } from './home-fetch.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultValue?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromObject({
        List: 'list',
      }),
      undefined,
      defaultValue,
    );
    if (action === 'list') {
      const devices: DeviceListItemDTO[] = await this.fetchService.fetch({
        url: `/device/list`,
      });
      console.log(encode(devices));
      return await this.exec(action);
    }
    if (action === CANCEL) {
      return;
    }
    this.logger.error({ action }, `Not implemented`);
  }
}
