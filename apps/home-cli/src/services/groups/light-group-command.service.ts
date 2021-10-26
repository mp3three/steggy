import {
  GroupDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import { PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';

const MIN_BRIGHTNESS = 5;
const MAX_BRIGHTNESS = 255;

@Injectable()
export class LightGroupCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}
  public async dimDown(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/activate/dimDown`,
    });
  }

  public async dimUp(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/activate/dimUp`,
    });
  }

  public async groupActions(): Promise<PromptEntry[]> {
    return await [
      ['Turn On', 'turnOn'],
      ['Turn Off', 'turnOff'],
      ['Circadian On', 'circadian'],
      ['Dim Up', 'dimUp'],
      ['Dim Down', 'dimDown'],
      ['Set Brightness', 'brightness'],
      new inquirer.Separator(),
    ];
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    const passThrough = ['turnOn', 'turnOff', 'circadian'];
    if (passThrough.includes(action)) {
      await this.fetchService.fetch({
        method: 'put',
        url: `/group/${group._id}/activate/${action}`,
      });
      return;
    }
    switch (action) {
      case 'dimUp':
        return await this.dimUp(group);
      case 'dimDown':
        return await this.dimDown(group);
    }
    if (action === 'brightness') {
      group = await this.refresh(group);
      await this.promptChangeBrightness(group);
      return;
    }
    this.logger.error({ action }, `Unknown action`);
  }

  public async promptChangeBrightness(group: GroupDTO): Promise<void> {
    let current = 0;
    const onList = group.state.states.filter(
      (item) => item.state === 'on',
    ) as RoomEntitySaveStateDTO<LightingCacheDTO>[];
    onList.forEach((item) => {
      current += item.extra.brightness;
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
    }
    return await this.setBrightness(group, brightness);
  }

  /**
   * Get all the information for the the group
   */
  public async refresh(group: GroupDTO | string): Promise<GroupDTO> {
    if (typeof group === 'string') {
      return await this.fetchService.fetch({
        url: `/group/${group}`,
      });
    }
    return await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
  }

  public async setBrightness(
    group: GroupDTO,
    brightness: number,
  ): Promise<void> {
    await this.fetchService.fetch({
      body: {
        brightness,
      },
      method: 'put',
      url: `/group/${group._id}/expand`,
    });
  }
}
