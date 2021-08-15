import {
  HOME_ASSISTANT_BASE_URL,
  HOME_ASSISTANT_TOKEN,
} from '@automagical/contracts/config';
import { HassStateDTO } from '@automagical/contracts/home-assistant';
import type { FetchWith } from '@automagical/contracts/utilities';
import {
  AutoConfigService,
  AutoLogService,
  ConsumesConfig,
  FetchService,
  Trace,
} from '@automagical/utilities';
import dayjs from 'dayjs';

@ConsumesConfig([HOME_ASSISTANT_BASE_URL, HOME_ASSISTANT_TOKEN])
export class HomeAssistantFetchAPIService {
  // #region Constructors

  constructor(
    private readonly configService: AutoConfigService,
    private readonly logger: AutoLogService,
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

  // #endregion Public Methods
}
