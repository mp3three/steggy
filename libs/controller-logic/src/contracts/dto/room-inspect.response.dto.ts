import { HassStateDTO } from '@automagical/home-assistant';

export class RoomInspectResponseDTO {
  /**
   * A listing of all entity ids making up groups.
   *
   * All group entities will be included in states, even if they are not otherwise not
   */
  groups: Record<string, string[]>;
  /**
   * The current state of every entity registered with the room
   */
  states: HassStateDTO[];
}
