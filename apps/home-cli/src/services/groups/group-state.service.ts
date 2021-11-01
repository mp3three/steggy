import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { dump, load } from 'js-yaml';

import { ICONS } from '../../typings';
import { EntityService } from '../entity.service';
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
    private readonly entityService: EntityService,
  ) {}

  public async build(
    group: GroupDTO,
    current?: GroupSaveStateDTO,
  ): Promise<GroupDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current?.friendlyName,
    );
    const states = [];
    const action = await this.promptService.pickOne(`Edit style`, [
      [`${ICONS.GUIDED}Guided`, `guided`],
      [`${ICONS.MANUAL}Manual`, `manual`],
    ]);

    if (action === `manual`) {
      const result = await this.promptService.editor(
        `Enter save state data in yaml format`,
        dump(current?.states),
      );
      states.push(...(load(result) as RoomEntitySaveStateDTO[]));
    } else if (action === 'guided') {
      await eachSeries(
        group.entities.map((item, index) => [item, index]),
        async ([entity, index]: [string, number]) =>
          states.push(
            await this.entityService.createSaveCommand(
              entity,
              current?.states[index],
            ),
          ),
      );
    }

    if (current?.id) {
      const out = await this.fetchService.fetch<GroupDTO>({
        body: {
          friendlyName,
          states,
        },
        method: 'put',
        url: `/group/${group._id}/state/${current.id}`,
      });
      return out;
    }
    const out = await this.fetchService.fetch<GroupDTO>({
      body: {
        friendlyName,
        states,
      },
      method: 'post',
      url: `/group/${group._id}/state`,
    });
    return out;
  }

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

  public async processState(
    group: GroupDTO,
    list: GroupDTO[],
    defaultAction?: string,
  ): Promise<void> {
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const action = await this.promptService.menuSelect<GroupSaveStateDTO>(
      [
        ...(this.promptService.conditionalEntries(!IsEmpty(group.save_states), [
          new inquirer.Separator(chalk.white`Current save states`),
          ...(group.save_states.map((state) => [state.friendlyName, state]) as [
            string,
            GroupSaveStateDTO,
          ][]),
        ]) as PromptEntry<GroupSaveStateDTO>[]),
        new inquirer.Separator(chalk.white`Manipulate`),
        [`${ICONS.CREATE}Manual create`, 'create'],
        [`${ICONS.CAPTURE}Capture current`, 'capture'],
        [`${ICONS.DESCRIBE}Describe current`, 'describe'],
        [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      ],
      `State management`,
      defaultAction,
    );
    if (action === DONE) {
      return;
    }
    if (action === 'create') {
      group = await this.build(group);
      return await this.processState(group, list, action);
    }
    if (action === 'truncate') {
      if (
        await this.promptService.confirm(
          `Are you sure? This is a destructive operation`,
          false,
        )
      ) {
        return await this.processState(group, list, action);
      }
      await this.fetchService.fetch({
        method: 'delete',
        url: `/group/${group._id}/state/truncate`,
      });
      return await this.processState(group, list, action);
    }
    if (action === 'capture') {
      await this.fetchService.fetch({
        body: {
          name: await this.promptService.string(`Name for save state`),
        },
        method: 'post',
        url: `/group/${group._id}/state/capture`,
      });
      return await this.processState(group, list, action);
    }
    if (action === 'describe') {
      this.promptService.print(dump(group.state));
      return await this.processState(group, list, action);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Unknown action`);
      return;
    }
    group = await this.stateAction(action, group);
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
    defaultAction?: string,
  ): Promise<GroupDTO> {
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.ACTIVATE}Activate`, 'activate'],
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        [`${ICONS.EDIT}Edit`, 'edit'],
        [`${ICONS.COPY}Copy to another group`, 'copyTo'],
        [`${ICONS.DELETE}Delete`, 'delete'],
      ],
      `Group state action`,
      defaultAction,
    );
    switch (action) {
      case DONE:
        return group;
      case 'copyTo':
        await this.sendSaveState(state, group);
        return await this.stateAction(state, group, action);
      case 'edit':
        group = await this.build(group, state);
        return await this.stateAction(state, group, action);
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/group/${group._id}/state/${state.id}`,
        });
        return group;
      case 'describe':
        console.log(
          `${ICONS.NAME}Name:`,
          chalk.yellow.bold(state.friendlyName),
        );
        console.log(
          chalk`${ICONS.LINK} {bold.magenta POST} ${this.fetchService.getUrl(
            `/group/${group._id}/state/${state.id}`,
          )}`,
        );
        this.promptService.print(dump(state.states));
        return await this.stateAction(state, group, action);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/group/${group._id}/state/${state.id}`,
        });
        return group;
    }
    throw new NotImplementedException();
    return group;
  }
}
