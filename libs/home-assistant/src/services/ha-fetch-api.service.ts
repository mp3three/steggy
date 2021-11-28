import type { FetchWith } from '@ccontour/utilities';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
} from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

import { BASE_URL, TOKEN } from '../config';
import { HassStateDTO, HomeAssistantServerLogItem } from '../contracts';

const TIMESTAMP_OFFSET = 1000;

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
   * Pass through of home assistant's yaml check
   */
  public async checkConfig(): Promise<unknown> {
    return await this.fetch({
      method: `post`,
      url: `/api/config/core/check_config`,
    });
  }
  /**
   * Wrapper to set baseUrl
   */
  public fetch<T>(fetchWitch: FetchWith): Promise<T> {
    return this.fetchService.fetch<T>({
      baseUrl: this.baseUrl,
      bearer: this.bearer,
      ...fetchWitch,
    });
  }

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
  public async fetchEntityHistory<T extends HassStateDTO = HassStateDTO>(
    entity_id: string,
    from: Date,
    to: Date,
    extra: { minimal_response?: '' } = {},
  ): Promise<T[]> {
    this.logger.info(
      { from: from.toISOString(), to: to.toISOString() },
      `[${entity_id}] Fetch entity history`,
    );
    const [history] = await this.fetch({
      params: {
        end_time: to.toISOString(),
        filter_entity_id: entity_id,
        ...extra,
      },
      url: `/api/history/period/${from.toISOString()}`,
    });
    return history;
  }

  /**
   * Pass through of home assistant's get logs.
   *
   * Correct timestamps for javascript-ness
   */
  public async getLogs(): Promise<HomeAssistantServerLogItem[]> {
    const results = await this.fetch<HomeAssistantServerLogItem[]>({
      url: `/api/error/all`,
    });
    return results.map((i) => {
      i.timestamp = Math.floor(i.timestamp * TIMESTAMP_OFFSET);
      i.first_occurred = Math.floor(i.first_occurred * TIMESTAMP_OFFSET);
      return i;
    });
  }

  /**
   * Pass through of home assistant's get logs.
   *
   * Correct timestamps for javascript-ness
   */
  public async getRawLogs(): Promise<string> {
    return await this.fetch<string>({
      process: 'text',
      url: `/api/error_log`,
    });
  }
}
