import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { HTTP_METHODS } from '@steggy/utilities';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GeneralSaveStateDTO } from '../rooms';
import { GroupDTO, RoomDTO } from '../schemas';
import { RoutineCommandStopProcessingDTO } from './stop-processing.dto';

export type ActivateCommand =
  | 'entity_state'
  | 'group_action'
  | 'group_state'
  | 'light_flash'
  | 'room_state'
  | 'send_notification'
  | 'stop_processing'
  | 'set_room_metadata'
  | 'trigger_routine'
  | 'sleep'
  | 'node_red'
  | 'webhook'
  | 'capture_state'
  | 'restore_state';

export enum ROUTINE_ACTIVATE_COMMAND {
  entity_state = 'entity_state',
  group_action = 'group_action',
  group_state = 'group_state',
  light_flash = 'light_flash',
  room_state = 'room_state',
  send_notification = 'send_notification',
  stop_processing = 'stop_processing',
  trigger_routine = 'trigger_routine',
  set_room_metadata = 'set_room_metadata',
  node_red = 'node_red',
  sleep = 'sleep',
  webhook = 'webhook',
  capture_state = 'capture_state',
  restore_state = 'restore_state',
}

export type GENERIC_COMMANDS =
  | 'circadianOn'
  | 'dimDown'
  | 'dimUp'
  | 'setBrightness'
  | 'turnOff'
  | 'turnOn';

export class RoutineCommandRoomStateDTO {
  @IsString()
  @ApiProperty({ type: 'string' })
  public room: string | RoomDTO;
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
  public command: GENERIC_COMMANDS | string;
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
  public type?: 'simple' | 'javascript' | 'template';
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
  public ignoreEnabled: boolean;
  @ApiProperty()
  @IsString()
  public routine: string;
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

export class SetRoomMetadataCommandDTO {
  @ApiProperty()
  @IsString()
  public name: string;
  @ApiProperty()
  @IsString()
  public room: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  public type?: string;
  @ApiProperty()
  public value: boolean | string | number;
}

export class RoutineCommandNodeRedDTO {
  @ApiProperty()
  @IsString()
  public name: string;
}

type stringMethods = `${HTTP_METHODS}`;
export class RoutineCommandWebhookDTO {
  @ApiProperty()
  @ValidateNested({ each: true })
  public headers: WebhookHeaderDTO[];
  @IsEnum(HTTP_METHODS)
  @ApiProperty({ enum: Object.values(HTTP_METHODS) })
  public method: HTTP_METHODS | stringMethods;
  @ApiProperty()
  @IsString()
  public url: string;
}

export class RoutineCommandDTO<
  COMMAND =
    | GeneralSaveStateDTO
    | RoutineCommandLightFlashDTO
    | RoutineCommandGroupActionDTO
    | RoutineCommandGroupStateDTO
    | SetRoomMetadataCommandDTO
    | RoutineCaptureCommandDTO
    | RoutineRestoreCommandDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandSendNotificationDTO
    | RoutineCommandSleepDTO
    | RoutineCommandStopProcessingDTO
    | RoutineCommandNodeRedDTO
    | RoutineCommandTriggerRoutineDTO
    | RoutineCommandWebhookDTO,
> {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(GeneralSaveStateDTO) },
      { $ref: getSchemaPath(RoutineCommandLightFlashDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupActionDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupStateDTO) },
      { $ref: getSchemaPath(RoutineCommandRoomStateDTO) },
      { $ref: getSchemaPath(RoutineCaptureCommandDTO) },
      { $ref: getSchemaPath(RoutineRestoreCommandDTO) },
      { $ref: getSchemaPath(RoutineCommandSendNotificationDTO) },
      { $ref: getSchemaPath(RoutineCommandSleepDTO) },
      { $ref: getSchemaPath(SetRoomMetadataCommandDTO) },
      { $ref: getSchemaPath(RoutineCommandStopProcessingDTO) },
      { $ref: getSchemaPath(RoutineCommandTriggerRoutineDTO) },
      { $ref: getSchemaPath(RoutineCommandNodeRedDTO) },
      { $ref: getSchemaPath(RoutineCommandWebhookDTO) },
    ],
  })
  public command: COMMAND;
  @IsString()
  public friendlyName: string;
  @IsString()
  @IsOptional()
  public id?: string;
  @IsEnum(ROUTINE_ACTIVATE_COMMAND)
  public type: ActivateCommand;
}
