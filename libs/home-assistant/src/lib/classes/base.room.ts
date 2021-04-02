import { RoomName } from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { EventEmitter } from 'events';
import { RoomCode } from './scene.room';

export class BaseRoomConfigDTO {
  // #region Object Properties

  public config: Record<never, unknown>;

  // #endregion Object Properties
}

export abstract class BaseRoom extends EventEmitter {
  // #region Object Properties

  protected readonly logger = Logger(BaseRoom);

  protected friendlyName: RoomName;
  protected roomConfig: BaseRoomConfigDTO = null;

  // #endregion Object Properties

  // #region Constructors

  constructor(protected roomCode: RoomCode) {
    super();
    this.friendlyName = RoomName[roomCode];
    this.loadRoomConfig();
  }

  // #endregion Constructors

  // #region Public Abstract Methods

  public abstract exec(args: unknown): Promise<void>;
  public abstract loadRoomConfig(): Promise<BaseRoomConfigDTO>;

  // #endregion Public Abstract Methods
}
