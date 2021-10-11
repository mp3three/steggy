import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
  RelatedDescriptionDTO,
} from '@automagical/home-assistant';
import { CANCEL, PromptMenuItems, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty, sleep } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { encode } from 'ini';

import { DeviceService } from '../device.service';
import { HomeFetchService } from '../home-fetch.service';

const DELAY = 100;
@Injectable()
export class BaseDomainService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly fetchService: HomeFetchService,
    protected readonly promptService: PromptService,
    @Inject(forwardRef(() => DeviceService))
    protected readonly deviceService: DeviceService,
  ) {}

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
    const action = await this.promptService.menuSelect(
      this.getMenuOptions(),
      `Action`,
      command,
    );
    switch (action) {
      case 'describe':
        await this.describe(id);
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
    await sleep(DELAY);
    const content = await this.getState<T>(id);
    const header = `  ${content.attributes.friendly_name}  `;
    const padding = ' '.repeat(header.length);
    console.log(
      [chalk.bgCyan.black([padding, header, padding].join(`\n`)), ``].join(
        `\n`,
      ),
    );
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
    const name = await this.promptService.string(
      `New name`,
      state.attributes.friendly_name,
    );
    await this.fetchService.fetch({
      body: { name },
      method: 'put',
      url: `/entity/rename/${id}`,
    });
  }

  protected async describe(id: string): Promise<void> {
    const state = await this.getState(id);
    console.log(encode(state));
  }

  protected async fromRegistry(id: string): Promise<void> {
    const item: RelatedDescriptionDTO = await this.fetchService.fetch({
      url: `/entity/registry/${id}`,
    });
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromObject({
        Describe: 'describe',
        'View Device': 'device',
      }),
    );
    switch (action) {
      case CANCEL:
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
        // await this.deviceService.process(device);
        return;
    }
  }

  protected getMenuOptions(): PromptMenuItems {
    return this.promptService.itemsFromObject({
      'Change Entity ID': 'changeEntityId',
      'Change Friendly Name': 'changeFriendlyName',
      Describe: 'describe',
      Registry: 'registry',
    });
  }
}
