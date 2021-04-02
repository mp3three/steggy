import { HassSocketMessageTypes } from './enums/socket';

export class SocketMessageDTO {
  // #region Object Properties

  public event?: string;
  public id: string;
  public result?: Record<string, unknown>;
  public type: HassSocketMessageTypes;

  // #endregion Object Properties
}
