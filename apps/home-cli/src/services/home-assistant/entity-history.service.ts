import { EntityHistoryRequest } from '@steggy/controller-shared';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { PromptService } from '@steggy/tty';
import { Injectable } from '@nestjs/common';

import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class EntityHistoryService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async fetchHistory(
    id: string,
    from: Date,
    to: Date,
  ): Promise<HassStateDTO[]> {
    return await this.fetchService.fetch({
      body: { from, to } as EntityHistoryRequest,
      method: 'post',
      url: `/entity/history/${id}`,
    });
  }

  public async promptEntityHistory(id: string): Promise<HassStateDTO[]> {
    return await this.fetchService.fetch({
      body: (await this.promptService.dateRange()) as EntityHistoryRequest,
      method: 'post',
      url: `/entity/history/${id}`,
    });
  }
}
