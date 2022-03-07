import { ScheduleActivateDTO } from '@automagical/controller-shared';
import { ICONS, PromptService, ToMenuEntry } from '@automagical/tty';
import { CronExpression, is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScheduleBuilderService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<ScheduleActivateDTO> = {},
  ): Promise<ScheduleActivateDTO> {
    const forceCustom =
      !is.empty(current.schedule) &&
      !Object.values(CronExpression).includes(
        current.schedule as CronExpression,
      );
    const schedule = forceCustom
      ? 'custom'
      : await this.promptService.menu({
          keyMap: {
            c: [`${ICONS.CREATE}Custom`, 'custom'],
          },
          right: ToMenuEntry(
            Object.keys(CronExpression).map(key => [key, CronExpression[key]]),
          ),
          value: current.schedule,
        });
    return {
      schedule:
        schedule !== 'custom'
          ? schedule
          : await this.promptService.cron(current.schedule),
    };
  }
}