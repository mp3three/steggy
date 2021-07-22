import type { RoomController, RoomDeviceDTO } from '@automagical/contracts';
import {
  HA_EVENT_STATE_CHANGE,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  domain,
  HASS_DOMAINS,
  HassEventDTO,
  LightStateDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import {
  EntityManagerService,
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { each } from 'async';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

/**
 * return false to stop additional processing
 */
export type PicoDirectCallback = (state: PicoStates) => Promise<boolean>;

@Injectable()
/**
 * Future logic expansion: press and hold logic for dimmers
 *
 * Only single press interactions are accepted right now
 */
export class LightingControllerService {
  // #region Object Properties

  private readonly ACTIONS_LIST = new Map<string, PicoStates[]>();
  private readonly ACTION_TIMEOUT = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();
  private readonly CALLBACKS = new Map<string, PicoDirectCallback>();
  /**
   * entity_id to controller
   */
  private readonly CONTROLLER_MAP = new Map<string, RoomController>();
  /**
   * active light domain entities only
   *
   * entity id to brightness (1-100)
   */
  private readonly ENTITY_BRIGHTNESS = new Map<string, number>();
  /**
   * ROOM_NAME to controller
   */
  private readonly ROOM_MAP = new Map<string, RoomController>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LightingControllerService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly lightService: LightDomainService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly solarCalcService: SolarCalcService,
    private readonly entityManagerService: EntityManagerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(
    count: number,
    controller: RoomController,
    recurse = false,
  ): Promise<void> {
    if (!(await controller.areaOff(count))) {
      return;
    }
    await each(
      controller._CONTROLLER_SETTINGS.devices,
      async (device: RoomDeviceDTO, callback) => {
        if (device.comboCount !== count) {
          return;
        }
        await this.hassCoreService.turnOff(device.target);
        device.target.forEach((target) =>
          this.ENTITY_BRIGHTNESS.delete(target),
        );
        if (device.rooms && recurse === false) {
          await each(device.rooms, async (room, nestedCallback) => {
            if (typeof room === 'object') {
              const type = room.type;
              if (type === 'on') {
                return;
              }
              room = room.name;
            }
            await this.areaOff(count, this.ROOM_MAP.get(room), true);
            nestedCallback();
          });
        }
        callback();
      },
    );
  }

  @Trace()
  public async areaOn(
    count: number,
    controller: RoomController,
    recurse = false,
  ): Promise<void> {
    if (!(await controller.areaOn(count))) {
      return;
    }
    await each(
      controller._CONTROLLER_SETTINGS.devices,
      async (device: RoomDeviceDTO, callback) => {
        if (device.comboCount !== count) {
          return;
        }
        const lights = device.target.filter(
          (item) => domain(item) === HASS_DOMAINS.light,
        );
        await this.circadianLight(lights, 100);
        await this.hassCoreService.turnOn(
          device.target.filter((item) => domain(item) !== HASS_DOMAINS.light),
        );
        if (device.rooms && recurse === false) {
          await each(device.rooms, async (room, nestedCallback) => {
            if (typeof room === 'object') {
              const type = room.type;
              if (type === 'off') {
                return;
              }
              room = room.name;
            }
            await this.areaOn(count, this.ROOM_MAP.get(room), true);
            nestedCallback();
          });
        }
        callback();
      },
    );
  }

  @Trace()
  public async circadianLight(
    entity_id: string | string[],
    brightness_pct?: number,
  ): Promise<void> {
    if (typeof entity_id === 'string') {
      entity_id = [entity_id];
    }
    entity_id.forEach((id) => {
      this.ENTITY_BRIGHTNESS.set(id, brightness_pct);
    });
    const MIN_COLOR = 2500;
    const MAX_COLOR = 5500;
    const kelvin = (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR;
    return await this.lightService.turnOn(entity_id, {
      brightness_pct,
      kelvin,
    });
  }

  @Trace()
  public async dimDown(
    count: number,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.dimDown(count))) {
      return;
    }
    const lights = this.findDimmableLights(controller);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, -10);
      callback();
    });
  }

  @Trace()
  public async dimUp(count: number, controller: RoomController): Promise<void> {
    if (!(await controller.dimUp(count))) {
      return;
    }
    const lights = this.findDimmableLights(controller);
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, 10);
      callback();
    });
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let brightness = this.ENTITY_BRIGHTNESS.get(entityId) - 10;
    // let brightness = await this.lightBrightness(entityId);
    brightness = brightness + amount;
    if (brightness > 100) {
      brightness = 100;
    }
    if (brightness < 5) {
      brightness = 5;
    }
    this.logger.debug({ amount }, `${entityId} set brightness: ${brightness}%`);
    return await this.circadianLight(entityId, brightness);
  }

  public setRoomController(controller: string, room: RoomController): void {
    this.CONTROLLER_MAP.set(controller, room);
    this.ROOM_MAP.set(room.name, room);
  }

  public watch(entityId: string, callback: PicoDirectCallback): void {
    if (this.CALLBACKS.has(entityId)) {
      throw new InternalServerErrorException(
        `Cannot have multiple watchers on ${entityId}`,
      );
    }
    this.CALLBACKS.set(entityId, callback);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_MINUTE)
  @Trace()
  protected async circadianLightingUpdate(): Promise<void> {
    const activeLights: string[] = [];
    this.ENTITY_BRIGHTNESS.forEach(async (brightness, entity_id) => {
      const entity = this.entityManagerService.getEntity(entity_id);
      if (!entity) {
        this.logger.warn(`${entity_id} has no associated data`);
      }
      if (entity?.state !== 'on') {
        return;
      }
      activeLights.push(entity_id);
    });
    await this.circadianLight(activeLights);
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onControllerEvent(
    event: HassEventDTO<PicoStates>,
  ): Promise<void> {
    // 1 = Filter out events for unrelated devices
    // TODO: find a better event for @OnEvent to prevent this
    const { entity_id, new_state } = event.data;
    if (this.CALLBACKS.has(entity_id)) {
      const callback = this.CALLBACKS.get(entity_id);
      const result = await callback(new_state.state);
      if (!result) {
        return;
      }
    }
    if (
      new_state.state === PicoStates.none ||
      !this.CONTROLLER_MAP.has(entity_id)
    ) {
      return;
    }
    // Load
    const controller = this.CONTROLLER_MAP.get(entity_id);
    this.logger.info(
      { entityId: entity_id, state: new_state },
      `${entity_id} state updated`,
    );
    const timeout = setTimeout(() => {
      this.ACTION_TIMEOUT.delete(entity_id);
      this.ACTIONS_LIST.delete(entity_id);
    }, controller._CONTROLLER_SETTINGS?.konamiTimeout ?? 2500);
    if (this.ACTION_TIMEOUT.has(entity_id)) {
      clearTimeout(this.ACTION_TIMEOUT.get(entity_id));
    }
    this.ACTION_TIMEOUT.set(entity_id, timeout);
    const recent = this.ACTIONS_LIST.get(entity_id) ?? [];
    recent.push(new_state.state);
    this.logger.info({ recent }, `recents`);
    this.ACTIONS_LIST.set(entity_id, recent);
    if (!(await controller.combo(recent))) {
      return;
    }
    const pressCounter = new Map<string, number>();
    recent.forEach((action) =>
      pressCounter.set(action, (pressCounter.get(action) ?? 0) + 1),
    );
    if (pressCounter.size > 1) {
      return;
    }
    const count = pressCounter.get(new_state.state);
    switch (new_state.state) {
      case PicoStates.favorite:
        const result = await controller.favorite(count);
        if (result) {
          return;
        }
      // fall through
      case PicoStates.on:
        return await this.areaOn(count, controller);
      case PicoStates.off:
        return await this.areaOff(count, controller);
      case PicoStates.up:
        return await this.dimUp(count, controller);
      case PicoStates.down:
        return await this.dimDown(count, controller);
    }
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private findDimmableLights(controller: RoomController): string[] {
    const lights = [];
    controller._CONTROLLER_SETTINGS.devices.forEach((item) => {
      const targets = item.target ?? [];
      targets.forEach((id) => {
        if (domain(id) === HASS_DOMAINS.light && !lights.includes(id)) {
          lights.push(id);
        }
      });
    });
    return lights.filter((light) => this.ENTITY_BRIGHTNESS.has(light));
  }

  /**
   * return 0 if off
   *
   * return brightness on a 0-100 scale
   */
  @Trace()
  private lightBrightness(entityId: string) {
    const entity = this.entityManagerService.getEntity<LightStateDTO>(entityId);
    if (entity.state === 'off') {
      return 0;
    }
    return Math.round((entity.attributes.brightness / 256) * 100);
  }

  /**
   * Returns 0 when it's dark out, increasing to 1 at solar noon
   *
   * ### Future improvements
   *
   * The math needs work, this seems more thought out because math reasons:
   * https://github.com/claytonjn/hass-circadian_lighting/blob/master/custom_components/circadian_lighting/__init__.py#L206
   */
  private getColorOffset(): number {
    const calc = this.solarCalcService.SOLAR_CALC;
    const noon = dayjs(calc.solarNoon);
    const dusk = dayjs(calc.dusk);
    const dawn = dayjs(calc.dawn);
    const now = dayjs();

    if (now.isBefore(dawn)) {
      // After midnight, but before dawn
      return 0;
    }
    if (now.isBefore(noon)) {
      // After dawn, but before solar noon
      return Math.abs(noon.diff(now, 's') / noon.diff(dawn, 's') - 1);
    }
    if (now.isBefore(dusk)) {
      // Afternoon, but before dusk
      return Math.abs(noon.diff(now, 's') / noon.diff(dusk, 's') - 1);
    }
    // Until midnight
    return 0;
  }

  // #endregion Private Methods
}
