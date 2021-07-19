import { RoomController, RoomDeviceDTO } from '@automagical/contracts';
import {
  HA_EVENT_STATE_CHANGE,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  domain,
  HASS_DOMAINS,
  HassEventDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { each } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { HomeAssistantCoreService, LightDomainService } from '../../domains';

@Injectable()
/**
 * Future logic expansion: press and hold logic for dimmers
 *
 * Only single press interactions are accepted right now
 */
export class LutronPicoService {
  // #region Object Properties

  private readonly ACTIONS_LIST = new Map<string, PicoStates[]>();
  private readonly ACTION_TIMEOUT = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();
  private readonly CONTROLLER_MAP = new Map<string, RoomController>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LutronPicoService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly lightService: LightDomainService,
    private readonly hassCoreService: HomeAssistantCoreService,
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
    await each(
      controller._CONTROLLER_SETTINGS.devices,
      async (device: RoomDeviceDTO, callback) => {
        if (device.comboCount !== count) {
          return;
        }
        await this.hassCoreService.turnOff(device.target);
        callback();
      },
    );
  }

  @Trace()
  public async areaOn(
    count: number,
    controller: RoomController,
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
        const lights: string[] = [];
        const others: string[] = [];
        device.target.forEach((item) => {
          if (domain(item) === HASS_DOMAINS.light) {
            lights.push(item);
            return;
          }
          others.push(item);
        });
        if (lights.length > 0) {
          await this.lightService.circadianLight(lights);
        }
        if (others.length > 0) {
          await this.hassCoreService.turnOn(others);
        }
        callback();
      },
    );
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
      await this.lightService.lightDim(entity_id, -10);
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
      await this.lightService.lightDim(entity_id, 10);
      callback();
    });
  }

  public setRoomController(controller: string, room: RoomController): void {
    this.CONTROLLER_MAP.set(controller, room);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onControllerEvent(
    event: HassEventDTO<PicoStates>,
  ): Promise<void> {
    // 1 = Filter out events for unrelated devices
    // TODO: find a better event for @OnEvent to prevent this
    const entityId = event.data.entity_id;
    const { new_state } = event.data;
    if (
      new_state.state === PicoStates.none ||
      !this.CONTROLLER_MAP.has(entityId)
    ) {
      return;
    }
    // Load
    const controller = this.CONTROLLER_MAP.get(entityId);
    this.logger.info(
      { entityId, state: new_state },
      `Controller state updated`,
    );
    const timeout = setTimeout(
      () => this.ACTION_TIMEOUT.delete(entityId),
      controller._CONTROLLER_SETTINGS?.konamiTimeout ?? 2500,
    );
    if (this.ACTION_TIMEOUT.has(entityId)) {
      clearTimeout(this.ACTION_TIMEOUT.get(entityId));
    }
    this.ACTION_TIMEOUT.set(entityId, timeout);
    const recent = this.ACTIONS_LIST.get(entityId) ?? [];
    recent.push(new_state.state);
    this.ACTIONS_LIST.set(entityId, recent);
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

  private findDimmableLights(controller: RoomController): string[] {
    return [];
  }

  // #endregion Private Methods
}
