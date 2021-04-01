import { Logger } from '@automagical/logger';
import { FanSpeeds, HassServices } from '../../typings';
import { BaseEntity } from './base.entity';

export type FanAttributes = {
  speed: FanSpeeds;
  speed_list: FanSpeeds[];
};

export class FanEntity extends BaseEntity {
  // #region Object Properties

  public attributes: FanAttributes;

  private readonly logger = Logger(FanEntity);

  // #endregion Object Properties

  // #region Public Methods

  public async setSpeed(speed: FanSpeeds): Promise<void> {
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
      speed,
    });
  }

  public async speedDown(): Promise<void> {
    const currentSpeed = this.attributes.speed as FanSpeeds;
    const availableSpeeds = this.attributes.speed_list as FanSpeeds[];
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === 0) {
      this.logger.debug(`Cannot speed down`);
      return;
    }
    return this.setSpeed(availableSpeeds[idx - 1]);
  }

  public async speedUp(): Promise<void> {
    const currentSpeed = this.attributes.speed;
    const availableSpeeds = this.attributes.speed_list;
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === availableSpeeds.length - 1) {
      this.logger.debug(`Cannot speed up`);
      return;
    }
    return this.setSpeed(availableSpeeds[idx + 1]);
  }

  public async turnOff(): Promise<void> {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }

  // #endregion Public Methods
}
