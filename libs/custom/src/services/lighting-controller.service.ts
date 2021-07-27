import type {
  ControllerSettings,
  RoomController,
  RoomDeviceDTO,
} from '@automagical/contracts';
import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
} from '@automagical/contracts/constants';
import {
  domain,
  HASS_DOMAINS,
  HassEventDTO,
  LightStateDTO,
  PicoStates,
  REVERSE_LOOKUP_PICO_STATES,
} from '@automagical/contracts/home-assistant';
import {
  EntityManagerService,
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { each } from 'async';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

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
  private readonly CONTROLLER_SETTINGS = new Map<
    RoomController,
    ControllerSettings
  >();
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
  private readonly SUBSCRIBERS = new Map<string, Observable<LightStateDTO>>();

  private CURRENT_TEMP = 0;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
    private readonly lightService: LightDomainService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly solarCalcService: SolarCalcService,
    private readonly entityManagerService: EntityManagerService,
    private readonly eventEmitter: EventEmitter2,
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
      this.CONTROLLER_SETTINGS.get(controller).devices,
      async (device: RoomDeviceDTO, callback) => {
        if (device.comboCount !== count) {
          return;
        }
        await this.hassCoreService.turnOff(device.target);
        device.target?.forEach((target) =>
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
            const controller = this.ROOM_MAP.get(room);
            await this.areaOff(count, controller, true);
            nestedCallback();
          });
        }
        callback();
      },
    );
    this.eventEmitter.emit(`${controller.name}/areaOff`, count);
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
      this.CONTROLLER_SETTINGS.get(controller).devices,
      async (device: RoomDeviceDTO, callback) => {
        if (device.comboCount !== count) {
          return;
        }
        const lights = device.target?.filter(
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
    this.eventEmitter.emit(`${controller.name}/areaOn`, count);
  }

  @Trace()
  public async circadianLight(
    entity_id: string | string[],
    brightness_pct?: number,
  ): Promise<void> {
    entity_id ??= [];
    if (!Array.isArray(entity_id)) {
      entity_id = [entity_id];
    }
    if (entity_id.length === 0) {
      return;
    }
    brightness_pct ??= this.ENTITY_BRIGHTNESS.get(entity_id[0]);
    entity_id.forEach((id) => {
      this.ENTITY_BRIGHTNESS.set(id, brightness_pct);
      this.generateSubscribers(id);
    });
    const MIN_COLOR = 2500;
    const MAX_COLOR = 6000;
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

  @Trace()
  public getBrightness(entityId: string): number {
    return this.ENTITY_BRIGHTNESS.get(entityId);
  }

  @Trace()
  public isOn(entity_id: string): boolean {
    return this.ENTITY_BRIGHTNESS.has(entity_id);
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let brightness = this.ENTITY_BRIGHTNESS.get(entityId) + amount;
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
  public async roomOff(rooms: string | string[]): Promise<void> {
    if (!Array.isArray(rooms)) {
      rooms = [rooms];
    }
    await each(rooms, async (room, callback) => {
      const controller = this.ROOM_MAP.get(room);
      await this.areaOff(3, controller, true);
      callback();
    });
  }

  @Trace()
  public async roomOn(room: string): Promise<void> {
    const controller = this.ROOM_MAP.get(room);
    await this.areaOn(1, controller, true);
  }

  @Trace()
  public setRoomController(
    controller: string,
    room: RoomController,
    settings: ControllerSettings,
  ): void {
    this.CONTROLLER_MAP.set(controller, room);
    this.ROOM_MAP.set(room.name, room);
    this.CONTROLLER_SETTINGS.set(room, settings);
  }

  public async turnOff(entity_id: string[]): Promise<void> {
    await this.hassCoreService.turnOff(entity_id);
    entity_id.forEach((target) => this.ENTITY_BRIGHTNESS.delete(target));
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
  protected async circadianLightingUpdate(): Promise<void> {
    await each(
      this.ENTITY_BRIGHTNESS.entries(),
      async ([entity_id, brightness], callback) => {
        const [entity] = this.entityManagerService.getEntity([entity_id]);
        if (!entity) {
          this.logger.warn(`${entity_id} has no associated data`);
        }
        if (entity?.state !== 'on') {
          return;
        }
        await this.circadianLight(entity_id, brightness);
        callback();
      },
    );
  }

  @OnEvent(ALL_ENTITIES_UPDATED)
  protected async onAllEntitiesUpdated(
    allEntities: LightStateDTO[],
  ): Promise<void> {
    allEntities.forEach((entity) => {
      if (
        domain(entity.entity_id) !== HASS_DOMAINS.light ||
        this.ENTITY_BRIGHTNESS.has(entity.entity_id)
      ) {
        return;
      }
      if (entity.state !== 'on') {
        this.ENTITY_BRIGHTNESS.delete(entity.entity_id);
        return;
      }
      this.ENTITY_BRIGHTNESS.set(
        entity.entity_id,
        Math.round((entity.attributes.brightness / 256) * 100),
      );
    });
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
    const timeout = setTimeout(() => {
      this.ACTION_TIMEOUT.delete(entity_id);
      this.ACTIONS_LIST.delete(entity_id);
    }, this.CONTROLLER_SETTINGS.get(controller)?.konamiTimeout ?? 2500);
    if (this.ACTION_TIMEOUT.has(entity_id)) {
      clearTimeout(this.ACTION_TIMEOUT.get(entity_id));
    }
    this.ACTION_TIMEOUT.set(entity_id, timeout);
    const recent = this.ACTIONS_LIST.get(entity_id) ?? [];
    recent.push(new_state.state);
    this.logger.info(
      { recent: recent.map((item) => REVERSE_LOOKUP_PICO_STATES.get(item)) },
      `${entity_id} updated: ${REVERSE_LOOKUP_PICO_STATES.get(
        new_state.state as PicoStates,
      )}`,
    );
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
        if (!result) {
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
    const lights = this.findLights(controller);
    return lights.filter((light) => this.ENTITY_BRIGHTNESS.has(light));
  }

  private findLights(controller: RoomController): string[] {
    const lights = [];
    this.CONTROLLER_SETTINGS.get(controller).devices.forEach((item) => {
      const targets = item.target ?? [];
      targets.forEach((id) => {
        if (domain(id) === HASS_DOMAINS.light && !lights.includes(id)) {
          lights.push(id);
        }
      });
    });
    return lights;
  }

  private generateSubscribers(id: string): void {
    if (this.SUBSCRIBERS.has(id)) {
      return;
    }
    const subscriber =
      this.entityManagerService.getObservable<LightStateDTO>(id);
    this.SUBSCRIBERS.set(id, subscriber);
    subscriber.subscribe((state) => {
      if (state.state === 'off') {
        this.ENTITY_BRIGHTNESS.delete(id);
      }
    });
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
