import {
  EntityService,
  HomeAssistantService,
  RoomName,
  RoomService,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { RoomCode } from './scene.room';

export type BaseRoomConstructor = {
  homeAssistantService: HomeAssistantService;
  configService: ConfigService;
  roomService: RoomService;
  entityService: EntityService;
};

export abstract class BaseRoom extends EventEmitter {
  // #region Static Properties

  protected static readonly REGISTRY: Record<string, BaseRoom> = {};

  // #endregion Static Properties

  // #region Object Properties

  protected configService: ConfigService;
  protected entityService: EntityService;
  protected friendlyName: RoomName;
  protected homeAssistantService: HomeAssistantService;
  protected roomConfig: {
    config: Record<string, unknown>;
  } = null;
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
    this.configService = refs.configService;
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
  protected async onModuleInit(): Promise<void> {
    const configPath = join(
      this.configService.get('application.CONFIG_PATH'),
      `${this.roomCode}.yaml`,
    );
    this.roomConfig = yaml.load(readFileSync(configPath, 'utf8')) as {
      config: Record<string, unknown>;
    };
  }

  // #endregion Protected Methods
}
