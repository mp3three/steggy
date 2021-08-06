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
  public remote?: string;
  public name: string;
  /**
   *  Primary lights for the room
   */
  public switches?: string[];

  // #endregion Object Properties
}
export const CONTROLLER_SETTINGS = Symbol('CONTROLLER_SETTINGS');
