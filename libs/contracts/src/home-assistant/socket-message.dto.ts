import {
  HassCommands,
  HassDomains,
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
  public domain?: HassDomains;
  public id?: number;
  public service?: HassServices | string;
  public service_data?: unknown;
  public type: HassCommands;

  // #endregion Object Properties
}
