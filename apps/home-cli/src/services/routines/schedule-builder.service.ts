import { ScheduleActivateDTO } from '@automagical/controller-logic';
import { PromptEntry, PromptService } from '@automagical/tty';
import { CronExpression, TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
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
        ['Create', 'custom'],
        new inquirer.Separator(`pre-built`),
        ...(Object.keys(CronExpression).map((key) => [
          TitleCase(key),
          CronExpression[key],
        ]) as PromptEntry[]),
      ],
      current.schedule,
    );
    return {
      schedule:
        schedule !== 'custom'
          ? schedule
          : await this.promptService.string(`Cron schedule`),
    };
  }
}
