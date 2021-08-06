import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
} from '@automagical/contracts/constants';
import {
  HassEventDTO,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

const DEFAULT_STATE: HassStateDTO = undefined;

export abstract class EntityService {
  // #region Object Properties

  protected readonly ENTITIES: Map<string, HassStateDTO>;
  protected readonly logger: PinoLogger;

  // #endregion Object Properties

  // #region Constructors

  constructor() {
    this.ENTITIES = new Map<string, HassStateDTO>();
  }

  // #endregion Constructors

  // #region Protected Methods

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

  // #endregion Protected Methods
}