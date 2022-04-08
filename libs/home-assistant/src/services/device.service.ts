import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  DeviceListItemDTO,
  HASSIO_WS_COMMAND,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

import { EntityManagerService } from './entity-manager.service';
import { HASocketAPIService } from './ha-socket-api.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly entityManager: EntityManagerService,
  ) {}

  public async findRelated(
    device: DeviceListItemDTO | string,
  ): Promise<RelatedDescriptionDTO> {
    device = is.string(device) ? device : device.id;
    return await this.socketService.sendMsg<RelatedDescriptionDTO>({
      item_id: device,
      item_type: 'device',
      type: HASSIO_WS_COMMAND.search_related,
    });
  }

  public async list(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.sendMsg({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }
}
