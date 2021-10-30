import {
  GroupDTO,
  GroupSaveStateDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';
import { GroupCommandService } from './group-command.service';

@Injectable()
export class GroupStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    @Inject(forwardRef(() => GroupCommandService))
    private readonly groupService: GroupCommandService,
  ) {}

  public async findGroup(exclude: string[] = []): Promise<GroupDTO> {
    const groups = await this.fetchService.fetch<GroupDTO[]>({
      url: `/group`,
    });
    return await this.promptService.pickOne(
      `Pick a group`,
      groups
        .filter((group) => !exclude.includes(group._id))
        .map((group) => [group.friendlyName, group]),
    );
  }

  public async pickOne(
    group?: string | GroupDTO,
    current?: string,
  ): Promise<RoutineCommandGroupStateDTO> {
    group =
      (await this.groupService.get(group)) ??
      (await this.groupService.pickOne());
    if (IsEmpty(group.save_states)) {
      this.logger.error(``);
    }
    return {
      group: group._id,
      state: ``,
    };
  }

  public async processState(group: GroupDTO, list: GroupDTO[]): Promise<void> {
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const action = await this.promptService.menuSelect<GroupSaveStateDTO>([
      ...(this.promptService.conditionalEntries(!IsEmpty(group.save_states), [
        new inquirer.Separator(chalk.white`Current save states`),
        ...(group.save_states.map((state) => [state.friendlyName, state]) as [
          string,
          GroupSaveStateDTO,
        ][]),
      ]) as PromptEntry<GroupSaveStateDTO>[]),
      new inquirer.Separator(chalk.white`Manipulate`),
      ['📷 Capture current', 'capture'],
      ['📃 Describe current', 'describe'],
      [`🚨 Remove all save states`, 'truncate'],
    ]);
    if (action === DONE) {
      return;
    }
    if (action === 'truncate') {
      if (
        await this.promptService.confirm(
          `Are you sure? This is a distructive operation`,
          false,
        )
      ) {
        return await this.processState(group, list);
      }
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
    const name = await this.promptService.string(
      `New state name`,
      state.friendlyName,
    );
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
      ['Activate', 'activate'],
      ['Describe', 'describe'],
      new inquirer.Separator(),
      ['Copy to another group', 'copyTo'],
      ['Delete', 'delete'],
    ]);
    switch (stateAction) {
      case 'copyTo':
        await this.sendSaveState(state, group);
        return;
      case 'activate':
        await this.fetchService.fetch({
          method: 'put',
          url: `/group/${group._id}/state/${state.id}`,
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
