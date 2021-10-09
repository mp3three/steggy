import { KunamiSensor } from './rooms';

export const ROOM_UPDATE = 'ROOM_UPDATE';

export class KunamiSensorEvent {
  public completed?: boolean;
  public progress: string[];
  public rejected: boolean;
  public sensor: KunamiSensor;
}
