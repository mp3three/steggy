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
import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../typings';
import { RoutinePersistenceService } from './persistence';
import { RoutineService } from './routine.service';

type METADATA = {
  props: string[];
  room: string;
  routines: string[];
};
const ROOT = 'root';

@Injectable()
export class RoutineEnabledService {
  constructor(
    @InjectConfig(SAFE_MODE)
    private readonly safeMode: boolean,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
    private readonly logger: AutoLogService,
    private readonly routinePersistence: RoutinePersistenceService,
    @Inject(forwardRef(() => StopProcessingCommandService))
    private readonly stopProcessingService: StopProcessingCommandService,
    private readonly moduleScanner: ModuleScannerService,
  ) {}

  public ACTIVE_ROUTINES = new Set<string>();
  private ENABLED_PROVIDERS = new Map<
    iRoutineEnabled<unknown>,
    RoutineEnabledOptions
  >();
  private ENABLE_WATCHERS = new Map<string, (() => void)[]>();
  private RAW_LIST = new Map<string, RoutineDTO>();
  private WATCH_ENTITIES = new Map<string, string[]>();
  private WATCH_METADATA = new Map<string, METADATA[]>();
  private ancestors = new Map<string, string[]>();
  private initialLoad = false;

  public async onUpdate(routine: RoutineDTO): Promise<void> {
    const state = await this.isActive(routine);
    let updated = false;
    if (this.ACTIVE_ROUTINES.has(routine._id) && !state) {
      this.logger.debug(`[${routine.friendlyName}] unload`);
      updated = true;
      this.stop(routine);
    }
    if (!this.ACTIVE_ROUTINES.has(routine._id) && state) {
      this.logger.debug(`[${routine.friendlyName}] load`);
      updated = true;
      this.start(routine);
    }
    if (!updated) {
      return;
    }
    this.logger.debug(`[${routine.friendlyName}] changed state`);
  }

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

    // Loading as if fresh
    this.initialLoad = false;
    await this.onApplicationBootstrap();
    await this.onApplicationReady();
  }

  protected async onApplicationBootstrap(): Promise<void> {
    if (this.safeMode) {
      this.logger.warn(`[SAFE_MODE] set, routines will not mount`);
    }
    const list = await this.routinePersistence.findMany();
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
      each(checkRoutines, async routine => await this.onUpdate(routine));
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
    await each(root, async routine => await this.remount(routine));
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected onEntityUpdate({ data }: HassEventDTO): void {
    const checkRoutines: RoutineDTO[] = [];
    this.WATCH_ENTITIES.forEach((list, routine) => {
      if (list.includes(data.entity_id)) {
        checkRoutines.push(this.RAW_LIST.get(routine));
      }
    });
    each(checkRoutines, async routine => await this.onUpdate(routine));
  }

  @OnEvent(ROOM_METADATA_UPDATED)
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
        async routine => await this.onUpdate(this.RAW_LIST.get(routine)),
      );
    });
  }

  protected onModuleInit() {
    this.ENABLED_PROVIDERS = this.moduleScanner.findWithSymbol<
      RoutineEnabledOptions,
      iRoutineEnabled<unknown>
    >(ROUTINE_ENABLED_PROVIDER);
  }

  @OnEvent(ROUTINE_UPDATE)
  protected async remount(routine: RoutineDTO): Promise<void> {
    // Stop + GC
    this.stop(routine);
    if (routine.deleted) {
      // Clean up more if deleted
      this.RAW_LIST.delete(routine._id);
      return;
    }
    // If newly created, start watching
    if (!this.RAW_LIST.has(routine._id)) {
      this.watch(routine);
    }
    this.RAW_LIST.set(routine._id, routine);
    await this.onUpdate(routine);
    const list: RoutineDTO[] = [];
    this.RAW_LIST.forEach(child => {
      if (child.parent !== routine._id) {
        return;
      }
      list.push(child);
    });
    await each(list, async child => await this.remount(child));
  }

  private initPolling(routine: RoutineDTO): void {
    if (!is.number(routine.enable.poll)) {
      this.logger.error(
        `[${routine.friendlyName}] No polling interval defined`,
      );
      return;
    }
    const interval = setInterval(
      async () => await this.onUpdate(routine),
      routine.enable.poll * SECOND,
    );
    const watchers = this.ENABLE_WATCHERS.get(routine._id) || [];
    watchers.push(() => clearInterval(interval));
    this.ENABLE_WATCHERS.set(routine._id, watchers);
  }

  private async isActive({
    enable,
    parent,
  }: Pick<RoutineDTO, 'enable' | 'parent'> = {}): Promise<boolean> {
    if (!is.empty(parent) && !this.ACTIVE_ROUTINES.has(parent)) {
      return false;
    }
    if (!is.object(enable)) {
      return true;
    }
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

  private start(routine: RoutineDTO): void {
    this.ACTIVE_ROUTINES.add(routine._id);
    if (is.empty(routine.command)) {
      this.logger.debug(`[${routine.friendlyName}] false start (no commands)`);
      return;
    }
    if (is.empty(routine.activate)) {
      this.logger.debug(`[${routine.friendlyName}] false start (no activate)`);
      return;
    }
    this.logger.info(`${this.superFriendlyName(routine)} start`);
    if (!this.safeMode) {
      this.routineService.mount(routine);
    }
  }

  private stop(routine: RoutineDTO): void {
    if (!this.ACTIVE_ROUTINES.has(routine._id)) {
      return;
    }
    this.logger.info(`${routine.friendlyName} stop`);
    this.routineService.unmount(routine);
    this.ACTIVE_ROUTINES.delete(routine._id);
    this.ENABLE_WATCHERS.forEach((disable, watched) => {
      if (watched !== routine._id) {
        return;
      }
      disable.forEach(callback => callback());
    });
    this.ENABLE_WATCHERS.delete(routine._id);
  }

  private superFriendlyName(routine: RoutineDTO, built = ''): string {
    built = is.empty(built) ? '' : ` > ${built}`;
    built = `[${routine.friendlyName}]${built}`;
    if (routine.parent) {
      return this.superFriendlyName(this.RAW_LIST.get(routine.parent), built);
    }
    return built;
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
