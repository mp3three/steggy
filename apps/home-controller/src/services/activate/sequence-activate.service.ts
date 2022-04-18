import { Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig, OnEvent } from '@steggy/boilerplate';
import {
  RoutineDTO,
  SequenceActivateDTO,
  SequenceSensorEvent,
  SequenceWatcher,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@steggy/home-assistant-shared';
import { each, is } from '@steggy/utilities';

import { SEQUENCE_TIMEOUT } from '../../config';

@Injectable()
export class SequenceActivateService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(SEQUENCE_TIMEOUT) private readonly kunamiTimeout: number,
    private readonly entityManager: EntityManagerService,
  ) {}

  private ACTIVE_MATCHERS = new Map<string, SequenceSensorEvent[]>();
  private TIMERS = new Map<string, ReturnType<typeof setTimeout>>();
  private WATCHED_SENSORS = new Map<string, SequenceWatcher[]>();

  public clearRoutine({ _id }: RoutineDTO): void {
    const list = [...this.WATCHED_SENSORS.entries()].map(([id, value]) => [
      id,
      value.filter(({ routine }) => routine._id !== _id),
    ]) as [string, SequenceWatcher[]][];
    const empty = list.filter(([, list]) => is.empty(list));
    empty.forEach(([id]) => {
      const timer = this.TIMERS.get(id);
      if (!timer) {
        return;
      }
      clearTimeout(timer);
      this.TIMERS.delete(id);
    });
    this.WATCHED_SENSORS = new Map(list.filter(([, list]) => !is.empty(list)));
  }

  public reset(): void {
    if (!is.empty(this.WATCHED_SENSORS)) {
      this.logger.debug(
        `[reset] Removing {${this.WATCHED_SENSORS.size}} watched entities`,
      );
    }
    this.WATCHED_SENSORS = new Map();
    this.ACTIVE_MATCHERS = new Map();
    this.TIMERS.forEach(timer => clearTimeout(timer));
    this.TIMERS = new Map();
  }

  public watch(
    routine: RoutineDTO,
    activate: SequenceActivateDTO,
    callback: () => Promise<void>,
  ): void {
    const watcher = this.WATCHED_SENSORS.get(activate.sensor) || [];
    watcher.push({
      ...activate,
      callback,
      routine,
    });
    this.WATCHED_SENSORS.set(activate.sensor, watcher);
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onEntityUpdate({ data }: HassEventDTO): Promise<void> {
    if (!this.WATCHED_SENSORS.has(data.entity_id)) {
      return;
    }
    if (this.entityManager.WATCHERS.has(data.entity_id)) {
      this.logger.debug(
        { entity_id: data.entity_id },
        `Blocked event from sensor being recorded`,
      );
      return;
    }
    this.initWatchers(data.entity_id);
    // Build up list of active matchers
    const process: SequenceSensorEvent[] = [];
    const temporary = this.ACTIVE_MATCHERS.get(data.entity_id);
    temporary.forEach(event => {
      if (event.rejected || event.completed) {
        return;
      }
      process.push(event);
    });
    const state = String(data.new_state.state);
    // Append new state to each matcher, test, then run callback
    await each(process, async item => {
      const { match, reset: immediateReset } = item.watcher;
      // Append to list of observed states
      item.progress.push(state);
      // Has appending this event invalidated the command?
      const isValid = item.progress.every(
        (item, index) => match[index] === item,
      );
      if (!isValid) {
        item.rejected = true;
        return;
      }
      // Has appending this event completed the command?
      item.completed = item.progress.length === match.length;
      if (!item.completed) {
        return;
      }
      // Run callback
      await item.watcher.callback();
      if (immediateReset === 'self') {
        item.progress = [];
        item.completed = false;
        this.logger.debug({ item }, `self reset`);
      }
      if (immediateReset === 'sensor') {
        this.ACTIVE_MATCHERS.delete(data.entity_id);
        clearTimeout(this.TIMERS.get(data.entity_id));
        this.TIMERS.delete(data.entity_id);
        this.logger.debug(`sensor reset {${data.entity_id}}`);
      }
    });
  }

  /**
   * Update the reset timeout
   *
   * If this entity is not part of active matchers, insert the entries to get it started
   */

  private initWatchers(entity_id: string): void {
    // Clear out old timer
    if (this.TIMERS.has(entity_id)) {
      clearTimeout(this.TIMERS.get(entity_id));
    }

    // Set up new timer
    const timer = setTimeout(() => {
      this.TIMERS.delete(entity_id);
      this.ACTIVE_MATCHERS.delete(entity_id);
      this.logger.debug({ entity_id }, `Timeout`);
    }, this.kunamiTimeout);
    this.TIMERS.set(entity_id, timer);

    // Set up active matcher if does not exist
    if (!this.ACTIVE_MATCHERS.has(entity_id)) {
      const initialEvents: SequenceSensorEvent[] = [];

      this.WATCHED_SENSORS.forEach(watchers => {
        watchers.forEach(watcher => {
          if (watcher.sensor !== entity_id) {
            return;
          }
          initialEvents.push({
            progress: [],
            rejected: false,
            watcher,
          });
        });
      });

      this.ACTIVE_MATCHERS.set(entity_id, initialEvents);
    }
  }
}
