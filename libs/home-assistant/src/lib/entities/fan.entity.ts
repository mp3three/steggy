import { HassServices } from '../../enums/hass-services.enum';
import logger from '../../log';
import { FanSpeeds } from '../../room/scene.room';
import { BaseEntity } from './base.entity';

const { log, warn, debug, error, develop } = logger('FanEntity');

export type FanAttributes = {
  speed: FanSpeeds;
  speed_list: FanSpeeds[];
};

export class FanEntity extends BaseEntity {
  public attributes: FanAttributes;

  public async setSpeed(speed: FanSpeeds) {
    return this.call(HassServices.turn_on, {
      entity_id: this.entityId,
      speed,
    });
  }

  public async speedDown() {
    const currentSpeed = this.attributes.speed as FanSpeeds;
    const availableSpeeds = this.attributes.speed_list as FanSpeeds[];
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === 0) {
      log(`Cannot speed down`);
      return;
    }
    return this.setSpeed(availableSpeeds[idx - 1]);
  }

  public async speedUp() {
    const currentSpeed = this.attributes.speed;
    const availableSpeeds = this.attributes.speed_list;
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === availableSpeeds.length - 1) {
      log(`Cannot speed up`);
      return;
    }
    return this.setSpeed(availableSpeeds[idx + 1]);
  }

  public async turnOff() {
    await super.turnOff();
    return this.call(HassServices.turn_off, {
      entity_id: this.entityId,
    });
  }
}
