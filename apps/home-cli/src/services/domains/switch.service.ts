import { RoomEntitySaveStateDTO } from '@automagical/controller-logic';
import { ICONS, PromptEntry } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class SwitchService extends BaseDomainService {
  public async createSaveCommand(
    entity_id: string,
    current?: RoomEntitySaveStateDTO,
  ): Promise<RoomEntitySaveStateDTO> {
    const state = await this.promptService.pickOne(
      entity_id,
      [
        [`${ICONS.TURN_ON}Turn On`, 'on'],
        [`${ICONS.TURN_OFF}Turn Off`, 'off'],
        [`${ICONS.TOGGLE_ON}Toggle`, 'toggle'],
      ],
      current?.state,
    );
    return {
      ref: entity_id,
      state,
    };
  }

  public async processId(id: string, command?: string): Promise<string> {
    const action = await super.processId(id, command);
    switch (action) {
      case 'turnOn':
        await this.turnOn(id);
        return await this.processId(id, action);
      case 'turnOff':
        await this.turnOff(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async turnOff(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/turnOff`,
    });
  }

  public async turnOn(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/turnOn`,
    });
  }

  protected getMenuOptions(): PromptEntry[] {
    return [
      ['Turn On', 'turnOn'],
      ['Turn Off', 'turnOff'],
      ...super.getMenuOptions(),
    ];
  }
}
