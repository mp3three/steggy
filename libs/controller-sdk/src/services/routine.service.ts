import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  ModuleScannerService,
} from '@steggy/boilerplate';
import {
  ActivationEventSettings,
  CloneRoutineDTO,
  RoutineActivateOptionsDTO,
  RoutineCommandDTO,
  RoutineCommandSettings,
  RoutineDTO,
  RoutineTriggerEvent,
} from '@steggy/controller-shared';
import {
  each,
  eachSeries,
  is,
  LABEL,
  ResultControlDTO,
  sleep,
} from '@steggy/utilities';
import dayjs from 'dayjs';
import EventEmitter from 'eventemitter3';
import { v4 as uuid, v4 } from 'uuid';

import {
  ACTIVATION_EVENT,
  iActivationEvent,
  iRoutineCommand,
  ROUTINE_COMMAND,
} from '../decorators';
import { ROUTINE_ACTIVATE } from '../typings';
import { RoutinePersistenceService } from './persistence';
import { RoutineEnabledService } from './routine-enabled.service';

const INSTANCE_ID = uuid();
const RUN_CACHE = (routine: RoutineDTO) => `${INSTANCE_ID}_${routine._id}`;

@Injectable()
export class RoutineService {
  constructor(
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly routinePersistence: RoutinePersistenceService,
    @Inject(forwardRef(() => RoutineEnabledService))
    private readonly routineEnabled: RoutineEnabledService,
    private readonly eventEmitter: EventEmitter,
    private readonly moduleScanner: ModuleScannerService,
    private readonly logger: AutoLogService,
  ) {}

  public ACTIVATION_EVENTS: Map<
    iActivationEvent<unknown>,
    ActivationEventSettings
  >;
  public ROUTINE_COMMAND: Map<iRoutineCommand<unknown>, RoutineCommandSettings>;
  private readonly runQueue = new Map<string, (() => void)[]>();

