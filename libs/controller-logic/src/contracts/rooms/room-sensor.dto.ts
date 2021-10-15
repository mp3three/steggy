import { ROOM_ENTITY_TYPES } from '../schemas';

export enum ROOM_SENSOR_TYPE {
  kunami = 'kunami',
}

export class RoomSensorDTO {
  public id: string;
  public name: string;
  public type: ROOM_SENSOR_TYPE;
}

export class KunamiSensorCommand {
  /**
   * States from controller to match
   */
  public match: string[];
  /**
   * If setting a state, use this save state id
   */
  public saveStateId?: string;

  public sensor: string;
}

export class KunamiSensorGroupCommand extends KunamiSensorCommand {
  public command: string;
}

export class KunamiSensor extends RoomSensorDTO {
  public command: KunamiSensorCommand;
  public id: string;
  public type: ROOM_SENSOR_TYPE.kunami;
}
