import { Injectable } from '@nestjs/common';
import { EntityHistoryRequest } from '@text-based/controller-logic';
import { HassStateDTO } from '@text-based/home-assistant';
import { PromptService } from '@text-based/tty';
import dayjs from 'dayjs';

import { HomeFetchService } from '../home-fetch.service';
const FROM_OFFSET = 1;

@Injectable()
export class EntityHistoryService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async promptEntityHistory(id: string): Promise<HassStateDTO[]> {
    const from = await this.promptService.timestamp(
      `From date`,
      dayjs().subtract(FROM_OFFSET, 'day').toDate(),
    );
    const to = await this.promptService.timestamp('End date');
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
