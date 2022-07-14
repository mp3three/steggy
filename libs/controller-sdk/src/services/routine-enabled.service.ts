import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  AutoLogService,
  InjectConfig,
  ModuleScannerService,
  OnEvent,
} from '@steggy/boilerplate';
import {
  MetadataComparisonDTO,
  ROUTINE_UPDATE,
  RoutineAttributeComparisonDTO,
  RoutineCommandDTO,
  RoutineCommandStopProcessingDTO,
  RoutineDTO,
  RoutineStateComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@steggy/controller-shared';
import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@steggy/home-assistant-shared';
import { each, is, SECOND } from '@steggy/utilities';

import { StopProcessingCommandService } from '../commands';
import { SAFE_MODE } from '../config';
import {
  iRoutineEnabled,
  ROUTINE_ENABLED_PROVIDER,
  RoutineEnabledOptions,
} from '../decorators';
import {
  MetadataUpdate,
  PERSON_METADATA_UPDATED,
  ROOM_METADATA_UPDATED,
} from '../typings';
import { RoutinePersistenceService } from './persistence';
import { RoutineService } from './routine.service';

type METADATA = {
  props: string[];
  room: string;
  routines: string[];
};
type tPartialRoutine = Pick<
  RoutineDTO,
  '_id' | 'friendlyName' | 'enable' | 'command' | 'parent'
>;
const ROOT = 'root';

/**
 * ## Description
 *
 * This provider is for managing the "is this currently enabled" state for all routines that are in the database.
 *
 * At boot, it will load all routines, and evaluate all the rules required to determine if it should default to an enabled state.
 * If applicable, watchers / polling intervals will be set up.
 * When the routine gets updated, this class will watch for those changes (via `eventemitter`),
 *  and will reload local data as needed to properly keep the enabled state in line with the configuration of the routine.
 *
 * Some logic is currently provided inside this file for the enabled types.
 * These will be refactored out into standalone providers as time goes on, utilizing the module scanner to find + load.
 *
 * ## Configuration
 *
 * ### Safe Mode
 *
 * If `SAFE_MODE` is provided, then this service will not pass through routine mount requests.
 * This allows the service to continue to keep track of if the routine **SHOULD** be enabled, but not actually making it so.
 * The goal of the setting in this context is to allow the UI to maintain accuracy with it's "is it currently enabled?" state labels,
 * but not to actually process anything.
 *
 * **Note:** This is semi-safe, as polling watchers for templates and webhooks will still be set up and performed.
 * There isn't currently a "do absolutely nothing at all" setting
 */
@Injectable()
export class RoutineEnabledService {
  constructor(
    @InjectConfig(SAFE_MODE)
    private readonly safeMode: boolean,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => StopProcessingCommandService))
    private readonly stopProcessingService: StopProcessingCommandService,
    private readonly logger: AutoLogService,
    private readonly moduleScanner: ModuleScannerService,
    private readonly routinePersistence: RoutinePersistenceService,
  ) {}

  /**
   * Set of routine ids that list which routines are currently active
   */
  public ACTIVE_ROUTINES = new Set<string>();

  /**
   * Full indexed list of all routines
   */
  public RAW_LIST = new Map<string, tPartialRoutine>();

  /**
   * Extra providers of "is this currently enabled?" logic
   */
  private ENABLED_PROVIDERS = new Map<
    iRoutineEnabled<unknown>,
    RoutineEnabledOptions
  >();

  /**
   * Indexed by routine id, contains an array of callbacks which will tear down
   * any persistent logic that is managing any "is this enabled" logic.
   */
  private ENABLE_WATCHERS = new Map<string, (() => void)[]>();

  /**
   * A listing of routine ids that are relevant to the enabled state
   */
  private WATCH_ENTITIES = new Map<string, string[]>();

  /**
   * A listing of metadata information that is relevant to the enabled state
   */
  private WATCH_METADATA = new Map<string, METADATA[]>();

  /**
   * Routine ancestry information. Used to create prettier log messages
   */
  private ancestors = new Map<string, string[]>();

  /**
   * Because I don't feel like doing things right
   */
  private initialLoad = false;

  /**
   * Forcing string ids to be passed to manually refresh the routine info.
   */
  public async onUpdate(id: string): Promise<void> {
    const routine = await this.routineService.get(id);
    const name = this.routineService.superFriendlyName(id);
    const state = await this.isActive(routine);
    let updated = false;
    if (this.ACTIVE_ROUTINES.has(routine._id) && !state) {
      this.logger.debug(`${name} unload`);
      updated = true;
      this.stop(routine);
    }
    if (!this.ACTIVE_ROUTINES.has(routine._id) && state) {
      this.logger.debug(`${name} load`);
      updated = true;
      this.start(routine);
    }
    if (!updated) {
      this.logger.debug(`${name} {#onUpdate} called with no changes`);
      return;
    }
    this.logger.debug(`${name} changed state`);
  }

  /**
   * 💣 Go nuclear on it. Drop ALL info, and perform a full reload
   *
   * As close as can be had as restarting the server from this point of view
   */
  public async reload(): Promise<void> {
    this.logger.warn(`Performing full routine refresh`);

    // Stop all active routines
    this.ACTIVE_ROUTINES.forEach(id => this.stop(this.RAW_LIST.get(id)));

    // Clear out all initial data
    this.RAW_LIST = new Map();

    // Extra resetting (probably unnecessary)
    this.ACTIVE_ROUTINES = new Set();
    this.WATCH_ENTITIES = new Map();
    this.WATCH_METADATA = new Map();
    this.ancestors = new Map();

    this.initialLoad = false;
    await this.onApplicationBootstrap();
    await this.onApplicationReady();
  }

  /**
   * Load all routines, and cache the data locally
   */
  protected async onApplicationBootstrap(): Promise<void> {
    if (this.safeMode) {
      // Leave a note in the logs just in case it was forgotten
      this.logger.warn(`[SAFE_MODE] set, routines will not mount`);
    }
    const list = await this.routinePersistence.findMany({
      // Trim down as much as possible
      select: ['friendlyName', 'enable', 'parent', 'command.id'],
    });
    list.forEach(routine => this.RAW_LIST.set(routine._id, routine));
  }

  @OnEvent(ALL_ENTITIES_UPDATED)
  protected async onApplicationReady(): Promise<void> {
    if (this.initialLoad) {
      const checkRoutines: RoutineDTO[] = [];
      this.WATCH_ENTITIES.forEach((list, routine) =>
        checkRoutines.push(this.RAW_LIST.get(routine)),
      );
      this.logger.debug(
        `Recheck {${checkRoutines.length}} routines for entity updates`,
      );
      each(checkRoutines, async routine => await this.onUpdate(routine._id));
      return;
    }
    this.initialLoad = true;
    this.logger.info(
      `Setting initial active state for {${this.RAW_LIST.size}} routines`,
    );
    this.ancestors = new Map();
    const root: RoutineDTO[] = [];
    this.RAW_LIST.forEach(routine => {
      const parent = is.empty(routine.parent) ? ROOT : routine.parent;
      if (parent === ROOT) {
        root.push(routine);
      }
      const list = this.ancestors.get(parent) ?? [];
      list.push(routine._id);
      this.ancestors.set(parent, list);
      this.watch(routine);
    });
    await each(root, async routine => await this.remount({ updated: routine }));
  }

  /**
   * Subscribe to entity updates.
   * If they are relevant to any routines, then update those
   */
  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected onEntityUpdate({ data }: HassEventDTO): void {
    const checkRoutines: RoutineDTO[] = [];
    this.WATCH_ENTITIES.forEach((list, routine) => {
      if (list.includes(data.entity_id)) {
        checkRoutines.push(this.RAW_LIST.get(routine));
      }
    });
    each(checkRoutines, async routine => await this.onUpdate(routine._id));
  }

  /**
   * Subscribe to metadata updates,
   * If they are relevant to any routines, then update those
   */
  @OnEvent([ROOM_METADATA_UPDATED, PERSON_METADATA_UPDATED])
  protected onMetadataUpdate({ room, name }: MetadataUpdate): void {
    this.WATCH_METADATA.forEach(async metadata => {
      const caught = metadata.some(i => {
        if (i.room !== room) {
          return false;
        }
        return i.props.includes(name);
      });
      if (!caught) {
        return;
      }
      await each(
        is.unique(metadata.flatMap(i => i.routines)),
        async routine => await this.onUpdate(this.RAW_LIST.get(routine)._id),
      );
    });
  }

  protected onModuleInit() {
    this.ENABLED_PROVIDERS = this.moduleScanner.findWithSymbol<
      RoutineEnabledOptions,
      iRoutineEnabled<unknown>
    >(ROUTINE_ENABLED_PROVIDER);
  }

  /**
   * When a routine is updated:
   *
   * - stop (if currently running)
   * - tear down enable watchers
   * - update local data
   * - watch it again
   * - attempt to activate again (if enabled)
   * - repeat process child routines
   */
  @OnEvent(ROUTINE_UPDATE)
  protected async remount({
    deleted,
    created,
    updated,
  }: Partial<
    Record<'created' | 'updated', RoutineDTO> & { deleted?: RoutineDTO }
  >): Promise<void> {
    const routine = created || updated || deleted;
    // Stop + GC
    this.stop(routine);
    const watchers = this.ENABLE_WATCHERS.get(routine._id) ?? [];
    watchers.forEach(callback => callback());
    this.ENABLE_WATCHERS.delete(routine._id);
    if (deleted) {
      // Clean up more if deleted
      // Don't need to worry about descendant routines, separate events will be emitted for those
      this.RAW_LIST.delete(routine._id);
      return;
    }
    this.RAW_LIST.set(routine._id, {
      _id: routine._id,
      command: routine.command.map(
        ({ id }) => ({ id } as RoutineCommandDTO<unknown>),
      ),
      enable: routine.enable,
      friendlyName: routine.friendlyName,
      parent: routine.parent,
    });
    this.watch(this.RAW_LIST.get(routine._id));
    await this.onUpdate(routine._id);
    const list: RoutineDTO[] = [];
    this.RAW_LIST.forEach(child => {
      if (child.parent !== routine._id) {
        return;
      }
      list.push(child);
    });
    await each(list, async child => await this.remount({ updated: child }));
  }

  /**
   * Some types of enabling requires polling to keep up to date.
   *
   * Ex: evaluate a template on a schedule
   */
  private initPolling(routine: RoutineDTO): void {
    if (!is.number(routine.enable.poll)) {
      this.logger.error(
        `[${routine.friendlyName}] No polling interval defined`,
      );
      return;
    }
    const interval = setInterval(
      async () => await this.onUpdate(routine._id),
      routine.enable.poll * SECOND,
    );
    const watchers = this.ENABLE_WATCHERS.get(routine._id) || [];
    watchers.push(() => clearInterval(interval));
    this.ENABLE_WATCHERS.set(routine._id, watchers);
  }

  /**
   * Perform a a check to see if the routine is currently enabled according to the rules
   */
  private async isActive({
    enable,
    parent,
  }: Pick<RoutineDTO, 'enable' | 'parent'> = {}): Promise<boolean> {
    // If the parent isn't active, then this one isn't also
    if (!is.empty(parent) && !this.ACTIVE_ROUTINES.has(parent)) {
      return false;
    }
    enable ??= { type: 'enable' };
    const type = enable.type ?? 'enable';
    if (type === 'enable') {
      return true;
    }
    if (type === 'disable') {
      return false;
    }
    const testState = await this.stopProcessingService.activate({
      command: {
        command: enable,
      } as RoutineCommandDTO<RoutineCommandStopProcessingDTO>,
    });
    return (
      (type === 'enable_rules' && testState) ||
      (type === 'disable_rules' && !testState)
    );
  }

  /**
   * Switch a routine from not enabled to enabled
   */
  private start(routine: RoutineDTO): void {
    this.ACTIVE_ROUTINES.add(routine._id);
    if (is.empty(routine.command)) {
      this.logger.debug(
        `${this.routineService.superFriendlyName(
          routine._id,
        )} false start {(no commands)}`,
      );
      return;
    }
    if (is.empty(routine.activate)) {
      this.logger.debug(
        `${this.routineService.superFriendlyName(
          routine._id,
        )} false start {(no activate)}`,
      );
      return;
    }
    this.logger.info(
      `${this.routineService.superFriendlyName(routine._id)} start`,
    );
    if (!this.safeMode) {
      this.routineService.mount(routine);
    }
  }

  /**
   * Fully stop a routine.
   *
   * - Remove from active routines
   * - Unmount it
   */
  private stop(routine: RoutineDTO): void {
    if (!this.ACTIVE_ROUTINES.has(routine._id)) {
      return;
    }
    this.logger.info(`${routine.friendlyName} stop`);
    this.routineService.unmount(routine);
    this.ACTIVE_ROUTINES.delete(routine._id);
  }

  // FIXME: This will sort itself out after the switch statement gets removed
  // eslint-disable-next-line radar/cognitive-complexity
  private watch(routine: RoutineDTO): void {
    let poll = false;
    const entities: string[] = [];
    if (
      !routine.enable ||
      !['enable_rules', 'disable_rules'].includes(routine.enable.type)
    ) {
      return;
    }
    routine.enable.comparisons ??= [];
    routine.enable.comparisons.forEach(comparison => {
      let found = false;
      this.ENABLED_PROVIDERS.forEach(({ type }, provider) => {
        if (!type.includes(comparison.type)) {
          return;
        }
        found = true;
        const result = provider.watch(comparison.comparison, routine);
        if (!is.function(result)) {
          this.logger.error(
            `[${type}] routine enabled provider did not return a watch disable callback`,
          );
          return;
        }
        const watchers = this.ENABLE_WATCHERS.get(routine._id) ?? [];
        watchers.push(result);
        this.ENABLE_WATCHERS.set(routine._id, watchers);
      });
      if (found) {
        return;
      }
      // Module scanning is the way of the future here
      switch (comparison.type) {
        case STOP_PROCESSING_TYPE.webhook:
        case STOP_PROCESSING_TYPE.template:
          poll = true;
          return;
        case STOP_PROCESSING_TYPE.state:
        case STOP_PROCESSING_TYPE.attribute:
          entities.push(
            (
              comparison.comparison as
                | RoutineStateComparisonDTO
                | RoutineAttributeComparisonDTO
            ).entity_id,
          );
          break;
        case STOP_PROCESSING_TYPE.metadata:
          this.watchMetadata(
            comparison.comparison as MetadataComparisonDTO,
            routine,
          );
          break;
      }
    });
    const watchers = this.ENABLE_WATCHERS.get(routine._id) || [];
    if (poll) {
      this.initPolling(routine);
    }
    if (!is.empty(entities)) {
      this.WATCH_ENTITIES.set(
        routine._id,
        entities.filter((id, index, array) => array.indexOf(id) === index),
      );
      watchers.push(() => this.WATCH_ENTITIES.delete(routine._id));
    }
    this.ENABLE_WATCHERS.set(routine._id, watchers);
  }

  /**
   * TODO: Refactor into separate file
   */
  private watchMetadata(
    compare: MetadataComparisonDTO,
    { _id }: RoutineDTO,
  ): void {
    const metadata = this.WATCH_METADATA.get(compare.room) ?? [];
    let current = metadata.find(item => item.room === compare.room);
    if (!current) {
      current = { props: [], room: compare.room, routines: [] };
      metadata.push(current);
    }
    if (!current.routines.includes(_id)) {
      current.routines.push(_id);
    }
    if (!current.props.includes(compare.property)) {
      current.props.push(compare.property);
    }
    this.WATCH_METADATA.set(compare.room, metadata);
  }
}
