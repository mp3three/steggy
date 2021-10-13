import { RoomEntitySaveStateDTO } from '@automagical/controller-logic';
import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class LockService extends BaseDomainService {
  public async createSaveState(
    entity_id: string,
  ): Promise<RoomEntitySaveStateDTO> {
    const state = await this.promptService.pickOne(`Set lock`, [
      'lock',
      'unlock',
    ]);
    return {
      entity_id,
      state,
    };
  }

  public async lock(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/lock`,
    });
  }

  public async processId(id: string, command?: string): Promise<string> {
    const action = await super.processId(id, command);
    switch (action) {
      case 'unlock':
        await this.unlock(id);
        return await this.processId(id, action);
      case 'lock':
        await this.lock(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async unlock(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/unlock`,
    });
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      { name: 'Lock', value: 'lock' },
      { name: 'Unlock', value: 'unlock' },
      new inquirer.Separator(),
      ...super.getMenuOptions(),
    ];
  }
}
