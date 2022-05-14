import {
  AttributeChangeActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SequenceActivateDTO,
  SolarActivateDTO,
} from '@steggy/controller-shared';
import { CronJob } from 'cron';

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

export type StateChangeWatcher = Partial<AttributeChangeActivateDTO> & {
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
