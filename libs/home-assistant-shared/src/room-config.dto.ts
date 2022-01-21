export class HomeAssistantRoomRokuDTO {
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
}

/**
 * The specific entities to operate on to achieve room modes
 */
export class RoomLightingModeDTO {
  /**
   * List of entity ids to turn off
   */
  public off?: string[];
  /**
   * List of entity ids to turn on
   */
  public on?: string[];
}

/**
 * Describes how a room should operate at times of the day
 */
export class HomeAssistantRoomModeDTO {
  public day?: RoomLightingModeDTO;
  public evening?: RoomLightingModeDTO;
}

export class HomeAssistantRoomDetailsDTO {
  public accssories: string[];
  public fan: string;
  public lights: string[];
  public pico: string;
  public roku: HomeAssistantRoomRokuDTO;
}

export class HomeAssistantRoomConfigDTO {
  public config?: HomeAssistantRoomDetailsDTO;
  public favorite?: HomeAssistantRoomModeDTO;
  public friendly_name: string;
  public name: string;
}
