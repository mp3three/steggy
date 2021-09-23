import { Controller, Provider } from '@nestjs/common';

import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '../contracts';

export const DynamicRoomProviders = new Set<Provider>();

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  settings.flags ??= [];
  return function (target) {
    target[ROOM_CONTROLLER_SETTINGS] = settings;
    return Controller(`/room/${settings.name}`)(target);
  };
}
