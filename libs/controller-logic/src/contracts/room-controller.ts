import { ControllerStates } from './constants';
import { RoomCommandDTO } from './room-command.dto';

export type RoomControllerMethodReturn =
  | Promise<void>
  | Promise<boolean>
  | boolean
  | void;

export interface iRoomControllerMethods extends iLightManager {
  /**
   * Provide some logic for the favorite button in the middle
   */
  favorite(data: RoomCommandDTO): RoomControllerMethodReturn;
}

export interface iLightManager {
  areaOff(data: RoomCommandDTO): RoomControllerMethodReturn;
  areaOn(data: RoomCommandDTO): RoomControllerMethodReturn;
  circadianLight(
    entity_id: string | string[],
    brightness?: number,
  ): Promise<void>;
  dimDown(data: RoomCommandDTO): RoomControllerMethodReturn;
  dimUp(data: RoomCommandDTO): RoomControllerMethodReturn;
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

export type iRoomController = Partial<iRoomControllerMethods>;
