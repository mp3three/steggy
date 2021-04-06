import {
  CircadianModes,
  HomeAssistantRoomConfigDTO,
  PicoStates,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import { iLogger } from '@automagical/logger';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityService, HomeAssistantService, RoomService } from '../services';

export abstract class SceneRoom {
  // #region Static Properties

  private static ROOM_REGISTRY: Record<string, SceneRoom> = {};

  // #endregion Static Properties

  // #region Object Properties

  protected readonly entityService: EntityService;
  protected readonly homeAssistantService: HomeAssistantService;
  protected readonly roomConfig: HomeAssistantRoomConfigDTO;
  protected readonly roomService: RoomService;

  protected allowGlobalAccess = true;
  protected logger: iLogger;

  // #endregion Object Properties

  // #region Public Methods

  @OnEvent(['*', 'double'])
  public async wallDouble(button: PicoStates, entityId: string): Promise<void> {
    if (entityId !== this?.roomConfig?.config?.pico) {
      return;
    }
    this.logger.notice(`${entityId} double press ${button}`);
    switch (button) {
      case PicoStates.high:
        return this.sceneHigh();
      case PicoStates.off:
        return this.doubleOff();
    }
  }

  @OnEvent(['*', 'single'])
  public async wallSingle(button: PicoStates, entityId: string): Promise<void> {
    if (entityId !== this?.roomConfig?.config?.pico) {
      return;
    }
    if (button === PicoStates.none) {
      return;
    }
    this.logger.notice(`${entityId} single press ${button}`);
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
        return this.sceneSmart();
    }
  }

  public doubleHigh(): Promise<void> {
    this.logger.info(`doubleHigh`);
    return this.roomService.smart(this.roomConfig, RoomScene.high);
  }

  public doubleOff(): Promise<void> {
    this.logger.info(`doubleOff`);
    return this.roomService.smart(this.roomConfig, RoomScene.off);
  }

  public async onModuleInit(): Promise<void> {
    SceneRoom.ROOM_REGISTRY[this.roomConfig.name] = this;
  }

  public sceneHigh(): Promise<void> {
    this.logger.info(`sceneHigh`);
    return this.roomService.setScene(RoomScene.high, this.roomConfig, false);
  }

  public sceneLow(): Promise<void> {
    this.logger.info(`sceneLow`);
    return this.roomService.setScene(RoomScene.low, this.roomConfig, false);
  }

  public sceneMedium(): Promise<void> {
    this.logger.info(`sceneMedium`);
    return this.roomService.setScene(RoomScene.medium, this.roomConfig, false);
  }

  public sceneOff(): Promise<void> {
    this.logger.info(`sceneOff`);
    return this.roomService.setScene(RoomScene.off, this.roomConfig, false);
  }

  public async sceneSmart(): Promise<void> {
    this.logger.info(`sceneSmart`);
    const rokuInfo = this.roomConfig.config?.roku;
    if (rokuInfo) {
      this.roomService.setRoku(rokuInfo.defaultChannel, rokuInfo);
    }
    return this.roomService.smart(this.roomConfig);
  }

  // #endregion Public Methods

  // #region Private Methods

  @OnEvent('room/circadian')
  private async setCircadian(mode: CircadianModes, room: string) {
    // FIXME: Split thing is a hack for my situation
    const name = this.roomConfig.name.split('_').shift();
    if (room !== name) {
      return;
    }
    this.logger.info(`Circadian`, mode);
    const high = `switch.circadian_lighting_${name}_circadian_high`;
    const medium = `switch.circadian_lighting_${name}_circadian_medium`;
    const low = `switch.circadian_lighting_${name}_circadian_low`;
    switch (mode) {
      case CircadianModes.high:
        this.entityService.turnOff(low);
        this.entityService.turnOff(medium);
        this.entityService.turnOn(high);
        return;
      case CircadianModes.medium:
        this.entityService.turnOff(low);
        this.entityService.turnOff(high);
        this.entityService.turnOn(medium);
        return;
      case CircadianModes.low:
        this.entityService.turnOff(high);
        this.entityService.turnOff(medium);
        this.entityService.turnOn(low);
        return;
      case CircadianModes.off:
        this.entityService.turnOff(low);
        this.entityService.turnOff(medium);
        this.entityService.turnOff(high);
        return;
    }
  }

  @OnEvent('room/set-scene')
  private async setSceneHandler(scene: RoomScene, roomName: string) {
    if (roomName !== this.roomConfig.name) {
      return;
    }
    switch (scene) {
      case RoomScene.high:
        return this.sceneHigh();
      case RoomScene.medium:
        return this.sceneMedium();
      case RoomScene.low:
        return this.sceneLow();
      case RoomScene.off:
        return this.sceneOff();
    }
  }

  // #endregion Private Methods
}
