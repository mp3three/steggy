import { RoomEntitySaveStateDTO } from '@automagical/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
  RelatedDescriptionDTO,
} from '@automagical/home-assistant';
import {
  DONE,
  ICONS,
  PinnedItemService,
  PromptEntry,
  PromptService,
} from '@automagical/tty';
import {
  AutoLogService,
  IsEmpty,
  sleep,
  TitleCase,
} from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import { encode } from 'ini';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';
import { dump } from 'js-yaml';

import { DeviceService } from '../device.service';
import { HomeFetchService } from '../home-fetch.service';

const HEADER_SEPARATOR = 0;
const DATA = 1;
const DELAY = 100;
@Injectable()
export class BaseDomainService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly fetchService: HomeFetchService,
    protected readonly promptService: PromptService,
    @Inject(forwardRef(() => DeviceService))
    protected readonly deviceService: DeviceService,
    private readonly pinnedItem: PinnedItemService,
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

  public async processId(id: string, command?: string): Promise<string> {
    const options = this.getMenuOptions();
    if (!(options[HEADER_SEPARATOR] as Separator).line) {
      options.unshift(
        new inquirer.Separator(
          chalk.white(`${TitleCase(domain(id), false)} commands`),
        ),
      );
    }
    const action = await this.promptService.menuSelect(
      options,
      `Action`,
      command,
    );
    switch (action) {
      case 'describe':
        const state = await this.getState(id);
        this.promptService.print(dump(state));
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
    }
    return action;
  }

  protected async baseHeader<T extends HassStateDTO = HassStateDTO>(
    id: string,
  ): Promise<T> {
    // sleep needed to ensure correct-ness of header information
    // Somtimes the previous request impacts the state, and race conditions
    await sleep(DELAY);
    this.promptService.clear();
    this.promptService.scriptHeader(`Entity`);
    const content = await this.getState<T>(id);
    console.log(
      chalk`{magenta.bold ${
        content.attributes.friendly_name
      }} - {yellow.bold ${TitleCase(domain(content.entity_id), false)}}`,
    );
    console.log();
    this.promptService.print(dump(content));
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
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        [`${ICONS.DEVICE}Device`, 'device'],
      ],
      `Entity basics`,
    );
    switch (action) {
      case DONE:
        return;
      case 'pin':
        await this.togglePin(id);
        return;
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
      [`${ICONS.PIN}Pin`, 'pin'],
    ];
  }

  protected async togglePin(entity_id: string): Promise<void> {
    const list = await this.pinnedItem.getEntries('entity');
    const item = list.find((entry) => {
      const data: { entity_id: string } = entry[DATA];
      return data.entity_id !== entity_id;
    });
    if (!item) {
      this.pinnedItem.addPinned('entity', { entity_id });
      return;
    }
    this.pinnedItem.removePinned('entity', item);
  }
}
