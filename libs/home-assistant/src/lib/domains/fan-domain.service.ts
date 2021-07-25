import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import {
  FanSpeeds,
  FanStateDTO,
  HASS_DOMAINS,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { EntityManagerService, HACallService } from '../services';

const availableSpeeds = [
  FanSpeeds.off,
  FanSpeeds.low,
  FanSpeeds.medium,
  FanSpeeds.medium_high,
  FanSpeeds.high,
];

/**
 * https://www.home-assistant.io/integrations/fan/
 */
@Injectable()
export class FanDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(FanDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
    private readonly entityManager: EntityManagerService,
  ) {
    callService.domain = HASS_DOMAINS.fan;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async decreaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('descrease_speed', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async fanDirection(entityId?: string): Promise<void> {
    return await this.callService.call('set_direction', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async fanSpeedDown(entityId: string): Promise<void> {
    const [{ attributes }] = this.entityManager.getEntity<FanStateDTO>([
      entityId,
    ]);
    const currentSpeed = attributes.speed;
    const index = availableSpeeds.indexOf(currentSpeed);
    this.logger.debug(
      `fanSpeedDown ${entityId}: ${currentSpeed} => ${
        availableSpeeds[index - 1]
      }`,
    );
    if (index === 0) {
      this.logger.debug(`Cannot speed down`);
      return;
    }
    return await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: availableSpeeds[index - 1],
    });
  }

  @Trace()
  public async fanSpeedUp(entityId: string): Promise<void> {
    const [{ attributes }] = this.entityManager.getEntity<FanStateDTO>([
      entityId,
    ]);
    const currentSpeed = attributes.speed;
    const index = availableSpeeds.indexOf(currentSpeed);
    this.logger.debug(
      `fanSpeedUp ${entityId}: ${currentSpeed} => ${
        availableSpeeds[index + 1]
      }`,
    );
    if (index === availableSpeeds.length - 1) {
      this.logger.debug(`Cannot speed up`);
      return;
    }
    return await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: availableSpeeds[index + 1],
    });
  }

  @Trace()
  public async increaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('increase_speed', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async oscillate(entityId?: string): Promise<void> {
    return await this.callService.call('oscillate', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setFan(
    entityId: string,
    speed: FanSpeeds | 'up' | 'down',
  ): Promise<void> {
    if (speed === 'up') {
      return await this.fanSpeedUp(entityId);
    }
    if (speed === 'down') {
      return await this.fanSpeedDown(entityId);
    }
    await this.callService.call('turn_on', {
      entity_id: entityId,
      speed: speed,
    });
  }

  @Trace()
  public async setPercentage(
    entityId: string,
    percentage: number,
  ): Promise<void> {
    return await this.callService.call('set_percentage', {
      entity_id: entityId,
      percentage,
    });
  }

  @Trace()
  public async setPresetMode(entityId?: string): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async toggle(entityId?: string): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entityId?: string): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOn(entityId?: string): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }

  // #endregion Public Methods
}
