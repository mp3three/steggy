import { RoomCommandScope } from '../contracts';

export function Steps(length = 3): RoomCommandScope[][] {
  return [
    [RoomCommandScope.LOCAL],
    [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
    [
      RoomCommandScope.LOCAL,
      RoomCommandScope.ACCESSORIES,
      RoomCommandScope.BROADCAST,
    ],
  ].slice(0, length);
}
