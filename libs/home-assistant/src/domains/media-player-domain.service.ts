import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/remote/
 */
@Injectable()
export class MediaPlayerDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.media_player;
  }

  public async mute(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'volume_mute',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async playPause(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'media_play',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async sendCommand(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'send_command',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async toggle(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
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
    entityId: string | string[],
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

  public async turnOn(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async volumeDown(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'volume_down',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async volumeUp(
    entityId: string | string[],
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'volume_up',
      {
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }
}
