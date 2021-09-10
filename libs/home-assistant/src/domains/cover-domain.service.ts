import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/cover/
 */
@Injectable()
export class CoverDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.cover;
  }

  @Trace()
  public async close(entityId: string | string[]): Promise<void> {
    return await this.callService.call('close_cover', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async closeCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('close_cover_tilt', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async open(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open_cover', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async openCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open_cover_tilt', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async stop(entityId: string | string[]): Promise<void> {
    return await this.callService.call('stop_cover', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async stopCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('stop_cover_tilt', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async toggle(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async toggleTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle_tilt', {
      entity_id: entityId,
    });
  }
}
