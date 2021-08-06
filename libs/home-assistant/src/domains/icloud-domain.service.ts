import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

@Injectable()
export class iCloudDomainService {
  // #region Constructors

  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.icloud;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async displayMessage(): Promise<void> {
    await this.callService.call('display_message');
  }

  @Trace()
  public async lostDevice(): Promise<void> {
    await this.callService.call('lost_device');
  }

  @Trace()
  public async playSound(account: string, deviceName: string): Promise<void> {
    await this.callService.call('play_sound', {
      account,
      device_name: deviceName,
    });
  }

  @Trace()
  public async update(): Promise<void> {
    await this.callService.call('update');
  }

  // #endregion Public Methods
}
