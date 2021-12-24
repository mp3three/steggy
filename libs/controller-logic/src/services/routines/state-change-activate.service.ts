import {
  EntityManagerService,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@for-science/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  IsEmpty,
  JSONFilterService,
  OnEvent,
} from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';

import { StateChangeActivateDTO, StateChangeWatcher } from '../../contracts';

const CACHE_KEY = (id: string) => `STATE_LATCH:${id}`;

@Injectable()
export class StateChangeActivateService {
  constructor(
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly jsonFilter: JSONFilterService,
  ) {}

  private WATCHED_ENTITIES = new Map<string, StateChangeWatcher[]>();

  public reset(): void {
    if (!IsEmpty(this.WATCHED_ENTITIES)) {
      this.logger.debug(
        `[reset] Removing {${this.WATCHED_ENTITIES.size}} watched entities`,
      );
    }
    this.WATCHED_ENTITIES = new Map();
  }

  public watch(
    activate: StateChangeActivateDTO,
    callback: () => Promise<void>,
  ): void {
    const list = this.WATCHED_ENTITIES.get(activate.entity) || [];
    list.push({
      ...activate,
      callback,
    });
    this.WATCHED_ENTITIES.set(activate.entity, list);
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onEntityUpdate({ data }: HassEventDTO): Promise<void> {
    if (!this.WATCHED_ENTITIES.has(data.entity_id)) {
      return;
    }
    if (this.entityManager.WATCHERS.has(data.entity_id)) {
      this.logger.debug(
        { entity_id: data.entity_id },
        `Blocked event from sensor being recorded`,
      );
      return;
    }
    await each(
      this.WATCHED_ENTITIES.get(data.entity_id),
      async (item, callback) => {
        const valid = this.jsonFilter.match(
          { value: data.new_state.state },
          {
            field: 'value',
            operation: item.operation,
            value: item.value,
          },
        );
        if (await this.blockLatched(item, valid)) {
          this.logger.debug(`Blocked lached call`);
          return callback();
        }
        if (valid) {
          await item.callback();
        }
        callback();
      },
    );
  }

  private async blockLatched(
    { id, latch }: StateChangeWatcher,
    currentState: boolean,
  ): Promise<boolean> {
    if (!latch) {
      return false;
    }
    const isLatched = await this.cacheService.get<boolean>(CACHE_KEY(id));
    await this.cacheService.set(CACHE_KEY(id), currentState);
    return currentState && isLatched;
  }
}
