import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import {
  ActivateCommand,
  AttributeChangeActivateDTO,
  CloneRoutineDTO,
  DeviceTriggerActivateDTO,
  GeneralSaveStateDTO,
  InternalEventActivateDTO,
  MetadataChangeDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineActivateOptionsDTO,
  RoutineCaptureCommandDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandLightFlashDTO,
  RoutineCommandNodeRedDTO,
  RoutineCommandPersonStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  RoutineTriggerEvent,
  ScheduleActivateDTO,
  SequenceActivateDTO,
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
import EventEmitter from 'eventemitter3';
import { v4 as uuid, v4 } from 'uuid';

import { ROUTINE_ACTIVATE } from '../typings';
import {
  AttributeChangeActivateService,
  DeviceTriggerActivateService,
  InternalEventChangeService,
  MetadataChangeService,
  RoutineEnabledService,
  ScheduleActivateService,
  SequenceActivateService,
  SolarActivateService,
  StateChangeActivateService,
} from './activate';
import {
  CaptureCommandService,
  LightFlashCommandService,
  NodeRedCommand,
  RoutineTriggerService,
  SendNotificationService,
  SetMetadataService,
  SleepCommandService,
  StopProcessingCommandService,
  WebhookService,
} from './commands';
import { EntityCommandRouterService } from './entities';
import { GroupService } from './group.service';
import { RoutinePersistenceService } from './persistence';
import { PersonService } from './person.service';
import { RoomService } from './room.service';

const INSTANCE_ID = uuid();
const RUN_CACHE = (routine: RoutineDTO) => `${INSTANCE_ID}_${routine._id}`;

// So many @Injects. Remove any, and 💣

@Injectable()
export class RoutineService {
  constructor(
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly entityRouter: EntityCommandRouterService,
    @Inject(forwardRef(() => LightFlashCommandService))
    private readonly flashAnimation: LightFlashCommandService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => SequenceActivateService))
    private readonly sequenceActivate: SequenceActivateService,
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly routinePersistence: RoutinePersistenceService,
    @Inject(forwardRef(() => NodeRedCommand))
    private readonly nodeRedCommand: NodeRedCommand,
    @Inject(forwardRef(() => ScheduleActivateService))
    private readonly scheduleActivate: ScheduleActivateService,
    @Inject(forwardRef(() => SetMetadataService))
    private readonly setMetadataService: SetMetadataService,
    @Inject(forwardRef(() => SolarActivateService))
    private readonly solarService: SolarActivateService,
    @Inject(forwardRef(() => RoutineTriggerService))
    private readonly triggerService: RoutineTriggerService,
    @Inject(forwardRef(() => CaptureCommandService))
    private readonly captureCommand: CaptureCommandService,
    @Inject(forwardRef(() => StateChangeActivateService))
    private readonly stateChangeActivate: StateChangeActivateService,
    @Inject(forwardRef(() => SendNotificationService))
    private readonly sendNotification: SendNotificationService,
    @Inject(forwardRef(() => SleepCommandService))
    private readonly sleepService: SleepCommandService,
    @Inject(forwardRef(() => WebhookService))
    private readonly webhookService: WebhookService,
    @Inject(forwardRef(() => StopProcessingCommandService))
    private readonly stopProcessingService: StopProcessingCommandService,
    @Inject(forwardRef(() => MetadataChangeService))
    private readonly metadataChangeService: MetadataChangeService,
    @Inject(forwardRef(() => AttributeChangeActivateService))
    private readonly attributeChangeService: AttributeChangeActivateService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    @Inject(forwardRef(() => InternalEventChangeService))
    private readonly internalEventActivate: InternalEventChangeService,
    @Inject(forwardRef(() => RoutineEnabledService))
    private readonly routineEnabled: RoutineEnabledService,
    private readonly deviceTriggerActivate: DeviceTriggerActivateService,
    private readonly eventEmitter: EventEmitter,
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
      case ROUTINE_ACTIVATE_COMMAND.person_state:
        await this.personService.activateState(
          command.command as RoutineCommandPersonStateDTO,
          waitForChange,
        );
        break;
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
          command.command as GeneralSaveStateDTO,
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
      case ROUTINE_ACTIVATE_COMMAND.set_metadata:
        await this.setMetadataService.activate(
          command.command as SetRoomMetadataCommandDTO,
          runId,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.light_flash:
        await this.flashAnimation.activate(
          command.command as RoutineCommandLightFlashDTO,
          waitForChange,
        );
        break;
      case ROUTINE_ACTIVATE_COMMAND.trigger_routine:
        await this.triggerService.activate(
          command.command as RoutineCommandTriggerRoutineDTO,
          routine,
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
    if (!runId) {
      return;
    }
    this.logger.info({ runId }, `[${routine.friendlyName}] activate`);
    this.eventEmitter.emit(ROUTINE_ACTIVATE, {
      routine: routine._id,
      runId,
      source: options.source,
      time: Date.now(),
    } as RoutineTriggerEvent);
    let aborted = false;
    waitForChange ??=
      routine.sync ||
      routine.command.some(({ type }) =>
        (['stop_processing', 'sleep'] as ActivateCommand[]).includes(type),
      );
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

  public async clone(
    target: string,
    {
      name,
      replaceParent,
      omitActivate,
      omitCommand,
      noRecurse,
    }: CloneRoutineDTO,
  ): Promise<RoutineDTO> {
    const source = await this.get(target);
    if (!source) {
      throw new NotFoundException();
    }
    this.logger.info(`Clone [${source.friendlyName}]`);
    const cloned = await this.create({
      activate: omitActivate
        ? []
        : source.activate.map(activate => ({ ...activate, id: v4() })),
      command: omitCommand
        ? []
        : source.command.map(command => ({ ...command, id: v4() })),
      enable: source.enable,
      friendlyName: name ?? `Copy of ${source.friendlyName}`,
      parent: replaceParent ?? source.parent,
      repeat: source.repeat,
      sync: source.sync,
    });
    if (!noRecurse) {
      const children = await this.list({
        filters: new Set([
          {
            field: 'parent',
            value: target,
          },
        ]),
      });
      if (!is.empty(children)) {
        this.logger.info(
          `[${source.friendlyName}] cloning {${children.length}} child routines`,
        );
      }
      await eachSeries(children, async routine => {
        await this.clone(routine._id, {
          omitActivate,
          omitCommand,
          replaceParent: cloned._id,
        });
      });
    }
    return cloned;
  }

  public async create(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.routinePersistence.create(routine);
  }

  public async delete(routine: string | RoutineDTO): Promise<boolean> {
    routine = await this.get(routine);
    const children = await this.routinePersistence.findMany({
      filters: new Set([{ field: 'parent', value: routine._id }]),
    });
    if (!is.empty(children)) {
      this.logger.info(
        `[${routine.friendlyName}] removing {${children.length}} child routines`,
      );
    }
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
      if (!activate.activate) {
        this.logger.error(` - {${activate.friendlyName}} INVALID`);
        return;
      }
      this.logger.debug(` - {${activate.friendlyName}}`);
      const callback = async () =>
        await this.activateRoutine(routine, { source: activate.id });
      switch (activate.type) {
        case ROUTINE_ACTIVATE_TYPE.internal_event:
          this.internalEventActivate.watch(
            routine,
            activate.activate as InternalEventActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.device_trigger:
          this.deviceTriggerActivate.watch(
            routine,
            activate.activate as DeviceTriggerActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.attribute:
          this.attributeChangeService.watch(
            routine,
            activate.activate as AttributeChangeActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.solar:
          this.solarService.watch(
            routine,
            activate.activate as SolarActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.kunami:
          this.sequenceActivate.watch(
            routine,
            activate.activate as SequenceActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.state_change:
          this.stateChangeActivate.watch(
            routine,
            activate.activate as StateChangeActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.schedule:
          this.scheduleActivate.watch(
            routine,
            activate.activate as ScheduleActivateDTO,
            callback,
          );
          return;
        case ROUTINE_ACTIVATE_TYPE.metadata:
          this.metadataChangeService.watch(
            routine,
            activate as RoutineActivateDTO<MetadataChangeDTO>,
            callback,
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
        case ROUTINE_ACTIVATE_TYPE.attribute:
          this.attributeChangeService.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.device_trigger:
          this.deviceTriggerActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.internal_event:
          this.internalEventActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.solar:
          this.solarService.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.kunami:
          this.sequenceActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.state_change:
          this.stateChangeActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.schedule:
          this.scheduleActivate.clearRoutine(routine);
          return;
        case ROUTINE_ACTIVATE_TYPE.metadata:
          this.metadataChangeService.clearRoutine(routine);
          return;
      }
    });
  }

  public async update(
    id: string,
    routine: Partial<RoutineDTO>,
  ): Promise<RoutineDTO> {
    return await this.routinePersistence.update(routine, id);
  }

  private async interruptCheck(
    routine: RoutineDTO,
    options: RoutineActivateOptionsDTO,
  ): Promise<string> {
    const isActive = this.routineEnabled.ACTIVE_ROUTINES.has(routine._id);
    if (!isActive && !options.force) {
      this.logger.debug(
        `[${routine.friendlyName}] is disabled, blocking activation`,
      );
      return undefined;
    }
    const runId = uuid();
    if (!routine.sync || options.force) {
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
    this.logger.error(`Unknown repeat type: ${routine.repeat}`);
    return undefined;
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
