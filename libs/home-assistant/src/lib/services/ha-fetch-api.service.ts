import {
  HOME_ASSISTANT_BASE_URL,
  HOME_ASSISTANT_TOKEN,
} from '@automagical/contracts/config';
import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { FetchWith } from '@automagical/contracts/utilities';
import { FetchService, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class HomeAssistantFetchAPIService {
  // #region Constructors

  constructor(
    @InjectLogger(HomeAssistantFetchAPIService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Wrapper to set baseUrl
   */
  @Trace()
  public fetch<T>(fetchWitch: FetchWith): Promise<T> {
    return this.fetchService.fetch<T>({
      baseUrl: this.configService.get(HOME_ASSISTANT_BASE_URL),
      bearer: this.configService.get(HOME_ASSISTANT_TOKEN),
      ...fetchWitch,
    });
  }

  @Trace()
  public async fetchEntityCustomizations<
    T extends Record<never, unknown> = Record<
      'global' | 'local',
      Record<string, string>
    >,
  >(entityId: string): Promise<T> {
    return await this.fetch<T>({
      url: `/api/config/customize/config/${entityId}`,
    });
  }

  /**
   * Request historical information about an entity
   */
  @Trace()
  public async fetchEntityHistory<T extends unknown[] = unknown[]>(
    days: number,
    entity_id: string,
  ): Promise<T> {
    return await this.fetch<T>({
      params: {
        end_time: dayjs().toISOString(),
        filter_entity_id: entity_id,
        significant_changes_only: '',
      },
      url: `/api/history/period/${dayjs().subtract(days, 'd').toISOString()}`,
    });
  }

  // #endregion Public Methods
}
