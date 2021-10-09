import { LightingCacheDTO } from '../dto';
import { BASIC_STATE } from '../schemas';

export class RoomEntitySaveStateDTO {
  extra?: LightingCacheDTO | Record<string, unknown>;
  id: string;
  state: string;
}

export class RoomSaveStateDTO {
  entities: RoomEntitySaveStateDTO[];
  groups: Record<string, BASIC_STATE[]>;
  id: string;
  name: string;
}
