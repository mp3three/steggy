import { FanSpeeds } from '@automagical/home-assistant';
import { CANCEL, PromptMenuItems } from '@automagical/tty';
import { TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

@Injectable()
export class FanService extends SwitchService {
  public async fanSpeedDown(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/fanSpeedDown`,
    });
  }

  public async fanSpeedUp(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/fanSpeedUp`,
    });
  }

  public async processId(id: string): Promise<string> {
    const action = await super.processId(id);
    switch (action) {
      case 'fanSpeedDown':
        await this.fanSpeedDown(id);
        return await this.processId(id);
      case 'fanSpeedUp':
        await this.fanSpeedUp(id);
        return await this.processId(id);
    }
    return action;
  }

  public async setSpeed(id: string): Promise<void> {
    const speed = await this.promptService.menuSelect(
      Object.keys(FanSpeeds)
        .reverse()
        .map((key) => {
          return {
            name: TitleCase(key),
            value: key,
          };
        }),
      'Fan speed',
    );
    if (speed === CANCEL) {
      return;
    }
    await this.fetchService.fetch({
      body: { speed },
      method: 'put',
      url: `/entity/${id}/setSpeed/${speed}`,
    });
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      { name: 'Fan speed down', value: 'fanSpeedDown' },
      { name: 'Fan speed up', value: 'fanSpeedUp' },
      { name: 'Set speed', value: 'setSpeed' },
      ...super.getMenuOptions(),
    ];
  }
}
