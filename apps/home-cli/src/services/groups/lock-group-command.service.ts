import { AutoLogService } from '@steggy/boilerplate';
import {
  GENERIC_COMMANDS,
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@steggy/controller-shared';
import { ICONS, KeyMap, PromptEntry, PromptService } from '@steggy/tty';
import { is } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class LockGroupCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly logger: AutoLogService,
  ) {}

  public keyMap: KeyMap = {
    l: [`${ICONS.TURN_ON}Lock`, 'lock'],
    u: [`${ICONS.TURN_OFF}Unlock`, 'unlock'],
  };

  public async commandBuilder(
    current?: string,
  ): Promise<Omit<RoutineCommandGroupActionDTO, 'group'>> {
    const command = await this.promptService.pickOne(
      `Light group action`,
      [
        [`${ICONS.TURN_ON}Lock`, 'lock'],
        [`${ICONS.TURN_OFF}Unlock`, 'unlock'],
      ] as PromptEntry<GENERIC_COMMANDS>[],
      current,
    );
    return { command };
  }

  public async groupActions(): Promise<PromptEntry[]> {
    return await [
      [`${ICONS.TURN_ON}Lock`, 'lock'],
      [`${ICONS.TURN_OFF}Unlock`, 'unlock'],
    ];
  }

  public async lock(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/lock`,
    });
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    switch (action) {
      case 'lock':
        return await this.lock(group);
      case 'unlock':
        return await this.unlock(group);
    }
    this.logger.error({ action }, `Unknown action`);
  }

  public async unlock(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/unlock`,
    });
  }
}
