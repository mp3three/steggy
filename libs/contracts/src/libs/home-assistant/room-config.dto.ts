export class HomeAssistantRoomRokuDTO {
  // #region Object Properties

  /**
   * @example "hdmi3"
   */
  public defaultChannel: string;
  /**
   * A roku API capable address. If unsure, use device IP + port 8060.
   *
   * Personal attempts to bind a domain to address through a reverse proxy have failed.
   * Roku doesn't seem to like that
   *
   * @example "http://10.0.0.5:8060"
   */
  public host: string;

  // #endregion Object Properties
}

/**
 * The specific entities to operate on to achieve room modes
 */
export class RoomLightingModeDTO {
  // #region Object Properties

  /**
   * List of entity ids to turn off
   */
  public off?: string[];
  /**
   * List of entity ids to turn on
   */
  public on?: string[];

  // #endregion Object Properties
}

/**
 * Describes how a room should operate at times of the day
 */
export class HomeAssistantRoomModeDTO {
  // #region Object Properties

  public day?: RoomLightingModeDTO;
  public evening?: RoomLightingModeDTO;

  // #endregion Object Properties
}

export class HomeAssistantRoomDetailsDTO {
  // #region Object Properties

  public accssories: string[];
  public fan: string;
  public lights: string[];
  public pico: string;
  public roku: HomeAssistantRoomRokuDTO;

  // #endregion Object Properties
}

export class HomeAssistantRoomConfigDTO {
  // #region Object Properties

  public config?: HomeAssistantRoomDetailsDTO;
  public favorite?: HomeAssistantRoomModeDTO;
  public friendly_name: string;
  public name: string;

  // #endregion Object Properties
}
