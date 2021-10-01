import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { HASS_DOMAINS, HassStateDTO } from '../contracts';
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
    aux_heat: string,
  ): Promise<T> {
    return await this.callService.call<T>('set_aux_heat', {
      aux_heat,
      entity_id: entityId,
    });
  }

  @Trace()
  public async setFanMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    fan_mode: 'auto' | 'on' | string,
  ): Promise<T> {
    return await this.callService.call<T>('set_fan_mode', {
      entity_id: entityId,
      fan_mode,
    });
  }

  @Trace()
  public async setHumidity<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    humidity: number,
  ): Promise<T> {
    return await this.callService.call<T>('set_humidity', {
      entity_id: entityId,
      humidity,
    });
  }

  @Trace()
  public async setHvacMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    hvac_mode: 'heat_cool' | 'heat' | 'cool' | 'off' | string,
  ): Promise<T> {
    return await this.callService.call<T>('set_hvac_mode', {
      entity_id: entityId,
      hvac_mode,
    });
  }

  @Trace()
  public async setPresetMode(
    entityId: string | string[],
    preset_mode: string,
  ): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
      preset_mode,
    });
  }

  @Trace()
  public async setSwingMode(
    entityId: string | string[],
    swing_mode: string,
  ): Promise<void> {
    return await this.callService.call('set_swing_mode', {
      entity_id: entityId,
      swing_mode,
    });
  }

  @Trace()
  public async setTemperature(
    entityId: string | string[],
    temperature: Partial<
      Record<'temperature' | 'target_temp_high' | 'target_temp_low', number>
    >,
  ): Promise<void> {
    return await this.callService.call('set_temperature', {
      entity_id: entityId,
      ...temperature,
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
