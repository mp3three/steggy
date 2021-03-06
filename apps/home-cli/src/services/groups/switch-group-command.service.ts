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
export class SwitchGroupCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly logger: SyncLoggerService,
  ) {}

  public keyMap: KeyMap = {
    e: [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
    f: [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
    t: [`${ICONS.TOGGLE_OFF}Toggle`, 'toggle'],
  };

  public async commandBuilder(
    current?: string,
  ): Promise<Omit<RoutineCommandGroupActionDTO, 'group'>> {
    const command = await this.promptService.pickOne(
      `Light group action`,
      ToMenuEntry([
        [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
        [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
        [`${ICONS.TOGGLE_OFF}Toggle`, 'toggle'],
      ] as PromptEntry<string>[]),
      current,
    );
    return { command };
  }

  public async groupActions(): Promise<PromptEntry[]> {
    return await [
      [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      [`${ICONS.TOGGLE_OFF}Toggle`, 'toggle'],
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
