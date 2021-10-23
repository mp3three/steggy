import { KunamiCodeActivateDTO } from './kunami-code-activate.dto';
import { ScheduleActivate } from './schedule-activate.dto';
import { StateChangeActivateDTO } from './state-change-activate.dto';

export class RoutineActivateDTO {
  public event:
    | KunamiCodeActivateDTO
    | ScheduleActivate
    | StateChangeActivateDTO;
  public friendlyName: string;
}
