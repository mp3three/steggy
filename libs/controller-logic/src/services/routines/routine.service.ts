import {
  AutoLogService,
  IsEmpty,
  ResultControlDTO,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';

import {
  KunamiCodeActivateDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomActionDTO,
  RoutineCommandRoomStateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
} from '../../contracts';
import { GroupService } from '../groups';
import { RoutinePersistenceService } from '../persistence';
import { RoomService } from '../room.service';
import { KunamiCodeActivateService } from './kunami-code-activate.service';
import { ScheduleActivateService } from './schedule-activate.service';
import { StateChangeActivateService } from './state-change-activate.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly groupService: GroupService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly logger: AutoLogService,
    private readonly routinePersistence: RoutinePersistenceService,
    private readonly roomService: RoomService,
    private readonly scheduleActivate: ScheduleActivateService,
    private readonly stateChangeActivate: StateChangeActivateService,
  ) {}

  @Trace()
  public async activateRoutine(routine: RoutineDTO | string): Promise<void> {
    routine = await this.load(routine);
    this.logger.info(`[${routine.friendlyName}] activate`);
    await each(routine.command ?? [], async (command, callback) => {
      this.logger.debug(` - {${command.friendlyName}}`);
      switch (command.type) {
        case ROUTINE_ACTIVATE_COMMAND.group_action:
          await this.groupService.activateCommand(
            command.command as RoutineCommandGroupActionDTO,
          );
          break;
        case ROUTINE_ACTIVATE_COMMAND.group_state:
          await this.groupService.activateState(
            command.command as RoutineCommandGroupStateDTO,
          );
          break;
        case ROUTINE_ACTIVATE_COMMAND.room_action:
          await this.roomService.activateCommand(
            command.command as RoutineCommandRoomActionDTO,
          );
          break;
        case ROUTINE_ACTIVATE_COMMAND.room_state:
          await this.roomService.activateState(
            command.command as RoutineCommandRoomStateDTO,
          );
          break;
      }
      callback();
    });
  }

  @Trace()
  public async create(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.create(routine);
  }

  @Trace()
  public async list(control?: ResultControlDTO): Promise<RoutineDTO[]> {
    return await this.routinePersistence.findMany(control);
  }

  @Trace()
  protected async onApplicationBootstrap(): Promise<void> {
    await this.mount();
  }

  @Trace()
  protected async remount(): Promise<void> {
    this.kunamiCode.reset();
    this.scheduleActivate.reset();
    this.stateChangeActivate.reset();
    await this.mount();
  }

  @Trace()
  private async load(routine: RoutineDTO | string): Promise<RoutineDTO> {
    if (typeof routine === 'object') {
      return routine;
    }
    return await this.routinePersistence.findById(routine);
  }

  @Trace()
  private async mount(): Promise<void> {
    const allRoutines = await this.routinePersistence.findMany();
    this.logger.info(`Mounting {${allRoutines.length}} routines`);
    allRoutines.forEach((routine) => {
      if (IsEmpty(routine.activate)) {
        this.logger.warn(`[${routine.friendlyName}] no activation events`);
        return;
      }
      this.logger.info(`[${routine.friendlyName}] building`);
      routine.activate.forEach((activate) => {
        this.logger.debug(` - ${activate.friendlyName}`);
        switch (activate.type) {
          case ROUTINE_ACTIVATE_TYPE.kunami:
            this.kunamiCode.watch(
              activate.activate as KunamiCodeActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
          case ROUTINE_ACTIVATE_TYPE.state_change:
            this.stateChangeActivate.watch(
              activate.activate as StateChangeActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
          case ROUTINE_ACTIVATE_TYPE.schedule:
            this.scheduleActivate.watch(
              activate.activate as ScheduleActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
        }
      });
    });
  }
}
