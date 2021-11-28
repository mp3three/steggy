import {
  FanCacheDTO,
  FanCacheSpeeds,
  RoomEntitySaveStateDTO,
} from '@ccontour/controller-logic';
import { FanSpeeds, FanStateDTO, HassStateDTO } from '@ccontour/home-assistant';
import { DONE, ICONS, PromptEntry } from '@ccontour/tty';
import { TitleCase } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { SwitchService } from './switch.service';

@Injectable()
export class FanService extends SwitchService {
  public async createSaveCommand(
    entity_id: string,
    current?: RoomEntitySaveStateDTO<FanCacheDTO>,
  ): Promise<RoomEntitySaveStateDTO> {
    const entity = await this.fetchService.fetch<FanStateDTO>({
      url: `/entity/id/${entity_id}`,
    });
    entity.attributes.speed_list ??= [];
    const speed = await this.promptService.pickOne(
      entity_id,
      [
        new inquirer.Separator(chalk.white`Relative change`),
        [`${ICONS.UP}Speed Up`, 'fanSpeedUp'],
        [`${ICONS.DOWN}Speed Down`, 'fanSpeedDown'],
        new inquirer.Separator(chalk.white`Absolute speeds`),
        ...entity.attributes.speed_list.map((speed) => [
          TitleCase(speed, false),
          speed,
        ]),
      ] as PromptEntry<FanCacheSpeeds>[],
      current?.extra?.speed,
    );
    return {
      extra: {
        speed,
      },
      ref: entity_id,
      state: speed === FanSpeeds.off ? 'off' : 'on',
    };
  }

  public async fanSpeedDown(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/fanSpeedDown`,
    });
  }

  public async fanSpeedUp(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/fanSpeedUp`,
    });
  }

  public async processId(id: string, command?: string): Promise<string> {
    await this.baseHeader(id);
    const action = await super.processId(id, command);
    switch (action) {
      case 'fanSpeedDown':
        await this.fanSpeedDown(id);
        return await this.processId(id, action);
      case 'fanSpeedUp':
        await this.fanSpeedUp(id);
        return await this.processId(id, action);
      case 'setSpeed':
        await this.setSpeed(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async setSpeed(id: string): Promise<void> {
    const speed = await this.promptService.menuSelect(
      Object.keys(FanSpeeds)
        .reverse()
        .map((key) => [TitleCase(key), key]),
      'Fan speed',
    );
    if (speed === DONE) {
      return;
    }
    await this.fetchService.fetch({
      body: { speed },
      method: 'put',
      url: `/entity/command/${id}/setSpeed`,
    });
  }

  protected getMenuOptions(id: string): PromptEntry[] {
    return [
      [`${ICONS.UP}Speed Up`, 'fanSpeedUp'],
      [`${ICONS.DOWN}Speed Down`, 'fanSpeedDown'],
      [`${ICONS.COMMAND}Set speed`, 'setSpeed'],
      ...super.getMenuOptions(id),
    ];
  }

  protected logAttributes(
    states: FanStateDTO[],
  ): { percent: number; speed: string; state: string }[] {
    return states.map((i) => ({
      date: i.last_changed,
      percent: i.attributes.percentage,
      speed: i.attributes.speed,
      state: i.state,
    }));
  }
}
