import {
  AutoLogService,
  InjectConfig,
  OnEvent,
} from '@automagical/boilerplate';
import {
  RoomMetadataComparisonDTO,
  ROUTINE_UPDATE,
  RoutineAttributeComparisonDTO,
  RoutineDTO,
  RoutineRelativeDateComparisonDTO,
  RoutineStateComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@automagical/controller-shared';
import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/home-assistant-shared';
import { each, INCREMENT, is, SECOND } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { parse } from 'chrono-node';
import dayjs from 'dayjs';

import { SAFE_MODE } from '../../config';
import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../../typings';
import { StopProcessingCommandService } from '../commands';
import { RoutinePersistenceService } from '../persistence';
import { RoutineService } from './routine.service';

type METADATA = {
  props: string[];
  room: string;
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
  ) {}

  private readonly ACTIVE_ROUTINES = new Set<string>();
  private readonly ENABLE_WATCHERS = new Map<string, (() => void)[]>();
  private readonly RAW_LIST = new Map<string, RoutineDTO>();
  private readonly WATCH_ENTITIES = new Map<string, string[]>();
  private readonly WATCH_METADATA = new Map<string, METADATA[]>();
  private ancestors = new Map<string, string[]>();
  private initialLoad = false;

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
    this.RAW_LIST.forEach(routine => {
      const parent = routine.parent ?? ROOT;
      const list = this.ancestors.get(parent) ?? [];
      list.push(routine._id);
      this.ancestors.set(parent, list);
      this.watch(routine);
    });
    const active = await this.recurseActive(ROOT);
    active.forEach(routine => this.start(routine));
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
    this.WATCH_METADATA.forEach(async (metadata, routine) => {
      const caught = metadata.some(i => {
        if (i.room !== room) {
          return false;
        }
        return i.props.includes(name);
      });
      if (!caught) {
        return;
      }
      await this.onUpdate(this.RAW_LIST.get(routine));
    });
  }

  @OnEvent(ROUTINE_UPDATE)
  protected remount(routine: RoutineDTO): void {
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
    this.start(routine);
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
      routine.enable.poll,
    );
    const watchers = this.ENABLE_WATCHERS.get(routine._id) || [];
    watchers.push(() => clearInterval(interval));
    this.ENABLE_WATCHERS.set(routine._id, watchers);
  }

  private async isActive({ enable, parent }: RoutineDTO): Promise<boolean> {
    if (!is.empty(parent) && !this.ACTIVE_ROUTINES.has(parent)) {
      return false;
    }
    if (!is.object(enable)) {
      return true;
    }
    const testState = await this.stopProcessingService.activate(enable);
    const type = enable.type ?? 'enable';
    return (
      (type === 'enable' && testState) || (type === 'disable' && !testState)
    );
  }

  private keepRange(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ): void {
    const watchers = this.ENABLE_WATCHERS.get(routine._id) || [];
    const [parsed] = parse(comparison.expression);
    if (!parsed) {
      this.logger.error({ comparison }, `Expression failed parsing`);
      return;
    }
    let timeouts = this.rangeTimeouts(comparison, routine);

    const interval = setInterval(() => {
      // If there are still upcoming events, do nothing
      if (!is.empty(timeouts)) {
        return;
      }
      // re-parse the expression
      const [parsed] = parse(comparison.expression);
      const now = dayjs();
      // wait until the expression results in future dates before setting up timeouts again
      // ex: 'tuesday' will return a date in the past for most of the week
      if (now.isAfter(parsed.start.date())) {
        return;
      }
      timeouts = this.rangeTimeouts(comparison, routine);
    }, SECOND);

    watchers.push(() => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(interval);
    });
    this.ENABLE_WATCHERS.set(routine._id, watchers);
  }

  private async onUpdate(routine: RoutineDTO): Promise<void> {
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
    // if( this.)
  }

  private rangeTimeouts(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ) {
    const [parsed] = parse(comparison.expression);
    const now = Date.now();
    if (!parsed) {
      this.logger.error({ comparison }, `Expression failed parsing`);
      return;
    }
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timeouts.push(
      setTimeout(async () => {
        await this.onUpdate(routine);
        timeouts.shift();
      }, parsed.start.date().getTime() - now + INCREMENT),
    );
    if (parsed.end) {
      timeouts.push(
        setTimeout(async () => {
          await this.onUpdate(routine);
          timeouts.shift();
        }, parsed.end.date().getTime() - now + INCREMENT),
      );
    }
    return timeouts;
  }

  private async recurseActive(start: string): Promise<RoutineDTO[]> {
    const activeList: RoutineDTO[] = [];
    await each(this.ancestors.get(start), async id => {
      const routine = this.RAW_LIST.get(id);
      const active = await this.isActive(routine);
      if (!active) {
        return;
      }
      activeList.push(routine);
      if (!this.ACTIVE_ROUTINES.has(routine._id)) {
        this.ACTIVE_ROUTINES.add(routine._id);
      }
      if (this.ancestors.has(routine._id)) {
        activeList.push(...(await this.recurseActive(routine._id)));
      }
    });
    return activeList;
  }

  private start(routine: RoutineDTO): void {
    this.logger.info(`[${routine.friendlyName}] start`);
    this.ACTIVE_ROUTINES.add(routine._id);
    if (!this.safeMode) {
      this.routineService.mount(routine);
    }
  }

  private stop(routine: RoutineDTO): void {
    this.logger.info(`[${routine.friendlyName}] stop`);
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

  private watch(routine: RoutineDTO): void {
    let poll = false;
    const entities: string[] = [];
    if (!routine.enable) {
      return;
    }
    routine.enable.comparisons.forEach(comparison => {
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
        case STOP_PROCESSING_TYPE.date:
          this.keepRange(
            comparison.comparison as RoutineRelativeDateComparisonDTO,
            routine,
          );
          break;
        case STOP_PROCESSING_TYPE.room_metadata:
          this.watchMetadata(
            comparison.comparison as RoomMetadataComparisonDTO,
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

  private watchMetadata(compare: RoomMetadataComparisonDTO): void {
    const metadata = this.WATCH_METADATA.get(compare.room) ?? [];
    let current = metadata.find(item => item.room === compare.room);
    if (!current) {
      current = { props: [], room: compare.room };
      metadata.push(current);
    }
    if (!current.props.includes(compare.property)) {
      current.props.push(compare.property);
    }
    this.WATCH_METADATA.set(compare.room, metadata);
  }
}