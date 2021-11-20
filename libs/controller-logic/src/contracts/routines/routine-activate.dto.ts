import SolarCalcType from 'solar-calc/types/solarCalc';

import { KunamiCodeActivateDTO } from './kunami-code-activate.dto';
import { ScheduleActivateDTO } from './schedule-activate.dto';
import { StateChangeActivateDTO } from './state-change-activate.dto';

export enum ROUTINE_ACTIVATE_TYPE {
  kunami = 'kunami',
  schedule = 'schedule',
  state_change = 'state_change',
  solar = 'solar',
}

export type ROUTINE_ACTIVATE_TYPES =
  | KunamiCodeActivateDTO
  | SolarActivateDTO
  | ScheduleActivateDTO
  | StateChangeActivateDTO;
export class RoutineActivateDTO<EVENTS = ROUTINE_ACTIVATE_TYPES> {
  public activate: EVENTS;
  public friendlyName: string;
  public id?: string;
  public type: ROUTINE_ACTIVATE_TYPE;
}

export class SolarActivateDTO {
  public event: keyof SolarCalcType;
}
