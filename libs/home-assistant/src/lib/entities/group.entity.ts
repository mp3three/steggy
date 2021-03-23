import { BaseEntity } from './base.entity';
import { Dictionary } from 'lodash';
import logger from '../../log';

const { log, error, debug, develop, warn } = logger('GroupEntity');

export class GroupEntity extends BaseEntity {
  private static MAX_GROUP_NAME_LENGTH = 0;

  private entityList: Dictionary<BaseEntity> = {};

  constructor(id, args) {
    super(id, args);
    const { length } = id;
    if (length > GroupEntity.MAX_GROUP_NAME_LENGTH) {
      GroupEntity.MAX_GROUP_NAME_LENGTH = length;
    }
  }

  public async addEntities(entities: BaseEntity[]) {
    entities.forEach(entity => {
      if (!this.entityList[entity.entityId]) {
        this.entityList[entity.entityId] = entity;
      }
    });
  }

  public async turnOff() {
    await super.turnOff();
    if (this.entityList.length === 0) {
      error(`turnOff failed: no entities in group`);
    }
    let id = this.entityId;
    while (id.length <= GroupEntity.MAX_GROUP_NAME_LENGTH) {
      id += ' ';
    }
    const list = Object.keys(this.entityList);
    debug(`${id} *turn off* ${list.length}[${list.join(', ')}]`);
    await Promise.all(
      Object.values(this.entityList).map(async (i: BaseEntity) => {
        i.turnOff();
      }),
    );
  }

  public async turnOn() {
    await super.turnOn();
    if (this.entityList.length === 0) {
      error(`turnOn failed: no entities in group`);
    }
    let id = this.entityId;
    while (id.length <= GroupEntity.MAX_GROUP_NAME_LENGTH) {
      id += ' ';
    }
    const list = Object.keys(this.entityList);
    debug(`${id} *turn on* ${list.length}[${list.join(', ')}]`);
    await Promise.all(
      Object.values(this.entityList).map(async (i: BaseEntity) => {
        i.turnOn();
      }),
    );
  }
}
