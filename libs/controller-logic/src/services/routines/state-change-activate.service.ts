import {
  EntityManagerService,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  JSONFilterService,
  OnEvent,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';

import { StateChangeActivateDTO, StateChangeWatcher } from '../../contracts';

@Injectable()
export class StateChangeActivateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly jsonFilter: JSONFilterService,
  ) {}

  private WATCHED_ENTITIES = new Map<string, StateChangeWatcher[]>();

  @Trace()
  public reset(): void {
    this.logger.debug(
      `Removing ${this.WATCHED_ENTITIES.size} watched entities`,
    );
    this.WATCHED_ENTITIES = new Map();
  }

  @Trace()
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
        if (valid) {
          await item.callback();
        }
        callback();
      },
    );
  }
}
