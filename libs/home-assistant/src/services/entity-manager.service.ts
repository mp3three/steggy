import { OnEvent, sleep, Trace } from '@automagical/utilities';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { Observable, Subscriber } from 'rxjs';

import {
  ALL_ENTITIES_UPDATED,
  CapbilityList,
  domain,
  EntityRegistryItemDTO,
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  HASS_DOMAINS,
  HassEventDTO,
  HASSIO_WS_COMMAND,
  HassStateDTO,
} from '../contracts';
import { HASocketAPIService } from './ha-socket-api.service';

/**
 * Global entity tracking, the source of truth for anything needing to retrieve the current state of anything
 *
 * Keeps a local cache of all observed entities with the most up to date state available.
 * Observables can be retrieved for monitoring a single entity's state.
 */
@Injectable()
export class EntityManagerService {
  constructor(
    private readonly socketService: HASocketAPIService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  private readonly ENTITIES = new Map<string, HassStateDTO>();
  private readonly OBSERVABLES = new Map<string, Observable<HassStateDTO>>();
  private readonly SUBSCRIBERS = new Map<string, Subscriber<HassStateDTO>>();
  private readonly WATCHERS = new Map<string, unknown[]>();

  public findByDomain<T extends HassStateDTO = HassStateDTO>(
    target: HASS_DOMAINS,
  ): T[] {
    const out: T[] = [];
    this.ENTITIES.forEach((state, key) => {
      if (domain(key) === target) {
        out.push(state as T);
      }
    });
    return out;
  }

  @Trace()
  public async fromRegistry<
    CAPABILITIES extends CapbilityList = Record<string, unknown>,
  >(entity_id: string): Promise<EntityRegistryItemDTO<CAPABILITIES>> {
    const out = await this.socketService.sendMsg<
      EntityRegistryItemDTO<CAPABILITIES>
    >({
      entity_id,
      type: HASSIO_WS_COMMAND.registry_get,
    });
    return out;
  }

  /**
   * Retrieve an entity's state
   */
  @Trace()
  public getEntities<T extends HassStateDTO = HassStateDTO>(
    entityId: string[],
  ): T[] {
    return entityId.map((id) => this.ENTITIES.get(id) as T);
  }

  /**
   * Retrieve an entity's state
   */
  @Trace()
  public getEntity<T extends HassStateDTO = HassStateDTO>(id: string): T {
    return this.ENTITIES.get(id) as T;
  }

  /**
   * Retrieve an onbservable that contains an entity's state
   */
  @Trace()
  public getObservable<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
  ): Observable<T> {
    this.createObservable(entityId);
    return this.OBSERVABLES.get(entityId) as Observable<T>;
  }

  public isValidId(entityId: string): boolean {
    return this.ENTITIES.has(entityId);
  }

  @Trace()
  public listEntities(): string[] {
    return [...this.ENTITIES.keys()];
  }

  @Trace()
  public async nextState<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
  ): Promise<T> {
    return new Promise<T>((done) => {
      this.eventEmitter.once(`${entityId}/update`, (result) => {
        done(result);
      });
    });
  }

  @Trace()
  public async record(entityId: string, duration: number): Promise<unknown[]> {
    if (this.WATCHERS.has(entityId)) {
      // Let's keep life simple
      throw new BadRequestException(`Watcher already exists for ${entityId}`);
    }
    const state = this.getEntity(entityId);
    this.WATCHERS.set(entityId, [state.state]);
    await sleep(duration); // kick back and relax
    const observed = this.WATCHERS.get(entityId);
    this.WATCHERS.delete(entityId);
    return observed;
  }

  @Trace()
  public async updateFriendlyName(
    entityId: string,
    friendly_name: string,
  ): Promise<unknown> {
    return await this.socketService.updateEntity(entityId, {
      name: friendly_name,
      new_entity_id: entityId,
    });
  }

  @Trace()
  public async updateId(
    entityId: string,
    newEntityId: string,
  ): Promise<unknown> {
    this.ENTITIES.set(newEntityId, this.ENTITIES.get(entityId));
    this.ENTITIES.delete(entityId);
    return await this.socketService.updateEntity(entityId, {
      new_entity_id: newEntityId,
    });
  }

  /**
   * Listen in on the ALL_ENTITIES_UPDATED event
   *
   * When that happens, update the local cache information.
   * Aldo does a great job of initial population of the data
   */
  @OnEvent(ALL_ENTITIES_UPDATED)
  @Trace()
  protected onAllEntitiesUpdated(allEntities: HassStateDTO[]): void {
    allEntities.forEach((entity) => {
      this.createObservable(entity.entity_id);
      const state = this.ENTITIES.get(entity.entity_id);
      if (state?.last_changed === entity.last_changed) {
        return;
      }
      this.ENTITIES.set(entity.entity_id, entity);
      const subscriber = this.SUBSCRIBERS.get(entity.entity_id);
      subscriber?.next(entity);
    });
  }

  /**
   * Listen in on the HA_EVENT_STATE_CHANGE event
   *
   * This happens any time any entity has an update.
   * Global collection of updates
   */
  @OnEvent(HA_EVENT_STATE_CHANGE)
  @Trace()
  protected onUpdate(event: HassEventDTO): void {
    const { entity_id, new_state } = event.data;
    this.createObservable(entity_id);
    this.ENTITIES.set(entity_id, new_state);
    const subscriber = this.SUBSCRIBERS.get(entity_id);
    subscriber?.next(new_state);
    this.eventEmitter.emit(`${entity_id}/update`, event);
    if (this.WATCHERS.has(entity_id)) {
      this.WATCHERS.get(entity_id).push(new_state.state);
    }
  }

  @OnEvent(HA_SOCKET_READY)
  protected async socketReady(): Promise<void> {
    await this.socketService.getAllEntitities();
  }

  private createObservable(entityId: string): void {
    if (this.OBSERVABLES.has(entityId)) {
      return;
    }
    const observable = new Observable<HassStateDTO>((subscriber) => {
      this.SUBSCRIBERS.set(entityId, subscriber);
    });
    this.OBSERVABLES.set(entityId, observable);
  }
}
