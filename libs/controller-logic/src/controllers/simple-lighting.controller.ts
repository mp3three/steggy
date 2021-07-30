import { RoomController } from '@automagical/contracts';
import {
  HassStateDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { EntityManagerService } from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';

import { ControllerFirst } from '../decorators/controller-first.decorator';
import { RoomCoordinatorService } from '../lighting/room-coordinator.service';

@Injectable({ scope: Scope.TRANSIENT })
export class SimpleLightingController implements Partial<RoomController> {
  // #region Object Properties

  public controller: RoomController;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly entityManager: EntityManagerService,
    private readonly coordinator: RoomCoordinatorService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @ControllerFirst()
  @Trace()
  public async areaOff(): Promise<boolean> {
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async onApplicationBootstrap(): Promise<void> {
    this.entityManager
      .getObservable(this.controller.name)
      .subscribe(async (state: HassStateDTO<PicoStates>) => {
        await this.onStateUpate(state);
      });
    //
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async onStateUpate(state: HassStateDTO<PicoStates>): Promise<void> {
    if (state.state === PicoStates.off) {
      await this.areaOff();
      return;
    }
    if (state.state === PicoStates.on) {
      return;
    }
  }

  // #endregion Private Methods
}
