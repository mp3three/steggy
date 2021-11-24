import { HTTP_METHODS } from '@ccontour/utilities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { RoomEntitySaveStateDTO } from '../rooms';
import { GroupDTO, RoomDTO } from '../schemas';

export enum ROUTINE_ACTIVATE_COMMAND {
  room_state = 'room_state',
  group_state = 'group_state',
  group_action = 'group_action',
  entity_state = 'entity_state',
  send_notification = 'send_notification',
  webhook = 'webhook',
}

export type GENERIC_COMMANDS =
  | 'turnOn'
  | 'turnOff'
  | 'dimUp'
  | 'dimDown'
  | 'setBrightness'
  | 'circadianOn';

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
  public command: GENERIC_COMMANDS;
  @IsObject()
  @IsOptional()
  @ApiProperty()
  public extra?: Record<string, unknown>;
  @IsString()
  @ApiProperty()
  public group: string | GroupDTO;
}

export class RoutineCommandSendNotificationDTO {
  @IsString()
  public template: string;
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
    | RoutineCommandGroupActionDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandSendNotificationDTO
    | RoomEntitySaveStateDTO
    | RoutineCommandWebhookDTO
    | RoutineCommandGroupStateDTO,
> {
  @ApiProperty({
    oneOf: [
      { $ref: `#/components/schemas/${RoutineCommandGroupActionDTO.name}` },
      { $ref: `#/components/schemas/${RoutineCommandRoomStateDTO.name}` },
      {
        $ref: `#/components/schemas/${RoutineCommandSendNotificationDTO.name}`,
      },
      { $ref: `#/components/schemas/${RoomEntitySaveStateDTO.name}` },
      { $ref: `#/components/schemas/${RoutineCommandWebhookDTO.name}` },
      { $ref: `#/components/schemas/${RoutineCommandGroupStateDTO.name}` },
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
