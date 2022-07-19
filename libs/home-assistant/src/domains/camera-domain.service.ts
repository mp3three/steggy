import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class CameraDomainService {
  constructor(private readonly call: HACallService) {
    call.domain = 'camera';
  }

  public async disableMotionDetection(
    entityId: string | string[],
  ): Promise<void> {
    return await this.call.call('disable_motion_detection', {
      entity_id: entityId,
    });
  }

  public async enableMotionDetection(
    entityId: string | string[],
  ): Promise<void> {
    return await this.call.call('enable_motion_detection', {
      entity_id: entityId,
    });
  }

  public async playStream(entityId: string | string[]): Promise<void> {
    return await this.call.call('play_stream', {
      entity_id: entityId,
    });
  }

  public async record(entityId: string | string[]): Promise<void> {
    return await this.call.call('record', {
      entity_id: entityId,
    });
  }

  public async snapshot(entityId: string | string[]): Promise<void> {
    return await this.call.call('snapshot', {
      entity_id: entityId,
    });
  }

  public async turnOff(entityId: string | string[]): Promise<void> {
    return await this.call.call('turn_off', {
      entity_id: entityId,
    });
  }

  public async turnOn(entityId: string | string[]): Promise<void> {
    return await this.call.call('turn_on', {
      entity_id: entityId,
    });
  }
}
