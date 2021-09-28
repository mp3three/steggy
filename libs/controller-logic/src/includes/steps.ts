import { RoomCommandScope } from '../contracts';

const MAX = 3;
const START = 0;

export function Steps(length = MAX): RoomCommandScope[][] {
  return [
    [RoomCommandScope.LOCAL],
    [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
  ].slice(START, length);
}
