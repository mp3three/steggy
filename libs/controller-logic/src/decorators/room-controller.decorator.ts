import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Injectable } from '@nestjs/common';

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  return function (target) {
    target[ROOM_CONTROLLER_SETTINGS] = settings;
    return Injectable()(target);
  };
}
