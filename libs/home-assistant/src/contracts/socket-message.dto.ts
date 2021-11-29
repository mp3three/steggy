import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import {
  HASS_DOMAINS,
  HASSIO_WS_COMMAND,
  HassSocketMessageTypes,
} from './enums/socket';
import { HassEventDTO } from './hass-event.dto';

export class AreaDTO {
  public area_id: string;
  public name: string;
}

export class EntityListItemDTO {
  public area_id: string;
  public config_entry_id: string;
  public device_id: string;
  public disabled_by: string;
  public entity_id: string;
  public icon: string;
  public name: string;
  public platform: string;
}

export class DeviceListItemDTO {
  @ApiProperty()
  @IsString()
  public area_id: string;
  @ApiProperty()
  @IsString({ each: true })
  public config_entries: string[];
  @ApiProperty()
  public connections: string[][];
  @IsString()
  public disabled_by: null;
  @IsString()
  public entry_type: null;
  @ApiProperty()
  @IsString()
  public id: string;
  @ApiProperty()
  @IsString({ each: true })
  public identifiers: string[];
  @ApiProperty()
  @IsString()
  public manufacturer: string;
  @ApiProperty()
  @IsString()
  public model: string;
  @ApiProperty()
  @IsString()
  public name: string;
  @IsString()
  public name_by_user: null;
  @ApiProperty()
  @IsString()
  public sw_version: string;
  @IsString()
  public via_device_id: null;
}

export class HassNotificationDTO {
  public created_at: string;
  public message: string;
  public notification_id: string;
  public status: 'unread';
  public title: string;
}

// {
// 	"0": {
// 		"notification_id": "config_entry_reconfigure",
// 		"message": "At least one of your integrations requires reconfiguration to continue functioning. [Check it out](/config/integrations).",
// 		"status": "unread",
// 		"title": "Integration requires reconfiguration",
// 		"created_at": "2021-11-28T16:33:15.366370+00:00"
// 	}
// }

export class SocketMessageDTO {
  public error?: Record<string, unknown>;
  public event?: HassEventDTO;
  public id: string;
  public message?: string;
  public result?: Record<string, unknown>;
  public type: HassSocketMessageTypes;
}

export class SendSocketMessageDTO {
  public access_token?: string;
  public domain?: HASS_DOMAINS;
  public id?: number;
  public service?: string;
  public service_data?: unknown;
  public type: HASSIO_WS_COMMAND;
}

export class UpdateEntityMessageDTO {
  public area_id?: number;
  public entity_id: string;
  public icon?: string;
  public id?: number;
  public name: string;
  public new_entity_id: string;
  public type: HASSIO_WS_COMMAND.entity_update;
}

export class FindRelatedDTO {
  public id?: number;
  public item_id: string;
  public item_type: string;
  public type: HASSIO_WS_COMMAND.search_related;
}

export class RegistryGetDTO {
  public entity_id: string;
  public id?: number;
  public type: HASSIO_WS_COMMAND.registry_get;
}

export class RenderTemplateDTO {
  public id?: number;
  public template: string;
  public timeout: number;
  public type: HASSIO_WS_COMMAND.render_template;
}

export type SOCKET_MESSAGES =
  | SendSocketMessageDTO
  | RenderTemplateDTO
  | UpdateEntityMessageDTO
  | FindRelatedDTO
  | RegistryGetDTO;
