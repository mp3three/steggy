import { KunamiCodeActivateDTO } from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import { PromptService } from '@automagical/tty';
import { AutoLogService, sleep } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { EntityService } from '../entity.service';
import { HomeFetchService } from '../home-fetch.service';

const DEFAULT_RECORD_DURATION = 5;

@Injectable()
export class KunamiBuilderService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async build(
    current?: KunamiCodeActivateDTO,
  ): Promise<KunamiCodeActivateDTO> {
    const sensor = await this.entityService.pickOne([HASS_DOMAINS.sensor]);
    const type = await this.promptService.pickOne(`How to enter values?`, [
      ['Record', 'record'],
      ['Manual', 'manual'],
    ]);
    const reset = await this.promptService.pickOne<'self' | 'none' | 'sensor'>(
      `Sequence reset`,
      [
        ['None', 'none'],
        ['Self', 'self'],
        ['Sensor', 'sensor'],
      ],
    );
    return {
      match:
        type === 'record'
          ? await this.recordEvents(sensor)
          : await this.manualEntry(current.match),
      reset: reset === 'none' ? undefined : reset,
      sensor,
    };
  }

  private async manualEntry(current: string[]): Promise<string[]> {
    const out = await this.promptService.editor(
      `Newline separated list of states`,
      current.join(`\n`),
    );
    return out.split(`\n`);
  }

  private async recordEvents(sensor: string): Promise<string[]> {
    await sleep();
    const duration = await this.promptService.number(
      `Record state changes from ${sensor}`,
      DEFAULT_RECORD_DURATION,
      { suffix: `seconds` },
    );
    console.log(chalk.green(`Recording`));
    const match = await this.fetchService.fetch<string[]>({
      body: { duration },
      method: 'post',
      url: `/entity/record/${sensor}`,
    });
    console.log(chalk.red(`Done`));
    this.logger.debug({ match }, `Observed states`);
    return match;
  }
}
