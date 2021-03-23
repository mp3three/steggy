import { HassServices } from '../../typings';
import { BaseEntity } from './base.entity';

export class LockEntity extends BaseEntity {
  // #region Public Methods

  public async lock() {
    return this.call(HassServices.lock, {
      entity_id: this.entityId,
    });
  }

  public async unlock() {
    return this.call(HassServices.unlock, {
      entity_id: this.entityId,
    });
  }

  // #endregion Public Methods
}
