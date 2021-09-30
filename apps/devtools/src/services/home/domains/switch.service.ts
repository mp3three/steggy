import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class SwitchService extends BaseDomainService {
  public async processId(id: string): Promise<string> {
    const action = await super.processId(id);
    switch (action) {
      case 'turnOn':
        await this.turnOn(id);
        return await this.processId(id);
      case 'turnOff':
        await this.turnOff(id);
        return await this.processId(id);
    }
    return action;
  }

  public async turnOff(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/turnOff`,
    });
  }

  public async turnOn(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/turnOn`,
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
