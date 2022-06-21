import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class HumidifierDomain {
  constructor(private readonly callService: HACallService) {
    callService.domain = 'humidifier';
  }

  public async setHumidity(entityId: string, humidity: number): Promise<void> {
    await this.callService.call('set_humidity', {
      entity_id: entityId,
      humidity,
    });
  }

  public async setMode(entityId: string, mode: string): Promise<void> {
    await this.callService.call('set_mode', {
      entity_id: entityId,
      mode,
    });
  }

  public async toggle(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
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
