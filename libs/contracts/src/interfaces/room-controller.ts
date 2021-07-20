import { PicoStates } from '../libs/home-assistant/enums';

class RoomToRoomDTO {
  // #region Object Properties

  public name: string;
  public type?: 'on' | 'off' | 'all';

  // #endregion Object Properties
}
/**
 * For basic standardized modes
 *
 * Intended workflow pressing the turn on button:
 * - 1st press: turn on main lights / switches
 * - 2nd press: turn on nearby hallway / transition lights
 * - 3rd press: turn on common areas
 */
export class RoomDeviceDTO {
  // #region Object Properties

  public comboCount: number;
  public rooms?: (string | RoomToRoomDTO)[];
  public target?: string[];

  // #endregion Object Properties
}

export class ControllerSettings {
  // #region Object Properties

  public devices: RoomDeviceDTO[];
  public dimPercent?: number;
  /**
   * default: 2500
   */
  public konamiTimeout?: number;

  // #endregion Object Properties
}

export interface RoomController {
  // #region Object Properties

  _CONTROLLER_SETTINGS: ControllerSettings;
  name: string;

  // #endregion Object Properties

  // #region Public Methods

  /**
   * Return false to block built in off command
   */
  areaOff(count: number): Promise<boolean>;
  /**
   * Return false to block built in on command
   */
  areaOn(count: number): Promise<boolean>;
  /**
   * Got your own secret konami code?
   *
   * Return false to block additional processing, is run first
   */
  combo(actions: PicoStates[]): Promise<boolean>;
  /**
   * Return false to block built in dim up command
   */
  dimDown(count: number): Promise<boolean>;
  /**
   * Return false to block built in dim down command
   */
  dimUp(count: number): Promise<boolean>;
  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(count: number): Promise<boolean>;

  // #endregion Public Methods
}
