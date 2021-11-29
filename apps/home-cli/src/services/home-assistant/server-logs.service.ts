import { HomeAssistantServerLogItem } from '@ccontour/home-assistant';
import { DONE, ICONS, PromptService, Repl } from '@ccontour/tty';
import { AutoLogService, IsEmpty, TitleCase } from '@ccontour/utilities';
import { NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { HomeFetchService } from '../home-fetch.service';

const LEVELS = new Map([
  ['ERROR', 'red'],
  ['WARNING', 'yellow'],
]);

@Repl({
  category: 'Home Assistant',
  icon: ICONS.LOGS,
  name: `Server Logs`,
})
export class ServerLogsService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async exec(defaultValue: string): Promise<void> {
    this.promptService.clear();
    this.promptService.scriptHeader(`Server Logs`);
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.LOGS}Show logs`, 'logs'],
        [`${ICONS.DELETE}Clear logs`, 'clear'],
        [`${ICONS.ANIMATION}Raw`, 'raw'],
      ],
      `Log commands`,
      defaultValue,
    );
    switch (action) {
      case DONE:
        return;
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
    if (IsEmpty(logs)) {
      this.logger.info(`No recent logs`);
      return;
    }
    const item = await this.promptService.menuSelect(
      logs.map((i) => [
        chalk.bold[LEVELS.get(i.level) ?? 'underline']`${i.message.join(
          chalk.cyan(' || '),
        )}`,
        i,
      ]),
      `More details`,
    );
    if (item === DONE) {
      return;
    }
    if (typeof item === 'string') {
      throw new NotImplementedException();
    }
    this.promptService.clear();
    this.promptService.scriptHeader(
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
        ...item.message.map((i) => chalk` {cyan -} ${i}`),
      ].join(`\n`),
    );
    await this.promptService.acknowledge();
  }

  private async rawLogs(): Promise<void> {
    const logs = await this.fetchService.fetch<HomeAssistantServerLogItem[]>({
      process: 'text',
      url: `/admin/server/raw-logs`,
    });
    console.log(logs);
    await this.promptService.acknowledge();
  }
}
