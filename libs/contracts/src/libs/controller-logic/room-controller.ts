import { ControllerStates } from './constants';

export class RoomControllerParametersDTO {
  // #region Object Properties

  count?: number;

  // #endregion Object Properties
}

export type RoomControllerMethodReturn =
  | Promise<void>
  | Promise<boolean>
  | boolean
  | void;

export interface iRoomControllerMethods extends iLightManager {
  // #region Public Methods

  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(data: RoomControllerParametersDTO): RoomControllerMethodReturn;

  // #endregion Public Methods
}

export interface iLightManager {
  // #region Public Methods

  areaOff(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  areaOn(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  circadianLight(
    entity_id: string | string[],
    brightness?: number,
  ): Promise<void>;
  dimDown(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  dimUp(data: RoomControllerParametersDTO): RoomControllerMethodReturn;

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
  /**
   * For quick identification by humans
   */
  public name: string;

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
