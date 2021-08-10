import { ControllerStates } from './constants';

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

export class KunamiCallbackParametersDTO {
  // #region Object Properties

  public events: ControllerStates[];

  // #endregion Object Properties
}
export class KunamiActivateDTO {
  // #region Object Properties

  /**
   *
   */
  ignoreRelease?: boolean;
  states?: ControllerStates[];

  // #endregion Object Properties
}

export type KunamiCallback = (
  data: KunamiCallbackParametersDTO,
) => void | Promise<void>;

export class KunamiCommandDTO {
  // #region Object Properties

  public activate: KunamiActivateDTO;
  public callback: KunamiCallback;

  // #endregion Object Properties
}

export interface iKunamiService {
  // #region Public Methods

  addCommand(command: KunamiCommandDTO): void;

  // #endregion Public Methods
}

export interface iRoomController extends Partial<iRoomControllerMethods> {
  // #region Object Properties

  kunamiService: iKunamiService;
  lightManager: iLightManager;

  // #endregion Object Properties
}
