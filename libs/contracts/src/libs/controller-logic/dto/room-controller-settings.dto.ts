export class RoomControllerSettingsDTO {
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
  public omitRoomEvents?: boolean;
  public remote?: string;
  /**
   *  Primary lights for the room
   */
  public switches?: string[];
}
export const ROOM_CONTROLLER_SETTINGS = Symbol('ROOM_CONTROLLER_SETTINGS');
