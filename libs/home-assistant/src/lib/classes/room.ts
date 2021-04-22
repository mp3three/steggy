import {
  GLOBAL_OFF,
  GLOBAL_ON,
  HA_RAW_EVENT,
} from '@automagical/contracts/constants';
import {
  HassDomains,
  HassEventDTO,
  HassEvents,
  HomeAssistantRoomConfigDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { EntityService, HomeAssistantService, RoomService } from '../services';

export abstract class SceneRoom {
  // #region Static Properties

  private static ROOM_REGISTRY: Record<string, SceneRoom> = {};

  // #endregion Static Properties

  // #region Object Properties

  protected readonly entityService: EntityService;
  protected readonly eventEmitter: EventEmitter2;
  protected readonly homeAssistantService: HomeAssistantService;
  protected readonly roomConfig: HomeAssistantRoomConfigDTO;
  protected readonly roomService: RoomService;

  protected allowGlobalAccess = true;
  protected logger: PinoLogger;

  private NEXT_FAVORITE = false;

  // #endregion Object Properties

  // #region Public Methods

  public async onModuleInit(): Promise<void> {
    SceneRoom.ROOM_REGISTRY[this.roomConfig.name] = this;
  }

  public async setFavoriteScene(): Promise<void> {
    const scene = this.roomService.IS_EVENING ? GLOBAL_OFF : GLOBAL_ON;
    this.eventEmitter.emit(scene, this.roomConfig.name);
    if (!this.roomConfig.favorite) {
      this.roomConfig.config?.lights?.forEach(async (entityId) => {
        await this.entityService.turnOn(entityId);
      });
      return;
    }
    const grouping = this.roomService.IS_EVENING
      ? this.roomConfig.favorite.evening
      : this.roomConfig.favorite.day;
    grouping?.on?.forEach(async (entityId) => {
      await this.entityService.turnOn(entityId);
    });
    grouping?.off?.forEach(async (entityId) => {
      await this.entityService.turnOff(entityId);
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  @OnEvent([GLOBAL_ON])
  private onGlobalOff(exclude?: string) {
    if (exclude === this.roomConfig.name) {
      return;
    }
    this.roomConfig?.config?.lights?.forEach(async (entityId) => {
      await this.entityService.turnOff(entityId);
    });
    if (!this.roomService.IS_EVENING) {
      this.roomConfig?.config?.accssories?.forEach(async (entityId) => {
        await this.entityService.turnOff(entityId);
      });
    }
  }

  @OnEvent([GLOBAL_ON])
  private onGlobalOn(exclude?: string) {
    if (exclude === this.roomConfig.name) {
      return;
    }
    this.roomConfig?.config?.lights?.forEach(async (entityId) => {
      await this.entityService.turnOn(entityId);
    });
    if (!this.roomService.IS_EVENING) {
      this.roomConfig?.config?.accssories?.forEach(async (entityId) => {
        await this.entityService.turnOn(entityId);
      });
    }
  }

  @OnEvent([HA_RAW_EVENT])
  private async onPicoEvent(event: HassEventDTO): Promise<void> {
    if (event.event_type !== HassEvents.state_changed) {
      return;
    }
    if (event.data.entity_id !== this.roomConfig?.config?.pico) {
      return;
    }
    const state = event.data.new_state;
    if (state.state === PicoStates.none) {
      return;
    }
    if (this.NEXT_FAVORITE) {
      this.NEXT_FAVORITE = false;
      if (state.state === PicoStates.high) {
        this.logger.trace('GLOBAL_ON');
        this.eventEmitter.emit(GLOBAL_ON);
        return;
      }
      if (state.state === PicoStates.off) {
        this.logger.trace('GLOBAL_OFF');
        this.eventEmitter.emit(GLOBAL_OFF);
        return;
      }
      if (state.state === PicoStates.favorite) {
        await this.setFavoriteScene();
        return;
      }
      this.logger.warn('up/down favorite not implemented');
      return;
    }
    this.NEXT_FAVORITE = true;
    const groups = new Map(Object.entries(this.roomConfig.groups));
    if (state.state === PicoStates.high) {
      this.roomConfig?.config?.lights?.forEach(async (entityId) => {
        await this.entityService.turnOn(entityId, groups);
      });
      return;
    }
    if (state.state === PicoStates.off) {
      this.roomConfig?.config?.lights?.forEach(async (entityId) => {
        await this.entityService.turnOff(entityId, groups);
      });
      return;
    }
    if (state.state === PicoStates.favorite) {
      this.roomConfig?.config?.lights
        ?.filter((entityId) => entityId.split('.')[0] === HassDomains.switch)
        .forEach(async (entityId) => {
          await this.entityService.turnOn(entityId, groups);
        });
      return;
    }
  }

  // #endregion Private Methods
}

// @OnEvent('room/set-scene')
// private async setSceneHandler(scene: RoomScene, roomName: string) {
//   if (roomName !== this.roomConfig.name) {
//     return;
//   }
//   switch (scene) {
//     case RoomScene.high:
//       return this.sceneHigh();
//     case RoomScene.medium:
//       return this.sceneMedium();
//     case RoomScene.low:
//       return this.sceneLow();
//     case RoomScene.off:
//       return this.sceneOff();
//   }
// }
