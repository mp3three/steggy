import { HASS_DOMAINS } from '@automagical/home-assistant-shared';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class iCloudDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.icloud;
  }

  public async displayMessage(): Promise<void> {
    await this.callService.call('display_message');
  }

  public async lostDevice(): Promise<void> {
    await this.callService.call('lost_device');
  }

  public async playSound(account: string, deviceName: string): Promise<void> {
    await this.callService.call('play_sound', {
      account,
      device_name: deviceName,
    });
  }

  public async update(): Promise<void> {
    await this.callService.call('update');
  }
}
