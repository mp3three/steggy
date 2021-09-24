import { AutoLogService, OnEvent } from '@automagical/utilities';

import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
  HassStateDTO,
} from '../contracts';

const DEFAULT_STATE: HassStateDTO = undefined;

export abstract class EntityService {
  protected readonly ENTITIES: Map<string, HassStateDTO>;
  protected readonly logger: AutoLogService;

  constructor() {
    this.ENTITIES = new Map<string, HassStateDTO>();
  }

  @OnEvent(ALL_ENTITIES_UPDATED)
  protected async onAllEntitiesUpdated(
    allEntities: HassStateDTO[],
  ): Promise<void> {
    allEntities.forEach((entity) =>
      this.ENTITIES.set(entity.entity_id, entity),
    );
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onUpdate(event: HassEventDTO): Promise<void> {
    const { entity_id, new_state } = event.data;
    if (!this.ENTITIES.has(entity_id)) {
      return;
    }
    this.ENTITIES.set(entity_id, new_state);
  }

  protected trackEntity(entityId: string | string[]): void {
    if (typeof entityId === 'string') {
      entityId = [entityId];
    }
    entityId.forEach((item) => {
      if (!this.ENTITIES.has(item)) {
        this.ENTITIES.set(item, DEFAULT_STATE);
      }
    });
  }
}
