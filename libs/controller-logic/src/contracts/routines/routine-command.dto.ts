import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { HTTP_METHODS } from '@text-based/utilities';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { RoomEntitySaveStateDTO } from '../rooms';
import { GroupDTO, RoomDTO } from '../schemas';

export enum ROUTINE_ACTIVATE_COMMAND {
  entity_state = 'entity_state',
  group_action = 'group_action',
  group_state = 'group_state',
  light_flash = 'light_flash',
  room_state = 'room_state',
  send_notification = 'send_notification',
  stop_processing = 'stop_processing',
  trigger_routine = 'trigger_routine',
  sleep = 'sleep',
  webhook = 'webhook',
  capture = 'capture',
  restore = 'restore',
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

export class RoutineCommandGroupActionDTO {
  @IsString()
  @ApiProperty()
  public command: GENERIC_COMMANDS | string;
  @IsObject()
  @IsOptional()
  @ApiProperty()
  public extra?: Record<string, unknown>;
  @IsString()
  @ApiProperty()
  public group: string | GroupDTO;
}

export class RoutineCommandSendNotificationDTO {
  @ApiProperty()
  @IsString()
  public template: string;
}

export class RoutineCommandSleepDTO {
  @ApiProperty()
  @IsNumber()
  public duration: number;
}

export class RoutineCommandStopProcessing {
  //
}

export class RoutineCommandTriggerRoutineDTO {
  @ApiProperty()
  @IsString()
  public routine: string;
}

enum LightFlashType {
  group = 'group',
  entity = 'entity',
}

export class RountineCommandLightFlashDTO {
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

export class RoutineCommandWebhookDTO {
  @IsEnum(HTTP_METHODS)
  @ApiProperty({ enum: Object.values(HTTP_METHODS) })
  public method: HTTP_METHODS;
  @ApiProperty()
  @IsString()
  public url: string;
}

export class RoutineCommandDTO<
  COMMAND =
    | RoomEntitySaveStateDTO
    | RountineCommandLightFlashDTO
    | RoutineCommandGroupActionDTO
    | RoutineCommandGroupStateDTO
    | RoutineCaptureCommandDTO
    | RoutineRestoreCommandDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandSendNotificationDTO
    | RoutineCommandSleepDTO
    | RoutineCommandStopProcessing
    | RoutineCommandTriggerRoutineDTO
    | RoutineCommandWebhookDTO,
> {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(RoomEntitySaveStateDTO) },
      { $ref: getSchemaPath(RountineCommandLightFlashDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupActionDTO) },
      { $ref: getSchemaPath(RoutineCommandGroupStateDTO) },
      { $ref: getSchemaPath(RoutineCommandRoomStateDTO) },
      { $ref: getSchemaPath(RoutineCaptureCommandDTO) },
      { $ref: getSchemaPath(RoutineRestoreCommandDTO) },
      { $ref: getSchemaPath(RoutineCommandSendNotificationDTO) },
      { $ref: getSchemaPath(RoutineCommandSleepDTO) },
      { $ref: getSchemaPath(RoutineCommandStopProcessing) },
      { $ref: getSchemaPath(RoutineCommandTriggerRoutineDTO) },
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
  public type: ROUTINE_ACTIVATE_COMMAND;
}
