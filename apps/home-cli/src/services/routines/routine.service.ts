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
  PromptService,
  ScreenService,
  StackService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, LABEL, ResultControlDTO, TitleCase } from '@steggy/utilities';
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
    const friendlyName = await this.promptService.friendlyName();
    return await this.fetchService.fetch<RoutineDTO, RoutineDTO>({
      body: {
        friendlyName,
      },
      method: `post`,
      url: `/routine`,
    });
  }

  public async exec(all = false): Promise<void> {
    // List routines that are not attached to rooms
    const list = await this.list({
      filters: all
        ? undefined
        : new Set([
            {
              field: 'room',
              value: null,
            },
          ]),
    });
    let action = await this.promptService.menu<RoutineDTO | string>({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        d: MENU_ITEMS.DONE,
        t: [
          all
            ? chalk.dim.magenta('Show detached routines')
            : chalk.dim.blue('Show all routines'),
          'all',
        ],
      },
      keyMapCallback: async (action, [label, routine]) => {
        if (action === 'activate') {
          await this.activate(routine as RoutineDTO);
          return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + label;
        }
        return true;
      },
      right: ToMenuEntry(list.map(i => [i.friendlyName, i])),
      value: this.lastRoutine,
    });
    if (IsDone(action)) {
      return;
    }
    if (action === 'all') {
      return await this.exec(!all);
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
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: routine.friendlyName,
          id: routine._id,
          script: 'routine',
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
            friendlyName: await this.promptService.friendlyName(
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
        this.screenService.print(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timeout: (await this.promptService.timeout()) * MILLISECONDS,
          } as RoutineActivateOptionsDTO,
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return;
      case 'datetime':
        this.screenService.print(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timestamp: await (
              await this.promptService.timestamp(`Activation time`)
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
    this.pinnedItems.loaders.set('routine', async ({ id }) => {
      const routine = await this.get(id);
      await this.processRoutine(routine);
    });
  }

  private async header(routine: RoutineDTO): Promise<void> {
    this.applicationManager.setHeader(`Routine`, routine.friendlyName);
    const url = this.fetchService.getUrl(`/routine/${routine._id}`);
    this.screenService.print(chalk`${ICONS.LINK} {bold.magenta POST} ${url}`);
    this.screenService.print();
    if (!is.empty(routine.activate)) {
      this.screenService.print(chalk`  {blue.bold Activation Events}`);
      const table = new Table({
        head: ['Name', 'Type', 'Details'],
      });
      routine.activate.forEach(activate => {
        table.push([
          activate.friendlyName,
          TitleCase(activate.type),
          this.textRender.typePrinter(activate.activate),
        ]);
      });
      this.screenService.print(table.toString());
    }
    if (is.empty(routine.command)) {
      return;
    }
    const activation =
      routine.command.length === SOLO
        ? ``
        : chalk`{yellowBright (${routine.sync ? 'Series' : 'Parallel'})}`;
    this.screenService.print(chalk`  {bold.blue Commands} ${activation}`);
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
    this.screenService.print(table.toString());
    this.screenService.print();
  }
}
