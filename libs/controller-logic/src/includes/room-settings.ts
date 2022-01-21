import {
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@text-based/controller-shared';

export function RoomSettings(
  instance: iRoomController,
): RoomControllerSettingsDTO {
  return instance?.constructor[ROOM_CONTROLLER_SETTINGS] ?? {};
}
