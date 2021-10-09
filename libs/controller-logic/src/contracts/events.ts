import { KunamiSensor } from './rooms';

export const ROOM_UPDATE = 'ROOM_UPDATE';

export class KunamiSensorEvent {
  public progress: string[];
  public rejected: boolean;
  public sensor: KunamiSensor;
}
