import type {
  ControllerSettings,
  RoomController,
  RoomDeviceDTO,
} from '@automagical/contracts';
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
  HASocketAPIService,
  HomeAssistantCoreService,
} from '@automagical/home-assistant';
import { Debug, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { each } from 'async';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

import { LightManagerService } from './light-manager.service';

/**
 * return false to stop additional processing
 */
export type PicoDirectCallback = (state: PicoStates) => Promise<boolean>;

@Injectable()
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
   * ROOM_NAME to controller
   */
  private readonly ROOM_MAP = new Map<string, RoomController>();
  private readonly SUBSCRIBERS = new Map<string, Observable<LightStateDTO>>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly entityManagerService: EntityManagerService,
    private readonly eventEmitter: EventEmitter2,
    private readonly lightManager: LightManagerService,
    private readonly socketService: HASocketAPIService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(
    count: number,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOff(count))) {
      return;
    }
    await this.passthrough(false, count, controller);
    this.eventEmitter.emit(`${controller.name}/areaOff`, count);
  }

  @Trace()
  public async areaOn(
    count: number,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOn(count))) {
      return;
    }
    await this.passthrough(true, count, controller);
    this.eventEmitter.emit(`${controller.name}/areaOn`, count);
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
    this.generateSubscribers(entity_id);
    await this.lightManager.turnOn(entity_id, {
      brightness,
      mode: 'circadian',
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
    const lights = await this.findDimmableLights(controller);
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
    const lights = await this.findDimmableLights(controller);
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
    let { brightness } = await this.lightManager.getState(entityId);
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
  public async roomOff(rooms: string | string[]): Promise<void> {
    if (!Array.isArray(rooms)) {
      rooms = [rooms];
    }
    await each(rooms, async (room, callback) => {
      const controller = this.ROOM_MAP.get(room);
      await this.areaOff(3, controller);
      callback();
    });
  }

  @Trace()
  public async roomOn(room: string): Promise<void> {
    const controller = this.ROOM_MAP.get(room);
    await this.areaOn(1, controller);
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

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    await this.lightManager.turnOff(entity_id);
  }

  @Trace()
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

  @Debug(`Set lighting passthrough`)
  protected async passthrough(
    turnOn: boolean,
    count: number,
    controller: RoomController,
    recurse = true,
  ): Promise<void> {
    await each(
      this.CONTROLLER_SETTINGS.get(controller).devices,
      async (device: RoomDeviceDTO, callback) => {
        // Filter out wrong results
        if (device.comboCount !== count) {
          callback();
          return;
        }
        const lights = device.target?.filter(
          (item) => domain(item) === HASS_DOMAINS.light,
        );
        await (turnOn
          ? this.circadianLight(lights, 100)
          : this.turnOff(lights));
        const switches = device.target?.filter(
          (item) => domain(item) !== HASS_DOMAINS.light,
        );
        await (turnOn
          ? this.hassCoreService.turnOn(switches)
          : this.hassCoreService.turnOff(switches));
        if (!recurse) {
          callback();
          return;
        }
        if (device.rooms) {
          await each(device.rooms, async (room, nestedCallback) => {
            if (typeof room === 'object') {
              if (
                (room.type === 'off' && turnOn === true) ||
                (room.type === 'on' && turnOn === false)
              ) {
                nestedCallback();
                return;
              }
              room = room.name;
            }
            const levels = Array.from({ length: count }).map(
              (item, index) => index + 1,
            );
            await Promise.all(
              levels.map(async (level) => {
                await this.passthrough(turnOn, level, controller, false);
              }),
            );
            nestedCallback();
          });
        }
        callback();
      },
    );
  }

  @Trace()
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
      new_state?.state === PicoStates.none ||
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

  protected onApplicationBootstrap(): void {
    this.socketService.EVENT_STREAM.subscribe((event: HassEventDTO) =>
      this.onControllerEvent(event as HassEventDTO<PicoStates>),
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async findDimmableLights(
    controller: RoomController,
  ): Promise<string[]> {
    const lights = await this.lightManager.getActiveLights();
    const roomLights = this.findLights(controller);
    return lights.filter((light) => roomLights.includes(light));
  }

  @Trace()
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

  @Trace()
  private generateSubscribers(id: string): void {
    if (this.SUBSCRIBERS.has(id)) {
      return;
    }
    const subscriber =
      this.entityManagerService.getObservable<LightStateDTO>(id);
    this.SUBSCRIBERS.set(id, subscriber);
  }

  // #endregion Private Methods
}
