import { CronJob } from 'cron';

import {
  KunamiCodeActivateDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from './routines';

export const GROUP_UPDATE = 'GROUP_UPDATE';
export const ROOM_UPDATE = 'ROOM_UPDATE';
export const ROUTINE_UPDATE = 'ROUTINE_UPDATE';
export const LOCATION_UPDATED = 'LOCATION_UPDATED';

export type KunamiWatcher = KunamiCodeActivateDTO & {
  callback: () => Promise<void>;
};
export class KunamiSensorEvent {
  public completed?: boolean;
  public progress: string[];
  public rejected: boolean;
  public watcher: KunamiWatcher;
}
export type StateChangeWatcher = StateChangeActivateDTO & {
  callback: () => Promise<void>;
};
export type ScheduleWatcher = ScheduleActivateDTO & {
  cron: CronJob;
};
export type SolarWatcher = SolarActivateDTO & {
  callback: () => Promise<void>;
  cron?: CronJob;
};