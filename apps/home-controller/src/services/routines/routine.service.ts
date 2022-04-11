import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import {
  KunamiCodeActivateDTO,
  RoomEntitySaveStateDTO,
  RountineCommandLightFlashDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateOptionsDTO,
  RoutineCaptureCommandDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandNodeRedDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SetRoomMetadataCommandDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import {
  each,
  eachSeries,
  is,
  ResultControlDTO,
  sleep,
} from '@steggy/utilities';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import {
  CaptureCommandService,
  LightFlashCommandService,
  NodeRedCommand,
  RoutineTriggerService,
  SendNotificationService,
  SetRoomMetadataService,
  SleepCommandService,
  StopProcessingCommandService,
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

const INSTANCE_ID = uuid();
const RUN_CACHE = (routine: RoutineDTO) => `${INSTANCE_ID}_${routine._id}`;

@Injectable()
export class RoutineService {
  constructor(
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly entityRouter: EntityCommandRouterService,
    private readonly flashAnimation: LightFlashCommandService,
    private readonly groupService: GroupService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly logger: AutoLogService,
    private readonly roomService: RoomService,
    private readonly routinePersistence: RoutinePersistenceService,
    @Inject(forwardRef(() => NodeRedCommand))
    private readonly nodeRedCommand: NodeRedCommand,
    private readonly scheduleActivate: ScheduleActivateService,
    @Inject(forwardRef(() => SetRoomMetadataService))
    private readonly setMetadataService: SetRoomMetadataService,
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
    @Inject(forwardRef(() => StopProcessingCommandService))
    private readonly stopProcessingService: StopProcessingCommandService,
  ) {}

  private readonly runQueue = new Map<string, (() => void)[]>();

  public async activateCommand(
    command: RoutineCommandDTO | string,
    routine: RoutineDTO | string,
    waitForChange = false,
    runId?: string,
  ): Promise<boolean> {
    routine = await this.get(routine);
    command = is.string(command)
      ? routine.command.find(({ id }) => id === command)
      : command;
    this.logger.debug(` - {${command.friendlyName}}`);
    switch (command.type) {
      case ROUTINE_ACTIVATE_COMMAND.group_action:
        await this.groupService.activateCommand(
          command.command as RoutineCommandGroupActionDTO,
          waitForChange,
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
          waitForChange,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        await this.roomService.activateState(
          command.command as RoutineCommandRoomStateDTO,
          waitForChange,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.entity_state:
        await this.entityRouter.fromState(
          command.command as RoomEntitySaveStateDTO,
          waitForChange,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.send_notification:
        await this.sendNotification.activate(
          command.command as RoutineCommandSendNotificationDTO,
          waitForChange,
          runId,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.node_red:
        await this.nodeRedCommand.activate(
          command.command as RoutineCommandNodeRedDTO,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.set_room_metadata:
        await this.setMetadataService.activate(
          command.command as SetRoomMetadataCommandDTO,
          runId,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.light_flash:
        await this.flashAnimation.activate(
          command.command as RountineCommandLightFlashDTO,
          waitForChange,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.trigger_routine:
        await this.triggerService.activate(
          command.command as RoutineCommandTriggerRoutineDTO,
          waitForChange,
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
        const out = await this.stopProcessingService.activate(
          command.command as RoutineCommandStopProcessingDTO,
        );
        return !out;
    }
    return true;
  }

  public async activateRoutine(
    routine: RoutineDTO | string,
    options: RoutineActivateOptionsDTO = {},
    waitForChange?: boolean,
  ): Promise<void> {
    await this.wait(options);
    routine = await this.get(routine);
    const runId = await this.interruptCheck(routine, options);
    this.logger.info({ runId }, `[${routine.friendlyName}] activate`);
    let aborted = false;
    waitForChange ??= routine.sync;
    await (routine.sync ? eachSeries : each)(
      routine.command ?? [],
      async command => {
        const { friendlyName, sync } = routine as RoutineDTO;
        if (aborted) {
          return;
        }
        if (sync && routine.repeat === 'interrupt') {
          const currentId = await this.cacheService.get(RUN_CACHE(routine));
          if (currentId !== runId) {
            aborted = true;
            this.logger.debug(
              { currentId, runId },
              `[${friendlyName}] processing interrupted`,
            );
            return;
          }
        }
        const result = await this.activateCommand(
          command,
          routine as RoutineDTO,
          waitForChange,
          runId,
        );
        aborted = result === false && sync;
        if (aborted) {
          this.logger.debug(
            `[${friendlyName}] processing stopped {${command.friendlyName}}`,
          );
        }
      },
    );
  }

  public async create(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.create(routine);
  }

  public async delete(routine: string | RoutineDTO): Promise<boolean> {
    routine = await this.get(routine);
    const children = await this.routinePersistence.findMany({
      filters: new Set([{ field: 'parent', value: routine._id }]),
    });
    await each(children, async child => await this.delete(child));
    this.logger.info(`[${routine.friendlyName}] Delete routine`);
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

  public mount(routine: RoutineDTO): void {
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
            routine,
            activate.activate as SolarActivateDTO,
            async () => await this.activateRoutine(routine),
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.kunami:
          this.kunamiCode.watch(
            routine,
            activate.activate as KunamiCodeActivateDTO,
            async () => await this.activateRoutine(routine),
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.state_change:
          this.stateChangeActivate.watch(
            routine,
            activate.activate as StateChangeActivateDTO,
            async () => await this.activateRoutine(routine),
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.schedule:
          this.scheduleActivate.watch(
            routine,
            activate.activate as ScheduleActivateDTO,
            async () => await this.activateRoutine(routine),
          );
          return;
      }
    });
  }

  public unmount(routine: RoutineDTO): void {
    if (is.empty(routine.activate)) {
      return;
    }
    this.logger.debug(`[${routine.friendlyName}] unmount`);
    routine.activate.forEach(activate => {
      this.logger.debug(` - ${activate.friendlyName}`);
      switch (activate.type) {
        case ROUTINE_ACTIVATE_TYPE.solar:
          this.solarService.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.kunami:
          this.kunamiCode.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.state_change:
          this.stateChangeActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.schedule:
          this.scheduleActivate.clearRoutine(routine);
          return;
      }
    });
  }

  public async update(id: string, routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.update(routine, id);
  }

  private async interruptCheck(
    routine: RoutineDTO,
    options: RoutineActivateOptionsDTO,
  ): Promise<string> {
    const runId = uuid();
    if (!routine.sync || options.bypassRepeat) {
      return runId;
    }
    const id = RUN_CACHE(routine);
    const currentlyRunning = await this.cacheService.get<string>(id);
    if (routine.repeat === 'block') {
      if (is.empty(currentlyRunning)) {
        await this.cacheService.set(id, runId);
        return runId;
      }
      return undefined;
    }
    if (routine.repeat === 'queue') {
      const list = this.runQueue.get(routine._id) ?? [];
      if (currentlyRunning) {
        return new Promise(done => {
          list.push(async () => {
            await this.cacheService.set(id, runId);
            done(runId);
          });
          this.runQueue.set(routine._id, list);
        });
      }
      await this.cacheService.set(id, runId);
      return runId;
    }
    if (routine.repeat === 'interrupt') {
      await this.cacheService.set(id, runId);
      return runId;
    }
    if (is.empty(routine.repeat) || routine.repeat === 'normal') {
      return runId;
    }
    throw new InternalServerErrorException(
      `Unknown repeat type: ${routine.repeat}`,
    );
  }

  /**
   * Used with activations via http calls
   */
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
      this.logger.debug(`Waiting until {${options.timestamp}}`);
      await sleep(target.diff(dayjs(), 'ms'));
    }
  }
}
