import { Injectable } from '@nestjs/common';

import { HASS_DOMAINS } from '../contracts';
import { HACallService } from '../services';

@Injectable()
export class HomeAssistantCoreService {
  constructor(private readonly callService: HACallService) {
    this.callService.domain = HASS_DOMAINS.homeassistant;
  }

  public async checkConfig(): Promise<void> {
    await this.callService.call('check_config');
  }

  public async reloadCoreConfig(): Promise<void> {
    await this.callService.call('reload_core_config');
  }

  public async reloadconfigEntry(): Promise<void> {
    await this.callService.call('reload_config_entry');
  }

  public async restart(): Promise<void> {
    await this.callService.call('restart');
  }

  public async setLocation(latitude: number, longitude: number): Promise<void> {
    await this.callService.call('set_location', { latitude, longitude });
  }

  public async stop(): Promise<void> {
    await this.callService.call('stop');
  }

  public async toggle(entityId: string | string[]): Promise<void> {
    await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  public async turnOff(entityId: string | string[]): Promise<void> {
    await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  public async turnOn(entityId: string | string[]): Promise<void> {
    await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }

  public async updateEntitiy(entityIds: string[]): Promise<void> {
    await this.callService.call('update_entity', {
      entity_id: entityIds,
    });
  }
}
