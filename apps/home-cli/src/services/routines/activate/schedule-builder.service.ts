import { Injectable } from '@nestjs/common';
import { ScheduleActivateDTO } from '@steggy/controller-shared';
import { PromptService, ToMenuEntry } from '@steggy/tty';
import { CronExpression, is } from '@steggy/utilities';

import { ICONS } from '../../../types';

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
          : await this.promptService.string(current.schedule),
    };
  }
}
