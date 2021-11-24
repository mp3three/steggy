import { ApiProperty } from '@nestjs/swagger';
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

export class SolarActivateDTO {
  @ApiProperty()
  public event: keyof SolarCalcType;
}

export type ROUTINE_ACTIVATE_TYPES =
  | KunamiCodeActivateDTO
  | SolarActivateDTO
  | ScheduleActivateDTO
  | StateChangeActivateDTO;
export class RoutineActivateDTO<EVENTS = ROUTINE_ACTIVATE_TYPES> {
  @ApiProperty({
    oneOf: [
      { $ref: `#/components/schemas/${KunamiCodeActivateDTO.name}` },
      { $ref: `#/components/schemas/${SolarActivateDTO.name}` },
      { $ref: `#/components/schemas/${ScheduleActivateDTO.name}` },
      { $ref: `#/components/schemas/${StateChangeActivateDTO.name}` },
    ],
  })
  public activate: EVENTS;
  @ApiProperty()
  public friendlyName: string;
  @ApiProperty()
  public id?: string;
  @ApiProperty({ enum: Object.values(ROUTINE_ACTIVATE_TYPE) })
  public type: ROUTINE_ACTIVATE_TYPE;
}
