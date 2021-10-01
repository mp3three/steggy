import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class LockService extends BaseDomainService {
  public async lock(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/lock`,
    });
  }

  public async processId(id: string): Promise<string> {
    const action = await super.processId(id);
    switch (action) {
      case 'unlock':
        await this.unlock(id);
        return await this.processId(id);
      case 'lock':
        await this.lock(id);
        return await this.processId(id);
    }
    return action;
  }

  public async unlock(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/unlock`,
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
