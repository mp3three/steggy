import { iRoomController } from '../../interfaces/room-controller';
import { RoomControllerSettingsDTO } from '.';

export interface HiddenService {
  // #region Object Properties

  controller: Partial<iRoomController>;
  settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Public Methods

  init(): Promise<void>;

  // #endregion Public Methods
}
