import {
  RoutineCommandGroupActionDTO,
  GENERIC_COMMANDS,
  GroupDTO,
} from '@automagical/controller-logic';
import { ICONS, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class LockGroupCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly logger: AutoLogService,
  ) {}

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

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    switch (action) {
      case 'lock':
        return await this.lock(group);
      case 'unlock':
        return await this.unlock(group);
    }
    this.logger.error({ action }, `Unknown action`);
  }

  public async lock(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/lock`,
    });
  }

  public async unlock(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/unlock`,
    });
  }
}
