import { ScheduleActivateDTO } from '@ccontour/controller-logic';
import { ICONS, PromptEntry, PromptService } from '@ccontour/tty';
import { CronExpression } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

@Injectable()
export class ScheduleBuilderService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<ScheduleActivateDTO> = {},
  ): Promise<ScheduleActivateDTO> {
    const schedule = await this.promptService.pickOne(
      `Activation schedule`,
      [
        [`${ICONS.CREATE}Create`, 'custom'],
        new inquirer.Separator(chalk.white`pre-built`),
        ...(Object.keys(CronExpression).map((key) => [
          key,
          CronExpression[key],
        ]) as PromptEntry[]),
      ],
      current.schedule,
    );
    if (schedule === 'custom') {
      const PADDING = '                 ';
      console.log(
        [
          ``,
          chalk.bold.white`Comma separate multiple values`,
          chalk`   {cyan Ex:} 1,2,3,4 * * * *`,
          ``,
          chalk.bold.white`Value ranges`,
          chalk`   {cyan Ex:} 1-5 * * * *`,
          ``,
          chalk.bold.white`Step values`,
          chalk`   {cyan Ex:} 1-10/2 = 2,4,6,8,10`,
          chalk`   {cyan Ex:} */2 = every other`,
          ``,
          chalk`${PADDING}{cyan ┌──────────────} {white.bold second (optional)} {gray 0-59}`,
          chalk`${PADDING}{cyan │ ┌────────────} {white.bold minute}            {gray 0-59}`,
          chalk`${PADDING}{cyan │ │ ┌──────────} {white.bold hour}              {gray 0-23}`,
          chalk`${PADDING}{cyan │ │ │ ┌────────} {white.bold day of month}      {gray 1-31}`,
          chalk`${PADDING}{cyan │ │ │ │ ┌──────} {white.bold month}             {gray 1-12 or names}`,
          chalk`${PADDING}{cyan │ │ │ │ │ ┌────} {white.bold day of week}       {gray 0-7 or names}{cyan ,} {gray 0 & 7 = Sun}`,
          chalk`${PADDING}{cyan │ │ │ │ │ │}`,
        ].join(`\n`),
      );
    }
    return {
      schedule:
        schedule !== 'custom'
          ? schedule
          : await this.createSchedule(current.schedule ?? '* * * * * *'),
    };
  }

  public async createSchedule(current: string): Promise<string> {
    const schedule = await this.promptService.string(`Cron schedule`, current);
    // TODO: validate schedule
    return schedule;
  }
}
