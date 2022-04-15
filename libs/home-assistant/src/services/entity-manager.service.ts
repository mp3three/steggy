import { BadRequestException, Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig, OnEvent } from '@steggy/boilerplate';
import {
  ALL_ENTITIES_UPDATED,
  CapabilityList,
  domain,
  EntityRegistryItemDTO,
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  HASS_DOMAINS,
  HassEventDTO,
  HASSIO_WS_COMMAND,
  HassStateDTO,
} from '@steggy/home-assistant-shared';
import { is, SECOND, sleep } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Observable, Subscriber } from 'rxjs';

import { RETRY_INTERVAL } from '../config';
import { HASocketAPIService } from './ha-socket-api.service';

const TIMEOUT = 5;

/**
 * Global entity tracking, the source of truth for anything needing to retrieve the current state of anything
 *
 * Keeps a local cache of all observed entities with the most up to date state available.
 * An observable can be retrieved for monitoring a single entity's state.
 */
@Injectable()
export class EntityManagerService {
  constructor(
    @InjectConfig(RETRY_INTERVAL) private readonly retry: number,
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly eventEmitter: EventEmitter,
  ) {}
  public readonly ENTITIES = new Map<string, HassStateDTO>();
  public readonly WATCHERS = new Map<string, unknown[]>();
  private readonly OBSERVABLES = new Map<string, Observable<HassStateDTO>>();
  private readonly SUBSCRIBERS = new Map<string, Subscriber<HassStateDTO>>();

  public findByDomain<T extends HassStateDTO = HassStateDTO>(
    target: HASS_DOMAINS,
  ): T[] {
    const out: T[] = [];
    this.ENTITIES.forEach((state, key) => {
      if (domain(key) === target) {
        out.push(state as T);
      }
    });
    return out.filter(i => is.object(i));
  }

  public async fromRegistry<
    CAPABILITIES extends CapabilityList = Record<string, unknown>,
  >(entity_id: string): Promise<EntityRegistryItemDTO<CAPABILITIES>> {
    const out = await this.socketService.sendMessage<
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

  public getEntities<T extends HassStateDTO = HassStateDTO>(
    entityId: string[],
  ): T[] {
    return entityId.map(id => this.ENTITIES.get(id) as T);
  }

  /**
   * Retrieve an entity's state
   */

  public getEntity<T extends HassStateDTO = HassStateDTO>(id: string): T {
    return this.ENTITIES.get(id) as T;
  }

  /**
   * Retrieve an observable that contains an entity's state
   */
  public getObservable<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
  ): Observable<T> {
    this.createObservable(entityId);
    return this.OBSERVABLES.get(entityId) as Observable<T>;
  }

  public isValidId(entityId: string): boolean {
    return this.ENTITIES.has(entityId);
  }

  public listEntities(): string[] {
    return [...this.ENTITIES.keys()];
  }

  public async nextState<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
  ): Promise<T> {
    return new Promise<T>(done => {
      this.eventEmitter.once(`${entityId}/update`, result => {
        done(result);
      });
    });
  }

  public async record(entityId: string, duration: number): Promise<unknown[]> {
    if (this.WATCHERS.has(entityId)) {
      // Let's keep life simple
      throw new BadRequestException(`Watcher already exists for ${entityId}`);
    }
    this.logger.warn(`Recording {${entityId}}`);
    this.WATCHERS.set(entityId, []);
    await sleep(duration * SECOND); // kick back and relax
    const observed = this.WATCHERS.get(entityId);
    this.WATCHERS.delete(entityId);
    return observed;
  }

  public async updateFriendlyName(
    entityId: string,
    friendly_name: string,
  ): Promise<unknown> {
    return await this.socketService.updateEntity(entityId, {
      name: friendly_name,
      new_entity_id: entityId,
    });
  }

  public async updateId(
    entityId: string,
    newEntityId: string,
  ): Promise<unknown> {
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
  protected onAllEntitiesUpdated(allEntities: HassStateDTO[]): void {
    allEntities.forEach(entity => {
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
  protected onUpdate(event: HassEventDTO): void {
    const { entity_id, new_state } = event.data;
    if (this.WATCHERS.has(entity_id)) {
      this.logger.debug(
        { attributes: new_state.attributes },
        `[${entity_id}] state change {${new_state.state}}`,
      );
      this.WATCHERS.get(entity_id).push(new_state.state);
      return;
    }
    this.createObservable(entity_id);
    this.ENTITIES.set(entity_id, new_state);
    const subscriber = this.SUBSCRIBERS.get(entity_id);
    subscriber?.next(new_state);
    this.eventEmitter.emit(`${entity_id}/update`, event);
  }

  @OnEvent(HA_SOCKET_READY)
  protected async socketReady(): Promise<void> {
    const run = await Promise.race([
      async () => {
        const entities = await this.socketService.getAllEntities();
        return !is.empty(entities);
      },
      async () => {
        await sleep(TIMEOUT * SECOND);
        return false;
      },
    ]);
    const result = await run();
    if (result) {
      return;
    }
    this.logger.error(`Failed to retrieve entity list`);
    await sleep(this.retry);
    await this.socketReady();
  }

  private createObservable(entityId: string): void {
    if (this.OBSERVABLES.has(entityId)) {
      return;
    }
    const observable = new Observable<HassStateDTO>(subscriber => {
      this.SUBSCRIBERS.set(entityId, subscriber);
    });
    this.OBSERVABLES.set(entityId, observable);
  }
}
