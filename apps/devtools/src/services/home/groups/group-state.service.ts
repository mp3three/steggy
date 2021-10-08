import { GroupDTO, GroupSaveStateDTO } from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';

const EMPTY = 0;

@Injectable()
export class GroupStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async findGroup(exclude: string[] = []): Promise<GroupDTO> {
    const groups = await this.fetchService.fetch<GroupDTO[]>({
      url: `/group`,
    });
    return await this.promptService.pickOne(
      `Pick a group`,
      groups
        .filter((group) => !exclude.includes(group._id))
        .map((group) => ({ name: group.friendlyName, value: group })),
    );
  }

  public async processState(group: GroupDTO, list: GroupDTO[]): Promise<void> {
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const action = await this.promptService.menuSelect<
      GroupSaveStateDTO | string
    >([
      ...(group.states.length !== EMPTY
        ? [
            ...group.states.map((state) => ({
              name: state.name,
              value: state,
            })),
            new inquirer.Separator(),
          ]
        : []),
      {
        name: 'Describe current',
        value: 'describe',
      },
      {
        name: 'Capture Current',
        value: 'capture',
      },
      {
        name: 'Remove all save states',
        value: 'truncate',
      },
    ]);
    if (action === CANCEL) {
      return;
    }
    if (action === 'truncate') {
      await this.fetchService.fetch({
        method: 'delete',
        url: `/group/${group._id}/truncate`,
      });
      return await this.processState(group, list);
    }
    if (action === 'capture') {
      await this.fetchService.fetch({
        body: {
          name: await this.promptService.string(`Name for save state`),
        },
        method: 'post',
        url: `/group/${group._id}/capture`,
      });
      return await this.processState(group, list);
    }
    if (action === 'describe') {
      console.log(encode(group.state));
      return await this.processState(group, list);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Unknown action`);
      return;
    }
    await this.stateAction(action, group);
    return await this.processState(group, list);
  }

  private async sendSaveState(
    state: GroupSaveStateDTO,
    group: GroupDTO,
  ): Promise<void> {
    const target = await this.findGroup([group._id]);
    if (
      target.entities.length !== group.entities.length &&
      !(await this.promptService.confirm(
        `${target.friendlyName} has different quantity of entities. Proceed?`,
      ))
    ) {
      await this.sendSaveState(state, group);
      return;
    }
    const name = await this.promptService.string(`New state name`, state.name);
    await this.fetchService.fetch({
      body: {
        name,
        states: state.states,
      },
      method: 'post',
      url: `/group/${target._id}`,
    });
  }

  private async stateAction(
    state: GroupSaveStateDTO,
    group: GroupDTO,
  ): Promise<void> {
    const stateAction = await this.promptService.menuSelect([
      {
        name: 'Activate',
        value: 'activate',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
      new inquirer.Separator(),
      {
        name: 'Copy to another group',
        value: 'copyTo',
      },
      {
        name: 'Delete',
        value: 'delete',
      },
    ]);
    switch (stateAction) {
      case 'copyTo':
        await this.sendSaveState(state, group);
        return;
      case 'activate':
        await this.fetchService.fetch({
          method: 'put',
          url: `/group/${group._id}/activate/${state.id}`,
        });
        return;
      case 'describe':
        console.log(encode(state));
        return await this.stateAction(state, group);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/group/${group._id}/state/${state.id}`,
        });
        return;
    }
  }
}
