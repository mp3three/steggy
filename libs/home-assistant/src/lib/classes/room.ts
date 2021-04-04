import {
  HomeAssistantRoomConfigDTO,
  PicoStates,
  RokuInputs,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import { iLogger } from '@automagical/logger';
import { OnEvent } from '@nestjs/event-emitter';
import { HomeAssistantService, RoomService } from '../services';

export abstract class SceneRoom {
  // #region Object Properties

  protected readonly homeAssistantService: HomeAssistantService;
  protected readonly roomConfig: HomeAssistantRoomConfigDTO;
  protected readonly roomService: RoomService;

  protected allowGlobalAccess = true;
  protected logger: iLogger;

  // #endregion Object Properties

  // #region Protected Methods

  @OnEvent(['*', 'double'])
  protected async wallDouble(
    button: PicoStates,
    entityId: string,
  ): Promise<void> {
    if (entityId !== this?.roomConfig?.config?.pico) {
      return;
    }
    this.logger.notice(`${entityId} pressed ${button}`);
    switch (button) {
      case PicoStates.high:
        return this.sceneHigh();
      case PicoStates.off:
        return this.doubleOff();
      case PicoStates.smart:
        return this.doubleSmart();
    }
  }

  @OnEvent(['*', 'single'])
  protected async wallSinle(
    button: PicoStates,
    entityId: string,
  ): Promise<void> {
    if (entityId !== this?.roomConfig?.config?.pico) {
      return;
    }
    this.logger.notice(`${entityId} pressed ${button}`);
    switch (button) {
      case PicoStates.high:
        return this.sceneHigh();
      case PicoStates.medium:
        return this.sceneMedium();
      case PicoStates.low:
        return this.sceneLow();
      case PicoStates.off:
        return this.sceneOff();
      case PicoStates.smart:
        this.sceneSmart();
    }
  }

  protected doubleHigh(): Promise<void> {
    return this.roomService.smart(this.roomConfig, RoomScene.high);
  }

  protected doubleOff(): Promise<void> {
    return this.roomService.smart(this.roomConfig, RoomScene.off);
  }

  protected doubleSmart(): Promise<void> {
    const rokuInfo = this.roomConfig.config?.roku;
    if (!rokuInfo) {
      return;
    }
    return this.roomService.setRoku(rokuInfo.defaultChannel, rokuInfo);
  }

  protected sceneHigh(): Promise<void> {
    return this.roomService.setScene(RoomScene.high, this.roomConfig, false);
  }

  protected sceneLow(): Promise<void> {
    return this.roomService.setScene(RoomScene.low, this.roomConfig, false);
  }

  protected sceneMedium(): Promise<void> {
    return this.roomService.setScene(RoomScene.medium, this.roomConfig, false);
  }

  protected sceneOff(): Promise<void> {
    this.roomService.setRoku(RokuInputs.off, this.roomConfig.config?.roku);
    return this.roomService.setScene(RoomScene.off, this.roomConfig, false);
  }

  protected async sceneSmart(): Promise<void> {
    this.homeAssistantService.setLocks(true);
    return this.roomService.smart(this.roomConfig);
  }

  // #endregion Protected Methods
}
