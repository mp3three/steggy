import {
  HASS_DOMAINS,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/climate/
 */
@Injectable()
export class ClimateDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.climate;
  }

  @Trace()
  public async setAuxHeat<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
  ): Promise<T> {
    return await this.callService.call<T>('set_aux_heat', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setFanMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
  ): Promise<T> {
    return await this.callService.call<T>('set_fan_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setHumidity<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
  ): Promise<T> {
    return await this.callService.call<T>('set_humidity', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setHvacMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    hvac_mode: 'heat_cool' | 'off' | string,
  ): Promise<T> {
    return await this.callService.call<T>('set_hvac_mode', {
      entity_id: entityId,
      hvac_mode,
    });
  }

  @Trace()
  public async setPresetMode(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setSwingMode(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_swing_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setTemperature(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_temperature', {
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
}
