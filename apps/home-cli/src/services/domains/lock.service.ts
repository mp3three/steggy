import { Injectable } from '@nestjs/common';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { PromptEntry, ToMenuEntry } from '@steggy/tty';
import inquirer from 'inquirer';

import { ICONS } from '../../types';
import { BaseDomainService } from './base-domain.service';

@Injectable()
export class LockService extends BaseDomainService {
  public async createSaveCommand(
    entity_id: string,
    current?: GeneralSaveStateDTO,
  ): Promise<GeneralSaveStateDTO> {
    const state = await this.promptService.pickOne(
      `Set lock`,
      ToMenuEntry([
        ['Lock', 'locked'],
        ['Unlock', 'unlocked'],
      ]),
      current?.state,
    );
    return {
      ref: entity_id,
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
    await this.baseHeader(id);
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

  protected getMenuOptions(): PromptEntry[] {
    return [
      [`${ICONS.TURN_ON}Lock`, 'lock'],
      [`${ICONS.TURN_OFF}Unlock`, 'unlock'],
      new inquirer.Separator(),
      ...super.getMenuOptions(),
    ];
  }
}
