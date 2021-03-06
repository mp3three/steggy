import { Injectable } from '@nestjs/common';
import {
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@steggy/controller-shared';
import {
  KeyMap,
  PromptEntry,
  PromptService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import { is } from '@steggy/utilities';

import { ICONS } from '../../types';
import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class FanGroupCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly logger: SyncLoggerService,
  ) {}

  public keyMap: KeyMap = {
    '[': [`${ICONS.DOWN}Speed Down`, 'fanSpeedDown'],
    ']': [`${ICONS.UP}Speed Up`, 'fanSpeedUp'],
    e: [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
    f: [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
  };

  public async commandBuilder(
    current?: string,
  ): Promise<Omit<RoutineCommandGroupActionDTO, 'group'>> {
    const command = await this.promptService.pickOne(
      `Fan group action`,
      ToMenuEntry([
        [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
        [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
        [`${ICONS.UP}Speed Up`, 'fanSpeedUp'],
        [`${ICONS.DOWN}Speed Down`, 'fanSpeedDown'],
      ] as PromptEntry<string>[]),
      current,
    );
    return { command };
  }

  public async fanSpeedDown(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/fanSpeedDown`,
    });
  }

  public async fanSpeedUp(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/fanSpeedUp`,
    });
  }
  public async groupActions(): Promise<PromptEntry[]> {
    return await [
      [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      [`${ICONS.UP}Speed Up`, 'fanSpeedUp'],
      [`${ICONS.DOWN}Speed Down`, 'fanSpeedDown'],
    ];
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    switch (action) {
      case 'toggle':
        return await this.toggle(group);
      case 'turnOn':
        return await this.turnOn(group);
      case 'turnOff':
        return await this.turnOff(group);
      case 'fanSpeedUp':
        return await this.fanSpeedUp(group);
      case 'fanSpeedDown':
        return await this.fanSpeedDown(group);
    }
    this.logger.error({ action }, `Unknown action`);
  }

  public async toggle(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/toggle`,
    });
  }

  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOff`,
    });
  }

  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOn`,
    });
  }
}
