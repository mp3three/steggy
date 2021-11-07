import { Injectable } from '@nestjs/common';

import { HASS_DOMAINS } from '../contracts';
import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/cover/
 */
@Injectable()
export class CoverDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.cover;
  }

  public async close(entityId: string | string[]): Promise<void> {
    return await this.callService.call('close_cover', {
      entity_id: entityId,
    });
  }

  public async closeCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('close_cover_tilt', {
      entity_id: entityId,
    });
  }

  public async open(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open_cover', {
      entity_id: entityId,
    });
  }

  public async openCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('open_cover_tilt', {
      entity_id: entityId,
    });
  }

  public async stop(entityId: string | string[]): Promise<void> {
    return await this.callService.call('stop_cover', {
      entity_id: entityId,
    });
  }

  public async stopCoverTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('stop_cover_tilt', {
      entity_id: entityId,
    });
  }

  public async toggle(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  public async toggleTilt(entityId: string | string[]): Promise<void> {
    return await this.callService.call('toggle_tilt', {
      entity_id: entityId,
    });
  }
}
