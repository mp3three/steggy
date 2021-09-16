import { ControllerStates } from './constants';

export class RoomControllerParametersDTO {
  count?: number;
}

export type RoomControllerMethodReturn =
  | Promise<void>
  | Promise<boolean>
  | boolean
  | void;

export interface iRoomControllerMethods extends iLightManager {
  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
}

export interface iLightManager {
  areaOff(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  areaOn(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  circadianLight(
    entity_id: string | string[],
    brightness?: number,
  ): Promise<void>;
  dimDown(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
  dimUp(data: RoomControllerParametersDTO): RoomControllerMethodReturn;
}

export class KunamiCallbackParametersDTO {
  public events: ControllerStates[];
}
export class KunamiActivateDTO {
  /**
   *
   */
  ignoreRelease?: boolean;
  states?: ControllerStates[];
}

export type KunamiCallback = (
  data: KunamiCallbackParametersDTO,
) => void | Promise<void>;

export class KunamiCommandDTO {
  public activate: KunamiActivateDTO;
  public callback: KunamiCallback;
  /**
   * For quick identification by humans
   */
  public name: string;
}

export interface iKunamiService {
  addCommand(command: KunamiCommandDTO): void;
}

export interface iRoomController extends Partial<iRoomControllerMethods> {
  kunamiService: iKunamiService;
  lightManager: iLightManager;
}
