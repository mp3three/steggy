export enum ROOM_SENSOR_TYPE {
  kunami = 'kunami',
}

export class RoomSensorDTO {
  public entity_id: string;
  public id: string;
  public type: ROOM_SENSOR_TYPE;
}

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
   * Where to emit the event at (id)
   */
  public target?: string;
  /**
   * What type of item it is
   */
  public targetType?: 'group' | 'room';
}

export class KunamiSensor extends RoomSensorDTO {
  public command: KunamiSensorCommand;
  public type: ROOM_SENSOR_TYPE.kunami;
}
