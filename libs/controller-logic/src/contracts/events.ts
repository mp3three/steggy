import { KunamiSensor } from './rooms';

export const GROUP_UPDATE = 'GROUP_UPDATE';
export const ROOM_UPDATE = 'ROOM_UPDATE';
export const ROUTINE_UPDATE = 'ROUTINE_UPDATE';

export class KunamiSensorEvent {
  public completed?: boolean;
  public progress: string[];
  public rejected: boolean;
  public sensor: KunamiSensor;
}
