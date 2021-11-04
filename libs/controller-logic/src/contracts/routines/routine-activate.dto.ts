import { KunamiCodeActivateDTO } from './kunami-code-activate.dto';
import { ScheduleActivateDTO } from './schedule-activate.dto';
import { StateChangeActivateDTO } from './state-change-activate.dto';

export enum ROUTINE_ACTIVATE_TYPE {
  kunami = 'kunami',
  schedule = 'schedule',
  state_change = 'state_change',
}

export type ROUTINE_ACTIVATE_TYPES =
  | KunamiCodeActivateDTO
  | ScheduleActivateDTO
  | StateChangeActivateDTO;
export class RoutineActivateDTO<EVENTS = ROUTINE_ACTIVATE_TYPES> {
  public activate: EVENTS;
  public friendlyName: string;
  public id?: string;
  public type: ROUTINE_ACTIVATE_TYPE;
}
