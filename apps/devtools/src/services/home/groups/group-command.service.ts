import { GROUP_TYPES, GroupDTO } from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import {
  CANCEL,
  FontAwesomeIcons,
  iRepl,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { AutoLogService, TitleCase } from '@automagical/utilities';
import chalk from 'chalk';
import inquirer, { Separator } from 'inquirer';

import { EntityService } from '../entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { GroupStateService } from './group-state.service';

export type GroupItem = { entities: string[]; name: string; room: string };
const EMPTY = 0;
@Repl({
  icon: FontAwesomeIcons.group,
  name: `Groups`,
  type: REPL_TYPE.home,
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupState: GroupStateService,
  ) {}

  public async create(): Promise<GroupDTO> {
    const type = await this.promptService.pickOne(
      `What type of group?`,
      Object.values(GROUP_TYPES).map((type) => ({
        name: TitleCase(type),
        value: type,
      })),
    );
    const friendlyName = await this.promptService.string(`Friendly Name`);
    const types = new Map([
      [GROUP_TYPES.light, [HASS_DOMAINS.light]],
      [
        GROUP_TYPES.switch,
        [
          HASS_DOMAINS.light,
          HASS_DOMAINS.fan,
          HASS_DOMAINS.media_player,
          HASS_DOMAINS.switch,
        ],
      ],
      [GROUP_TYPES.lock, [HASS_DOMAINS.lock]],
      [GROUP_TYPES.fan, [HASS_DOMAINS.fan]],
    ]);
    const entities = await this.entityService.buildList(types.get(type));
    const body: GroupDTO = {
      entities,
      friendlyName,
      type,
    };
    return await this.fetchService.fetch<GroupDTO>({
      body,
      method: 'post',
      url: `/group`,
    });
  }

  public async exec(): Promise<void> {
    const groups = await this.list();
    const action = await this.promptService.menuSelect<
      GroupDTO | keyof GroupCommandService
    >([
      ...(groups.length !== EMPTY
        ? [
            ...groups.map((group) => ({
              name: group.friendlyName,
              value: group,
            })),
            new inquirer.Separator(),
          ]
        : []),
      {
        name: 'Create Group',
        value: 'create',
      },
    ]);
    if (action === 'create') {
      await this.create();
      return await this.exec();
    }
    if (action === CANCEL) {
      return;
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Command not implemented`);
      return;
    }
    await this.process(action, groups);
    return await this.exec();
  }

  public async list(): Promise<GroupDTO[]> {
    return await this.fetchService.fetch<GroupDTO[]>({
      url: `/group`,
    });
  }

  private async describeGroup(group: GroupDTO): Promise<string> {
    group.state ??= [];
    const entity = await this.promptService.menuSelect(
      group.state.map((item, index) => {
        const value = group.entities[index];
        if (!value) {
          return new Separator(`MISSING ENTITY`);
        }
        let name = `${value}`;
        if (item.state === 'on') {
          name = chalk.green(name);
        }
        if (item.state === 'off') {
          name = chalk.red(name);
        }
        return {
          name,
          value,
        };
      }),
    );
    if (entity === CANCEL) {
      return entity;
    }
    await this.entityService.pickOne(entity);
    return await this.describeGroup(group);
  }

  private async process(
    group: GroupDTO,
    list: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        {
          name: 'Turn On',
          value: 'turnOn',
        },
        {
          name: 'Turn Off',
          value: 'turnOff',
        },
        {
          name: 'Circadian On',
          value: 'circadian',
        },
        {
          name: 'Dim Up',
          value: 'dimUp',
        },
        {
          name: 'Dim Down',
          value: 'dimDown',
        },
        new inquirer.Separator(),
        {
          name: 'State Manager',
          value: 'state',
        },
        {
          name: 'Describe',
          value: 'describe',
        },
        {
          name: 'Send state',
          value: 'sendState',
        },
        {
          name: 'Rename',
          value: 'rename',
        },
        {
          name: 'Delete',
          value: 'delete',
        },
      ],
      `Action`,
      defaultValue,
    );
    if (action === 'describe') {
      await this.describeGroup(group);
      return this.process(group, list, action);
    }
    const passThrough = ['turnOn', 'turnOff', 'circadian', 'dimUp', 'dimDown'];
    if (passThrough.includes(action)) {
      await this.fetchService.fetch({
        method: 'put',
        url: `/group/${group._id}/activate/${action}`,
      });
      return await this.process(group, list, action);
    }
    switch (action) {
      case 'state':
        await this.groupState.processState(group, list);
        break;
      case CANCEL:
        return;
      // Capture state
      case 'capture':
        const state = await this.fetchService.fetch({
          body: {
            name: await this.promptService.string(`Name for save state`),
          },
          method: 'post',
          url: `/group/${group._id}/capture`,
        });
        console.log(state);
        break;
      case 'rename':
        group.friendlyName = await this.promptService.string(
          `New name`,
          group.friendlyName,
        );
        group = await this.fetchService.fetch({
          body: group,
          method: 'put',
          url: `/group/${group._id}`,
        });
        break;
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/group/${group._id}`,
        });
        return;
    }
    await this.process(group, list, action);
  }
}
