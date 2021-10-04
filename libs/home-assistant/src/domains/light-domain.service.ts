import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HASS_DOMAINS } from '../contracts';
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

  @Trace()
  public async toggle(entityId: string | string[]): Promise<void> {
    this.trackEntity(entityId);
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    if (typeof entity_id === 'string') {
      entity_id = [entity_id];
    }
    entity_id.forEach((id) => {
      if (this.CIRCADIAN_LIGHTING.has(id)) {
        this.CIRCADIAN_LIGHTING.delete(id);
      }
    });
    this.trackEntity(entity_id);
    return await this.callService.call('turn_off', {
      entity_id,
    });
  }

  @Trace()
  public async turnOn(
    entity_id: string | string[],
    settings: {
      brightness?: number;
      hs_color?: [number, number] | number[];
      kelvin?: number;
    } = {},
  ): Promise<void> {
    this.trackEntity(entity_id);
    return await this.callService.call('turn_on', {
      entity_id: entity_id,
      ...settings,
    });
  }
}
