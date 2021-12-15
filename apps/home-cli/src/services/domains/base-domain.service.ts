import { RoomEntitySaveStateDTO } from '@ccontour/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
  RelatedDescriptionDTO,
} from '@ccontour/home-assistant';
import {
  DONE,
  ICONS,
  IsDone,
  MDIIcons,
  PinnedItemService,
  PromptEntry,
  PromptService,
  ToMenuEntry,
} from '@ccontour/tty';
import {
  ARRAY_OFFSET,
  AutoLogService,
  DOWN,
  InjectConfig,
  IsEmpty,
  sleep,
  TitleCase,
  UP,
} from '@ccontour/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import Table from 'cli-table';
import dayjs from 'dayjs';
import { encode } from 'ini';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';
import { dump } from 'js-yaml';

import { REFRESH_SLEEP } from '../../config';
import { DeviceService } from '../home-assistant/device.service';
import { EntityHistoryService } from '../home-assistant/entity-history.service';
import { HomeFetchService } from '../home-fetch.service';

type tDeviceService = DeviceService;
const HEADER_SEPARATOR = 0;
const FIRST = 0;
const HALF = 2;

@Injectable()
export class BaseDomainService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly fetchService: HomeFetchService,
    protected readonly promptService: PromptService,
    @Inject(forwardRef(() => DeviceService))
    protected readonly deviceService: tDeviceService,
    private readonly history: EntityHistoryService,
    private readonly pinnedItem: PinnedItemService<never>,
    @InjectConfig(REFRESH_SLEEP)
    protected readonly refreshSleep: number,
  ) {}

  public async createSaveCommand(
    entity_id: string,
    current?: RoomEntitySaveStateDTO,
  ): Promise<RoomEntitySaveStateDTO> {
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

  public async pickFromDomain<T extends HassStateDTO = HassStateDTO>(
    search: HASS_DOMAINS,
    insideList: string[] = [],
  ): Promise<T> {
    const entities = await this.fetchService.fetch<string[]>({
      url: '/entity/list',
    });
    const filtered = entities.filter(
      (entity) =>
        domain(entity) === search &&
        (IsEmpty(insideList) || insideList.includes(entity)),
    );
    const entityId = await this.promptService.autocomplete(
      'Pick an entity',
      filtered,
    );
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
    if (!(options[HEADER_SEPARATOR] as Separator).line) {
      options.unshift(
        new inquirer.Separator(
          chalk.white(`${TitleCase(domain(id), false)} commands`),
        ),
      );
    }
    const action = await this.promptService.menu({
      keyMap: {
        d: ['Done', DONE],
        h: [`${ICONS.HISTORY}History`, 'history'],
        p: [this.pinnedItem.isPinned('entity', id) ? 'Unpin' : 'pin', 'pin'],
        r: ['Refresh', 'refresh'],
      },
      right: ToMenuEntry(options),
      value: command,
    });
    if (IsDone(action)) {
      return action;
    }
    switch (action) {
      case 'refresh':
        return await this.processId(id, action);
      case 'describe':
        const state = await this.getState(id);
        this.promptService.print(dump(state));
        await this.promptService.acknowledge();
        return await this.processId(id, action);
      case 'changeFriendlyName':
        await this.changeFriendlyName(id);
        return await this.processId(id, action);
      case 'changeEntityId':
        await this.changeEntityId(id);
        return await this.processId(id, action);
      case 'registry':
        await this.fromRegistry(id);
        return await this.processId(id, action);
      case 'history':
        await this.showHistory(id);
        return await this.processId(id, action);
      case 'pin':
        await this.togglePin(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async showHistory(id: string): Promise<void> {
    const data = await this.history.promptEntityHistory(id);
    const attributes = this.logAttributes(data);
    if (IsEmpty(attributes)) {
      this.logger.warn(`No history returned`);
      await this.promptService.acknowledge();
      return;
    }
    const keys = Object.keys(attributes[FIRST]);
    const table = new Table({
      head: keys.map((i) => TitleCase(i)),
    });
    attributes.forEach((i) =>
      table.push(
        keys.map((key) => {
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
    console.log(table.toString());
    await this.promptService.acknowledge();
  }

  public togglePin(id: string): void {
    this.pinnedItem.toggle({
      friendlyName: id,
      id,
      script: 'entity',
    });
  }

  protected async baseHeader<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    // sleep needed to ensure correct-ness of header information
    // Somtimes the previous request impacts the state, and race conditions
    await sleep(this.refreshSleep);
    this.promptService.clear();
    this.promptService.scriptHeader(TitleCase(domain(id), false));
    const content = await this.getState<T>(id);
    const map = new Map<unknown, string>([
      ['on', ICONS.TURN_ON],
      ['off', ICONS.TURN_OFF],
    ]);
    console.log(
      chalk`${map.get(content.state) ?? ''}{magenta.bold ${
        content.attributes.friendly_name
      }} {gray ${id}}`,
    );
    console.log(
      chalk` {blue +-> }{inverse.bold.blueBright State} {cyan ${content.state}}`,
    );
    const keys = Object.keys(content.attributes)
      .filter((i) => !['supported_features', 'friendly_name'].includes(i))
      .sort((a, b) => (a > b ? UP : DOWN));
    const header = 'Attributes';
    console.log(
      chalk` {blue +${''.padEnd(
        Math.max(...keys.map((i) => i.length)) -
          Math.floor(header.length / HALF) -
          // ? It visually just looks "wrong" without the offset. Opinion
          ARRAY_OFFSET,
        '-',
      )}>} {bold.blueBright.inverse ${header}}`,
    );

    const max = Math.max(...keys.map((i) => i.length));
    keys.forEach((key) => {
      const item = content.attributes[key];
      let value: string;
      if (Array.isArray(item)) {
        value = item
          .map((i) =>
            typeof i === 'number' ? chalk.yellow(i.toString()) : chalk.blue(i),
          )
          .join(', ');
      } else if (typeof item === 'number') {
        value = chalk.yellow(item.toString());
      } else if (typeof item === 'string') {
        value = chalk.blue(item);
        if (key === 'icon') {
          value = `${
            MDIIcons[
              item.split(':').pop().replace(new RegExp('[-]', 'g'), '_')
            ] ?? ''
          } ${value}`;
        }
      } else if (typeof item === 'boolean') {
        value = chalk.yellowBright(String(item));
      } else {
        value = chalk.green(item);
      }
      console.log(
        chalk` {blue.dim |} {white.bold ${TitleCase(key, false).padStart(
          max,
          ' ',
        )}}  ${value}`,
      );
    });
    console.log();
    return content;
  }

  protected async changeEntityId(id: string): Promise<void> {
    const updateId = await this.promptService.string(`New id`, id);
    await this.fetchService.fetch({
      body: { updateId },
      method: 'put',
      url: `/entity/update-id/${id}`,
    });
  }

  protected async changeFriendlyName(id: string): Promise<void> {
    const state = await this.getState(id);
    const name = await this.promptService.friendlyName(
      state.attributes.friendly_name,
    );
    await this.fetchService.fetch({
      body: { name },
      method: 'put',
      url: `/entity/rename/${id}`,
    });
  }

  protected async fromRegistry(id: string): Promise<void> {
    const item: RelatedDescriptionDTO = await this.fetchService.fetch({
      url: `/entity/registry/${id}`,
    });
    const action = await this.promptService.menu({
      right: ToMenuEntry([
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        [`${ICONS.DEVICE}Device`, 'device'],
      ]),
      rightHeader: `Entity basics`,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'describe':
        console.log(encode(item));
        return;
      case 'device':
        if (IsEmpty(item.device ?? [])) {
          this.logger.error({ item }, `No devices listed`);
          return;
        }
        const device = await this.deviceService.pickOne(item.device);
        await this.deviceService.process(device);
        return;
    }
  }

  protected getMenuOptions(): PromptEntry[] {
    return [
      new inquirer.Separator(chalk.white`Base options`),
      [`${ICONS.ENTITIES}Change Entity ID`, 'changeEntityId'],
      [`${ICONS.RENAME}Change Friendly Name`, 'changeFriendlyName'],
      [`${ICONS.STATE_MANAGER}Registry`, 'registry'],
      [`${ICONS.HISTORY}History`, 'history'],
      [`${ICONS.DESCRIBE}Describe`, 'describe'],
    ];
  }

  protected logAttributes(states: HassStateDTO[]): unknown[] {
    return states.map((i) => ({ date: i.last_changed, state: i.state }));
  }
}
