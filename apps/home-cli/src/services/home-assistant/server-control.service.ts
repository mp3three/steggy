import {
  ICONS,
  IsDone,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@text-based/tty';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { MENU_ITEMS } from '../../includes';
import { HomeFetchService } from '../home-fetch.service';

@Repl({
  category: 'Home Assistant',
  icon: ICONS.ADMIN,
  name: `Server Control`,
})
export class ServerControlService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultAction: string): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([
        new inquirer.Separator(chalk.white`Configuration validation`),
        [`Check configuration yaml`, 'check'],
        new inquirer.Separator(chalk.white`Server management`),
        [`Restart`, 'restart'],
        ['Stop', 'stop'],
        new inquirer.Separator(chalk.white`YAML configuration reloading`),
        ['Location & Customizations', 'location'],
        ['Automations', 'automation'],
        ['Input Booleans', 'input_boolean'],
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
        return await this.exec(action);
    }
    await this.fetchService.fetch({
      method: `post`,
      url: `/admin/reload/${action}`,
    });
    await this.exec(action);
  }

  private async checkConfig(): Promise<void> {
    const { result, errors } = await this.fetchService.fetch<{
      errors: string;
      result: string;
    }>({
      method: 'post',
      url: '/admin/server/check',
    });
    if (result === 'valid') {
      console.log(chalk.green.bold`${ICONS.EVENT} Configuration valid!`);
      return;
    }
    console.log(chalk.red.bold`${ICONS.WARNING} Configuration invalid`);
    console.log(errors);
  }
}
