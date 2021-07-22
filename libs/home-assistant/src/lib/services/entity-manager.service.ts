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
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class EntityManagerService {
  // #region Object Properties

  private readonly ENTITIES = new Map<string, HassStateDTO>();
  private readonly OBSERVABLES = new Map<string, Observable<HassStateDTO>>();
  private readonly SUBSCRIBERS = new Map<string, Subscriber<HassStateDTO>>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(EntityManagerService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public getEntity<T extends HassStateDTO = HassStateDTO>(entityId: string): T {
    return this.ENTITIES.get(entityId) as T;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent(ALL_ENTITIES_UPDATED)
  protected async onAllEntitiesUpdated(
    allEntities: HassStateDTO[],
  ): Promise<void> {
    allEntities.forEach((entity) => {
      this.createObservable(entity.entity_id);
      const state = this.ENTITIES.get(entity.entity_id);
      if (state?.last_changed === entity.last_changed) {
        return;
      }
      const subscriber = this.SUBSCRIBERS.get(entity.entity_id);
      subscriber?.next(entity);
    });
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onUpdate(event: HassEventDTO): Promise<void> {
    const { entity_id, new_state } = event.data;
    this.createObservable(entity_id);
    this.ENTITIES.set(entity_id, new_state);
    const subscriber = this.SUBSCRIBERS.get(entity_id);
    subscriber?.next(new_state);
  }

  // #endregion Protected Methods

  // #region Private Methods

  private createObservable(entityId: string): void {
    if (this.ENTITIES.has(entityId)) {
      return;
    }
    const observable = new Observable<HassStateDTO>((subscriber) => {
      this.SUBSCRIBERS.set(entityId, subscriber);
    });
    this.OBSERVABLES.set(entityId, observable);
  }

  // #endregion Private Methods
}
