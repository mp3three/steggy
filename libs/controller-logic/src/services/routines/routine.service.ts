import {
  AutoLogService,
  IsEmpty,
  OnEvent,
  ResultControlDTO,
} from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import { each, eachSeries } from 'async';

import {
  KunamiCodeActivateDTO,
  RoomEntitySaveStateDTO,
  RountineCommandLightFlashDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  ROUTINE_UPDATE,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '../../contracts';
import {
  LightFlashCommandService,
  SendNotificationService,
  WebhookService,
} from '../commands';
import { EntityCommandRouterService } from '../entity-command-router.service';
import { GroupService } from '../groups';
import { RoutinePersistenceService } from '../persistence';
import { RoomService } from '../room.service';
import { KunamiCodeActivateService } from './kunami-code-activate.service';
import { ScheduleActivateService } from './schedule-activate.service';
import { SolarActivateService } from './solar-activate.service';
import { StateChangeActivateService } from './state-change-activate.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly entityRouter: EntityCommandRouterService,
    private readonly groupService: GroupService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly logger: AutoLogService,
    private readonly roomService: RoomService,
    private readonly routinePersistence: RoutinePersistenceService,
    private readonly scheduleActivate: ScheduleActivateService,
    private readonly sendNotification: SendNotificationService,
    private readonly stateChangeActivate: StateChangeActivateService,
    private readonly webhookService: WebhookService,
    private readonly solarService: SolarActivateService,
    private readonly flashAnimation: LightFlashCommandService,
  ) {}

  public async activateRoutine(routine: RoutineDTO | string): Promise<void> {
    routine = await this.get(routine);
    this.logger.info(`[${routine.friendlyName}] activate`);
    await (routine.sync ? eachSeries : each)(
      routine.command ?? [],
      async (command, callback) => {
        await this.activateCommand(command);
        if (callback) {
          callback();
        }
      },
    );
  }

  public async create(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.create(routine);
  }

  public async delete(routine: string | RoutineDTO): Promise<boolean> {
    return await this.routinePersistence.delete(routine);
  }

  public async get(routine: RoutineDTO | string): Promise<RoutineDTO> {
    if (typeof routine === 'object') {
      return routine;
    }
    return await this.routinePersistence.findById(routine);
  }

  public async list(control?: ResultControlDTO): Promise<RoutineDTO[]> {
    return await this.routinePersistence.findMany(control);
  }

  public async update(id: string, routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.update(routine, id);
  }

  protected async onApplicationBootstrap(): Promise<void> {
    await this.mount();
  }

  @OnEvent(ROUTINE_UPDATE)
  protected async remount(): Promise<void> {
    this.kunamiCode.reset();
    this.scheduleActivate.reset();
    this.stateChangeActivate.reset();
    await this.mount();
  }

  private async activateCommand(command: RoutineCommandDTO): Promise<void> {
    this.logger.debug(` - {${command.friendlyName}}`);
    switch (command.type) {
      case ROUTINE_ACTIVATE_COMMAND.group_action:
        await this.groupService.activateCommand(
          command.command as RoutineCommandGroupActionDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.webhook:
        await this.webhookService.activate(
          command.command as RoutineCommandWebhookDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        await this.groupService.activateState(
          command.command as RoutineCommandGroupStateDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        await this.roomService.activateState(
          command.command as RoutineCommandRoomStateDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.entity_state:
        await this.entityRouter.fromState(
          command.command as RoomEntitySaveStateDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.send_notification:
        await this.sendNotification.activate(
          command.command as RoutineCommandSendNotificationDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.light_flash:
        await this.flashAnimation.activate(
          command.command as RountineCommandLightFlashDTO,
        );
        break;
    }
  }

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
          case ROUTINE_ACTIVATE_TYPE.solar:
            this.solarService.watch(
              activate.activate as SolarActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
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
