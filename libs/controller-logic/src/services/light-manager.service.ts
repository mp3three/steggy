import {
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';
import { EventEmitter2 } from 'eventemitter2';

import { DIM_PERCENT } from '../config';
import { CIRCADIAN_UPDATE, LightingCacheDTO } from '../contracts';
import { RoomCommandDTO } from '../contracts/room-command.dto';
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
  constructor(
    @InjectCache() private readonly cache: CacheManagerService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly lightService: LightDomainService,
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly circadianService: CircadianService,
    private readonly eventEmitter: EventEmitter2,
    @InjectConfig(DIM_PERCENT) private readonly dimPercent: number,
  ) {}

  @Trace()
  public async circadianLight(
    entity_id: string | string[],
    brightness?: number,
  ): Promise<void> {
    entity_id ??= [];
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.circadianLight(id, brightness);
        callback();
      });
      return;
    }
    await this.turnOnEntities(entity_id, {
      brightness,
      mode: 'circadian',
    });
  }

  @Trace()
  public async dimDown(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment } = data;
    const lights = await this.findDimmableLights(change);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, this.dimPercent * (increment ?? 1) * -1);
      callback();
    });
  }

  @Trace()
  public async dimUp(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment } = data;
    const lights = await this.findDimmableLights(change);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, this.dimPercent * (increment ?? 1));
      callback();
    });
  }

  @Trace()
  public async findDimmableLights(change: string[]): Promise<string[]> {
    const lights = await this.getActiveLights();
    return change.filter((light) => lights.includes(light));
  }

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

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let { brightness } = await this.getState(entityId);
    brightness += amount;
    if (brightness > 100) {
      brightness = 100;
    }
    if (brightness < 5) {
      brightness = 5;
    }
    this.logger.debug({ amount }, `${entityId} set brightness: ${brightness}%`);
    return await this.circadianLight(entityId, brightness);
  }

  @Trace()
  public async turnOffEntities(entity_id: string | string[]): Promise<void> {
    if (Array.isArray(entity_id)) {
      each(entity_id, async (entity, callback) => {
        await this.turnOffEntities(entity);
        callback();
      });
      return;
    }
    await this.cache.del(CACHE_KEY(entity_id));
    await this.hassCoreService.turnOff(entity_id);
  }

  @Trace()
  public async turnOnEntities(
    entity_id: string | string[],
    settings: Partial<LightingCacheDTO>,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.turnOnEntities(id, settings);
        callback();
      });
      return;
    }
    if (settings.mode === 'circadian') {
      settings.kelvin = await this.circadianService.CURRENT_LIGHT_TEMPERATURE;
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

  @Trace()
  protected async circadianLightingUpdate(kelvin: number): Promise<void> {
    const lights = await this.getActiveLights();
    await each(lights, async (id, callback) => {
      const state = await this.getState(id);
      if (state?.mode !== 'circadian' || state.kelvin === kelvin) {
        return;
      }
      await this.turnOnEntities(id, state);
      callback();
    });
  }

  @Trace()
  protected onModuleInit(): void {
    this.eventEmitter.on(CIRCADIAN_UPDATE, (kelvin) =>
      this.circadianLightingUpdate(kelvin),
    );
  }
}
