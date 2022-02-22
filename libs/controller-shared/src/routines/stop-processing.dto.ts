import { ComparisonDTO } from '@automagical/utilities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { RoutineCommandWebhookDTO } from './routine-command.dto';

export enum STOP_PROCESSING_TYPE {
  attribute = 'attribute',
  date = 'date',
  state = 'state',
  template = 'template',
  webhook = 'webhook',
}

export enum RELATIVE_DATE_COMPARISON_TYPE {
  after = 'after',
  before = 'before',
  in_range = 'in_range',
  not_in_range = 'not_in_range',
}

type relative = `${RELATIVE_DATE_COMPARISON_TYPE}`;

export class RoutineStateComparisonDTO extends ComparisonDTO {
  public entity_id: string;
}
export class RoutineAttributeComparisonDTO extends ComparisonDTO {
  public attribute: string;
  public entity_id: string;
}

export class RoutineWebhookComparisonDTO extends ComparisonDTO {
  public handleAs: 'text' | 'json';
  public property?: string;
  public webhook: RoutineCommandWebhookDTO;
}

export class RoutineTemplateComparisonDTO extends ComparisonDTO {
  public template: string;
}

export class RoutineRelativeDateComparisonDTO {
  @ApiProperty()
  @IsEnum(STOP_PROCESSING_TYPE)
  public dateType: relative;
  @ApiProperty()
  @IsString()
  public expression: string;
}

export type STOP_PROCESSING_DEFINITIONS =
  | RoutineStateComparisonDTO
  | RoutineAttributeComparisonDTO
  | RoutineWebhookComparisonDTO
  | RoutineTemplateComparisonDTO
  | RoutineRelativeDateComparisonDTO;

export class RoutineComparisonDTO {
  public comparison: STOP_PROCESSING_DEFINITIONS;
  public friendlyName: string;
  public id: string;
  public type: STOP_PROCESSING_TYPE;
}

export class RoutineCommandStopProcessingDTO {
  public comparisons: RoutineComparisonDTO;
  public mode: 'all' | 'any';
}
