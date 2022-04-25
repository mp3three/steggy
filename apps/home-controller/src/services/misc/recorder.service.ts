import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  OnEvent,
} from '@steggy/boilerplate';
import { eachLimit } from '@steggy/utilities';

import { ROUTINE_ACTIVATE, RoutineTriggerEvent } from '../../typings';

const ROUTINE_KEY_PREFIX = 'RECORDER_';
const ROUTINE_CACHE_KEY = ({ runId }: RoutineTriggerEvent) =>
  `${ROUTINE_KEY_PREFIX}${runId}`;
const LOAD_CHUNKS = 100;

@Injectable()
export class RecorderService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
  ) {}

  public async recentRoutines(): Promise<RoutineTriggerEvent[]> {
    const list: string[] = await this.cacheService.store.keys('RECORDER_*');
    const out: RoutineTriggerEvent[] = [];
    await eachLimit(
      list,
      async key =>
        out.push(await this.cacheService.get<RoutineTriggerEvent>(key)),
      LOAD_CHUNKS,
    );
    return out;
  }

  @OnEvent(ROUTINE_ACTIVATE)
  protected async trackRoutineActivation(
    details: RoutineTriggerEvent,
  ): Promise<void> {
    await this.cacheService.set(ROUTINE_CACHE_KEY(details), details);
    this.recentRoutines();
  }
}
