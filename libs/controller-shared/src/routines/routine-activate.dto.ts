import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength, ValidateNested } from 'class-validator';
import SolarCalcType from 'solar-calc/types/solarCalc';

import { MINIMUM_NAME_SIZE } from '../constants';
import { AttributeChangeActivateDTO } from './attribute-change-activate.dto';
import { DeviceTriggerActivateDTO } from './device-trigger-activate.dto';
import { InternalEventActivateDTO } from './internal-event.dto';
import { SequenceActivateDTO } from './kunami-code-activate.dto';
import { MetadataChangeDTO } from './metadata-change.dto';
import { ScheduleActivateDTO } from './schedule-activate.dto';
import { StateChangeActivateDTO } from './state-change-activate.dto';

export type ActivateTypes =
  | 'attribute'
  | 'device_trigger'
  | 'kunami'
  | 'metadata'
  | 'schedule'
  | 'solar'
  | 'internal_event'
  | 'state_change';
export enum ROUTINE_ACTIVATE_TYPE {
  attribute = 'attribute',
  device_trigger = 'device_trigger',
  /**
   * aka "sequence"
   */
  kunami = 'kunami',
  internal_event = 'internal_event',
  metadata = 'metadata',
  schedule = 'schedule',
  solar = 'solar',
  state_change = 'state_change',
}

export class SolarActivateDTO {
  @ApiProperty()
  public event: keyof SolarCalcType;
}

export type ROUTINE_ACTIVATE_TYPES =
  | SequenceActivateDTO
  | SolarActivateDTO
  | MetadataChangeDTO
  | InternalEventActivateDTO
  | AttributeChangeActivateDTO
  | ScheduleActivateDTO
  | DeviceTriggerActivateDTO
  | StateChangeActivateDTO;
export class RoutineActivateDTO<EVENTS = ROUTINE_ACTIVATE_TYPES> {
  @ApiProperty({
    oneOf: [
      { $ref: `#/components/schemas/${SequenceActivateDTO.name}` },
      { $ref: `#/components/schemas/${SolarActivateDTO.name}` },
      { $ref: `#/components/schemas/${ScheduleActivateDTO.name}` },
      { $ref: `#/components/schemas/${AttributeChangeActivateDTO.name}` },
      { $ref: `#/components/schemas/${MetadataChangeDTO.name}` },
      { $ref: `#/components/schemas/${InternalEventActivateDTO.name}` },
      { $ref: `#/components/schemas/${StateChangeActivateDTO.name}` },
      { $ref: `#/components/schemas/${DeviceTriggerActivateDTO.name}` },
    ],
  })
  @ValidateNested()
  public activate: EVENTS;
  @ApiProperty()
  @IsString()
  @MinLength(MINIMUM_NAME_SIZE)
  public friendlyName: string;
  @ApiProperty()
  public id?: string;
  @ApiProperty({ enum: Object.values(ROUTINE_ACTIVATE_TYPE) })
  @IsEnum(ROUTINE_ACTIVATE_TYPE)
  public type: ActivateTypes;
}
