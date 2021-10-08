import {
  GroupDTO,
  PersistenceLightStateDTO,
} from '@automagical/controller-logic';
import { PromptMenuItems, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';

const MIN_BRIGHTNESS = 1;
const MAX_BRIGHTNESS = 255;

@Injectable()
export class LightGroupCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async groupActions(): Promise<PromptMenuItems> {
    return await [
      {
        name: 'Turn On',
        value: 'turnOn',
      },
      {
        name: 'Turn Off',
        value: 'turnOff',
      },
      {
        name: 'Circadian On',
        value: 'circadian',
      },
      {
        name: 'Dim Up',
        value: 'dimUp',
      },
      {
        name: 'Dim Down',
        value: 'dimDown',
      },
      {
        name: 'Set Brightness',
        value: 'brightness',
      },
      new inquirer.Separator(),
    ];
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    const passThrough = ['turnOn', 'turnOff', 'circadian', 'dimUp', 'dimDown'];
    if (passThrough.includes(action)) {
      await this.fetchService.fetch({
        method: 'put',
        url: `/group/${group._id}/activate/${action}`,
      });
      return;
    }
    if (action === 'brightness') {
      group = await this.fetchService.fetch({
        url: `/group/${group._id}`,
      });
      let current = 0;
      const onList = (group as GroupDTO<PersistenceLightStateDTO>).state.filter(
        (item) => item.state === 'on',
      );
      onList.forEach((item) => {
        current += item.brightness;
      });
      current = Math.floor(current / onList.length);
      const brightness = await this.promptService.number(
        `Brightness target (${MIN_BRIGHTNESS}-${MAX_BRIGHTNESS})`,
        current,
      );
      if (brightness > MAX_BRIGHTNESS || brightness < MIN_BRIGHTNESS) {
        this.logger.error(
          { brightness },
          `Out of range ${MIN_BRIGHTNESS}-${MAX_BRIGHTNESS}`,
        );
        return;
      }
      await this.fetchService.fetch({
        body: {
          brightness,
        },
        method: 'put',
        url: `/group/${group._id}/expand`,
      });
      return;
    }
    this.logger.error({ action }, `Unknown action`);
  }
}
