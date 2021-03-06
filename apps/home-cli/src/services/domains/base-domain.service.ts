import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  CacheManagerService,
  InjectCache,
  InjectConfig,
} from '@steggy/boilerplate';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import {
  domain,
  HassStateDTO,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  ChartingService,
  IsDone,
  KeyMap,
  MDIIcons,
  PromptEntry,
  PromptService,
  ScreenService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import {
  ARRAY_OFFSET,
  DOWN,
  is,
  sleep,
  START,
  TitleCase,
  UP,
} from '@steggy/utilities';
import chalk from 'chalk';
import Table from 'cli-table';
import dayjs from 'dayjs';

import { MAX_GRAPH_WIDTH, REFRESH_SLEEP } from '../../config';
import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { DeviceService, EntityHistoryService } from '../home-assistant';
import { HomeFetchService } from '../home-fetch.service';

const FIRST = 0;
const A_FEW = 3;
const HALF = 2;
const GRAPH_COLORS = [
  'magenta.bold',
  'yellow.bold',
  'cyan.bold',
  'red.bold',
  'green.bold',
  'blue.bold',
  'white.bold',
];

const CACHE_KEY = (entity: string, type: string) =>
  `LAST_ATTRIBUTES:${type}:${entity}`;

@Injectable()
export class BaseDomainService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly chartingService: ChartingService,
    protected readonly logger: SyncLoggerService,
    protected readonly fetchService: HomeFetchService,
    protected readonly screenService: ScreenService,
    protected readonly applicationManager: ApplicationManagerService,
    protected readonly promptService: PromptService,
    protected readonly deviceService: DeviceService,
    private readonly history: EntityHistoryService,
    @InjectConfig(REFRESH_SLEEP)
    protected readonly refreshSleep: number,
    @InjectConfig(MAX_GRAPH_WIDTH) private readonly maxGraphWidth: number,
  ) {}

  public async createSaveCommand(
    entity_id: string,
    current?: GeneralSaveStateDTO,
  ): Promise<GeneralSaveStateDTO> {
    throw new NotImplementedException();
    await entity_id;
    current;
  }
  public async getState<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    return await this.fetchService.fetch<T>({
      url: `/entity/id/${id}`,
    });
  }

  public async graph(id: string): Promise<void> {
    const { from, to } = await this.promptService.dateRange();
    const history = await this.history.fetchHistory(id, from, to);
    if (is.empty(history)) {
      this.logger.error(`No history returned`);
      await this.promptService.acknowledge();
      return;
    }
    const attributes = await this.limitAttributes(history, 'numeric');
    const graphs = attributes.map(key =>
      history.map(point => point.attributes[key] as number),
    );
    const first = dayjs(history[START].last_updated);
    // Less than a few days range, show hour/minute as X axis
    // More than a few days range, show month / day instead
    const last = dayjs(history[history.length - ARRAY_OFFSET].last_updated);
    const xAxis = !first.isBefore(last.subtract(A_FEW, 'd'))
      ? history.map(({ last_updated }) => dayjs(last_updated).format('HH:mm'))
      : history.map(({ last_updated }) => dayjs(last_updated).format('MM-DD'));
    const result = await this.chartingService.plot(graphs, {
      colors: GRAPH_COLORS,
      width: this.maxGraphWidth,
      xAxis,
    });
    const content = await this.getState(id);
    this.applicationManager.setHeader(content.attributes.friendly_name, id);
    this.screenService.printLine(`\n\n`);
    this.screenService.printLine(result);
    this.screenService.printLine(
      [
        chalk`  {blue -} {cyan.bold From:} ${dayjs(from).format(
          `MMM D, YYYY h:mm A`,
        )}`,
        chalk`  {blue -}   {cyan.bold To:} ${dayjs(to).format(
          `MMM D, YYYY h:mm A`,
        )}`,
        ``,
      ].join(`\n`),
    );
    attributes.forEach((key, index) =>
      this.screenService.printLine(
        chalk`    {${GRAPH_COLORS[index % GRAPH_COLORS.length]} ${TitleCase(
          key,
        )}}`,
      ),
    );
    this.screenService.printLine('');
    await this.promptService.acknowledge();
  }

  public async pickFromDomain<T extends HassStateDTO = HassStateDTO>(
    search: string,
    insideList: string[] = [],
  ): Promise<T> {
    const entities = await this.fetchService.fetch<string[]>({
      url: `/entity/list`,
    });
    const filtered = entities.filter(
      entity =>
        domain(entity) === search &&
        (is.empty(insideList) || insideList.includes(entity)),
    );
    const entityId = await this.promptService.menu({
      keyMap: {},
      right: ToMenuEntry(filtered.map(i => [i, i])),
    });
    return await this.getState(entityId);
  }

  public async processId(
    id: string,
    command?: string,
    skipHeader = false,
  ): Promise<string> {
    if (!skipHeader) {
      await this.baseHeader(id);
    }
    const options = this.getMenuOptions();

    const action = await this.promptService.menu({
      keyMap: this.buildKeymap(),
      leftHeader: 'Base options',
      right: ToMenuEntry(options),
      showHeaders: false,
      value: command,
    });
    if (IsDone(action)) {
      return action;
    }
    switch (action) {
      case 'graph':
        await this.graph(id);
        return await this.processId(id, action);
      case 'refresh':
        return await this.processId(id, action);
      case 'friendlyName':
        await this.friendlyName(id);
        return await this.processId(id, action);
      case 'changeEntityId':
        id = await this.changeEntityId(id);
        return await this.processId(id, action);
      case 'registry':
        const item: RelatedDescriptionDTO = await this.fetchService.fetch({
          url: `/entity/registry/${id}`,
        });
        if (is.empty(item.device ?? [])) {
          console.log(
            chalk`\n{bold.red !! } No devices associated with entity`,
          );
          await this.promptService.acknowledge();
          return;
        }
        const device = await this.deviceService.pickOne(item.device);
        await this.deviceService.process(device);
        return await this.processId(id, action);
      case 'history':
        await this.showHistory(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async showHistory(id: string): Promise<void> {
    const rawHistory = await this.history.promptEntityHistory(id);
    if (is.empty(rawHistory)) {
      this.logger.warn(`No history returned`);
      await this.promptService.acknowledge();
      return;
    }
    const attributeList = await this.limitAttributes(rawHistory);
    const tableEntries = rawHistory.map(entry => ({
      attributes: attributeList.map(key => entry.attributes[key]),
      date: entry.last_changed,
      state: entry.state,
    }));
    const keys = Object.keys(tableEntries[FIRST]);
    const table = new Table({
      head: keys.map(i => TitleCase(i)),
    });
    tableEntries.forEach(i =>
      table.push(
        keys.map(key => {
          if (key === 'date') {
            return dayjs(i[key]).format('YYYY-MM-DD hh:mm:ss A');
          }
          if (key === 'state') {
            if (i[key] === 'on') {
              return `${ICONS.TURN_ON}on`;
            }
            if (i[key] === 'off') {
              return `${ICONS.TURN_OFF}off`;
            }
          }
          return i[key];
        }),
      ),
    );
    this.screenService.printLine(table.toString());
    await this.promptService.acknowledge();
  }

  protected async baseHeader<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    // sleep needed to ensure correct-ness of header information
    // Somtimes the previous request impacts the state, and race conditions
    await sleep(this.refreshSleep);
    const content = await this.getState<T>(id);
    this.applicationManager.setHeader(content.attributes.friendly_name, id);
    this.screenService.printLine(
      chalk`\n {blue +-> }{inverse.bold.blueBright State} {cyan ${content.state}}`,
    );
    const keys = Object.keys(content.attributes)
      .filter(i => !['supported_features', 'friendly_name'].includes(i))
      .sort((a, b) => (a > b ? UP : DOWN));
    if (!is.empty(keys)) {
      const header = 'Attributes';
      this.screenService.printLine(
        chalk` {blue +${''.padEnd(
          Math.max(...keys.map(i => i.length)) -
            Math.floor(header.length / HALF) -
            // ? It visually just looks "wrong" without the offset. Opinion
            ARRAY_OFFSET,
          '-',
        )}>} {bold.blueBright.inverse ${header}}`,
      );
    }

    const max = Math.max(...keys.map(i => i.length));
    keys.forEach(key =>
      this.screenService.printLine(this.printItem(content, key, max)),
    );
    this.screenService.printLine('');
    return content;
  }

  protected buildKeymap(): KeyMap {
    return {
      d: MENU_ITEMS.DONE,
      // g: [`${ICONS.DOWN}Graphs`, 'graph'],
      // h: MENU_ITEMS.HISTORY,
      i: [`${ICONS.ENTITIES}Change Entity ID`, 'changeEntityId'],
      n: [`${ICONS.RENAME}Change Friendly Name`, 'friendlyName'],
      r: MENU_ITEMS.REFRESH,
      // y: [`${ICONS.STATE_MANAGER}Registry`, 'registry'],
    };
  }

  protected async changeEntityId(id: string): Promise<string> {
    const updateId = await this.promptService.string(`New id`, id);
    await this.fetchService.fetch({
      body: { updateId },
      method: 'put',
      url: `/entity/update-id/${id}`,
    });
    return updateId;
  }

  protected async friendlyName(id: string): Promise<void> {
    const state = await this.getState(id);
    const name = await this.promptService.string(
      'Friendly Name',
      state.attributes.friendly_name,
    );
    await this.fetchService.fetch({
      body: { name },
      method: 'put',
      url: `/entity/rename/${id}`,
    });
  }

  protected getMenuOptions(): PromptEntry[] {
    return [];
  }

  private async limitAttributes(
    data: HassStateDTO[],
    type: 'all' | 'numeric' = 'all',
  ): Promise<string[]> {
    let attributeList = is
      .unique(data.flatMap(i => Object.keys(i.attributes)))
      .filter(i =>
        type === 'all'
          ? true
          : data.some(item => is.number(item.attributes[i])),
      );
    const lastUsed =
      (await this.cache.get<string[]>(
        CACHE_KEY(data[START].entity_id, type),
      )) || attributeList;
    const source = attributeList.filter(i => !lastUsed.includes(i));
    this.screenService.printLine(
      chalk` {cyan > }{blue Plot which attributes?}`,
    );
    attributeList = await this.promptService.listBuild({
      current: lastUsed.map(i => [i, i]),
      items: 'Attributes',
      source: source.map(i => [i, i]),
    });
    await this.cache.set(CACHE_KEY(data[START].entity_id, type), attributeList);
    return attributeList;
  }

  private printItem(content: HassStateDTO, key: string, max: number): string {
    const item = content.attributes[key];
    let value: string;
    if (Array.isArray(item)) {
      if (is.empty(item)) {
        value = chalk.gray(`empty list`);
      } else if (is.number(item[START])) {
        value = item.map(i => chalk.yellow(i)).join(', ');
      } else if (is.string(item[START])) {
        value = item.map(i => chalk.blue(i)).join(', ');
      } else if (is.object(item[START])) {
        value =
          `\n` +
          item
            .map(
              i =>
                chalk` {blue.dim |}   ${' '.repeat(max)}${JSON.stringify(i)}`,
            )
            .join(`\n`);
      }
    } else if (is.number(item)) {
      value = chalk.yellow(item.toString());
    } else if (is.string(item)) {
      value = chalk.blue(item);
      if (key === 'icon') {
        value = `${
          MDIIcons[item.split(':').pop().replaceAll('-', '_')] ?? ''
        } ${value}`;
      }
    } else if (is.boolean(item)) {
      value = chalk.yellowBright(String(item));
    } else if (is.object(item)) {
      value = chalk.gray(JSON.stringify(item));
    } else {
      value = chalk.green(item);
    }
    return chalk` {blue.dim |} {white.bold ${TitleCase(key).padStart(
      max,
      ' ',
    )}}  ${value}`;
  }
}
