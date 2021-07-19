import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class HomeAssistantCoreService {
  // #region Constructors

  constructor(
    @InjectLogger(HomeAssistantCoreService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {
    this.callService.domain = HASS_DOMAINS.homeassistant;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async checkConfig(): Promise<void> {
    await this.callService.call('check_config');
  }

  @Trace()
  public async reloadCoreConfig(): Promise<void> {
    await this.callService.call('reload_core_config');
  }

  @Trace()
  public async reloadconfigEntry(): Promise<void> {
    await this.callService.call('reload_config_entry');
  }

  @Trace()
  public async restart(): Promise<void> {
    await this.callService.call('restart');
  }

  @Trace()
  public async setLocation(latitude: number, longitude: number): Promise<void> {
    await this.callService.call('set_location', { latitude, longitude });
  }

  @Trace()
  public async stop(): Promise<void> {
    await this.callService.call('stop');
  }

  @Trace()
  public async toggle(entityId: string): Promise<void> {
    await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entityId: string): Promise<void> {
    await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOn(entityId: string): Promise<void> {
    await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async updateEntitiy(entityIds: string[]): Promise<void> {
    await this.callService.call('update_entity', {
      entity_id: entityIds,
    });
  }

  // #endregion Public Methods
}
