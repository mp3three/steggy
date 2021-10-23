import { KunamiCodeActivateDTO } from './kunami-code-activate.dto';
import { StateChangeActivateDTO } from './state-change-activate.dto';

export class RoutineActivateDTO {
  public event: StateChangeActivateDTO | KunamiCodeActivateDTO;
  public friendlyName: string;
}
