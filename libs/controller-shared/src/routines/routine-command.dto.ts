import { ApiProperty } from '@nestjs/swagger';
import { HTTP_METHODS } from '@steggy/utilities';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MINIMUM_NAME_SIZE } from '../constants';
import { GroupDTO, RoomDTO } from '../schemas';

export class RoutineCommandRoomStateDTO {
  @IsString()
  @ApiProperty({ type: 'string' })
  public room: string | RoomDTO;
  @IsString()
  @ApiProperty()
  public state: string;
}

export class RoutineCommandPersonStateDTO {
  @IsString()
  @ApiProperty({ type: 'string' })
  public person: string;
  @IsString()
  @ApiProperty()
  public state: string;
}

export class RoutineCommandGroupStateDTO {
  @IsString()
  @ApiProperty({ type: 'string' })
  public group: string | GroupDTO;
  @IsString()
  @ApiProperty()
  public state: string;
}

export class RoutineCommandGroupActionDTO<
  EXTRA extends unknown = Record<string, unknown>,
> {
  @IsString()
  @ApiProperty()
  public command: string;
  @IsObject()
  @IsOptional()
  @ApiProperty()
  public extra?: EXTRA;
  @IsString()
  @ApiProperty()
  public group: string | GroupDTO;
}

export class RoutineCommandSendNotificationDTO {
  @ApiProperty()
  @IsString()
  public template?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  public type?: 'simple' | 'eval' | 'template';
}

export class RoutineCommandSleepDTO {
  @ApiProperty()
  @IsNumber()
  public duration: number;
}

export class RoutineCommandTriggerRoutineDTO {
  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  public force: boolean;
  @ApiProperty()
  @IsString()
  public routine?: string;
  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  public runChildren?: boolean;
}

enum LightFlashType {
  group = 'group',
  entity = 'entity',
}

export class RoutineCommandLightFlashDTO {
  @ApiProperty({ required: false })
  @IsNumber()
  public brightness?: number;
  @ApiProperty()
  @IsNumber()
  public duration: number;
  @ApiProperty()
  @IsNumber()
  public interval: number;
  @ApiProperty()
  @IsString()
  public ref: string;
  @ValidateNested()
  @ApiProperty({ required: false })
  public rgb?: Record<'r' | 'g' | 'b', number>;
  @ApiProperty({ enum: ['group', 'entity'] })
  @IsEnum(LightFlashType)
  public type: 'group' | 'entity';
}

export class RoutineCaptureCommandDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  public group?: string[];
  @ApiProperty()
  @IsOptional()
  @IsString()
  public key?: string;
}

export class RoutineCodeCommandDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  public code: string;
}

export class RoutineRestoreCommandDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  public key?: string;
}

export class WebhookHeaderDTO {
  @ApiProperty()
  @IsString()
  public header: string;
  @ApiProperty()
  @IsString()
  public value: string;
}

export class CallServiceCommandAttribute {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public type?: 'simple' | 'template' | 'eval' | 'math' | 'chrono';
  @ApiProperty()
  public value: unknown;
}

export class CallServiceCommandDTO {
  @ApiProperty()
  @IsObject()
  public attributes?: Record<string, CallServiceCommandAttribute>;
  @ApiProperty()
  @IsString()
  public domain?: string;
  @ApiProperty()
  @IsString()
  public entity_id: string;
  @ApiProperty()
  @IsString()
  public service: string;
  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  public set_attributes?: string[];
}

export class SetRoomMetadataCommandDTO {
  @ApiProperty()
  @IsString()
  public name: string;
  @ApiProperty()
  @IsString()
  public person?: string;
  @ApiProperty()
  @IsString()
  public room: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  public type?: 'person' | 'room';
  @ApiProperty()
  public value: boolean | string | number;
  @ApiProperty()
  public valueType: string;
}

export class RoutineCommandNodeRedDTO {
  @ApiProperty()
  @IsString()
  public name: string;
}

export class RoutineCommandWebhookDTO {
  @ApiProperty()
  @IsString()
  public assignProperty?: string;
  @ApiProperty()
  @IsString()
  public assignTo?: string;
  @ApiProperty()
  @IsString()
  public assignType?: 'person' | 'room';
  @ApiProperty()
  @IsString()
  public code?: string;
  @ApiProperty()
  @ValidateNested({ each: true })
  public headers: WebhookHeaderDTO[];
  @IsEnum(HTTP_METHODS)
  @ApiProperty({ enum: Object.values(HTTP_METHODS) })
  public method: HTTP_METHODS | `${HTTP_METHODS}`;
  @ApiProperty()
  @IsString()
  public objectPath?: string;
  @ApiProperty()
  @IsEnum(['none', 'text', 'json'])
  public parse?: 'none' | 'text' | 'json';
  @ApiProperty()
  @IsString()
  public url: string;
}

export class RoutineCommandDTO<COMMAND = unknown> {
  @ApiProperty()
  @ValidateNested()
  public command: COMMAND;
  @MinLength(MINIMUM_NAME_SIZE)
  @IsString()
  public friendlyName: string;
  @IsString()
  @IsOptional()
  public id?: string;
  @IsString()
  public type: string;
}
