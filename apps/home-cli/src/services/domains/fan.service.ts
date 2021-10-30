import {
  FanCacheDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import { FanSpeeds, FanStateDTO } from '@automagical/home-assistant';
import { DONE, PromptEntry } from '@automagical/tty';
import { TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

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
      entity.attributes.speed_list.map((speed) => [TitleCase(speed), speed]),
      current?.extra?.speed,
    );
    return {
      ref: entity_id,
      extra: {
        speed,
      },
      state: 'setSpeed',
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
    await this.header(id);
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
      url: `/entity/command/${id}/setFan`,
    });
  }

  protected getMenuOptions(): PromptEntry[] {
    return [
      ['Fan speed up', 'fanSpeedUp'],
      ['Fan speed down', 'fanSpeedDown'],
      ['Set speed', 'setSpeed'],
      ...super.getMenuOptions(),
    ];
  }

  protected async header(id: string): Promise<void> {
    const content = await this.baseHeader<FanStateDTO>(id);
    console.log(
      [
        `Entity id: ${content.entity_id}`,
        `State: ${content.state}`,
        `Speed: ${content.attributes.speed}`,
        ``,
      ].join(`\n`),
    );
  }
}