  /**
   * @return {boolean} continue past this command?
   */
  public async activateCommand(
    command: RoutineCommandDTO | string,
    routine: RoutineDTO | string,
    waitForChange = false,
    runId?: string,
  ): Promise<boolean> {
    routine = await this.get(routine);
    if (!routine) {
      return false;
    }
    command = is.string(command)
      ? routine.command.find(({ id }) => id === command)
      : command;
    this.logger.debug(` - {${command.friendlyName}}`);
    const routineCommand = this.getCommand(command.type);
    const result = await routineCommand.activate({
      command,
      routine,
      runId,
      waitForChange,
    });
    return !result;
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
    this.logger.info(
      { runId },
      `${this.superFriendlyName(routine._id)} activate`,
    );
    this.eventEmitter.emit(ROUTINE_ACTIVATE, {
      routine: routine._id,
      runId,
      source: options.source,
      time: Date.now(),
    } as RoutineTriggerEvent);
    let aborted = false;
    waitForChange ||= this.isSync(routine);
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
              `${this.superFriendlyNameParts(
                routine._id,
              )} processing interrupted`,
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

  public async allTags(): Promise<string[]> {
    const routines = await this.list({
      filters: new Set([
        {
          field: 'routine.tag',
          operation: 'empty',
          value: false,
        },
      ]),
      select: ['tags'] as (keyof RoutineDTO)[],
    });
    return is
      .unique(routines.flatMap(({ tags }) => tags))
      .filter(i => is.string(i));
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
    this.logger.info(`Clone ${this.superFriendlyName(source._id)}`);
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
          `${this.superFriendlyName(source._id)} cloning {${
            children.length
          }} child routines`,
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
        `${this.superFriendlyName(routine._id)} removing {${
          children.length
        }} child routines`,
      );
    }
    await each(children, async child => await this.delete(child));
    this.logger.info(`${this.superFriendlyName(routine._id)} Delete routine`);
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
      this.logger.warn(
        `${this.superFriendlyName(routine._id)} no activation events`,
      );
      return;
    }
    this.logger.debug(`${this.superFriendlyName(routine._id)} building`);
    routine.activate.forEach(activate => {
      if (!activate.activate) {
        this.logger.error(` - {${activate.friendlyName}} INVALID`);
        return;
      }
      this.logger.debug(` - {${activate.friendlyName}}`);
      this.getActivation(activate.type).watch(
        routine,
        activate,
        async () =>
          await this.activateRoutine(routine, { source: activate.id }),
      );
    });
  }

  public superFriendlyName(id: string): string {
    const parts = this.superFriendlyNameParts(id);
    return parts.map(i => `[${i}]`).join(' > ');
  }

  /**
   * Create an excessively readable label that shows full ancestors.
   *
   * ```text
   * 🧓 Grandparent Routine > 🧑 Parent Routine > "👶 I'm doing a thing!"
   * ```
   */
  public superFriendlyNameParts(id: string, built = []): string[] {
    const routine = this.routineEnabled.RAW_LIST.get(id);
    built.unshift(routine.friendlyName);
    if (routine.parent) {
      return this.superFriendlyNameParts(routine.parent, built);
    }
    return built;
  }

  public unmount(routine: RoutineDTO): void {
    if (is.empty(routine.activate)) {
      return;
    }
    this.logger.debug(`${this.superFriendlyName(routine._id)} unmount`);
    routine.activate.forEach(activate => {
      this.logger.debug(` - ${activate.friendlyName}`);
      this.getActivation(activate.type).clearRoutine(routine);
    });
  }

  public async update(
    id: string,
    routine: Partial<RoutineDTO>,
  ): Promise<RoutineDTO> {
    return await this.routinePersistence.update(routine, id);
  }

  protected onModuleInit(): void {
    this.ACTIVATION_EVENTS = this.moduleScanner.findWithSymbol<
      ActivationEventSettings,
      iActivationEvent
    >(ACTIVATION_EVENT);
    this.logger.info(
      `Loaded {${this.ACTIVATION_EVENTS.size}} activation events`,
    );
    this.ACTIVATION_EVENTS.forEach(event =>
      this.logger.debug(` - [${event.name}] / {${event.type}}`),
    );
    this.ROUTINE_COMMAND = this.moduleScanner.findWithSymbol<
      RoutineCommandSettings,
      iRoutineCommand<unknown>
    >(ROUTINE_COMMAND);
    this.logger.info(`Loaded {${this.ROUTINE_COMMAND.size}} commands`);
    this.ROUTINE_COMMAND.forEach(event =>
      this.logger.debug(` - [${event.name}] / {${event.type}}`),
    );
  }

  private getActivation<T>(name: string): iActivationEvent<T> {
    const event = [...this.ACTIVATION_EVENTS.entries()].find(
      ([, { type }]) => name === type,
    );
    if (!event) {
      const message = `[${name}] unknown activation type`;
      this.logger.fatal(message);
      throw new InternalServerErrorException(message);
    }
    return event[LABEL];
  }

  private getCommand<T = unknown>(name: string): iRoutineCommand<T> {
    const event = [...this.ROUTINE_COMMAND.entries()].find(
      ([, { type }]) => name === type,
    );
    if (!event) {
      const message = `[${name}] unknown command type`;
      this.logger.fatal(message);
      throw new InternalServerErrorException(message);
    }
    return event[LABEL];
  }

  private async interruptCheck(
    routine: RoutineDTO,
    options: RoutineActivateOptionsDTO,
  ): Promise<string> {
    const isActive = this.routineEnabled.ACTIVE_ROUTINES.has(routine._id);
    if (!isActive && !options.force) {
      this.logger.debug(
        `${this.superFriendlyName(
          routine._id,
        )} is disabled, blocking activation`,
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

  private isSync(routine: RoutineDTO): boolean {
    if (routine.sync) {
      return true;
    }
    const commandTypes = is.unique(routine.command.map(({ type }) => type));
    const keys = [...this.ROUTINE_COMMAND.values()];
    return commandTypes.some(type =>
      keys.some(i => i.type === type && i.syncOnly),
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
