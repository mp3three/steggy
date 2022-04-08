import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';

import { HACallService } from '../services';

@Injectable()
export class CameraDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.camera;
  }

  public async disableMotionDetection(
    entityId: string | string[],
  ): Promise<void> {
    return await this.callService.call('disable_motion_detection', {
      entity_id: entityId,
    });
  }

  public async enableMotionDetection(
    entityId: string | string[],
  ): Promise<void> {
    return await this.callService.call('enable_motion_detection', {
      entity_id: entityId,
    });
  }

  public async playStream(entityId: string | string[]): Promise<void> {
    return await this.callService.call('play_stream', {
      entity_id: entityId,
    });
  }

  public async record(entityId: string | string[]): Promise<void> {
    return await this.callService.call('record', {
      entity_id: entityId,
    });
  }

  public async snapshot(entityId: string | string[]): Promise<void> {
    return await this.callService.call('snapshot', {
      entity_id: entityId,
    });
  }

  public async turnOff(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  public async turnOn(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }
}
