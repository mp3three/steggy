import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { HassDomains } from '../typings';
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
  SwitchEntity
} from './entities';
import { SocketService } from './socket.service';

@Injectable()
export class EntityService {
  // #region Static Properties

  private static registry: Record<string, BaseEntity> = {};
  private static waitingForEntities: Record<
    string,
    ((...args) => void | Promise<void>)[]
  > = {};

  // #endregion Static Properties

  // #region Object Properties

  private groupRegistry: Record<string, string[]> = {};
  private logger = Logger(EntityService);

  // #endregion Object Properties

  // #region Constructors

  constructor(private socketService: SocketService) {}

  // #endregion Constructors

  // #region Public Methods

  public async byId<T extends BaseEntity>(entityId: string): Promise<T> {
    if (EntityService.registry[entityId]) {
      return EntityService.registry[entityId] as T;
    }
    return new Promise((done) => {
      EntityService.waitingForEntities[entityId] =
        EntityService.waitingForEntities[entityId] || [];
      // debug(`Waiting for ${entityId}`);
      EntityService.waitingForEntities[entityId].push(async (entity) => {
        if (entity instanceof GroupEntity) {
          const suffix = entityId.split('.').pop();
          const entityList = this.groupRegistry[suffix] || [];
          entity.addEntities(
            (await Promise.all(
              entityList.map((entityId) => this.byId(entityId)),
            )) as BaseEntity[],
          );
        }
        // debug(`${entityId} exists now`);
        done(entity as T);
      });
    });
  }

  public clearRegistry() {
    EntityService.registry = {};
  }

  public async create<T extends BaseEntity>(entityId: string): Promise<T> {
    if (!EntityService.registry[entityId]) {
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
      EntityService.registry[entityId] = new ctor(entityId, this.socketService);

      if (EntityService.waitingForEntities[entityId]) {
        EntityService.waitingForEntities[entityId].forEach((cb) => {
          cb(EntityService.registry[entityId]);
        });
        delete EntityService.waitingForEntities[entityId];
      }
    }

    const entity = EntityService.registry[entityId];
    if (entity instanceof GroupEntity) {
      const suffix = entityId.split('.').pop();
      if (this.groupRegistry[suffix]) {
        const entities = (await Promise.all(
          this.groupRegistry[suffix].map((id) => this.byId(id)),
        )) as BaseEntity[];
        entity.addEntities(entities);
      }
    }
    return EntityService.registry[entityId] as T;
  }

  public listEntities() {
    return Object.keys(EntityService.registry);
  }

  public async registerGroups(groups: Record<string, string[]>) {
    Object.assign(this.groupRegistry, groups);
    await Promise.all(
      Object.keys(groups).map(async (suffix) => {
        await this.create(`group.${suffix}`);
        const str =  `Created group: ${suffix} ["${groups[suffix].join('", "')}"]`;
        this.logger.info(
str
        );
      }),
    );
  }

  // #endregion Public Methods
}
