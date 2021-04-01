import { HassServices } from '../../typings';
import { BaseEntity } from './base.entity';

export class SwitchEntity extends BaseEntity {
  // #region Public Methods

  public async toggle(): Promise<void> {
    return this.call(HassServices.toggle, {
      entity_id: this.entityId,
    });
  }

  public async turnOff(): Promise<void> {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }

  public async turnOn(): Promise<void> {
    if (this.state === 'on') {
      return;
    }
    await super.turnOn();
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
    });
  }

  // #endregion Public Methods
}
