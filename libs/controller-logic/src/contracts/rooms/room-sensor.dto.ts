import { ROOM_ENTITY_TYPES } from '../schemas';

export enum ROOM_SENSOR_TYPE {
  kunami = 'kunami',
}

export class RoomSensorDTO {
  public entity_id: string;
  public id: string;
  public type: ROOM_SENSOR_TYPE;
}

/**
 * See dedicated sensor command markdown file for notes
 */
export class KunamiSensorCommand {
  /**
   * Run a preset command. Definition intentially left loose
   */
  public command?: 'turnOff' | 'turnOn' | 'setState' | string;
  /**
   * The at-rest / nothing happening state for the sensor
   */
  public defaultState?: string;
  /**
   * When emitting events, should the default / nothing happening state be included in the chain?
   */
  public includeDefaultState?: boolean;
  /**
   * States from controller to match
   */
  public match: string[];
  /**
   * If setting a state, use this save state id
   */
  public saveStateId?: string;
  /**
   * For generic room commands (turn on / turn off)
   */
  public scope?: ROOM_ENTITY_TYPES[];
  /**
   * Where to emit the event at (id)
   */
  public target?: string;
}

export class KunamiSensor extends RoomSensorDTO {
  public command: KunamiSensorCommand;
  public id: string;
  public type: ROOM_SENSOR_TYPE.kunami;
}
