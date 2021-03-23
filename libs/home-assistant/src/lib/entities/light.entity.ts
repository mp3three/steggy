import { Logger } from '@automagical/logger';
import { HassServices } from '../../typings';
import { BaseEntity } from './base.entity';

export class LightEntity extends BaseEntity {
  // #region Object Properties

  private readonly logger = Logger(LightEntity);

  // #endregion Object Properties

  // #region Public Methods

  public async turnOff() {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }

  public async turnOn() {
    await super.turnOn();
    if (this.state === 'on') {
      this.logger.debug(`Skipping turn_on for: ${this.entityId}. Already on`);
      return;
    }
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
      brightness_pct: 50,
      effect: 'random',
    });
  }

  // #endregion Public Methods
}
