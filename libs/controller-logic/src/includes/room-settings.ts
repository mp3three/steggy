import {
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '../contracts';

export function RoomSettings(
  instance: iRoomController,
): RoomControllerSettingsDTO {
  return instance?.constructor[ROOM_CONTROLLER_SETTINGS] ?? {};
}
