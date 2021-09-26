import { AuthStack } from '@automagical/server';
import { applyDecorators, Controller, Provider } from '@nestjs/common';

import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '../contracts';

export const DynamicRoomProviders = new Set<Provider>();

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  settings.flags ??= [];
  return applyDecorators(
    AuthStack(),
    Controller(`/room/${settings.name}`),
    function (target) {
      target[ROOM_CONTROLLER_SETTINGS] = settings;
    },
  );
}
