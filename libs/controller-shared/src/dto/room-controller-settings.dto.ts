import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

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
  @IsString({ each: true })
  public accessories?: string[];
  /**
   * Speed adjustable fan for the room
   */
  @IsString()
  @Expose()
  public fan?: string;
  /**
   * Feature flags for the room
   */
  @Expose()
  public flags?: RoomControllerFlags[];
  /**
   * Longer form name to display to humans
   */
  @IsString()
  @Expose()
  public friendlyName: string;
  /**
   * name : entity_id[]
   */
  @Expose()
  public groups?: Record<string, string[]>;
  /**
   * Entities that can be controlled with the circadian lighting controller
   */
  @IsString({ each: true })
  @Expose()
  public lights?: string[];
  /**
   * Items such as televisions to automatically turn off
   */
  @Expose()
  public media?: string;
  /**
   * Short identifier for the room
   */
  @IsString()
  @Expose()
  public name: string;
  /**
   * 5 button remote to control the room
   */
  @IsString()
  @Expose()
  public remote?: string;
  /**
   *  Primary lights for the room
   */
  @IsString({ each: true })
  @Expose()
  public switches?: string[];
}

export const ROOM_CONTROLLER_SETTINGS = Symbol('ROOM_CONTROLLER_SETTINGS');
