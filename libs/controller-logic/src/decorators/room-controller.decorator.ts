import {
  CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  return function (target) {
    target[CONTROLLER_SETTINGS] = settings;
  };
}
