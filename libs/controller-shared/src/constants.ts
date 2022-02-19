import { iRoomControllerMethods } from './room-controller';

export const LIGHTING_CONTROLLER = Symbol('LIGHTING_CONTROLLER');
export const HASS_ENTITY_ID = Symbol('HASS_ENTITY_ID');
export const STATE_MANAGER = Symbol('STATE_MANAGER');
export const KUNAMI_CODE = Symbol('KUNAMI_CODE');
export const COMPLEX_LOGIC = Symbol('COMPLEX_LOGIC');
export const ROOM_API_COMMAND = Symbol('ROOM_API_COMMAND');
export const CIRCADIAN_UPDATE = 'CIRCADIAN_UPDATE';
export const LIGHT_FORCE_CIRCADIAN = 'LIGHT_FORCE_CIRCADIAN';

export enum ControllerStates {
  on = 'on',
  off = 'off',
  up = 'up',
  down = 'down',
  favorite = 'favorite',
  none = 'none',
}

export const CONTROLLER_STATE_EVENT = (
  entity_id: string,
  state: ControllerStates | '*',
): string => `controller/${entity_id}/${state}`;

export const ROOM_COMMAND = (
  room: string,
  state: keyof iRoomControllerMethods | '*',
): string => [`room`, room, state].join('/');
