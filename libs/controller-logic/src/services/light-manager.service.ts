import { LightingCacheDTO } from '@automagical/contracts/controller-logic';
import {
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import {
  CacheManagerService,
  InjectCache,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';

import { CircadianService } from './circadian.service';

const LIGHTING_CACHE_PREFIX = 'LIGHTING:';
const CACHE_KEY = (entity) => `${LIGHTING_CACHE_PREFIX}${entity}`;

/**
 * - State management for lights
 * - Forwards commands to light domain service
 * - Management of the light temperature for lights flagged as circadian mode
 */
@Injectable()
export class LightManagerService {
  // #region Constructors

  constructor(
    @InjectCache() private readonly cache: CacheManagerService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly lightService: LightDomainService,
    private readonly circadianService: CircadianService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Retrieve a list of lights that are supposed to be turned on right now
   */
  @Trace()
  public async getActiveLights(): Promise<string[]> {
    const list = await this.cache.store.keys();
    return list
      .filter(
        (item) =>
          item.slice(0, LIGHTING_CACHE_PREFIX.length) === LIGHTING_CACHE_PREFIX,
      )
      .map((item) => item.slice(LIGHTING_CACHE_PREFIX.length));
  }

  @Trace()
  public async getState(entity_id: string): Promise<LightingCacheDTO> {
    return await this.cache.get(CACHE_KEY(entity_id));
  }

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    if (Array.isArray(entity_id)) {
      each(entity_id, async (entity, callback) => {
        await this.turnOff(entity);
        callback();
      });
      return;
    }
    await this.cache.del(CACHE_KEY(entity_id));
    await this.hassCoreService.turnOff(entity_id);
  }

  @Trace()
  public async turnOn(
    entity_id: string | string[],
    settings: Partial<LightingCacheDTO>,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.turnOn(id, settings);
        callback();
      });
      return;
    }
    if (settings.mode === 'circadian') {
      settings.kelvin = this.circadianService.CURRENT_LIGHT_TEMPERATURE;
    }
    const current = await this.cache.get<LightingCacheDTO>(
      CACHE_KEY(entity_id),
    );
    settings.brightness ??= current?.brightness ?? 100;
    await this.cache.set(CACHE_KEY(entity_id), settings);
    await this.lightService.turnOn(entity_id, {
      brightness_pct: settings.brightness,
      kelvin: settings.kelvin,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async circadianLightingUpdate(): Promise<void> {
    this.circadianService.observable.subscribe(async (kelvin) => {
      const lights = await this.getActiveLights();
      await each(lights, async (id, callback) => {
        const state = await this.getState(id);
        if (state?.mode !== 'circadian' || state.kelvin === kelvin) {
          return;
        }
        await this.turnOn(id, state);
        callback();
      });
    });
  }

  // #endregion Protected Methods
}
