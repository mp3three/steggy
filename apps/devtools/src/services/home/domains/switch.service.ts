import { RoomEntitySaveStateDTO } from '@automagical/controller-logic';
import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class SwitchService extends BaseDomainService {
  public async createSaveState(
    entity_id: string,
  ): Promise<RoomEntitySaveStateDTO> {
    const state = await this.promptService.pickOne(`Set state`, [
      'turnOn',
      'turnOff',
    ]);
    return {
      entity_id,
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

  protected getMenuOptions(): PromptMenuItems {
    return [
      ...this.promptService.itemsFromObject({
        'Turn Off': 'turnOff',
        'Turn On': 'turnOn',
      }),
      new inquirer.Separator(),
      ...super.getMenuOptions(),
    ];
  }
}
