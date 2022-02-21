import { AutoLogService } from '@automagical/boilerplate';
import {
  HASS_DOMAINS,
  LightAttributesDTO,
} from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { EntityService, HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/light/
 */
@Injectable()
export class LightDomainService extends EntityService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly callService: HACallService,
  ) {
    super();
    callService.domain = HASS_DOMAINS.light;
  }
  private CIRCADIAN_LIGHTING = new Set<string>();

  public async toggle(entityId: string | string[]): Promise<void> {
    this.trackEntity(entityId);
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  public async turnOff(entity_id: string | string[]): Promise<void> {
    if (is.string(entity_id)) {
      entity_id = [entity_id];
    }
    entity_id.forEach(id => {
      if (this.CIRCADIAN_LIGHTING.has(id)) {
        this.CIRCADIAN_LIGHTING.delete(id);
      }
    });
    this.trackEntity(entity_id);
    return await this.callService.call('turn_off', {
      entity_id,
    });
  }

  public async turnOn(
    entity_id: string | string[],
    settings: LightAttributesDTO = {},
    waitForChange = false,
  ): Promise<void> {
    this.trackEntity(entity_id);
    return await this.callService.call(
      'turn_on',
      {
        entity_id: entity_id,
        ...settings,
      },
      undefined,
      waitForChange,
    );
  }
}
