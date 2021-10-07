import { GROUP_TYPES, GroupDTO } from '@automagical/controller-logic';
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

@Repl({
  description: [`Manipulate established groups of entities`],
  name: `${FontAwesomeIcons.group} Groups`,
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
    const entities = await this.entityService.buildList();
    return await this.fetchService.fetch<GroupDTO>({
      body: {
        entities,
        friendlyName,
        type,
      } as GroupDTO,
      method: 'post',
      url: `/group`,
    });
  }

  public async exec(): Promise<void> {
    const action = await this.promptService.menuSelect<
      keyof GroupCommandService
    >([
      {
        name: 'List Groups',
        value: 'list',
      },
      {
        name: 'Create Group',
        value: 'create',
      },
    ]);
    switch (action) {
      case 'create':
        await this.create();
        return await this.exec();
      case 'list':
        const groups = await this.list();
        await this.process(
          await this.promptService.pickOne(
            'Groups',
            groups.map((value) => ({
              name: value.friendlyName,
              value,
            })),
          ),
          groups,
        );
        return await this.exec();
    }
  }

  public async list(): Promise<GroupDTO[]> {
    return await this.fetchService.fetch<GroupDTO[]>({
      url: `/group`,
    });
  }

  private async describeGroup(group: GroupDTO): Promise<string> {
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

  private async process(group: GroupDTO, list: GroupDTO[]): Promise<void> {
    const action = await this.promptService.menuSelect([
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
        value: 'turnOnCircadian',
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
    ]);
    if (action === 'describe') {
      await this.describeGroup(group);
      return this.process(group, list);
    }

    switch (action) {
      // case
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
    }
    await this.process(group, list);
  }

  private async sendState(group: GroupItem, list: GroupItem[]): Promise<void> {
    const target = await this.promptService.pickOne(
      `Target group`,
      list.map((group) => ({ name: group.name, value: group })),
    );
    await this.fetchService.fetch({
      method: 'post',
      url: ``,
    });
  }
}
