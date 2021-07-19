import {
  HASS_DOMAINS,
  HASSIO_WS_COMMAND,
  HassServices,
  HassSocketMessageTypes,
} from './enums/socket';
import { HassEventDTO } from './hass-event.dto';

export class AreaDTO {
  // #region Object Properties

  public area_id: string;
  public name: string;

  // #endregion Object Properties
}

export class EntityListItemDTO {
  // #region Object Properties

  public area_id: string;
  public config_entry_id: string;
  public device_id: string;
  public disabled_by: string;
  public entity_id: string;
  public icon: string;
  public name: string;
  public platform: string;

  // #endregion Object Properties
}

export class DeviceListItemDTO {
  // #region Object Properties

  public area_id: string;
  public config_entries: string[];
  public connections: string[][];
  public disabled_by: null;
  public entry_type: null;
  public id: string;
  public identifiers: string[];
  public manufacturer: string;
  public model: string;
  public name: string;
  public name_by_user: null;
  public sw_version: string;
  public via_device_id: null;

  // #endregion Object Properties
}

export class SocketMessageDTO {
  // #region Object Properties

  public event?: HassEventDTO;
  public id: string;
  public result?: Record<string, unknown>;
  public type: HassSocketMessageTypes;

  // #endregion Object Properties
}

export class SendSocketMessageDTO {
  // #region Object Properties

  public access_token?: string;
  public domain?: HASS_DOMAINS;
  public id?: number;
  public service?: HassServices | string;
  public service_data?: unknown;
  public type: HASSIO_WS_COMMAND;

  // #endregion Object Properties
}
