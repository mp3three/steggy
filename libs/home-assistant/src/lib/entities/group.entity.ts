import { Logger } from '@automagical/logger';
import { BaseEntity } from './base.entity';

export class GroupEntity extends BaseEntity {
  // #region Static Properties

  private static MAX_GROUP_NAME_LENGTH = 0;

  // #endregion Static Properties

  // #region Object Properties

  private readonly entityList: Record<string, BaseEntity> = {};
  private readonly logger = Logger(GroupEntity);

  // #endregion Object Properties

  // #region Constructors

  constructor(id, args) {
    super(id, args);
    const { length } = id;
    if (length > GroupEntity.MAX_GROUP_NAME_LENGTH) {
      GroupEntity.MAX_GROUP_NAME_LENGTH = length;
    }
  }

  // #endregion Constructors

  // #region Public Methods

  public async addEntities(entities: BaseEntity[]) {
    entities.forEach((entity) => {
      if (!this.entityList[entity.entityId]) {
        this.entityList[entity.entityId] = entity;
      }
    });
  }

  public async turnOff() {
    await super.turnOff();
    if (Object.keys(this.entityList).length === 0) {
      this.logger.warning(`turnOff failed: no entities in group`);
    }
    let id = this.entityId;
    while (id.length <= GroupEntity.MAX_GROUP_NAME_LENGTH) {
      id += ' ';
    }
    const list = Object.keys(this.entityList);
    this.logger.debug(`${id} *turn off* ${list.length}[${list.join(', ')}]`);
    await Promise.all(
      Object.values(this.entityList).map(async (i: BaseEntity) => {
        i.turnOff();
      }),
    );
  }

  public async turnOn() {
    await super.turnOn();
    if (Object.keys(this.entityList).length === 0) {
      this.logger.error(`turnOn failed: no entities in group`);
    }
    let id = this.entityId;
    while (id.length <= GroupEntity.MAX_GROUP_NAME_LENGTH) {
      id += ' ';
    }
    const list = Object.keys(this.entityList);
    this.logger.info(`${id} *turn on* ${list.length}[${list.join(', ')}]`);

    await Promise.all(
      Object.values(this.entityList).map((i) => i.turnOn()),
    );
  }

  // #endregion Public Methods
}
