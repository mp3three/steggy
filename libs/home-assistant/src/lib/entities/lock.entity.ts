import { HassServices } from '../../enums/hass-services.enum';
import { BaseEntity } from './base.entity';

export class LockEntity extends BaseEntity {
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
}
