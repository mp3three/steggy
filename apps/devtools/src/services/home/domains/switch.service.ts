import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class SwitchService extends BaseDomainService {
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
      { name: 'Turn on', value: 'turnOn' },
      { name: 'Turn off', value: 'turnOff' },
      new inquirer.Separator(),
      ...super.getMenuOptions(),
    ];
  }
}
