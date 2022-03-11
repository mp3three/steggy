import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  JSONFilterService,
  OnEvent,
} from '@automagical/boilerplate';
import {
  StateChangeActivateDTO,
  StateChangeWatcher,
} from '@automagical/controller-shared';
import { EntityManagerService } from '@automagical/home-assistant';
import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/home-assistant-shared';
import { each, is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

const LATCH_KEY = (id: string) => `STATE_LATCH:${id}`;
const DEBOUNCE_KEY = (id: string) => `STATE_DEBOUNCE:${id}`;
const NO_ACTIVATIONS = 0;

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
    if (!is.empty(this.WATCHED_ENTITIES)) {
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
    if (!this.WATCHED_ENTITIES.has(activate.entity)) {
      this.logger.debug(`Start watching {${activate.entity}}`);
    }
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
    await each(this.WATCHED_ENTITIES.get(data.entity_id), async item => {
      let valid = this.jsonFilter.match(
        { value: data.new_state.state },
        {
          field: 'value',
          operation: item.operation,
          value: item.value,
        },
      );
      if (await this.blockLatched(item, valid)) {
        this.logger.debug(`${this.description(item)} currently latched`);
        return;
      }
      valid = await this.debounce(item, valid);
      if (valid) {
        await item.callback();
      }
    });
  }

  private async blockLatched(
    item: StateChangeWatcher,
    currentState: boolean,
  ): Promise<boolean> {
    const { latch, id } = item;
    if (!latch) {
      return false;
    }
    const isLatched = await this.cacheService.get<boolean>(LATCH_KEY(id));
    await this.cacheService.set(LATCH_KEY(id), currentState);
    return currentState && isLatched;
  }

  private async debounce(
    item: StateChangeWatcher,
    currentState: boolean,
  ): Promise<boolean> {
    const { debounce, id } = item;
    if (!is.number(debounce)) {
      return currentState;
    }
    if (!currentState) {
      return false;
    }
    const key = DEBOUNCE_KEY(id);
    const now = Date.now();
    const lastActivate =
      (await this.cacheService.get<number>(key)) || NO_ACTIVATIONS;
    if (lastActivate + debounce > now) {
      this.logger.debug(`${this.description(item)} debounce`);
      return false;
    }
    await this.cacheService.set(key, now);
    return true;
  }

  private description(item: StateChangeWatcher): string {
    const value = Array.isArray(item.value)
      ? item.value.join(', ')
      : item.value;
    return `[${item.entity}] ${item.operation} {${value}}`;
  }
}
