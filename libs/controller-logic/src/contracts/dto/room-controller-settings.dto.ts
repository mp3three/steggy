export enum RoomControllerFlags {
  /**
   * This controller is not the primary controller for the room
   *
   * Don't automatically create http routes / insert methods
   */
  SECONDARY,
  /**
   * Is this controller allowed to emit to other rooms?
   */
  RELAY_EMIT,
  /**
   * Can this controller receive from other rooms?
   */
  RELAY_RECEIVE,
}

export class RoomControllerSettingsDTO {
  /**
   *  Secondary lights for room
   */
  public accessories?: string[];
  /**
   * Longer form name to display to humans
   */
  public friendlyName: string;
  /**
   * Entities that can be controlled with the circadian lighting controller
   */
  public lights?: string[];
  /**
   * Short identifier for the room
   */
  public name: string;
  /**
   * Speed adjustable fan for the room
   */
  public fan?: string;
  /**
   * 5 button remote to control the room
   */
  public remote?: string;
  /**
   *  Primary lights for the room
   */
  public switches?: string[];
  /**
   * Feature flags for the room
   */
  public flags?: Set<RoomControllerFlags>;
}
export const ROOM_CONTROLLER_SETTINGS = Symbol('ROOM_CONTROLLER_SETTINGS');
