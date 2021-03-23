import { HassServices } from '../../enums/hass-services.enum';
import logger from '../../log';
import { BaseEntity } from './base.entity';

const { log, debug, error, warn, startup, develop } = logger('LightEntity');

export class LightEntity extends BaseEntity {
  public async turnOff() {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }

  public async turnOn() {
    await super.turnOn();
    if (this.state === 'on') {
      debug(`Skipping turn_on for: ${this.entityId}. Already on`);
      return;
    }
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
      brightness_pct: 50,
      effect: 'random',
    });
  }
}
