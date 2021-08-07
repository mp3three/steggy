import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RemoteAdapterService } from './remote-adapter.service';

@Injectable({ scope: Scope.TRANSIENT })
export class ComplexLogicService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly remoteAdapter: RemoteAdapterService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public init(): void {
    if (!this.settings?.remote) {
      return;
    }
    this.remoteAdapter.watch(this.settings.remote);
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, ControllerStates.favorite),
      async () => {
        await this.controller?.favorite(1);
      },
    );
  }

  // #endregion Public Methods
}
