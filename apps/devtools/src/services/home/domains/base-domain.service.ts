import { HassStateDTO } from '@automagical/home-assistant';
import { PromptMenuItems, PromptService } from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import { encode } from 'ini';

import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class BaseDomainService {
  constructor(
    protected readonly fetchService: HomeFetchService,
    protected readonly promptService: PromptService,
  ) {}

  public async processId(id: string): Promise<string> {
    const action = await this.promptService.menuSelect(this.getMenuOptions());
    switch (action) {
      case 'describe':
        await this.describe(id);
        return await this.processId(id);
      case 'changeFriendlyName':
        await this.changeFriendlyName(id);
        return await this.processId(id);
    }
    return action;
  }

  protected async changeFriendlyName(id: string): Promise<void> {
    const state = await this.getState(id);
    const name = await this.promptService.string(
      `New name`,
      state.attributes.friendly_name,
    );
    await this.fetchService.fetch({
      body: { name },
      method: 'put',
      url: `/entity/rename/${id}`,
    });
  }

  protected async describe(id: string): Promise<void> {
    const state = await this.getState(id);
    console.log(encode(state));
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      {
        name: 'Change Friendly Name',
        value: 'changeFriendlyName',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
    ];
  }

  protected async getState(id: string): Promise<HassStateDTO> {
    return await this.fetchService.fetch({
      url: `/entity/id/${id}`,
    });
  }
}
