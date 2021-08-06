export class RoomControllerSettingsDTO {
  // #region Object Properties

  /**
   *  Secondary lights for room
   */
  public accessories?: string[];
  public friendlyName: string;
  /**
   * Entities that can be controlled with the circadian lighting controller
   */
  public lights?: string[];
  public name: string;
  public remote?: string;
  /**
   *  Primary lights for the room
   */
  public switches?: string[];

  // #endregion Object Properties
}
export const ROOM_CONTROLLER_SETTINGS = Symbol('ROOM_CONTROLLER_SETTINGS');
