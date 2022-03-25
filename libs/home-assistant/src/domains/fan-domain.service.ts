import { AutoLogService } from '@automagical/boilerplate';
import { FanStateDTO, HASS_DOMAINS } from '@automagical/home-assistant-shared';
import { START } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { EntityManagerService, HACallService } from '../services';

const MAX = 100;
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
    // useFanSpeed = false,
    waitForChange = false,
  ): Promise<void> {
    const { attributes } = this.entityManager.getEntity<FanStateDTO>(entityId);
    // if (useFanSpeed) {
    //   const { speed_list, speed } = attributes;
    //   const index = speed_list.indexOf(speed);
    //   if (index === START) {
    //     this.logger.warn(`Cannot speed down`);
    //     return;
    //   }
    //   return await this.callService.call(
    //     'turn_on',
    //     {
    //       entity_id: entityId,
    //       speed: speed_list[index - INCREMENT],
    //     },
    //     undefined,
    //     waitForChange,
    //   );
    // }
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
    // useFanSpeed = false,
    waitForChange = false,
  ): Promise<void> {
    const { attributes } = this.entityManager.getEntity<FanStateDTO>(entityId);
    // if (useFanSpeed) {
    //   const { speed_list, speed } = attributes;
    //   const index = speed_list.indexOf(speed);
    //   if (index === speed_list.length - ARRAY_OFFSET) {
    //     this.logger.warn(`Cannot speed up`);
    //     return;
    //   }
    //   return await this.callService.call(
    //     'turn_on',
    //     {
    //       entity_id: entityId,
    //       speed: speed_list[index + INCREMENT],
    //     },
    //     undefined,
    //     waitForChange,
    //   );
    // }
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
      { entity_id: entityId, percentage },
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
    speed: string,
    waitForChange = false,
  ): Promise<void> {
    await this.callService.call(
      'turn_on',
      { entity_id: entityId, speed },
      undefined,
      waitForChange,
    );
  }

  public async toggle(entityId?: string, waitForChange = false): Promise<void> {
    return await this.callService.call(
      'toggle',
      { entity_id: entityId },
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
      { entity_id: entityId },
      undefined,
      waitForChange,
    );
  }

  public async turnOn(entityId?: string, waitForChange = false): Promise<void> {
    return await this.callService.call(
      'turn_on',
      { entity_id: entityId },
      undefined,
      waitForChange,
    );
  }
}
