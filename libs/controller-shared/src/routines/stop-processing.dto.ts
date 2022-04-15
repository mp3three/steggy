import { ApiProperty } from '@nestjs/swagger';
import { ComparisonDTO } from '@steggy/utilities';
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
  @ApiProperty()
  public entity_id: string;
}

export class RoutineAttributeComparisonDTO extends ComparisonDTO {
  @IsString()
  @ApiProperty()
  public attribute: string;
  @IsString()
  @ApiProperty()
  public entity_id: string;
}

export class RoomMetadataComparisonDTO extends ComparisonDTO {
  @IsString()
  @ApiProperty()
  public property: string;
  @IsString()
  @ApiProperty()
  public room: string;
}

export class RoutineWebhookComparisonDTO extends ComparisonDTO {
  @IsEnum(['text', 'json'])
  @ApiProperty()
  public handleAs: 'text' | 'json';
  @IsString()
  @IsOptional()
  @ApiProperty()
  public property?: string;
  @ValidateNested()
  @ApiProperty()
  public webhook: RoutineCommandWebhookDTO;
}

export class RoutineTemplateComparisonDTO extends ComparisonDTO {
  @IsString()
  @ApiProperty()
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

export class RoutineComparisonDTO<
  TYPE =
    | RoutineStateComparisonDTO
    | RoutineAttributeComparisonDTO
    | RoutineWebhookComparisonDTO
    | RoutineTemplateComparisonDTO
    | RoomMetadataComparisonDTO
    | RoutineRelativeDateComparisonDTO,
> {
  @ValidateNested()
  @ApiProperty()
  public comparison: TYPE;
  @IsString()
  @ApiProperty()
  public friendlyName: string;
  @IsString()
  @ApiProperty()
  public id: string;
  @IsEnum(STOP_PROCESSING_TYPE)
  @ApiProperty()
  public type: STOP_PROCESSING_TYPE;
}

export class RoutineCommandStopProcessingDTO<T = STOP_PROCESSING_DEFINITIONS> {
  @ValidateNested()
  @ApiProperty()
  public comparisons: RoutineComparisonDTO<T>[];
  @IsEnum(['all', 'any'])
  @ApiProperty()
  public mode: 'all' | 'any';
}
