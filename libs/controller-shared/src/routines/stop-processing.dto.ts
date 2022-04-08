import { ComparisonDTO } from '@steggy/utilities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { RoutineCommandWebhookDTO } from './routine-command.dto';

export enum STOP_PROCESSING_TYPE {
  attribute = 'attribute',
  date = 'date',
  state = 'state',
  room_metadata = 'room_metadata',
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
  @IsString()
  public entity_id: string;
}

export class RoutineAttributeComparisonDTO extends ComparisonDTO {
  @IsString()
  public attribute: string;
  @IsString()
  public entity_id: string;
}

export class RoomMetadataComparisonDTO extends ComparisonDTO {
  @IsString()
  public property: string;
  @IsString()
  public room: string;
}

export class RoutineWebhookComparisonDTO extends ComparisonDTO {
  @IsEnum(['text', 'json'])
  public handleAs: 'text' | 'json';
  @IsString()
  @IsOptional()
  public property?: string;
  @ValidateNested()
  public webhook: RoutineCommandWebhookDTO;
}

export class RoutineTemplateComparisonDTO extends ComparisonDTO {
  @IsString()
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
  | RoomMetadataComparisonDTO
  | RoutineRelativeDateComparisonDTO;

export class RoutineComparisonDTO {
  @ValidateNested()
  public comparison: STOP_PROCESSING_DEFINITIONS;
  @IsString()
  public friendlyName: string;
  @IsString()
  public id: string;
  @IsEnum(STOP_PROCESSING_TYPE)
  public type: STOP_PROCESSING_TYPE;
}

export class RoutineCommandStopProcessingDTO {
  @ValidateNested()
  public comparisons: RoutineComparisonDTO[];
  @IsEnum(['all', 'any'])
  public mode: 'all' | 'any';
}
