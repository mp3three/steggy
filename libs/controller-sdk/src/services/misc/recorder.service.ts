import { Injectable } from '@nestjs/common';
import {
  CacheManagerService,
  InjectCache,
  InjectConfig,
  OnEvent,
} from '@steggy/boilerplate';
import { RoutineTriggerEvent } from '@steggy/controller-shared';
import { eachLimit } from 'async';

import { RECENT_ROUTINE_TTL } from '../../config';
import { ROUTINE_ACTIVATE } from '../../typings';

const ROUTINE_KEY_PREFIX = 'RECORDER_';
const ROUTINE_CACHE_KEY = ({ runId }: RoutineTriggerEvent) =>
  `${ROUTINE_KEY_PREFIX}${runId}`;
const LOAD_CHUNKS = 100;

@Injectable()
export class RecorderService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    @InjectConfig(RECENT_ROUTINE_TTL) private readonly ttl: number,
  ) {}

  public async recentRoutines(): Promise<RoutineTriggerEvent[]> {
    const list: string[] = await this.cache.store.keys(
      `${ROUTINE_KEY_PREFIX}*`,
    );
    const out: RoutineTriggerEvent[] = [];
    await eachLimit(list, LOAD_CHUNKS, async key =>
      out.push(await this.cache.get<RoutineTriggerEvent>(key)),
    );
    return out;
  }

  @OnEvent(ROUTINE_ACTIVATE)
  protected async trackRoutineActivation(
    details: RoutineTriggerEvent,
  ): Promise<void> {
    await this.cache.set(ROUTINE_CACHE_KEY(details), details, {
      ttl: this.ttl,
    });
    this.recentRoutines();
  }
}
