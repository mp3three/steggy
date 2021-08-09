import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RemoteAdapterService } from './remote-adapter.service';

/**
 * Glue between kunami codes and controllers
 */
@Injectable({ scope: Scope.TRANSIENT })
export class ComplexLogicService {
  // #region Constructors

  constructor(
    @Inject(INQUIRER)
    private readonly controller: Partial<iRoomController>,
    private readonly remoteAdapter: RemoteAdapterService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onModuleInit(): void {
    const settings: RoomControllerSettingsDTO =
      this.controller.constructor[ROOM_CONTROLLER_SETTINGS];
    if (!settings?.remote) {
      return;
    }
    this.remoteAdapter.watch(settings.remote);
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(settings.remote, ControllerStates.favorite),
      async () => {
        await this.controller?.favorite(1);
      },
    );
  }

  // #endregion Protected Methods
}
