import {
  DeviceListItemDTO,
  RelatedDescriptionDTO,
} from '@ccontour/home-assistant';
import { DONE, ICONS, PromptService, Repl } from '@ccontour/tty';
import { AutoLogService, IsEmpty } from '@ccontour/utilities';
import { encode } from 'ini';

import { EntityService } from './entity.service';
import { HomeFetchService } from './home-fetch.service';

const SINGLE_ITEM = 1;
@Repl({
  category: `Home Assistant`,
  icon: ICONS.DEVICE,
  name: `Devices`,
})
export class DeviceService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
  ) {}

  public async entities(device: DeviceListItemDTO): Promise<void> {
    const inspect = await this.inspect(device);
    const entity = await this.promptService.autocomplete(
      'Pick an entity',
      inspect.entity,
    );
    await this.entityService.process(entity);
    if (await this.promptService.confirm('Again?')) {
      return await this.entities(device);
    }
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
    return await this.promptService.autocomplete(
      `Pick a device`,
      devices
        .map((item) => ({ name: item.name, value: item }))
        .filter(({ value }) => IsEmpty(inList) || inList.includes(value.id)),
    );
  }

  public async process(
    device: DeviceListItemDTO,
    defaultValue?: string,
  ): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        [`${ICONS.ENTITIES}Entities`, 'entities'],
      ],
      undefined,
      defaultValue,
    );
    if (action === DONE) {
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
