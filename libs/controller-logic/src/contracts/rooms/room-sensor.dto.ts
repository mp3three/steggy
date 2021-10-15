import { ROOM_ENTITY_TYPES } from '../schemas';

export enum ROOM_SENSOR_TYPE {
  kunami = 'kunami',
}

export class RoomSensorDTO {
  public id: string;
  public name: string;
  public type: ROOM_SENSOR_TYPE;
}

/**
 * Sensor commands are intended to operate under 2 basic modes -
 *
 * 1) Activate a pre-saved room save state
 *
 * Most of the time, loading a pre-saved state is the easiest way to define the desired result for the sensor.
 * The exact list of entities to change, and how to change them are already pre-saved and associated with the room
 *
 * 2) Generic commands
 *
 * turnOff / turnOn
 */
export class KunamiSensorCommand {
  /**
   * Run a preset command. Definition intentially left loose
   */
  public command?:
    | 'turnOff'
    | 'turnOn'
    | 'setState'
    | 'dimUp'
    | 'dimDown'
    | 'circadianOn'
    | string;

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

  public sensor: string;
}

export class KunamiSensor extends RoomSensorDTO {
  public command: KunamiSensorCommand;
  public id: string;
  public type: ROOM_SENSOR_TYPE.kunami;
}
