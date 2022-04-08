import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  DeviceListItemDTO,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import {
  DONE,
  ICONS,
  IsDone,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@steggy/tty';
import { is } from '@steggy/utilities';
import chalk from 'chalk';
import { encode } from 'ini';

import { MENU_ITEMS } from '../../includes';
import { HomeFetchService } from '../home-fetch.service';
import { EntityService } from './entity.service';

const SINGLE_ITEM = 1;
@Injectable()
export class DeviceService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
  ) {}

  public async entities(device: DeviceListItemDTO): Promise<void> {
    const inspect = await this.inspect(device);
    if (is.empty(inspect.entity)) {
      console.log(chalk` {yellow.bold !!!} No entities attached to device`);
      await this.promptService.acknowledge();
      return;
    }
    const entity = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(inspect.entity.map(i => [i, i])),
    });
    if (IsDone(entity)) {
      return;
    }
    await this.entityService.process(entity);
  }

  public async exec(): Promise<void> {
    const device = await this.pickOne();
    await this.process(device);
  }

  public async pickOne(inList: string[] = []): Promise<DeviceListItemDTO> {
    const devices: DeviceListItemDTO[] = await this.fetchService.fetch({
      url: `/device/list`,
    });
    if (inList.length === SINGLE_ITEM) {
      return devices.find(({ id }) => inList.includes(id));
    }
    return (await this.promptService.menu<DeviceListItemDTO>({
      keyMap: {},
      right: ToMenuEntry(
        devices
          .filter(value => is.empty(inList) || inList.includes(value.id))
          .map(item => [item.name, item]),
      ),
    })) as DeviceListItemDTO;
  }

  public async process(
    device: DeviceListItemDTO,
    defaultValue?: string,
  ): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry([
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        MENU_ITEMS.ENTITIES,
      ]),
      value: defaultValue,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case DONE:
        return;
      case 'describe':
        console.log(encode(device));
        break;
      case 'entities':
        await this.entities(device);
        return;
    }
    return await this.process(device, action);
  }

  private async inspect(
    device: DeviceListItemDTO,
  ): Promise<RelatedDescriptionDTO> {
    return await this.fetchService.fetch({
      url: `/device/inspect/${device.id}`,
    });
  }
}
