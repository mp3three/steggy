import { Injectable } from '@nestjs/common';
import { KunamiCodeActivateDTO } from '@text-based/controller-logic';
import { HASS_DOMAINS } from '@text-based/home-assistant';
import { PromptService } from '@text-based/tty';
import { AutoLogService, is } from '@text-based/utilities';
import chalk from 'chalk';

import { EntityService } from '../../home-assistant/entity.service';
import { HomeFetchService } from '../../home-fetch.service';

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
    current: Partial<KunamiCodeActivateDTO> = {},
    sensorList: string[] = [],
  ): Promise<KunamiCodeActivateDTO> {
    current.sensor = !is.empty(sensorList)
      ? await this.entityService.pickOne(sensorList, current.sensor)
      : await this.entityService.pickInDomain(
          [HASS_DOMAINS.sensor],
          [],
          current.sensor,
        );
    const type = await this.promptService.pickOne(`How to enter values?`, [
      ...this.promptService.conditionalEntries(!is.empty(current.match), [
        ['Keep current states', 'keep'],
      ]),
      ['Record state changes', 'record'],
      ['Manual entry', 'manual'],
    ]);

    const reset = await this.getReset(current.reset);
    if (reset !== 'none') {
      current.reset = reset;
    }
    if (type !== 'keep') {
      current.match =
        type === 'record'
          ? await this.recordEvents(current.sensor)
          : await this.manualEntry(current.match);
    }
    return current as KunamiCodeActivateDTO;
  }

  private async getReset(
    reset: 'self' | 'none' | 'sensor',
  ): Promise<'self' | 'none' | 'sensor'> {
    const out = await this.promptService.pickOne<
      'self' | 'none' | 'sensor' | 'help'
    >(
      `Sequence reset`,
      [
        ['None', 'none'],
        ['Self', 'self'],
        ['Sensor', 'sensor'],
        ['Help', 'help'],
      ],
      reset,
    );
    if (out === 'help') {
      console.log(
        [
          chalk`{magenta.bold Sequence resets modify the way the kunami matcher logic works.}`,
          chalk`{cyan By default, if an entity state changes twice within} {yellow.bold 1500ms} {yellow (configurable)}{cyan , the matcher will add the state to the in-progress code and reset the timer.}`,
          ``,
          chalk`{cyan Sequence resets provide the ability to short-circut that} {yellow.bold 1500ms} {cyan timeout. Uses include:}`,
          chalk`{cyan -} Rapid repeat triggering`,
          chalk`    {cyan -} {bold Self reset}: {cyan reset the timer for only this matcher}`,
          chalk`{cyan -} Complex input patterns`,
          chalk`    {cyan -} {bold Sensor reset}: {cyan reset the timer for all matchers on the same sensor} {gray (crosses routines)}`,
          chalk`{blue > }{bold.blue None} {blue should be used most of the time}`,
          ``,
        ].join(`\n`),
      );
      return await this.getReset(reset);
    }
    return out;
  }

  private async manualEntry(current: string[]): Promise<string[]> {
    const out = await this.promptService.editor(
      `Newline separated list of states`,
      current.join(`\n`),
    );
    return out.split(`\n`);
  }

  private async recordEvents(sensor: string): Promise<string[]> {
    const duration = await this.promptService.number(
      `Seconds to record`,
      DEFAULT_RECORD_DURATION,
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
