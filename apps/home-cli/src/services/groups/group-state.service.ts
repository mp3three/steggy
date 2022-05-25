import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import {
  GeneralSaveStateDTO,
  GroupDTO,
  GroupSaveStateDTO,
  RoomDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';
import {
  ApplicationManagerService,
  IsDone,
  PromptEntry,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, LABEL } from '@steggy/utilities';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';
import inquirer from 'inquirer';
import { dump, load } from 'js-yaml';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { PinnedItemService } from '../pinned-item.service';
import { GroupCommandService } from './group-command.service';

type GService = GroupCommandService;

@Injectable()
export class GroupStateService {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    @Inject(forwardRef(() => GroupCommandService))
    private readonly groupService: GService,
    private readonly entityService: EntityService,
    private readonly textRender: TextRenderingService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
    private readonly pinnedItems: PinnedItemService<{ group: string }>,
  ) {}

  public async activate(
    group: GroupDTO,
    state: GroupSaveStateDTO,
  ): Promise<void> {
    await this.fetchService.fetch({
      method: 'post',
      url: `/group/${group._id}/state/${state.id}`,
    });
  }

  public async build(
    group: GroupDTO,
    current: Partial<GroupSaveStateDTO> = {},
  ): Promise<GroupDTO> {
    current.states ??= [];
    // Use the dedicated rename action
    const friendlyName = current.id
      ? current.friendlyName
      : await this.promptService.friendlyName(current.friendlyName);
    const states = [];
    const action = await this.promptService.pickOne(
      `Edit style`,
      ToMenuEntry([
        [`${ICONS.GUIDED}Guided`, `guided`],
        [`${ICONS.MANUAL}Manual`, `manual`],
      ]),
    );

    if (action === `manual`) {
      const result = await this.promptService.editor(
        `Enter save state data in yaml format`,
        dump(current.states),
      );
      states.push(...(load(result) as GeneralSaveStateDTO[]));
    } else if (action === 'guided') {
      let lastState: GeneralSaveStateDTO;
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
      ToMenuEntry(
        room
          ? room.groups.map(id => {
              const group = allGroups.find(({ _id }) => _id === id);
              return [group?.friendlyName, group];
            })
          : allGroups.map(i => [i.friendlyName, i]),
      ),
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
      ToMenuEntry(
        groups
          .filter(group => !exclude.includes(group._id))
          .map(group => [group.friendlyName, group]),
      ),
    );
  }

  public async pickOne(group: GroupDTO): Promise<string> {
    const action = await this.promptService.pickOne<GroupSaveStateDTO | string>(
      `Which state?`,
      ToMenuEntry([
        [`${ICONS.CREATE}Manual create`, 'create'],
        ...this.promptService.conditionalEntries(!is.empty(group.save_states), [
          new inquirer.Separator(chalk.white(`Current states`)),
          ...(group.save_states.map(state => [
            state.friendlyName,
            state,
          ]) as PromptEntry<GroupSaveStateDTO>[]),
        ]),
      ]),
    );
    if (action === 'create') {
      group = await this.build(group);
      const state = group.save_states.pop();
      return state.id;
    }
    if (is.string(action)) {
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
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        c: [`${ICONS.CAPTURE}Capture current`, 'capture'],
        d: MENU_ITEMS.DELETE,
        m: [`${ICONS.CREATE}Manual create`, 'create'],
        t: [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      },
      keyMapCallback: async (action, [label, state]) => {
        if (action !== 'activate') {
          return true;
        }
        await this.activate(group, state as GroupSaveStateDTO);
        return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + label;
      },
      right: ToMenuEntry(
        group.save_states.map(state => [state.friendlyName, state]),
      ),
      rightHeader: `State management`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'create':
        group = await this.build(group);
        return await this.processState(group, list, action);
      case 'truncate':
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
      case 'capture':
        await this.fetchService.fetch({
          body: {
            name: await this.promptService.string(`Name for save state`),
          },
          method: 'post',
          url: `/group/${group._id}/capture`,
        });
        return await this.processState(group, list, action);
    }

    if (is.string(action)) {
      this.logger.error({ action }, `Unknown action`);
      return;
    }
    if (!action) {
      return;
    }
    group = await this.stateAction(action, group);
    return await this.processState(group, list);
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('group_state', async ({ id, data }) => {
      const group = await this.groupService.get(data.group);
      const state = group.save_states.find(i => i.id === id);
      if (!state) {
        throw new InternalServerErrorException();
      }
      await this.stateAction(state, group);
    });
  }

  private header(group: GroupDTO, state: GroupSaveStateDTO): void {
    this.applicationManager.setHeader(state.friendlyName, group.friendlyName);
    const table = new Table({
      head: ['Entity ID', 'State', 'Extra'],
    });
    state.states.forEach(state => {
      table.push([
        state.ref || '',
        state.state || '',
        this.textRender.typePrinter(state.extra) || '',
      ]);
    });
    this.screenService.print(
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
    const [copy] = [
      [`${ICONS.COPY}Copy to another group`, 'copyTo'],
    ] as PromptEntry[];
    const action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        c: copy,
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.EDIT,
        g: [`${ICONS.GROUPS}Go to group`, `group`],
        p: [
          this.pinnedItems.isPinned('group_state', state.id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        x: MENU_ITEMS.DELETE,
      },
      rightHeader: `Group state action`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return group;
    }
    switch (action) {
      case 'group':
        await this.groupService.process(group);
        return this.groupService.get(group);
      case 'pin':
        this.pinnedItems.toggle({
          data: { group: group._id },
          friendlyName: state.friendlyName,
          id: state.id,
          script: 'group_state',
        });
        return await this.stateAction(state, group, action);
      case 'rename':
        state.friendlyName = await this.promptService.friendlyName(
          state.friendlyName,
        );
        group = await this.groupService.update(group);
        return await this.stateAction(state, group, action);
      case 'copyTo':
        await this.sendSaveState(state, group);
        return await this.stateAction(state, group, action);
      case 'edit':
        group = await this.build(group, state);
        return await this.stateAction(state, group, action);
      case 'activate':
        await this.activate(group, state);
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
