import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  JSONFilterService,
  OnEvent,
} from '@steggy/boilerplate';
import { ActivationEvent, iActivationEvent } from '@steggy/controller-sdk';
import {
  RoutineActivateDTO,
  RoutineDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@steggy/home-assistant-shared';
import { each, is } from '@steggy/utilities';

import { StateChangeWatcher } from '../../typings';

const LATCH_KEY = (id: string) => `STATE_LATCH:${id}`;
const DEBOUNCE_KEY = (id: string) => `STATE_DEBOUNCE:${id}`;
const NO_ACTIVATIONS = 0;

@ActivationEvent({
  description: 'Activate in response to an entity state comparison',
  name: 'State Change',
  type: 'state_change',
})
export class StateChangeActivateService
  implements iActivationEvent<StateChangeActivateDTO>
{
  constructor(
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly jsonFilter: JSONFilterService,
  ) {}

  private WATCHED_ENTITIES = new Map<string, StateChangeWatcher[]>();

  public clearRoutine({ _id }: RoutineDTO): void {
    const list = [...this.WATCHED_ENTITIES.entries()].map(([id, value]) => [
      id,
      value.filter(({ routine }) => routine._id !== _id),
    ]) as [string, StateChangeWatcher[]][];
    const empty = list.filter(([, list]) => is.empty(list));
    empty.forEach(([id]) => this.WATCHED_ENTITIES.delete(id));
    this.WATCHED_ENTITIES = new Map(list.filter(([, list]) => !is.empty(list)));
  }

  public reset(): void {
    if (!is.empty(this.WATCHED_ENTITIES)) {
      this.logger.debug(
        `[reset] Removing {${this.WATCHED_ENTITIES.size}} watched entities`,
      );
    }
    this.WATCHED_ENTITIES = new Map();
  }

  public watch(
    routine: RoutineDTO,
    { activate }: RoutineActivateDTO<StateChangeActivateDTO>,
    callback: () => Promise<void>,
  ): void {
    const list = this.WATCHED_ENTITIES.get(activate.entity) || [];
    list.push({
      ...activate,
      callback,
      routine,
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
