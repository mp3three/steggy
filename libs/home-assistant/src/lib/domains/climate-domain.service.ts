import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/climate/
 */
@Injectable()
export class ClimateDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(ClimateDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    callService.domain = HASS_DOMAINS.climate;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async setAuxHeat(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_aux_heat', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setFanMode(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_fan_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setHumidity(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_humidity', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setHvacMode(entityId: string | string[]): Promise<void> {
    return await this.callService.call('set_hvac_mode', {
      entity_id: entityId,
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

  // #endregion Public Methods
}
