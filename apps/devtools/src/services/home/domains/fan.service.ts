import { FanSpeeds, FanStateDTO } from '@automagical/home-assistant';
import { CANCEL, PromptMenuItems } from '@automagical/tty';
import { sleep, TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { SwitchService } from './switch.service';

const DELAY = 100;
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
    await this.header(id);
    const action = await super.processId(id);
    switch (action) {
      case 'fanSpeedDown':
        await this.fanSpeedDown(id);
        return await this.processId(id);
      case 'fanSpeedUp':
        await this.fanSpeedUp(id);
        return await this.processId(id);
      case 'setSpeed':
        await this.setSpeed(id);
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
      url: `/entity/${id}/setFan`,
    });
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      { name: 'Fan speed up', value: 'fanSpeedUp' },
      { name: 'Fan speed down', value: 'fanSpeedDown' },
      { name: 'Set speed', value: 'setSpeed' },
      ...super.getMenuOptions(),
    ];
  }

  private async header(id: string): Promise<void> {
    await sleep(DELAY);
    const content = await this.getState<FanStateDTO>(id);
    const header = `  ${content.attributes.friendly_name}  `;
    const padding = ' '.repeat(header.length);
    console.log(
      [
        chalk.bgCyan.black([padding, header, padding].join(`\n`)),
        ``,
        `Entity id: ${content.entity_id}`,
        `State: ${content.state}`,
        `Speed: ${content.attributes.speed}`,
        ``,
      ].join(`\n`),
    );
  }
}
