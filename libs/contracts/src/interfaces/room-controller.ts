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

export interface iRoomControllerMethods {
  // #region Public Methods

  /**
   * Return false to block built in off command
   */
  areaOff(...parameters: unknown[]): Promise<boolean | void>;
  /**
   * Return false to block built in on command
   */
  areaOn(...parameters: unknown[]): Promise<boolean | void>;
  /**
   * Got your own secret konami code?
   *
   * Return false to block additional processing, is run first
   */
  combo(...parameters: unknown[]): Promise<boolean | void>;
  /**
   * Return false to block built in dim up command
   */
  dimDown(...parameters: unknown[]): Promise<boolean | void>;
  /**
   * Return false to block built in dim down command
   */
  dimUp(...parameters: unknown[]): Promise<boolean | void>;
  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(...parameters: unknown[]): Promise<boolean | void>;

  // #endregion Public Methods
}

export interface iLightManager {
  // #region Public Methods

  areaOff(): Promise<void>;
  areaOn(): Promise<void>;
  dimDown(): Promise<void>;
  dimUp(): Promise<void>;

  // #endregion Public Methods
}

export interface iRoomController extends Partial<iRoomControllerMethods> {
  // #region Object Properties

  lightManager: iLightManager;

  // #endregion Object Properties
}
