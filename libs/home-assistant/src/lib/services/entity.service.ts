import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { HassDomains } from '../../typings';
import {
  BaseEntity,
  BinarySensorEntity,
  ClimateEntity,
  FanEntity,
  GroupEntity,
  LightEntity,
  LockEntity,
  RemoteEntity,
  SensorEntity,
  SwitchEntity,
} from '../entities';
import { SocketService } from './socket.service';

@Injectable()
export class EntityService {
  // #region Static Properties

  private static waitingForEntities: Record<
    string,
    { done?: (unknown) => void; promise?: Promise<unknown> }
  > = {};

  // #endregion Static Properties

  // #region Object Properties

  private readonly registry: Record<string, BaseEntity> = {};

  private groupRegistry: Record<string, string[]> = {};
  private logger = Logger(EntityService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly socketService: SocketService, // private readonly cacheService: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Retrieve an entity by it's entityId
   */
  public async byId<T extends BaseEntity = BaseEntity>(
    entityId: string,
  ): Promise<T> {
    const cachedValue = this.registry[entityId];
    if (cachedValue) {
      return;
    }
    if (EntityService.waitingForEntities[entityId]) {
      return EntityService.waitingForEntities[entityId].promise as Promise<T>;
    }
    EntityService.waitingForEntities[entityId] = {};
    EntityService.waitingForEntities[entityId].promise = new Promise(
      (done) => (EntityService.waitingForEntities[entityId].done = done),
    );
    return EntityService.waitingForEntities[entityId].promise as Promise<T>;
  }

  /**
   * Clear the current entity registry
   */
  public clearRegistry(): void {
    Object.keys(this.registry).forEach((key) => delete this.registry[key]);
  }

  /**
   * Create a new entity object by id. {domain}.name, where domain is valid `HassDomains` (enum)
   *
   * Defaults to BaseEntity ctor if invalid domain
   */
  public async create<T extends BaseEntity>(entityId: string): Promise<T> {
    if (!this.registry[entityId]) {
      const domain = entityId.split('.')[0] as HassDomains;
      const ctor =
        {
          [HassDomains.switch]: SwitchEntity,
          [HassDomains.sensor]: SensorEntity,
          [HassDomains.light]: LightEntity,
          [HassDomains.fan]: FanEntity,
          [HassDomains.lock]: LockEntity,
          [HassDomains.group]: GroupEntity,
          [HassDomains.binary_sensor]: BinarySensorEntity,
          [HassDomains.sensor]: SensorEntity,
          [HassDomains.remote]: RemoteEntity,
          [HassDomains.climate]: ClimateEntity,
        }[domain] || BaseEntity;
      this.registry[entityId] = new ctor(entityId, this.socketService);

      if (EntityService.waitingForEntities[entityId]) {
        EntityService.waitingForEntities[entityId].done(
          this.registry[entityId],
        );
        delete EntityService.waitingForEntities[entityId];
      }
    }

    const entity = this.registry[entityId];
    if (entity instanceof GroupEntity) {
      const suffix = entityId.split('.').pop();
      if (this.groupRegistry[suffix]) {
        const entities = (await Promise.all(
          this.groupRegistry[suffix].map((id) => this.byId(id)),
        )) as BaseEntity[];
        entity.addMember(entities);
      }
    }
    return this.registry[entityId] as T;
  }

  /**
   * All known entity ids
   */
  public listEntities(): string[] {
    return Object.keys(this.registry);
  }

  /**
   * TODO: Whatever this 🗑🔥 is
   */
  public async registerGroups(groups: Record<string, string[]>): Promise<void> {
    Object.assign(this.groupRegistry, groups);
    await Promise.all(
      Object.keys(groups).map(async (suffix) => {
        await this.create(`group.${suffix}`);
        const str = `Created group: ${suffix} ["${groups[suffix].join(
          '", "',
        )}"]`;
        this.logger.info(str);

        //     if (entity instanceof GroupEntity) {
        //       const suffix = entityId.split('.').pop();
        //       const entityList = this.groupRegistry[suffix] || [];
        //       entity.addMember(
        //         (await Promise.all(
        //           entityList.map((entityId) => this.byId(entityId)),
        //         )) as BaseEntity[],
        //       );
        //     }
        //     // debug(`${entityId} exists now`);
        //     done(entity as T);
      }),
    );
  }

  // #endregion Public Methods
}
