import {
  HomeAssistantRoomConfigDTO,
  PicoStates,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import { iLogger } from '@automagical/logger';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomService } from '../services';

export abstract class SceneRoom {
  // #region Object Properties

  protected readonly roomConfig: HomeAssistantRoomConfigDTO;
  protected readonly roomService: RoomService;

  protected allowGlobalAccess = true;
  protected logger: iLogger;

  // #endregion Object Properties

  // #region Protected Methods

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
        return this.roomService.setScene(
          RoomScene.high,
          this.roomConfig,
          false,
        );
      case PicoStates.medium:
        return this.roomService.setScene(
          RoomScene.medium,
          this.roomConfig,
          false,
        );
      case PicoStates.low:
        return this.roomService.setScene(RoomScene.low, this.roomConfig, false);
      case PicoStates.off:
        return this.roomService.setScene(RoomScene.off, this.roomConfig, false);
      case PicoStates.magic:
        return this.roomService.smart(this.roomConfig);
    }
  }

  // #endregion Protected Methods
}
