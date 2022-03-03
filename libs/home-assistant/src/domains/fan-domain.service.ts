import { AutoLogService } from '@automagical/boilerplate';
import { FanStateDTO, HASS_DOMAINS } from '@automagical/home-assistant-shared';
import { Injectable } from '@nestjs/common';

import { EntityManagerService, HACallService } from '../services';

const MAX = 100;
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

  public async fanDirection(entityId?: string): Promise<void> {
    return await this.callService.call('set_direction', {
      entity_id: entityId,
    });
  }

  public async fanSpeedDown(
    entityId: string,
    waitForChange = false,
  ): Promise<void> {
    // return await this.decreaseSpeed(entityId);
    const { attributes } = this.entityManager.getEntity<FanStateDTO>(entityId);
    const currentSpeed = attributes.percentage;
    if (currentSpeed === START) {
      this.logger.warn(`Cannot speed down`);
      return;
    }
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
        percentage: currentSpeed - attributes.percentage_step,
      },
      undefined,
      waitForChange,
    );
  }

  public async fanSpeedUp(
    entityId: string,
    waitForChange = false,
  ): Promise<void> {
    // return await this.increaseSpeed(entityId);
    const { attributes } = this.entityManager.getEntity<FanStateDTO>(entityId);
    const currentSpeed = attributes.percentage;
    if (currentSpeed === MAX) {
      this.logger.warn(`Cannot speed up`);
      return;
    }
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
        percentage: currentSpeed + attributes.percentage_step,
      },
      undefined,
      waitForChange,
    );
  }

  public async oscillate(entityId?: string): Promise<void> {
    return await this.callService.call('oscillate', {
      entity_id: entityId,
    });
  }

  public async setPercentage(
    entityId: string,
    percentage: number,
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
        percentage,
      },
      undefined,
      waitForChange,
    );
  }

  public async setPresetMode(entityId?: string): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
    });
  }

  public async setSpeed(
    entityId: string,
    percentage: number,
    waitForChange = false,
  ): Promise<void> {
    await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
        percentage,
      },
      undefined,
      waitForChange,
    );
  }

  public async toggle(entityId?: string, waitForChange = false): Promise<void> {
    return await this.callService.call(
      'toggle',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async turnOff(
    entityId?: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_off',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async turnOn(entityId?: string, waitForChange = false): Promise<void> {
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }
}
