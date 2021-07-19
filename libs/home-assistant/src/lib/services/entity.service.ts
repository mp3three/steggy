import {
  ALL_ENTITIES_UPDATED,
  HA_EVENT_STATE_CHANGE,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  HassEventDTO,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

const DEFAULT_STATE: HassStateDTO = undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class EntityService {
  // #region Object Properties

  /**
   * Mental note:
   *
   * This potentially results in duplication of data since this is a transient class.
   * I don't think it's an issue in practical terms, but it'd be nice to resolve that
   */
  public readonly ENTITIES = new Map<string, HassStateDTO>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(EntityService, LIB_HOME_ASSISTANT)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public trackEntity(entityId: string | string[]): void {
    if (typeof entityId === 'string') {
      entityId = [entityId];
    }
    entityId.forEach((item) => {
      if (!this.ENTITIES.has(item)) {
        this.ENTITIES.set(item, DEFAULT_STATE);
      }
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent([ALL_ENTITIES_UPDATED])
  @Trace()
  protected async onAllEntitiesUpdated(
    allEntities: HassStateDTO[],
  ): Promise<void> {
    allEntities.forEach((entity) =>
      this.ENTITIES.set(entity.entity_id, entity),
    );
  }

  @Trace()
  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onUpdate(eventList: HassEventDTO[]): Promise<void> {
    eventList.forEach((event) => {
      const { entity_id, new_state } = event.data;
      if (!this.ENTITIES.has(entity_id)) {
        return;
      }
      this.ENTITIES.set(entity_id, new_state);
    });
  }

  // #endregion Protected Methods
}
