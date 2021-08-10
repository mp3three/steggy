import { iRoomController } from '@automagical/contracts';
import {
  CIRCADIAN_UPDATE,
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  LightingCacheDTO,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import {
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  Trace,
} from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { each } from 'async';

import { CircadianService } from './circadian.service';

const LIGHTING_CACHE_PREFIX = 'LIGHTING:';
const CACHE_KEY = (entity) => `${LIGHTING_CACHE_PREFIX}${entity}`;

/**
 * - State management for lights
 * - Forwards commands to light domain service
 * - Management of the light temperature for lights flagged as circadian mode
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LightManagerService {
  // #region Object Properties

  private controller: Partial<iRoomController>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectCache() private readonly cache: CacheManagerService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly lightService: LightDomainService,
    private readonly logger: AutoLogService,
    private readonly circadianService: CircadianService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Private Accessors

  private get settings(): RoomControllerSettingsDTO {
    return this.controller.constructor[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Private Accessors

  // #region Public Methods

  @Trace()
  public async areaOff(accessories = false): Promise<void> {
    if (this.controller.areaOff) {
      const result = await this.controller.areaOff();
      if (result === false) {
        return;
      }
    }
    await this.turnOffEntities(this.settings.lights ?? []);
    await this.hassCoreService.turnOff(this.settings.switches ?? []);
    if (accessories) {
      await this.hassCoreService.turnOff(this.settings.accessories ?? []);
    }
  }

  @Trace()
  public async areaOn(accessories = false): Promise<void> {
    if (this.controller.areaOn) {
      const result = await this.controller.areaOn();
      if (result === false) {
        return;
      }
    }
    await this.circadianLight(this.settings.lights ?? []);
    await this.hassCoreService.turnOn(this.settings.switches ?? []);
    if (accessories) {
      await this.hassCoreService.turnOn(this.settings.accessories ?? []);
    }
  }

  @Trace()
  public bind(controller: Partial<iRoomController>): void {
    this.controller = controller;
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, ControllerStates.on),
      async () => {
        await this.areaOn();
      },
    );
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, ControllerStates.off),
      async () => {
        await this.areaOff();
      },
    );
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, ControllerStates.up),
      async () => {
        await this.dimUp();
      },
    );
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, ControllerStates.down),
      async () => {
        await this.dimDown();
      },
    );
  }

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
  public async dimDown(): Promise<void> {
    if (this.controller.dimDown && !(await this.controller.dimDown())) {
      return;
    }
    const lights = await this.findDimmableLights();
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, -10);
      callback();
    });
  }

  @Trace()
  public async dimUp(): Promise<void> {
    if (this.controller.dimUp && !(await this.controller.dimUp())) {
      return;
    }
    const lights = await this.findDimmableLights();
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, 10);
      callback();
    });
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

  // #endregion Public Methods

  // #region Protected Methods

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

  protected onModuleInit(): void {
    this.eventEmitter.on(CIRCADIAN_UPDATE, (kelvin) =>
      this.circadianLightingUpdate(kelvin),
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async findDimmableLights(): Promise<string[]> {
    const lights = await this.getActiveLights();
    return this.settings.lights.filter((light) => lights.includes(light));
  }

  // #endregion Private Methods
}
