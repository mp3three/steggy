// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { CacheManagerService, InjectCache } from '@steggy/boilerplate';
import {
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import {
  ApplicationManagerService,
  IsDone,
  MainMenuEntry,
  PromptService,
  ScreenService,
  StackService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import {
  DOWN,
  is,
  LABEL,
  ResultControlDTO,
  TitleCase,
  UP,
} from '@steggy/utilities';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { HomeFetchService } from '../home-fetch.service';
import { PinnedItemService } from '../pinned-item.service';
import { RoomCommandService } from '../rooms';
import { RoutineCommandBuilderService } from './command';
import { RoutineActivateService } from './routine-activate.service';
import { RoutineCommandService } from './routine-command.service';

type RCService = RoomCommandService;
type RService = RoutineCommandService;
const MILLISECONDS = 1000;
const SOLO = 1;
const CACHE_KEY = `MENU_LAST_ROUTINE`;
const ROOT = 'ROOT';

// @Repl({
//   category: 'Control',
//   icon: ICONS.ROUTINE,
//   keybind: 't',
//   name: 'Routine',
// })
@Injectable()
export class RoutineService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly fetchService: HomeFetchService,
    private readonly textRender: TextRenderingService,
    private readonly promptService: PromptService,
    private readonly activateService: RoutineActivateService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
    @Inject(forwardRef(() => RoutineCommandService))
    private readonly routineCommand: RService,
    private readonly pinnedItems: PinnedItemService,
    private readonly commandBuilder: RoutineCommandBuilderService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
    private readonly stackService: StackService,
  ) {}

  private lastRoutine: string;

  public async activate(routine: RoutineDTO): Promise<void> {
    await this.fetchService.fetch({
      method: 'post',
      url: `/routine/${routine._id}`,
    });
  }

  public async create(): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.string('Friendly Name');
    return await this.fetchService.fetch<RoutineDTO, RoutineDTO>({
      body: {
        friendlyName,
      },
      method: `post`,
      url: `/routine`,
    });
  }

  public async exec(): Promise<void> {
    let action = await this.promptService.menu<RoutineDTO | string>({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        d: MENU_ITEMS.DONE,
      },
      keyMapCallback: async (action, [label, routine]) => {
        if (action === 'activate') {
          await this.activate(routine as RoutineDTO);
          return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + label;
        }
        return true;
      },
      right: await this.menuList(),
      value: this.lastRoutine,
    });
    if (IsDone(action)) {
      return;
    }
    if (action === 'create') {
      action = await this.create();
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    this.lastRoutine = action._id;
    await this.cache.set(CACHE_KEY, action._id);
    await this.processRoutine(action);
  }

  public async get(id: string): Promise<RoutineDTO> {
    return await this.fetchService.fetch({
      url: `/routine/${id}`,
    });
  }

  public async list(control?: ResultControlDTO): Promise<RoutineDTO[]> {
    return await this.fetchService.fetch({
      control,
      url: `/routine`,
    });
  }

  public async pickOne(
    defaultValue: string | RoutineDTO,
    inList: RoutineDTO[] = [],
  ): Promise<RoutineDTO> {
    if (is.empty(inList)) {
      inList = await this.list();
    }
    defaultValue = inList.find(
      ({ _id }) =>
        _id === (is.string(defaultValue) ? defaultValue : defaultValue?._id),
    );
    return await this.promptService.pickOne(
      `Pick a routine`,
      ToMenuEntry(inList.map(i => [i.friendlyName, i])),
    );
  }

  public async processRoutine(
    routine: RoutineDTO,
    defaultAction?: string,
  ): Promise<void> {
    await this.header(routine);
    const action = await this.promptService.menu({
      keyMap: {
        '?': ['Change Description', 'description'],
        d: MENU_ITEMS.DONE,
        m: MENU_ITEMS.ACTIVATE,
        p: [
          this.pinnedItems.isPinned('routine', routine._id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        x: [`${ICONS.DELETE}Delete`, 'delete'],
      },
      keyOnly: true,
      rightHeader: `Manage routine`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'description':
        routine = await this.fetchService.fetch({
          body: {
            ...routine,
            description: await this.promptService.string(
              'Routine Description',
              routine.description,
              { placeholder: 'Justify my existence or something ????' },
            ),
          },
          method: `put`,
          url: `/routine/${routine._id}`,
        });
        return await this.processRoutine(routine, action);
        return await this.processRoutine(routine, action);
      case 'pin':
        this.pinnedItems.toggle({
          target: routine._id,
          type: 'routine',
        });
        return await this.processRoutine(routine, action);
      case 'sync':
        routine.sync = !routine.sync;
        routine = await this.update(routine);
        return await this.processRoutine(routine, action);
      case 'activate':
        await this.promptActivate(routine);
        return await this.processRoutine(routine, action);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.bold.magenta(
              routine.friendlyName,
            )}?`,
          ))
        ) {
          return await this.processRoutine(routine, action);
        }
        await this.fetchService.fetch({
          method: 'delete',
          url: `/routine/${routine._id}`,
        });
        break;
      case 'rename':
        routine = await this.fetchService.fetch({
          body: {
            ...routine,
            friendlyName: await this.promptService.string(
              'Friendly Name',
              routine.friendlyName,
            ),
          },
          method: `put`,
          url: `/routine/${routine._id}`,
        });
        return await this.processRoutine(routine, action);
      case 'events':
        routine = await this.activateService.processRoutine(routine);
        return await this.processRoutine(routine, action);
      case 'command':
        routine = await this.stackService.wrap(
          async () => await this.commandBuilder.process(routine),
        );
        return await this.processRoutine(routine, action);
    }
  }

  public async promptActivate(routine: RoutineDTO): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([
        [`Immediate`, 'immediate'],
        [`Timeout`, 'timeout'],
        ['At date/time', 'datetime'],
      ]),
      rightHeader: `When to activate`,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'immediate':
        await this.activate(routine);
        return;
      case 'timeout':
        this.screenService.printLine(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timeout:
              (await this.promptService.number('Seconds')) * MILLISECONDS,
          } as RoutineActivateOptionsDTO,
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return;
      case 'datetime':
        this.screenService.printLine(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timestamp: await (
              await this.promptService.date({ label: 'Activation Time' })
            ).toISOString(),
          } as RoutineActivateOptionsDTO,
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return;
    }
    throw new NotImplementedException();
  }

  public async update(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.fetchService.fetch({
      body: routine,
      method: 'put',
      url: `/routine/${routine._id}`,
    });
  }

  protected async onModuleInit(): Promise<void> {
    this.lastRoutine = await this.cache.get(CACHE_KEY);
    this.pinnedItems.loaders.set('routine', async ({ target }) => {
      const routine = await this.get(target);
      await this.processRoutine(routine);
    });
  }

  private async header(routine: RoutineDTO): Promise<void> {
    this.applicationManager.setHeader(`Routine`, routine.friendlyName);
    const url = this.fetchService.getUrl(`/routine/${routine._id}`);
    this.screenService.printLine(chalk`${ICONS.LINK} {bold.magenta POST} ${url}`);
    if (!is.empty(routine.description)) {
      this.screenService.printLine(
        chalk`${ICONS.DESCRIBE} {bold.blue ?} ${routine.description}`,
      );
    }
    this.screenService.printLine();
    if (!is.empty(routine.activate)) {
      this.screenService.printLine(chalk`  {blue.bold Activation Events}`);
      const table = new Table({
        head: ['Name', 'Type', 'Details'],
      });
      routine.activate.forEach(activate => {
        table.push([
          activate.friendlyName,
          TitleCase(activate.type),
          this.textRender.type(activate.activate),
        ]);
      });
      this.screenService.printLine(table.toString());
    }
    if (is.empty(routine.command)) {
      return;
    }
    const activation =
      routine.command.length === SOLO
        ? ``
        : chalk`{yellowBright (${routine.sync ? 'Series' : 'Parallel'})}`;
    this.screenService.printLine(chalk`  {bold.blue Commands} ${activation}`);
    const table = new Table({
      head: ['Name', 'Type', 'Details'],
    });
    await eachSeries(routine.command, async command => {
      if (!command) {
        return;
      }
      table.push([
        command.friendlyName,
        TitleCase(command.type),
        await this.routineCommand.commandDetails(routine, command),
      ]);
    });
    this.screenService.printLine(table.toString());
    this.screenService.printLine();
  }

  private async menuList(): Promise<MainMenuEntry<RoutineDTO>[]> {
    const routines = await this.list();
    const ancestors = new Map<string, RoutineDTO[]>();
    const map = new Map<string, RoutineDTO>();
    const name = (routine: RoutineDTO): string[] => [
      routine.friendlyName,
      ...(routine.parent ? name(map.get(routine.parent)) : []),
    ];
    routines.forEach(routine => {
      map.set(routine._id, routine);
      const parent = routine.parent || ROOT;
      const list = ancestors.get(parent) ?? [];
      list.push(routine);
      ancestors.set(parent, list);
    });
    return routines
      .map(
        routine =>
          ({
            entry: [
              name(routine)
                .filter(i => !is.empty(i))
                .reverse()
                .join(chalk.cyan(` > `)),
              routine,
            ],
            helpText: routine.description,
          } as MainMenuEntry<RoutineDTO>),
      )
      .sort((a, b) => {
        return a.entry[LABEL] > b.entry[LABEL] ? UP : DOWN;
      }) as MainMenuEntry<RoutineDTO>[];
  }
}
