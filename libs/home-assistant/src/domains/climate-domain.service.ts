import { Injectable } from '@nestjs/common';
import { HASS_DOMAINS, HassStateDTO } from '@automagical/home-assistant-shared';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/climate/
 */
@Injectable()
export class ClimateDomainService {
  constructor(private readonly callService: HACallService) {
    callService.domain = HASS_DOMAINS.climate;
  }

  public async setAuxHeat<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    aux_heat: string,
    waitForChange = false,
  ): Promise<T> {
    return await this.callService.call<T>(
      'set_aux_heat',
      {
        aux_heat,
        entity_id: entityId,
      },
      undefined,
      waitForChange,
    );
  }

  public async setFanMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    fan_mode: 'auto' | 'on' | string,
    waitForChange = false,
  ): Promise<T> {
    return await this.callService.call<T>(
      'set_fan_mode',
      {
        entity_id: entityId,
        fan_mode,
      },
      undefined,
      waitForChange,
    );
  }

  public async setHumidity<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    humidity: number,
    waitForChange = false,
  ): Promise<T> {
    return await this.callService.call<T>(
      'set_humidity',
      {
        entity_id: entityId,
        humidity,
      },
      undefined,
      waitForChange,
    );
  }

  public async setHvacMode<T extends HassStateDTO = HassStateDTO>(
    entityId: string | string[],
    hvac_mode: 'heat_cool' | 'heat' | 'cool' | 'off' | string,
    waitForChange = false,
  ): Promise<T> {
    return await this.callService.call<T>(
      'set_hvac_mode',
      {
        entity_id: entityId,
        hvac_mode,
      },
      undefined,
      waitForChange,
    );
  }

  public async setPresetMode(
    entityId: string | string[],
    preset_mode: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'set_preset_mode',
      {
        entity_id: entityId,
        preset_mode,
      },
      undefined,
      waitForChange,
    );
  }

  public async setSwingMode(
    entityId: string | string[],
    swing_mode: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'set_swing_mode',
      {
        entity_id: entityId,
        swing_mode,
      },
      undefined,
      waitForChange,
    );
  }

  public async setTemperature(
    entityId: string | string[],
    temperature: Partial<
      Record<'temperature' | 'target_temp_high' | 'target_temp_low', number>
    >,
    waitForChange = false,
  ): Promise<void> {
    return await this.callService.call(
      'set_temperature',
      {
        entity_id: entityId,
        ...temperature,
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
}
