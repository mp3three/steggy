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
import { InternalEventActivateDTO } from './internal-event.dto';
import { RoutineCommandStopProcessingDTO } from './stop-processing.dto';

export type ActivateCommand =
  | 'capture_state'
  | 'entity_state'
  | 'group_action'
  | 'group_state'
  | 'light_flash'
  | 'node_red'
  | 'person_state'
  | 'restore_state'
  | 'room_state'
  | 'send_notification'
  | 'set_metadata'
  | 'sleep'
  | 'stop_processing'
  | 'trigger_routine'
  | 'webhook';

export enum ROUTINE_ACTIVATE_COMMAND {
  capture_state = 'capture_state',
  entity_state = 'entity_state',
  group_action = 'group_action',
  group_state = 'group_state',
  light_flash = 'light_flash',
  node_red = 'node_red',
  person_state = 'person_state',
  restore_state = 'restore_state',
  room_state = 'room_state',
  send_notification = 'send_notification',
  set_metadata = 'set_metadata',
  sleep = 'sleep',
  stop_processing = 'stop_processing',
  trigger_routine = 'trigger_routine',
  webhook = 'webhook',
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

export class RoutineCommandDTO<
  COMMAND =
    | GeneralSaveStateDTO
    | InternalEventActivateDTO
    | RoutineCaptureCommandDTO
    | RoutineCommandGroupActionDTO
    | RoutineCommandGroupStateDTO
    | RoutineCommandLightFlashDTO
    | RoutineCommandPersonStateDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandSendNotificationDTO
    | RoutineCommandSleepDTO
    | RoutineCommandStopProcessingDTO
    | RoutineRestoreCommandDTO
    | SetRoomMetadataCommandDTO
    | RoutineCommandNodeRedDTO
    | RoutineCommandTriggerRoutineDTO
    | RoutineCommandWebhookDTO,
> {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(GeneralSaveStateDTO) },
      { $ref: getSchemaPath(InternalEventActivateDTO) },
      { $ref: getSchemaPath(RoutineCaptureCommandDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupActionDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupStateDTO) },
      { $ref: getSchemaPath(RoutineCommandLightFlashDTO) },
      { $ref: getSchemaPath(RoutineCommandNodeRedDTO) },
      { $ref: getSchemaPath(RoutineCommandPersonStateDTO) },
      { $ref: getSchemaPath(RoutineCommandRoomStateDTO) },
      { $ref: getSchemaPath(RoutineCommandSendNotificationDTO) },
      { $ref: getSchemaPath(RoutineCommandSleepDTO) },
      { $ref: getSchemaPath(RoutineCommandStopProcessingDTO) },
      { $ref: getSchemaPath(RoutineCommandTriggerRoutineDTO) },
      { $ref: getSchemaPath(RoutineCommandWebhookDTO) },
      { $ref: getSchemaPath(RoutineRestoreCommandDTO) },
      { $ref: getSchemaPath(SetRoomMetadataCommandDTO) },
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
