import { EntityHistoryRequest } from '@ccontour/controller-logic';
import { HassStateDTO } from '@ccontour/home-assistant';
import { PromptService } from '@ccontour/tty';
import { Injectable } from '@nestjs/common';

import { HomeFetchService } from './home-fetch.service';

@Injectable()
export class EntityHistoryService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async promptEntityHistory(id: string): Promise<HassStateDTO[]> {
    const from = await this.promptService.date(`From date`);
    const to = await this.promptService.date('End date');
    return await this.fetchService.fetch({
      body: {
        from,
        to,
      } as EntityHistoryRequest,
      method: 'post',
      url: `/entity/history/${id}`,
    });
  }
}
