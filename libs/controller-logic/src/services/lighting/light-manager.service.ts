import {
  HomeAssistantCoreService,
  LightDomainService,
} from '@ccontour/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
  InjectLogger,
  IsEmpty,
} from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';
import { EventEmitter2 } from 'eventemitter2';

import { MIN_BRIGHTNESS } from '../../config';
import {
  CIRCADIAN_UPDATE,
  LIGHTING_MODE,
  LightingCacheDTO,
  RoomCommandDTO,
} from '../../contracts';
import { CircadianService } from './circadian.service';

const LIGHTING_CACHE_PREFIX = 'LIGHTING:';
const CACHE_KEY = (entity) => `${LIGHTING_CACHE_PREFIX}${entity}`;
const INVERT_VALUE = -1;
const PERCENT = 100;
const DEFAULT_INCREMENT = 1;
const START = 0;
const NO_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 255;

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
    @InjectConfig(MIN_BRIGHTNESS) private readonly minBrightness: number,
  ) {}

  public async circadianLight(
    entity_id: string | string[] = [],
    brightness?: number,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.circadianLight(id, brightness);
        callback();
      });
      return;
    }
    await this.setAttributes(entity_id, {
      brightness,
      mode: LIGHTING_MODE.circadian,
    });
  }

  public async dimDown(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = await this.findDimmableLights(change);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, increment * INVERT_VALUE);
      callback();
    });
  }

  public async dimUp(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = await this.findDimmableLights(change);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, increment);
      callback();
    });
  }

  public async findDimmableLights(change: string[]): Promise<string[]> {
    const lights = await this.getActiveLights();
    return change.filter((light) => lights.includes(light));
  }

  /**
   * Retrieve a list of lights that are supposed to be turned on right now
   */

  public async getActiveLights(): Promise<string[]> {
    const list: string[] = await this.cache.store.keys();
    return list
      .filter(
        (item) =>
          item.slice(START, LIGHTING_CACHE_PREFIX.length) ===
          LIGHTING_CACHE_PREFIX,
      )
      .map((item) => item.slice(LIGHTING_CACHE_PREFIX.length));
  }

  public async getState(entity_id: string): Promise<LightingCacheDTO> {
    return await this.cache.get(CACHE_KEY(entity_id));
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */

  public async lightDim(entityId: string, amount: number): Promise<void> {
    let { brightness = NO_BRIGHTNESS } = await this.getState(entityId);
    brightness += amount;
    if (brightness > MAX_BRIGHTNESS) {
      brightness = MAX_BRIGHTNESS;
    }
    if (brightness < this.minBrightness) {
      brightness = this.minBrightness;
    }
    this.logger.debug(
      { amount },
      `[${entityId}] set brightness: {${brightness}/${MAX_BRIGHTNESS} (${Math.floor(
        (brightness * PERCENT) / MAX_BRIGHTNESS,
      )}%)}`,
    );
    return await this.circadianLight(entityId, brightness);
  }

  public async setAttributes(
    entity_id: string | string[],
    settings: Partial<LightingCacheDTO> = {},
  ): Promise<void> {
    if (settings.kelvin && settings.hs_color) {
      this.logger.warn(
        { entity_id, settings },
        `Both kelvin and hs color provided`,
      );
    }
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.setAttributes(id, settings);
        callback();
      });
      return;
    }
    const current =
      (await this.getState(entity_id)) ?? ({} as LightingCacheDTO);
    // if the incoming mode is circadian
    // or there is no mode defined, and the current one is circadian
    if (
      settings.mode === LIGHTING_MODE.circadian ||
      (IsEmpty(settings.mode) && current?.mode === LIGHTING_MODE.circadian)
    ) {
      settings.kelvin = await this.circadianService.CURRENT_LIGHT_TEMPERATURE;
      settings.mode = LIGHTING_MODE.circadian;
      settings.brightness ??= current.brightness;
    } else {
      delete settings.kelvin;
      delete current.kelvin;
    }
    const key = CACHE_KEY(entity_id);

    await this.cache.set(key, settings);
    // Brightness here is 1-255
    const data = {
      brightness: settings.brightness,
      hs_color: settings.hs_color,
      kelvin: settings.kelvin,
    };
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'undefined') {
        delete data[key];
      }
    });
    // this.logger.debug({ data, settings }, entity_id);
    await this.lightService.turnOn(entity_id, data);
  }

  public async turnOff(entity_id: string | string[]): Promise<void> {
    return this.turnOffEntities(entity_id);
  }

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

  public async turnOn(
    entity_id: string | string[],
    settings: Partial<LightingCacheDTO> = {},
  ): Promise<void> {
    return this.setAttributes(entity_id, {
      ...settings,
      mode: LIGHTING_MODE.on,
    });
  }

  protected async circadianLightingUpdate(kelvin: number): Promise<void> {
    const lights = await this.getActiveLights();
    await each(lights, async (id, callback) => {
      const state = await this.getState(id);
      if (state?.mode !== 'circadian') {
        // if (state?.mode !== 'circadian' || state.kelvin === kelvin) {
        return;
      }
      await this.setAttributes(id, { kelvin });
      callback();
    });
  }

  protected onModuleInit(): void {
    this.eventEmitter.on(CIRCADIAN_UPDATE, (kelvin) =>
      this.circadianLightingUpdate(kelvin),
    );
  }
}
