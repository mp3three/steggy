import type { FetchWith } from '@automagical/utilities';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { BASE_URL, TOKEN } from '../config';
import { HassStateDTO } from '../contracts';

@Injectable()
export class HomeAssistantFetchAPIService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(BASE_URL)
    private readonly baseUrl: string,
    @InjectConfig(TOKEN)
    private readonly bearer: string,
    private readonly fetchService: FetchService,
  ) {}

  /**
   * Wrapper to set baseUrl
   */
  @Trace()
  public fetch<T>(fetchWitch: FetchWith): Promise<T> {
    return this.fetchService.fetch<T>({
      baseUrl: this.baseUrl,
      bearer: this.bearer,
      ...fetchWitch,
    });
  }

  @Trace()
  public async fetchEntityCustomizations<
    T extends Record<never, unknown> = Record<
      'global' | 'local',
      Record<string, string>
    >,
  >(entityId: string | string[]): Promise<T> {
    return await this.fetch<T>({
      url: `/api/config/customize/config/${entityId}`,
    });
  }

  /**
   * Request historical information about an entity
   */
  @Trace()
  public async fetchEntityHistory<T extends HassStateDTO = HassStateDTO>(
    entity_id: string,
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    parameters: Record<string, string> = {},
  ): Promise<T[]> {
    this.logger.info(
      { from: from.toISOString(), to: to.toISOString() },
      `[${entity_id}] Fetch entity history`,
    );
    const [history] = await this.fetch({
      params: {
        end_time: to.toISOString(),
        filter_entity_id: entity_id,
        ...parameters,
      },
      url: `/api/history/period/${from.toISOString()}`,
    });
    return history;
  }
}
