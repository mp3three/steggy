import { Injectable } from '@nestjs/common';
import { ARRAY_OFFSET, AutoLogService } from '@text-based/utilities';

import { FanSpeeds, FanStateDTO, HASS_DOMAINS } from '../contracts';
import { EntityManagerService, HACallService } from '../services';

const availableSpeeds = [
  FanSpeeds.off,
  FanSpeeds.low,
  FanSpeeds.medium,
  FanSpeeds.medium_high,
  FanSpeeds.high,
];
const START = 0;

/**
 * https://www.home-assistant.io/integrations/fan/
 */
@Injectable()
export class FanDomainService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly callService: HACallService,
    private readonly entityManager: EntityManagerService,
  ) {
    callService.domain = HASS_DOMAINS.fan;
  }

  public async decreaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('descrease_speed', {
      entity_id: entityId,
    });
  }

  public async fanDirection(entityId?: string): Promise<void> {
    return await this.callService.call('set_direction', {
      entity_id: entityId,
    });
  }

  public async fanSpeedDown(entityId: string): Promise<void> {
    const { attributes } = this.entityManager.getEntity<FanStateDTO>(entityId);
    const currentSpeed = attributes.speed;
    const index = availableSpeeds.indexOf(currentSpeed);
    this.logger.info(
      `[${entityId}] ${currentSpeed} => ${
        availableSpeeds[index - ARRAY_OFFSET]
      }`,
    );
    if (index === START) {
      this.logger.warn(`Cannot speed down`);
      return;
    }
    return await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: availableSpeeds[index - ARRAY_OFFSET],
    });
  }

  public async fanSpeedUp(entityId: string): Promise<void> {
    const [{ attributes }] = this.entityManager.getEntities<FanStateDTO>([
      entityId,
    ]);
    const currentSpeed = attributes.speed;
    const index = availableSpeeds.indexOf(currentSpeed);
    this.logger.info(
      `[${entityId}] ${currentSpeed} => ${
        availableSpeeds[index + ARRAY_OFFSET]
      }`,
    );
    if (index === availableSpeeds.length - ARRAY_OFFSET) {
      this.logger.warn(`Cannot speed up`);
      return;
    }
    return await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: availableSpeeds[index + ARRAY_OFFSET],
    });
  }

  public async increaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('increase_speed', {
      entity_id: entityId,
    });
  }

  public async oscillate(entityId?: string): Promise<void> {
    return await this.callService.call('oscillate', {
      entity_id: entityId,
    });
  }

  public async setPercentage(
    entityId: string,
    percentage: number,
  ): Promise<void> {
    return await this.callService.call('set_percentage', {
      entity_id: entityId,
      percentage,
    });
  }

  public async setPresetMode(entityId?: string): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
    });
  }

  public async setSpeed(
    entityId: string,
    speed: FanSpeeds | 'fanSpeedUp' | 'fanSpeedDown',
  ): Promise<void> {
    if (speed === 'fanSpeedUp') {
      return await this.fanSpeedUp(entityId);
    }
    if (speed === 'fanSpeedDown') {
      return await this.fanSpeedDown(entityId);
    }
    await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: speed,
    });
  }

  public async toggle(entityId?: string): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  public async turnOff(entityId?: string): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  public async turnOn(entityId?: string): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }
}
