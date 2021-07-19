import { PicoStates } from '@automagical/contracts/home-assistant';

export class ControllerSettings {
  // #region Object Properties

  public dimPercent?: number;
  /**
   * default: 2500
   */
  public konamiTimeout?: number;
  public lights?: string[];
  public switches?: string[];

  // #endregion Object Properties
}

export interface RoomController {
  // #region Object Properties

  controller: ControllerSettings;
  name: string;

  // #endregion Object Properties

  // #region Public Methods

  /**
   * Return false to block built in off command
   */
  areaOff(): Promise<boolean>;
  /**
   * Return false to block built in on command
   */
  areaOn(): Promise<boolean>;
  /**
   * Got your own secret konami code?
   *
   * Return false to block additional processing, is run first
   */
  combo(actions: PicoStates[]): Promise<boolean>;
  /**
   * Return false to block built in dim up command
   */
  dimDown(): Promise<boolean>;
  /**
   * Return false to block built in dim down command
   */
  dimUp(): Promise<boolean>;
  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(): Promise<void>;

  // #endregion Public Methods
}
