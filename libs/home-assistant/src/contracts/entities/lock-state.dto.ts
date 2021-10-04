import { HassStateDTO } from '../hass-state.dto';

export class LockAttributesDTO {
  battey_level?: number;
  friendly_name?: string;
}

export enum LOCK_STATES {
  locked = 'locked',
  unlocking = 'unlocking',
  unlocked = 'unlocked',
  locking = 'locking',
}

export class LockStateDTO extends HassStateDTO<
  LOCK_STATES | `${LOCK_STATES}`,
  LockAttributesDTO
> {}
