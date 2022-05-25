import { Injectable, NotImplementedException } from '@nestjs/common';
import { HomeAssistantServerLogItem } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  EnvironmentService,
  IsDone,
  PromptService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, START, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { HomeFetchService } from '../home-fetch.service';

const LEVELS = new Map([
  ['ERROR', 'red'],
  ['WARNING', 'yellow'],
]);

// @Repl({
//   category: 'Home Assistant',
//   icon: ICONS.LOGS,
//   name: `Server Logs`,
// })
@Injectable()
export class ServerLogsService {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly environmentService: EnvironmentService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public async exec(defaultValue: string): Promise<void> {
    this.applicationManager.setHeader('Server Logs');
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([
        [`${ICONS.LOGS}Show logs`, 'logs'],
        [`${ICONS.DELETE}Clear logs`, 'clear'],
        [`${ICONS.ANIMATION}Raw`, 'raw'],
      ]),
      rightHeader: `Log commands`,
      showHeaders: false,
      value: defaultValue,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'clear':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/admin/logs`,
        });
        return await this.exec(action);
      case 'logs':
        await this.getLogs();
        return await this.exec(action);
      case 'raw':
        await this.rawLogs();
        return await this.exec(action);
    }
    throw new NotImplementedException();
  }

  private async getLogs(): Promise<void> {
    const logs = await this.fetchService.fetch<HomeAssistantServerLogItem[]>({
      url: `/admin/server/logs`,
    });
    if (is.empty(logs)) {
      this.logger.info(`No recent logs`);
      return;
    }
    const width = (await this.environmentService.getDimensions()).width;
    const item = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry(
        logs.map(i => [
          chalk.bold[LEVELS.get(i.level) ?? 'underline']`${i.message
            .join(chalk.cyan(' || '))
            .slice(START, width)}`,
          i,
        ]),
      ),
      rightHeader: `More details`,
    });
    if (IsDone(item)) {
      return;
    }
    if (is.string(item)) {
      throw new NotImplementedException();
    }
    this.applicationManager.setHeader(
      TitleCase(item.level.toLowerCase()),
      LEVELS.get(item.level),
    );
    console.log(
      [
        chalk`{bold Logger:} ${item.name}`,
        chalk`{bold Source:} ${item.source.join(':')}`,
        chalk`{bold First occurred:} ${dayjs(item.first_occurred).format(
          'YYYY-MM-DD hh:mm:ss A',
        )} (${item.count} occurrences)`,
        chalk`{bold Last logged:} ${dayjs(item.timestamp).format(
          'YYYY-MM-DD hh:mm:ss A',
        )}`,
        ``,
        ...item.message.map(i => chalk` {cyan -} ${i.trim()}`),
      ].join(`\n`),
    );
    await this.promptService.acknowledge();
  }

  private async rawLogs(): Promise<void> {
    const logs = await this.fetchService.fetch<string>({
      process: 'text',
      url: `/admin/server/raw-logs`,
    });
    await this.promptService.editor(`(READONLY) View logs in editor`, logs);
  }
}
