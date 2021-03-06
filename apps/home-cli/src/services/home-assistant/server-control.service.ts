import { Injectable } from '@nestjs/common';
import {
  ApplicationManagerService,
  IsDone,
  PromptService,
  ScreenService,
  ToMenuEntry,
} from '@steggy/tty';
import chalk from 'chalk';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { HomeFetchService } from '../home-fetch.service';

// @Repl({
//   category: 'Home Assistant',
//   icon: ICONS.ADMIN,
//   name: `Server Control`,
// })
@Injectable()
export class ServerControlService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
  ) {}

  public async exec(defaultAction?: string): Promise<void> {
    this.applicationManager.setHeader(`Hass Control`);
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([
        [`Check configuration yaml`, 'check'],
        [`Restart`, 'restart'],
        ['Stop', 'stop'],
        ['Location & Customizations', 'location'],
        ['Automations', 'automation'],
        ['Input Boolean', 'input_boolean'],
        ['Input Date Times', 'input_datetime'],
        ['Input Numbers', 'input_number'],
        ['Input Selects', 'input_select'],
        ['Input Texts', 'input_text'],
        ['Manually Configured MQTT Entities', 'mqtt'],
        ['People', 'person'],
        ['Scenes', 'scene'],
        ['Scripts', 'script'],
        ['Timer', 'timer'],
        ['Zones', 'zone'],
      ]),
      rightHeader: `Command`,
      showHeaders: false,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'check':
        await this.checkConfig();
        return await this.exec(action);
      case 'restart':
      case 'stop':
        await this.fetchService.fetch({
          method: `post`,
          url: `/admin/server/${action}`,
        });
        await this.promptService.acknowledge();
        return await this.exec(action);
    }
    await this.fetchService.fetch({
      method: `post`,
      url: `/admin/reload/${action}`,
    });
    await this.promptService.acknowledge();
    await this.exec(action);
  }

  private async checkConfig(): Promise<void> {
    const { result, errors } = await this.fetchService.fetch<{
      errors: string;
      result: string;
    }>({
      method: 'post',
      url: `/admin/server/check`,
    });
    if (result === 'valid') {
      this.screenService.printLine(
        chalk.green.bold`${ICONS.EVENT} Configuration valid!`,
      );
      await this.promptService.acknowledge();
      return;
    }
    this.screenService.printLine(
      chalk.red.bold`${ICONS.WARNING} Configuration invalid`,
    );
    this.screenService.printLine(errors);
    await this.promptService.acknowledge();
  }
}
