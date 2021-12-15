import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoutineCommandGroupStateDTO,
} from '@ccontour/controller-logic';
import {
  DONE,
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  ToMenuEntry,
} from '@ccontour/tty';
import { AutoLogService, DOWN, IsEmpty, UP } from '@ccontour/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';
import inquirer from 'inquirer';
import { dump, load } from 'js-yaml';

import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { GroupCommandService } from './group-command.service';

type GService = GroupCommandService;

@Injectable()
export class GroupStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    @Inject(forwardRef(() => GroupCommandService))
    private readonly groupService: GService,
    private readonly entityService: EntityService,
    private readonly pinnedItems: PinnedItemService<{ group: string }>,
  ) {}

  public async build(
    group: GroupDTO,
    current: Partial<GroupSaveStateDTO> = {},
  ): Promise<GroupDTO> {
    current.states ??= [];
    const friendlyName = await this.promptService.friendlyName(
      current.friendlyName,
    );
    const states = [];
    const action = await this.promptService.pickOne(`Edit style`, [
      [`${ICONS.GUIDED}Guided`, `guided`],
      [`${ICONS.MANUAL}Manual`, `manual`],
    ]);

    if (action === `manual`) {
      const result = await this.promptService.editor(
        `Enter save state data in yaml format`,
        dump(current.states),
      );
      states.push(...(load(result) as RoomEntitySaveStateDTO[]));
    } else if (action === 'guided') {
      let lastState: RoomEntitySaveStateDTO;
      await eachSeries(
        group.entities.map((item, index) => [item, index]),
        async ([entity, index]: [string, number]) => {
          const found = current.states[index] || {
            ...lastState,
            ref: entity,
          };
          const state = await this.entityService.createSaveCommand(
            entity,
            found,
          );
          lastState = state;
          states.push(state);
        },
      );
    }
    if (current.id) {
      return await this.fetchService.fetch<GroupDTO>({
        body: {
          friendlyName,
          states,
        },
        method: 'put',
        url: `/group/${group._id}/state/${current.id}`,
      });
    }
    return await this.fetchService.fetch<GroupDTO>({
      body: {
        friendlyName,
        states,
      },
      method: 'post',
      url: `/group/${group._id}/state`,
    });
  }

  public async buildState(
    current: Partial<RoutineCommandGroupStateDTO> = {},
    room?: RoomDTO,
  ): Promise<RoutineCommandGroupStateDTO> {
    const allGroups = await this.groupService.list();
    const group = await this.promptService.pickOne(
      `Which group?`,
      room
        ? room.groups.map((id) => {
            const group = allGroups.find(({ _id }) => _id === id);
            return [group?.friendlyName, group];
          })
        : allGroups.map((i) => [i.friendlyName, i]),
      current.group,
    );
    return {
      group: group._id,
      state: await this.pickOne(group),
    };
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

  public async pickOne(group: GroupDTO): Promise<string> {
    const action = await this.promptService.pickOne<GroupSaveStateDTO | string>(
      `Which state?`,
      [
        [`${ICONS.CREATE}Manual create`, 'create'],
        ...this.promptService.conditionalEntries(!IsEmpty(group.save_states), [
          new inquirer.Separator(chalk.white(`Current states`)),
          ...(group.save_states.map((state) => [
            state.friendlyName,
            state,
          ]) as PromptEntry<GroupSaveStateDTO>[]),
        ]),
      ],
    );
    if (action === 'create') {
      group = await this.build(group);
      const state = group.save_states.pop();
      return state.id;
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    return action.id;
  }

  public async processState(
    group: GroupDTO,
    list: GroupDTO[],
    defaultAction?: string,
  ): Promise<void> {
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const action = await this.promptService.menu<GroupSaveStateDTO>({
      right: ToMenuEntry([
        ...(this.promptService.conditionalEntries(!IsEmpty(group.save_states), [
          new inquirer.Separator(chalk.white`Current save states`),
          ...(
            group.save_states.map((state) => [state.friendlyName, state]) as [
              string,
              GroupSaveStateDTO,
            ][]
          ).sort(([a], [b]) => (a > b ? UP : DOWN)),
        ]) as PromptEntry<GroupSaveStateDTO>[]),
        new inquirer.Separator(chalk.white`Manipulate`),
        [`${ICONS.CREATE}Manual create`, 'create'],
        [`${ICONS.CAPTURE}Capture current`, 'capture'],
        [`${ICONS.DESCRIBE}Describe current`, 'describe'],
        [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      ]),
      rightHeader: `State management`,
      value: defaultAction,
    });
    if (action === DONE) {
      return;
    }
    if (action === 'create') {
      group = await this.build(group);
      return await this.processState(group, list, action);
    }
    if (action === 'truncate') {
      if (
        !(await this.promptService.confirm(
          `Are you sure? This is a destructive operation`,
          false,
        ))
      ) {
        return await this.processState(group, list, action);
      }
      group = await this.fetchService.fetch({
        method: 'delete',
        url: `/group/${group._id}/truncate`,
      });
      return await this.processState(group, list, action);
    }
    if (action === 'capture') {
      await this.fetchService.fetch({
        body: {
          name: await this.promptService.string(`Name for save state`),
        },
        method: 'post',
        url: `/group/${group._id}/capture`,
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

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('group_state', async ({ id, data }) => {
      const group = await this.groupService.get(data.group);
      const state = group.save_states.find((i) => i.id === id);
      if (!state) {
        throw new InternalServerErrorException();
      }
      await this.stateAction(state, group);
    });
  }

  private header(group: GroupDTO, state: GroupSaveStateDTO): void {
    this.promptService.clear();
    this.promptService.scriptHeader(state.friendlyName);
    this.promptService.secondaryHeader(group.friendlyName);
    const table = new Table({
      head: ['Entity ID', 'State', 'Extra'],
    });
    state.states.forEach((state) => {
      table.push([
        state.ref,
        state.state,
        this.promptService.objectPrinter(state.extra),
      ]);
    });
    console.log(
      [
        chalk`${ICONS.LINK} {bold.magenta POST} ${this.fetchService.getUrl(
          `/group/${group._id}/state/${state.id}`,
        )}`,
        ``,
        table.toString(),
        ``,
      ].join(`\n`),
    );
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
    const friendlyName = await this.promptService.friendlyName(
      state.friendlyName,
    );
    await this.fetchService.fetch({
      body: {
        friendlyName,
        states: state.states,
      } as GroupSaveStateDTO,
      method: 'post',
      url: `/group/${target._id}/state`,
    });
  }

  private async stateAction(
    state: GroupSaveStateDTO,
    group: GroupDTO,
    defaultAction?: string,
  ): Promise<GroupDTO> {
    this.header(group, state);
    const [edit, copy, activate] = [
      [`${ICONS.EDIT}Edit`, 'edit'],
      [`${ICONS.COPY}Copy to another group`, 'copyTo'],
      [`${ICONS.ACTIVATE}Activate`, 'activate'],
    ] as PromptEntry[];
    const action = await this.promptService.menu({
      keyMap: {
        a: activate,
        c: copy,
        d: ['Done', DONE],
        e: edit,
        p: [
          this.pinnedItems.isPinned('group_state', state.id) ? 'Unpin' : 'Pin',
          'pin',
        ],
      },
      right: ToMenuEntry([
        activate,
        edit,
        copy,
        [`${ICONS.DELETE}Delete`, 'delete'],
      ]),
      rightHeader: `Group state action`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          data: { group: group._id },
          friendlyName: state.friendlyName,
          id: state.id,
          script: 'group_state',
        });
        return await this.stateAction(state, group, action);
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
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${state.friendlyName}? This cannot be undone`,
          ))
        ) {
          return await this.stateAction(state, group);
        }
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
