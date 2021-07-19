import { RoomController } from '@automagical/contracts';
import {
  HA_EVENT_STATE_CHANGE,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  HassEventDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { each } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { LightDomainService } from '../../domains';

@Injectable()
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
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public setRoomController(controller: string, room: RoomController): void {
    this.CONTROLLER_MAP.set(controller, room);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onControllerEvent(
    event: HassEventDTO<PicoStates>,
  ): Promise<void> {
    const entityId = event.data.entity_id;
    if (!this.CONTROLLER_MAP.has(entityId)) {
      return;
    }
    const controller = this.CONTROLLER_MAP.get(entityId);
    const state = event.data.new_state;
    this.logger.info({ entityId, state }, `Controller state updated`);
    if (state.state === PicoStates.none) {
      return;
    }
    const timeout = setTimeout(
      () => this.ACTION_TIMEOUT.delete(entityId),
      controller.controller?.konamiTimeout ?? 2500,
    );
    if (this.ACTION_TIMEOUT.has(entityId)) {
      clearTimeout(this.ACTION_TIMEOUT.get(entityId));
    }
    this.ACTION_TIMEOUT.set(entityId, timeout);
    const recent = this.ACTIONS_LIST.get(entityId) ?? [];
    recent.push(state.state);
    this.ACTIONS_LIST.set(entityId, recent);
    if (!(await controller.combo(recent))) {
      return;
    }

    switch (state.state) {
      case PicoStates.on:
        return await this.areaOn(entityId, controller);
      case PicoStates.off:
        return await this.areaOff(entityId, controller);
      case PicoStates.up:
        return await this.dimUp(entityId, controller);
      case PicoStates.down:
        return await this.dimDown(entityId, controller);
    }
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async areaOff(
    entityId: string,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOff())) {
      return;
    }
  }

  @Trace()
  private async areaOn(
    entityId: string,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOn())) {
      return;
    }
  }

  @Trace()
  private async dimDown(
    entityId: string,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.dimDown())) {
      return;
    }
    await each(
      controller.controller?.lights ?? [],
      async (entityId, callback) => {
        callback();
      },
    );
  }

  @Trace()
  private async dimUp(
    entityId: string,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.dimUp())) {
      return;
    }
  }

  // #endregion Private Methods
}
