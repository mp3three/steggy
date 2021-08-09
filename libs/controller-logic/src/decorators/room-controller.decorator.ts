import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Injectable, Provider } from '@nestjs/common';

export const DynamicRoomProviders = new Set<Provider>();

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  return function (target) {
    target[ROOM_CONTROLLER_SETTINGS] = settings;
    return Injectable()(target);
  };
}
