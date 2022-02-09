import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AutoLogService, OnEvent } from '@text-based/boilerplate';
import {
  KunamiCodeActivateDTO,
  RoomEntitySaveStateDTO,
  RountineCommandLightFlashDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  ROUTINE_UPDATE,
  RoutineActivateOptionsDTO,
  RoutineCaptureCommandDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@text-based/controller-shared';
import {
  each,
  eachSeries,
  is,
  ResultControlDTO,
  sleep,
} from '@text-based/utilities';
import dayjs from 'dayjs';

import {
  CaptureCommandService,
  LightFlashCommandService,
  RoutineTriggerService,
  SendNotificationService,
  SleepCommandService,
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
    private readonly flashAnimation: LightFlashCommandService,
    private readonly groupService: GroupService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly logger: AutoLogService,
    private readonly roomService: RoomService,
    private readonly routinePersistence: RoutinePersistenceService,
    private readonly scheduleActivate: ScheduleActivateService,
    private readonly solarService: SolarActivateService,
    @Inject(forwardRef(() => RoutineTriggerService))
    private readonly triggerService: RoutineTriggerService,
    private readonly captureCommand: CaptureCommandService,
    private readonly stateChangeActivate: StateChangeActivateService,
    @Inject(forwardRef(() => SendNotificationService))
    private readonly sendNotification: SendNotificationService,
    @Inject(forwardRef(() => SleepCommandService))
    private readonly sleepService: SleepCommandService,
    @Inject(forwardRef(() => WebhookService))
    private readonly webhookService: WebhookService,
  ) {}

  public async activateCommand(
    command: RoutineCommandDTO | string,
    routine: RoutineDTO | string,
  ): Promise<boolean> {
    routine = await this.get(routine);
    command = is.string(command)
      ? routine.command.find(({ id }) => id === command)
      : command;
    // TODO: Some sort of automatic registration mechanism?
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
      case ROUTINE_ACTIVATE_COMMAND.trigger_routine:
        await this.triggerService.activate(
          command.command as RoutineCommandTriggerRoutineDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.sleep:
        await this.sleepService.activate(
          command.command as RoutineCommandSleepDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.capture_state:
        await this.captureCommand.activate(
          command as RoutineCaptureCommandDTO,
          routine,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.stop_processing:

      //
    }
    return true;
  }

  public async activateRoutine(
    routine: RoutineDTO | string,
    options: RoutineActivateOptionsDTO = {},
  ): Promise<void> {
    await this.wait(options);
    routine = await this.get(routine);
    this.logger.info(`[${routine.friendlyName}] activate`);
    let aborted = false;
    await (routine.sync ? eachSeries : each)(
      routine.command ?? [],
      async command => {
        // Typescript being dumb
        const { friendlyName, sync } = routine as RoutineDTO;
        if (aborted) {
          this.logger.debug(
            `[${friendlyName}] processing stopped {${command.friendlyName}}`,
          );
          return;
        }
        const result = await this.activateCommand(
          command,
          routine as RoutineDTO,
        );
        aborted = result === false && sync;
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
    if (is.object(routine)) {
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

  private async mount(): Promise<void> {
    const allRoutines = await this.routinePersistence.findMany();
    this.logger.info(`Mounting {${allRoutines.length}} routines`);
    allRoutines.forEach(routine => {
      if (is.empty(routine.activate)) {
        this.logger.warn(`[${routine.friendlyName}] no activation events`);
        return;
      }
      this.logger.debug(`[${routine.friendlyName}] building`);
      routine.activate.forEach(activate => {
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

  private async wait(options: RoutineActivateOptionsDTO = {}): Promise<void> {
    if (options.timeout && options.timestamp) {
      // Just send 2 requests
      throw new ConflictException(
        `Cannot provide timeout and timestamp at the same time`,
      );
    }
    if (options.timeout) {
      await sleep(options.timeout);
    }
    if (options.timestamp) {
      const target = dayjs(options.timestamp);
      if (!target.isValid()) {
        throw new BadRequestException(`Invalid timestamp`);
      }
      if (target.isBefore(dayjs())) {
        throw new BadRequestException(`Timestamp is in the past`);
      }
      this.logger.debug(``);
      await sleep(target.diff(dayjs(), 'ms'));
    }
  }
}
