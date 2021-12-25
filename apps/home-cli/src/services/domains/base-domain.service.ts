import { RoomEntitySaveStateDTO } from '@for-science/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
  RelatedDescriptionDTO,
} from '@for-science/home-assistant';
import {
  DONE,
  ICONS,
  IsDone,
  KeyMap,
  MDIIcons,
  PinnedItemService,
  PromptEntry,
  PromptService,
  ToMenuEntry,
} from '@for-science/tty';
import {
  ARRAY_OFFSET,
  AutoLogService,
  DOWN,
  InjectConfig,
  is,
  IsEmpty,
  sleep,
  START,
  TitleCase,
  UP,
} from '@for-science/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import Table from 'cli-table';
import dayjs from 'dayjs';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

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
    if (!(options[HEADER_SEPARATOR] as Separator)?.line) {
      options.unshift(
        new inquirer.Separator(
          chalk.white(`${TitleCase(domain(id), false)} commands`),
        ),
      );
    }
    const action = await this.promptService.menu({
      keyMap: this.buildKeymap(id),
      leftHeader: 'Base options',
      right: ToMenuEntry(options),
      showHeaders: false,
      value: command,
    });
    if (IsDone(action)) {
      return action;
    }
    switch (action) {
      case 'refresh':
        return await this.processId(id, action);
      case 'changeFriendlyName':
        await this.changeFriendlyName(id);
        return await this.processId(id, action);
      case 'changeEntityId':
        await this.changeEntityId(id);
        return await this.processId(id, action);
      case 'registry':
        const item: RelatedDescriptionDTO = await this.fetchService.fetch({
          url: `/entity/registry/${id}`,
        });
        if (IsEmpty(item.device ?? [])) {
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
    const content = await this.getState<T>(id);
    this.promptService.clear();
    this.promptService.scriptHeader(content.attributes.friendly_name);
    this.promptService.secondaryHeader(id);
    console.log(
      chalk`\n {blue +-> }{inverse.bold.blueBright State} {cyan ${content.state}}`,
    );
    const keys = Object.keys(content.attributes)
      .filter((i) => !['supported_features', 'friendly_name'].includes(i))
      .sort((a, b) => (a > b ? UP : DOWN));
    if (!IsEmpty(keys)) {
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
    }

    const max = Math.max(...keys.map((i) => i.length));
    keys.forEach((key) => this.printItem(content, key, max));
    console.log();
    return content;
  }

  protected buildKeymap(id: string): KeyMap {
    return {
      d: [chalk.bold`Done`, DONE],
      g: [`${ICONS.STATE_MANAGER}Registry`, 'registry'],
      h: [`${ICONS.HISTORY}History`, 'history'],
      i: [`${ICONS.ENTITIES}Change Entity ID`, 'changeEntityId'],
      n: [`${ICONS.RENAME}Change Friendly Name`, 'changeFriendlyName'],
      p: [this.pinnedItem.isPinned('entity', id) ? 'Unpin' : 'Pin', 'pin'],
      r: [`${ICONS.REFRESH}Refresh`, 'refresh'],
    };
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

  protected getMenuOptions(): PromptEntry[] {
    return [];
  }

  protected logAttributes(states: HassStateDTO[]): unknown[] {
    return states.map((i) => ({ date: i.last_changed, state: i.state }));
  }

  private printItem(content: HassStateDTO, key: string, max: number): void {
    const item = content.attributes[key];
    let value: string;
    if (Array.isArray(item)) {
      if (IsEmpty(item)) {
        value = chalk.gray(`empty list`);
      } else if (is.number(item[START])) {
        value = item.map((i) => chalk.yellow(i)).join(', ');
      } else if (is.string(item[START])) {
        value = item.map((i) => chalk.blue(i)).join(', ');
      } else if (is.object(item[START])) {
        value =
          `\n` +
          item
            .map(
              (i) =>
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
          MDIIcons[
            item.split(':').pop().replace(new RegExp('[-]', 'g'), '_')
          ] ?? ''
        } ${value}`;
      }
    } else if (is.boolean(item)) {
      value = chalk.yellowBright(String(item));
    } else if (is.object(item)) {
      value = chalk.gray(JSON.stringify(item));
    } else {
      value = chalk.green(item);
    }
    console.log(
      chalk` {blue.dim |} {white.bold ${TitleCase(key, false).padStart(
        max,
        ' ',
      )}}  ${value}`,
    );
  }
}
