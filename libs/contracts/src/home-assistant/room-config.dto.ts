import { CircadianModes } from './enums';

export class HomeAssistantRoomCircadianDTO {
  // #region Object Properties

  /**
   * Bright / fully on
   */
  public high: string;
  /**
   * Dim / near minimum
   */
  public low: string;
  /**
   * Enough to make the room feel cozy. Typically 40-60% intensity
   *
   * Currently, the intensity is controlled on the Home Assistant side
   */
  public medium: string;

  // #endregion Object Properties
}

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
 * The specific entities to operate on to achieve various room modes
 */
export class RoomLightingModeDTO {
  // #region Object Properties

  /**
   * List of accessory entities to the scene.
   * Intended for use by nearby lights that don't have a 100% defined ownership by a room.
   *
   * For example: hallway lights.
   *
   * These may or may not get toggled depending on the needs of a given call.
   * Turning on/off a room normally won't activate, but setting a whole house scene should.
   */
  public acc?: string[];
  /**
   * Mode for the circadian lighting controller
   */
  public circadian?: CircadianModes;
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
 * Describes how a room should operate at various times of the day
 */
export class HomeAssistantRoomModeDTO {
  // #region Object Properties

  public all?: RoomLightingModeDTO;
  public day?: RoomLightingModeDTO;
  public evening?: RoomLightingModeDTO;

  // #endregion Object Properties
}

export class HomeAssistantRoomDetailsDTO {
  // #region Object Properties

  public circadian: HomeAssistantRoomCircadianDTO;
  public fan: string;
  public pico: string;
  public roku: HomeAssistantRoomRokuDTO;
  public temperature: string;

  // #endregion Object Properties
}

export class HomeAssistantRoomConfigDTO {
  // #region Object Properties

  public config: HomeAssistantRoomDetailsDTO;
  public friendly_name: string;
  /**
   * Virtual groups. Provide name (ex: loft_circadian), and a listing of other entities.
   * Allows local group entity to relay appropriate commands.
   *
   * Example usage: Group together light + fan into a single "the fan" group, which handles turn on/off for both functions together
   */
  public groups: Record<string, string[]>;
  public high: HomeAssistantRoomModeDTO;
  public low: HomeAssistantRoomModeDTO;
  public medium: HomeAssistantRoomModeDTO;
  public name: string;
  public off: HomeAssistantRoomModeDTO;

  // #endregion Object Properties
}
