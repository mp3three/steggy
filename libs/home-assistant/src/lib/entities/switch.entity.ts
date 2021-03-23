import { HassServices } from '../../enums/hass-services.enum';
import { BaseEntity } from './base.entity';

export class SwitchEntity extends BaseEntity {
  public async toggle() {
    return this.call(HassServices.toggle, {
      entity_id: this.entityId,
    });
  }

  public async turnOff() {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }

  public async turnOn() {
    if (this.state === 'on') {
      return;
    }
    await super.turnOn();
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
    });
  }
}
