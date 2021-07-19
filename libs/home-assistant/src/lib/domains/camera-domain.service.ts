import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class CameraDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(CameraDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    callService.domain = HASS_DOMAINS.camera;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async disableMotionDetection(entityId: string | string[]): Promise<void> {
    return await this.callService.call('disable_motion_detection', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async enableMotionDetection(entityId: string | string[]): Promise<void> {
    return await this.callService.call('enable_motion_detection', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async playStream(entityId: string | string[]): Promise<void> {
    return await this.callService.call('play_stream', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async record(entityId: string | string[]): Promise<void> {
    return await this.callService.call('record', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async snapshot(entityId: string | string[]): Promise<void> {
    return await this.callService.call('snapshot', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOn(entityId: string | string[]): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }

  // #endregion Public Methods
}
