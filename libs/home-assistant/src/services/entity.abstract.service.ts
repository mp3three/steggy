import { AutoLogService, OnEvent } from '@steggy/boilerplate';
import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
  HassStateDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

const DEFAULT_STATE: HassStateDTO = undefined;

export abstract class EntityService {
  constructor() {
    this.ENTITIES = new Map<string, HassStateDTO>();
  }

  protected readonly ENTITIES: Map<string, HassStateDTO>;
  protected readonly logger: AutoLogService;

  @OnEvent(ALL_ENTITIES_UPDATED)
  protected async onAllEntitiesUpdated({
    states,
  }: {
    states: HassStateDTO[];
  }): Promise<void> {
    await states.forEach(entity => this.ENTITIES.set(entity.entity_id, entity));
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onUpdate(event: HassEventDTO): Promise<void> {
    const { entity_id, new_state } = event.data;
    if (!this.ENTITIES.has(entity_id)) {
      return;
    }
    await this.ENTITIES.set(entity_id, new_state);
  }

  protected trackEntity(entityId: string | string[]): void {
    if (is.string(entityId)) {
      entityId = [entityId];
    }
    entityId.forEach(item => {
      if (!this.ENTITIES.has(item)) {
        this.ENTITIES.set(item, DEFAULT_STATE);
      }
    });
  }
}
