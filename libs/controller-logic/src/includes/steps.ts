import { RoomCommandScope } from '../contracts';

export function Steps(length = 3): RoomCommandScope[][] {
  return [
    [RoomCommandScope.LOCAL],
    [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
  ].slice(0, length);
}
