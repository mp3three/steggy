import { CronJob } from 'cron';

import {
  ScheduleActivateDTO,
  SequenceActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from './routines';
import { RoutineDTO } from './schemas';

export const GROUP_UPDATE = 'GROUP_UPDATE';
export const ROOM_UPDATE = 'ROOM_UPDATE';
export const ROUTINE_UPDATE = 'ROUTINE_UPDATE';
export const LOCATION_UPDATED = 'LOCATION_UPDATED';

export type SequenceWatcher = SequenceActivateDTO & {
  callback: () => Promise<void>;
  routine: RoutineDTO;
};

export class SequenceSensorEvent {
  public completed?: boolean;
  public progress: string[];
  public rejected: boolean;
  public watcher: SequenceWatcher;
}

export type StateChangeWatcher = StateChangeActivateDTO & {
  callback: () => Promise<void>;
  routine: RoutineDTO;
};

export type ScheduleWatcher = ScheduleActivateDTO & {
  cron: CronJob;
  routine: RoutineDTO;
};

export type SolarWatcher = SolarActivateDTO & {
  callback: () => Promise<void>;
  cron?: CronJob;
  routine?: RoutineDTO;
};
