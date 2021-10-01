import { HassStateDTO } from '@automagical/home-assistant';
import { PromptMenuItems, PromptService } from '@automagical/tty';
import { AutoLogService, sleep } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { encode } from 'ini';

import { HomeFetchService } from '../home-fetch.service';

const DELAY = 100;
@Injectable()
export class BaseDomainService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly fetchService: HomeFetchService,
    protected readonly promptService: PromptService,
  ) {}

  public async processId(id: string): Promise<string> {
    const action = await this.promptService.menuSelect(
      this.getMenuOptions(),
      `Action`,
    );
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

  protected async baseHeader<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    await sleep(DELAY);
    const content = await this.getState<T>(id);
    const header = `  ${content.attributes.friendly_name}  `;
    const padding = ' '.repeat(header.length);
    console.log(
      [chalk.bgCyan.black([padding, header, padding].join(`\n`)), ``].join(
        `\n`,
      ),
    );
    return content;
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

  protected async getState<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    return await this.fetchService.fetch<T>({
      url: `/entity/id/${id}`,
    });
  }
}
