import { iRoomController } from '@automagical/contracts';
import {
  ControllerStates,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Injectable, Scope } from '@nestjs/common';

import { RemoteAdapterService } from './remote-adapter.service';

@Injectable({ scope: Scope.TRANSIENT })
export class ComplexLogicService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly remoteAdapter: RemoteAdapterService) {}

  // #endregion Constructors

  // #region Public Methods

  public init(): void {
    if (!this.settings?.remote) {
      return;
    }
    this.remoteAdapter.watch(this.settings.remote).subscribe(async (state) => {
      if (state !== ControllerStates.favorite) {
        return;
      }
      await this.controller?.favorite();
    });
    //
  }

  // #endregion Public Methods
}
