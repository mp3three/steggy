import { readFileSync } from 'fs';
import { AnyKindOfDictionary, Dictionary } from 'lodash';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import { RoomService } from './room.service';
import { HomeAssistantService } from './home-assistant.service';
import { EntityService } from './entity.service';
import { RoomCode } from './scene.room';
import { RoomName } from '../typings/room';
import { Logger } from '@automagical/logger';

export type BaseConfigure = {
  config?: AnyKindOfDictionary;
};

export type BaseRoomConfig = {
  config?: BaseConfigure;
};

export type BaseRoomConstructor = {
  homeAssistantService: HomeAssistantService;
  roomService: RoomService;
  entityService: EntityService;
};

export abstract class BaseRoom extends EventEmitter {
  // #region Static Properties

  protected static readonly REGISTRY: Dictionary<BaseRoom> = {};

  // #endregion Static Properties

  // #region Object Properties

  protected entityService: EntityService;
  protected friendlyName: RoomName;
  protected homeAssistantService: HomeAssistantService;
  protected roomConfig: BaseRoomConfig = null;
  protected roomService: RoomService;

  private readonly _baseLogger = Logger(BaseRoom);

  // #endregion Object Properties

  // #region Constructors

  constructor(protected roomCode: RoomCode, refs: BaseRoomConstructor) {
    super();
    if (BaseRoom.REGISTRY[roomCode]) {
      this._baseLogger.alert(`Double register room: ${roomCode}`);
      return;
    }
    this.homeAssistantService = refs.homeAssistantService;
    this.roomService = refs.roomService;
    this.entityService = refs.entityService;
    this.friendlyName = RoomName[roomCode];
    BaseRoom.REGISTRY[roomCode] = this;
    RoomService.ROOM_LIST[roomCode] = this;
  }

  // #endregion Constructors

  // #region Public Abstract Methods

  public abstract exec(args: unknown): Promise<void>;

  // #endregion Public Abstract Methods

  // #region Protected Methods

  /**
   * Implementations of this class should be @Injectable() to take advantage of this
   */
  protected async onModuleInit() {
    //
    const configPath = join(process.env.HOMEASSISTANT_CONFIG_PATH, `${this.roomCode}.yaml`);
    this.roomConfig = yaml.load(readFileSync(configPath, 'utf8'));
  }

  // #endregion Protected Methods
}
